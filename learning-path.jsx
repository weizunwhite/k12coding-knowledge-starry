// 学习路径推荐 — 推荐算法 + 浮动面板
// 根据已掌握的知识点和年级，推荐下一步该学的 1-3 个节点

/**
 * 推荐算法：找出"就绪"节点（前置全掌握、自身未掌握），按年级优先级排序
 * @param {Array} nodes - 所有知识点数组
 * @param {Object} mastered - 已掌握状态 {nodeId: true/false}
 * @param {string} grade - '7'|'8'|'9'|'free'
 * @returns {Array} 推荐节点列表（最多3个），每个含 {id, name, theme, reason}
 */
function computeRecommendations(nodes, mastered, grade) {
  if (!nodes || !nodes.length) return [];
  mastered = mastered || {};

  // 第一步：找所有"就绪"节点
  // 就绪 = 未掌握 + 所有前置已掌握
  const ready = nodes.filter(n => {
    if (mastered[n.id]) return false;
    // 前置全部掌握（空前置 = 始终就绪）
    return (n.prereqs || []).every(pid => mastered[pid]);
  });

  // 没有就绪节点时的 fallback
  if (ready.length === 0) {
    // 检查是否全部掌握
    const allMastered = nodes.every(n => mastered[n.id]);
    if (allMastered) return [];
    // 返回三个入口节点作为起点
    const roots = ['scientific-method', 'physical-quantities', 'motion-description'];
    return roots
      .map(id => nodes.find(n => n.id === id))
      .filter(Boolean)
      .filter(n => !mastered[n.id])
      .map(n => ({ id: n.id, name: n.name, theme: n.theme, reason: '起点知识，无需前置' }));
  }

  // 第二步：构建下游解锁计数（掌握该节点后能解锁多少新节点）
  const unlockCount = {};
  ready.forEach(n => {
    let count = 0;
    // 遍历所有以该节点为前置的节点
    nodes.forEach(other => {
      if (mastered[other.id]) return;
      if (!(other.prereqs || []).includes(n.id)) return;
      // 检查：如果掌握了当前节点，other 的前置是否全满足
      const wouldBeReady = (other.prereqs || []).every(
        pid => pid === n.id ? true : mastered[pid]
      );
      if (wouldBeReady) count++;
    });
    unlockCount[n.id] = count;
  });

  // 第三步：按年级打分
  const scored = ready.map(n => {
    // 基础分：年级匹配度
    let baseScore = 100;
    const level = n.level || 1;
    if (grade === '7') {
      if (level <= 4) baseScore = 100;
      else if (level <= 6) baseScore = 50;
      else baseScore = 10;
    } else if (grade === '8') {
      if (level <= 6) baseScore = 100;
      else baseScore = 50;
    }
    // 九年级和自由模式：全部 100 分

    // 连通性加分：每个可解锁的下游节点加 15 分
    const connectBonus = (unlockCount[n.id] || 0) * 15;

    // 优先低 level（先学基础）
    const levelBonus = (9 - level) * 5;

    return {
      id: n.id,
      name: n.name,
      theme: n.theme,
      level: level,
      score: baseScore + connectBonus + levelBonus,
      unlocks: unlockCount[n.id] || 0,
    };
  });

  // 第四步：排序取 top 3
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  // 生成推荐理由
  return top.map(n => {
    let reason = '';
    if (n.unlocks > 0) {
      reason = `掌握后可解锁 ${n.unlocks} 个新知识点`;
    } else if (n.level <= 2) {
      reason = '基础知识，建议优先掌握';
    } else {
      reason = '前置知识已就绪，可以开始学习';
    }
    return { id: n.id, name: n.name, theme: n.theme, reason };
  });
}

// 挂载到全局
window.computeRecommendations = computeRecommendations;

// ─── 浮动推荐面板组件 ───

function LearningPath({ recommended, onSelectNode, mastered }) {
  const [expanded, setExpanded] = useState(true);

  const totalNodes = window.CODE_NODES.length;
  const masteredCount = Object.values(mastered || {}).filter(Boolean).length;
  const allDone = masteredCount >= totalNodes;

  // 没有推荐且没全部完成时不显示
  if (!recommended || (recommended.length === 0 && !allDone)) return null;

  return (
    <div className={'lp-panel' + (expanded ? ' lp-expanded' : '')}>
      {/* 折叠态：小药丸 */}
      <button className="lp-toggle" onClick={() => setExpanded(e => !e)}>
        {expanded ? '收起' : `推荐下一步 · ${recommended.length}`}
        <span className="lp-toggleIcon">{expanded ? '▾' : '▴'}</span>
      </button>

      {/* 展开态：推荐列表 */}
      {expanded && (
        <div className="lp-body">
          {allDone ? (
            <div className="lp-congrats">
              <div className="lp-congratsIcon">✦</div>
              <div className="lp-congratsText">全部掌握！你已点亮整片星空</div>
            </div>
          ) : (
            <>
              <div className="lp-header">推荐下一步学习</div>
              <div className="lp-list">
                {recommended.map(r => {
                  const theme = window.CODE_THEMES[r.theme];
                  return (
                    <button key={r.id} className="lp-card" onClick={() => onSelectNode(r.id)}>
                      <span className="lp-dot" style={{ background: theme.color }}></span>
                      <div className="lp-cardContent">
                        <div className="lp-cardName">{r.name}</div>
                        <div className="lp-cardReason">{r.reason}</div>
                      </div>
                      <span className="lp-arrow">→</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

window.LearningPath = LearningPath;
