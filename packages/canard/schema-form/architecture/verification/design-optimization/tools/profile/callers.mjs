// usage: node callers.mjs <profileDir> <functionName>[,<name2>] -> self time of the function grouped by caller chain (2 levels)
import fs from 'node:fs';
import path from 'node:path';

import context from './context.mjs';

const [dir, names] = process.argv.slice(2);
const targets = new Set(names.split(','));
const profile = JSON.parse(
  fs.readFileSync(path.join(dir, 'loop.cpuprofile'), 'utf8'),
);
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of profile.nodes)
  for (const c of n.children ?? []) parent.set(c, n.id);
let total = 0;
const agg = new Map();
profile.samples.forEach((id, i) => {
  const dt = profile.timeDeltas[i] / 1000;
  const leaf = byId.get(id);
  if (leaf.callFrame.functionName === '(idle)') return;
  total += dt;
  if (!targets.has(leaf.callFrame.functionName)) return;
  const chain = [];
  for (
    let p = parent.get(id);
    p !== undefined && chain.length < 3;
    p = parent.get(p)
  )
    chain.push(byId.get(p).callFrame.functionName || '(anon)');
  const k = `${leaf.callFrame.functionName} <- ${chain.join(' <- ')}`;
  agg.set(k, (agg.get(k) ?? 0) + dt);
});
for (const [k, v] of [...agg].sort((a, b) => b[1] - a[1]).slice(0, 8))
  console.log(`${((100 * v) / total).toFixed(1).padStart(5)}%  ${k}`);
