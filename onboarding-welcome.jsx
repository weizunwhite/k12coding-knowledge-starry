// 新手欢迎浮层 — 年级选择 + 快速标记已掌握的知识点
// 仅在首次使用时显示（localStorage 无 coding-user-profile）

function OnboardingWelcome({ onComplete }) {
  const [step, setStep] = useState(1);       // 1=阶段选择, 2=快速标记
  const [grade, setGrade] = useState(null);   // '入门'|'进阶'|'高阶'|'g1'|'g2'|'g3'|'free'
  const [marked, setMarked] = useState({});

  // 难度档 + 高中年级统一映射到 rank：
  // 入门/进阶/高阶 = 1/2/3（初中难度档），高一/高二/高三 = 4/5/6（选了即开启初高中融合）
  const GRADE_VALUE_RANK = { '入门': 1, '进阶': 2, '高阶': 3, 'g1': 4, 'g2': 5, 'g3': 6 };
  const gradeRank = GRADE_VALUE_RANK[grade] || 9;
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
      const profile = { grade: g, gradeRank: 0, createdAt: Date.now() };
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
    const profile = { grade, gradeRank: GRADE_VALUE_RANK[grade] || 0, createdAt: Date.now() };
    const masteredMap = Object.keys(marked).reduce((acc, id) => {
      if (marked[id]) acc[id] = true;
      return acc;
    }, {});
    onComplete(profile, Object.keys(masteredMap).length > 0 ? masteredMap : null);
  };

  // 跳过标记（新手）
  const handleSkip = () => {
    const profile = { grade, gradeRank: GRADE_VALUE_RANK[grade] || 0, createdAt: Date.now() };
    onComplete(profile, null);
  };

  const gradeLabels = {
    '入门': '编程入门',
    '进阶': '编程进阶',
    '高阶': '编程高阶',
    'g1': '高一',
    'g2': '高二',
    'g3': '高三',
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
              <br />选择你的当前阶段，我来推荐学习路线（初中难度档默认只看初中，高中年级自动开启初高中融合）。
            </p>
            <div className="ob-grades">
              {['入门', '进阶', '高阶'].map(g => (
                <button key={g} className="ob-gradeBtn" onClick={() => handleGradeSelect(g)}>
                  <span className="ob-gradeNum">{gradeShort[g]}</span>
                  <span className="ob-gradeLabel">{gradeLabels[g]}</span>
                </button>
              ))}
            </div>
            <div className="ob-grades" style={{ marginTop: 8 }}>
              {['g1', 'g2', 'g3'].map(g => (
                <button key={g} className="ob-gradeBtn" onClick={() => handleGradeSelect(g)}>
                  <span className="ob-gradeNum" style={{ fontSize: '1.15rem' }}>{gradeLabels[g]}</span>
                  <span className="ob-gradeLabel">高中</span>
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
