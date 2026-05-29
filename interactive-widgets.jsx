// 物理互动组件注册表
// Architecture: window.PHYSICS_WIDGETS = { [nodeId]: Component }

const W = {
  card: {
    border: '1px solid rgba(24,24,27,0.10)',
    borderRadius: 8,
    padding: 14,
    background: 'rgba(255,255,255,0.72)',
    boxShadow: '0 8px 26px rgba(24,24,27,0.06)',
  },
  row: { display: 'grid', gridTemplateColumns: '110px 1fr 86px', alignItems: 'center', gap: 10, margin: '10px 0' },
  label: { fontSize: 12, color: '#52525b', fontWeight: 600 },
  value: { fontFamily: 'var(--font-mono)', fontSize: 12, color: '#18181b', textAlign: 'right' },
  result: { marginTop: 12, padding: 12, borderRadius: 8, color: '#18181b', fontWeight: 600, lineHeight: 1.65 },
  tabs: { display: 'inline-flex', gap: 6, padding: 4, borderRadius: 8, background: '#f4f4f5', marginBottom: 8 },
  tab: { border: 0, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 },
};

function Slider({ label, min, max, step, value, onChange, unit }) {
  return (
    <label style={W.row}>
      <span style={W.label}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span style={W.value}>{value}{unit}</span>
    </label>
  );
}

function WidgetShell({ title, theme, children }) {
  return (
    <section className="nd-section">
      <div className="nd-sectionLabel">互动实验 · {title}</div>
      <div style={{ ...W.card, borderColor: theme.soft }}>
        {children}
      </div>
    </section>
  );
}

function SpeedWidget({ theme }) {
  const [s, setS] = useState(40);
  const [t, setT] = useState(10);
  const v = s / t;
  return (
    <WidgetShell title="路程、时间与速度" theme={theme}>
      <Slider label="路程 s" min={5} max={200} step={5} value={s} onChange={setS} unit=" m" />
      <Slider label="时间 t" min={1} max={60} step={1} value={t} onChange={setT} unit=" s" />
      <div style={{ ...W.result, background: theme.soft }}>
        平均速度 v = s / t = {v.toFixed(2)} m/s。路程增大或时间减小，平均速度都会增大。
      </div>
    </WidgetShell>
  );
}

function DensityWidget({ theme }) {
  const [m, setM] = useState(270);
  const [v, setV] = useState(100);
  const rho = m / v;
  return (
    <WidgetShell title="质量、体积与密度" theme={theme}>
      <Slider label="质量 m" min={10} max={1000} step={10} value={m} onChange={setM} unit=" g" />
      <Slider label="体积 V" min={10} max={500} step={10} value={v} onChange={setV} unit=" cm³" />
      <div style={{ ...W.result, background: theme.soft }}>
        密度 ρ = m / V = {rho.toFixed(2)} g/cm³。体积相同，质量越大密度越大。
      </div>
    </WidgetShell>
  );
}

function PressureWidget({ theme }) {
  const [force, setForce] = useState(100);
  const [area, setArea] = useState(0.02);
  const p = force / area;
  return (
    <WidgetShell title="压力作用效果" theme={theme}>
      <Slider label="压力 F" min={10} max={500} step={10} value={force} onChange={setForce} unit=" N" />
      <Slider label="面积 S" min={0.005} max={0.2} step={0.005} value={area} onChange={setArea} unit=" m²" />
      <div style={{ ...W.result, background: theme.soft }}>
        压强 p = F / S = {p.toFixed(0)} Pa。压力一定时，受力面积越小，压强越大。
      </div>
    </WidgetShell>
  );
}

function BuoyancyWidget({ theme }) {
  const [rho, setRho] = useState(1000);
  const [volume, setVolume] = useState(0.001);
  const f = rho * 10 * volume;
  return (
    <WidgetShell title="排开液体与浮力" theme={theme}>
      <Slider label="液体密度" min={600} max={1300} step={50} value={rho} onChange={setRho} unit=" kg/m³" />
      <Slider label="排液体积" min={0.0002} max={0.005} step={0.0002} value={volume} onChange={setVolume} unit=" m³" />
      <div style={{ ...W.result, background: theme.soft }}>
        浮力 F浮 = ρ液 g V排 ≈ {f.toFixed(2)} N。排开液体越重，浮力越大。
      </div>
    </WidgetShell>
  );
}

function LensWidget({ theme }) {
  const [f, setF] = useState(10);
  const [u, setU] = useState(30);
  const real = u > f;
  const v = real ? (f * u) / (u - f) : (f * u) / (f - u);
  const magnification = v / u;
  const nature = !real ? '正立放大虚像' : u > 2 * f ? '倒立缩小实像' : u === 2 * f ? '倒立等大实像' : '倒立放大实像';
  return (
    <WidgetShell title="凸透镜成像趋势" theme={theme}>
      <Slider label="焦距 f" min={5} max={20} step={1} value={f} onChange={setF} unit=" cm" />
      <Slider label="物距 u" min={6} max={80} step={1} value={u} onChange={setU} unit=" cm" />
      <div style={{ ...W.result, background: theme.soft }}>
        当前像距约 {v.toFixed(1)} cm，放大率约 {magnification.toFixed(2)}，像的性质：{nature}。
      </div>
    </WidgetShell>
  );
}

function OhmsLawWidget({ theme }) {
  const [u, setU] = useState(6);
  const [r, setR] = useState(3);
  const i = u / r;
  return (
    <WidgetShell title="欧姆定律计算器" theme={theme}>
      <Slider label="电压 U" min={1} max={24} step={1} value={u} onChange={setU} unit=" V" />
      <Slider label="电阻 R" min={1} max={50} step={1} value={r} onChange={setR} unit=" Ω" />
      <div style={{ ...W.result, background: theme.soft }}>
        电流 I = U / R = {i.toFixed(2)} A。电阻一定时，电压越大电流越大。
      </div>
    </WidgetShell>
  );
}

function SeriesParallelWidget({ theme }) {
  const [r1, setR1] = useState(6);
  const [r2, setR2] = useState(12);
  const [mode, setMode] = useState('series');
  const equivalent = mode === 'series' ? r1 + r2 : (r1 * r2) / (r1 + r2);
  return (
    <WidgetShell title="串并联等效电阻" theme={theme}>
      <div style={W.tabs}>
        <button style={{ ...W.tab, background: mode === 'series' ? theme.color : 'transparent', color: mode === 'series' ? '#fff' : '#3f3f46' }} onClick={() => setMode('series')}>串联</button>
        <button style={{ ...W.tab, background: mode === 'parallel' ? theme.color : 'transparent', color: mode === 'parallel' ? '#fff' : '#3f3f46' }} onClick={() => setMode('parallel')}>并联</button>
      </div>
      <Slider label="电阻 R1" min={1} max={50} step={1} value={r1} onChange={setR1} unit=" Ω" />
      <Slider label="电阻 R2" min={1} max={50} step={1} value={r2} onChange={setR2} unit=" Ω" />
      <div style={{ ...W.result, background: theme.soft }}>
        {mode === 'series' ? '串联总电阻等于各电阻之和' : '并联总电阻小于任一支路电阻'}，当前 R = {equivalent.toFixed(2)} Ω。
      </div>
    </WidgetShell>
  );
}

window.PHYSICS_WIDGETS = {
  speed: SpeedWidget,
  'mass-density': DensityWidget,
  pressure: PressureWidget,
  buoyancy: BuoyancyWidget,
  lens: LensWidget,
  'ohms-law': OhmsLawWidget,
  'series-parallel': SeriesParallelWidget,
};

window.NodeWidget = function NodeWidget({ nodeId, theme }) {
  const Widget = window.PHYSICS_WIDGETS[nodeId];
  return Widget ? <Widget theme={theme} /> : null;
};
