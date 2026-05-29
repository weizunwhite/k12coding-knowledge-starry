// Variation C — 星空 (Constellation Map) — v2
// Now shows direction (animated flow particles), hierarchy (size = degree),
// and lineage (hover/select a star highlights its ancestor & descendant chain).

const STAR_W = 1400, STAR_H = 920;

// Cluster centers per theme（5 个编程主题在画布上分散开）
const CLUSTER_CENTERS = {
  basics:     { cx: 300, cy: 250 },
  control:    { cx: 760, cy: 210 },
  structure:  { cx: 1130, cy: 300 },
  paradigm:   { cx: 420, cy: 690 },
  algorithm:  { cx: 1000, cy: 690 },
};

// 自动布局：每个主题内的节点按 level 排序，簇心为低 level，其余沿黄金角螺旋向外铺开。
// 无需手摆坐标——新增节点会自动找到位置。
const STAR_POS = {};
(() => {
  const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // 黄金角 ≈ 2.39996 rad
  const byTheme = {};
  window.CODE_NODES.forEach(n => { (byTheme[n.theme] = byTheme[n.theme] || []).push(n); });
  Object.entries(byTheme).forEach(([theme, nodes]) => {
    const c = CLUSTER_CENTERS[theme];
    if (!c) return;
    nodes.sort((a, b) => (a.level || 1) - (b.level || 1) || a.id.localeCompare(b.id));
    nodes.forEach((node, i) => {
      if (i === 0) { STAR_POS[node.id] = { x: c.cx, y: c.cy }; return; }
      const angle = i * GOLDEN;
      const radius = 48 * Math.sqrt(i);
      STAR_POS[node.id] = { x: c.cx + radius * Math.cos(angle), y: c.cy + radius * Math.sin(angle) };
    });
  });
})();

// Edges split: in-theme (drawn solid) vs cross-theme (dashed)
const STAR_LINKS = window.CODE_EDGES.filter(e => {
  const a = window.CODE_NODE_BY_ID[e.from], b = window.CODE_NODE_BY_ID[e.to];
  return a && b && a.theme === b.theme && STAR_POS[e.from] && STAR_POS[e.to];
});
const STAR_CROSS = window.CODE_EDGES.filter(e => {
  const a = window.CODE_NODE_BY_ID[e.from], b = window.CODE_NODE_BY_ID[e.to];
  return a && b && a.theme !== b.theme && STAR_POS[e.from] && STAR_POS[e.to];
});

// Significance = total degree (in + out). Hubs shine brightest.
const STAR_SIG = {};
window.CODE_NODES.forEach(n => { STAR_SIG[n.id] = 0; });
window.CODE_EDGES.forEach(e => {
  if (STAR_SIG[e.from] != null) STAR_SIG[e.from]++;
  if (STAR_SIG[e.to] != null) STAR_SIG[e.to]++;
});

// Four-tier star classification — drives size, glow, flare, label visibility.
//   pillar  枢纽 · 最关键的编程枢纽 (力、能量、欧姆定律…)  ★ 4-point flare + huge halo
//   major   主星 · 一片小区域的中心                                   ★ big core + bright halo
//   branch  分支 · 普通知识点                                          · small core + soft halo
//   leaf    末端 · 当前体系的叶子节点                                  · tiny dot
// Roots (no prereqs) are auto-promoted at least to 'major'.
function starTier(id) {
  const d = STAR_SIG[id] || 0;
  const isRoot = !(ADJ_TO[id] && ADJ_TO[id].length);
  if (d >= 6) return 'pillar';
  if (d >= 4 || (isRoot && d >= 2)) return 'major';
  if (d >= 2) return 'branch';
  return 'leaf';
}
const TIER_STYLE = {
  pillar: { r: 7.5, glowMul: 7,   flare: true,  alwaysLabel: true,  labelSize: 13, labelWeight: 600 },
  major:  { r: 5.5, glowMul: 4.5, flare: false, alwaysLabel: true,  labelSize: 12, labelWeight: 600 },
  branch: { r: 3.5, glowMul: 3,   flare: false, alwaysLabel: false, labelSize: 11, labelWeight: 400 },
  leaf:   { r: 2.2, glowMul: 2,   flare: false, alwaysLabel: false, labelSize: 10.5, labelWeight: 400 },
};

// Stable twinkle phase per star
const TWINKLE_PHASE = {};
window.CODE_NODES.forEach((n, i) => { TWINKLE_PHASE[n.id] = (i * 0.37) % 1; });
// Edge phase offset (so particles don't all start together)
const EDGE_PHASE = {};
[...STAR_LINKS, ...STAR_CROSS].forEach((e, i) => { EDGE_PHASE[e.from + '→' + e.to] = (i * 0.21) % 1; });

// Precompute adjacency for lineage walks
const ADJ_FROM = {}; // id → [downstream ids]
const ADJ_TO = {};   // id → [upstream ids]
window.CODE_EDGES.forEach(e => {
  (ADJ_FROM[e.from] = ADJ_FROM[e.from] || []).push(e.to);
  (ADJ_TO[e.to] = ADJ_TO[e.to] || []).push(e.from);
});


function computeLineage(id) {
  if (!id) return null;
  const ancestors = new Set();
  const descendants = new Set();
  const walk = (start, set, adj) => {
    const stack = [start];
    while (stack.length) {
      const x = stack.pop();
      (adj[x] || []).forEach(n => {
        if (!set.has(n) && n !== id) { set.add(n); stack.push(n); }
      });
    }
  };
  walk(id, ancestors, ADJ_TO);
  walk(id, descendants, ADJ_FROM);
  const all = new Set([id, ...ancestors, ...descendants]);
  return { ancestors, descendants, all };
}

// Color tokens for upstream/downstream highlight
const COLOR_UP = '#7dd3fc';     // sky-300 — "what you need before"
const COLOR_DOWN = '#fde68a';   // amber-200 — "what it unlocks"

function ConstellationVariation({ onSelectNode, selectedId, mastered, searchQuery, themeFilter, onToggleMastery, hideHeader, recommended }) {
  const [hover, setHover] = useState(null);
  const [now, setNow] = useState(0);
  const [focusMode, setFocusMode] = useState(true); // dim non-lineage on hover/select

  // 移动端星图缩放/平移（桌面端鼠标不触发 touch 事件，恒等变换无副作用）
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 });
  const gestureRef = useRef(null);
  const mapWrapRef = useRef(null);
  const dist2 = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      gestureRef.current = { mode: 'pan', x: e.touches[0].clientX, y: e.touches[0].clientY, view: { ...view } };
    } else if (e.touches.length === 2) {
      gestureRef.current = { mode: 'pinch', d: dist2(e.touches[0], e.touches[1]), view: { ...view },
        cx: (e.touches[0].clientX + e.touches[1].clientX) / 2, cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
    }
  };
  const onTouchMove = (e) => {
    const g = gestureRef.current; if (!g) return;
    const rect = mapWrapRef.current && mapWrapRef.current.getBoundingClientRect();
    if (g.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault();
      setView({ ...g.view, tx: g.view.tx + (e.touches[0].clientX - g.x), ty: g.view.ty + (e.touches[0].clientY - g.y) });
    } else if (g.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      const d = dist2(e.touches[0], e.touches[1]);
      const k = Math.max(1, Math.min(5, g.view.scale * d / g.d));
      const ox = (g.cx - (rect ? rect.left : 0)) - g.view.tx;
      const oy = (g.cy - (rect ? rect.top : 0)) - g.view.ty;
      const ratio = k / g.view.scale;
      setView({ scale: k, tx: g.view.tx + ox * (1 - ratio), ty: g.view.ty + oy * (1 - ratio) });
    }
  };
  const onTouchEnd = (e) => { if (e.touches.length === 0) gestureRef.current = null; };
  const resetView = () => setView({ scale: 1, tx: 0, ty: 0 });
  const focused = hover || selectedId;
  const lineage = React.useMemo(() => focusMode ? computeLineage(focused) : null, [focused, focusMode]);

  // Search match set
  const q = (searchQuery || '').trim().toLowerCase();
  const searchMatches = React.useMemo(() => {
    if (!q) return null;
    const set = new Set();
    window.CODE_NODES.forEach(n => {
      if (n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q) ||
          (n.concept && n.concept.toLowerCase().includes(q))) set.add(n.id);
    });
    return set;
  }, [q]);
  const searchContext = React.useMemo(() => {
    if (!searchMatches) return null;
    const related = new Set();
    searchMatches.forEach(id => {
      related.add(id);
      const path = computeLineage(id);
      path.ancestors.forEach(x => related.add(x));
      path.descendants.forEach(x => related.add(x));
    });
    return { related };
  }, [searchMatches]);
  // 推荐节点集合（用于脉冲光环渲染）
  const recommendedSet = React.useMemo(() => {
    if (!recommended || !recommended.length) return new Set();
    return new Set(recommended.map(r => r.id));
  }, [recommended]);

  const themeOn = (theme) => !themeFilter || themeFilter[theme] !== false;

  useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = (t) => {
      setNow((t - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Backdrop "dust" stars (deterministic)
  const bgStars = React.useMemo(() => {
    const arr = [];
    let seed = 42;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 260; i++) {
      arr.push({ x: rand() * STAR_W, y: rand() * STAR_H, r: rand() * 0.9 + 0.3, o: rand() * 0.5 + 0.2, ph: rand() });
    }
    return arr;
  }, []);

  // Helpers
  const inLineage = (id) => !lineage || lineage.all.has(id);
  const edgeKind = (e) => {
    // returns: 'up' (within ancestors+focused), 'down' (within descendants+focused),
    // 'in' (entirely in lineage but not strictly up/down), or null (dim)
    if (!lineage) return 'neutral';
    const { ancestors, descendants } = lineage;
    const upChain = (ancestors.has(e.from) || e.from === focused) && (ancestors.has(e.to) || e.to === focused);
    const downChain = (descendants.has(e.from) || e.from === focused) && (descendants.has(e.to) || e.to === focused);
    if (upChain) return 'up';
    if (downChain) return 'down';
    return 'dim';
  };

  const renderEdge = (e, isCross) => {
    const a = STAR_POS[e.from], b = STAR_POS[e.to];
    if (!a || !b) return null;
    const k = e.from + '→' + e.to;
    const fromNode = window.CODE_NODE_BY_ID[e.from];
    const toNode = window.CODE_NODE_BY_ID[e.to];
    const themeOff = !themeOn(fromNode.theme) || !themeOn(toNode.theme);
    const kind = edgeKind(e);
    const theme = window.CODE_THEMES[fromNode.theme];
    // Edge styling
    let stroke = isCross ? '#fff' : theme.color;
    let strokeOpacity = isCross ? 0.10 : 0.40;
    let strokeWidth = isCross ? 0.6 : 0.9;
    let dash = isCross ? '2 6' : null;
    let particleColor = theme.color;
    let particleOpacity = 0.5;

    if (lineage) {
      if (kind === 'dim') { strokeOpacity = isCross ? 0.04 : 0.08; particleOpacity = 0; }
      else if (kind === 'up') { stroke = COLOR_UP; strokeOpacity = 0.85; strokeWidth = 1.4; dash = null; particleColor = COLOR_UP; particleOpacity = 1; }
      else if (kind === 'down') { stroke = COLOR_DOWN; strokeOpacity = 0.85; strokeWidth = 1.4; dash = null; particleColor = COLOR_DOWN; particleOpacity = 1; }
    }
    if (searchMatches) {
      const touchesMatch = searchMatches.has(e.from) || searchMatches.has(e.to);
      const inSearchPath = searchContext && searchContext.related.has(e.from) && searchContext.related.has(e.to);
      if (touchesMatch) {
        stroke = '#fde68a';
        strokeOpacity = 0.95;
        strokeWidth = isCross ? 1.4 : 1.8;
        dash = null;
        particleColor = '#fde68a';
        particleOpacity = 1;
      } else if (inSearchPath) {
        strokeOpacity = Math.max(strokeOpacity, isCross ? 0.18 : 0.42);
        strokeWidth = Math.max(strokeWidth, isCross ? 0.8 : 1.1);
        particleOpacity = Math.max(particleOpacity, 0.25);
      } else {
        strokeOpacity *= 0.22;
        particleOpacity = 0;
      }
    }
    if (themeOff) { strokeOpacity *= 0.12; particleOpacity = 0; }

    // Animated flow particles — only drawn when not dimmed
    const showParticles = particleOpacity > 0;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const speed = 60; // px/sec
    // 3 particles per edge
    const particles = [];
    if (showParticles) {
      const period = dist / speed; // sec for one particle to traverse
      const ph = EDGE_PHASE[k] || 0;
      for (let i = 0; i < 3; i++) {
        const u = ((now / period) + ph + i / 3) % 1;
        const px = a.x + dx * u;
        const py = a.y + dy * u;
        // particle fades in at start and out at end
        const fade = Math.min(u * 4, (1 - u) * 4, 1);
        particles.push(
          <circle key={i} cx={px} cy={py} r={1.6}
                  fill={particleColor}
                  opacity={particleOpacity * fade} />
        );
      }
    }

    return (
      <g key={k}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={stroke} strokeOpacity={strokeOpacity}
              strokeWidth={strokeWidth}
              strokeDasharray={dash || undefined} />
        {particles}
      </g>
    );
  };

  return (
    <div className="con-root">
      {!hideHeader && (
      <div className="con-header">
        <div>
          <div className="con-eyebrow">C · 学习路径地图</div>
          <h1 className="con-title">编程 · 知识星空</h1>
          <p className="con-sub">每个主题是一片星座 · <span className="con-hi-up">流向</span>是「先学 → 后学」 · 点亮一颗星，看清它的来路与去路</p>
        </div>
        <div className="con-headerRight">
          <div className="con-legend">
            {Object.entries(window.CODE_THEMES).map(([k, t]) => (
              <div key={k} className="con-legendItem">
                <span className="con-legendStar" style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }}></span>
                <span>{t.name}座</span>
              </div>
            ))}
          </div>
          <div className="con-legendKey">
            <div className="con-legendItem"><span className="con-legendDot" style={{ background: COLOR_UP }}></span><span>先学</span></div>
            <div className="con-legendItem"><span className="con-legendDot" style={{ background: COLOR_DOWN }}></span><span>后学</span></div>
          </div>
          <div className="con-tierKey">
            <span className="con-tierStar con-tier-pillar"></span><span>枢纽</span>
            <span className="con-tierStar con-tier-major"></span><span>主星</span>
            <span className="con-tierStar con-tier-branch"></span><span>分支</span>
            <span className="con-tierStar con-tier-leaf"></span><span>末端</span>
          </div>
        </div>
      </div>
      )}

      <div className="con-mapWrap" ref={mapWrapRef}
           onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <svg viewBox={`0 0 ${STAR_W} ${STAR_H}`} className="con-svg" preserveAspectRatio="xMidYMid meet"
             style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`, transformOrigin: '0 0' }}>
          <defs>
            {Object.entries(window.CODE_THEMES).map(([k, t]) => (
              <radialGradient key={k} id={`con-cluster-${k}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={t.color} stopOpacity="0.12" />
                <stop offset="60%" stopColor={t.color} stopOpacity="0.04" />
                <stop offset="100%" stopColor={t.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Cluster auras */}
          {Object.entries(CLUSTER_CENTERS).map(([k, c]) => (
            <circle key={k} cx={c.cx} cy={c.cy} r={300} fill={`url(#con-cluster-${k})`} />
          ))}

          {/* Background dust */}
          {bgStars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff"
                    opacity={s.o * (0.5 + 0.5 * Math.sin(now * 1.2 + s.ph * 6.28))} />
          ))}

          {/* Cross-theme edges (rendered behind, more subtle) */}
          {STAR_CROSS.map(e => renderEdge(e, true))}

          {/* Constellation edges (within-theme) */}
          {STAR_LINKS.map(e => renderEdge(e, false))}

          {/* Cluster labels */}
          {Object.entries(CLUSTER_CENTERS).map(([k, c]) => {
            const t = window.CODE_THEMES[k];
            return (
              <text key={k} x={c.cx} y={c.cy - 110} textAnchor="middle"
                    fontSize={14} fill={t.color} fillOpacity={0.55}
                    style={{ fontFamily: 'inherit', letterSpacing: '4px' }}>
                {t.name}
              </text>
            );
          })}

          {/* Stars */}
          {window.CODE_NODES.map(n => {
            const p = STAR_POS[n.id]; if (!p) return null;
            const theme = window.CODE_THEMES[n.theme];
            const sig = STAR_SIG[n.id];
            const tier = starTier(n.id);
            const style = TIER_STYLE[tier];
            const isSel = selectedId === n.id;
            const isHover = hover === n.id;
            const isFocused = focused === n.id;
            const isM = mastered && mastered[n.id];
            const twinkle = 0.7 + 0.3 * Math.sin(now * 1.5 + TWINKLE_PHASE[n.id] * 6.28);
            const r = isFocused ? style.r * 1.6 : style.r;
            const inLin = inLineage(n.id);

            // Tier-driven base appearance: pillars are bright white with theme glow;
            // majors are theme-colored; branches are dimmer; leaves are softest.
            const tierFill = {
              pillar: '#fff',
              major:  '#fff',
              branch: theme.soft,
              leaf:   theme.soft,
            }[tier];
            const tierCoreOpacity = { pillar: 1, major: 1, branch: 0.85, leaf: 0.7 }[tier];
            const tierLabelOpacity = { pillar: 1, major: 0.9, branch: 0.7, leaf: 0.5 }[tier];

            // Color/style based on lineage role
            let fill = isM ? theme.color : tierFill;
            let strokeColor = theme.color;
            let glowColor = theme.color;
            let labelColor = `rgba(255,255,255,${tierLabelOpacity})`;
            let coreOpacity = tierCoreOpacity;
            let opacity = 1;
            let showFlare = style.flare;

            if (lineage) {
              if (!inLin) { opacity = 0.15; showFlare = false; }
              else if (lineage.ancestors.has(n.id)) { fill = '#fff'; strokeColor = COLOR_UP; glowColor = COLOR_UP; labelColor = COLOR_UP; coreOpacity = 1; }
              else if (lineage.descendants.has(n.id)) { fill = '#fff'; strokeColor = COLOR_DOWN; glowColor = COLOR_DOWN; labelColor = COLOR_DOWN; coreOpacity = 1; }
              else if (isFocused) { fill = '#fff'; glowColor = '#fff'; labelColor = '#fff'; coreOpacity = 1; }
            }
            // Theme filter — dim heavily if theme is hidden
            if (!themeOn(n.theme)) { opacity = Math.min(opacity, 0.08); showFlare = false; }
            // Search — when a query is active, only matches stay bright
            const isSearchMatch = searchMatches && searchMatches.has(n.id);
            const isSearchRelated = searchContext && searchContext.related.has(n.id);
            if (searchMatches && !isSearchMatch) {
              opacity = Math.min(opacity, isSearchRelated ? 0.38 : 0.08);
              showFlare = false;
            }
            if (searchMatches && isSearchRelated && !isSearchMatch) {
              labelColor = `rgba(255,255,255,0.72)`;
            }
            if (isSearchMatch) {
              glowColor = '#fde68a'; labelColor = '#fde68a';
              fill = '#fff'; strokeColor = '#fde68a'; coreOpacity = 1;
              opacity = 1;
              showFlare = true;
            }
            const glowR = isSearchMatch ? r * 13 : (isFocused ? r * 8 : r * style.glowMul);
            const glowOpacity = (isSearchMatch ? 0.9 : (isFocused ? 0.55 : (tier === 'pillar' ? 0.35 : tier === 'major' ? 0.25 : tier === 'branch' ? 0.15 : 0.10))) * twinkle;
            const showLabel = isFocused || isHover || isSearchMatch || isSearchRelated || (lineage ? inLin : style.alwaysLabel);

            // Star-flare: two thin diamonds (horizontal + vertical) — the classic "twinkle" you see on bright stars in photos
            const flareLen = r * 5;
            const flareWid = 0.6;

            return (
              <g key={n.id}
                 onMouseEnter={() => setHover(n.id)}
                 onMouseLeave={() => setHover(null)}
                 onClick={() => onSelectNode(n.id)}
                 style={{ cursor: 'pointer', opacity, transition: 'opacity .2s' }}>
                {/* Outer glow halo */}
                <circle cx={p.x} cy={p.y} r={glowR}
                        fill={glowColor}
                        opacity={glowOpacity} />
                {isSearchMatch && (
                  <>
                    <circle cx={p.x} cy={p.y} r={r * 20}
                            fill="none"
                            stroke="#fde68a"
                            strokeWidth={1.1}
                            strokeOpacity={0.65 * twinkle} />
                    <circle cx={p.x} cy={p.y} r={r * 6.5}
                            fill="#fff7cc"
                            opacity={0.45 * twinkle} />
                  </>
                )}
                {/* Inner soft glow for pillars/majors */}
                {(tier === 'pillar' || tier === 'major' || isFocused) && (
                  <circle cx={p.x} cy={p.y} r={r * 2.2}
                          fill={glowColor}
                          opacity={(tier === 'pillar' ? 0.35 : 0.22) * (isFocused ? 1.5 : 1) * twinkle} />
                )}
                {/* 4-point cross flare — only on pillar stars or focused */}
                {(showFlare || isFocused || isSearchMatch) && (
                  <g style={{ pointerEvents: 'none' }}>
                    <path d={`M ${p.x - flareLen} ${p.y} L ${p.x} ${p.y - flareWid} L ${p.x + flareLen} ${p.y} L ${p.x} ${p.y + flareWid} Z`}
                          fill={glowColor} opacity={(isSearchMatch ? 1 : 0.7) * twinkle} />
                    <path d={`M ${p.x} ${p.y - flareLen} L ${p.x + flareWid} ${p.y} L ${p.x} ${p.y + flareLen} L ${p.x - flareWid} ${p.y} Z`}
                          fill={glowColor} opacity={(isSearchMatch ? 1 : 0.7) * twinkle} />
                  </g>
                )}
                {/* 推荐节点脉冲光环 — 金色扩散圆环 */}
                {recommendedSet.has(n.id) && !isFocused && !isSearchMatch && (
                  (() => {
                    const pulsePhase = (now * 0.5) % 1;
                    const pulseR = r * 2.5 + pulsePhase * r * 4;
                    const pulseOp = 0.55 * (1 - pulsePhase);
                    const pulsePhase2 = (now * 0.5 + 0.5) % 1;
                    const pulseR2 = r * 2.5 + pulsePhase2 * r * 4;
                    const pulseOp2 = 0.55 * (1 - pulsePhase2);
                    return (
                      <>
                        <circle cx={p.x} cy={p.y} r={pulseR}
                                fill="none" stroke="#fde68a" strokeWidth={1.2}
                                opacity={pulseOp} />
                        <circle cx={p.x} cy={p.y} r={pulseR2}
                                fill="none" stroke="#fde68a" strokeWidth={1.0}
                                opacity={pulseOp2} />
                      </>
                    );
                  })()
                )}
                {/* Hit area */}
                <rect x={p.x - 50} y={p.y - 16} width={100} height={42} fill="transparent" />
                {/* Core */}
                <circle cx={p.x} cy={p.y} r={r}
                        fill={fill}
                        fillOpacity={coreOpacity}
                        stroke={strokeColor}
                        strokeWidth={isSearchMatch ? 2.6 : (tier === 'pillar' ? 1.8 : tier === 'major' ? 1.5 : 1.2)}
                        style={{ transition: 'r .15s' }} />
                {/* Tiny bright dot at very center of pillars — gives that "shining" look */}
                {tier === 'pillar' && !lineage && (
                  <circle cx={p.x} cy={p.y} r={r * 0.35} fill="#fff" opacity={twinkle} />
                )}
                {showLabel && (
                  <text x={p.x} y={p.y + r + 14} textAnchor="middle"
                        fontSize={isSearchMatch ? Math.max(13.5, style.labelSize + 1.5) : (isFocused ? 14 : (isHover ? 12.5 : style.labelSize))}
                        fontWeight={isSearchMatch ? 700 : (isSearchRelated ? 600 : (isFocused || isHover ? 600 : style.labelWeight))}
                        fill={isFocused ? '#fff' : labelColor}
                        style={{ pointerEvents: 'none', fontFamily: 'inherit',
                                 textShadow: isSearchMatch ? '0 0 12px rgba(253,230,138,0.9), 0 0 8px rgba(0,0,0,0.9)' : (isSearchRelated ? '0 0 10px rgba(0,0,0,0.95), 0 0 4px rgba(125,211,252,0.35)' : '0 0 8px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.6)'),
                                 letterSpacing: '0.02em' }}>
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* 移动端缩放/平移后显示「复位」 */}
        {(view.scale !== 1 || view.tx !== 0 || view.ty !== 0) && (
          <button className="con-reset" onClick={resetView}>↺ 复位</button>
        )}

        {/* 首页标语 */}
        <div className={'con-hero' + (focused ? ' con-hero-hide' : '')}>
          <div className="con-heroTitle">编程是用结构化的语言指挥机器解决问题</div>
        </div>

        {/* Floating hint when nothing focused */}
        {!focused && (
          <div className="con-hint">
            <span className="con-hintDot"></span>
            悬停一颗星，看它的「先修」与「衍生」
          </div>
        )}
        {focused && lineage && (
          <div className="con-focusBadge">
            <div className="con-focusName">{window.CODE_NODE_BY_ID[focused].name}</div>
            <div className="con-focusStats">
              <span><b style={{color: COLOR_UP}}>{lineage.ancestors.size}</b> 个先修</span>
              <span><b style={{color: COLOR_DOWN}}>{lineage.descendants.size}</b> 个衍生</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.ConstellationVariation = ConstellationVariation;
