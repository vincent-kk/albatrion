// Decision prose is specific to the IV-3-0 observations collected on 2026-10-29 UTC; do not reuse with other data.
/**
 * Explain scale-dependent decisions without replacing observed self with an optimization promise.
 * @param {any} analysis Raw-derived regime comparisons and stack brackets.
 * @param {any[]} tables Corrected leaf tables from unchanged committed observations.
 * @returns Markdown interpretation with bounded A/B decisions and next-design clues.
 */
export function renderInterpretation(analysis, tables) {
  const oneOf = tables.find((table) => table.row === 'switch-oneOf-80');
  const siblings = tables.find((table) => table.row === 'switch-siblings-0');
  const a = analysis.a;
  const attributable = analysis.bReadings.at(-1);
  const contract = analysis.bReadings[1];
  const lines = [
    '',
    '## 척도와 사후 재계산',
    '',
    '측정 원시와 당시 입력 해시는 바꾸지 않고 매핑·해석만 사후 재계산했습니다. 재측정으로 판정 척도가 움직이는 일을 피하면서 해시 규율을 지키기 위해 측정 도구 19개와 원래 관측 20개의 바이트를 snapshots에 보존했습니다. 파일별 SHA-256과 출처 커밋 SHA를 원장에 기록하며 재검산은 커밋 이력 대신 그 스냅샷과 새 해석 도구·창 원시 해시를 대조합니다. squash 병합 뒤 원래 두 커밋이 없는 사본에서도 표·원장·문서의 바이트 동일 재생성을 확인했습니다.',
    '',
    '판정 환산은 같은 제품을 잰 미시 위생 후보 2의 B 레인(프로세스 최소의 중앙값)을 기준으로 합니다. Ⅳ-2 후보 1의 A 레인(앞 절반)은 참고 열입니다. 아래 값은 원시 프로세스의 100표본 최솟값들에서 다시 계산했고 single-flat의 10쓰기 표본은 1쓰기 단위로 나눴습니다.',
    '',
    '| 행 | 같은 제품 창 B µs | Ⅳ-2 A 참고 µs | 프로파일 별도 plain 중앙/평균 µs | 창/plain 중앙 | Ⅳ-2 A/plain 중앙 | 15 µs/창 % |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const scale of analysis.scales)
    lines.push(
      `| ${scale.row} | ${scale.windowUs.toFixed(6)} | ${scale.iv2Us.toFixed(6)} | ${scale.plainMedianUs.toFixed(3)} / ${scale.plainMeanUs.toFixed(3)} | ${scale.windowOverPlainMedian.toFixed(3)} | ${scale.iv2OverPlainMedian.toFixed(3)} | ${scale.thresholdSharePercent.toFixed(2)} |`,
    );
  lines.push(
    '',
    '창은 프로세스당 예열 20회·100표본, 프로파일은 2,000예열·20,000동작입니다. 같은 제품·같은 Node에서도 속도 비가 달라지므로 측정 상태의 척도를 구분합니다. JIT 단계 상승 등 예열 효과는 원인 가설이며 확인된 인과는 아닙니다. Ⅳ-0 단계 몫과 이번 프로파일의 단계 몫은 대체로 5%포인트 안에서 맞았다는 독립 검토를 근거로 몫을 창 척도로 옮겨 참고하되, 그 오차를 개선 증거로 바꾸지 않습니다.',
    '',
    '### B의 세 읽기와 쓰기 바닥',
    '',
    '| 읽기 | 프로파일 µs/쓰기 | 활성 self 몫 % | 같은 제품 창 척도 µs |',
    '| --- | ---: | ---: | ---: |',
  );
  for (const reading of analysis.bReadings)
    lines.push(
      `| ${reading.label} | ${reading.profileUs.toFixed(6)} | ${reading.sharePercent.toFixed(2)} | ${reading.windowScaleUs.toFixed(3)} |`,
    );
  lines.push(
    `| 동일 기준 바닥 차감(양쪽 computeNodeBody 포함) | ${analysis.sameBasisFloor.profileUs.toFixed(6)} | ${analysis.sameBasisFloor.sharePercent.toFixed(2)} | ${analysis.sameBasisFloor.windowScaleUs.toFixed(3)} |`,
  );
  lines.push(
    '',
    `쓰기 바닥 추정 ${analysis.floorEstimateUs.toFixed(6)} µs는 전환이 없는 single-flat-1000의 수정 전 B self입니다. 이 바닥은 서술자가 대신할 수 없는 모든 쓰기의 계산·조립·출력·커밋을 포함합니다. computeNodeBody 포함 siblings B ${contract.profileUs.toFixed(6)} µs에서 이를 빼면 귀속 가능한 추정은 ${attributable.profileUs.toFixed(6)} µs, 창 척도 ${attributable.windowScaleUs.toFixed(3)} µs입니다. 다른 fixture를 뺀 추정이며 siblings-0 자체의 no-op을 잰 값이나 인과적 절감량이 아닙니다. 포함 시간은 하위 보조 함수와 쓰기 바닥을 포함한 진단 괄호이며 서술자만의 절감량으로 판정하지 않습니다.`,
    '',
    `같은 기준으로 비교할 때는 flat의 computeNodeBody도 바닥에 포함하므로 바닥은 ${analysis.sameBasisFloor.floorUs.toFixed(6)} µs입니다. 이 값을 빼면 ${analysis.sameBasisFloor.profileUs.toFixed(6)} µs, 창 척도 ${analysis.sameBasisFloor.windowScaleUs.toFixed(6)} µs이며 15 µs 미만이라는 결론은 같습니다.`,
    '',
    'getDependencyIndex 자체는 캐시 접근 함수입니다. 실제 의존 색인 메서드는 계약의 열거 self 합 밖이므로 B 결정 수치에서 제외하고 별도로 기록합니다. 이름이 같은 메서드는 원본 모듈로 한정했습니다.',
    '',
    '| 의존 색인 메서드 self(affectedByPresence·collect·pathSegments·emit·affectedForRegistration) | 핵심 5프레임 µs/동작 | 동명 보조 emit 포함 µs/동작 | B 결정 포함 |',
    '| --- | ---: | ---: | --- |',
  );
  for (const entry of analysis.dependencies)
    lines.push(
      `| ${entry.row} | ${entry.selfUs.toFixed(6)} | ${entry.allNamedFramesUs.toFixed(6)} | 제외 — 캐시 접근과 실제 색인 메서드의 경계 |`,
    );
  lines.push(
    '',
    '독립 검토의 의존 색인 7.28 µs는 원본 모듈·번들 줄로 식별한 핵심 다섯 프레임입니다. 같은 모듈의 두 로컬 콜백도 emit으로 추론되므로 그들을 더한 7.3615 µs를 별도로 보존합니다. 포함 시간의 쓰기 바닥에는 advanceFieldNodeRevision에서 만드는 revision ledger를 포함하며, 노드 복제·나감·레지스트리·게이트 평가는 제외합니다.',
  );
  lines.push(
    '',
    '### 결정과 관측 경계',
    '',
    `갈래 A는 닫힘: 주 합 ${a.profileUs.toFixed(3)} µs(몫 ${a.sharePercent.toFixed(2)}%, 창 척도 약 ${a.windowScaleUs.toFixed(2)} µs)로 확인된 어떤 읽기에서도 15 µs에 미치지 못합니다. 레지스트리 재등록까지 없앤다는 미확인 가설에서만 창 척도 약 18 µs이며, 현재 닫힘 판정에는 이 가설을 넣지 않습니다. overlay Map 복사 줄과 cloneSlotSubtree의 자식 재귀 줄의 표본은 0입니다.`,
    '',
    `갈래 B는 미착수: 귀속 가능한 몫(computeNodeBody 포함 B에서 쓰기 바닥을 뺀 값)은 창 척도로 ${attributable.windowScaleUs.toFixed(2)} µs로 15 µs 미만이고, 쓰기 바닥까지 포함하는 가장 너그러운 self 읽기에서만 창 척도 약 ${contract.windowScaleUs.toFixed(1)} µs로 선에 걸칩니다. 경계선이므로 소유자 확정 대기로 표시합니다.`,
    '',
    '15 µs 선을 프로파일 µs로 읽을지 창의 몫으로 옮겨 읽을지는 소유자의 확정 사항입니다. 이전 결과의 단순한 B 미충족 문장을 착수 판정으로 쓰지 않습니다. 포함 시간은 쓰기 바닥과 보조 작업까지 포함하므로 위 self 경계 판정과 구분합니다.',
    '',
    `FieldNode 생성자는 ${oneOf.table.find((entry) => entry.name === 'FieldNode').samples}표본, cloneSlotSubtree는 ${oneOf.table.find((entry) => entry.name === 'cloneSlotSubtree').samples}표본이며 각각 self가 존재합니다. 0표본은 Map 복사·자식 재귀 줄에 한정합니다. cloneSlotSubtree self의 대부분은 A 뒤에도 남는 진입 기록이고 getRetainedChildEntry는 나감 경로에서 불리므로 주 합은 이 fixture에서 제거 가능한 몫을 과하게 잡는 값입니다.`,
    '',
    `siblings-0에서 A ${siblings.groups.find((group) => group.group === 'A').selfUsPerSwitch.toFixed(3)} µs 중 register 약 ${siblings.table
      .filter(
        (entry) =>
          entry.name === 'register' &&
          entry.source.endsWith('/getGateRegistry.ts'),
      )
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0)
      .toFixed(
        3,
      )} µs는 이미 등록된 노드의 조기 반환입니다. 범위 규칙은 이를 새 정체성 등록과 가르지 않으며 매핑은 바꾸지 않았습니다.`,
    '',
    '### 다음 설계 단서',
    '',
    '| 주인 | oneOf 왕복 µs 또는 별도 행 | 해석 |',
    '| --- | ---: | --- |',
    `| OTHER 상위: 의존 색인 메서드 | ${analysis.dependencies.find((entry) => entry.row === oneOf.row).selfUs.toFixed(3)} | B 결정 밖의 실제 색인 작업 |`,
    `| OTHER 상위: getHostDerived | ${oneOf.table
      .filter((entry) => entry.name === 'getHostDerived')
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0)
      .toFixed(3)} | 파생 레코드 접근 |`,
    `| OTHER 상위: selectEffectiveDeclarations | ${oneOf.table
      .filter((entry) => entry.name === 'selectEffectiveDeclarations')
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0)
      .toFixed(3)} | 유효 선언 선택 |`,
    `| GC | ${oneOf.groups.find((group) => group.group === 'GC').selfUsPerSwitch.toFixed(3)} | 노드 수명 몫으로 나눌 수 없음 |`,
    `| 게이트 레지스트리 register | ${oneOf.table
      .filter(
        (entry) =>
          entry.name === 'register' &&
          entry.source.endsWith('/getGateRegistry.ts'),
      )
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0)
      .toFixed(
        3,
      )} | 독립 줄 단위 검토: 두 WeakMap 삽입 61%; 재등록 제거는 미확인 |`,
    `| 나감 경로 finalizeExits 포함 | ${analysis.stackTimes[oneOf.row].finalizeExitsInclusiveUs.toFixed(3)} | 하위 self와 중복되므로 더하지 않음 |`,
    `| siblings-0 hasOwnProperty | ${siblings.table
      .filter((entry) => entry.name === 'hasOwnProperty')
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0)
      .toFixed(3)} | 한 전환 기준 |`,
    '',
    '사후 매핑에서 computeNodeBody와 나감 클로저가 이동하므로 원래 OTHER 49.7%와 수정 뒤 OTHER 비율은 다릅니다. 단서의 절대 self는 동일 원시에서 유지됩니다.',
  );
  if (analysis.filid)
    lines.push(
      '',
      '## FCA 검증',
      '',
      `filid:scan 한 번의 구조 findings ${analysis.filid.findings}개로 기준 202 이하입니다. 판정 ${analysis.filid.verdict}, 분석 완전성 ${analysis.filid.certainty}; 기존 findings·진단을 통과로 바꾸지 않았습니다.`,
    );
  return lines.join('\n') + '\n';
}
