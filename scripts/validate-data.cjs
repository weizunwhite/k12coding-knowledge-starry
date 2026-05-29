const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);

for (const file of ['knowledge-data.js', 'knowledge-history.js', 'knowledge-lesson.js', 'knowledge-subnodes.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
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

for (const [nodeId, items] of Object.entries(subnodes)) {
  if (!ids.has(nodeId)) fail(`Subnodes use unknown node id: ${nodeId}`);
  if (!Array.isArray(items) || items.length === 0) fail(`Subnodes for ${nodeId} must be a non-empty array`);
  for (const [idx, item] of (items || []).entries()) {
    for (const field of ['name', 'summary', 'detail']) {
      if (!item[field]) fail(`Subnode ${nodeId}[${idx}] missing ${field}`);
    }
  }
}

if (warn.length) {
  console.warn(warn.map(msg => `WARN ${msg}`).join('\n'));
}

if (errors.length) {
  console.error(errors.map(msg => `ERROR ${msg}`).join('\n'));
  process.exit(1);
}

console.log(`Data OK: ${nodes.length} nodes, ${edges.length} edges, ${Object.keys(lessons).length} lessons.`);
