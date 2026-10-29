/** Render the diagnostic verdict from preserved parsed tables, including failed reconciliation attempts. */
export function renderReport(inputs, outcome, tables) {
  const lines = [
    '# Ⅳ-3-0 — 분기 전환의 함수 단위 샘플링 귀속',
    '',
    outcome.completed
      ? '세 행의 함수 self 귀속과 같은 프로세스의 벽시계를 교차 확인했습니다.'
      : '**교차 확인 또는 환경 거절로 중단했습니다. 아래 수치는 진단 기록이며 갈래 착수의 유효한 판정으로 쓰지 않습니다.**',
    '',
    `제품 기준: \`${inputs.productBase}\`. 도구 머리: \`${inputs.head}\`. Node ${inputs.node}, ${inputs.platform}/${inputs.arch}. Node 전용 진단이며 Bun에는 같은 V8 장치가 없습니다. 창·A/B 비교가 아닙니다.`,
    '',
    '지정 제품 build의 기존 비축소 index.node.mjs를 사용하고 fixture용 내부 export만 덧붙였습니다. 제품 소스·빌드 설정·계측 타이머는 바꾸지 않았습니다. 한 행당 한 프로세스에서 폼을 한 번 만들고 2,000동작 예열 뒤 20,000동작을 관측했습니다. oneOf는 왕복 2쓰기, siblings는 1쓰기, single-flat은 잎 1쓰기입니다(single-flat의 기존 10쓰기 표본과 단위가 다릅니다).',
    '',
    '벽시계는 100동작 블록 바깥의 단조 시계로 재고 블록별 µs/동작의 중앙값입니다. 500동작마다 타이밍 밖 setImmediate로 양보했습니다. 프로파일은 동일 블록 구간만 고르므로 적재·폼 생성·예열·검사·양보를 제외합니다. self는 samples × 요청 간격 ÷ 20,000이며 벽시계에 맞춰 정규화하지 않습니다. (program)/(idle)은 self 합과 백분율 표본 분모에서 빼고, 동작 수 분모 20,000은 유지합니다. GC는 포함합니다. timeDeltas 합은 요청 간격과 실측 표본 간격의 차이를 드러내는 보조 수치입니다.',
    '',
    'CPU 사전 검사: 공용 3초 평균·개별 외부 PID 30%, 일반 시작 지연 120초·Spotlight 600초. 원시에는 상위 10개 프로세스의 이름·비율만 공개하며 거절은 자동 재시도하지 않습니다. 원시 .cpuprofile.gz는 URL만 상대 주소로 치환했고 입력 SHA-256은 inputs.json에 보존했습니다.',
    '',
    '## 교차 확인',
    '',
    '| 행 / 요청 간격 µs | 벽시계 중앙 µs | self µs | self/벽시계 | ±15% | timeDeltas µs/동작 | program·idle % |',
    '| --- | ---: | ---: | ---: | --- | ---: | ---: |',
  ];
  for (const table of tables)
    lines.push(
      `| ${table.row} / ${table.intervalUs} | ${table.wallMedianUs.toFixed(3)} | ${table.selfUsPerSwitch.toFixed(3)} | ${table.reconciliationRatio.toFixed(4)} | ${table.reconciled ? '통과' : '실패'} | ${table.deltaUsPerSwitch.toFixed(3)} | ${table.excludedPercent.toFixed(2)} |`,
    );
  for (const table of tables) {
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
      '| 함수 (번들 줄, 원본 모듈) | 갈래 | self µs/동작 | % |',
      '| --- | --- | ---: | ---: |',
    );
    for (const entry of table.top40)
      lines.push(
        `| ${entry.name.replaceAll('|', '\\|')} (${entry.line}, ${entry.source || entry.url || 'V8'}) | ${entry.group} | ${entry.selfUsPerSwitch.toFixed(3)} | ${entry.percent.toFixed(2)} |`,
      );
    lines.push(
      '',
      `OTHER 전체는 해당 원시 tables.json의 table에 이름·URL·줄과 함께 남겼습니다. GC ${table.groups.find((group) => group.group === 'GC').percent.toFixed(2)}%. program·idle이 20%를 넘으면 그대로 보고하며 보정하지 않습니다.`,
    );
  }
  lines.push('', '## 15 µs 착수 조건', '');
  for (const [row, group, label] of [
    ['switch-oneOf-80', 'A', 'A가 없애는 함수들의 self 합(왕복)'],
    [
      'switch-siblings-0',
      'B',
      'B의 서술자가 대신하는 함수들의 self 합(한 전환, 상한)',
    ],
  ]) {
    const table = tables.filter((entry) => entry.row === row).at(-1);
    lines.push(
      `- ${label}: ${table ? table.decisions[group].toFixed(3) + ' µs; 15 µs ' + (table.decisions[group] >= 15 ? '이상' : '미만') : '미관측'}. ${outcome.completed ? '유효한 교차 확인 결과에 한해 착수 조건을 적용합니다.' : '중단 기록이므로 착수 판정은 보류합니다.'}`,
    );
  }
  lines.push(
    '',
    'A 전체와 제거 가능한 A 부분집합은 다릅니다. FieldNode 생성자·cloneSlotSubtree 재귀·getRetainedChildEntry만 A 착수 합에 넣고, overlay Map 복사는 cloneSlotSubtree self 안에서 한 번만 셉니다. 별도 native Map 프레임·V8 인라이닝으로 사라진 프레임은 제거 가능 몫으로 추측하지 않습니다. finalizeExits 자체 self는 나감 수명 처리인 A에 귀속합니다. B 합은 서술자로 대체 가능한 계산의 상한이며 적용 비용까지 전부 제거된다는 보장은 아닙니다. 매핑은 branches.json에 수기로 고정했습니다.',
    '',
    '## Ⅳ-0 장부와의 관계',
    '',
    'Ⅳ-0 §1의 alternate 표는 oneOf 왕복, single 10쓰기이고 단계 표는 쓰기 1회입니다. §4의 no-op 고정비와 switch 증가분은 타이머 경계의 인과적 상한이 아니며, §5의 writeFieldNode·사슬 종료·finishSettlement 잔여는 이번 C 및 OTHER의 실제 함수로 나뉩니다. 단계 경계의 inclusive 값과 이번 함수 self를 같은 값으로 취급하지 않습니다. 특히 기존 단계 수치를 이번 self에 더하거나 계측 오버헤드를 이 샘플링 self에서 빼지 않습니다.',
    '',
    'single-flat-1000의 C와 상위 OTHER 함수가 잎 쓰기 고정비의 관측 주인입니다. 실제 함수와 GC 몫은 위 표와 전체 원시에 있습니다. 서로 다른 단계 머리·측정 장치의 절대값 차이는 개선으로 주장하지 않습니다.',
    '',
  );
  if (outcome.failure)
    lines.push(
      '중단 사유: `' +
        JSON.stringify(outcome.failure) +
        '`. 코디네이터의 결정을 기다립니다.',
      '',
    );
  return lines.join('\n');
}
