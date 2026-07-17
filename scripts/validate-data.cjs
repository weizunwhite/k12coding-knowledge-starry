const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);

for (const file of ['knowledge-data.js', 'knowledge-history.js', 'knowledge-lesson.js', 'knowledge-subnodes.js', 'knowledge-quiz-seed.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
}

// ── 分片覆盖防丢字段：快照基础版 CODE_LESSON 每个节点已有的字段 ──
// （lessons/ 分片是整条覆盖，如果分片版比基础版少字段——例如 figure——就会静默丢内容）
const baseLessonFields = {};
for (const [id, lesson] of Object.entries(ctx.window.CODE_LESSON || {})) {
  baseLessonFields[id] = Object.keys(lesson).filter(k => lesson[k] !== undefined);
}

// 分片：lessons/（整条覆盖 CODE_LESSON 条目）与 quiz/（追加合并进 CODE_QUIZ_SEED）
for (const dir of ['lessons', 'quiz']) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const file of fs.readdirSync(full).sort()) {
    if (!file.endsWith('.js')) continue;
    vm.runInContext(fs.readFileSync(path.join(full, file), 'utf8'), ctx, { filename: `${dir}/${file}` });
  }
}

const w = ctx.window;
const errors = [];
const warn = [];

function fail(message) {
  errors.push(message);
}

function warning(message) {
  warn.push(message);
}

const themes = w.CODE_THEMES || {};
const nodes = w.CODE_NODES || [];
const edges = w.CODE_EDGES || [];
const edgeWhy = w.CODE_EDGE_WHY || {};
const lessons = w.CODE_LESSON || {};
const histories = w.CODE_HISTORY || {};
const subnodes = w.CODE_SUBNODES || {};
const nodeGrade = w.CODE_NODE_GRADE || {};
const gradeRank = w.CODE_GRADE_RANK || {};

const ids = new Set();
for (const node of nodes) {
  if (!node.id) fail(`Node without id: ${JSON.stringify(node)}`);
  if (ids.has(node.id)) fail(`Duplicate node id: ${node.id}`);
  ids.add(node.id);

  for (const field of ['name', 'theme', 'level', 'concept', 'explanation', 'example']) {
    if (node[field] === undefined || node[field] === '') fail(`Node ${node.id} missing ${field}`);
  }
  if (!themes[node.theme]) fail(`Node ${node.id} has unknown theme: ${node.theme}`);
  for (const prereq of node.prereqs || []) {
    if (!ids.has(prereq) && !nodes.some(n => n.id === prereq)) fail(`Node ${node.id} references missing prereq: ${prereq}`);
  }
  for (const connection of node.connections || []) {
    if (!ids.has(connection) && !nodes.some(n => n.id === connection)) fail(`Node ${node.id} references missing connection: ${connection}`);
  }
}

// ── 学段标注校验：每个节点必须有年级标注，且标注在 rank 表里 ──
for (const node of nodes) {
  const g = nodeGrade[node.id];
  if (!g) fail(`Node ${node.id} missing CODE_NODE_GRADE entry`);
  else if (!gradeRank[g]) fail(`Node ${node.id} grade "${g}" not in CODE_GRADE_RANK`);
}
for (const id of Object.keys(nodeGrade)) {
  if (!ids.has(id)) warning(`CODE_NODE_GRADE has unknown node id: ${id}`);
}

const edgeKeys = new Set();
for (const edge of edges) {
  if (!ids.has(edge.from)) fail(`Edge references missing source: ${edge.from}`);
  if (!ids.has(edge.to)) fail(`Edge references missing target: ${edge.to}`);
  edgeKeys.add(`${edge.from}->${edge.to}`);
}

for (const edge of edges) {
  const whyKey = `${edge.from}→${edge.to}`;
  if (!edgeWhy[whyKey]) fail(`Missing edge explanation: ${whyKey}`);
}
for (const key of Object.keys(edgeWhy)) {
  const normalized = key.replace('→', '->');
  if (!edgeKeys.has(normalized)) warning(`Unused edge explanation: ${key}`);
}

for (const node of nodes) {
  if (!lessons[node.id]) fail(`Missing lesson: ${node.id}`);
  if (!histories[node.id]) fail(`Missing history: ${node.id}`);
  if (!subnodes[node.id]) fail(`Missing subnodes: ${node.id}`);
}

// ── 分片覆盖后字段完整性：分片版不能比基础版少字段（防"figure 丢失"类 bug）──
for (const [id, fields] of Object.entries(baseLessonFields)) {
  const after = lessons[id] || {};
  const lost = fields.filter(k => after[k] === undefined);
  if (lost.length) fail(`Lesson fragment for ${id} dropped base fields: ${lost.join(', ')}（分片整条覆盖时把基础版已有字段冲掉了）`);
}

for (const [nodeId, items] of Object.entries(subnodes)) {
  if (!ids.has(nodeId)) fail(`Subnodes use unknown node id: ${nodeId}`);
  if (!Array.isArray(items) || items.length === 0) fail(`Subnodes for ${nodeId} must be a non-empty array`);
  for (const [idx, item] of (items || []).entries()) {
    for (const field of ['name', 'summary', 'detail']) {
      if (!item[field]) fail(`Subnode ${nodeId}[${idx}] missing ${field}`);
    }
  }
}

// ── 题库格式校验 ──
const quiz = w.CODE_QUIZ_SEED || {};
for (const [nodeId, items] of Object.entries(quiz)) {
  if (!ids.has(nodeId)) fail(`Quiz uses unknown node id: ${nodeId}`);
  if (!Array.isArray(items) || items.length === 0) { fail(`Quiz for ${nodeId} must be a non-empty array`); continue; }
  for (const [idx, item] of items.entries()) {
    if (typeof item.q !== 'string' || !item.q) fail(`Quiz ${nodeId}[${idx}] missing q`);
    if (!Array.isArray(item.options) || item.options.length !== 4) fail(`Quiz ${nodeId}[${idx}] must have 4 options`);
    if (!Number.isInteger(item.correct) || item.correct < 0 || item.correct > 3) fail(`Quiz ${nodeId}[${idx}] correct out of range: ${item.correct}`);
    if (typeof item.explanation !== 'string' || !item.explanation) fail(`Quiz ${nodeId}[${idx}] missing explanation`);
  }
}

// ── 示意图格式校验（独立注册表 CODE_FIGURES + 小课自带的 figure）──
const figures = w.CODE_FIGURES || {};
for (const [nodeId, svg] of Object.entries(figures)) {
  if (!ids.has(nodeId)) fail(`Figure uses unknown node id: ${nodeId}`);
  if (typeof svg !== 'string' || !/^<svg[^>]*viewBox/.test(svg) || !svg.trim().endsWith('</svg>')) fail(`Figure ${nodeId} is not a well-formed inline <svg>`);
}

// ── 内容覆盖率报告（不阻塞，只提醒缺口在哪）──
function coverage(label, has) {
  const missing = nodes.filter(n => !has(n)).map(n => n.id);
  const pct = ((nodes.length - missing.length) / nodes.length * 100).toFixed(0);
  const head = `${label}: ${nodes.length - missing.length}/${nodes.length} (${pct}%)`;
  return missing.length ? `${head} — 缺: ${missing.join(', ')}` : head;
}
const coverageReport = [
  coverage('quiz≥2 ', n => Array.isArray(quiz[n.id]) && quiz[n.id].length >= 2),
  coverage('warmup ', n => lessons[n.id] && lessons[n.id].warmup),
  coverage('figure ', n => figures[n.id] || (lessons[n.id] && lessons[n.id].figure)),
];

if (warn.length) {
  console.warn(warn.map(msg => `WARN ${msg}`).join('\n'));
}

if (errors.length) {
  console.error(errors.map(msg => `ERROR ${msg}`).join('\n'));
  process.exit(1);
}

console.log('内容覆盖率:\n  ' + coverageReport.join('\n  '));
console.log(`Data OK: ${nodes.length} nodes, ${edges.length} edges, ${Object.keys(lessons).length} lessons, ${Object.values(quiz).reduce((s, v) => s + v.length, 0)} quiz questions, ${Object.keys(figures).length} figures.`);
