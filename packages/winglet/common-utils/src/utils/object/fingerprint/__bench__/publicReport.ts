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
  '# 목적별 fingerprint 공개 함수 성능',
  '',
  '환경: ' +
    runs[0].metadata.node +
    ', V8 ' +
    runs[0].metadata.v8 +
    ', ' +
    runs[0].metadata.cpu +
    '.',
  '',
  '5개 독립 process × 30 batch 평균. 표의 p50/p95는 요청별 지연이 아닌 batch 평균 분포입니다. 최초 계산은 기존/신규 모두 fresh identity이며 생성 비용은 timing 밖입니다. 순서를 회전·반전하고 출력 길이 및 lookup 결과를 소비합니다. 메타데이터에 실제 측정한 source SHA-256을 보존합니다.',
  '',
  'fast는 serializeObject, sorted는 full-sorted, safe+sort는 stableSerialize 최초 계산/캐시 적중과 각각 비교합니다. safe-no-sort는 정렬을 생략하는 다른 옵션입니다. graph-key-baseline은 삭제된 graph 기반 fingerprint의 과거 측정입니다. Map/Set은 새 safe에서 opaque identity이므로 graph 내용 비교와 동등 계약의 경쟁으로 해석하지 않습니다. 캐시 적중은 immutable 전제입니다.',
  '캐시 적중은 이 혼합 harness의 짧은 배치만으로 함수 자체의 회귀를 판정하지 않습니다. 충분히 warm-up한 장기 배치 비교는 cacheHit.ts로 별도 실행합니다. graph-key-baseline은 구형 모듈 삭제 전 원자료에만 존재합니다.',
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
  '## 대응 API 비율',
  '',
  '신규/기존의 process 중앙값 비율 평균과 95% t CI(df=4)입니다. 1보다 작을수록 빠릅니다. 모든 workload의 무회귀를 자동으로 주장하지 않습니다.',
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
