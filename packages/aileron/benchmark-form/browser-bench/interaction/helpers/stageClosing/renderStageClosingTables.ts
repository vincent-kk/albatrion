import type { deriveStageClosingResults } from '../deriveStageClosingResults';

/** Render reproducible gate and metric tables, explicitly naming legacy reset's different operation. */
export function renderStageClosingTables(
  data: ReturnType<typeof deriveStageClosingResults>,
) {
  const number = (value: number | null | undefined) =>
    value == null ? '미관측' : value.toFixed(3);
  const lines = [
    '| 규칙 | 판정 |',
    '| --- | --- |',
    ...data.gates.map((gate) => '| ' + gate.id + ' | ' + gate.status + ' |'),
    '',
    '| 행 | lane | 연산 | 지표 | 값 | 첫 연산 |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  for (const row of data.rows)
    for (const [metric, value] of Object.entries(row.metrics))
      lines.push(
        '| ' +
          [
            row.id,
            row.lane,
            row.legacyReset
              ? 'L 버전 증가·트리 재구성(다른 연산)'
              : '등록 연산',
            metric,
            number(value),
            number(row.firstOperation[metric]),
          ].join(' | ') +
          ' |',
      );
  for (const [reference, rows] of Object.entries(data.comparisons)) {
    lines.push(
      '',
      '| 행 | 비교 | 연산 주의 | 지표 | 비율 95% 상한 | 차이 95% 상한(ms) |',
      '| --- | --- | --- | --- | --- | --- |',
    );
    for (const [id, metrics] of Object.entries(rows))
      for (const [metric, bound] of Object.entries(metrics))
        lines.push(
          '| ' +
            [
              id,
              'F/' + reference,
              reference === 'L' && id.startsWith('reset-')
                ? 'L은 버전 증가·트리 재구성(다른 연산)'
                : '동일 등록 연산',
              metric,
              number(bound.upperBound),
              number(bound.differenceUpperBound),
            ].join(' | ') +
            ' |',
        );
  }
  lines.push(
    '',
    'D8: ' + data.probeVerdict,
    '',
    data.rotation.ordinary,
    data.rotation.probe,
  );
  return lines.join('\n') + '\n';
}
