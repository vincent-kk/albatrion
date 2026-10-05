# 게이트 선택 표와 커밋 결과 재사용 설계

2026-10-06. **97C-01의 조건 여섯과 재확인의 잔여 넷·보충 둘을 반영한 구현 전 설계안**입니다. 이번 코드 대조 기준은 stage-07의 `31717d1f7`이며, 편집자 결정 97C-01·02·03과 재확인은 로컬 `origin/1.0.0-beta`의 `3570c2bb8`에서 읽었습니다. 독립 검증 원문 전체(`architecture/reviews/raw-round97-gate-selection/verifier.md:1-42`), 재확인 전체(`architecture/reviews/raw-round97-gate-selection/verifier-recheck.md:1-28`), 닫기 문서(`architecture/reviews/round-97-closing.md:1-26`)의 경로·행 근거를 현재 코드와 대조했습니다. 재확인의 가–라(20–23행)와 보충 둘(14·16행)은 모두 97C-01 안의 보완입니다. 97C-02의 비교 결함 수정은 별도 파일 묶음이며, 이 문서 수정에는 (가)·(나)의 제품 구현이나 측정 결과가 없습니다.

## 1. 근거와 승인 범위

편집자 결정 96C-01(`origin/1.0.0-beta`의 `83e2a17c0`, `architecture/reviews/round-96-closing.md`)이 연 두 범위를 97C-01의 적용 조건 안에서 구현할 설계입니다. BLUEPRINT-007·BLUEPRINT-017·SETTLE-020의 현행 문장과 97차 보충을 함께 기준으로 사용합니다.

- **(가) 판별 선택 표:** 동일 union 호스트의 본체 키 하나를 리터럴과 비교하는 분기 게이트를 청사진에서 값 → 분기 목록으로 묶습니다. 바퀴는 기존 평가 위치에서 현재 값으로 조회하고 기존 순서로 적용합니다.
- **(나) 결과 재사용:** 읽기가 정적으로 완전하게 알려진 순수 식이고, 읽는 키마다 그 이름의 엔트리가 정확히 하나이며 게이트 없는 선언이 보장되고, 이번 정착에서 읽기가 건드려지지 않았으면 원래 평가 자리의 동일성 검사를 거쳐 직전의 실패 없는 커밋 결과를 사용합니다.

BLUEPRINT-007의 남은 최적화 (a), BLUEPRINT-017의 변환, FRAGMENT-048의 AND 결합, SETTLE-020의 전수 평가 의미를 이 두 방법으로 구현합니다. SETTLE-018의 `게이트 없는 조각 ∪ 상속 overlay` 출발점과 SETTLE-044의 부정 결정은 유지합니다. 직전 활성 집합을 초기 가설이나 평가 순서 힌트로 사용하지 않습니다.

`if`의 내용·의존성 분석, 다른 게이트에 따라 읽는 키의 존재가 달라지는 식, 인식하지 못한 식의 선택적 평가, 출력 계산의 지연, 꺼진 조각 분석의 지연은 범위 밖입니다. 해당 게이트는 현재 방식으로 매 바퀴 평가합니다. 작성 스키마와 검증기에 전달하는 `const`·`enum`·`required`도 유지합니다.

87라운드 소유자 원칙은 순회 최소화, 불필요한 계산 생략, 뜨거운 경로의 인덱스 `for`/`while`, 안정된 객체 모양입니다. 91라운드 기준 (1)은 전체 전환 정착이 무관한 분기 수에 따라 늘지 않는 것입니다. **게이트 호출만 일정하게 만든 것으로 전체 기준의 통과를 선언하지 않습니다.** 아래 B2/B4/B5 연결 조건도 충족해야 합니다.

문서 안의 제품 경로는 패키지 루트 상대입니다. 97차 결정과 검증 보고서는 지정된 로컬 origin ref의 기록입니다. `diagnosis-94c03.md`의 실제 측정 기준은 `f8aaa4ed23245450f967878cd96477fa5bae8f96`입니다. 그 계수는 기존 진단의 증거이며, 아래 설계 계수는 현재 HEAD에서 새로 측정한 결과가 아닙니다.

## 2. 현재 평가 구조와 제거할 중복

`src/core/settle/utils/compute/computeNode.ts:74-135`는 직접 자식·호스트 선언·이동된 게이트를 모으고, 게이트가 있으면 `primeHost`를 실행합니다. `selectNodeSchema`는 루트에서만 호출됩니다(`src/core/settle/utils/compute/computeNode.ts:47,58,119`). 루트가 아닌 호스트의 같은 분기 게이트에는 **두 평가 자리**가 있습니다. 부모가 그 호스트를 고르는 `selectChildren`에서는 owner가 부모이고, 호스트 자신의 자식을 고르는 `selectChildren`에서는 owner가 호스트입니다(`src/core/settle/utils/compute/selectChildren.ts:156-167`). 레지스트리도 호스트의 자식 선언에 붙은 같은 게이트를 등록합니다(`src/core/settle/utils/gates/getGateRegistry.ts:61-73`). 게이트 identity나 읽는 호스트가 같아도 두 owner/edge 발생의 결합과 공표 자리를 합치지 않습니다.

루트의 선언 선택 뒤 직접 에지를 처리하는 순서를 모든 호스트에 일반화하지 않습니다. 루트의 `src/core/settle/utils/compute/selectNodeSchema.ts:21-22`와 위 두 `selectChildren` 자리의 선언별 게이트 평가가 중복을 만들지만, 첫 거절·자식 계산·pending output 공표의 자리는 뒤의 투영 읽기와 배달 순서에 영향을 줍니다. `edgeName`은 선언 자신의 active 게이트일 때만 전달하는 현재 규칙도 유지합니다(`src/core/settle/utils/compute/selectChildren.ts:162-164`, `src/core/settle/utils/gates/getGateRegistry.ts:67-72`).

진단 (나)의 B3는 이 평가 중복입니다. BF의 `fixtures/equivalent/branches.ts`에서 `/kind`는 본체에 선언되고 각 분기는 `./kind === 'kind_i'`를 사용합니다. 진단은 분기 수와 무관하게 `kind_0 → kind_4`를 쓰며, 공통 키 둘과 선택 분기의 payload 셋만 살아 있습니다. 이 사례는 (가)의 자격을 충족합니다.

| 분기 B | 기존 게이트 평가 | schema/children 선택 호출 | 직접 후보 수집 | child gate 수집 |
| ---: | ---: | ---: | ---: | ---: |
| 5 | 40 | 2/2 | 17 | 15 |
| 10 | 80 | 2/2 | 32 | 30 |
| 20 | 160 | 2/2 | 62 | 60 |
| 40 | 320 | 2/2 | 122 | 120 |

기존 게이트 평가는 `8B = 2 × (호스트 B + 자식 3B)`입니다. 표 조회로 조건 함수를 없애도 `3B+2` 후보 수집이나 모든 거짓 결과의 배열 작성이 남으면 B3를 다른 선형 루프로 옮긴 것에 불과합니다.

## 3. 인식하는 식과 되돌림

### 3.1 판별 선택 표의 식

컴파일러가 경로 치환과 리터럴 해석을 마친 뒤 다음 형태임을 **식 전체에 대해** 확인합니다. 작성 문자열에서 `===`가 보인다는 정규식 추측이나 함수의 `toString()` 분석은 사용하지 않습니다.

| 형태 | 예 | 표에 기록하는 정보 |
| --- | --- | --- |
| 무조건 선언된 직접 키 한 개와 유한 원시 리터럴의 엄격한 같음 | `./kind === 'a'`, `'a' === ./kind` | 키, 리터럴, `===` |
| 유한 원시 리터럴 목록의 포함 판정 | `['a', 'b'].includes(./kind)` | 키와 리터럴 목록, 같은 선택 비교 |
| 위 비교들의 유한 OR, 같은 키만 사용 | `./kind === 'a' || ./kind === 'b'` | 같은 키의 값 합집합, `===` |
| 명시 discriminator의 변환 기술 | `{ propertyName: 'kind', values: ['a', 'b'] }` | 실제 `gate.condition.values`의 교집합 완료 값 |

괄호·공백·컴파일러가 허용하는 끝 세미콜론은 의미를 바꾸지 않는 범위에서 제거합니다. 리터럴은 문자열·유한 수·boolean·`null`입니다. 문자열 escape와 RFC 6901 키 해석은 기존 컴파일러와 공유합니다. `undefined`·`NaN`·`Infinity` 식, 객체/배열을 비교값으로 쓰는 식, loose equality, 부정·범위 비교, 동적 목록·동적 프로퍼티, 임의 함수 호출·블록·대입·시간·전역 객체 참조는 첫 구현에서 표 자격을 주지 않습니다. 빈 작성자 리터럴 목록은 늘 거짓인 표 항목으로 표현할 수 있지만 discriminator의 빈 enum 청사진 오류를 없애지는 않습니다.

이 OR는 목록 포함과 동등한 꼴을 컴파일러가 드러내는 경우입니다. 임의 논리식을 분배·재배열하여 이 꼴로 만들지 않습니다. `controls.discriminator`가 없는 스키마의 JSON Schema `const`·`enum`을 새로 읽어 판별식을 추측하지 않습니다.

키는 해당 호스트 본체 또는 게이트 없는 정적 연언이 보장하는 직접 키이고, **호스트의 `childEntries`에서 그 이름의 엔트리가 정확히 하나**이어야 합니다. 같은 이름의 다른 종류 엔트리가 있으면 현재 한 종류만 활성이어도 표와 재사용 모두 자격을 주지 않습니다. 분기에만 선언된 명시 판별 키도 `src/core/blueprint/utils/analyze/populateNodeChildren.ts:90-100`이 만든 게이트 없는 사본이 이 보장을 충족하면 자격을 줍니다(BLUEPRINT-017·FRAGMENT-007). 사본의 선언 수와 엔트리 수는 구별하며, 임의의 조건부 분기 키를 끌어올리지 않습니다. 키 게이트·상위 조건부 존재·투영 제어를 발생 결합에서 증명하지 못하면 기존 평가를 사용합니다.

표에 넣는 **식의 `BlueprintExpression.dependencies`는 정확히 한 개**여야 합니다. 인식한 키 외의 의존성이 있으면 표를 만들지 않습니다. 경로 치환 정규식(`src/core/blueprint/utils/expressions/regex.ts:22`)은 `'a ./x'` 같은 문자열 리터럴의 경로 모양도 의존성으로 잡고 기준 평가기는 모두 읽습니다(`src/core/settle/utils/gates/evaluateGate.ts:110-115`). 따라서 토큰 인식기가 키 하나로 보았다는 이유로 그 추가 읽기를 버리지 않습니다. 식이 없는 판별 기술은 `propertyName`의 단일 읽기와 위 엔트리 자격을 따로 확인합니다.

명시 discriminator의 분기 자체 `controls.active`는 FRAGMENT-048대로 **앞 항과 뒤 항을 구별**합니다. 재귀 선언 수집의 `src/core/blueprint/utils/analyze/collectDeclarations.ts:47-60`이 같은 `gates` 목록에서 discriminator 뒤에 active를 넣습니다(154-163행은 `if` 추가 위치). 표는 앞 항만 제공합니다. 앞 항이 거짓이면 뒤 항을 호출하지 않고, 참이면 그 자리에서 뒤 항을 기존 식 평가기로 평가합니다. 뒤 항도 별도로 (나)의 자격을 얻었을 때만 결과를 재사용합니다. 작성자 식의 임의 AND를 앞 항·뒤 항으로 새로 분해하지 않습니다.

### 3.2 결과 재사용의 자격

다음 조건이 모두 성립해야 합니다.

1. 컴파일 단계에서 식의 읽기 경로가 완전하게 확정되고, 결과가 그 입력들만의 순수 함수라는 증명이 있습니다.
2. 발생에 결합한 읽기 경로가 모두 게이트 없는 선언 키이며 각 이름의 엔트리가 정확히 하나입니다(§3.1의 판별 키 사본 포함). 조건부 키, `@`, 호스트 전체 읽기, 선언 밖 extras, 동적 배열 선택은 첫 구현의 재사용 대상에서 제외합니다. 절대·부모 상대 경로는 결합한 대상에서 같은 증명이 있을 때만 허용합니다.
3. 직전의 **실패 없는 커밋**에 같은 청사진·같은 발생 수명·같은 식의 성공한 boolean 결과가 있습니다. `false`도 결과입니다. 미평가·예외·실패한 정착의 거짓을 성공 캐시와 혼동하지 않습니다.
4. 이번 정착 전체에서 읽기가 건드려지지 않았고, 원래 평가 자리에서 §4.2의 현재 동일성 검사를 통과합니다. 뒤의 파생·기본값 채움·전이·복구·경로 이동과 유효 스키마 변경도 다시 검사합니다. 쓰기가 밀어 넣은 세대 번호만으로 자격을 판정하지 않습니다.

현재 `BlueprintExpression.dependencies`와 `BlueprintGate.evaluationReads`만으로 순수성과 완전성을 주장할 수 없습니다. `createDynamicFunction`은 `new Function`과 블록도 허용하고, `evaluationReads`는 상대 경로를 부모 오름 수로 줄이며 `@`를 제외합니다. 따라서 컴파일러에 비실행 정적 인식 결과를 추가합니다. 첫 재사용 문법은 정적 경로·원시 리터럴·괄호·boolean 조합·엄격 비교 등 입력 의존을 완전히 증명할 수 있는 식입니다. 미인식 호출·외부 변수·부작용 가능 식은 dependencies가 짧거나 비어 있어도 기존 경로에 남깁니다. 단순한 `./enabled === true && ./mode !== 'off'`는 표 꼴이 아니어도 이 순수 읽기 자격을 얻을 수 있습니다.

읽는 키의 존재가 무조건이라는 사실과 읽는 값이 불변이라는 사실은 별개입니다. 본체 키라도 gated overlay가 투영 제어를 바꾸거나 파생 규칙이 값을 다시 쓰면 무효화 대상입니다. 청사진에서 그런 기여와 역의존 에지를 누락하지 않습니다. 오류가 난 커밋, 예산 초과 후 복구, 새로 들어온 발생, load/reset/재대조, 배열 재인덱싱은 해당 결과를 버리거나 다시 증명합니다.

### 3.3 97C-02 이후 하나의 비교를 쓰는 표 키

97C-02의 별도 결함 수정 뒤 기준 판별 게이트는 BLUEPRINT-017대로 `===`입니다. 표의 비교도 하나이며 비교 방식별 그룹·표·음수 0 전용 키를 만들지 않습니다. 유한 원시 리터럴에 대해서는 `===`와 목록 포함이 같은 선택 결과를 내므로 JavaScript `Map`을 값 bucket으로 쓸 수 있습니다.

- 문자열 `'1'`과 수 `1`을 다른 키로 유지하고 문자열 변환·검증기 강제 변환을 하지 않습니다.
- `null`, 키 없음/투영상 없음(`undefined`), `false`, `0`, `''`를 구별합니다. `=== null`은 없음에서 거짓입니다. 첫 문법에는 undefined 리터럴이 없으므로 없음은 보통 빈 bucket입니다.
- `0`·`−0`은 같은 bucket이며 수 `1`과 문자열 `'1'`은 다릅니다. 런타임 `NaN`은 어느 bucket도 선택하지 않습니다.
- 문자열·유한 수·boolean·`null` 이외의 리터럴은 표 자격이 없습니다. `undefined`·`NaN`·Infinity·객체·배열을 가진 판별 기술도 기존 `===` 평가로 보냅니다. 객체를 구조 비교하거나 비유한 값을 문자열 키로 바꾸지 않습니다.

변환 판별 기술의 bucket 원천은 작성 스키마의 `const`·`enum` 재해석이 아니라 **정적 연언 교차가 끝난 `gate.condition.values`**입니다. 97C-02의 red→green을 먼저 고정한 뒤 그 비교를 네 모드의 공통 기준으로 사용합니다. 비유한·참조 리터럴의 fallback, 기존 겹침 검사 및 빈 교차 오류를 유지합니다.

## 4. 청사진 자료와 발생별 상태

### 4.1 정적 계획

식 컴파일 뒤, 노드·조각 동결 전에 유한 템플릿별 계획을 만듭니다. `GateSelectionGroup`은 호스트 템플릿 identity, union 작성 위치, 키 경로, 기존 순서의 분기 ID와 gate 참조를 가집니다. 같은 키라도 호스트·union 위치·읽기 의미가 다르면 별도 그룹입니다. 비교 방식은 §3.3의 하나를 사용합니다.

값 bucket은 그 값에 해당하는 모든 분기 ID의 불변 순서 목록입니다. 한 값이 여러 목록에 속하면 모두 들어가며 첫 분기 하나를 반환하지 않습니다. bucket별 반복 회원 확인이 있으므로 한 번 만든 ID 색인을 재사용할 수 있습니다. 조회마다 `B`칸 결과 배열을 초기화하거나 Set을 새로 만들지 않습니다. 선택되지 않은 모든 표 게이트의 앞 항은 암묵적 `false`입니다.

선언·직접 에지의 게이트 수집 순서, 무게이트 본체, 게이트 → 기여 선언/자식 에지, 순수 재사용 식 → 정확한 읽기 경로를 같은 분석에서 색인합니다. 재귀 참조는 템플릿 에지를 보유하고 런타임 발생을 청사진에서 펼치지 않습니다. 정적 계획은 `src/core/settle/utils/compute/computeNode.ts:74-135`가 현재 만드는 **같은 gate identity 집합과 최초 수집 순서**를 내야 합니다. 매 바퀴 새로 발견되는 이동 게이트와 배열의 실제 엔트리도 같은 시점에 결합·추가하며, 정적 목록 하나로 고정하지 않습니다. `gates.length > 0`에 따른 `primeHost`·즉시 반영과 `src/core/settle/utils/gates/getGateBudgetCap.ts:65-80`의 같은 바퀴 상한을 유지합니다.

**잠복 owner 축약은 아직 적용하지 않습니다.** `src/core/settle/utils/write/getDependencyIndex.ts:69`의 페이로드 owner는 `stateDirtyNodes`·`dependencyOwnerPaths`를 거쳐 `src/core/settle/utils/compute/publishStateKeys.ts:20-23`, `src/core/settle/utils/commit/commitExitPolicyValues.ts:52-56` 및 배달 후보에 닿습니다. 축약 전후 이 셋의 구성원·값·관측 순서가 같다는 차등 증거를 먼저 제출해야 합니다. 증명되지 않은 축약으로 B2/B4/B5 계수나 기준 (1)을 통과시켰다고 보고하지 않습니다.

새 메타데이터는 내부 descriptor/계획으로 전달하고 `controls`나 공개 노드 멤버를 추가하지 않습니다. 소비자가 settle인 정보만 blueprint 진입점에 이름으로 내보냅니다. 정적 계획 안에 현재 값·활성 집합·커밋 결과를 넣지 않습니다.

### 4.2 발생별 조회와 무효화

결과 캐시의 단위는 `(runtime, occurrence identity, gate/group identity, bound host/edge, appearance generation)`입니다. `gate.hostPath`의 첫 템플릿 위치나 `schemaPath` 하나만을 키로 사용하지 않습니다. 기존 `getGateRegistry`의 `locate`/`resolveGateOccurrence`/`bindGateHostPath` 결합을 사용합니다. 공유 템플릿을 참조하는 두 호스트, 배열의 두 아이템, 재귀의 두 깊이는 각각 독립 결과를 가집니다.

**표·재사용·암묵적 false 경로에서도 원래 평가 자리마다 `locate(owner, gate, edgeName)`를 유지합니다.** 현재 `src/core/settle/utils/gates/evaluateGate.ts:32-35`처럼 `appliesWhen`을 먼저 평가하고 거절되면 단락한 뒤, 실제 해당 게이트 자리에 도달했을 때 호출합니다. `src/core/settle/utils/gates/getGateRegistry.ts:86-100`의 `register`와 늦은 `add`는 관측 가능한 부작용입니다. 이때 갱신되는 발생 목록과 `byLocation`의 등록(같은 파일 142-152행)이 뒤의 `mayChangeAt` 결과를 바꾸므로, bucket을 찾았다는 이유로 생략하지 않습니다. §2의 두 owner 자리에서 각각 원래 인자로 호출하며, 후보 축약도 이 등록 효과를 누락해서는 안 됩니다. 늦은 추가가 없다는 증명은 이 설계에서 가정하지 않습니다.

그룹 슬롯은 정적 계획 참조, 현재 읽기의 동일성 묶음, 현재 bucket, 마지막 실패 없는 커밋의 결과/증명 참조를 같은 객체 모양으로 보유합니다. 일시 평가와 커밋 결과를 분리합니다. 발생 수명을 구별하는 appearance identity는 읽기 유효성을 대신하는 세대 번호가 아닙니다. 수명 종료·노드 교체·load/reset/재대조·재인덱싱에서는 해제 또는 재결합합니다.

판별 게이트의 동일성 묶음은 **현재 구조에서 다시 찾은 `hostNode`, 그 `emit`, 호스트 자체의 미계산 여부, `extras`, 호스트 투영 값 `projectedHostValue`, `extrasExposed` boolean**입니다. `hostNode`는 자리마다 `locate`가 준 `hostPath`를 루트부터 현재 `structure`를 따라 해석해 얻습니다(`src/core/settle/utils/gates/evaluateGate.ts:40-46`). 붙잡아 둔 옛 호스트 참조나 등록된 경로 하나를 현재 노드의 증거로 삼지 않습니다. 호스트가 있을 때 미계산은 `changedRaw.has(hostNode.path) && !changedNodes.has(hostNode)`이며, emit 자체가 undefined인 경우와 함께 기준 reader의 노출 의미를 따릅니다(`src/core/settle/utils/gates/readProjectedValue.ts:13-17`). `extrasExposed`는 기준 평가기의 `projectedHost`라는 boolean과 같은 뜻이고, `projectedHostValue`라는 값 참조와 구별합니다. 현재 호스트와 조상의 branch/raw 조건 및 루트 호스트 투영 값에 따른 노출 여부를 보존합니다(`src/core/settle/utils/gates/evaluateGate.ts:48-57`).

**바퀴에 들어갈 때 결합한 읽기 경로별로 조상을 한 번 검증하고, 하나라도 wrong-kind·누락·불확실한 노출에 걸리면 그 읽기의 표·재사용을 끄고 기존 평가로 되돌립니다.** 기준 reader의 조상 검사와 필요한 공표는 `src/core/settle/utils/gates/readProjectedValue.ts:34-48`의 경로 순회이므로 O(1)이 아닙니다. 사전 검증은 값을 미리 읽거나 공표하지 않고 빠른 경로의 자격만 정하며, 실제 공표는 원래 평가 자리에 남깁니다. 바퀴 중 조상의 구조·종류·raw·유효 스키마·투영 노출이 바뀌지 않음을 증명하거나 해당 변경 경계에서 검증을 폐기할 수 있어야 합니다. 새 발생이나 조상 변경으로 그 증거가 없어지면 그 바퀴의 남은 해당 읽기도 기존 평가를 사용하고 다음 바퀴 진입에서 다시 검증합니다. 기존 평가가 조상 공표 후 읽지 않기로 하는 의미를 오래된 자식의 emit으로 대체하지 않습니다.

자격을 통과한 판별 읽기는 기준과 같은 자리의 `flushPendingOutput` 뒤 위 묶음을 비교합니다. 하나라도 다르면 기존 reader로 **다시 읽고** 현재 노드·미계산·extras 노출을 포함한 묶음을 갱신합니다. 호스트 교체 후 조상 증명이나 읽기 의미를 보장할 수 없으면 묶음 갱신으로 계속 진행하지 않고 기존 평가로 되돌립니다. 식 게이트의 각 자격 키도 현재 구조에서 찾은 노드 identity·`emit`·미계산 구간을 비교하며 같은 조상 규칙을 적용합니다. 여러 읽기의 순수 식은 키별 묶음 비교가 O(1), R개 묶음 비교가 O(R)입니다. **이 복잡도는 묶음의 비교만을 뜻합니다.** 호스트 재탐색과 조상 검증은 경로 깊이 D에 비례하므로 별도 계수·비용이며, 전체 읽기나 전체 평가 자리가 O(1)이라고 주장하지 않습니다.

같은 원본·같은 자식 노드라도 읽기 값이 달라지는 모든 경계를 덮어야 합니다: `src/core/settle/utils/compute/primeHost.ts:50-58`의 기준 스키마 복원과 분기 overlay, `omitEmpty`에 따른 누락/노출, 루트 `selectNodeSchema`의 유효 스키마 변경, 미계산 구간 시작/끝, `src/core/settle/utils/gates/readProjectedValue.ts:36-40`의 wrong-kind 조상, 같은 이름·다른 종류 엔트리의 선행 활성(`src/core/settle/utils/compute/selectChildren.ts:197-209`). 조상 자격과 현재 묶음으로 이 의미를 보장할 수 없는 읽기는 기존 평가를 사용합니다. 정적 read-path 색인이나 `changedRaw`만으로 투영 유효성을 대신하지 않습니다.

read-path 색인은 형상 dirty 판정(§6.2)과 정착 중 읽기 접촉 기록을 각각 관리합니다. 두 목적의 의미를 합치지 않습니다. 실제 평가 자리에 도달하면 위 동일성 검사를 항상 수행하며, 단순한 `/other` 잎 입력처럼 기준도 바퀴를 열지 않는 경우에는 자리에 도달하지 않아 게이트별 검사도 0입니다. 슬롯별 dependencies를 매 입력에 전수 순회하지 않고 교차한 읽기·그룹만 접촉 표시하며, 영향을 받지 않은 커밋 descriptor는 공유합니다.

`dirtyPaths`는 계산 후 삭제되므로 그 집합의 현재 크기를 커밋 저장 자격으로 쓰지 않습니다. 마지막 평가 이후 읽기가 다시 건드려졌다는 접촉 기록을 정착 동안 보유합니다. 실제 읽기 재계산·통째 쓰기/로드·스키마/투영 변경·자동 쓰기·복구를 포함하며, 읽기 세대 번호를 밀어 넣어 동일성 검사를 생략하지 않습니다. 단순 조상 조립과 읽기 자체의 변경을 구별하지 못하면 재사용을 거절합니다.

**결과 슬롯은 실패가 하나도 없는 커밋에서만 저장합니다.** 표현식/가드 실패·공유 충돌·예산 초과·`restoreSourceB` 복구·degraded 커밋에서는 성공한 다른 게이트의 일시 결과도 새 성공 슬롯으로 저장하지 않습니다. 마지막 평가 뒤 읽기가 건드려졌으면 해당 슬롯을 저장하지 않고, 다시 평가하여 이후 접촉이 없다는 증거가 있는 슬롯만 저장합니다. 커밋에서 변경된 자격 슬롯만 갱신하며 모든 B개 결과를 복사하지 않습니다.

**슬롯의 예외 여부는 평가 전후의 `(context.gateThrowVersion ?? 0)`을 비교하여 판정합니다.** 값이 증가한 호출의 false는 예외 결과이며 성공한 false로 저장하지 않습니다. 현재 catch는 예외마다 version을 올리지만 반복 예외와 `mountingGuardPass`의 예외는 새 실패를 추가하지 않습니다(`src/core/settle/utils/gates/evaluateGate.ts:119-128,142-143`). `failures`의 길이나 증가 여부로 슬롯의 성공을 판정하지 않습니다. 정착 시작 시 version도 보유하여 커밋까지 증가했다면 실패 없는 커밋 자격을 거절하므로, 실패 목록에 새 항목이 없어도 그 정착의 다른 일시 결과를 저장하지 않습니다. 이후 호출이 성공해도 이미 발생한 예외를 지우지 않으며, version과 기존 throwing exit 처리는 그대로 유지합니다.

## 5. 바퀴의 실행과 전수 평가와의 동등성

### 5.1 같은 위치에서 읽고 같은 순서로 적용

`primeHost`는 기존 무게이트 기준을 만듭니다. 초기 dirty 자식 계산 뒤, §4.2의 조상 자격을 검증하고 첫 표 게이트의 **원래 평가 위치**에서 키를 읽고 bucket을 찾습니다. 루트는 `selectNodeSchema`의 해당 선언 자리이고, 비루트 호스트는 부모의 `selectChildren`에서 owner가 부모인 자리와 호스트 자신의 `selectChildren`에서 owner가 호스트인 자리를 모두 유지합니다. 각 자리의 기존 `appliesWhen` 단락 뒤 `locate`를 호출하고 그 결합의 host/edge/L·현재 호스트 재탐색·미계산·extras 노출·공표를 유지합니다. 모든 그룹을 바퀴 앞에서 미리 읽지 않습니다.

active 식의 키는 기존 `resolveDependencyPath`와 `readProjectedValue`가 읽는 바로 그 투영에서 가져옵니다. discriminator 기술의 키는 기존 평가기가 만드는 host 입력과 projected extras 결합의 의미를 공유한 판별 키 reader에서 가져옵니다. `node.raw`, 최초 템플릿 값, 직전 emit으로 대체하지 않습니다. 정상적인 본체 키에서는 두 읽기가 같은 값이지만, null·wrong-kind host·extras·미공표 투영에서는 그 사실을 가정하지 않습니다. 같은 읽기 의미를 증명할 수 없는 발생은 표 경로를 사용하지 않습니다.

루트의 호스트 선언 → 직접 에지 순서, 비루트 호스트의 부모 선택 자리와 호스트 자신의 자식 선택 자리, 각 선언의 기존 `gates` 순서를 유지합니다. 앞선 gate의 거절, `appliesWhen`, 상속 gate, 분기 뒤 항의 short circuit도 그대로입니다. 자식의 진입/퇴장·계산과 pending output 공표를 기존 자리에서 수행하여 뒤 게이트가 앞의 즉시 반영을 읽게 합니다. 정적 bucket 순서는 값 입력 순서가 아니라 기존 declaration/entry 전순서입니다.

같은 바퀴와 후속 안정 확인 바퀴에서도 각 평가 자리의 동일성 검사를 거쳐 bucket/결과를 공유합니다. 참조나 미계산 구간이 달라지면 다시 읽으며, 그 값도 달라지면 bucket을 다시 조회합니다. 참조가 달라져도 다시 읽은 키 값이 같은 경우에는 그 값의 불변 bucket을 공유할 수 있습니다. §6.1의 lookup 1은 키 값이 한 번 바뀌는 고정 fixture의 목표이며, 기본값·derived·overlay가 키 값을 다시 바꾸는 실행의 조회를 숨기지 않습니다.

B4는 bound-read 계획 자료를 공유할 수 있어도 **판별 게이트 위치마다의 flush 호출과 모든 기존 공표 위치를 유지**합니다(`src/core/settle/utils/gates/flushPendingGateReads.ts:80,94`, `src/core/settle/utils/gates/readProjectedValue.ts:61`). 공표를 앞당기거나 뒤로 미루거나 후속 자리의 호출을 합치지 않습니다. `src/core/settle/utils/compute/updateOutput.ts:42-53`의 `changedNodes` 삽입 순서는 `src/core/settle/utils/commit/commitGlobalState.ts:28`, `src/core/settle/utils/commit/markCommitDeliveries.ts:101-103`, `src/core/record/utils/markSchemaNodeEvent.ts:15-26`의 배달 방문으로 이어지므로 공표와 두 순서를 함께 비교합니다(EVENT-005). opaque guard와 recursive read plan도 기존 eager 공표를 사용합니다.

### 5.2 귀납 논증

기준 실행 F는 표·재사용을 모두 끄고 기존 순서로 모든 필요한 게이트 함수를 평가하는 실행입니다. 최적화 실행 O도 같은 무게이트 출발점에서 시작합니다.

각 원래 gate 평가 직전에 F와 O의 현재 투영·형상·pending 입력이 같다고 가정합니다. 같은 `appliesWhen` 단락과 자리별 `locate`가 같은 발생 등록을 남깁니다. fallback은 같은 함수를 같은 입력으로 호출합니다. 표 앞 항은 조상 자격과 그 자리의 flush·현재 호스트를 포함한 동일성 검사 후 읽은 키를 `===`로 조회하므로 F의 비교 결과와 같습니다. 커밋 결과 재사용은 version 증가가 없는 실패 없는 저장과 현재 동일성 검사 및 완전한 순수 읽기 증명으로 같은 boolean을 제공합니다. 뒤 항은 이 앞 결과를 같은 순서로 소비합니다. 이후 같은 진입·퇴장·계산·퇴장 표시 정리를 즉시 적용하므로 다음 평가 직전의 상태도 같습니다. 원본이 그대로인 스키마/투영 변화도 다시 읽는 조건과 §6.2의 dirty 동치가 이 귀납 가정을 유지합니다.

따라서 각 바퀴의 `schemaChanged/changed/outputChanged`가 같고 안정 확인, 호스트 예산, 파생·전이 라운드의 쓰기와 수렴도 같습니다. 커밋 결과·개정·배달·오류의 드러남 역시 같습니다. 표 lookup 횟수 감소를 이유로 바퀴나 안정 확인 자체를 삭제하지 않습니다. 예외 기록은 순수 성공 결과 캐시와 별개입니다. `gateThrowVersion`이 증가한 평가 결과는 새 실패 기록의 유무와 관계없이 저장하지 않아 이후 호출의 version과 throwing exit 처리가 유지됩니다.

### 5.3 여러 분기, 무일치, 공유 충돌

`['a','b']`를 갖는 분기 1과 `['b','c']`를 갖는 분기 2의 작성자 식에서는 `b → [1,2]`입니다. 두 분기의 뒤 항을 기존 순서로 적용합니다. `oneOf`라는 이유로 하나만 고르지 않습니다. 같은 이름·다른 종류를 동시에 선언하면 기존 `SHARED_NODE_CONFLICT`를 그대로 기록하며 전순서상 앞선 종류를 살린 뒤 커밋·통지하고 사슬 끝에서 던집니다. 같은 노드의 유효 형 교집합이 빈 `typeConflict`도 기존 실패 기록과 `cause: 'sharedConflict'`를 사용합니다. 다중 활성 oneOf 경고와 경고 중복 억제도 유지합니다(ERROR-159·164 및 29C-03).

명시 discriminator는 현재 `readDiscriminatorBranches`가 분기 간 값 겹침을 `DISCRIMINATOR_MISMATCH`로 거절합니다. **그 정적 오류를 없애 겹침을 허용하는 변경은 이 설계에 없습니다.** 여러 분기 bucket은 작성자 active 목록의 합법적인 겹침을 처리하고, 유효한 변환 결과를 충실하게 담기 위한 자료 구조입니다. 기존 정적 연언 태그 교차·빈 교차 오류·null 분기 제외도 유지합니다.

어느 bucket에도 없는 값에서는 표 대상 앞 항이 모두 거짓입니다. 무게이트 본체·상속 overlay·판별 키 없는 분기·별도 fallback gate는 평소대로 남거나 평가됩니다. discriminator 뒤의 분기 식은 호출하지 않습니다. nullable의 null **스키마 분기**를 판별 대상에서 제외하는 것과, 객체 분기의 판별 키 값이 **리터럴 null**인 것은 구별합니다. 후자는 기존 비교 결과와 같은 bucket입니다.

### 5.4 결과 재사용과 고정 출발점

캐시에 저장하는 것은 `g(inputs)`의 성공한 boolean 또는 같은 입력 함수들의 불변 결과 descriptor입니다. `A_previous`를 시작 형상으로 넣지 않습니다. 바퀴가 필요한 때 `primeHost`는 여전히 고정 기준을 만들고, 이후 기존 순서의 평가 자리에서 descriptor를 읽어 분기를 켭니다.

SETTLE-044의 A/B/C 양의 순환 반례는 읽는 키의 존재가 gate에 달려 있으므로 재사용 자격 밖입니다. C가 꺼지면 A/B도 고정 출발점에서 꺼져야 합니다. 이전 A/B의 활성 상태나 이전 true를 되살릴 수 없습니다. 같은 현재 입력에 서로 다른 이력을 준 시험도 같은 최소 고정점에 도달해야 합니다.

## 6. 분기 수별 계수와 U19

### 6.1 판별 키 전환의 산술 목표

BF와 같은 본체 `/kind`, 분기별 payload 셋, 한 값에 분기 하나, 뒤 항 없는 조건을 고정합니다. 전환 한 번에서 게이트 관련 계수의 목표는 다음과 같습니다. 양방향 `kind_0 ↔ kind_4`를 각각 셉니다.

| B | 기존 함수 평가(진단) | O의 표 대상 함수 평가 | 키 현재 값 읽기 | 실제 table lookup | 기존 자리의 결과 참조 | 호스트 schema/children 바퀴 | 전이 round |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 40 | 0 | 1 | 1 | 최대 16 | 2/2 | 1 |
| 10 | 80 | 0 | 1 | 1 | 최대 16 | 2/2 | 1 |
| 20 | 160 | 0 | 1 | 1 | 최대 16 | 2/2 | 1 |
| 40 | 320 | 0 | 1 | 1 | 최대 16 | 2/2 | 1 |

0번 평가의 거짓 분기를 B개 순회해 얻지 않습니다. lookup은 선택 bucket 하나를 돌려주며 비선택 gate의 기본값은 거짓입니다. 실제 old/live 퇴장 후보와 신규 선택 후보는 두 분기뿐입니다. 두 바퀴에서 두 후보 각각의 root/세 payload 선언에 결과 참조를 남기더라도 상한은 `2 × 2 × (1+3) = 16`입니다. 신규 선택 분기만의 참인 결과 참조는 `2 × (1+3) = 8`이고, 기존 분기의 거짓/퇴장 확인을 별도로 셉니다. 이 결과 참조를 실제 table lookup이라고 세지 않습니다. 그 전이 payload 방문은 분기당 셋으로 일정합니다. 고정 출발점 이후 이전 live 가지에서 사라지는 에지를 처리하는 비용은 이 실제 두 가지에 포함되며 B개의 잠복 가지를 훑지 않습니다.

일반식 뒤 항이 붙으면 그 함수 호출 수는 **첫 항이 참인 분기의 원래 평가 위치 수**입니다. 선택 분기 수가 m이고 위치 수가 위 사례와 같으면 최대 `8m`입니다. 전체 B에 의존하지 않지만 실제로 같은 값에 N개 분기가 매칭하면 m=N이며 그들은 무관한 분기가 아닙니다. 뒤 항이 조건부 키를 읽으면 호출을 접지 않고 기존 매 바퀴 평가를 유지합니다.

여러 호스트/그룹에서는 lookup 수가 `Σ(조회가 필요한 읽기 세대 수)`이고, 평가 수는 `fallback의 원래 호출 + 실제 매칭 분기의 비재사용 뒤 항 호출`입니다. 이것이 중첩 union·재귀 발생의 비용 모델입니다. 실제로 바뀐 호스트·깊이·매칭 수를 늘리는 시험을 “같은 전환”의 B 축과 섞지 않습니다.

위 표의 키 값 읽기와 lookup은 §4.2의 자리별 `locate`·현재 호스트 재탐색·미계산/노출 검사·바퀴 진입의 조상 검증 횟수를 대신하지 않습니다. 묶음이 같아 키 값을 다시 읽지 않는 자리도 이 작업은 별도로 셉니다. 경로 깊이 D는 위 B 축 fixture에서 고정하고, 중첩/재귀 행에서는 D에 따른 비용도 기록합니다. 필요한 등록이나 경로 순회가 B에 비례해 남으면 lookup 목표를 달성해도 전체 기준 (1)은 미충족입니다.

### 6.2 U19의 고정된 무관한 키 입력

97C-03의 **판정 행**은 조각 수 N만 5/10/20/40으로 늘립니다. U19는 N개의 활성 조각, 그 게이트가 읽는 무게이트 본체 키, 별도의 본체 `/other` 입력으로 구성하고 조각마다 같은 종류의 공유 필드·같은 overlay를 사용합니다. 실제 live 필드 폭과 입력·출력 크기는 네 행 모두 고정하며, 필드 수와 입력/출력 바이트 수를 행마다 함께 기록해 분모를 확인합니다. 같은 길이의 `/other` 값 전환을 사용합니다. 첫 로드의 N개 평가·색인 준비는 갱신 계수에서 제외하되 준비·메모리 비용에 포함합니다.

누적 재계산 조회 `/other`는 게이트의 읽기 에지와 만나지 않습니다. 커밋 결과 descriptor가 그대로 유효하다는 판정을 호스트에서 한 번 합니다. gate별 dirty 확인 N회, true 결과 N개 복사, N개 활성 ID 재작성, N개 pending read 등록을 하지 않습니다. leaf 입력에서 기존 `computeNode`의 형상 dirty 부재 경로를 사용하여 dirty 자식만 계산합니다. 이것은 이전 활성 집합을 가설로 **바퀴를 시작**하는 경로가 아니며, 동일 입력 함수의 결과가 변하지 않는다는 증명 아래 기존의 형상 불변 계산 경로를 사용하는 것입니다.

| 활성 조각 N | 성공 결과 descriptor 판정 | 재평가 함수 호출 | table lookup | 게이트별 재사용 검사 | 무관한 분기 기여 방문 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 1 | 0 | 0 | 0 | 0 |
| 10 | 1 | 0 | 0 | 0 | 0 |
| 20 | 1 | 0 | 0 | 0 | 0 |
| 40 | 1 | 0 | 0 | 0 | 0 |

현재 `mayChangeAt`은 레지스트리 전체가 아니라 해당 위치의 발생 목록을 순회하고, `mayChangeOwnDeclarationAt`은 own 목록을 순회합니다. 그 목록도 분기 수에 선형일 수 있습니다. U19는 게이트 재평가·게이트별 재사용 검사·무관한 분기 기여 방문이 **모두 0**이어야 하며, registry 발생 확인·N개 결과 복사로 비용을 옮겨도 통과하지 않습니다. read-path 색인은 다음의 현재 `readsChanged` 의미를 정확히 보존해야 합니다.

- `changedRaw`가 비어 있으면 현재처럼 거짓입니다. 비어 있지 않으면 루트 읽기 `''`는 항상 참이며 `'@'`는 무시합니다. 읽기와 changed 경로가 같거나 조상/자손으로 교차하면 양방향 모두 참입니다(`src/core/settle/utils/gates/getGateRegistry.ts:172-186`).
- 판별 감시 경로는 호스트 전체가 아니라 `${hostPath}/${escapeSegment(propertyName)}`입니다(159-163행). opaque `if`·미인식 식을 포함해 현재 모든 발생의 감시 경로를 색인합니다. 표/재사용 자격만으로 dirty 대상을 줄이지 않습니다.
- own 발생과 edge 발생 및 `evaluationHostPath`를 현재대로 구별합니다(121-126행). `locate`가 뒤늦게 추가한 발생도 즉시 현재 위치 조회에 포함하되 own 목록의 소속을 임의로 바꾸지 않습니다(89-100행). 제거·경로 이동·새 배열 발생도 같은 생명주기로 반영합니다.
- **매 `registerRecalculation` 호출마다** 누적 `changedRaw`와 그때의 누적 `dirtyPaths`를 질의합니다(`src/core/settle/utils/write/registerRecalculation.ts:35-49`). dirty 경로의 `mayChangeAt`이 참이면 그 경로를, 비루트의 own 판정이 참이면 부모 경로를 `shapeDirtyPaths`에 더합니다. 전이의 반복 호출을 새 변화분만으로 처리하지 않습니다. `src/core/settle/utils/transition/restoreSourceB.ts:37-38`의 집합 재설정도 따라갑니다.

시험은 모든 재계산 등록 직후, 같은 입력 이력의 전수 기준과 색인 경로의 **`shapeDirtyPaths` 집합을 그 자리에서 비교**합니다. 루트·조상/자손·`@`·판별 watch·own/edge·늦은 locate·누적 반복 호출·복구 후 재등록을 각각 덮습니다. 조금이라도 더 좁은 판정으로 기준 실행의 바퀴를 건너뛰면 SETTLE-044 위반으로 실패시킵니다. 이 dirty 판정은 §4.2의 투영 동일성 검사 및 마지막 평가 이후 접촉 기록과 별개의 계약입니다.

부모 객체의 partial/whole write, load, default·derived에 의한 실제 읽기 키 재계산, 조건부 host 교체는 이 leaf 입력과 구별합니다. 전수 실행이 바퀴를 돌리는 진입에서는 최적화도 동일한 바퀴 수와 즉시 반영을 유지합니다. 재사용이 된다는 이유로 그 진입의 바퀴를 임의로 생략하지 않습니다. 실제 live 자식·출력 폭까지 N배로 늘어나는 사례는 그 필수 출력/배달 비용을 별도 계수로 기록합니다. 모든 형상의 모든 키 입력을 총 O(1)로 만드는 설계는 아닙니다.

### 6.3 B2/B4/B5와 전체 기준 (1)의 연결 조건

다음은 두 열린 범위를 소비하는 코드 수준 연결입니다. 새 gate 의미나 출발점 변경을 열지 않습니다.

| 진단 항목 | 반드시 함께 제거할 선형 작업 | 보존할 순서/의미 |
| --- | --- | --- |
| B2 | selected IDs를 한 번 만들고 병합·커밋에 공유; controls 목적별 정적 기여 색인에서 실제 선택된 ID만 조회 | node/fragment/children 우선순위, 이탈의 committed fallback, 상대 host |
| B4 | 같은 bound-read 계획의 자료를 공유하고 유효한 bucket을 재사용; 자리별 locate·현재 호스트 재탐색·flush·묶음 비교와 바퀴 진입의 조상 검증을 보존 | 늦은 등록과 뒤의 mayChangeAt, 미계산·extras 노출, 모든 공표 위치, `changedNodes` 삽입·배달 방문 순서, 조상 자격 실패·recursive/opaque fallback |
| B5 | 게이트 → root declaration/child contribution/무게이트 baseline 색인; bucket + prior/live/입력/latent + `pendingExits`·`throwingGateExits` + fallback 후보 | authored 에지 전순서, 경로와 종류, 없음/null/extras, 실제 퇴장·표시 정리, 공유 이름 충돌 |

`computeNode`의 매번 `3B+2` 정적 후보 수집은 §4.1의 같은 게이트 집합·순서를 내는 계획 참조로 대체하고, 동적인 배열 엔트리·이동 게이트 발견과 상한 갱신을 유지합니다. `primeHost`는 같은 무게이트 기준을 만듭니다. `selectChildren`은 bucket 기여, 실제 prior/live 에지, 분배된 입력/latent 키, 같은 정착 앞 바퀴의 **`pendingExits` 키(경로·종류)**와 **`throwingGateExits` 구성원**, fallback 에지를 기존 순서로 합칩니다. 거짓 앞 항의 엔트리도 이 후보에 해당하면 퇴장 표시 정리를 실행합니다. generic 식/opaque if의 필요한 기존 순회도 유지합니다. 잠복 owner 축약은 §4.1의 상태 키·나감 정책·배달 후보 동치 증명 전에는 하지 않습니다.

이 순서 합치기는 정적 ordinal을 가진 이미 정렬된 목록들의 cursor 병합으로 합니다. 갱신 때 전체 후보를 생성한 후 sort/filter하지 않습니다. fallback이 읽는 조건부 키의 즉시 변화가 있는 구간을 뛰어넘지 않으며, 실제 live·latent·입력·퇴장 대기·던짐 표시 후보를 빠짐없이 포함합니다. 무일치 전환에서도 앞 바퀴에 나간 노드의 퇴장 정책과 latent 보관을 처리합니다.

검증 보고서 발견 1의 반례를 예정 시험으로 고정합니다. 페이로드의 게이트가 `[판별 앞 항, 던지는 일반 active]`일 때 첫 바퀴는 앞 항 참·뒤 항 예외로 노드를 퇴장시킵니다. 전이 라운드의 derived가 kind를 바꾸어 앞 항이 거짓이 되면 prior에는 노드가 없고 `pendingExits`에만 남습니다. 기준 `src/core/settle/utils/compute/selectChildren.ts:172-180`은 거짓 엔트리에서도 `throwingGateExits` 표시를 지우므로 최적화도 지워야 합니다. 00·11을 포함한 네 모드에서 이 표시와 `src/core/settle/utils/transition/finalizeExits.ts:73-78`의 퇴장 정책 결과를 비교합니다.

진단의 control 선언 `3B+12`, parent 선언 `9B+9`, pending occurrence `3B−13`, dirtyChildren의 무관한 잠복 owner 등도 이전 방식으로 남아 있으면 전체 기준 (1)은 미충족입니다. 위 계수는 **승인 후 구현이 충족해야 할 산술 목표**이고, 현재 통과 보고가 아닙니다. 각 위치의 실제 loop counter와 전체 전환 시간으로 확인한 뒤에만 전체 판정합니다. 시간 계측은 현재 측정 중인 다른 작업과 겹치지 않는 후속 작업으로 남깁니다.

## 7. 예정 변경 파일과 함수별 루프 모양

모든 경로는 패키지 루트 상대입니다. 이 문서 변경으로 아래 최적화를 구현하지 않습니다. 97C-02의 별도 비교 수정 뒤, 각 최적화의 DETAIL 계약/수용 기준을 먼저 갱신하고 전수 기준의 차등 시험을 고정한 다음 구현합니다. 명시적인 내부 blueprint 소비 경계가 추가될 때만 INTENT를 갱신합니다.

| 파일 / 함수 | 예정 변경 | 87라운드 루프 모양 |
| --- | --- | --- |
| `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts` / `createDynamicFunction` | 기존 경로 치환 결과와 리터럴 토큰을 비실행 인식기로 전달; 평가 함수 생성은 유지 | 기존 컴파일 한 번; 토큰은 인덱스 `while` 한 번, 사용자 함수 실행 없음 |
| `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts` / `compileBlueprintExpressions` | compiled descriptor에 선택 형태와 완전한 순수 읽기 증명 기록 | 기존 node/declaration/control `for` 안에서 한 번 기록; 추가 전체 분석 없음 |
| `src/core/blueprint/utils/analyze/createBlueprintGate.ts` / `createBlueprintGate` | discriminator 기술·작성 active의 gate identity와 기존 순서를 보존 | gate 생성당 고정 검사; values는 한 번의 인덱스 `for` |
| `src/core/blueprint/utils/analyze/collectDeclarations.ts` / `collectDeclarations` | 변환 앞 항/자체 active 뒤 항의 대응과 static body 소유 정보를 전달 | 기존 키워드/분기 루프에 기록을 결합; 재귀 복제 없음 |
| `src/core/blueprint/utils/analyze/buildGateSelectionPlan.ts` / `buildGateSelectionPlan` (신설) | 단일 비교 그룹/bucket, 교차 완료 values, 유일 엔트리·단일 의존성 증명, baseline, gate→기여·읽기→그룹 | 템플릿별 declaration/gate를 한 번 `for`; 리터럴 소속 에지마다 한 번 등록; 순서 cursor 병합 |
| `src/core/blueprint/blueprint.ts`, `type.ts`, `index.ts` | 동결 전 계획 생성, 내부 descriptor 계약과 이름 export | 기능 없는 청사진은 공유 빈 계획; 생성 후 매 갱신 재작성 없음 |
| `src/core/settle/utils/gates/getGateRegistry.ts` / `register`, `locate`, `mayChangeAt`, `mayChangeOwnDeclarationAt`, `remove` | 그룹의 발생 결합과 역읽기 색인; 자리별 locate·늦은 등록·수명/이동 무효화 | 원래 자리마다 locate 유지; 최초/늦은 결합 비용 별도 계수; dirty 질의는 changed path trie cursor `while`과 actual affected 그룹 `for...of` |
| `src/core/settle/utils/gates/readGateSelection.ts` / `readGateSelection` (신설) | 현재 호스트 재탐색·미계산·extras 노출을 포함한 묶음과 기존 공표, 차이 시 재읽기; 조상 자격 실패 시 기존 평가 | 키별 묶음 비교 O(1); 호스트 재탐색 O(D)와 바퀴 진입의 경로별 조상 검증 별도; 필요한 lookup |
| `src/core/settle/utils/gates/evaluateGate.ts` / `evaluateGate` | 부모 적용 조건·자리별 locate 후 같은 자리에 표/성공 결과 경로; fallback try/catch와 gateThrowVersion 유지 | 부모 gate는 인덱스 `for`와 첫 거절 `break`; 표 조회 공유 뒤에도 각 자리의 등록 유지; fallback reads 한 `for` |
| `src/core/settle/utils/write/registerRecalculation.ts` / `registerRecalculation`, `getDependencyIndex.ts` / `affected` | 매 호출 누적 집합의 `readsChanged` 동치 질의와 접촉 기록; owner 축약은 세 결과의 동치 증명 후 별도 적용 | changed path/affected owner cursor; 단순 delta 처리 금지; owner 비용이 남으면 미충족 기록 |
| `src/core/settle/utils/compute/computeNode.ts` / `computeNode` | 정적 gate 계획 참조와 동적 배열/이동 발견; 같은 gate 집합·순서·baseline·pass cap 유지 | 정적 후보 재수집 제거; round `for` 및 동적 추가·상한 재계산 유지 |
| `src/core/settle/utils/compute/primeHost.ts` / `primeHost` | 정적 무게이트 baseline 목록 사용 | baseline 에지 하나당 한 인덱스 `for`; 전체 분기 후보 검사 없음 |
| `src/core/settle/utils/compute/selectNodeSchema.ts` / `selectNodeSchema` | 선택 기여와 fallback을 ordinal로 처리; ID 목록을 한 번 생성·공유 | `filter/every/map/map`을 후보 cursor와 gate `for/break`로 대체; warning/merge 순서 유지 |
| `src/core/settle/utils/compute/selectChildren.ts` / `selectChildren` | prior/live/입력/latent/pendingExits/throwingGateExits/fallback 후보 및 거짓 엔트리의 표시 정리 | sorted cursor `while` + declaration/gate `for`; 경로·종류와 기존 순서 유지 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts` / `flushPendingGateReads` | 그룹 bound-read 계획 자료 공유; 공표 위치와 호출 순서 유지 | read의 인덱스 `for`; 판별 위치마다 flush 유지, recursive/opaque 기존 공표 |
| `src/core/settle/utils/controls/getControlLayers.ts` / `getControlLayers` | B2의 control 목적별 contribution 색인을 소비 | selected contribution `for` 한 번; 같은 선언 배열을 두 번 map하지 않음 |
| `src/core/settle/utils/compute/updateOutput.ts` 및 쓰기·복구·경로 변경 경계 | 원래 공표·changedNodes 순서 유지, 마지막 평가 이후 읽기 접촉 기록 | 기존 changed 노드/경로 방문에 결합; 세대 push·전체 결과 캐시 순회 없음 |
| `src/core/settle/utils/commit/commitSettlement.ts` / `commitSettlement`, `src/core/record/type.ts`, `src/core/settle/type.ts` | gateThrowVersion으로 평가별/정착 전체 예외를 판정하고 실패 없는 커밋의 미접촉 슬롯만 저장; 발생 수명 계약 | version은 평가 전후와 정착 시작/커밋의 고정 비교; 변경 자격 슬롯 `for...of`; 모든 B 결과 복사 없음; branchless 슬롯 할당 없음 |
| `src/core/blueprint/__tests__/blueprint.gate-selection.test.ts`, `src/core/settle/__tests__/settle.gate-selection.test.ts`, `settle.gate-reuse.test.ts`, `settle.gate-selection-order.test.ts`, `settle.gate-selection-counts.test.ts` (신설) | 인식/정적 오류, 네 모드 차등, 무효화/수명, 즉시 순서/반례, B 축 계수를 owner별로 분리 | 작은 고정 fixture와 정적 parameter rows; 파일별 case 상한 유지; 시간 측정과 분리 |
| `src/core/settle/__tests__/helpers/readProjectedValueWithoutPublication.ts` / `readProjectedValueWithoutPublication` (신설) | 그림자 전용 무공표 reader; 원래 읽기 경로의 pendingOutputs 부재 단언 후 투영 의미를 독립 재현 | 진단에서만 경로 순회; flush·locate·실제 상태 변경 없음; 그림자를 끈 네 모드 비교도 별도 실행 |
| `src/core/blueprint/DETAIL.md`, `src/core/settle/DETAIL.md`, `src/core/record/DETAIL.md` | 인식/되돌림·비교 의미·발생 수명·비용·수용 기준 | 문서 변경; 원장 반영은 관리자 승인 절차 |

신설 인식 보조는 해당 컴파일러 organ 아래, 계획 빌더는 analyze organ 아래, 발생 조회 보조는 settle gates organ 아래에 둡니다. 함수 하나당 내보내는 역할 하나를 지키고, 배열은 인덱스 `for/while`, Map/Set은 필요할 때 `for...of`를 사용합니다. bucket 회원 색인은 반복 조회를 재사용할 때만 만들며 단일 조회를 위해 Set을 만들지 않습니다. 기존 원자 판정·캐시 identity·서브트리 독립 경계를 유지합니다.

## 8. 차등 시험과 적용 전후 확인 계획

실행하지 않은 계획입니다. 제품 공개 옵션을 추가하지 않고 내부 시험 장치에 `selectionTable`/`reuseCommittedResults` 두 스위치를 둡니다. **00이 기존 전수 평가 기준**이고 10·01·11을 각각 00과 비교합니다. 00은 bucket/group 결과를 읽지 않고 기존 평가 위치에서 원래 `evaluateGate`를 호출합니다. 계획 자체를 잘못 만든 공통 버그가 양쪽을 같이 통과시키지 않도록 00에는 기존 후보 열거 경로도 유지합니다. **네 모드의 끝 상태·오류·공표/배달 순서 비교는 그림자 스위치를 끈 채로도 반드시 별도 실행합니다.** 그림자 켠 진단과 끈 차등 실행은 같은 초기 상태와 입력 이력에서 각각 시작하며, 그림자의 개입이 정착을 보정해 끝 상태 비교를 통과시키지 못하게 합니다.

각 진입 직후와 배달 종료 후 다음을 비교합니다: 전순서 child path/kind/active/선택 선언/유효 schema/typeConflict, raw/latent/extras/local/emit 및 존재 여부, 변경 없는 노드·배열의 참조 재사용, 실패·경고의 코드/경로/schemaPath/순서/중복/원인/degraded/드러남 시점, 생김·퇴장·채움·재진입, revision 비트/수와 payload/리스너 호출 순서, 호스트·파생·전이·사슬 라운드와 예산. **함수 호출 수는 달라도 라운드 수와 각 바퀴의 cap은 같아야 합니다.** `changedNodes`의 삽입 순서와 배달 후보·실제 배달 방문 순서를 별도로 기록합니다.

끝 상태 비교에 더해 **같은 실행 안에서 원래 평가 자리마다 그림자 평가**를 둡니다. 발생·owner·host/edge/L·바퀴·선언/gate ordinal·단락 위치를 기록하고, 실제 실행이 그 자리의 기존 등록과 필요한 공표를 마친 시점의 전수 평가 값과 실제 표/재사용 값을 즉시 비교합니다. 후보 축약으로 암묵적 거짓을 제공한 원래 자리도 비교 대상입니다. 마지막 상태로부터 값을 역추정하지 않습니다.

그림자는 **공표 없는 별도 reader**로 현재 루트와 경로를 따라 투영 값을 재현합니다. 최적화의 묶음·bucket·조상 자격 결과를 기준 입력으로 재사용하지 않으며, 실제 `readProjectedValue`나 `evaluateGate`를 그림자에서 호출하지 않습니다. 전자는 `src/core/settle/utils/gates/readProjectedValue.ts:30,36-48,61`에서 공표하고, 후자는 `src/core/settle/utils/gates/evaluateGate.ts:35`에서 레지스트리를 만집니다. 공표는 `src/core/settle/utils/compute/flushPendingOutput.ts:16-18`처럼 pending output을 제거하고 출력을 갱신하므로 복제 호출로 격리되지 않습니다. 실제 실행에서 결합된 위치 정보는 읽기 전용으로 전달하고, 그림자는 `locate`·등록·flush·오류/경고/배달 기록·`gateThrowVersion`을 변경하지 않습니다.

**그림자를 읽기 직전에 읽기 경로의 모든 노드(루트·조상·현재 호스트/키 포함)가 `pendingOutputs`에 없음을 단언합니다.** 판별 기술의 호스트/extra 읽기와 식의 모든 의존 경로도 포함합니다. 단언이 실패하면 그림자 값은 기준 평가의 증거가 아니므로 진단을 실패시키며, 단언을 통과시키려고 추가 flush를 호출하거나 원래 공표 자리를 옮기지 않습니다. 대기 출력이 없다는 조건에서도 미계산 구간·wrong-kind·extras 노출을 무공표 reader가 기준 의미대로 처리하는지 별도로 확인합니다. 순수 식의 그림자 오류는 진단에만 기록하고, 부작용 식/opaque guard는 기존 단일 평가와 그림자를 끈 별도 기준 실행으로 검증합니다. 그림자 장치는 진단 전용이며 성능 계수·타이밍 행에서는 끕니다.

| 시험 묶음 | 입력/반례 | 반드시 같은 결과 |
| --- | --- | --- |
| 인식 | `===` 양변 순서·escape·괄호, 목록·같은 키 OR, 직접 본체 키, 분기에만 선언된 판별 키의 무게이트 사본 | 단일 의존성·유일 엔트리 자격, 교차 완료 `gate.condition.values`, 작성 스키마 불변 |
| 되돌림 | `==`, 함수/블록, `@`, 동적 읽기, 조건부 키, opaque `if`, `'a ./x'` 등 리터럴 안 경로 | 추가 dependencies의 읽기를 보존; 정확히 한 의존성 아닌 식의 표 자격 거절 |
| 비교 경계 | 없음/명시 undefined/null/false/빈 문자열/0/−0/수 1/문자열 '1', NaN·Infinity·객체/배열 const | 97C-02 수정 기준의 `===`; `−0` 일치·NaN 무일치; 비유한/참조 리터럴 표 거절·fallback 동치 |
| 목록 겹침 | active의 `[a,b]`, `[b,c]`, 서로 다른 종류의 같은 이름 | 모두 선택, 다중 활성 경고, 앞선 종류 형상과 SHARED_NODE_CONFLICT 처리 동일 |
| 정적 오류 | 명시 discriminator 겹침·kind 불일치·키 없음·빈 태그 교차·null 스키마 분기 | 기존 청사진 오류 코드/위치/순서와 nullable 동일 |
| 무일치 | a→어느 목록에도 없는 값→a | 본체 유지, 실제 퇴장/latent/재진입 및 배달 동일 |
| FRAGMENT-048 | 앞 항 false이고 뒤 항이 던짐; 앞 항 true 뒤 항 true/false/throw | 거짓 앞 항에서는 뒤 항 0회; 참에서는 기존 예외/exit/뒤 항 평가 위치 동일 |
| 퇴장 대기 반례 | §6.3: 판별 참·active 던짐으로 퇴장 → 전이의 derived가 kind 변경 → 판별 거짓 | pendingExits의 경로·종류 후보와 throwingGateExits 정리, 최종 나감 정책; 00·11 포함 전 모드 동일 |
| 즉시 반영 | 앞선 entry/default/derived가 kind를 바꿈; 뒤 gate가 앞선 조건부 자식을 읽음 | 다음 gate 전에 재조회, eager 공표와 중간 형상·round 동일 |
| 투영 동일성 | 원본 유지 중 `primeHost`의 base-schema 복원·overlay, omitEmpty 누락/노출, 루트 호스트 스키마 변경, extras 참조는 같고 노출 boolean만 바뀜 | 현재 hostNode·emit·호스트 미계산·extras·projectedHostValue·extrasExposed 차이면 재읽기/fallback; 중간 그림자 값도 기준과 동일 |
| 구조/미계산 | 같은 경로의 호스트/키 노드 교체, 호스트 자체와 키의 미계산 시작/끝, wrong-kind 조상, 바퀴 중 조상 증명 폐기, 같은 이름의 다른 종류 엔트리 선행 활성 | 자리별 루트 재탐색과 바퀴 진입 조상 검증; 조상 자격 실패 후 기존 평가의 공표/읽지 않음 동일; 복수 이름 엔트리는 표/재사용 거절 |
| dirty 색인 | 루트 `''`, 조상/자손 양방향, `'@'`, 판별 watch, own/edge, 표·재사용 자리에서의 늦은 locate, 누적 반복 등록·restoreSourceB | 자리별 등록 후 발생 목록과 뒤의 mayChangeAt 동일; **모든 registerRecalculation 직후** shapeDirtyPaths가 기존 전수 발생 판정과 동일 |
| 재사용 | 성공 false/true 뒤 무관한 키; 읽는 키 변경·whole replace·load/reset | 안정 입력만 재사용, 모든 무효화 후 F와 동일 |
| 예외/복구/저장 | 성공 후 예외·공유 충돌·예산 초과/rollback, 실패 목록이 늘지 않는 반복/마운트 예외, 마지막 평가 뒤 읽기 접촉·후속 재평가 | gateThrowVersion의 평가 전후 증가로 예외 false를 거절; 정착 시작 이후 증가/실패/복구 커밋과 마지막 평가 이후 접촉 슬롯은 저장 0; throwingGateExits 동일 |
| 이력 독립 | SETTLE-044의 A/B/C 양의 순환을 서로 다른 이력으로 같은 입력에 도달 | 고정 출발 최소 고정점, A/B 잔류 금지 |
| 발생 결합 | 비루트 호스트의 부모 selectChildren과 호스트 자신의 selectChildren, 중첩 union, 동일 $ref 두 호스트, 배열 두 아이템/재인덱싱, 유한 재귀 | 두 자리의 owner·edgeName·host/edge/L과 locate 효과 보존; 라운드별 새 배열 엔트리·이동 게이트 집합/순서와 pass cap 동일 |
| 공표/배달/owner | 각 원래 flush 자리, changedNodes 삽입, 배달 방문; 잠복 owner 축약 전후 탐침 | 값뿐 아니라 두 순서 및 publishStateKeys·commitExitPolicyValues·배달 후보 동일; 증명 전 owner 축약 금지 |
| 그림자 | 각 원래 자리의 전수 함수 값 대 표/재사용/암묵적 false; 같은 끝 상태를 내는 중간 오답, 읽기 경로의 대기 출력 잔류도 구성 | 무공표 reader와 경로 전체 pendingOutputs 부재 단언; 실제 상태/레지스트리/version 불변; 자리별 즉시 일치와 그림자를 끈 네 모드 끝 상태/순서 비교 모두 통과 |
| 계수 | B=5/10/20/40 kind_0↔kind_4, 조각 수만 늘리고 live 폭·입력/출력 크기를 고정한 U19 | §6 계수; 무관한 행의 게이트 재평가·게이트별 재사용 검사·무관한 기여 방문 모두 0 |

**DETAIL을 먼저 수정하고, 위 차등 시험의 독립 기대값을 전수 평가 00에서 초록으로 고정한 뒤 같은 단언을 10·01·11에 적용합니다.** 97C-02 비교 기준은 그보다 먼저 별도 red→green으로 고정합니다. 시험용 잘못된 comparator·동일성 누락·후보 누락·dirty 누락을 각각 넣었을 때 해당 반례가 실패해야 시험 장치가 수정된 복사본을 보고 있음을 증명합니다. 고정 fixture 외 작은 유한 생성 사례도 네 모드에 비교합니다. 시험은 owner 내부에 두고 안정된 acceptance group을 DETAIL에 기록하며 파일별 case 상한을 지킵니다. 기존 기대값·snapshot을 최적화에 맞춰 바꾸지 않습니다.

계수는 expression/if 함수 진입, 실제 bucket `get`, 키 reader, 위치별 동일성/재사용 검사, reuse descriptor 조회, 자리별 locate와 최초/늦은 등록, 현재 호스트 재탐색의 경로 방문, 바퀴 진입의 조상 검증, branch/declaration/entry/registry/flush/control cursor 방문을 **별도로** 기록합니다. 캐시 hit를 lookup으로 세거나 O(B) 거짓 확인·등록·커밋 복사, O(D) 경로 순회를 숨기지 않습니다. 생성 준비와 결과 보유 비용도 별도 기록합니다. (가), (나), 연결 몫 B2·B4·B5를 나누어 **변경 하나마다 같은 fixture를 한 번 재측정**합니다. 지정 패키지 검증과 동일 세션의 분기 축 시간·계수·잔여 순회 증거를 함께 제출하며, 증거가 없거나 무관한 B 축 비용이 남으면 91라운드 기준 (1) 미충족으로 보고합니다. live 필드가 실제로 N개 늘어나는 별도 행은 필수 조립/출력/배달 비용을 단계별로 기록하고 분기 최적화의 제거 효과로 합산하지 않습니다.

## 9. 메모리와 준비 비용

청사진당 G=표 그룹 수, B=대상 gate 수, M=리터럴의 **분기 소속 에지 총수**, V=그룹별 고유 값 총수, P=순수 재사용 식의 고유 읽기 prefix/연결 수, C=gate↔declaration/child contribution 연결 수로 둡니다. 추가 정적 공간은 **O(G+B+M+V+P+C)**입니다. 한 값이 여러 분기에 속하면 M에 모두 셉니다. 값별로 전체 B gate 결과 배열이나 전체 child graph 사본을 만들지 않아 O(V×B)/O(V×전체 스키마)의 공간을 요구하지 않습니다. 이미 있는 gate/declaration/entry 객체는 참조합니다.

단일 tag, payload 셋인 B=5/10/20/40 fixture는 G=1, V=M=B, branch 연결도 B, payload 기여 에지는 3B입니다. 같은 구조 자료를 공유하면 점근적 추가 공간은 O(B)이고, 값 bucket과 그룹/에지 자료의 실제 셀·배열 수를 보고합니다. bucket별 전체 유효 스키마를 청사진에서 미리 병합하지 않습니다. 실제 사용한 bucket/선택의 런타임 병합 메모는 기존 bounded-by-use 정책을 사용합니다.

런타임 공간은 살아 있는 발생에 결합된 gate/group 및 읽기 에지 수에 비례하고, 정착 scratch는 접촉·조회·재평가한 슬롯 수와 실제 퇴장 대기 후보 수에 비례합니다. 키별 동일성 묶음은 고정 크기이며 직전의 실패 없는 커밋 결과 한 묶음만 보유하고 커밋 이력을 누적하지 않습니다. 재귀 깊이는 runtime 발생 공간에만 들어가고 청사진 메모리에 곱하지 않습니다. branchless 또는 자격 그룹이 없는 청사진은 공유 빈 계획/부재 슬롯으로 추가 Map/Set을 만들지 않습니다.

바퀴별 조상 검증의 증거/폐기 상태는 실제 결합한 읽기 prefix에만 보유하며 같은 바퀴 안에서 공유합니다. 그 공간과 O(D) 경로 검증 비용을 고정 크기 묶음에 숨기지 않고 별도 기록합니다. 다음 바퀴에 옛 증거를 무조건 재사용하지 않습니다. 그림자 reader의 경로 기록과 단언은 진단 전용 비용입니다.

준비 시간은 기존 분석에서 gate·리터럴 소속·기여·읽기 에지를 한 번 등록하는 O(B+M+P+C)입니다. 목록 순서 자료의 병합을 포함하되 모든 bucket에 모든 선언을 복사하는 준비는 하지 않습니다. heap byte는 엔진 자료구조별 차이가 있으므로 이 문서에서 수치를 추정하여 사실로 적지 않습니다. 승인 후 별도 세션에서 청사진 준비·보유 슬롯 수와 실제 heap을 기록합니다.

## 10. 97차 결정의 반영과 적용 조건

97C-01은 아래 조건을 반영한 설계를 승인했습니다. 97C-02는 비교를 `===`로 확정하여 비교 방식별 표를 닫았고, 97C-03은 판정 행의 분모를 확정했습니다. 이 둘은 다시 승인받을 열린 질문이 아닙니다. BLUEPRINT-007·017, SETTLE-020의 보충 안에서 SETTLE-018·044, FRAGMENT-048의 AND, 정적 판별 오류 정책과 ERROR의 드러남을 유지합니다.

| 97C-01 조건 | 설계의 적용 위치 | 구현 전에 고정할 증거 |
| --- | --- | --- |
| 1. 퇴장 대기 후보 포함 | §6.3 B5, §7 selectChildren | pendingExits·throwingGateExits 및 검증 발견 1의 전이 반례 |
| 2. 원래 자리의 고정 크기 묶음 비교와 경로 자격 | §4.2, §5.1, §8 | 현재 호스트 재탐색·호스트 미계산·extras 노출, 바퀴 진입의 조상 검증/실패 fallback, 자리별 locate·늦은 등록, overlay/omitEmpty·공표/배달 순서, 무공표 그림자와 경로 전체 pendingOutputs 부재 |
| 3. 이름의 엔트리 정확히 하나 | §3.1·3.2 | 같은 이름 다른 종류의 자격 거절, 분기 전용 판별 키의 무게이트 사본 자격 |
| 4. readsChanged 동치의 누적 질의 | §6.2 | 매 registerRecalculation 직후 shapeDirtyPaths, own/edge·locate·복구·모든 watch 경계 |
| 5. 같은 gate 집합·바퀴 상한, owner 축약 증명 | §4.1, §6.3, §7 | 매 바퀴 이동 게이트·배열 엔트리·cap, publishStateKeys·commitExitPolicyValues·배달 후보 |
| 6. 실패 없는 미접촉 슬롯 저장 | §4.2, §8 | 평가 전후와 정착 시작/커밋의 gateThrowVersion, 반복/마운트 예외 포함 저장 0, 실패/복구 커밋 저장 0, 마지막 평가 뒤 접촉 시 저장 0 |

재확인(`architecture/reviews/raw-round97-gate-selection/verifier-recheck.md:9-24`)이 확인한 조건 1·3·4·5·6과 세부 셋은 유지합니다. 잔여 가는 현재 호스트·미계산·extras 노출의 묶음, 나는 바퀴 진입 조상 검증과 실패 fallback, 다는 자리별 locate, 라는 무공표 그림자·대기 출력 부재 단언·그림자를 끈 네 모드 비교로 보완합니다. 보충 둘은 version에 따른 슬롯 예외 판정과 비루트 호스트의 두 평가 자리에 반영했습니다. 별도 결정을 여는 변경은 없습니다.

적용 순서는 **97C-02 별도 수정 → 소유 DETAIL 계약/수용 기준 → 전수 평가에서 차등 단언 초록 → 같은 단언을 최적화에 적용 → 계수와 시간 측정**입니다(88C-01·89C, 97C-01). (가), (나), 연결 몫 B2·B4·B5를 나누고 변경 하나에 재측정 하나를 붙입니다. 그림자를 끈 네 모드의 끝 상태/순서 비교와 같은 실행의 무공표 위치별 그림자 평가를 모두 통과해야 합니다.

91라운드 기준 (1)은 §6.1의 분기 전환과 §6.2의 폭·입력/출력 고정 행에서 전체 정착의 잔여 B 축까지 검증합니다. 게이트 호출만 일정하거나 per-gate reuse 검사·무관한 기여 방문·owner 확장·커밋 복사 중 하나라도 남으면 그 위치와 계수를 적고 미충족으로 보고합니다. 실제 live 필드 증가 행의 필수 출력 비용은 따로 기록합니다.

이 문서는 최적화의 동치·계수·시간 통과를 주장하지 않습니다. owner 축약, 조상 자격과 현재 묶음의 동일성, 같은 집합/상한/순서를 증명하지 못하면 해당 변경을 적용하지 않고 조건과 반례를 보고합니다. 확인되지 않은 동작이나 측정치를 추정해 채우지 않습니다.
