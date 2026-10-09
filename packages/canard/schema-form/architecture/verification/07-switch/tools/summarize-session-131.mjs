/** Render one complete Korean session deliverable from validated final fields, including nonjudgment smoke labels. */
export function summarizeSession131(session) {
  const seconds = ms => ((ms ?? 0) / 1000).toFixed(3);
  const reduced = session.report?.rows ? session.report.rows.some(row => row.scope === 'reduced') : session.scoping.some(row => row.scope === 'reduced');
  const totals = Object.fromEntries(['startToReadyMs', 'warmupMs', 'forcedGcMs', 'sampleMs', 'digestMs', 'minorGcMs'].map(name =>
    [name, session.processes.reduce((sum, process) => sum + (process.time?.[name] ?? 0), 0)]));
  const lines = [`# 131 ${session.lane} ${session.recompute ? '원자료 재계산' : '측정 세션'} 결과입니다.`, '',
    ...(session.recompute ? ['이 결과는 기존 원자료만 재계산하였으며 새로운 시간 측정을 하지 않았습니다. 아래 측정 시간은 원 세션의 기록입니다.'] : []),
    `세션 종류는 ${session.kind}이며 실행 상태는 ${session.status}입니다. ${session.smoke ? '이 실행은 smoke이므로 시간 판정을 하지 않습니다.' : '기존 105C-01 계산과 독립 확인 규칙을 적용합니다.'}`,
    `전체 시간은 ${seconds(session.time.totalMs)}초이며 확인 측정은 ${seconds(session.time.confirmMs)}초이고 보고 계산은 ${seconds(session.time.reportMs)}초입니다.`,
    `프로세스 준비 시간의 합은 ${seconds(totals.startToReadyMs)}초이며 예열은 ${seconds(totals.warmupMs)}초, 강제 GC는 ${seconds(totals.forcedGcMs)}초, 표본은 ${seconds(totals.sampleMs)}초, digest는 ${seconds(totals.digestMs)}초입니다.`,
    `시계 밖 minor GC는 ${seconds(totals.minorGcMs)}초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.`,
    '관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.',
    '통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.',
    `축소 행은 ${(session.report?.rows ?? session.scoping).filter(row => row.scope === 'reduced').length}개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.`,
    `최종 판정 필드는 ${session.smoke ? 'SMOKE_NO_VERDICT' : session.report?.decision ?? 'A/A 기록'}입니다.${reduced ? ' 축소 비표시 행은 줄인 검출력에서 관측되지 않음으로 해석합니다.' : ''}`,
    ...(session.preflight ? [`실행 전 추정은 ${seconds(session.preflight.estimate.totalMs)}초이며 확인 여유는 ${seconds(session.preflight.confirmReserveMs)}초이고 합계는 ${seconds(session.preflight.requiredMs)}초입니다. 예산은 ${seconds(session.preflight.budgetMs)}초이며 적합 여부는 ${session.preflight.fits}입니다.`] : []),
    session.estimate?.complete === false ? '모든 fixture의 비용 표본이 없어 전체 세션 시간을 추정할 수 없습니다.'
      : `24블록·예열 20회·표본 41회의 조건부 세션 추정은 ${seconds(session.estimate?.totalMs)}초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.`,
    '', '| 주요 fixture입니다. | 추정 시간(초)입니다. |', '| --- | ---: |',
    ...(session.estimate?.fixtures ?? []).slice(0, 5).map(item => `| ${item.fixture} | ${seconds(item.totalMs)} |`),
    ...(session.report?.method?.interval ? ['', `구간 방법은 ${session.report.method.interval}입니다.`] : []),
    ...(session.report?.method?.rowDependence ? [session.report.method.rowDependence] : []),
    ...(session.report?.aaSummary?.bands ? ['', '| A/A 집합입니다. | 0 제외/판정 행입니다. | 99% 이항 범위입니다. | 범위 안입니다. |', '| --- | ---: | --- | --- |',
      ...['reduced', 'full', 'total'].map(name => { const group = session.report.aaSummary.bands[name];
        return `| ${name} | ${group.excluded}/${group.rows} | ${group.band.low}~${group.band.high} | ${group.inside} |`; }),
      `세 범위가 모두 안에 있고 유한한 구간이 있을 때만 A/A를 통과하며 결과는 ${session.report.aaSummary.passed}입니다.`] : []),
    ...(session.report?.swapped ? ['', '교환 통과의 A/A 집합도 각각 검사합니다.',
      ...['reduced', 'full', 'total'].map(name => { const group = session.report.swapped.aaSummary.bands[name];
        return `${name}의 교환 결과는 ${group.excluded}/${group.rows}이며 범위는 ${group.band.low}~${group.band.high}이고 적합 여부는 ${group.inside}입니다.`; }),
      session.report.swapInterpretation] : []),
    ...(session.report?.mergedRows?.length ? ['', `쓰기가 한 번인 동일 표본의 ${session.report.mergedRows.length}쌍을 각각 한 행으로 합쳤습니다.`] : []),
    '', '행별 통계와 GC 관측을 함께 기록합니다.', '',
    '| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |',
    '| --- | --- | ---: | ---: | --- | ---: | --- | --- |'];
  if (session.report?.swapped) {
    lines[lines.length - 2] += ' 교환 중앙값입니다. | 교환 구간입니다. | 부호 비교입니다. |';
    lines[lines.length - 1] += ' ---: | --- | --- |';
  }
  for (const row of session.report?.rows ?? []) {
    const gc = role => row.gcObservation?.[role];
    const fraction = role => gc(role)?.writeWindowGcFraction ?? null;
    const median = role => gc(role)?.gcFreeMedian ?? null;
    const key = row.mergedKeys?.length > 1 ? row.mergedKeys.join('<br>') : row.key;
    const swapped = row.swapStatistic ? ` ${row.swapStatistic.median} | ${row.swapStatistic.low}~${row.swapStatistic.high} | ${row.swapComparison} |` : '';
    lines.push(`| ${key} | ${row.scope ?? 'full'} | ${row.blocks} | ${row.confirmBlocks ?? 'null'} | ${row.observation131} | ${row.statistic.median} | ${fraction('base')} / ${fraction('candidate')} | ${median('base')} / ${median('candidate')} |${swapped}`);
  }
  if (session.error) lines.push('', `실패 사유는 ${session.error}입니다.`);
  return lines.join('\n') + '\n';
}
