import { renderInterpretation } from './renderInterpretation.mjs';

/**
 * Render the diagnostic verdict from preserved weighted self and collector-free controls.
 * @param {any} inputs Immutable provenance including product head and root-normalization flag.
 * @param {any} outcome Completion/failure and all attempt receipts from the runner.
 * @param {any[]} tables Recomputed per-row self tables, including failed reconciliation attempts.
 * @param {any} [interpretation] Optional post-hoc regime/decision interpretation with its own hash ledger.
 * @returns Deterministic Markdown with branch decisions, sampling diagnostics and explicit fixed-cost owners.
 * @throws If a supplied table lacks the required parser fields.
 */
export function renderReport(inputs, outcome, tables, interpretation) {
  const lines = [
    '# Ⅳ-3-0 — 분기 전환의 함수 단위 샘플링 귀속',
    '',
    outcome.completed
      ? '세 행의 함수 self 귀속과 같은 관측 구간의 평균 벽시계를 교차 확인했습니다.'
      : '**교차 확인 또는 환경 거절로 중단했습니다. 아래 수치는 진단 기록이며 갈래 착수의 유효한 판정으로 쓰지 않습니다.**',
    '',
    `제품 기준: \`${inputs.productBase}\`. 도구 머리: \`${inputs.head}\`. Node ${inputs.node}, ${inputs.platform}/${inputs.arch}; ${inputs.cpu}, OS ${inputs.osRelease}. Node 전용 진단이며 Bun에는 같은 V8 장치가 없습니다. 창·A/B 비교가 아닙니다.`,
    '',
    `준비 root의 realpath 정규화로 경로가 달라졌는가: ${inputs.rootNormalizationChanged ? '예' : '아니요'}. 실행 인자의 정규화 변경: ${outcome.rootNormalizationChanged ? '예' : '아니요'}. 기계 경로 자체는 보존하지 않습니다. 제품 소스가 기준과 동일하고 dist가 모든 제품 소스보다 새로 생성되었음을 준비 때 확인했습니다.`,
    '',
    '지정 제품 build의 기존 비축소 index.node.mjs에 fixture용 내부 export만 덧붙였습니다. 제품 소스·빌드 설정·계측 타이머 변경은 없습니다. 수집 행과 수집기 없는 plain 대조는 별도 프로세스이며 각각 폼 한 번·2,000동작 예열·20,000동작입니다. oneOf는 왕복 2쓰기, siblings는 1쓰기, single-flat은 잎 1쓰기입니다(single-flat의 기존 10쓰기 표본과 단위가 다릅니다).',
    '',
    '벽시계는 100동작 블록 바깥의 단조 시계로 재고 평균과 중앙값을 함께 보고합니다. 500동작마다 타이밍 밖 setImmediate로 양보했습니다. 프로파일은 동일 블록 구간의 leaf 표본만 고르므로 적재·폼 생성·예열·검사·양보를 제외합니다. 각 표본의 가중치는 다음 표본까지의 실측 timeDeltas이며 마지막 표본은 자기 간격을 씁니다. self는 가중치 합 ÷ 20,000이고 평균 벽시계와 ±15%를 비교합니다. 벽시계에 맞춰 정규화하지 않습니다. (program)/(idle)은 self와 백분율 가중치 분모에서 빼고 동작 수 분모는 유지합니다. GC는 포함합니다. 요청 간격 × 표본 수의 nominal 값은 보조 진단입니다.',
    '',
    '수집 프로세스의 벽시계에는 수집기 부담이 포함됩니다. 별도 plain 프로세스와의 평균·중앙값 비율로 그 부담을 보고하며 Ⅳ-0의 plain 값과 비교할 때는 별도 plain만 씁니다. 이 별도 관측은 같은 프로세스 교차 확인의 분모를 대체하지 않습니다.',
    '',
    'CPU 사전 검사: 공용 3초 평균·개별 외부 PID 30%, 일반 시작 지연 120초·Spotlight 600초. 원시는 상위 10개 프로세스의 이름·비율만 공개하며 거절은 자동 재시도하지 않습니다. 원시 .cpuprofile.gz는 URL만 상대 주소로 치환했고 입력 SHA-256은 inputs.json에 보존했습니다.',
    '',
    '## 교차 확인',
    '',
    '| 행 / 요청 간격 µs | 수집 벽시계 평균 µs | 중앙값 µs | self µs | self/평균 | self/중앙값 | ±15% | nominal self µs | program·idle 가중 % |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |',
  ];
  for (const table of tables)
    lines.push(
      `| ${table.row} / ${table.intervalUs} | ${table.wallMeanUs.toFixed(3)} | ${table.wallMedianUs.toFixed(3)} | ${table.selfUsPerSwitch.toFixed(3)} | ${table.reconciliationRatio.toFixed(4)} | ${table.medianRatio.toFixed(4)} | ${table.reconciled ? '통과' : '실패'} | ${table.nominalSelfUsPerSwitch.toFixed(3)} | ${table.excludedPercent.toFixed(2)} |`,
    );
  lines.push(
    '',
    '## 표본 간격과 수집기 부담',
    '',
    '| 행 / 요청 µs | 실측 평균 간격 µs | 양자화 대역 간격 추정 µs | 표본 수(활성/제외) | plain 평균/중앙 µs | 수집/plain 평균·중앙 비 |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
  );
  for (const table of tables)
    lines.push(
      `| ${table.row} / ${table.intervalUs} | ${table.measuredPeriodUs.toFixed(3)} | ${table.periods.quantizationUnitEstimateUs?.toFixed(3) ?? '식별 불가'} | ${table.selectedSamples} (${table.activeSamples}/${table.excludedSamples}) | ${table.plain ? table.plain.wallMeanUs.toFixed(3) + ' / ' + table.plain.wallMedianUs.toFixed(3) : '미관측'} | ${table.plain ? table.collectorOverheadRatioMean.toFixed(4) + ' / ' + table.collectorOverheadRatioMedian.toFixed(4) : '미관측'} |`,
    );
  lines.push(
    '',
    'timeDeltas의 JSON 단위는 1 µs입니다. 양자화 단위 열은 표본 3개 이상이면서 전체의 0.1% 이상인 연속 정수-µs 대역 중심 간 거리의 중앙값으로 추정한 관측 간격이며 시계의 기본 해상도를 증명하지 않습니다. 두 대역 미만이면 식별 불가로 남깁니다.',
  );
  for (const table of tables) {
    lines.push(
      '',
      `${table.row}/${table.intervalUs}: 간격 p10/p50/p90 ${table.periods.percentilesUs.p10}/${table.periods.percentilesUs.p50}/${table.periods.percentilesUs.p90} µs; 0 간격 ${table.periods.zeroIntervals}개; 반복 대역 중심 ${table.periods.recurringBandCentersUs.map((value) => value.toFixed(3)).join(', ') || '없음'} µs.`,
    );
    lines.push(
      '',
      `## ${table.row} — ${table.intervalUs} µs`,
      '',
      '| 갈래 | self µs/동작 | % |',
      '| --- | ---: | ---: |',
    );
    for (const group of table.groups)
      lines.push(
        `| ${group.group} | ${group.selfUsPerSwitch.toFixed(3)} | ${group.percent.toFixed(2)} |`,
      );
    lines.push(
      '',
      '| 함수 (번들 줄, 원본 모듈) | 갈래 | self µs/동작 | % | 표본 |',
      '| --- | --- | ---: | ---: | ---: |',
    );
    for (const entry of table.top40)
      lines.push(
        `| ${entry.name.replaceAll('|', '\\|')} (${entry.line}, ${entry.source || entry.url || 'V8'}) | ${entry.group} | ${entry.selfUsPerSwitch.toFixed(3)} | ${entry.percent.toFixed(2)} | ${entry.samples} |`,
      );
    lines.push(
      '',
      `GC ${table.groups.find((group) => group.group === 'GC').percent.toFixed(2)}%. program·idle의 가중 몫 ${table.excludedPercent.toFixed(2)}%${table.excludedPercent > 20 ? ' — 20% 초과를 그대로 보고합니다' : ''}.`,
      '',
      'OTHER 전체:',
      '',
      '| 함수 (URL:줄) | self µs/동작 |',
      '| --- | ---: |',
    );
    for (const entry of table.table.filter((entry) => entry.group === 'OTHER'))
      lines.push(
        `| ${entry.name.replaceAll('|', '\\|')} (${entry.url || 'V8'}:${entry.line}) | ${entry.selfUsPerSwitch.toFixed(3)} |`,
      );
  }
  lines.push('', '## 15 µs 착수 조건', '');
  for (const [row, group, label] of [
    ['switch-oneOf-80', 'A', 'A의 계약상 네 작업 self 합(왕복)'],
    [
      'switch-siblings-0',
      'B',
      'B 계약 함수 self 합(쓰기 바닥 포함·보조 함수 제외, 한 전환)',
    ],
  ]) {
    const table = tables.filter((entry) => entry.row === row).at(-1);
    lines.push(
      `- ${label}: ${table ? table.decisions[group].toFixed(3) + ' µs; 프로파일 척도 15 µs ' + (table.decisions[group] >= 15 ? '이상' : '미만') : '미관측'}. ${outcome.completed ? (group === 'A' ? '갈래 A 닫힘' : '갈래 B 미착수(경계선, 소유자 확정 대기); 아래 척도 절에서 해석합니다') : '중단 기록이므로 판정 보류'}.`,
    );
    if (table && group === 'A')
      lines.push(
        `  A 확장 합(createFieldNode·getSlotChildIndex 포함)은 ${table.decisionAExtendedUs.toFixed(3)} µs이며 주 판정을 대체하지 않습니다. getSlotChildIndex는 슬롯 순서·정리 함수 네 곳에서도 불리므로 이 확장 합은 A가 없애는 몫보다 클 수 있습니다.`,
      );
    if (table)
      lines.push(
        `  게이트 평가(서술자 열쇠 계산, B 결정 합 제외)는 ${table.nonReplaceableGateEvaluationUs.toFixed(3)} µs입니다.`,
      );
  }
  const oneOf = tables
    .filter((table) => table.row === 'switch-oneOf-80')
    .at(-1);
  if (oneOf) {
    const a = oneOf.groups.find((group) => group.group === 'A').percent;
    const b = oneOf.groups.find((group) => group.group === 'B').percent;
    lines.push(
      '',
      `oneOf 왕복 갈래 A ${a.toFixed(2)}%, B ${b.toFixed(2)}%를 20% 선과 비교합니다. ${outcome.completed ? (a < 20 && b < 20 ? '둘 다 20% 미만이므로 설계 폐기 조건에 해당합니다.' : '둘 다 20% 미만이라는 폐기 조건에는 해당하지 않습니다.') : '교차 확인이 끝나지 않아 폐기 판정은 보류합니다.'}`,
    );
  }
  lines.push(
    '',
    '계약상 네 작업은 생성자, cloneSlotSubtree 재귀, overlay Map 복사, getRetainedChildEntry 탐색입니다. overlay Map 복사는 cloneSlotSubtree self에 들어 있으므로 두 번 더하지 않습니다. 확장 합은 createFieldNode와 getSlotChildIndex self를 추가합니다. B 수치는 매핑되지 않은 JavaScript 보조 함수를 뺀 합입니다. 독립 합성 탐침에서는 V8이 인라인된 JavaScript 함수를 자기 이름으로 귀속하고 Map 같은 내장 함수 시간은 호출한 JavaScript self에 귀속했습니다. 실제 행은 보고된 프레임 그대로 기록합니다. 매핑 근거와 나감 클로저의 URL·줄은 branches.json에 있습니다.',
    '',
    '## single-flat-1000 고정비 주인',
    '',
  );
  const flat = tables
    .filter((table) => table.row === 'single-flat-1000')
    .at(-1);
  if (flat)
    for (const entry of [
      ...flat.table.filter((entry) => entry.group === 'C'),
      ...flat.table.filter((entry) => entry.group === 'OTHER').slice(0, 5),
    ])
      lines.push(
        `- ${entry.name} (${entry.group}, ${entry.url}:${entry.line}): ${entry.selfUsPerSwitch.toFixed(3)} µs/잎 쓰기, 표본 ${entry.samples}개.`,
      );
  else lines.push('미관측입니다.');
  lines.push(
    '',
    '## Ⅳ-0 장부와의 관계',
    '',
    'Ⅳ-0 §1의 E plain 값은 프로세스 최소값들의 중앙값이며, oneOf 157.146 µs/왕복, siblings 56.708 µs/쓰기, single-flat 56.812 µs/10쓰기입니다. 아래 비교는 수집기 없는 별도 plain의 블록 중앙값을 사용하며 집계법·단계 머리·Node 버전이 달라 개선 판정으로 쓰지 않습니다. §4의 no-op 고정비와 switch 증가분은 인과적 제거 가능 비용이 아니며, §5의 쓰기 진입·사슬 종료·finish 잔여는 이번 C와 OTHER의 실제 함수로 나뉩니다. 단계 inclusive 값과 함수 self를 더하거나 기존 계측 오버헤드를 이번 self에서 빼지 않습니다.',
    '',
    '| 행 | Ⅳ-0 E plain(동작당 환산) µs | 이번 별도 plain 중앙 µs | 참고 비율 |',
    '| --- | ---: | ---: | ---: |',
  );
  for (const { row, baseline } of [
    { row: 'switch-oneOf-80', baseline: 157.146 },
    { row: 'switch-siblings-0', baseline: 56.708 },
    { row: 'single-flat-1000', baseline: 56.812 / 10 },
  ]) {
    const table = tables.filter((entry) => entry.row === row).at(-1);
    if (table?.plain)
      lines.push(
        `| ${row} | ${baseline.toFixed(3)} | ${table.plain.wallMedianUs.toFixed(3)} | ${(table.plain.wallMedianUs / baseline).toFixed(4)} |`,
      );
  }
  if (outcome.failure)
    lines.push(
      '',
      '중단 사유: `' +
        JSON.stringify(outcome.failure) +
        '`. 코디네이터의 결정을 기다립니다.',
    );
  return (
    lines.join('\n') +
    '\n' +
    (interpretation ? renderInterpretation(interpretation, tables) : '')
  );
}
