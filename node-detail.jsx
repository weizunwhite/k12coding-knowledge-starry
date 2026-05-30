// NodeDetail — shared knowledge-point detail panel
// Slides in from the right when a node is selected. Three sections:
//   · 概念 + 解释 + 例题
//   · 与其他知识点的联系（前置 / 引出）
//   · AI 答疑 — uses window.claude.complete
// Receives: node, onClose, onJump(id) — for clicking a connected node.

const { useState, useRef, useEffect } = React;

// KaTeX wrapper: render a block of LaTeX
function MathBlock({ tex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.katex && ref.current) {
      try { window.katex.render(tex, ref.current, { displayMode: true, throwOnError: false, output: 'html' }); }
      catch (e) { ref.current.textContent = tex; }
    }
  }, [tex]);
  return <div ref={ref} className="nd-math-block"></div>;
}

// 统一 LaTeX 定界符：把 AI 返回的 \(...\) 和 \[...\] 转成 $...$ 和 $$...$$
function normalizeMathDelimiters(text) {
  if (!text) return text;
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  return text;
}

// Render rich text with **bold** markers AND inline $latex$
function renderRich(text) {
  if (!text) return null;
  text = normalizeMathDelimiters(text);
  // First split on $...$ for inline LaTeX (non-greedy)
  const tokens = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/);
  return tokens.map((tok, i) => {
    if (tok.startsWith('$') && tok.endsWith('$')) {
      return <MathInline key={i} tex={tok.slice(1, -1)} />;
    }
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return <b key={i} className="nd-figure">{renderRich(tok.slice(2, -2))}</b>;
    }
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });
}

function MathInline({ tex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.katex && ref.current) {
      try { window.katex.render(tex, ref.current, { displayMode: false, throwOnError: false, output: 'html' }); }
      catch (e) { ref.current.textContent = tex; }
    }
  }, [tex]);
  return <span ref={ref} className="nd-math-inline"></span>;
}

// Exercise card — problem, optional hint reveal, answer reveal
function Exercise({ ex, idx, theme }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="nd-exerciseCard">
      <div className="nd-exerciseHead">
        <div className="nd-exerciseNum" style={{ background: theme.color }}>{idx}</div>
        <div className="nd-exerciseProblem">{renderRich(ex.problem)}</div>
      </div>
      <div className="nd-exerciseActions">
        {ex.hint && (
          <button className="nd-exerciseBtn" onClick={() => setShowHint(s => !s)}>
            {showHint ? '收起提示' : '💡 提示'}
          </button>
        )}
        {ex.answer && (
          <button className={'nd-exerciseBtn nd-exerciseBtn-primary' + (showAnswer ? ' on' : '')}
                  onClick={() => setShowAnswer(s => !s)}
                  style={{ background: showAnswer ? theme.deep : '' }}>
            {showAnswer ? '收起答案' : '看答案'}
          </button>
        )}
      </div>
      {showHint && ex.hint && (
        <div className="nd-exerciseHint">{renderRich(ex.hint)}</div>
      )}
      {showAnswer && ex.answer && (
        <div className="nd-exerciseAnswer" style={{ borderLeftColor: theme.color }}>
          <div className="nd-exerciseAnswerLabel">答案</div>
          <div>{renderRich(ex.answer)}</div>
        </div>
      )}
    </div>
  );
}

// Warmup card — 「先想一想」引入题：题面 + 可选提示 + 看参考答案 + 开始讲解
// 软引导、可跳过：随时可点「开始讲解」展开下面的讲解内容。
function WarmupCard({ warmup, theme, revealed, onReveal }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <section className="nd-warmup"
             style={{ borderColor: theme.soft, background: `linear-gradient(180deg, ${theme.soft}55, transparent)` }}>
      <div className="nd-warmupLabel" style={{ color: theme.color }}>
        <span className="nd-warmupIcon">🤔</span>先想一想
      </div>
      <div className="nd-warmupQ">{renderRich(warmup.q)}</div>
      <div className="nd-warmupActions">
        {warmup.hint && (
          <button className="nd-warmupBtn" onClick={() => setShowHint(s => !s)}>
            {showHint ? '收起提示' : '💡 提示'}
          </button>
        )}
        <button className="nd-warmupBtn" onClick={() => setShowAnswer(s => !s)}>
          {showAnswer ? '收起参考答案' : '看参考答案'}
        </button>
      </div>
      {showHint && warmup.hint && (
        <div className="nd-warmupHint">{renderRich(warmup.hint)}</div>
      )}
      {showAnswer && (
        <div className="nd-warmupAnswer" style={{ borderLeftColor: theme.color }}>
          <div className="nd-warmupAnswerLabel" style={{ color: theme.color }}>参考答案 · 点睛</div>
          <div>{renderRich(warmup.answer)}</div>
        </div>
      )}
      {!revealed && (
        <button className="nd-warmupReveal" onClick={onReveal} style={{ background: theme.deep }}>
          开始讲解 ▼
        </button>
      )}
    </section>
  );
}

function NodeDetail({ node, onClose, onJump, mastered, onToggleMastery }) {
  const theme = window.CODE_THEMES[node.theme];
  const history = (window.CODE_HISTORY || {})[node.id];
  const lesson = (window.CODE_LESSON || {})[node.id];
  const warmup = lesson?.warmup;
  const aiAvailable = !!(window.claude && typeof window.claude.complete === 'function');
  const [tab, setTab] = useState('overview'); // 'overview' | 'ai'
  const [lessonRevealed, setLessonRevealed] = useState(false); // 引入题后是否已展开讲解
  const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', text}
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState([
    `${node.name}是谁发明 / 发现的？`,
    `${node.name}最早是为了解决什么问题？`,
    `给我出一道关于${node.name}的题`,
  ]);
  const [panelRect, setPanelRect] = useState(null);
  const [panelSize, setPanelSize] = useState('md');
  const [isMaximized, setIsMaximized] = useState(false);
  const panelRef = useRef(null);
  const savedRectRef = useRef(null);
  const pointerActionRef = useRef(null);
  const msgEndRef = useRef(null);
  const scrollRef = useRef(null);

  // 移动端判定（≤720px）：决定详情面板是否走全屏 sheet
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const panelInset = 8;
  const minPanelWidth = 380;
  const minPanelHeight = 360;

  const getPanelBounds = () => {
    const parent = panelRef.current?.parentElement;
    const rect = parent?.getBoundingClientRect();
    return {
      width: rect?.width || window.innerWidth,
      height: rect?.height || window.innerHeight,
    };
  };

  const clampPanelRect = (rect) => {
    const bounds = getPanelBounds();
    const maxWidth = Math.max(minPanelWidth, bounds.width - panelInset * 2);
    const maxHeight = Math.max(minPanelHeight, bounds.height - panelInset * 2);
    const width = Math.min(Math.max(rect.width, minPanelWidth), maxWidth);
    const height = Math.min(Math.max(rect.height, minPanelHeight), maxHeight);
    const x = Math.min(Math.max(rect.x, panelInset), Math.max(panelInset, bounds.width - width - panelInset));
    const y = Math.min(Math.max(rect.y, panelInset), Math.max(panelInset, bounds.height - height - panelInset));
    return { x, y, width, height };
  };

  const getDefaultPanelRect = () => {
    const bounds = getPanelBounds();
    const width = Math.min(520, Math.max(minPanelWidth, bounds.width - panelInset * 2));
    const height = Math.max(minPanelHeight, bounds.height - 32);
    return clampPanelRect({
      x: bounds.width - width - 16,
      y: 16,
      width,
      height,
    });
  };

  const stopPointerAction = () => {
    pointerActionRef.current = null;
    document.removeEventListener('pointermove', handlePanelPointerMove);
    document.removeEventListener('pointerup', stopPointerAction);
  };

  const handlePanelPointerMove = (e) => {
    const action = pointerActionRef.current;
    if (!action) return;
    const dx = e.clientX - action.startX;
    const dy = e.clientY - action.startY;
    if (action.type === 'drag') {
      setPanelRect(clampPanelRect({
        ...action.rect,
        x: action.rect.x + dx,
        y: action.rect.y + dy,
      }));
      return;
    }
    setPanelRect(clampPanelRect({
      ...action.rect,
      width: action.rect.width + (action.dir.includes('e') ? dx : 0),
      height: action.rect.height + (action.dir.includes('s') ? dy : 0),
    }));
  };

  const startPanelDrag = (e) => {
    if (isMobile) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('button, input, textarea, a, .nd-resizeHandle')) return;
    if (isMaximized) return;
    const rect = panelRect || getDefaultPanelRect();
    pointerActionRef.current = { type: 'drag', startX: e.clientX, startY: e.clientY, rect };
    setPanelRect(rect);
    e.preventDefault();
    document.addEventListener('pointermove', handlePanelPointerMove);
    document.addEventListener('pointerup', stopPointerAction);
  };

  const startPanelResize = (dir, e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const rect = panelRect || getDefaultPanelRect();
    if (isMaximized) setIsMaximized(false);
    setPanelSize('custom');
    pointerActionRef.current = { type: 'resize', dir, startX: e.clientX, startY: e.clientY, rect };
    setPanelRect(rect);
    e.preventDefault();
    e.stopPropagation();
    document.addEventListener('pointermove', handlePanelPointerMove);
    document.addEventListener('pointerup', stopPointerAction);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setPanelRect(clampPanelRect(savedRectRef.current || getDefaultPanelRect()));
      setIsMaximized(false);
      return;
    }
    savedRectRef.current = panelRect || getDefaultPanelRect();
    const bounds = getPanelBounds();
    setPanelRect({
      x: panelInset,
      y: panelInset,
      width: bounds.width - panelInset * 2,
      height: bounds.height - panelInset * 2,
    });
    setIsMaximized(true);
  };

  useEffect(() => {
    const onResize = () => setPanelRect(rect => (rect ? clampPanelRect(rect) : rect));
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      stopPointerAction();
    };
  }, []);

  useEffect(() => {
    // Reset on node change
    setMessages([]);
    setInput('');
    setTab('overview');
    setLessonRevealed(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [node.id]);

  useEffect(() => {
    if (msgEndRef.current) msgEndRef.current.scrollIntoView({ block: 'end' });
  }, [messages, loading]);

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    if (!aiAvailable) {
      setMessages([{ role: 'assistant', text: 'DeepSeek 暂未启用：请在本地环境配置 DEEPSEEK_API_KEY 后重启服务。知识讲解、公式、例题和互动组件仍可正常使用。' }]);
      setInput('');
      return;
    }
    const newMessages = [...messages, { role: 'user', text: question }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const histLine = history ? `\n历史起源：${history.origin || ''}\n历史故事：${history.story || ''}` : '';
      const ctx = `你是一位耐心、生动的编程老师。学生正在学习"${node.name}"这个知识点。\n知识点说明：${node.concept}。${node.explanation}\n例题：${node.example}${histLine}\n\n回答要求：\n- 只围绕「${node.name}」本身回答，不要扩展到其他知识点\n- 如果引用历史故事，只用上面给出的内容，不要编造或混入其他知识点的故事\n- 用中文回答，简洁清楚，控制在 180 字以内`;
      const reply = await window.claude.complete({
        messages: [
          { role: 'user', content: ctx + '\n\n学生问：' + question },
        ],
      });
      setMessages([...newMessages, { role: 'assistant', text: reply.trim() }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', text: '抱歉，AI 暂时不可用 —— 请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  // Prereqs and "leads to" lists
  const prereqs = (node.prereqs || []).map(id => window.CODE_NODE_BY_ID[id]).filter(Boolean);
  const leadsTo = window.CODE_NODES.filter(n => (n.prereqs || []).includes(node.id));
  const connections = (node.connections || []).map(id => window.CODE_NODE_BY_ID[id]).filter(Boolean);

  return (
    <div
      ref={panelRef}
      className={'nd-panel nd-panel-' + panelSize +
        (isMobile ? ' nd-panel-mobile' : (panelRect ? ' nd-panel-free' : '')) +
        (isMaximized && !isMobile ? ' nd-panel-max' : '')}
      style={(!isMobile && panelRect) ? {
        left: panelRect.x,
        top: panelRect.y,
        width: panelRect.width,
        height: panelRect.height,
        right: 'auto',
        bottom: 'auto',
      } : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="nd-header" style={{ borderColor: theme.soft }} onPointerDown={startPanelDrag}>
        <div className="nd-themePill" style={{ background: theme.soft, color: theme.deep }}>
          <span className="nd-dot" style={{ background: theme.color }}></span>
          {theme.name}
        </div>
        {window.CODE_NODE_GRADE && window.CODE_NODE_GRADE[node.id] && (
          <span className="nd-gradePill">{window.CODE_NODE_GRADE[node.id]}</span>
        )}
        <div className="nd-windowActions">
          {onToggleMastery && (
            <button className={'nd-masterToggle' + (mastered ? ' on' : '')} onClick={onToggleMastery}>
              {mastered ? '✓ 已掌握' : '标为已掌握'}
            </button>
          )}
          {!isMobile && (
            <button className="nd-windowBtn" onClick={toggleMaximize}
                    title={isMaximized ? '还原窗口' : '最大化窗口'} aria-label={isMaximized ? '还原窗口' : '最大化窗口'}>
              {isMaximized ? '🗗' : '⤢'}
            </button>
          )}
          <button className="nd-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>
      </div>

      <div className="nd-titleWrap">
        <h1 className="nd-title">{node.name}</h1>
        <p className="nd-concept">{renderRich(node.concept)}</p>
      </div>

      <div className="nd-tabs">
        <button className={'nd-tab' + (tab === 'overview' ? ' on' : '')} onClick={() => setTab('overview')}>详解</button>
        <button className={'nd-tab' + (tab === 'quiz' ? ' on' : '')} onClick={() => setTab('quiz')}>测验</button>
        <button className={'nd-tab' + (tab === 'ai' ? ' on' : '')} onClick={() => setTab('ai')}>
          <span className="nd-aiIcon" aria-hidden>✦</span> AI 答疑
        </button>
      </div>

      <div className="nd-body" ref={scrollRef}>
        {tab === 'overview' && (
          <div className="nd-overview">
            {warmup && (
              <WarmupCard warmup={warmup} theme={theme} revealed={lessonRevealed}
                          onReveal={() => setLessonRevealed(true)} />
            )}
            {(!warmup || lessonRevealed) && (<>
            {history && (
              <section className="nd-section">
                <div className="nd-sectionLabel nd-histLabel">
                  <span className="nd-histIcon">📜</span>源流 · 这是怎么来的
                </div>
                <div className="nd-history" style={{ borderColor: theme.soft, background: `linear-gradient(180deg, ${theme.soft}40, transparent)` }}>
                  <div className="nd-historyAccent" style={{ background: theme.color }}></div>
                  <div className="nd-historyBody">
                    {history.origin && (
                      <div className="nd-historyPara">
                        <div className="nd-historyKicker" style={{ color: theme.deep }}>起源</div>
                        <p className="nd-historyText">{renderRich(history.origin)}</p>
                      </div>
                    )}
                    {history.story && (
                      <div className="nd-historyPara">
                        <div className="nd-historyKicker" style={{ color: theme.deep }}>故事</div>
                        <p className="nd-historyText">{renderRich(history.story)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
            <section className="nd-section">
              <div className="nd-sectionLabel">解释</div>
              {lesson?.intro ? (
                lesson.intro.map((p, i) => <p key={i} className="nd-text" style={{ marginBottom: i < lesson.intro.length - 1 ? 10 : 0 }}>{renderRich(p)}</p>)
              ) : (
                <p className="nd-text">{node.explanation}</p>
              )}
            </section>

            {lesson?.figure && (
              <section className="nd-section">
                <div className="nd-sectionLabel">图示</div>
                <div className="nd-figureBox" dangerouslySetInnerHTML={{ __html: lesson.figure }} />
              </section>
            )}

            {window.NodeWidget && <window.NodeWidget nodeId={node.id} theme={theme} />}

            {(window.CODE_SUBNODES || {})[node.id] && (
              <section className="nd-section">
                <div className="nd-sectionLabel">细分知识点 · 逐项展开</div>
                <div className="sn-list">
                  {window.CODE_SUBNODES[node.id].map((sn, i) => (
                    <details key={i} className="sn-card">
                      <summary className="sn-head">
                        <span className="sn-dot" style={{ background: theme.color }}></span>
                        <span className="sn-name">{sn.name}</span>
                        <span className="sn-summary">{sn.summary}</span>
                        <span className="sn-chev">▾</span>
                      </summary>
                      <div className="sn-detail">{renderRich(sn.detail)}</div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {lesson?.formulas && (
              <section className="nd-section">
                <div className="nd-sectionLabel">关键公式 · 速查</div>
                <div className="nd-formulas">
                  {lesson.formulas.map((f, i) => (
                    <div key={i} className="nd-formulaCard" style={{ borderColor: theme.soft }}>
                      <div className="nd-formulaName" style={{ color: theme.deep }}>{f.name}</div>
                      <MathBlock tex={f.latex} />
                      {f.note && <div className="nd-formulaNote">{renderRich(f.note)}</div>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {lesson?.methods && (
              <section className="nd-section">
                <div className="nd-sectionLabel">解法 · 几种思路</div>
                <div className="nd-methods">
                  {lesson.methods.map((m, i) => (
                    <details key={i} className="nd-methodCard" open={i === 0}>
                      <summary className="nd-methodHead">
                        <span className="nd-methodName">{m.name}</span>
                        <span className="nd-methodChevron">▾</span>
                      </summary>
                      <div className="nd-methodBody">
                        <div className="nd-methodWhen"><b>适用：</b>{renderRich(m.when)}</div>
                        <ol className="nd-methodSteps">
                          {m.steps.map((s, j) => <li key={j}>{renderRich(s)}</li>)}
                        </ol>
                        {m.example && (
                          <div className="nd-methodExample" style={{ background: `${theme.soft}40` }}>
                            <div className="nd-methodExHead">例 · {renderRich(m.example.problem)}</div>
                            <ol className="nd-methodExSteps">
                              {m.example.solution.map((s, j) => <li key={j}>{renderRich(s)}</li>)}
                            </ol>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {lesson?.worked && (
              <section className="nd-section">
                <div className="nd-sectionLabel">例题精讲</div>
                <div className="nd-worked">
                  {lesson.worked.map((w, i) => (
                    <div key={i} className="nd-workedCard">
                      <div className="nd-workedTitle" style={{ color: theme.deep }}>{w.title}</div>
                      <div className="nd-workedProblem">{renderRich(w.problem)}</div>
                      <ol className="nd-workedSteps">
                        {w.steps.map((s, j) => <li key={j}>{renderRich(s)}</li>)}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!lesson?.worked && !lesson?.intro && (
              <section className="nd-section">
                <div className="nd-sectionLabel">例子</div>
                <pre className="nd-example" style={{ borderColor: theme.soft }}>{node.example}</pre>
              </section>
            )}

            {lesson?.pitfalls && (
              <section className="nd-section">
                <div className="nd-sectionLabel">易错点 · 常见误区</div>
                <ul className="nd-pitfalls">
                  {lesson.pitfalls.map((p, i) => (
                    <li key={i} className="nd-pitfall">
                      <span className="nd-pitfallIcon">⚠</span>
                      <span>{renderRich(p)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {lesson?.exercises && (
              <section className="nd-section">
                <div className="nd-sectionLabel">练一练 · 自己动手</div>
                <div className="nd-exercises">
                  {lesson.exercises.map((ex, i) => <Exercise key={i} ex={ex} idx={i+1} theme={theme} />)}
                </div>
              </section>
            )}

            {(prereqs.length > 0 || leadsTo.length > 0) && (
              <section className="nd-section">
                <div className="nd-sectionLabel">为什么要这么串联</div>
                <div className="nd-reasons">
                  {prereqs.length > 0 && (
                    <div className="nd-reasonGroup">
                      <div className="nd-reasonHeader">
                        <span className="nd-reasonArrow nd-up">←</span>
                        <span>先学这些，才能学好 <b>{node.name}</b></span>
                      </div>
                      {prereqs.map(p => {
                        const why = window.CODE_EDGE_WHY[`${p.id}→${node.id}`];
                        const pTheme = window.CODE_THEMES[p.theme];
                        return (
                          <button key={p.id} className="nd-reasonCard" onClick={() => onJump(p.id)}>
                            <div className="nd-reasonCardHead">
                              <span className="nd-dot" style={{ background: pTheme.color }}></span>
                              <span className="nd-reasonCardName" style={{ color: pTheme.deep }}>{p.name}</span>
                              <span className="nd-reasonJump">查看 →</span>
                            </div>
                            <div className="nd-reasonText">
                              {renderRich(why || `${p.name}是${node.name}的前置知识。`)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {leadsTo.length > 0 && (
                    <div className="nd-reasonGroup">
                      <div className="nd-reasonHeader">
                        <span className="nd-reasonArrow nd-down">→</span>
                        <span>学好 <b>{node.name}</b>，就能继续学</span>
                      </div>
                      {leadsTo.map(p => {
                        const why = window.CODE_EDGE_WHY[`${node.id}→${p.id}`];
                        const pTheme = window.CODE_THEMES[p.theme];
                        return (
                          <button key={p.id} className="nd-reasonCard" onClick={() => onJump(p.id)}>
                            <div className="nd-reasonCardHead">
                              <span className="nd-dot" style={{ background: pTheme.color }}></span>
                              <span className="nd-reasonCardName" style={{ color: pTheme.deep }}>{p.name}</span>
                              <span className="nd-reasonJump">查看 →</span>
                            </div>
                            <div className="nd-reasonText">
                              {renderRich(why || `${node.name}是${p.name}的前置知识。`)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {connections.length > 0 && (
              <section className="nd-section">
                <div className="nd-sectionLabel">横向联系</div>
                <div className="nd-chipRow">
                  {connections.map(p => (
                    <button key={p.id} className="nd-chip" onClick={() => onJump(p.id)}
                      style={{ borderColor: window.CODE_THEMES[p.theme].soft, color: window.CODE_THEMES[p.theme].deep }}>
                      <span className="nd-dot" style={{ background: window.CODE_THEMES[p.theme].color }}></span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </section>
            )}
            </>)}
          </div>
        )}

        {tab === 'quiz' && window.NodeQuiz && (
          <window.NodeQuiz node={node} theme={theme} />
        )}

        {tab === 'ai' && (
          <div className="nd-ai">
            {!aiAvailable && (
              <div className="nd-aiUnavailable">
                <div className="nd-aiAvatar">✦</div>
                <div className="nd-aiHello">
                  DeepSeek 暂未启用。
                </div>
                <div className="nd-aiUnavailableText">
                  请在本地环境配置 <code>DEEPSEEK_API_KEY</code> 后重启服务。默认模型为 <code>deepseek-v4-flash</code>，可用 <code>DEEPSEEK_MODEL</code> 覆盖。
                </div>
              </div>
            )}
            {aiAvailable && messages.length === 0 && !loading && (
              <div className="nd-aiWelcome">
                <div className="nd-aiAvatar">✦</div>
                <div className="nd-aiHello">
                  关于 <b>{node.name}</b>，想问什么？
                </div>
                <div className="nd-aiSuggestions">
                  {suggested.map((q, i) => (
                    <button key={i} className="nd-aiSuggest" onClick={() => ask(q)}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={'nd-msg ' + m.role}>
                {m.role === 'assistant' && <div className="nd-msgAvatar">✦</div>}
                <div className="nd-msgBubble">{m.role === 'assistant' ? renderRich(m.text) : m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="nd-msg assistant">
                <div className="nd-msgAvatar">✦</div>
                <div className="nd-msgBubble">
                  <span className="nd-thinking">
                    <span></span><span></span><span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={msgEndRef}></div>
          </div>
        )}
      </div>

      {tab === 'ai' && (
        <div className="nd-aiInputWrap">
          <input
            className="nd-aiInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(input)}
            disabled={!aiAvailable}
            placeholder={aiAvailable ? `问关于"${node.name}"的问题…` : 'DeepSeek 未配置'}
          />
          <button className="nd-aiSend" onClick={() => ask(input)} disabled={!aiAvailable || !input.trim() || loading}
                  style={{ background: aiAvailable && input.trim() && !loading ? theme.deep : '#e5e5e5' }}>
            →
          </button>
        </div>
      )}
      {!isMaximized && !isMobile && (
        <>
          <div className="nd-resizeHandle nd-resizeHandle-e" onPointerDown={(e) => startPanelResize('e', e)} />
          <div className="nd-resizeHandle nd-resizeHandle-s" onPointerDown={(e) => startPanelResize('s', e)} />
          <div className="nd-resizeHandle nd-resizeHandle-se" onPointerDown={(e) => startPanelResize('se', e)} />
        </>
      )}
    </div>
  );
}

window.NodeDetail = NodeDetail;
