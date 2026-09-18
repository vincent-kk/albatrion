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
  '# Fingerprint 전용 writer 실험',
  '',
  `환경: ${processes[0].metadata.node}, V8 ${processes[0].metadata.v8}, ${processes[0].metadata.cpu}. production 기준 ${processes[0].metadata.commit}.`,
  '',
  '5개 독립 process × 30개 batch 평균. 키 생성과 Map 조회 포함 경로를 별도로 측정합니다. cold fixture 생성은 시간 밖입니다. 후보 실행 순서는 회전·반전합니다. trusted는 accessor/symbol/builtin-extra/byte 검사를 생략한 다른 계약이며 합격 후보가 아닙니다. no-byte-scan도 출력 byte 제한이 없어 계약이 다릅니다. direct는 plain object/dense array의 DFS 직접 출력이며 확장 타입·희소 배열·깊이 256 초과 시 BFS compact로 fallback합니다. compact는 참조 발견 목록은 유지하지만 graph token/node 배열 및 JSON.stringify는 사용하지 않습니다.',
  '',
  '기존 stable-warm은 immutable cache hit이며 mutable 재계산과 비교하지 않습니다. stable-cold는 fresh identity입니다. 기존 serializeObject/full-sorted의 타입·순서·참조 의미론은 fingerprint와 다릅니다. cycle/extended의 legacy 결과는 같은 데이터 구분 능력을 제공하지 않으며 비교값을 동등 계약의 승리로 해석하지 않습니다.',
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
  '## 속도 비율',
  '',
  '분자는 후보, 분모는 기존 함수입니다. 1 미만일수록 빠릅니다. 구간은 process별 중앙값 비율의 평균과 95% t CI(df=4)이며 검증 환경 밖으로 일반화하지 않습니다.',
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
      ['direct-strict', 'stable-cold'],
      ['direct-trusted', 'serializeObject'],
      ['direct-strict', 'serializeObject'],
      ['direct-strict', 'full-sorted'],
      ['compact-cache-hit', 'stable-warm'],
      ['legacy-shaped-factory', 'stable-cold'],
      ['legacy-shaped-cold', 'stable-cold'],
      ['legacy-shaped-factory', 'serializeObject'],
      ['legacy-shaped-factory', 'full-sorted'],
      ['legacy-shaped-cache-hit', 'stable-warm'],
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
