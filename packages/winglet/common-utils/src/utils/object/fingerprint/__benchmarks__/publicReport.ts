import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

/** Aggregates the five public.ts runs without mixing prototype measurements. */
const directory = '.seiri/tasks/fingerprint-public';
const runs = Array.from({ length: 5 }, (_, i) =>
  JSON.parse(readFileSync(directory + '/process-' + i + '.json', 'utf8')),
);
const hashes = JSON.stringify(runs[0].metadata.sourceHashes);
for (const run of runs)
  assert.equal(JSON.stringify(run.metadata.sourceHashes), hashes);
const median = (values: number[]) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const groups = new Map<string, any[]>();
for (const run of runs)
  for (const row of run.rows) {
    const key = row.fixture + '/' + row.phase + '/' + row.name;
    const items = groups.get(key) ?? [];
    items.push({ ...row, process: run.metadata.processId });
    groups.set(key, items);
  }
const summary: Record<string, any> = {};
for (const [name, rows] of groups) {
  assert.equal(rows.length, 150);
  const samples = rows.map((r) => r.us).sort((a, b) => a - b);
  summary[name] = {
    median: median(samples),
    p95: samples[Math.floor(samples.length * 0.95)],
    bytes: rows[0].bytes,
    samples: rows.length,
    medians: runs.map((run) =>
      median(
        rows
          .filter((r) => r.process === run.metadata.processId)
          .map((r) => r.us),
      ),
    ),
  };
}
const ratios: any[] = [];
for (const fixture of [
  'small',
  'wide',
  'schema',
  'dense',
  'sparse',
  'deep',
  'cycle',
  'dag',
  'tree',
  'extended',
  'escaping',
])
  for (const phase of ['generate', 'lookup'])
    for (const [next, previous] of [
      ['fast', 'legacy-fast'],
      ['sorted', 'legacy-sorted'],
      ['safe-cold', 'legacy-safe-cold'],
      ['safe-unsorted-cold', 'legacy-safe-cold'],
      ['safe-cache-hit', 'legacy-cache-hit'],
      ['fast-omit-large', 'legacy-fast-omit-large'],
    ]) {
      const first = summary[fixture + '/' + phase + '/' + next],
        second = summary[fixture + '/' + phase + '/' + previous];
      if (!first || !second) continue;
      const values = first.medians.map(
        (v: number, i: number) => v / second.medians[i],
      );
      const mean = values.reduce((a: number, b: number) => a + b) / 5;
      const variance =
        values.reduce((a: number, b: number) => a + (b - mean) ** 2, 0) / 4;
      const margin = 2.776 * Math.sqrt(variance / 5);
      ratios.push({
        fixture,
        phase,
        next,
        previous,
        mean,
        ci95: [Math.max(0, mean - margin), mean + margin],
      });
    }
const lines = [
  '# Public fingerprint function performance by purpose',
  '',
  'Environment: ' +
    runs[0].metadata.node +
    ', V8 ' +
    runs[0].metadata.v8 +
    ', ' +
    runs[0].metadata.cpu +
    '.',
  '',
  '5 independent processes × 30 batch means. Table p50/p95 values describe the distribution of batch means, not per-request latency. Cold measurements use fresh identities with creation cost outside timing. Execution order is rotated and reversed; output lengths and lookup results are consumed. Metadata preserves the SHA-256 of the source actually measured.',
  '',
  'fast, sorted, safe+sort, safe-no-sort and factory paths are measured separately. Map/Set use opaque identity in safe, so comparisons with graph-content equality do not represent competition under equivalent contracts. Cache hits assume immutability.',
  'Short batches in this mixed harness alone do not establish a regression in the cache-hit function itself. Long-batch comparisons with sufficient warm-up are run separately using cacheHit.ts.',
  '',
  '| fixture/phase/API | p50 µs | p95 µs | bytes | samples |',
  '| --- | ---: | ---: | ---: | ---: |',
];
for (const [name, row] of Object.entries(summary))
  lines.push(
    '| ' +
      name +
      ' | ' +
      row.median.toFixed(3) +
      ' | ' +
      row.p95.toFixed(3) +
      ' | ' +
      (row.bytes ?? 'N/A') +
      ' | ' +
      row.samples +
      ' |',
  );
lines.push(
  '',
  '## Corresponding API ratios',
  '',
  'Values show the mean new/existing process-median ratio and a 95% t CI(df=4). Values below 1 mean faster execution. They do not automatically establish no regressions across all workloads.',
  '',
  '| fixture/phase | new / old | ratio [95% CI] |',
  '| --- | --- | --- |',
);
for (const r of ratios)
  lines.push(
    '| ' +
      r.fixture +
      '/' +
      r.phase +
      ' | ' +
      r.next +
      ' / ' +
      r.previous +
      ' | ' +
      r.mean.toFixed(3) +
      ' [' +
      r.ci95.map((v: number) => v.toFixed(3)).join(', ') +
      '] |',
  );
writeFileSync(
  directory + '/summary.json',
  JSON.stringify({ summary, ratios }, null, 2),
);
writeFileSync(directory + '/report.md', lines.join('\n') + '\n');
console.log(
  'FINGERPRINT_PUBLIC_REPORT',
  groups.size,
  runs.reduce((n, r) => n + r.rows.length, 0),
);
