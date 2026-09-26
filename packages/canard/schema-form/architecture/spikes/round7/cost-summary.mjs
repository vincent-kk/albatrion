// Summarise cost-results.jsonl: per case x variant, the median over runs of each process's median,
// the min-max of those per-run medians, and the overhead vs v4c. `node cost-summary.mjs`
import { readFileSync } from 'node:fs';

const rows = readFileSync(new URL('./cost-results.jsonl', import.meta.url), 'utf8')
  .split('\n')
  .filter((l) => l.startsWith('##RESULT## '))
  .map((l) => JSON.parse(l.slice(11)));
const med = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const fmt = (ns) => (ns >= 1e6 ? `${(ns / 1e6).toFixed(2)} ms` : `${(ns / 1e3).toFixed(2)} us`);
const by = new Map();
for (const r of rows) {
  const k = `${r.case}|${r.variant}`;
  if (!by.has(k)) by.set(k, []);
  by.get(k).push(r);
}
const cases = [...new Set(rows.map((r) => r.case))];
console.log('case         v4c                 v4d-old             v4d-new             old/v4c  new/v4c  runs  new counts (rounds, injections, retractions per prep op)');
for (const c of cases) {
  const cell = (v) => {
    const rs = by.get(`${c}|${v}`) ?? [];
    const ms = rs.map((r) => r.medianNs);
    return { m: med(ms), lo: Math.min(...ms), hi: Math.max(...ms), n: ms.length, counts: rs[0]?.counts };
  };
  const a = cell('v4c');
  const o = cell('v4d-old');
  const n = cell('v4d-new');
  const pct = (x) => `${((x / a.m - 1) * 100).toFixed(1).padStart(6)}%`;
  const rng = (x) => `${fmt(x.m).padStart(9)} [${((x.hi - x.lo) / x.m * 100).toFixed(0)}%]`;
  const cn = n.counts ?? {};
  const ca = a.counts ?? {};
  console.log(`${c.padEnd(12)} ${rng(a).padEnd(19)} ${rng(o).padEnd(19)} ${rng(n).padEnd(19)} ${pct(o.m)} ${pct(n.m)}  ${a.n}/${o.n}/${n.n}   v4c r=${ca.rounds} i=${ca.injections} | new r=${cn.rounds} i=${cn.injections} x=${cn.retractions}`);
}
