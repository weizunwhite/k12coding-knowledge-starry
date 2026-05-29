// 测评系统 · Quiz + 错题本
// - Quiz: AI 现场出 3 道选择题，自动批改 + 解析 + 错题入库
// - MistakeBook: 全局错题本，按知识点聚合，可重做

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

function extractJSON(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*\n?([\s\S]+?)\n?\s*```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  return null;
}

// 统一 LaTeX 定界符：把 AI 可能返回的 \(...\) 和 \[...\] 转成 $...$ 和 $$...$$
function normalizeMathDelimiters(text) {
  if (!text) return text;
  // \[...\] → $$...$$（块级公式）
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  // \(...\) → $...$（行内公式）
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  return text;
}

// Render text with **bold** + inline $latex$
function richText(text) {
  if (!text) return null;
  text = normalizeMathDelimiters(text);
  return text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/).map((tok, i) => {
    if (tok.startsWith('$') && tok.endsWith('$')) {
      return <window.MathInlineQ key={i} tex={tok.slice(1, -1)} />;
    }
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return <b key={i}>{richText(tok.slice(2, -2))}</b>;
    }
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });
}

function MathInlineQ({ tex }) {
  const ref = useRefA(null);
  useEffectA(() => {
    if (window.katex && ref.current) {
      try { window.katex.render(tex, ref.current, { displayMode: false, throwOnError: false, output: 'html' }); }
      catch { ref.current.textContent = tex; }
    }
  }, [tex]);
  return <span ref={ref}></span>;
}
window.MathInlineQ = MathInlineQ;

// ─── Mistake book storage ──────────────────────
const MISTAKE_KEY = 'coding-mistakes';
function loadMistakes() {
  try { return JSON.parse(localStorage.getItem(MISTAKE_KEY) || '[]'); } catch { return []; }
}
function saveMistakes(arr) {
  localStorage.setItem(MISTAKE_KEY, JSON.stringify(arr));
}
// 间隔重复：错题按 1/3/7/15 天的间隔安排复习，记住一道就推到下一档；走完全部档位即「巩固毕业」
const REVIEW_INTERVALS_DAYS = [1, 3, 7, 15];
const DAY_MS = 86400000;
function mistakeIsDue(m) {
  const rc = m.reviewCount || 0;
  if (rc >= REVIEW_INTERVALS_DAYS.length) return false;
  const base = m.lastReview || m.time || 0;
  return Date.now() - base >= REVIEW_INTERVALS_DAYS[rc] * DAY_MS;
}
window.recordMistake = (entry) => {
  const arr = loadMistakes();
  arr.unshift({ ...entry, id: Date.now() + Math.random(), reviewCount: 0, lastReview: Date.now() });
  saveMistakes(arr.slice(0, 200));
  window.dispatchEvent(new Event('mistakes-updated'));
};
window.reviewMistake = (id, remembered) => {
  const arr = loadMistakes();
  const m = arr.find(x => x.id === id);
  if (!m) return;
  m.reviewCount = remembered ? (m.reviewCount || 0) + 1 : 0;
  m.lastReview = Date.now();
  saveMistakes(arr);
  window.dispatchEvent(new Event('mistakes-updated'));
};
window.removeMistake = (id) => {
  saveMistakes(loadMistakes().filter(m => m.id !== id));
  window.dispatchEvent(new Event('mistakes-updated'));
};
window.clearMistakes = () => {
  saveMistakes([]);
  window.dispatchEvent(new Event('mistakes-updated'));
};

// ─── Quiz component ──────────────────────
function NodeQuiz({ node, theme }) {
  const [state, setState] = useStateA('start');
  const [questions, setQuestions] = useStateA([]);
  const [current, setCurrent] = useStateA(0);
  const [picked, setPicked] = useStateA(null);
  const [answers, setAnswers] = useStateA([]);
  const [err, setErr] = useStateA(null);
  const aiAvailable = !!(window.claude && typeof window.claude.complete === 'function');
  const seed = (window.CODE_QUIZ_SEED || {})[node.id];

  const generate = async () => {
    if (!aiAvailable) {
      setErr('DeepSeek 暂未启用：请配置 DEEPSEEK_API_KEY 后重启服务。');
      return;
    }
    setState('loading');
    setErr(null);
    const lesson = (window.CODE_LESSON || {})[node.id];
    const ctx = lesson ? `\n参考讲解: ${(lesson.intro || []).join(' ')}\n公式: ${(lesson.formulas || []).map(f => f.name + ' ' + f.latex).join('; ')}\n常见易错: ${(lesson.pitfalls || []).join(' / ')}` : '';
    const prompt = `你是编程命题专家。请就「${node.name}」这个知识点出 3 道单选题，难度依次：基础 / 中等 / 进阶。${ctx}

要求：
- 每题 4 个选项，仅 1 个正确
- 用 $...$ 表示行内 LaTeX 公式（如 $x^2 + 1$）
- 解析要简短清晰、点出关键
- 解析里可以使用 **加粗** 强调关键词
- 题目中文，避免冷僻情境

严格只返回 JSON（不要 markdown 围栏、不要解释）：
{
  "questions": [
    { "q": "题目", "options": ["A","B","C","D"], "correct": 0, "explanation": "解析" },
    ...
  ]
}`;
    try {
      const text = await window.claude.complete(prompt);
      const j = extractJSON(text);
      if (!j || !Array.isArray(j.questions) || j.questions.length === 0) throw new Error('AI 返回格式异常');
      setQuestions(j.questions);
      setCurrent(0);
      setAnswers([]);
      setPicked(null);
      setState('answering');
    } catch (e) {
      setErr(e.message || '生成失败，请重试');
      setState('start');
    }
  };

  const startSeed = () => {
    if (!seed || !seed.length) return;
    setErr(null);
    setQuestions(seed);
    setCurrent(0);
    setAnswers([]);
    setPicked(null);
    setState('answering');
  };

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    const q = questions[current];
    setAnswers([...answers, idx]);
    if (idx !== q.correct) {
      window.recordMistake({
        nodeId: node.id,
        nodeName: node.name,
        theme: node.theme,
        question: q.q,
        options: q.options,
        correct: q.correct,
        userAnswer: idx,
        explanation: q.explanation,
        time: Date.now(),
      });
    }
  };

  const next = () => {
    setPicked(null);
    if (current + 1 < questions.length) setCurrent(current + 1);
    else setState('results');
  };

  const restart = () => { setState('start'); setQuestions([]); setAnswers([]); setPicked(null); };

  if (state === 'start') {
    const count = seed ? seed.length : 3;
    const sub = seed
      ? '题库出题（离线可用），答错自动收进错题本'
      : (aiAvailable ? 'DeepSeek 现场出题，答错自动收进错题本' : '本节点暂无离线题库');
    return (
      <div className="qz-start">
        <div className="qz-startIcon" style={{ background: theme.soft, color: theme.deep }}>?</div>
        <div className="qz-startTitle">来 {count} 道题，检测一下「{node.name}」</div>
        <div className="qz-startSub">{sub}</div>
        {seed && (
          <button className="qz-startBtn" onClick={startSeed} style={{ background: theme.deep }}>开始测验 →</button>
        )}
        {aiAvailable && (
          <button className={seed ? 'qz-altBtn' : 'qz-startBtn'} onClick={generate}
                  style={seed ? {} : { background: theme.deep }}>
            {seed ? '🎲 AI 换一批' : '开始测验 →'}
          </button>
        )}
        {!seed && !aiAvailable && (
          <div className="qz-err">本节点暂无离线题库；联网并配置 DeepSeek 后可用 AI 出题。</div>
        )}
        {err && <div className="qz-err">{err}</div>}
      </div>
    );
  }
  if (state === 'loading') {
    return (
      <div className="qz-loading">
        <div className="qz-loadDots"><span></span><span></span><span></span></div>
        AI 正在为你出题…
      </div>
    );
  }
  if (state === 'answering') {
    const q = questions[current];
    const correct = picked !== null && picked === q.correct;
    return (
      <div className="qz-q">
        <div className="qz-qHead">
          <span className="qz-qNum">第 {current + 1} / {questions.length} 题</span>
          <span className="qz-qBadge" style={{ background: theme.soft, color: theme.deep }}>{['基础', '中等', '进阶'][current] || '附加'}</span>
        </div>
        <div className="qz-qText">{richText(q.q)}</div>
        <div className="qz-options">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = i === q.correct;
            let cls = 'qz-opt';
            if (picked !== null) {
              if (isCorrect) cls += ' qz-opt-correct';
              else if (isPicked) cls += ' qz-opt-wrong';
              else cls += ' qz-opt-dim';
            }
            return (
              <button key={i} className={cls} onClick={() => choose(i)} disabled={picked !== null}>
                <span className="qz-optLetter">{['A', 'B', 'C', 'D'][i]}</span>
                <span className="qz-optText">{richText(opt)}</span>
                {picked !== null && isCorrect && <span className="qz-optMark">✓</span>}
                {picked !== null && isPicked && !isCorrect && <span className="qz-optMark">✗</span>}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className={'qz-feedback ' + (correct ? 'qz-fb-ok' : 'qz-fb-bad')}>
            <div className="qz-fbLabel">{correct ? '✓ 答对了' : '✗ 答错了'}</div>
            <div className="qz-fbText">{richText(q.explanation)}</div>
            <button className="qz-nextBtn" onClick={next} style={{ background: theme.deep }}>
              {current + 1 < questions.length ? '下一题 →' : '查看总结 →'}
            </button>
          </div>
        )}
      </div>
    );
  }
  if (state === 'results') {
    const correctCount = answers.filter((a, i) => a === questions[i].correct).length;
    const score = Math.round(correctCount / questions.length * 100);
    return (
      <div className="qz-results">
        <div className="qz-score" style={{ color: score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626' }}>
          {correctCount} / {questions.length}
        </div>
        <div className="qz-scoreLabel">{score >= 80 ? '掌握得不错！' : score >= 60 ? '还需要多练一点' : '建议回看「源流 + 解释」'}</div>
        <div className="qz-resultList">
          {questions.map((q, i) => {
            const ok = answers[i] === q.correct;
            return (
              <div key={i} className={'qz-resultItem ' + (ok ? 'qz-ok' : 'qz-bad')}>
                <span className="qz-resultMark">{ok ? '✓' : '✗'}</span>
                <span className="qz-resultText">{richText(q.q)}</span>
              </div>
            );
          })}
        </div>
        <div className="qz-resultActions">
          {seed && <button className="qz-startBtn" onClick={startSeed} style={{ background: theme.deep }}>再做一遍</button>}
          {aiAvailable && <button className={seed ? 'qz-altBtn' : 'qz-startBtn'} onClick={generate} style={seed ? {} : { background: theme.deep }}>{seed ? '🎲 AI 换一批' : '再来 3 题'}</button>}
          <button className="qz-altBtn" onClick={restart}>关闭</button>
        </div>
      </div>
    );
  }
  return null;
}
window.NodeQuiz = NodeQuiz;

// ─── 今日复习卡片（间隔重复）──────────────────
function ReviewCard({ m }) {
  const [revealed, setRevealed] = useStateA(false);
  return (
    <div className="mb-reviewCard">
      <div className="mb-itemQ">{richText(m.question)}</div>
      {!revealed ? (
        <button className="mb-reviewReveal" onClick={() => setRevealed(true)}>想一想，再看答案 →</button>
      ) : (
        <>
          <div className="mb-itemOpts">
            {m.options.map((opt, i) => (
              <div key={i} className={'mb-opt' + (i === m.correct ? ' mb-opt-correct' : '')}>
                <span>{['A', 'B', 'C', 'D'][i]}</span>
                <span>{richText(opt)}</span>
                {i === m.correct && <span className="mb-mark">✓ 正确</span>}
              </div>
            ))}
          </div>
          <div className="mb-itemExp"><b>解析：</b>{richText(m.explanation)}</div>
          <div className="mb-reviewBtns">
            <button className="mb-reviewYes" onClick={() => window.reviewMistake(m.id, true)}>✓ 这次记住了</button>
            <button className="mb-reviewNo" onClick={() => window.reviewMistake(m.id, false)}>✗ 还没记住</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Mistake Book modal ──────────────────────
function MistakeBook({ open, onClose, onJump }) {
  const [mistakes, setMistakes] = useStateA(loadMistakes());
  useEffectA(() => {
    const handler = () => setMistakes(loadMistakes());
    window.addEventListener('mistakes-updated', handler);
    return () => window.removeEventListener('mistakes-updated', handler);
  }, []);
  if (!open) return null;

  // Group by node
  const grouped = {};
  mistakes.forEach(m => { (grouped[m.nodeId] = grouped[m.nodeId] || []).push(m); });
  const dueList = mistakes.filter(mistakeIsDue);

  return (
    <div className="mb-backdrop" onClick={onClose}>
      <div className="mb-modal" onClick={e => e.stopPropagation()}>
        <div className="mb-header">
          <div>
            <div className="mb-title">错题本</div>
            <div className="mb-sub">{mistakes.length} 道错题 · 来自 {Object.keys(grouped).length} 个知识点{dueList.length > 0 ? ` · 今日待复习 ${dueList.length} 道` : ''}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {mistakes.length > 0 && <button className="mb-clearBtn" onClick={() => { if (confirm('清空所有错题？')) window.clearMistakes(); }}>清空</button>}
            <button className="mb-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="mb-body">
          {dueList.length > 0 && (
            <div className="mb-reviewSection">
              <div className="mb-reviewHead">🔁 今日复习 · {dueList.length} 道 —— 记住一道就推到更长的间隔（1→3→7→15 天）</div>
              {dueList.map(m => <ReviewCard key={'rev-' + m.id} m={m} />)}
            </div>
          )}
          {mistakes.length === 0 ? (
            <div className="mb-empty">
              <div className="mb-emptyIcon">✦</div>
              <div className="mb-emptyTitle">还没有错题</div>
              <div className="mb-emptySub">在任意知识点里"测验"答错时会自动收进来</div>
            </div>
          ) : Object.entries(grouped).map(([nodeId, items]) => {
            const node = window.CODE_NODE_BY_ID[nodeId];
            const theme = node ? window.CODE_THEMES[node.theme] : null;
            return (
              <div key={nodeId} className="mb-group">
                <div className="mb-groupHead" style={{ borderColor: theme?.soft }}>
                  <span className="mb-groupDot" style={{ background: theme?.color }}></span>
                  <span className="mb-groupName">{items[0].nodeName}</span>
                  <span className="mb-groupCount">{items.length} 题</span>
                  <button className="mb-groupJump" onClick={() => { onJump(nodeId); onClose(); }}>去回看 →</button>
                </div>
                {items.map(m => (
                  <div key={m.id} className="mb-item">
                    <div className="mb-itemQ">{richText(m.question)}</div>
                    <div className="mb-itemOpts">
                      {m.options.map((opt, i) => (
                        <div key={i} className={'mb-opt' + (i === m.correct ? ' mb-opt-correct' : i === m.userAnswer ? ' mb-opt-wrong' : '')}>
                          <span>{['A', 'B', 'C', 'D'][i]}</span>
                          <span>{richText(opt)}</span>
                          {i === m.correct && <span className="mb-mark">✓ 正确</span>}
                          {i === m.userAnswer && i !== m.correct && <span className="mb-mark">✗ 你的答案</span>}
                        </div>
                      ))}
                    </div>
                    <div className="mb-itemExp"><b>解析：</b>{richText(m.explanation)}</div>
                    <button className="mb-itemRemove" onClick={() => window.removeMistake(m.id)}>已掌握，移除 →</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
window.MistakeBook = MistakeBook;
window.loadMistakesCount = () => loadMistakes().length;
