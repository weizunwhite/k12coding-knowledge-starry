// 新手欢迎浮层 — 年级选择 + 快速标记已掌握的知识点
// 仅在首次使用时显示（localStorage 无 coding-user-profile）

function OnboardingWelcome({ onComplete }) {
  const [step, setStep] = useState(1);       // 1=难度选择, 2=快速标记
  const [grade, setGrade] = useState(null);   // '入门'|'进阶'|'高阶'|'free'
  const [marked, setMarked] = useState({});

  // 编程不分年级，按难度档累进显示（入门 ≤ 进阶 ≤ 高阶）
  const gradeRank = grade === '入门' ? 1 : grade === '进阶' ? 2 : grade === '高阶' ? 3 : 9;
  const markableNodes = React.useMemo(() => {
    if (!grade || grade === 'free') return [];
    const G = window.CODE_NODE_GRADE || {}, R = window.CODE_GRADE_RANK || {};
    return window.CODE_NODES.filter(n => (R[G[n.id]] || 9) <= gradeRank);
  }, [grade, gradeRank]);

  // 按主题分组显示
  const groupedNodes = React.useMemo(() => {
    const groups = {};
    markableNodes.forEach(n => {
      if (!groups[n.theme]) groups[n.theme] = [];
      groups[n.theme].push(n);
    });
    return groups;
  }, [markableNodes]);

  // 选择年级
  const handleGradeSelect = (g) => {
    setGrade(g);
    if (g === 'free') {
      // 自由探索模式直接完成
      const profile = { grade: g, createdAt: Date.now() };
      onComplete(profile, null);
    } else {
      setStep(2);
    }
  };

  // 切换标记状态
  const toggleMark = (id) => {
    setMarked(m => ({ ...m, [id]: !m[id] }));
  };

  // 完成标记
  const handleFinish = () => {
    const profile = { grade, createdAt: Date.now() };
    const masteredMap = Object.keys(marked).reduce((acc, id) => {
      if (marked[id]) acc[id] = true;
      return acc;
    }, {});
    onComplete(profile, Object.keys(masteredMap).length > 0 ? masteredMap : null);
  };

  // 跳过标记（新手）
  const handleSkip = () => {
    const profile = { grade, createdAt: Date.now() };
    onComplete(profile, null);
  };

  const gradeLabels = {
    '入门': '编程入门',
    '进阶': '编程进阶',
    '高阶': '编程高阶',
  };
  const gradeShort = { '入门': '入门', '进阶': '进阶', '高阶': '高阶' };

  return (
    <div className="ob-overlay">
      <div className="ob-card">
        {step === 1 && (
          <>
            <div className="ob-glyph">✦</div>
            <h1 className="ob-title">欢迎来到知识星空</h1>
            <p className="ob-desc">
              编程与算法的 {window.CODE_NODES.length} 个知识点，按「依赖关系」连成星座。
              <br />选择你的当前阶段，我来推荐学习路线。
            </p>
            <div className="ob-grades">
              {['入门', '进阶', '高阶'].map(g => (
                <button key={g} className="ob-gradeBtn" onClick={() => handleGradeSelect(g)}>
                  <span className="ob-gradeNum">{gradeShort[g]}</span>
                  <span className="ob-gradeLabel">{gradeLabels[g]}</span>
                </button>
              ))}
            </div>
            <button className="ob-freeBtn" onClick={() => handleGradeSelect('free')}>
              自由探索 · 全部知识点
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="ob-stepTitle">
              {gradeLabels[grade]}，这些知识点你已经会了吗？
            </h2>
            <p className="ob-stepDesc">点击标记已掌握的知识点，帮助我更精准地推荐（也可以跳过）</p>

            <div className="ob-nodeGrid">
              {Object.entries(groupedNodes).map(([theme, nodes]) => {
                const t = window.CODE_THEMES[theme];
                return (
                  <div key={theme} className="ob-themeGroup">
                    <div className="ob-themeName" style={{ color: t.color }}>{t.short}</div>
                    <div className="ob-themeNodes">
                      {nodes.map(n => (
                        <button
                          key={n.id}
                          className={'ob-nodeBtn' + (marked[n.id] ? ' ob-marked' : '')}
                          style={{
                            borderColor: marked[n.id] ? t.color : 'rgba(255,255,255,0.15)',
                            background: marked[n.id] ? t.color + '22' : 'transparent',
                          }}
                          onClick={() => toggleMark(n.id)}
                        >
                          {marked[n.id] && <span className="ob-check">✓</span>}
                          {n.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ob-actions">
              <button className="ob-skipBtn" onClick={handleSkip}>
                跳过，我是新手
              </button>
              <button className="ob-doneBtn" onClick={handleFinish}>
                完成标记，开始探索
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.OnboardingWelcome = OnboardingWelcome;
