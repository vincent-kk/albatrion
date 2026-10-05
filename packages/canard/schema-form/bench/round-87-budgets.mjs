// Derive design ceilings from committed measurements without rewriting the source evidence.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../architecture/verification/07-switch');
const quantile = (values, q) => values.sort((a, b) => a - b)[Math.ceil(values.length * q) - 1];
const metric = values => ({ median: quantile([...values], .5), p99: quantile([...values], .99) });
const rows = [];
for (const layer of ['core', 'render']) {
  const tracedName = `86c02-final-${layer}-traced${layer === 'render' ? '-production' : ''}-summary.json`;
  const plainName = `86c02-final-${layer}-plain${layer === 'render' ? '-production' : ''}.json`;
  const traced = JSON.parse(fs.readFileSync(path.join(out, tracedName)));
  const plain = JSON.parse(fs.readFileSync(path.join(out, plainName)));
  for (const row of traced.rows) {
    if (row.version !== 'new') continue;
    const match = r => r.fixture === row.fixture && r.validation === row.validation && r.mode === row.mode;
    const gateData = layer === 'core' ? traced : plain;
    const before = gateData.rows.find(r => match(r) && r.version === 'old');
    const after = gateData.rows.find(r => match(r) && r.version === 'new');
    const measurement = layer === 'core' ? 'active' : 'profiler';
    const target = layer === 'core' ? 1.5 : row.mode === 'mount' ? 1.2 : 1;
    const phaseCalls = row.phaseCalls;
    const sites = row.sites;
    const branchless = !/oneOf|if-then/.test(row.fixture);
    const initial = row.mode === 'mount' && branchless && row.fixture !== 'computed-visible-derived';
    rows.push({ layer, fixture: row.fixture, validation: row.validation, mode: row.mode,
      source: tracedName, targetMetric: measurement,
      gap: layer === 'core' && row.validation === 'on' ? null :
        Math.max(0, after[measurement].median - before[measurement].median * target),
      analysisCeiling: row.mode === 'mount' && branchless ? row.phases.analysis.median : 0,
      firstLoadCeiling: initial ? row.firstLoad.median : 0,
      phases: row.phases, phaseCalls, sites });
  }
  const ajv = row => row.ajv.median;
  for (const row of traced.rows) {
    if (row.version !== 'new' || row.validation !== 'on') continue;
    const residual = version => {
      const on = traced.rows.find(r => r.fixture === row.fixture && r.mode === row.mode && r.version === version && r.validation === 'on');
      const off = traced.rows.find(r => r.fixture === row.fixture && r.mode === row.mode && r.version === version && r.validation === 'off');
      return on.active.median - off.active.median - (ajv(on) - ajv(off));
    };
    rows.push({ layer, fixture: row.fixture, validation: 'non-AJV residual', mode: row.mode,
      gap: Math.max(0, residual('new') - 1.5 * Math.max(0, residual('old'))),
      analysisCeiling: 0, firstLoadCeiling: 0, source: tracedName });
  }
}
const artifact = { units: 'ms', caution: 'Exclusive phase medians are loose ceilings, not achievable savings; never subtract traced ceilings from an untraced target gap.', rows };
const text = JSON.stringify(artifact);
assert(Buffer.byteLength(text) < 5_000_000);
if (!process.argv.includes('--table'))
  fs.writeFileSync(path.join(out, 'round-87-phase-summary.json'), text + '\n', { flag: 'wx' });
console.log('| 층 | 행 | 검증 | 작업 | 85C-01 간극 ms | 분석 상한 A ms | 첫 로드 상한 S ms |');
console.log('| --- | --- | --- | --- | ---: | ---: | ---: |');
for (const row of rows)
  console.log(`| ${row.layer} | ${row.fixture} | ${row.validation} | ${row.mode} | ${row.gap === null ? '기록만' : row.gap.toFixed(4)} | ${row.analysisCeiling.toFixed(4)} | ${row.firstLoadCeiling.toFixed(4)} |`);
