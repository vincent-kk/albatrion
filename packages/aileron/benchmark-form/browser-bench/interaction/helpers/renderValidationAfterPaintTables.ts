import type { deriveValidationAfterPaintResults } from './deriveValidationAfterPaintResults';

/** Render raw-derived comparisons, coverage, gates and reported-only rows without rounding decisions. */
export function renderValidationAfterPaintTables(
  data: ReturnType<typeof deriveValidationAfterPaintResults>,
) {
  const number = (value: number | null | undefined) =>
    value == null ? '관측 없음' : value.toFixed(3);
  const ratio = (value: number | null, baseline: number | null) =>
    value === null || baseline === null || baseline === 0
      ? '판정 불가'
      : number(value / baseline);
  const lines = [
    `최대 통계: ${data.provisional ? '잠정(paired relative)' : '정숙 창'}. ET는16ms 문턱으로 검열됩니다. 괄호는 관측 interaction/실제key 수입니다.`,
    '',
    '| 행 | 레인 | processing p95 ms (출처; 관측/key) | duration p95 ms (출처; 관측/key) | arrival p95 ms (배달/key) | 미배달 | first/eager 중앙값 ms (페이지 수) | 최장frame ms / ≥50ms 합 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const row of data.rows)
    lines.push(
      `| ${row.id} | ${row.lane} | ${number(row.processingP95)} (${row.processingSource}; ${row.processing.observations}/${row.keys}) | ${number(row.durationP95)} (${row.durationSource}; ${row.total.observations}/${row.keys}) | ${number(row.validation.p95)} (${row.validation.observations}/${row.keys}) | ${row.undelivered} | ${number(row.firstPaintedMs.median)} / ${number(row.mount.eagerPaintedMs.median)} (${row.count}) | ${number(row.longestFrame)} / ${row.longFrameCount} |`,
    );
  lines.push(
    '',
    '| typing 행 | processing F/E · F/L | duration F/E · F/L | arrival F/E · F/L | bootstrap F/E 단측95%상한 (E·F 관측/key) | 0.16.1 손실 해소(processing/duration/arrival) |',
    '| --- | --- | --- | --- | --- | --- |',
  );
  for (const goal of data.ownerGoals) {
    const row = (lane: string) =>
      data.rows.find((entry) => entry.id === goal.id && entry.lane === lane)!;
    const f = row('F'),
      e = row('E'),
      l = row('L');
    const compare = (name: 'processingP95' | 'durationP95') =>
      `${ratio(f[name], e[name])} · ${ratio(f[name], l[name])}`;
    const answer = (value: boolean | null) =>
      value === null ? '판정 불가' : value ? '예' : '아니요';
    lines.push(
      `| ${goal.id} | ${compare('processingP95')} | ${compare('durationP95')} | ${ratio(f.validation.p95, e.validation.p95)} · ${ratio(f.validation.p95, l.validation.p95)} | ${number(data.bootstrap.rows[goal.id].upperBound)} (${e.processing.observations}/${e.keys} · ${f.processing.observations}/${f.keys}) | ${answer(goal.processing)}/${answer(goal.duration)}/${answer(goal.arrival)} |`,
    );
  }
  lines.push(
    '',
    '| 관문 | 판정 | 기계 계산 근거(반올림 전 원시는 decision.json) |',
    '| --- | --- | --- |',
  );
  for (const gate of data.gates) {
    const details =
      gate.id === 'G2'
        ? '위 typing 표의 각 상한≤1.10; 관측/key 병기'
        : gate.id === 'G6'
          ? data.streams
              .filter((page) => page.lane === 'F')
              .map((page) => ({
                index: page.index,
                durationMs: page.durationMs,
                validationRuns: page.validationRuns,
                limit: 2 + Math.ceil(page.durationMs / 100),
              }))
          : gate.details;
    lines.push(
      `| ${gate.id} | ${gate.status} | ${JSON.stringify(details).split('|').join('\\|')} |`,
    );
  }
  lines.push(
    '',
    '| G8 행 | first F/E | eager E / F ms | eager F/E | eager 상한 | 페이지 E/F |',
    '| --- | --- | --- | --- | --- | --- |',
  );
  for (const id of ['mount-array-1000-none', 'mount-array-1000-validate']) {
    const e = data.rows.find((row) => row.id === id && row.lane === 'E')!;
    const f = data.rows.find((row) => row.id === id && row.lane === 'F')!;
    lines.push(
      `| ${id} | ${ratio(f.firstPaintedMs.median, e.firstPaintedMs.median)} | ${number(e.mount.eagerPaintedMs.median)} / ${number(f.mount.eagerPaintedMs.median)} | ${ratio(f.mount.eagerPaintedMs.median, e.mount.eagerPaintedMs.median)} | ${id.endsWith('-none') ? '1.02' : '1.00'} | ${e.count}/${f.count} |`,
    );
  }
  lines.push(
    '',
    'G7은 없습니다. first-key 입력지연은 보고 전용입니다.',
    '',
    '| first-key 행 | 레인 | input delay 중앙값 / p95 ms | 관측/key |',
    '| --- | --- | --- | --- |',
  );
  for (const row of data.rows.filter((row) => row.id.startsWith('first-key-')))
    lines.push(
      `| ${row.id} | ${row.lane} | ${number(row.inputDelay.median)} / ${number(row.inputDelay.p95)} | ${row.inputDelay.observations}/${row.keys} |`,
    );
  lines.push(
    '',
    '| stream 레인 | 표본 | duration ms | runs | frame script p95 ms |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const stream of data.streams)
    lines.push(
      `| ${stream.lane} | ${stream.index} | ${number(stream.durationMs)} | ${stream.validationRuns} | ${number(stream.scriptP95)} |`,
    );
  return lines.join('\n') + '\n';
}
