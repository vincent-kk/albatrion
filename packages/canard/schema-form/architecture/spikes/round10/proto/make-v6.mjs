/** Exact derivation from round9. Generated files are local to round10. */
import { readFileSync, writeFileSync } from 'node:fs';
let edits = 0;
const replace = (text, from, to) => {
  const i = text.indexOf(from);
  if (i < 0 || text.indexOf(from, i + from.length) >= 0) throw new Error('Non-unique edit: ' + from);
  edits++;
  return text.slice(0, i) + to + text.slice(i + from.length);
};
let model = readFileSync(new URL('../../round9/proto/loop-v5.mjs', import.meta.url), 'utf8');
model = replace(model, 'export const SWITCHES = {', `export const SWITCHES = {
  EXPERIMENT: false, CLEAR_PRIORITY: 'clear-wins', LOSER_FATE: 'dropped',
  EDGE_CONSUMED_ON_LOSS: true, LOAD_EDGE_CLEAR: 'held',`);
model = replace(model, 'function reconcileDerive(root, sid, dryRun) {', `function reconcileDerive(root, sid, dryRun) {
  if (SWITCHES.EXPERIMENT) return experimentDerive(root, sid, dryRun);`);
model = replace(model, '  const sid = ++SID;', `  const sid = ++SID;
  if (SWITCHES.EXPERIMENT) beginExperiment(root);`);
model += readFileSync(new URL('./runtime-v6.inc.txt', import.meta.url), 'utf8');
writeFileSync(new URL('./loop-v6.mjs', import.meta.url), model);
let adapter = readFileSync(new URL('../../round9/proto/build-v5.mjs', import.meta.url), 'utf8');
adapter = replace(adapter, "from './loop-v5.mjs'", "from './loop-v6.mjs'");
adapter = replace(adapter, '  const pending = [];', '  const pending = [];\n  const order = declarationOrder(schema);');
adapter = replace(adapter, '    node.schema = definition;', '    node.schema = definition;\n    node.clearOrder = order.get(definition)?.clearValue ?? -1;');
adapter = replace(adapter, 'derived.push({ from, to: node, map: d.map });', "derived.push({ from, to: node, map: d.map, order: order.get(d) });");
adapter = replace(adapter, 'injections.push({ from: node, to, map: rule.map });', "injections.push({ from: node, to, map: rule.map, order: order.get(rule) });");
adapter += `
/** Body, allOf, then/else, branches; within each category preserve source order. */
function declarationOrder(schema) {
  const order = new WeakMap();
  let next = 0;
  const walk = part => {
    if (!part || typeof part !== 'object') return;
    for (const key of Object.keys(part)) {
      if (key === '&derived' && part[key]) order.set(part[key], next++);
      if (key === '&injectTo') for (const rule of Array.isArray(part[key]) ? part[key] : [part[key]]) order.set(rule, next++);
      if (key === '&clearValue') order.set(part, { clearValue: next++ });
      if (key === 'properties') for (const child of Object.values(part.properties)) walk(child);
    }
    for (const child of part.allOf ?? []) walk(child);
    walk(part.then); walk(part.else);
    for (const key of ['oneOf', 'anyOf']) for (const child of part[key] ?? []) walk(child);
  };
  walk(schema);
  return order;
}
`;
writeFileSync(new URL('./build-v6.mjs', import.meta.url), adapter);
console.log(JSON.stringify({ exactEdits: edits, baseline: 'round9/loop-v5', generated: ['loop-v6.mjs', 'build-v6.mjs'] }));
