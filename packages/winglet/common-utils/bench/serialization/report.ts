import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

/** Loaded by tsx after five independent raw sample processes have finished. */
const directory =
  'packages/winglet/common-utils/bench/.results/serialization-consolidation-prefix';
const results = Array.from({ length: 5 }, (_, i) =>
  JSON.parse(readFileSync(`${directory}/process-${i}.json`, 'utf8')),
);
const groups = new Map<string, any[]>();
for (const result of results)
  for (const row of result.rows) {
    const name = `${row.fixture}/${row.name}`;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push({ ...row, process: result.metadata.processId });
  }

/** Returns an order statistic over batch-average latency samples. */
function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[
    Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))
  ];
}

/** Summarizes variation across five independent process medians (Student t, df=4). */
function summarize(rows: any[]): any {
  const medians = results.map((result) =>
    percentile(
      rows
        .filter((row) => row.process === result.metadata.processId)
        .map((row) => row.us),
      0.5,
    ),
  );
  const mean = medians.reduce((sum, value) => sum + value, 0) / 5;
  const variance =
    medians.reduce((sum, value) => sum + (value - mean) ** 2, 0) / 4;
  const margin = 2.776 * Math.sqrt(variance / 5);
  return {
    median: percentile(
      rows.map((row) => row.us),
      0.5,
    ),
    p95: percentile(
      rows.map((row) => row.us),
      0.95,
    ),
    processMedianMean: mean,
    ci95: [Math.max(0, mean - margin), mean + margin],
    variance,
    samples: rows.length,
    bytes: rows[0].outputBytes,
    setupMs: rows.reduce((sum, row) => sum + row.setupMs, 0),
  };
}

const summary = Object.fromEntries(
  [...groups].map(([name, rows]) => [name, summarize(rows)]),
);
const lines = [
  '# Serialization performance report',
  '',
  `Environment: ${results[0].metadata.node}, V8 ${results[0].metadata.v8}, ${results[0].metadata.cpu}, ${results[0].metadata.os}. Baseline commit ${results[0].metadata.commit}; measurements use the uncommitted source for this task.`,
  '',
  '5 independent processes × 30 samples per candidate. p50/p95 describe the distribution of batch means, not per-request latency percentiles. The 95% CI is a t interval for the mean of process medians. Fixture creation and factory-first creation are outside timing; setupMs is recorded in the raw data. Output checksums, fixture SHA-256, option names, dependency versions, peak RSS and separate GC memory observations are in process-*.json.',
  '',
  'native is the ordinary JSON cost baseline. graph and key include type, reference, sorting and validation costs; numbers across different contracts do not establish a ranking. flatted/ungap were measured only on their verified supported subsets. devalue is N/A because it is not installed. native-normalized-key uses the same internal normalization as a cost-breakdown baseline, not an independent competing implementation.',
  '',
  'Chromium/Firefox/WebKit and a separate environment for V8 13.8 or later were not configured for this measurement and remain unmeasured. No performance advantage on those engines is claimed.',
  '',
  '| fixture/API | p50 µs | p95 µs | ops/s (p50) | 95% CI µs | samples | output bytes |',
  '| --- | ---: | ---: | ---: | --- | ---: | ---: |',
];
for (const [name, row] of Object.entries(summary))
  lines.push(
    `| ${name} | ${row.median.toFixed(3)} | ${row.p95.toFixed(3)} | ${Math.round(1e6 / row.median)} | ${row.ci95.map((x: number) => x.toFixed(3)).join('–')} | ${row.samples} | ${row.bytes ?? 'N/A'} |`,
  );
lines.push(
  '',
  '## Dense array selection',
  '',
  'Public v1 retains the default array entry format. The dense experiment is an adapter prototype that compresses the wire after the same traversal and converts it back for the canonical validator. Encode/parse/round-trip time and bytes were measured, but this is not a dedicated optimized decoder and does not represent the best possible dense implementation. Candidates must demonstrate a 10% improvement, 95% confidence and no regressions across all fixtures to be adopted. This measurement does not establish that dense formats are inherently slower. Experimental code exists only in benchmarks and is excluded from the public API.',
  '',
  '## Resources and memory',
  '',
  'The limit fixture has 1,000,000 holes and completed an encoder/decoder round trip. A wire with a cumulative count of 1,200,000 is rejected with TypeError before reconstruction. This default limit prevents unbounded expansion but is not an SLO guaranteeing the cost of 1,000,000 dense values. Raw memory observations are heap/RSS changes for one operation after explicit GC in the same process and include allocator noise.',
  '',
  'Success paths and reject-* error paths are reported separately. Unsupported native extended graphs are N/A, not 0 ops. Legacy API output differs from the graph/key contracts. factory-immutable-hit measures cache cost under a deep-immutability assumption.',
  '',
);
lines.push(
  '',
  '## Omit index experiment',
  '',
  'Automatic Set conversion (at least 32 list entries and at least 32 properties on the current object) was rejected. wide/large omit improved to a process-median ratio of 0.464 (95% CI 0.445–0.484), and dense/large to 0.672 (0.645–0.699), but cycle/factory-omit-changing had a sample-median ratio of 1.167 and a process-ratio CI of 1.085–1.200, failing the 10% no-regression criterion across all paths. The cause is not attributed solely to direct automatic-index execution cost; engine/JIT and measurement variation remain possible factors. Raw baseline-omit and omit-index-experiment data are preserved. The final implementation searches small arrays directly and reuses a supplied ReadonlySet. graph/key-omit-reused-set measures the same pre-indexed 128-entry list; omit-index-build records construction cost separately. One-off calls must include index construction cost.',
  '',
);
for (const result of results)
  lines.push(
    `- process ${result.metadata.processId}: peak RSS ${result.metadata.peakRssKiB} KiB; checksum ${result.metadata.checksum}; explicit GC ${result.memory.every((row: any) => row.explicitGC)}`,
  );
const files: string[] = [];
const walk = (path: string) => {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = `${path}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (full.endsWith('.mjs')) files.push(full);
  }
};
for (const name of ['serialization'])
  walk(`packages/winglet/common-utils/dist/utils/object/${name}`);
const bundle = Buffer.concat(files.map((file) => readFileSync(file)));
lines.push(
  '',
  `Total across new ESM modules: raw ${bundle.length} bytes / gzip ${gzipSync(bundle).length} bytes. This is module cost for comparison, not the increase in a consumer bundle after tree shaking.`,
);
writeFileSync(`${directory}/summary.json`, JSON.stringify(summary, null, 2));
writeFileSync(`${directory}/report.md`, lines.join('\n') + '\n');
console.log(
  `SERIALIZATION_REPORT_OK groups=${groups.size} processes=${results.length}`,
);
