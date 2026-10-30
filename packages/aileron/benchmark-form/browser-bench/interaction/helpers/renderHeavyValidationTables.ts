import type { deriveHeavyValidationResults } from './deriveHeavyValidationResults';

/**
 * Render every numeric IR-2 report table from the same checked derived data.
 * @param data - Raw-derived rows, pairs and D1 rule outcome.
 * @returns Korean Markdown; ratios of row statistics stay distinct from paired medians.
 */
export function renderHeavyValidationTables(
  data: ReturnType<typeof deriveHeavyValidationResults>,
) {
  const lines: string[] = [];
  const number = (value: number | null) =>
    value === null ? '관측 없음' : value.toFixed(3);
  const metric = (value: { median: number | null; p95: number | null }) =>
    `${number(value.median)} / ${number(value.p95)}`;
  for (const id of data.rows
    .map((row) => row.id)
    .filter((id, index, ids) => ids.indexOf(id) === index)) {
    const group = data.rows.filter((row) => row.id === id);
    const legacy = group.find((row) => row.lane === 'L')!;
    const current = group.find((row) => row.lane === 'E1')!;
    lines.push(`### ${id}`, '');
    if (id.startsWith('mount-')) {
      lines.push(
        '| 레인 | eager painted 중앙/p95 | 첫 1초 최장 프레임 | ≥50ms 개수 | DOM eager/all |',
        '| --- | ---: | ---: | ---: | ---: |',
      );
      for (const row of [legacy, current])
        lines.push(
          `| ${row.lane} | ${metric(row.mount.eagerPaintedMs)} | ${!row.frameSupported ? '지원 없음' : row.longestFrame ? number(row.longestFrame) : '<50 (검출 0)'} | ${row.longFrameCount} | ${number(row.mount.eagerNodes.median)} / ${number(row.mount.allNodes.median)} |`,
        );
      lines.push(
        `| E1/L | ${metric({ median: current.mount.eagerPaintedMs.median! / legacy.mount.eagerPaintedMs.median!, p95: current.mount.eagerPaintedMs.p95! / legacy.mount.eagerPaintedMs.p95! })} | ${current.longestFrame && legacy.longestFrame ? number(current.longestFrame / legacy.longestFrame) : '검열로 계산 안 함'} | — | — |`,
        '',
      );
      continue;
    }
    lines.push(
      '| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 | ET 관측 수/표본 |',
      '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    );
    for (const row of [legacy, current])
      lines.push(
        `| ${row.lane} | ${row.eventSupported ? metric(row.processing) : '지원 없음'} | ${row.eventSupported ? metric(row.total) : '지원 없음'} | ${metric(row.handler)} | ${!row.frameSupported ? '지원 없음' : row.longestFrame ? number(row.longestFrame) : '<50 (검출 0)'} | ${row.longFrameCount} | ${metric(row.validation)} | ${row.undelivered}/200 | ${row.processing.observations}/${row.processing.observedSamples} |`,
      );
    const ratios = (
      ['processing', 'total', 'handler', 'validation'] as const
    ).map((key) =>
      metric({
        median:
          current[key].median !== null && legacy[key].median
            ? current[key].median! / legacy[key].median!
            : null,
        p95:
          current[key].p95 !== null && legacy[key].p95
            ? current[key].p95! / legacy[key].p95!
            : null,
      }),
    );
    lines.push(
      `| E1/L | ${ratios[0]} | ${ratios[1]} | ${ratios[2]} | ${current.longestFrame && legacy.longestFrame ? number(current.longestFrame / legacy.longestFrame) : '검열로 계산 안 함'} | — | ${ratios[3]} | — | — |`,
      '',
    );
  }
  lines.push(
    '### 같은 표본 L과 짝 비교',
    '',
    '| 픽스처 | 지표 | E1−L 중앙 ms | E1/L 중앙 | 유효 짝 |',
    '| --- | --- | ---: | ---: | ---: |',
  );
  for (const pair of data.pairs.filter((pair) => pair.lane === 'E1'))
    lines.push(
      `| ${pair.id} | ${pair.metric} | ${number(pair.differenceMedian)} | ${number(pair.ratioMedian)} | ${pair.count}/10 |`,
    );
  lines.push(
    '',
    '### 사전 등록 관문',
    '',
    '| 비연타 행 | E1 처리 p95 | 처리 ≤16.67 | E1 검증 도착 p95 | 도착 ≤33.4 |',
    '| --- | ---: | --- | ---: | --- |',
  );
  for (const gate of data.decision.gates)
    lines.push(
      `| ${gate.id} | ${number(gate.processingP95)} (${gate.processingSource}) | ${gate.processingPass ? 'pass' : 'fail'} | ${number(gate.validationP95)} | ${gate.validationPass ? 'pass' : 'fail'} |`,
    );
  lines.push(
    '',
    `기계적 규칙 결과: D1 ${data.decision.triggered ? '발동' : '미발동'}. ${data.decision.provisional ? '상대 창의 최대 통계이므로 잠정입니다.' : '시작 전 정숙 관찰을 통과한 창입니다.'}`,
    '',
  );
  return lines.join('\n');
}
