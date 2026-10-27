// Invoked by Node CLI after one formal window; asserts the raw protocol before emitting summary tables.
import fs from 'node:fs';
import path from 'node:path';

import { summarizeLedger } from './summarizeLedger.mjs';

const runDir = process.argv[2];
const pair = JSON.parse(
  fs.readFileSync(path.join(runDir, 'pair/results.json')),
);
const ledger = JSON.parse(
  fs.readFileSync(path.join(runDir, 'stages/results.json')),
);
const summary = summarizeLedger(pair, ledger);
const f = (value) => (value === null ? '해당 없음' : value.toFixed(3));
const text = [
  '## 같은 프로세스 쌍',
  '',
  '값은 쓰기 2회(왕복 1회) 합계와 쓰기당 환산입니다. 형제 0은 기존 장치대로 쓰기 1회입니다. 단위 µs.',
  '',
  '| 행 | 쓰기 수 | 0.16.1 합계 / 쓰기당 | 단계 시작 합계 / 쓰기당 | S÷L | S÷active80 | L 폭/쓰기 | S 폭/쓰기 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...summary.pairRows.map(
    (r) =>
      `| ${r.id} | ${r.writes} | ${r.legacyUs === null ? '해당 없음' : `${f(r.legacyUs * r.writes)} / ${f(r.legacyUs)}`} | ${f(r.currentUs * r.writes)} / ${f(r.currentUs)} | ${f(r.ratio)} | ${f(r.relativeToActive)} | ${f(r.legacyWidthUs)} | ${f(r.currentWidthUs)} |`,
  ),
  '',
  '## 세 항 분해',
  '',
  '단위는 µs/쓰기, slope는 µs/쓰기/분기입니다. 각 회귀는 다섯 점의 최소제곱이며 목표선을 제안하지 않습니다.',
  '',
  '| 항 | 0.16.1 | 단계 시작 판 |',
  '| --- | ---: | ---: |',
  ...[
    ['회귀 floor', 'floorUs'],
    ['회귀 slope', 'slopeUs'],
    ['Δ: payload12 − payload3', 'deltaUs'],
    ['형제 0 최소 폼', 'smallestUs'],
  ].map(
    ([label, key]) =>
      `| ${label} | ${f(summary.terms.legacy[key])} | ${f(summary.terms.current[key])} |`,
  ),
  '',
  '| 분기 N | L 실측 | L 적합 | L 잔차 | S 실측 | S 적합 | S 잔차 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...summary.terms.legacy.residuals.map((p, i) => {
    const q = summary.terms.current.residuals[i];
    return `| ${p.n} | ${f(p.actualUs)} | ${f(p.fittedUs)} | ${f(p.residualUs)} | ${f(q.actualUs)} | ${f(q.fittedUs)} | ${f(q.residualUs)} |`;
  }),
  '',
  '## 계측 오버헤드',
  '',
  '모두 scratch esbuild 판의 µs/쓰기입니다. 총합은 실행별 최소값의 중앙값, 단계 기준 중앙값은 실행별 중앙값의 중앙값입니다.',
  '',
  '| 행 | 무계측 최소 중앙 | 계측 최소 중앙 | 차이 | 계측/무계측 | 계측 중앙의 중앙 |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...summary.stages.map(
    (r) =>
      `| ${r.row} | ${f(r.unwrappedUs)} | ${f(r.wrappedUs)} | ${f(r.overheadUs)} | ${f(r.overheadRatio)} | ${f(r.wrappedMedianUs)} |`,
  ),
];
for (const row of summary.stages) {
  text.push(
    '',
    `## 정착 단계: ${row.row}`,
    '',
    'µs/쓰기, 같은 최상위 단계에 속한 self를 먼저 합한 뒤 실행별 중앙값의 중앙값을 계산했습니다. 재귀·하위 함수는 그 최상위 단계 안에만 포함됩니다.',
    '',
    '| 정착 단계 | 총 µs | 하위 self µs |',
    '| --- | ---: | --- |',
    ...row.phaseRows.map(
      (p) =>
        `| ${p.phase} | ${f(p.totalUs)} | ${p.parts.map((s) => `${s.name}=${f(s.selfUs)}`).join(', ')} |`,
    ),
  );
  text.push(
    '',
    `## 단계 장부: ${row.row}`,
    '',
    '시간은 µs/쓰기입니다. self는 겹치지 않는 시간, inclusive는 하위 단계 포함 시간입니다. 각 셀은 실행별 중앙값의 중앙값이며 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.',
    '',
    '| 단계 | self µs | inclusive µs | 호출/쓰기 | 할당 B/쓰기 | 할당 표본 수(3실행) |',
    '| --- | ---: | ---: | ---: | ---: | --- |',
    ...row.stageRows.map(
      (s) =>
        `| ${s.name} | ${f(s.selfUs)} | ${f(s.inclusiveUs)} | ${f(s.calls)} | ${f(s.bytes)} | ${s.sampleCounts.join(' / ')} |`,
    ),
  );
}
fs.writeFileSync(
  path.join(runDir, 'summary.json'),
  JSON.stringify(summary, null, 2),
);
fs.writeFileSync(path.join(runDir, 'tables.md'), `${text.join('\n')}\n`);
console.log(
  `B0_ARTIFACTS_OK pair=30 stage=18 samples=100 warmups=20 runs=3 ${runDir}`,
);
