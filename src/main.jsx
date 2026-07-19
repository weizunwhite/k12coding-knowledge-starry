import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import katex from 'katex';
import 'katex/dist/katex.min.css';

globalThis.React = React;
globalThis.katex = katex;
globalThis.useState = React.useState;
globalThis.useEffect = React.useEffect;
globalThis.useRef = React.useRef;
globalThis.useMemo = React.useMemo;
globalThis.useCallback = React.useCallback;

function requestJson(url, options = {}) {
  if (typeof window.fetch === 'function') {
    return window.fetch(url, options).then(async res => {
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    });
  }

  if (typeof window.XMLHttpRequest !== 'function') {
    throw new Error('Browser request APIs are unavailable');
  }

  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest();
    xhr.open(options.method || 'GET', url);
    const headers = options.headers || {};
    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.onload = () => {
      let data = {};
      try { data = xhr.responseText ? JSON.parse(xhr.responseText) : {}; } catch {}
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };
    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.send(options.body || null);
  });
}

function completeWithJsonp(body) {
  return new Promise((resolve, reject) => {
    const callbackName = `__aiComplete_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.__aiCallbacks = window.__aiCallbacks || {};
    window.__aiCallbacks[callbackName] = (data) => {
      delete window.__aiCallbacks[callbackName];
      script.remove();
      if (data && data.error) reject(new Error(data.error));
      else resolve(data.content);
    };

    const script = document.createElement('script');
    script.src = `/api/ai/complete-jsonp?callback=window.__aiCallbacks.${callbackName}&payload=${encodeURIComponent(JSON.stringify(body))}`;
    script.onerror = () => {
      delete window.__aiCallbacks[callbackName];
      script.remove();
      reject(new Error('AI request failed'));
    };
    document.head.appendChild(script);
  });
}

async function setupAiAdapter() {
  const fallbackStatus = {
    enabled: true,
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
  };

  try {
    let status = window.__AI_STATUS__;
    if (!status) {
      try {
        const statusRes = await requestJson('/api/ai/status');
        status = statusRes.ok ? statusRes.data : fallbackStatus;
      } catch {
        status = fallbackStatus;
      }
    }
    if (!status.enabled) return;

    window.claude = {
      provider: status.provider,
      model: status.model,
      async complete(input) {
        const body = typeof input === 'string' ? { prompt: input } : input;
        if (typeof window.fetch !== 'function' && typeof window.XMLHttpRequest !== 'function') {
          return completeWithJsonp(body);
        }
        const res = await requestJson('/api/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = res.data;
        if (!res.ok) throw new Error(data.error || 'AI request failed');
        return data.content;
      },
    };
  } catch {
    window.claude = {
      provider: fallbackStatus.provider,
      model: fallbackStatus.model,
      complete(input) {
        const body = typeof input === 'string' ? { prompt: input } : input;
        return completeWithJsonp(body);
      },
    };
  }
}

await setupAiAdapter();

await import('../knowledge-data.js');
await import('../knowledge-history.js');
await import('../knowledge-lesson.js');
await import('../knowledge-subnodes.js');
await import('../knowledge-quiz-seed.js');
// 节点配图注册表（public/media/）；空表时详情页不渲染配图区块
await import('../code-media.js');
await import('../interactive-widgets.jsx');
await import('../assessment.jsx');
await import('../node-detail.jsx');
await import('../variation-constellation.jsx');
await import('../learning-path.jsx');
await import('../onboarding-welcome.jsx');
await import('../guided-tour.jsx');

// 详细小课分片：每个主题/学段一个文件，Object.assign 覆盖 CODE_LESSON 对应节点的完整版小课
// （在 knowledge-lesson.js 组装出基础 CODE_LESSON 之后加载，逐个覆盖为最详细版本）
const lessonFragments = import.meta.glob('../lessons/*.js');
for (const path of Object.keys(lessonFragments).sort()) {
  await lessonFragments[path]();
}

// 题库分片：追加合并进 CODE_QUIZ_SEED（在 knowledge-quiz-seed.js 之后加载，push 不覆盖）
const quizFragments = import.meta.glob('../quiz/*.js');
for (const path of Object.keys(quizFragments).sort()) {
  await quizFragments[path]();
}

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState(() =>
    Object.fromEntries(Object.keys(window.CODE_THEMES || {}).map(k => [k, true]))
  );
  // 学段切换：'junior' = 只看初中, 'all' = 初高中融合
  const [stageFilter, setStageFilter] = useState(() => {
    try {
      const saved = localStorage.getItem('coding-stage');
      if (saved === 'junior' || saved === 'all') return saved;
      const prof = JSON.parse(localStorage.getItem('coding-user-profile') || 'null');
      const rank = prof ? (prof.gradeRank || 0) : 0;
      return rank >= 4 ? 'all' : 'junior';
    } catch { return 'junior'; }
  });
  useEffect(() => { try { localStorage.setItem('coding-stage', stageFilter); } catch {} }, [stageFilter]);
  const [mastered, setMastered] = useState(() => {
    try { return JSON.parse(localStorage.getItem('coding-mastery') || '{}'); }
    catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('coding-mastery', JSON.stringify(mastered)); }, [mastered]);

  // 用户档案 & 引导状态
  const [userProfile, setUserProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('coding-user-profile') || 'null'); }
    catch { return null; }
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('coding-user-profile'); }
    catch { return true; }
  });
  const [guidedStep, setGuidedStep] = useState(() => {
    try { return localStorage.getItem('coding-onboarding-done') ? null : 0; }
    catch { return 0; }
  });

  const [showMistakes, setShowMistakes] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem('coding-mistakes') || '[]').length; }
    catch { return 0; }
  });
  useEffect(() => {
    const h = () => {
      try { setMistakeCount(JSON.parse(localStorage.getItem('coding-mistakes') || '[]').length); }
      catch {}
    };
    window.addEventListener('mistakes-updated', h);
    return () => window.removeEventListener('mistakes-updated', h);
  }, []);

  const toggleMastery = useCallback((id) => {
    setMastered(m => ({ ...m, [id]: !m[id] }));
  }, []);

  // 当前学段可见的节点集（只看初中时过滤掉高中节点：GRADE_RANK ≥ 4 即高一/高二/高三）
  const stageNodes = React.useMemo(() =>
    stageFilter === 'all'
      ? window.CODE_NODES
      : window.CODE_NODES.filter(n => ((window.CODE_GRADE_RANK || {})[(window.CODE_NODE_GRADE || {})[n.id]] || 0) < 4),
    [stageFilter]
  );

  // 推荐算法（只在当前学段内推荐）
  const recommended = React.useMemo(() =>
    window.computeRecommendations
      ? window.computeRecommendations(stageNodes, mastered, userProfile?.grade)
      : [],
    [mastered, userProfile, stageNodes]
  );

  // Onboarding 完成回调
  const handleOnboardingComplete = useCallback((profile, initialMastered) => {
    setUserProfile(profile);
    localStorage.setItem('coding-user-profile', JSON.stringify(profile));
    // 选了高中年级，自动切到初高中融合
    const rank = profile?.gradeRank || 0;
    setStageFilter(rank >= 4 ? 'all' : 'junior');
    if (initialMastered) {
      setMastered(m => ({ ...m, ...initialMastered }));
    }
    setShowOnboarding(false);
    if (!localStorage.getItem('coding-onboarding-done')) {
      setGuidedStep(1);
    }
  }, []);

  // 引导步骤推进
  const handleGuidedDismiss = useCallback(() => {
    if (guidedStep === 1) {
      setGuidedStep(2);
    } else {
      setGuidedStep(null);
      localStorage.setItem('coding-onboarding-done', 'true');
    }
  }, [guidedStep]);

  // 选中节点时，如果在引导 step 1 则推进到 step 2
  const handleSelectNode = useCallback((id) => {
    setSelectedId(id);
    if (guidedStep === 1) {
      setGuidedStep(2);
    }
  }, [guidedStep]);

  const node = selectedId ? window.CODE_NODE_BY_ID[selectedId] : null;
  const masteredCount = stageNodes.filter(n => mastered[n.id]).length;
  const totalCount = stageNodes.length;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedId) setSelectedId(null);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const inp = document.querySelector('.app-search input');
        if (inp) inp.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-glyph">✦</span>
          <div className="app-meta">
            <div className="app-title">{stageFilter === 'all' ? '初中 + 高中编程' : '初中编程'} · 知识星空</div>
            <div className="app-sub">{totalCount} 颗星 · {stageFilter === 'all' ? '初高中融合 · 按依赖连线' : '只看初中 · 按依赖连线'}</div>
          </div>
        </div>
        <div className="app-controls">
          <div className="app-search">
            <svg className="app-searchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M21 21l-4.3-4.3"></path>
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索知识点  (⌘K)"
            />
            {searchQuery && <button className="app-clearBtn" onClick={() => setSearchQuery('')}>✕</button>}
          </div>
          <div className="app-themes">
            {Object.entries(window.CODE_THEMES).map(([k, t]) => (
              <button
                key={k}
                className={'app-theme' + (themeFilter[k] ? ' on' : '')}
                onClick={() => setThemeFilter(f => ({ ...f, [k]: !f[k] }))}
                title={themeFilter[k] ? `隐藏${t.name}` : `显示${t.name}`}
              >
                <span className="app-themeDot" style={{
                  background: t.color,
                  boxShadow: themeFilter[k] ? `0 0 8px ${t.color}` : 'none'
                }}></span>
                {t.short}
              </button>
            ))}
          </div>
          <div className="app-stage" style={{ display: 'inline-flex', gap: 4, padding: 3, borderRadius: 999, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.14)' }}>
            {[['junior', '只看初中'], ['all', '初高中融合']].map(([v, label]) => (
              <button key={v} onClick={() => setStageFilter(v)}
                title={v === 'all' ? '显示初中+高中全部知识点' : '只显示初中知识点'}
                style={{ padding: '6px 13px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, letterSpacing: '0.02em', background: stageFilter === v ? 'rgba(225,29,72,0.9)' : 'transparent', color: stageFilter === v ? '#fff' : 'rgba(255,255,255,0.72)', fontWeight: stageFilter === v ? 600 : 400, transition: 'background .15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="app-main">
        <window.ConstellationVariation
          hideHeader={true}
          selectedId={selectedId}
          onSelectNode={handleSelectNode}
          mastered={mastered}
          searchQuery={searchQuery}
          themeFilter={themeFilter}
          recommended={recommended}
          stageFilter={stageFilter}
        />
        {node && (
          <window.NodeDetail
            node={node}
            mastered={mastered[node.id]}
            onToggleMastery={() => toggleMastery(node.id)}
            onClose={() => setSelectedId(null)}
            onJump={(id) => handleSelectNode(id)}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="app-progress">
          <span className="app-progressLabel">已掌握</span>
          <div className="app-progressBar">
            <div className="app-progressFill" style={{ width: `${masteredCount / totalCount * 100}%` }}></div>
          </div>
          <span className="app-progressCount">{masteredCount} / {totalCount}</span>
        </div>
        <div className="app-tip">
          点亮一颗星，看它的来路与去路 · <kbd>⌘K</kbd> 搜索 · <kbd>Esc</kbd> 关闭
        </div>
        <span className="app-archive">免费课程 · 零一优创出品</span>
      </footer>
      <button className="app-mistakeBtn" onClick={() => setShowMistakes(true)} title="错题本">
        📕 错题本 {mistakeCount > 0 && <span className="app-mistakeBadge">{mistakeCount}</span>}
      </button>
      {window.MistakeBook && (
        <window.MistakeBook open={showMistakes} onClose={() => setShowMistakes(false)} onJump={handleSelectNode} />
      )}

      {/* 学习路径推荐面板 */}
      {!showOnboarding && window.LearningPath && (
        <window.LearningPath recommended={recommended} onSelectNode={handleSelectNode} mastered={mastered} />
      )}

      {/* 新手欢迎浮层 */}
      {showOnboarding && window.OnboardingWelcome && (
        <window.OnboardingWelcome onComplete={handleOnboardingComplete} />
      )}

      {/* 引导提示 */}
      {guidedStep != null && window.GuidedTour && (
        <window.GuidedTour
          step={guidedStep}
          recommended={recommended}
          selectedId={selectedId}
          onDismiss={handleGuidedDismiss}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
