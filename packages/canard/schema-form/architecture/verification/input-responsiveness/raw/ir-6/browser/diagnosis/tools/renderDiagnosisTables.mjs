/** Render diagnostic evidence only; no table here overrides a registered verdict. */
export function renderDiagnosisTables(data) {
  const n = (value) => (value == null ? '관측 없음' : value.toFixed(3));
  const lines = [
    '모든 수치는 **진단 전용**입니다. 정식 G2/G8 FAIL을 유지합니다. CPU는100µs 표본의 페이지당 평균 추정치이며 포함 시간은 중첩됩니다. 공용 external-store 효과를 표시 훅만의 효과로 단정하지 않습니다. CPU표의0은 미관측일 수 있습니다.',
    '',
    '| 조건 | 레인 | 페이지 | first 중앙값 ms | eager 중앙값 ms | F 대비 eager 감소 ms | F−E 회귀 제거 비율 |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const row of data.variants)
    lines.push(
      `| ${row.id} | ${row.lane} | ${row.count} | ${n(row.firstMedian)} | ${n(row.eagerMedian)} | ${n(row.reductionMs)} | ${row.explainedFraction == null ? '—' : n(row.explainedFraction * 100) + '%'} |`,
    );
  lines.push(
    '',
    '| 프로파일 조건 | 레인 | 페이지 | first 중앙값 ms | eager 중앙값 ms |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const row of data.mountRows)
    lines.push(
      `| ${row.id} | ${row.lane} | ${row.count} | ${n(row.firstMedian)} | ${n(row.eagerMedian)} |`,
    );
  lines.push(
    '',
    '| 조건 | CPU 그룹 | E 배타/포함 ms | F 배타/포함 ms | F−E 배타/포함 ms |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const row of data.mountDifferences)
    for (const group of row.groups)
      lines.push(
        `| ${row.id} | ${group.name} | ${n(group.E.selfMs)} / ${n(group.E.inclusiveMs)} | ${n(group.F.selfMs)} / ${n(group.F.inclusiveMs)} | ${n(group.deltaSelf)} / ${n(group.deltaInclusive)} |`,
      );
  lines.push(
    '',
    '<details>',
    '<summary>그룹별 함수 self/total 차이 상위(절댓값 기준, 원시 위치는 CPU profile에 보존)</summary>',
    '',
    '| 조건 | 그룹 | 함수 | self E / F / F−E ms | total E / F / F−E ms |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const row of data.mountDifferences)
    for (const group of row.groups) {
      const functions = row.functions.filter((fn) => fn.group === group.name);
      const selected = [...functions]
        .sort((a, b) => Math.abs(b.deltaSelf) - Math.abs(a.deltaSelf))
        .slice(0, 3);
      for (const fn of [...functions]
        .sort((a, b) => Math.abs(b.deltaTotal) - Math.abs(a.deltaTotal))
        .slice(0, 3))
        if (!selected.includes(fn)) selected.push(fn);
      for (const fn of selected)
        lines.push(
          `| ${row.id} | ${group.name} | ${fn.name} | ${n(fn.selfE)} / ${n(fn.selfF)} / ${n(fn.deltaSelf)} | ${n(fn.totalE)} / ${n(fn.totalF)} / ${n(fn.deltaTotal)} |`,
        );
    }
  lines.push(
    '',
    '</details>',
    '',
    '| 정식 원시 기반 burst | 레인 | ET 행p95 ms (관측/200key) | handler 행p95 / pooled p95 ms (200key) | 첫키 중앙값 / 나머지190키 p95 ms |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const row of data.burstRows)
    for (const [lane, value] of Object.entries(row.lanes))
      lines.push(
        `| ${row.id} | ${lane} | ${n(value.rowP95)} (${value.observations}/200) | ${n(value.handlerRowP95)} / ${n(value.handlerPooled.p95)} | ${n(value.handlerFirst.median)} / ${n(value.handlerRest.p95)} |`,
      );
  lines.push(
    '',
    '| 진단 bootstrap | 상한 |',
    '| --- | --- |',
    `| 정식 G2 동일 재생 | ${n(data.sensitivity.registeredUpper)} |`,
    `| E 최악 페이지${data.sensitivity.worstPageIndices.E} 제외(독립 표집) | ${n(data.sensitivity.independentRemoveEOnly)} |`,
    `| F 최악 페이지${data.sensitivity.worstPageIndices.F} 제외(독립 표집) | ${n(data.sensitivity.independentRemoveFOnly)} |`,
    `| 각 레인의 최악 페이지 제외(독립 표집) | ${n(data.sensitivity.independentRemoveEachWorst)} |`,
    `| E 최악 페이지 쌍 제외(공동 표집) | ${n(data.sensitivity.jointDropEWorstPair)} |`,
    `| F 최악 페이지 쌍 제외(공동 표집) | ${n(data.sensitivity.jointDropFWorstPair)} |`,
    `| 페이지 쌍8 제외(공동 표집) | ${n(data.sensitivity.jointLeaveEachPair['8'])} |`,
    `| flat500 모든 handler 키 F/E | ${n(data.sensitivity.handlerAllKeysJointUpper)} |`,
  );
  lines.push(
    '',
    '| 정식 F 느린 키 | page/key | native processing ms | handler ms | input delay ms |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const key of data.slowF)
    lines.push(
      `| flat500 burst | ${key.page}/${key.key} | ${n(key.processing)} | ${n(key.handlerMs)} | ${n(key.inputDelayMs)} |`,
    );
  lines.push(
    '',
    '| 진단 첫 handler | 레인 | 페이지 | handler 중앙값 ms | engine 쓰기·정착 평균 ms | 표시 helper 평균 ms | 가장 가까운 선행 검증 실행 ms 전 | handler 내 검증 실행 수 | 선행 배달 ms 전 / handler 내 배달 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  );
  for (const row of data.firstKeys)
    lines.push(
      `| ${row.id} | ${row.lane} | ${row.count} | ${n(row.handlerMedian)} | ${n(row.groups['engine-write-settle'] ?? 0)} | ${n(row.groups['display-hook-and-reveal'] ?? 0)} | ${n(row.closestPriorRunMs)} | ${row.runsInside} | ${row.verdictTimingInstrumented ? n(row.closestPriorVerdictMs) + ' / ' + row.verdictsInside : '미계측'} |`,
    );
  lines.push(
    '',
    '| 진단 첫 handler | 레인 | 첫 표본에서 관측한 렌더 컴포넌트 |',
    '| --- | --- | --- |',
  );
  for (const row of data.firstKeys)
    lines.push(
      `| ${row.id} | ${row.lane} | ${Object.entries(row.scope)
        .map(([name, count]) => name + '×' + count)
        .join(', ')} |`,
    );
  lines.push(
    '',
    '<details>',
    '<summary>모든 burst 페이지의 검열된 ET 관측과 검열 없는 handler20개(키1→20 순서)</summary>',
    '',
    '| 행 | 레인/page | ET 관측 processing ms | ET page p95 ms | handler20개 ms |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const row of data.burstRows)
    for (const [lane, value] of Object.entries(row.lanes))
      for (const sample of value.distributions) {
        const observations = sample.eventObservations.map(
          (event) => event.processing,
        );
        const sorted = [...observations].sort((a, b) => a - b);
        lines.push(
          `| ${row.id} | ${lane}/${sample.page} | ${observations.length ? observations.map(n).join(', ') : '관측 없음'} | ${n(sorted[Math.ceil(sorted.length * 0.95) - 1])} | ${sample.handler.map(n).join(', ')} |`,
        );
      }
  lines.push('', '</details>');
  return lines.join('\n') + '\n';
}
