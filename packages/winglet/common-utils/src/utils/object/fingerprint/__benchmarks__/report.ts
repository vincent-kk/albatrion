import { readFileSync, writeFileSync } from 'node:fs';

const directory = '.seiri/tasks/fingerprint-performance';
const processes = Array.from({ length: 5 }, (_, index) =>
  JSON.parse(readFileSync(`${directory}/process-${index}.json`, 'utf8')),
);
const median = (values: number[]) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const groups = new Map<string, any[]>();
for (const p of processes)
  for (const row of p.rows) {
    const key = `${row.fixture}/${row.mode}/${row.name}`;
    const list = groups.get(key) ?? [];
    list.push({ ...row, process: p.metadata.processId });
    groups.set(key, list);
  }
const summary: Record<string, any> = {};
for (const [key, rows] of groups) {
  const medians = processes.map((p) =>
    median(
      rows.filter((r) => r.process === p.metadata.processId).map((r) => r.us),
    ),
  );
  summary[key] = {
    median: median(rows.map((r) => r.us)),
    processMedians: medians,
    bytes: rows[0].bytes,
    samples: rows.length,
  };
}
const ratio = (first: any, second: any) => {
  const ratios = first.processMedians.map(
    (v: number, i: number) => v / second.processMedians[i],
  );
  const mean = ratios.reduce((a: number, b: number) => a + b) / ratios.length;
  const variance =
    ratios.reduce((a: number, b: number) => a + (b - mean) ** 2, 0) / 4;
  const margin = 2.776 * Math.sqrt(variance / 5);
  return `${mean.toFixed(3)} [${Math.max(0, mean - margin).toFixed(3)}, ${(mean + margin).toFixed(3)}]`;
};
const lines = [
  '# Dedicated fingerprint writer experiment',
  '',
  `Environment: ${processes[0].metadata.node}, V8 ${processes[0].metadata.v8}, ${processes[0].metadata.cpu}. Production baseline ${processes[0].metadata.commit}.`,
  '',
  '5 independent processes × 30 batch means. Key generation and paths including Map lookups are measured separately. Cold fixture creation is outside timing. Candidate order is rotated and reversed. trusted skips accessor/symbol/builtin-extra/byte checks, has a different contract and is not an eligible candidate. no-byte-scan also has a different contract because it has no output byte limit. direct emits plain objects/dense arrays directly using DFS and falls back to BFS compact for extended types, sparse arrays or depth exceeding 256. compact retains a reference-discovery list but uses neither graph token/node arrays nor JSON.stringify.',
  '',
  'The legacy-shaped candidate is a benchmark-only baseline implementation. Its cycle/extended results do not provide the same data discrimination; comparisons do not establish a win under an equivalent contract.',
  '',
  '| fixture/mode/API | p50 µs | output bytes | samples |',
  '| --- | ---: | ---: | ---: |',
];
for (const [key, value] of Object.entries(summary))
  lines.push(
    `| ${key} | ${value.median.toFixed(3)} | ${value.bytes} | ${value.samples} |`,
  );
lines.push(
  '',
  '## Speed ratios',
  '',
  'The numerator is the candidate and the denominator is the existing function. Values below 1 mean faster execution. Intervals show the mean of per-process median ratios and a 95% t CI(df=4); results are not generalized beyond the verified environment.',
  '',
  '| fixture/mode | candidate / baseline | ratio [95% CI] |',
  '| --- | --- | --- |',
);
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
])
  for (const mode of ['generate', 'lookup']) {
    for (const [candidate, baseline] of [
      ['compact-strict', 'current'],
      ['direct-strict', 'current'],
      ['direct-strict', 'legacy-shaped-cold'],
      ['compact-cache-hit', 'legacy-shaped-cache-hit'],
      ['legacy-shaped-factory', 'legacy-shaped-cold'],
      ['hash32-checked', 'current'],
    ]) {
      const first = summary[`${fixture}/${mode}/${candidate}`],
        second = summary[`${fixture}/${mode}/${baseline}`];
      if (first && second)
        lines.push(
          `| ${fixture}/${mode} | ${candidate} / ${baseline} | ${ratio(first, second)} |`,
        );
    }
  }
writeFileSync(`${directory}/summary.json`, JSON.stringify(summary, null, 2));
writeFileSync(`${directory}/measurements.md`, lines.join('\n') + '\n');
console.log(
  `FINGERPRINT_REVIEW_REPORT groups=${groups.size} samples=${processes.reduce((sum, p) => sum + p.rows.length, 0)}`,
);
