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
  '# 직렬화 성능 보고서',
  '',
  `환경: ${results[0].metadata.node}, V8 ${results[0].metadata.v8}, ${results[0].metadata.cpu}, ${results[0].metadata.os}. 기준 commit ${results[0].metadata.commit}; 측정 대상은 이 작업의 미커밋 source입니다.`,
  '',
  '독립 프로세스 5개 × 후보당 30 samples. p50/p95는 batch 평균의 분포이며 요청별 latency percentile이 아닙니다. 95% CI는 프로세스별 중앙값 평균의 t 구간입니다. fixture 생성과 factory-first 생성은 측정 밖이며 setupMs를 raw에 기록합니다. 출력 checksum, fixture SHA-256, 옵션 이름, dependency 버전, peak RSS 및 별도 GC 메모리 관측은 process-*.json에 있습니다.',
  '',
  'native는 일반 JSON 비용 기준입니다. graph와 key는 타입·참조·정렬·검증 비용이 있으므로 다른 계약 간 숫자를 우열 순위로 해석하지 않습니다. flatted/ungap은 검증된 지원 subset에서만 측정했습니다. devalue는 미설치로 N/A입니다. native-normalized-key는 동일 내부 정규화를 사용하는 비용 분해 기준이며 독립 경쟁 구현이 아닙니다.',
  '',
  'Chromium/Firefox/WebKit 및 V8 13.8 이상 별도 실행 환경은 이 측정에 구성하지 않아 미측정입니다. 해당 엔진의 성능 우위는 주장하지 않습니다.',
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
  '## 밀집 배열 선택',
  '',
  '공개 v1은 기본 array entry 형식을 유지합니다. dense 실험은 동일 traversal 뒤 wire를 압축하고 canonical validator로 되돌리는 adapter prototype입니다. encode/parse/왕복 및 bytes를 측정했으나 전용 최적화 decoder가 아니므로 가능한 최적 dense 구현의 성능을 대표하지 않습니다. 10% 개선·95% 신뢰·전체 fixture 무회귀 기준을 입증하지 못한 후보는 채택하지 않습니다. 이 측정으로 dense 자체가 느리다고 일반화하지 않습니다. 실험 코드는 benchmark에만 존재하며 공개 API에는 포함되지 않습니다.',
  '',
  '## 자원 및 메모리',
  '',
  'limit fixture는 hole 1,000,000개이며 encoder/decoder 왕복이 성공했습니다. 누적 1,200,000 wire는 복원 전에 TypeError로 거부합니다. 이 기본 한도는 무한 확장을 방지하지만 dense 1,000,000개 값의 비용을 보장하는 SLO는 아닙니다. raw 메모리는 같은 프로세스에서 explicit GC 뒤 한 번의 작업을 관측한 heap/RSS 변화이며 allocator 잡음이 포함됩니다.',
  '',
  '성공 경로와 reject-* 오류 경로를 분리했습니다. 지원하지 않는 native 확장 graph는 N/A이며 0 ops로 처리하지 않았습니다. 구형 API의 출력은 graph/key 계약과 다릅니다. factory-immutable-hit은 깊은 불변성 전제의 cache 비용입니다.',
  '',
);
lines.push(
  '',
  '## omit 인덱스 실험',
  '',
  '자동 Set 전환(목록 32개 이상, 현재 객체 속성 32개 이상)은 기각했습니다. wide/large omit의 process median 비율 0.464 (95% CI 0.445–0.484), dense/large는 0.672 (0.645–0.699)로 개선됐으나 cycle/factory-omit-changing에서 1.167의 sample median 비율, process ratio CI 1.085–1.200이 관측되어 전체 경로 10% 무회귀 기준을 만족하지 못했습니다. 원인을 자동 인덱스의 직접 실행 비용으로 단정하지 않으며 engine/JIT 및 측정 변동 가능성을 포함합니다. baseline-omit과 omit-index-experiment의 raw를 보존했습니다. 최종 구현은 작은 목록에 직접 배열 검색을 쓰고 전달받은 ReadonlySet은 재사용합니다. graph/key-omit-reused-set은 동일 128개 목록을 미리 인덱싱한 비용이며 omit-index-build에 생성 비용을 별도로 기록합니다. 단발 호출에는 인덱스 생성 비용도 합산해야 합니다.',
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
  `신규 ESM 모듈 전체 합산: raw ${bundle.length} bytes / gzip ${gzipSync(bundle).length} bytes. 소비자 tree-shaking 번들 증가량과는 다르며 비교용 모듈 비용입니다.`,
);
writeFileSync(`${directory}/summary.json`, JSON.stringify(summary, null, 2));
writeFileSync(`${directory}/report.md`, lines.join('\n') + '\n');
console.log(
  `SERIALIZATION_REPORT_OK groups=${groups.size} processes=${results.length}`,
);
