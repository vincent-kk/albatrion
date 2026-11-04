// Invoked by node table.cjs; this file is verification tooling.
// usage: node table.cjs <outDir> — round 368 table (0.16.1, before, after, three ±% columns) per runtime; median of two rounds' medians.
const fs = require('fs'); const path = require('path');
const dir = process.argv[2];
const read = (f) => { const t = fs.readFileSync(path.join(dir, f), 'utf8'); return JSON.parse(t.slice(t.indexOf('{'))); };
const med = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const LABEL = { push: 'push', pop: 'pop', 'update-mid': 'update(N/2)', 'remove-front': 'remove(0)', remove: 'remove(1)', 'remove-mid': 'remove(N/2)', 'remove-end': 'remove(N−1)', 'insert-front': 'insert(0)', 'insert-mid': 'insert(N/2)', 'insert-end': 'insert(N)', clear: 'clear', 'set-same-length': 'setValue 같은 길이', 'set-grow': 'setValue 늘림' };
const ORDER = Object.keys(LABEL);
const acc = {}; const bad = []; const flags = [];
for (const f of fs.readdirSync(dir)) {
  const m = f.match(/^(legacy|verbs-before|verbs-after)-(node|bun)-(\d)\.json$/); if (!m) continue;
  let j; try { j = read(f); } catch { bad.push(f); continue; }
  const v = m[1] === 'legacy' ? 'old' : m[1].slice(6);
  for (const s of j.sizes) {
    if (s.lane && s.lane !== 'steady') continue;
    if (s.measured === false || s.failed) flags.push(`${f} ${s.operation} ${s.n} not measured`);
    if (s.incompleteAtReturn) flags.push(`${f} ${s.operation} ${s.n} incompleteAtReturn=${s.incompleteAtReturn}`);
    if (v === 'old' && s.completedInOnChange !== undefined && s.completedInOnChange < (j.samples ?? 100)) flags.push(`${f} ${s.operation} ${s.n} completedInOnChange=${s.completedInOnChange}`);
    ((acc[`${m[2]}|${s.operation}|${s.n}`] ??= {})[v] ??= []).push(s.medianMs);
  }
}
const fmt = (x) => (x === undefined || Number.isNaN(x) || x === 0 ? 'API 없음' : x >= 1 ? x.toPrecision(4) : x.toPrecision(3));
const pct = (a, b) => { if (!(a > 0 && b > 0)) return '—'; const p = Math.round((a / b - 1) * 100); return (p > 0 ? '+' : p < 0 ? '−' : '±') + Math.abs(p) + '%'; };
const out = []; const summary = {};
for (const rt of ['node', 'bun']) {
  out.push(`**${rt === 'node' ? 'Node v26.11.1' : 'Bun'}**`, '', '| 장면 | 0.16.1 ms | 수정 전 ms | 수정 후 ms | 수정 전 대 0.16.1 | 수정 후 대 0.16.1 | 수정 후 대 수정 전 |', '|---|---|---|---|---|---|---|');
  for (const n of [1000, 8000]) for (const op of ORDER) {
    const a = acc[`${rt}|${op}|${n}`]; if (!a) continue; if (a.old && a.old.every((x) => x === 0)) delete a.old;
    const o = a.old ? med(a.old) : undefined, b = a.before ? med(a.before) : undefined, h = a.after ? med(a.after) : undefined;
    summary[`${rt} ${op} ${n}`] = { old: o, before: b, after: h, rounds: [a.old?.length, a.before?.length, a.after?.length] };
    out.push(`| ${LABEL[op]} ${n === 1000 ? '1천' : '8천'} | ${fmt(o)} | ${fmt(b)} | ${fmt(h)} | ${pct(b, o)} | ${pct(h, o)} | ${pct(h, b)} |`);
  }
  out.push('');
}
fs.writeFileSync(path.join(dir, 'table.md'), out.join('\n'));
fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(summary, null, 1));
console.log('bad', bad.length, bad.join(' ')); console.log('flags', flags.length); for (const x of flags.slice(0, 10)) console.log(' ', x);
console.log(out.join('\n'));
