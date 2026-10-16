// Invoked by node table.cjs; this file is verification tooling.
// usage: node table.cjs <outDir> — (A) terminal-mode tables: per runtime, host columns (0.16.1, current, ±%), share columns vs BN
// for both versions, two-round min/max per cell, and the winglet reference table. Cell = median of the two rounds' medians.
const fs = require('fs'); const path = require('path');
const dir = process.argv[2];
const read = (f) => { const t = fs.readFileSync(path.join(dir, f), 'utf8'); return JSON.parse(t.slice(t.indexOf('{'))); };
const med = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmt = (x) => (x === undefined ? '—' : x >= 1 ? x.toPrecision(4) : x.toPrecision(3));
const pct = (a, b) => { if (!(a > 0 && b > 0)) return '—'; const p = Math.round((a / b - 1) * 100); return (p > 0 ? '+' : p < 0 ? '−' : '±') + Math.abs(p) + '%'; };
const ratio = (a, b) => (a > 0 && b > 0 ? (a / b).toFixed(2) : '—');
const acc = {}; const flags = []; const reasons = {};
for (const f of fs.readdirSync(dir)) {
  const m = f.match(/^term-(legacy|new)-(node|bun)-(\d)\.json$/); if (!m) continue;
  const j = read(f);
  for (const s of j.sizes) {
    const key = `${m[2]}|${s.operation}|${s.n}`;
    if (s.measured === false) { reasons[`${m[1]}|${key}`] = s.reason; continue; }
    if (s.incompleteAtReturn) flags.push(`${f} ${s.operation} ${s.n} incompleteAtReturn=${s.incompleteAtReturn}`);
    if (m[1] === 'legacy' && s.completedInOnChange !== undefined && s.lane === 'steady' && s.completedInOnChange < j.samples) flags.push(`${f} ${s.operation} ${s.n} completedInOnChange=${s.completedInOnChange}`);
    ((acc[key] ??= {})[m[1]] ??= []).push(s.medianMs);
  }
}
const cell = (rt, op, n, v) => { const a = acc[`${rt}|${op}|${n}`]?.[v]; return a ? { m: med(a), lo: Math.min(...a), hi: Math.max(...a), k: a.length } : undefined; };
const KINDS = {
  object: { hosts: ['T', 'B0', 'B1', 'BN'], ops: ['mount', 'one-key', 'all-keys'], sizes: [100, 1000], unit: (n) => `${n}키` },
  array: { hosts: ['T', 'T0', 'B0', 'BN'], ops: ['mount', 'set-same-length', 'push', 'remove-front', 'clear'], sizes: [1000, 8000], unit: (n) => (n === 1000 ? '1천' : '8천') },
};
const OPL = { mount: '마운트', 'one-key': '통째 setValue 한 키', 'all-keys': '통째 setValue 모든 키', 'set-same-length': '통째 setValue 같은 길이', push: 'push', 'remove-front': 'remove(0)', clear: 'clear' };
const out = [];
for (const rt of ['node', 'bun']) {
  const RT = rt === 'node' ? 'Node v26.11.1' : 'Bun 1.4.3';
  for (const [kind, K] of Object.entries(KINDS)) {
    out.push(`### ${kind === 'object' ? '객체' : '배열'} — ${RT}, 중앙값 ms`, '');
    out.push('| 장면 | ' + K.hosts.map((h) => `${h} 0.16.1 | ${h} 현재 | ${h} ±%`).join(' | ') + ' |', '|---' + '|---|---|---'.repeat(K.hosts.length) + '|');
    for (const n of K.sizes) for (const op of K.ops) {
      const cells = K.hosts.map((h) => { const o = cell(rt, `${kind}-${h}-${op}`, n, 'legacy'), c = cell(rt, `${kind}-${h}-${op}`, n, 'new');
        const lo = o ? fmt(o.m) : reasons[`legacy|${rt}|${kind}-${h}-${op}|${n}`] ? '거부' : '—';
        return `${lo} | ${c ? fmt(c.m) : '—'} | ${pct(c?.m, o?.m)}`; });
      out.push(`| ${OPL[op]} ${K.unit(n)} | ${cells.join(' | ')} |`);
    }
    out.push('', `### ${kind === 'object' ? '객체' : '배열'} 몫(÷BN) — ${RT}`, '');
    const sh = K.hosts.filter((h) => h !== 'BN');
    out.push('| 장면 | ' + sh.map((h) => `${h}÷BN 0.16.1 | ${h}÷BN 현재`).join(' | ') + ' |', '|---' + '|---|---'.repeat(sh.length) + '|');
    for (const n of K.sizes) for (const op of K.ops) {
      const bo = cell(rt, `${kind}-BN-${op}`, n, 'legacy')?.m, bc = cell(rt, `${kind}-BN-${op}`, n, 'new')?.m;
      out.push(`| ${OPL[op]} ${K.unit(n)} | ${sh.map((h) => `${ratio(cell(rt, `${kind}-${h}-${op}`, n, 'legacy')?.m, bo)} | ${ratio(cell(rt, `${kind}-${h}-${op}`, n, 'new')?.m, bc)}`).join(' | ')} |`);
    }
    out.push('', `### ${kind === 'object' ? '객체' : '배열'} 두 바퀴 범위(최소–최대) — ${RT}`, '');
    out.push('| 장면 | ' + K.hosts.map((h) => `${h} 0.16.1 | ${h} 현재`).join(' | ') + ' |', '|---' + '|---|---'.repeat(K.hosts.length) + '|');
    for (const n of K.sizes) for (const op of K.ops) {
      const r = (x) => (x ? `${fmt(x.lo)}–${fmt(x.hi)}` : '—');
      out.push(`| ${OPL[op]} ${K.unit(n)} | ${K.hosts.map((h) => `${r(cell(rt, `${kind}-${h}-${op}`, n, 'legacy'))} | ${r(cell(rt, `${kind}-${h}-${op}`, n, 'new'))}`).join(' | ')} |`);
    }
    out.push('');
  }
}
const ref = {};
for (const f of fs.readdirSync(dir)) {
  const m = f.match(/^ref-(verbs|write)-(ws|npm)-(node|bun)-(\d)\.json$/); if (!m) continue;
  for (const s of read(f).sizes) ((ref[`${m[3]}|${s.operation} ${s.n}`] ??= {})[m[2]] ??= []).push(s.medianMs);
}
out.push('### winglet 참고 — 0.16.1(작업 공간 winglet) 대 0.16.1(npm 공개 winglet), 중앙값 ms', '', '| 런타임·장면 | 작업 공간 | npm 공개 | npm÷작업 공간 | 작업 공간 두 바퀴 | npm 두 바퀴 |', '|---|---|---|---|---|---|');
for (const [k, v] of Object.entries(ref).sort()) {
  const r = (a) => `${fmt(Math.min(...a))}–${fmt(Math.max(...a))}`;
  out.push(`| ${k.replace('|', ' ')} | ${fmt(med(v.ws))} | ${fmt(med(v.npm))} | ${pct(med(v.npm), med(v.ws))} | ${r(v.ws)} | ${r(v.npm)} |`);
}
fs.writeFileSync(path.join(dir, 'table.md'), out.join('\n') + '\n');
console.log('flags', flags.length, flags.slice(0, 8).join('\n'));
