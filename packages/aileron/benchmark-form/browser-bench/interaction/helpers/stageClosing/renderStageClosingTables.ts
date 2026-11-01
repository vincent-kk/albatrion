import type { deriveStageClosingResults } from '../deriveStageClosingResults';

/** Render reproducible gate and metric tables, explicitly naming legacy reset's different operation. */
export function renderStageClosingTables(
  data: ReturnType<typeof deriveStageClosingResults>,
) {
  const number = (value: number | string | null | undefined) =>
    value == null
      ? '미관측'
      : typeof value === 'string'
        ? value
        : value.toFixed(3);
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
    'Validator work rule: ' + data.validatorWork.status,
    '',
    '| 행 | lane | 연산 주의 | 단위 수 | compile 평균 | validate 평균 | setup compile | setup validate | late compile | late validate | unattributed | 긴 프레임 연산 비율 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  );
  for (const row of data.validatorWork.rows)
    lines.push(
      '| ' +
        [
          row.id,
          row.lane,
          row.lane === 'L' && row.id.startsWith('reset-')
            ? 'L 버전 증가·트리 재구성(다른 연산)'
            : '등록 연산',
          row.units,
          number(row.compileMean),
          number(row.validateMean),
          row.setupCompileCalls,
          row.setupValidateCalls,
          row.lateCompileCalls,
          row.lateValidateCalls,
          row.unattributed,
          number(row.longFrameFraction),
        ].join(' | ') +
        ' |',
    );
  lines.push(
    '',
    'D8: ' + data.d8.status + ' — ' + data.d8.reason,
    '',
    '| 행 | lane | 1번 | 2번 | 3번 | 4번 |',
    '| --- | --- | --- | --- | --- | --- |',
  );
  for (const [id, lanes] of Object.entries(data.rotation))
    for (const [lane, counts] of Object.entries(lanes))
      lines.push('| ' + [id, lane, ...counts].join(' | ') + ' |');
  return lines.join('\n') + '\n';
}
