/**
 * Renders the markdown tables for REPORT.md from `results/*.json`, so no number
 * in the report is hand-transcribed. Prints to stdout.
 */
import fs from 'node:fs';

const load = (name) =>
  JSON.parse(fs.readFileSync(new URL(`./results/${name}.json`, import.meta.url), 'utf8'));

/** ns -> a human unit, keeping three significant figures. */
const t = (ns) => {
  if (ns == null) return '—';
  if (ns < 1000) return `${ns < 10 ? ns.toFixed(1) : ns.toFixed(0)} ns`;
  if (ns < 1e6) return `${(ns / 1000).toFixed(ns < 1e4 ? 2 : 1)} µs`;
  return `${(ns / 1e6).toFixed(2)} ms`;
};

const section = (title) => console.log(`\n### ${title}\n`);
const row = (cells) => console.log(`| ${cells.join(' | ')} |`);
const head = (cells) => {
  row(cells);
  row(cells.map(() => '---'));
};

// --- M1 -------------------------------------------------------------------
{
  const { rows, floorNs, environment } = load('m1');
  console.log(`<!-- env ${JSON.stringify(environment)} floor=${floorNs.toFixed(2)}ns -->`);
  section('M1 — one guard call, by shape and host width');
  head(['guard shape', 'host keys', 'Ajv true', 'Ajv false', 'cfworker true', 'cfworker false']);
  const shapes = [...new Set(rows.map((r) => r.shape))].filter(
    (s) => s !== 'loop overhead floor' && !s.startsWith('g4'),
  );
  for (const shape of shapes) {
    for (const siblings of [...new Set(rows.filter((r) => r.shape === shape).map((r) => r.siblings))]) {
      const pick = (verdict, validator) =>
        rows.find(
          (r) => r.shape === shape && r.siblings === siblings && r.verdict === verdict && r.validator === validator,
        );
      row([
        shape,
        String(siblings),
        t(pick(true, 'ajv').medianNs),
        t(pick(false, 'ajv').medianNs),
        t(pick(true, 'cfworker').medianNs),
        t(pick(false, 'cfworker').medianNs),
      ]);
    }
  }
}

// --- M1b ------------------------------------------------------------------
{
  const { rows } = load('m1-contains');
  section('M1b — g4 `contains` over an array (host 100 keys, fresh process)');
  head(['array items', 'Ajv early match', 'Ajv no match', 'cfworker early match', 'cfworker no match']);
  for (const count of [...new Set(rows.map((r) => r.count))]) {
    const pick = (label, validator) =>
      rows.find((r) => r.count === count && r.verdictLabel === label && r.validator === validator);
    row([
      count.toLocaleString('en-US'),
      t(pick('early match at 0', 'ajv').medianNs),
      t(pick('no match', 'ajv').medianNs),
      t(pick('early match at 0', 'cfworker').medianNs),
      t(pick('no match', 'cfworker').medianNs),
    ]);
  }
}

// --- M2 -------------------------------------------------------------------
{
  const { rows } = load('m2');
  section('M2 — one write, N guards on the root');
  const counts = [...new Set(rows.map((r) => r.n))];
  head(['mechanism', ...counts.map((n) => `N=${n}`), 'ns/guard (N=200)']);
  for (const mechanism of [...new Set(rows.map((r) => r.mechanism))]) {
    const at = (n) => rows.find((r) => r.n === n && r.mechanism === mechanism);
    row([
      mechanism,
      ...counts.map((n) => t(at(n).medianNs)),
      at(200).nsPerGuard ? at(200).nsPerGuard.toFixed(1) : 'O(1)',
    ]);
  }
}

// --- M3 -------------------------------------------------------------------
{
  const { rows } = load('m3');
  section('M3 — skip strategies (Ajv guards; Resolve pass only, evaluations · time)');
  const counts = [...new Set(rows.map((r) => r.n))];
  head(['layout', 'keystroke', 'strategy', ...counts.map((n) => `N=${n}`)]);
  for (const layout of [...new Set(rows.map((r) => r.layout))]) {
    for (const scenario of [...new Set(rows.map((r) => r.scenario))]) {
      for (const strategy of [...new Set(rows.map((r) => r.strategy))]) {
        const at = (n) =>
          rows.find(
            (r) => r.layout === layout && r.scenario === scenario && r.strategy === strategy && r.n === n,
          );
        if (!at(counts[0])) continue;
        row([
          layout === 'root' ? 'all on root' : 'per sub-object',
          scenario,
          strategy,
          ...counts.map((n) => `${at(n).evaluationsPerWrite} · ${t(at(n).medianNs)}`),
        ]);
      }
    }
  }
}

// --- M4 -------------------------------------------------------------------
{
  const { rows, sequential } = load('m4');
  section('M4 — immutable update vs mutation, leaf at depth 3');
  head(['path contains', 'immutable', 'in-place', 'ratio']);
  for (const name of [...new Set(rows.map((r) => r.name))]) {
    const imm = rows.find((r) => r.name === name && r.kind === 'immutable');
    const mut = rows.find((r) => r.name === name && r.kind === 'mutation');
    row([name, t(imm.medianNs), t(mut.medianNs), `${(imm.medianNs / mut.medianNs).toFixed(0)}×`]);
  }
  console.log('');
  head(['1,000 sequential keystrokes', 'total', 'per keystroke']);
  for (const s of sequential) row([s.level, t(s.medianNs), t(s.medianNs / 1000)]);
}

// --- M5 -------------------------------------------------------------------
{
  const { rows } = load('m5');
  section('M5 — picking the active oneOf branch');
  const mechanisms = [...new Set(rows.map((r) => r.mechanism))];
  head(['branches', 'match at', ...mechanisms]);
  for (const k of [...new Set(rows.map((r) => r.k))]) {
    for (const position of ['first', 'middle', 'last']) {
      const rs = rows.filter((r) => r.k === k && r.position === position);
      if (rs.length === 0) continue;
      row([
        `K=${k}`,
        `${position} (#${rs[0].matchAt})`,
        ...mechanisms.map((m) => t(rs.find((r) => r.mechanism === m).medianNs)),
      ]);
    }
  }
}
