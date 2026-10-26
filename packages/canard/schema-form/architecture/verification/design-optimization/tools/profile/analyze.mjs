// usage: node analyze.mjs <profileDir> [topN] -> writes <profileDir>/summary.json and prints tables
import fs from 'node:fs';
import path from 'node:path';

import context from './context.mjs';

const [dir, topArg = '25'] = process.argv.slice(2);
const TOP = Number(topArg);
if (!path.resolve(dir).startsWith(context.runDir + path.sep))
  throw new Error('Profile directory must be inside D0_RUN_DIR');
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.cpuprofile'))
  .map((f) => path.join(dir, f));
const profile = files
  .map((f) => JSON.parse(fs.readFileSync(f, 'utf8')))
  .find((p) => p.nodes.some((n) => n.callFrame.url.endsWith('/run.mjs')));
if (!profile) throw new Error(`no runner profile in ${dir}`);
// dist region map: line (0-based) -> source file
const regionsFor = {};
function regions(url) {
  if (regionsFor[url]) return regionsFor[url];
  const r = [];
  if (url.includes('/engines/')) {
    const lines = fs.readFileSync(new URL(url), 'utf8').split('\n');
    lines.forEach((l, i) => {
      const m = l.match(/^\/\/#region (.*)$/);
      if (m) r.push([i, m[1]]);
    });
  }
  return (regionsFor[url] = r);
}
function srcOf(url, line) {
  const r = regions(url);
  if (!r.length)
    return (
      url
        .replace(context.engines.href, 'engines/')
        .replace(/^file:\/\/.*node_modules\//, 'nm/') || '(native)'
    );
  let lo = 0,
    hi = r.length - 1,
    best = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (r[mid][0] <= line) {
      best = r[mid];
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return best ? `${best[1]}:+${line - best[0]}` : `dist:${line + 1}`;
}
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of profile.nodes)
  for (const c of n.children ?? []) parent.set(c, n.id);
const keyOf = (n) => {
  const f = n.callFrame;
  return `${f.functionName || '(anonymous)'}|${f.url}|${f.lineNumber}`;
};
const info = new Map();
const self = new Map();
const incl = new Map();
const dirIncl = new Map();
const fileSelf = new Map();
let total = 0,
  idle = 0,
  gc = 0,
  program = 0;
const { samples, timeDeltas } = profile;
const dirOf = (src) => {
  const p = src.replace(/:\+\d+$/, '').split('/');
  p.pop();
  return p.join('/');
};
for (let i = 0; i < samples.length; i++) {
  const dt = timeDeltas[i] / 1000;
  const leaf = byId.get(samples[i]);
  const name = leaf.callFrame.functionName;
  if (name === '(idle)') {
    idle += dt;
    continue;
  }
  total += dt;
  if (name === '(garbage collector)') gc += dt;
  if (name === '(program)') program += dt;
  const lk = keyOf(leaf);
  self.set(lk, (self.get(lk) ?? 0) + dt);
  const seen = new Set();
  const seenDir = new Set();
  for (let id = leaf.id; id !== undefined; id = parent.get(id)) {
    const n = byId.get(id);
    const k = keyOf(n);
    if (!info.has(k))
      info.set(k, {
        name: n.callFrame.functionName || '(anonymous)',
        src: srcOf(n.callFrame.url, n.callFrame.lineNumber),
        url: n.callFrame.url,
      });
    if (!seen.has(k)) {
      seen.add(k);
      incl.set(k, (incl.get(k) ?? 0) + dt);
    }
    const d = info.get(k).src.startsWith('src/')
      ? dirOf(info.get(k).src)
      : null;
    if (d) {
      const parts = d.split('/');
      for (let j = 3; j <= parts.length; j++) {
        const pd = parts.slice(0, j).join('/');
        if (!seenDir.has(pd)) {
          seenDir.add(pd);
          dirIncl.set(pd, (dirIncl.get(pd) ?? 0) + dt);
        }
      }
    }
  }
  const ls = info.get(lk).src.replace(/:\+\d+$/, '');
  fileSelf.set(ls, (fileSelf.get(ls) ?? 0) + dt);
}
const pct = (v) => ((100 * v) / total).toFixed(1);
const rows = [...self]
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP)
  .map(([k, v]) => ({
    name: info.get(k).name,
    src: info.get(k).src,
    selfMs: +v.toFixed(1),
    selfPct: +pct(v),
    inclPct: +pct(incl.get(k)),
  }));
const inclRows = [...incl]
  .filter(([k]) => info.get(k).src.startsWith('src/'))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 60)
  .map(([k, v]) => ({
    name: info.get(k).name,
    src: info.get(k).src,
    inclMs: +v.toFixed(1),
    inclPct: +pct(v),
    selfPct: +pct(self.get(k) ?? 0),
  }));
const dirRows = [...dirIncl]
  .sort((a, b) => b[1] - a[1])
  .map(([d, v]) => ({ dir: d, inclPct: +pct(v) }));
const fileRows = [...fileSelf]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .map(([f, v]) => ({ file: f, selfPct: +pct(v) }));
const summary = {
  dir,
  totalMs: +total.toFixed(0),
  idleMs: +idle.toFixed(0),
  gcPct: +pct(gc),
  programPct: +pct(program),
  self: rows,
  inclusive: inclRows,
  dirs: dirRows,
  files: fileRows,
};
fs.writeFileSync(
  path.join(dir, 'summary.json'),
  JSON.stringify(summary, null, 1),
);
console.log(
  `== ${path.basename(dir)} total ${summary.totalMs} ms, GC ${summary.gcPct}%, (program) ${summary.programPct}%`,
);
for (const r of rows)
  console.log(
    `${r.selfPct.toString().padStart(5)}% ${r.selfMs.toString().padStart(7)} ms  incl ${r.inclPct.toString().padStart(5)}%  ${r.name}  ${r.src}`,
  );
