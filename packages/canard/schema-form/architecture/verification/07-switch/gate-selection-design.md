# 게이트 선택 표와 커밋 결과 재사용 설계

2026-10-06. **원장 관리자 승인 전 설계안**입니다. 작업 기준은 stage-07의 `5982d51a7`이며, 이 문서는 제품 코드·원장·git 상태를 변경하는 구현을 승인한 기록이 아닙니다. 코드와 문서만 읽었고 벤치마크·테스트·빌드·설치는 실행하지 않았습니다.

## 1. 근거와 승인 범위

편집자 결정 96C-01(`origin/1.0.0-beta`의 `83e2a17c0`, `architecture/reviews/round-96-closing.md`)이 연 두 범위를 구현할 설계입니다.

- **(가) 판별 선택 표:** 동일 union 호스트의 본체 키 하나를 리터럴과 비교하는 분기 게이트를 청사진에서 값 → 분기 목록으로 묶습니다. 바퀴는 기존 평가 위치에서 현재 값으로 조회하고 기존 순서로 적용합니다.
- **(나) 결과 재사용:** 읽기가 정적으로 완전하게 알려진 순수 식이고, 읽는 키가 모두 게이트 없는 본체의 키이며, 이번 정착의 재계산이 그 읽기를 건드리지 않으면 직전 커밋의 성공한 평가 결과를 사용합니다.

BLUEPRINT-007의 남은 최적화 (a), BLUEPRINT-017의 변환, FRAGMENT-048의 AND 결합, SETTLE-020의 전수 평가 의미를 이 두 방법으로 구현합니다. SETTLE-018의 `게이트 없는 조각 ∪ 상속 overlay` 출발점과 SETTLE-044의 부정 결정은 유지합니다. 직전 활성 집합을 초기 가설이나 평가 순서 힌트로 사용하지 않습니다.

`if`의 내용·의존성 분석, 다른 게이트에 따라 읽는 키의 존재가 달라지는 식, 인식하지 못한 식의 선택적 평가, 출력 계산의 지연, 꺼진 조각 분석의 지연은 범위 밖입니다. 해당 게이트는 현재 방식으로 매 바퀴 평가합니다. 작성 스키마와 검증기에 전달하는 `const`·`enum`·`required`도 유지합니다.

87라운드 소유자 원칙은 순회 최소화, 불필요한 계산 생략, 뜨거운 경로의 인덱스 `for`/`while`, 안정된 객체 모양입니다. 91라운드 기준 (1)은 전체 전환 정착이 무관한 분기 수에 따라 늘지 않는 것입니다. **게이트 호출만 일정하게 만든 것으로 전체 기준의 통과를 선언하지 않습니다.** 아래 B2/B4/B5 연결 조건도 충족해야 합니다.

근거 문서의 위치는 이 문서가 있는 `07-switch`에서 패키지 루트까지 세 단계 위를 기준으로 합니다. 87·91·96라운드 문서는 이 HEAD의 파일에 없으므로 지정된 로컬 origin ref에서 읽었습니다. `diagnosis-94c03.md`의 실제 측정 기준은 `f8aaa4ed23245450f967878cd96477fa5bae8f96`입니다. 그 계수는 기존 진단의 증거이며, 아래 설계 계수는 현재 HEAD에서 새로 측정한 결과가 아닙니다.

## 2. 현재 평가 구조와 제거할 중복

`src/core/settle/utils/compute/computeNode.ts`는 직접 자식·호스트 선언·이동된 게이트를 모으고, `primeHost` 뒤 바퀴에서 `selectNodeSchema`와 `selectChildren`을 호출합니다. `selectNodeSchema.ts:21`은 선언별 `filter/every`로 같은 게이트를 평가하고 활성 ID를 두 번 만듭니다. `selectChildren.ts:146,160`은 모든 후보 에지를 훑고 각 선언의 게이트를 다시 평가합니다. 게이트 거절에서는 즉시 멈추며, 자식 계산·pending output 공표는 뒤의 게이트가 읽는 투영에 영향을 줍니다.

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
| 본체의 직접 키 한 개와 원시 리터럴의 엄격한 같음 | `./kind === 'a'`, `'a' === ./kind` | 키, 리터럴, `strict` 비교 |
| 원시 리터럴 목록의 포함 판정 | `['a', 'b'].includes(./kind)` | 키, 리터럴 목록, `sameValueZero` 비교 |
| 위 비교들의 유한 OR, 같은 키만 사용 | `./kind === 'a' || ./kind === 'b'` | 같은 키의 값 합집합, `strict` 비교 |
| 명시 discriminator의 변환 기술 | `{ propertyName: 'kind', values: ['a', 'b'] }` | 키와 값 목록, 기존 평가기의 비교 방식 |

괄호·공백·컴파일러가 허용하는 끝 세미콜론은 의미를 바꾸지 않는 범위에서 제거합니다. 리터럴은 문자열·유한 수·boolean·`null`입니다. 문자열 escape와 RFC 6901 키 해석은 기존 컴파일러와 공유합니다. `undefined`·`NaN`·`Infinity` 식, 객체/배열을 비교값으로 쓰는 식, loose equality, 부정·범위 비교, 동적 목록·동적 프로퍼티, 임의 함수 호출·블록·대입·시간·전역 객체 참조는 첫 구현에서 표 자격을 주지 않습니다. 빈 작성자 리터럴 목록은 늘 거짓인 표 항목으로 표현할 수 있지만 discriminator의 빈 enum 청사진 오류를 없애지는 않습니다.

이 OR는 목록 포함과 동등한 꼴을 컴파일러가 드러내는 경우입니다. 임의 논리식을 분배·재배열하여 이 꼴로 만들지 않습니다. `controls.discriminator`가 없는 스키마의 JSON Schema `const`·`enum`을 새로 읽어 판별식을 추측하지 않습니다.

키는 해당 호스트 본체 또는 게이트 없는 정적 연언이 선언한 직접 키이어야 합니다. 단지 어느 분기에 같은 이름이 있다는 이유로 자격을 주지 않습니다. 그 키의 노드 게이트, 상위 호스트의 조건부 존재, 조건부 유효 제어가 현재 읽기를 바꾸는 경우에는 발생 결합 시 자격을 다시 확인하고 불확실하면 기존 평가로 보냅니다. 상위 조건부 호스트가 현재 존재하더라도 그 발생 내부의 키가 무조건 존재한다는 증명이 필요합니다.

명시 discriminator의 분기 자체 `controls.active`는 FRAGMENT-048대로 **앞 항과 뒤 항을 구별**합니다. 현재 구현은 같은 `gates` 목록에서 discriminator 뒤에 active를 넣습니다(`collectDeclarations.ts:144–160`). 표는 앞 항만 제공합니다. 앞 항이 거짓이면 뒤 항을 호출하지 않고, 참이면 그 자리에서 뒤 항을 기존 식 평가기로 평가합니다. 뒤 항도 별도로 (나)의 자격을 얻었을 때만 결과를 재사용합니다. 작성자 식의 임의 AND를 앞 항·뒤 항으로 새로 분해하지 않습니다.

### 3.2 결과 재사용의 자격

다음 조건이 모두 성립해야 합니다.

1. 컴파일 단계에서 식의 읽기 경로가 완전하게 확정되고, 결과가 그 입력들만의 순수 함수라는 증명이 있습니다.
2. 발생에 결합한 읽기 경로가 모두 게이트 없는 본체의 선언 키입니다. 조건부 키, `@`, 호스트 전체 읽기, 선언 밖 extras, 동적 배열 선택은 첫 구현의 재사용 대상에서 제외합니다. 절대·부모 상대 경로는 결합한 대상 본체에서 같은 증명이 있을 때만 허용합니다.
3. 직전 커밋에 같은 청사진·같은 발생 수명·같은 식의 성공한 boolean 결과가 있습니다. `false`도 결과입니다. 미평가·예외를 `false` 캐시와 혼동하지 않습니다.
4. 이번 정착 전체의 누적 재계산/투영 무효화 목록이 어느 읽기 경로도 건드리지 않았습니다. 뒤의 파생·기본값 채움·전이·rollback·경로 이동이 새로 건드리면 즉시 자격을 잃습니다.

현재 `BlueprintExpression.dependencies`와 `BlueprintGate.evaluationReads`만으로 순수성과 완전성을 주장할 수 없습니다. `createDynamicFunction`은 `new Function`과 블록도 허용하고, `evaluationReads`는 상대 경로를 부모 오름 수로 줄이며 `@`를 제외합니다. 따라서 컴파일러에 비실행 정적 인식 결과를 추가합니다. 첫 재사용 문법은 정적 경로·원시 리터럴·괄호·boolean 조합·엄격 비교 등 입력 의존을 완전히 증명할 수 있는 식입니다. 미인식 호출·외부 변수·부작용 가능 식은 dependencies가 짧거나 비어 있어도 기존 경로에 남깁니다. 단순한 `./enabled === true && ./mode !== 'off'`는 표 꼴이 아니어도 이 순수 읽기 자격을 얻을 수 있습니다.

읽는 키의 존재가 무조건이라는 사실과 읽는 값이 불변이라는 사실은 별개입니다. 본체 키라도 gated overlay가 투영 제어를 바꾸거나 파생 규칙이 값을 다시 쓰면 무효화 대상입니다. 청사진에서 그런 기여와 역의존 에지를 누락하지 않습니다. 오류가 난 커밋, 예산 초과 후 복구, 새로 들어온 발생, load/reset/재대조, 배열 재인덱싱은 해당 결과를 버리거나 다시 증명합니다.

### 3.3 비교 의미를 보존하는 표 키

현재 `evaluateGate`의 discriminator는 `Object.is`, 작성자 `===`는 엄격한 같음, 리터럴 배열 `includes`는 SameValueZero입니다. 세 방식을 하나의 JavaScript `Map` 키 규칙으로 뭉개지 않습니다. **기준 실행의 비교 의미를 그대로 표의 메타데이터에 기록**합니다.

- 문자열 `'1'`과 수 `1`을 다른 키로 유지하고 문자열 변환·검증기 강제 변환을 하지 않습니다.
- `null`, 키 없음/투영상 없음(`undefined`), `false`, `0`, `''`를 구별합니다. `=== null`은 없음에서 거짓입니다. 첫 문법에는 undefined 리터럴이 없으므로 없음은 보통 빈 bucket입니다.
- `strict`와 `sameValueZero`는 `+0`·`-0`을 같은 bucket으로, 현재 discriminator의 `sameValue`는 별도 bucket으로 둡니다. `Object.is`를 위한 음수 0 전용 내부 키가 필요합니다.
- 비유한 리터럴과 참조 동일성에 기대는 비교는 표를 만들지 않습니다. 비유한 런타임 값의 일치는 해당 비교 규칙으로 처리합니다. plain object를 구조 비교해 원시 리터럴과 맞추지 않습니다.

이 차이는 몇 값의 작은 Node 확인에서도 드러났습니다: `-0 === 0`과 `[0].includes(-0)`은 참이고 `Object.is(-0, 0)`은 거짓입니다. 이는 시간 측정이나 제품 테스트 결과가 아닙니다. BLUEPRINT-017의 설명을 근거로 기존 discriminator를 몰래 `===`로 바꾸지 않습니다. 그 경계는 승인 시 확인할 항목입니다(§10).

## 4. 청사진 자료와 발생별 상태

### 4.1 정적 계획

식 컴파일 뒤, 노드·조각 동결 전에 유한 템플릿별 계획을 만듭니다. `GateSelectionGroup`은 호스트 템플릿 identity, union 작성 위치, 키 경로, 비교 방식, 기존 순서의 분기 ID와 gate 참조를 가집니다. **같은 키라도 호스트·union 위치·비교 방식이 다르면 별도 그룹**입니다.

값 bucket은 그 값에 해당하는 모든 분기 ID의 불변 순서 목록입니다. 한 값이 여러 목록에 속하면 모두 들어가며 첫 분기 하나를 반환하지 않습니다. bucket별 반복 회원 확인이 있으므로 한 번 만든 ID 색인을 재사용할 수 있습니다. 조회마다 `B`칸 결과 배열을 초기화하거나 Set을 새로 만들지 않습니다. 선택되지 않은 모든 표 게이트의 앞 항은 암묵적 `false`입니다.

선언·직접 에지의 게이트 수집 순서, 무게이트 본체, 게이트 → 기여 선언/자식 에지, 순수 재사용 식 → 정확한 읽기 경로를 같은 분석에서 색인합니다. 공통 키가 변했다고 모든 잠복 자식을 역의존 owner로 나열하지 않고, 선택 호스트의 그룹을 한 번 표시합니다. 노드 자체 게이트·파생·감시의 진짜 역의존 owner는 제거하지 않습니다. 재귀 참조는 템플릿 에지를 보유하고 런타임 발생을 청사진에서 펼치지 않습니다.

새 메타데이터는 내부 descriptor/계획으로 전달하고 `controls`나 공개 노드 멤버를 추가하지 않습니다. 소비자가 settle인 정보만 blueprint 진입점에 이름으로 내보냅니다. 정적 계획 안에 현재 값·활성 집합·커밋 결과를 넣지 않습니다.

### 4.2 발생별 조회와 무효화

결과 캐시의 단위는 `(runtime, occurrence identity, gate/group identity, bound host/edge, appearance generation)`입니다. `gate.hostPath`의 첫 템플릿 위치나 `schemaPath` 하나만을 키로 사용하지 않습니다. 기존 `getGateRegistry`의 `locate`/`resolveGateOccurrence`/`bindGateHostPath` 결합을 사용합니다. 공유 템플릿을 참조하는 두 호스트, 배열의 두 아이템, 재귀의 두 깊이는 각각 독립 결과를 가집니다.

그룹 슬롯은 정적 계획 참조, 읽기 세대, 현재 bucket, 마지막 커밋의 결과/증명 참조를 같은 객체 모양으로 보유합니다. 일시 슬롯과 성공한 커밋 결과를 분리하고, commit 경계에서 **변경된 슬롯만** 갱신합니다. 매 커밋에 B개 결과를 복사하지 않습니다. runtime 수명이 끝나거나 발생이 제거되면 함께 해제하며 재인덱싱은 기존 path-change 생명주기로 재결합합니다.

재사용 판정은 gate별 dependencies를 다시 훑는 루프가 아니라, 정적 읽기 경로의 trie/역색인에서 이번 누적 재계산 경로와 교차한 그룹만 무효화하는 방식입니다. 영향을 받지 않은 그룹은 커밋 결과 descriptor를 공유합니다. 서로 다른 N개의 읽기 경로가 있어도 `/other` 조회는 그 경로와 일치하는 에지만 찾고 나머지 N개를 확인하지 않습니다. 무효화된 경우 해당 그룹 전체를 한 번 표시하는 것이 먼저이며, 그 그룹의 실제 재평가는 필요할 때 합니다.

`dirtyPaths`는 계산 후 삭제되므로 그 집합의 현재 크기로 재사용을 판정하지 않습니다. 정착 수명 동안 읽기의 누적 무효화 세대를 유지합니다. 실제 키의 재계산, 그 키를 덮는 통째 쓰기/로드, 투영 변경, 자동 쓰기, 복구를 포함합니다. 반면 `/other` 입력 때문에 출력 조립을 위해 예약된 루트 조상만으로 `/kind`도 재계산됐다고 해석하지 않습니다. 루트 통째 교체와 단순 조상 조립을 쓰기 기록에서 구별해야 U19 자격이 성립합니다. 구별하지 못하면 보수적으로 기존 평가를 사용합니다.

## 5. 바퀴의 실행과 전수 평가와의 동등성

### 5.1 같은 위치에서 읽고 같은 순서로 적용

`primeHost`는 기존 무게이트 기준을 만듭니다. 그 뒤 초기 dirty 자식 계산과 pending output의 필요한 공표를 마친 다음, **첫 표 게이트의 원래 평가 위치**에서 키를 읽고 bucket을 한 번 찾습니다. 모든 그룹을 바퀴 앞에서 미리 읽지 않습니다.

active 식의 키는 기존 `resolveDependencyPath`와 `readProjectedValue`가 읽는 바로 그 투영에서 가져옵니다. discriminator 기술의 키는 기존 평가기가 만드는 host 입력과 projected extras 결합의 의미를 공유한 판별 키 reader에서 가져옵니다. `node.raw`, 최초 템플릿 값, 직전 emit으로 대체하지 않습니다. 정상적인 본체 키에서는 두 읽기가 같은 값이지만, null·wrong-kind host·extras·미공표 투영에서는 그 사실을 가정하지 않습니다. 같은 읽기 의미를 증명할 수 없는 발생은 표 경로를 사용하지 않습니다.

호스트 선언 → 직접 에지 → 각 선언의 기존 `gates` 순서를 유지합니다. 앞선 gate의 거절, `appliesWhen`, 상속 gate, 분기 뒤 항의 short circuit도 그대로입니다. 자식의 진입/퇴장·계산과 pending output 공표를 기존 자리에서 수행하여 뒤 게이트가 앞의 즉시 반영을 읽게 합니다. 정적 bucket 순서는 값 입력 순서가 아니라 기존 declaration/entry 전순서입니다.

한 그룹의 키가 같은 투영 세대에 있으면 같은 바퀴와 후속 안정 확인 바퀴에서 bucket을 공유합니다. **바퀴 도중 그 키의 투영이 바뀌면 다음 표 게이트 전에 무효화하고 다시 읽습니다.** 따라서 “한 번”은 호스트 발생의 같은 읽기 세대당 한 번이며, 무조건 정착 전체에서 한 번이라는 뜻은 아닙니다. 순수 discriminator fixture는 판별 키 변화가 한 번이므로 정착 전체에서 한 번입니다. 기본값 채움·derived가 판별 키를 다시 쓰는 사례의 추가 조회는 실제 변화 수만큼입니다.

B4의 flush 계획을 축약해도 최초로 값을 관측하는 공표 위치는 유지합니다. 키의 세대가 실제로 바뀌지 않는 구간의 동일 bound read만 합칩니다. opaque guard와 recursive read plan은 기존 eager 공표 경로를 사용합니다. 재귀 호스트 자체의 표 조회는 발생별로 사용할 수 있어도 재귀 flush를 정적 목록 하나로 치환하지 않습니다.

### 5.2 귀납 논증

기준 실행 F는 표·재사용을 모두 끄고 기존 순서로 모든 필요한 게이트 함수를 평가하는 실행입니다. 최적화 실행 O도 같은 무게이트 출발점에서 시작합니다.

각 원래 gate 평가 직전에 F와 O의 현재 투영·형상·pending 입력이 같다고 가정합니다. fallback은 같은 함수를 같은 입력으로 호출합니다. 표 앞 항은 그 시점의 같은 키를 같은 비교 규칙으로 조회하므로 F의 비교 결과와 같습니다. 직전 커밋 결과 재사용은 모든 읽기 입력이 그 커밋과 같고 식이 순수하다는 증명으로 같은 boolean을 제공합니다. `appliesWhen`과 뒤 항은 이 앞 결과를 같은 순서로 소비합니다. 이후 같은 진입·퇴장·계산을 즉시 적용하므로 다음 평가 직전의 상태도 같습니다. 키가 바뀌는 경계의 무효화는 이 귀납 가정을 다음 gate까지 유지하는 조건입니다.

따라서 각 바퀴의 `schemaChanged/changed/outputChanged`가 같고 안정 확인, 호스트 예산, 파생·전이 라운드의 쓰기와 수렴도 같습니다. 커밋 결과·개정·배달·오류의 드러남 역시 같습니다. 표 lookup 횟수 감소를 이유로 바퀴나 안정 확인 자체를 삭제하지 않습니다. 예외 기록은 순수 성공 결과 캐시와 별개입니다. `EXPRESSION_THREW`가 생긴 평가 결과는 저장하지 않아 이후 호출의 `gateThrowVersion`과 throwing exit 처리가 유지됩니다.

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

### 6.2 U19의 고정된 무관한 키 입력

U19 차등 fixture는 N=5/10/20/40의 활성 조각, 그 게이트가 읽는 무게이트 본체 키, 별도의 본체 `/other` 입력으로 구성합니다. 분기 개수만 늘어나는 효과를 분리하도록 활성 조각은 같은 종류의 공유 필드/overlay를 사용하여 실제 live 필드 폭과 입력 크기는 고정합니다. 첫 로드의 N개 평가·색인 준비는 갱신 계수에서 제외하되 메모리에는 포함합니다.

누적 재계산 조회 `/other`는 게이트의 읽기 에지와 만나지 않습니다. 커밋 결과 descriptor가 그대로 유효하다는 판정을 호스트에서 한 번 합니다. gate별 dirty 확인 N회, true 결과 N개 복사, N개 활성 ID 재작성, N개 pending read 등록을 하지 않습니다. leaf 입력에서 기존 `computeNode`의 형상 dirty 부재 경로를 사용하여 dirty 자식만 계산합니다. 이것은 이전 활성 집합을 가설로 **바퀴를 시작**하는 경로가 아니며, 동일 입력 함수의 결과가 변하지 않는다는 증명 아래 기존의 형상 불변 계산 경로를 사용하는 것입니다.

| 활성 조각 N | 성공 결과 descriptor 판정 | 재평가 함수 호출 | table lookup | 게이트별 재사용 검사 | 무관한 분기 기여 방문 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 1 | 0 | 0 | 0 | 0 |
| 10 | 1 | 0 | 0 | 0 | 0 |
| 20 | 1 | 0 | 0 | 0 | 0 |
| 40 | 1 | 0 | 0 | 0 | 0 |

현재 `GateRegistry.mayChangeAt/mayChangeOwnDeclarationAt`도 결과적으로 형상 dirty를 만들지 않을 수 있지만 판정 자체가 occurrence를 전수 순회합니다. U19는 함수 평가가 0인지만 확인해서는 통과하지 않습니다. 이 occurrence 검사도 읽기 경로 색인의 영향을 받는 그룹 조회로 바꾸어야 위 계수가 성립합니다. 캐시를 만들기 위해 모든 결과를 커밋 때 복사하는 비용도 0이어야 합니다.

부모 객체의 partial/whole write, load, default·derived에 의한 실제 읽기 키 재계산, 조건부 host 교체는 이 leaf 입력과 구별합니다. 전수 실행이 바퀴를 돌리는 진입에서는 최적화도 동일한 바퀴 수와 즉시 반영을 유지합니다. 재사용이 된다는 이유로 그 진입의 바퀴를 임의로 생략하지 않습니다. 실제 live 자식·출력 폭까지 N배로 늘어나는 사례는 그 필수 출력/배달 비용을 별도 계수로 기록합니다. 모든 형상의 모든 키 입력을 총 O(1)로 만드는 설계는 아닙니다.

### 6.3 B2/B4/B5와 전체 기준 (1)의 연결 조건

다음은 두 열린 범위를 소비하는 코드 수준 연결입니다. 새 gate 의미나 출발점 변경을 열지 않습니다.

| 진단 항목 | 반드시 함께 제거할 선형 작업 | 보존할 순서/의미 |
| --- | --- | --- |
| B2 | selected IDs를 한 번 만들고 병합·커밋에 공유; controls 목적별 정적 기여 색인에서 실제 선택된 ID만 조회 | node/fragment/children 우선순위, 이탈의 committed fallback, 상대 host |
| B4 | 표 그룹의 같은 bound read를 읽기 세대당 한 계획으로 유지; 모든 잠복 분기의 동일 읽기 등록/flush 반복 제거 | 최초 공표 위치, 새로운 투영 세대, recursive/opaque fallback |
| B5 | 게이트 → root declaration/child contribution/무게이트 baseline 색인; 새 bucket + 실제 prior/live/입력/latent 후보만 선택 | authored 에지 전순서, 없음/null/extras, 실제 퇴장, 공유 이름 충돌 |

`computeNode`의 매번 `3B+2` 후보 수집은 청사진의 정적 계획 참조로 대체합니다. `primeHost`는 미리 모은 무게이트 에지만 순회합니다. `selectChildren`은 bucket 기여, 실제 prior/live 에지, 분배된 입력/latent 키, fallback 에지를 순서대로 합쳐 처리하고 B개의 거짓 entry를 생성하지 않습니다. 모든 gate가 표에 속한 fixture에서는 B에 비례한 gate registry·역의존 dormant owner 확장도 그룹 단위가 됩니다. generic 식/opaque if가 섞이면 그 기여의 기존 순회는 남습니다.

이 순서 합치기는 정적 ordinal을 가진 이미 정렬된 목록들의 cursor 병합으로 합니다. 갱신 때 전체 후보를 생성한 후 sort/filter하지 않습니다. fallback이 읽는 조건부 키의 즉시 변화가 있는 구간을 뛰어넘지 않으며, 실제 live·latent·입력 후보는 별도 색인으로 빠짐없이 포함합니다. 무일치 전환에서도 이전 live 가지의 퇴장 정책과 latent 보관을 처리합니다.

진단의 control 선언 `3B+12`, parent 선언 `9B+9`, pending occurrence `3B−13`, dirtyChildren의 무관한 잠복 owner 등도 이전 방식으로 남아 있으면 전체 기준 (1)은 미충족입니다. 위 계수는 **승인 후 구현이 충족해야 할 산술 목표**이고, 현재 통과 보고가 아닙니다. 각 위치의 실제 loop counter와 전체 전환 시간으로 확인한 뒤에만 전체 판정합니다. 시간 계측은 현재 측정 중인 다른 작업과 겹치지 않는 후속 작업으로 남깁니다.

## 7. 예정 변경 파일과 함수별 루프 모양

모든 경로는 패키지 루트 상대입니다. 이 문서 작성에서는 아래 파일을 변경하지 않습니다. 승인 후 DETAIL의 계약/수용 기준을 먼저 갱신하고 구현합니다. 명시적인 내부 blueprint 소비 경계가 추가될 때만 INTENT를 갱신합니다.

| 파일 / 함수 | 예정 변경 | 87라운드 루프 모양 |
| --- | --- | --- |
| `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts` / `createDynamicFunction` | 기존 경로 치환 결과와 리터럴 토큰을 비실행 인식기로 전달; 평가 함수 생성은 유지 | 기존 컴파일 한 번; 토큰은 인덱스 `while` 한 번, 사용자 함수 실행 없음 |
| `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts` / `compileBlueprintExpressions` | compiled descriptor에 선택 형태와 완전한 순수 읽기 증명 기록 | 기존 node/declaration/control `for` 안에서 한 번 기록; 추가 전체 분석 없음 |
| `src/core/blueprint/utils/analyze/createBlueprintGate.ts` / `createBlueprintGate` | discriminator 기술·작성 active의 gate identity와 기존 순서를 보존 | gate 생성당 고정 검사; values는 한 번의 인덱스 `for` |
| `src/core/blueprint/utils/analyze/collectDeclarations.ts` / `collectDeclarations` | 변환 앞 항/자체 active 뒤 항의 대응과 static body 소유 정보를 전달 | 기존 키워드/분기 루프에 기록을 결합; 재귀 복제 없음 |
| `src/core/blueprint/utils/analyze/buildGateSelectionPlan.ts` / `buildGateSelectionPlan` (신설) | 그룹/bucket, baseline, gate→기여, 읽기→그룹 계획 | 템플릿별 declaration/gate를 한 번 `for`; 리터럴 소속 에지마다 한 번 등록; 순서 cursor 병합 |
| `src/core/blueprint/blueprint.ts`, `type.ts`, `index.ts` | 동결 전 계획 생성, 내부 descriptor 계약과 이름 export | 기능 없는 청사진은 공유 빈 계획; 생성 후 매 갱신 재작성 없음 |
| `src/core/settle/utils/gates/getGateRegistry.ts` / `register`, `locate`, `mayChangeAt`, `mayChangeOwnDeclarationAt`, `remove` | 그룹의 발생 결합과 역읽기 색인; 수명/이동 무효화 | 최초 결합 한 번; 갱신은 changed path trie cursor만 `while`; actual affected 그룹만 `for...of` |
| `src/core/settle/utils/gates/readGateSelection.ts` / `readGateSelection` (신설) | 현재 reader 의미의 키와 세대에서 bucket 조회 또는 커밋 descriptor 반환 | 고정 분기·한 lookup; 매 호출 B 루프/배열 없음 |
| `src/core/settle/utils/gates/evaluateGate.ts` / `evaluateGate` | 부모 적용 조건 후 같은 자리에 표/성공 결과 경로; fallback try/catch 유지 | 부모 gate는 인덱스 `for`와 첫 거절 `break`; 표 대상 1회 조회 공유; fallback reads 한 `for` |
| `src/core/settle/utils/write/registerRecalculation.ts` / `registerRecalculation`, `getDependencyIndex.ts` / `affected` | 그룹 읽기와 실제 node/derive/watch owner를 분리; 누적 읽기 세대 무효화 | changed path/affected owner 한 순회; 동일 fragment gate의 dormant 자식 B개 확장 없음 |
| `src/core/settle/utils/compute/computeNode.ts` / `computeNode` | 정적 gate 계획 참조; 원래 baseline·바퀴·재귀 호출·수렴 조건 유지 | gate 후보 재수집 루프 제거; round `for` 유지; actual dirty 자식 한 `for` |
| `src/core/settle/utils/compute/primeHost.ts` / `primeHost` | 정적 무게이트 baseline 목록 사용 | baseline 에지 하나당 한 인덱스 `for`; 전체 분기 후보 검사 없음 |
| `src/core/settle/utils/compute/selectNodeSchema.ts` / `selectNodeSchema` | 선택 기여와 fallback을 ordinal로 처리; ID 목록을 한 번 생성·공유 | `filter/every/map/map`을 후보 cursor와 gate `for/break`로 대체; warning/merge 순서 유지 |
| `src/core/settle/utils/compute/selectChildren.ts` / `selectChildren` | 실제 후보 계획 사용, 앞 항 false 에지와 inactive 입력 처리를 구별 | sorted cursor `while` + declaration/gate `for`; 승인된 candidate 목록 밖 B 루프 없음 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts` / `flushPendingGateReads` | 그룹 bound read 계획 공유, 동일 세대 중복 제거 | 유일 read의 인덱스 `for`; 새 세대/recursive/opaque는 기존 공표 |
| `src/core/settle/utils/controls/getControlLayers.ts` / `getControlLayers` | B2의 control 목적별 contribution 색인을 소비 | selected contribution `for` 한 번; 같은 선언 배열을 두 번 map하지 않음 |
| `src/core/settle/utils/compute/updateOutput.ts` 및 쓰기·복구·경로 변경 경계 | 읽기를 바꾼 발생의 세대만 무효화 | 이미 방문하는 changed 노드/경로 루프에 고정 등록 결합; 전체 결과 캐시 순회 없음 |
| `src/core/settle/utils/commit/commitSettlement.ts` / `commitSettlement`, `src/core/record/type.ts`, `src/core/settle/type.ts` | 성공한 dirty 슬롯만 커밋; 정착 누적 무효화/캐시 수명 계약 | 변경 슬롯 `for...of`; 모든 B 결과 복사 없음; branchless에 슬롯 할당 없음 |
| `src/core/blueprint/__tests__/blueprint.gate-selection.test.ts`, `src/core/settle/__tests__/settle.gate-selection.test.ts`, `settle.gate-reuse.test.ts`, `settle.gate-selection-order.test.ts`, `settle.gate-selection-counts.test.ts` (신설) | 인식/정적 오류, 네 모드 차등, 무효화/수명, 즉시 순서/반례, B 축 계수를 owner별로 분리 | 작은 고정 fixture와 정적 parameter rows; 파일별 case 상한 유지; 시간 측정과 분리 |
| `src/core/blueprint/DETAIL.md`, `src/core/settle/DETAIL.md`, `src/core/record/DETAIL.md` | 인식/되돌림·비교 의미·발생 수명·비용·수용 기준 | 문서 변경; 원장 반영은 관리자 승인 절차 |

신설 인식 보조는 해당 컴파일러 organ 아래, 계획 빌더는 analyze organ 아래, 발생 조회 보조는 settle gates organ 아래에 둡니다. 함수 하나당 내보내는 역할 하나를 지키고, 배열은 인덱스 `for/while`, Map/Set은 필요할 때 `for...of`를 사용합니다. bucket 회원 색인은 반복 조회를 재사용할 때만 만들며 단일 조회를 위해 Set을 만들지 않습니다. 기존 원자 판정·캐시 identity·서브트리 독립 경계를 유지합니다.

## 8. 차등 시험과 승인 후 확인 계획

실행하지 않은 계획입니다. 제품 공개 옵션을 추가하지 않고 내부 시험 장치에 `selectionTable`/`reuseCommittedResults` 두 스위치를 둡니다. **00이 기존 전수 평가 기준**이고 10·01·11을 각각 00과 비교합니다. 00은 bucket/group 결과를 읽지 않고 기존 평가 위치에서 원래 `evaluateGate`를 호출합니다. 계획 자체를 잘못 만든 공통 버그가 양쪽을 같이 통과시키지 않도록 00에는 기존 후보 열거 경로도 유지합니다.

각 진입 직후와 배달 종료 후 다음을 비교합니다: 전순서 child path/kind/active/선택 선언/유효 schema/typeConflict, raw/latent/extras/local/emit 및 존재 여부, 변경 없는 노드·배열의 참조 재사용, 실패·경고의 코드/경로/schemaPath/순서/중복/원인/degraded/드러남 시점, 생김·퇴장·채움·재진입, revision 비트/수와 payload/리스너 호출 순서, 호스트·파생·전이·사슬 라운드와 예산. **함수 호출 수는 달라도 라운드 수는 같아야 합니다.** 내부 짧은 기록으로 각 평가 직전 투영과 즉시 적용 순서도 비교합니다.

| 시험 묶음 | 입력/반례 | 반드시 같은 결과 |
| --- | --- | --- |
| 인식 | `===` 양변 순서·escape·괄호, 목록·OR, 직접 본체 키 | 동일 bucket과 선언 전순서; 작성 스키마 불변 |
| 되돌림 | `==`, 함수/블록, `@`, 동적 읽기, 조건부 키, opaque `if` | 동일 기존 평가 호출·오류; 순수 읽기 증명 없는 식 캐시 금지 |
| 비교 경계 | 없음/명시 undefined/null/false/빈 문자열/0/−0/수 1/문자열 '1', wrong-kind host | `strict`/`sameValue`/`sameValueZero`별 F와 같은 결과 |
| 목록 겹침 | active의 `[a,b]`, `[b,c]`, 서로 다른 종류의 같은 이름 | 모두 선택, 다중 활성 경고, 앞선 종류 형상과 SHARED_NODE_CONFLICT 처리 동일 |
| 정적 오류 | 명시 discriminator 겹침·kind 불일치·키 없음·빈 태그 교차·null 스키마 분기 | 기존 청사진 오류 코드/위치/순서와 nullable 동일 |
| 무일치 | a→어느 목록에도 없는 값→a | 본체 유지, 실제 퇴장/latent/재진입 및 배달 동일 |
| FRAGMENT-048 | 앞 항 false이고 뒤 항이 던짐; 앞 항 true 뒤 항 true/false/throw | 거짓 앞 항에서는 뒤 항 0회; 참에서는 기존 예외/exit/뒤 항 평가 위치 동일 |
| 즉시 반영 | 앞선 entry/default/derived가 kind를 바꿈; 뒤 gate가 앞선 조건부 자식을 읽음 | 다음 gate 전에 재조회, eager 공표와 중간 형상·round 동일 |
| 재사용 | 성공 false/true 뒤 무관한 키; 읽는 키 변경·whole replace·load/reset | 안정 입력만 재사용, 모든 무효화 후 F와 동일 |
| 예외/복구 | 성공 후 예외, 예산 초과/rollback 후 재입력 | 실패 결과를 성공 캐시로 저장하지 않음; gateThrowVersion·throwingGateExits 동일 |
| 이력 독립 | SETTLE-044의 A/B/C 양의 순환을 서로 다른 이력으로 같은 입력에 도달 | 고정 출발 최소 고정점, A/B 잔류 금지 |
| 발생 결합 | 중첩 union, 동일 $ref의 두 호스트, 배열 두 아이템/재인덱싱, 유한 재귀 여러 깊이 | 발생별 host/edge/L와 결과 독립, 재귀 상한 동일 |
| 계수 | B=5/10/20/40의 kind_0↔kind_4, U19 공유 live 폭 고정 | §6 계수; 실제 불일치면 산술 목표 미충족으로 보고 |

전수 기준에서 일부러 잘못된 comparator 또는 무효화 누락을 넣는 시험용 반례가 실패해야 시험 장치가 같은 복사본을 보고 있음을 증명합니다. 고정 fixture 외에도 작은 유한 스키마/입력 전환의 생성 사례를 네 모드에 돌려 비교합니다. 테스트는 owner 내부 `blueprint/__tests__`, `settle/__tests__`에 두며 안정된 acceptance group을 DETAIL에 기록합니다. 파일당 case 제한과 저장소 지정 yarn 검증을 따릅니다. 기존 기대값·snapshot을 최적화에 맞춰 바꾸지 않습니다.

계수는 expression/if 함수 진입, 실제 bucket `get`, 키 reader, reuse descriptor 조회, branch/declaration/entry/registry/flush/control cursor 방문을 **별도로** 기록합니다. 캐시 hit를 table lookup으로 잘못 세거나 O(B) 거짓 결과 확인을 숨기지 않습니다. 생성 준비와 커밋 결과 보유 비용도 별도 기록합니다. 현재의 타이밍 작업이 끝난 뒤에만 지정 yarn 검증 및 같은 세션의 분기 축 측정을 수행하며, 그 결과가 없으면 기준 (1)·(2)·(3)의 통과를 선언하지 않습니다.

## 9. 메모리와 준비 비용

청사진당 G=표 그룹 수, B=대상 gate 수, M=리터럴의 **분기 소속 에지 총수**, V=그룹별 고유 값 총수, P=순수 재사용 식의 고유 읽기 prefix/연결 수, C=gate↔declaration/child contribution 연결 수로 둡니다. 추가 정적 공간은 **O(G+B+M+V+P+C)**입니다. 한 값이 여러 분기에 속하면 M에 모두 셉니다. 값별로 전체 B gate 결과 배열이나 전체 child graph 사본을 만들지 않아 O(V×B)/O(V×전체 스키마)의 공간을 요구하지 않습니다. 이미 있는 gate/declaration/entry 객체는 참조합니다.

단일 tag, payload 셋인 B=5/10/20/40 fixture는 G=1, V=M=B, branch 연결도 B, payload 기여 에지는 3B입니다. 같은 구조 자료를 공유하면 점근적 추가 공간은 O(B)이고, 값 bucket과 그룹/에지 자료의 실제 셀·배열 수를 보고합니다. bucket별 전체 유효 스키마를 청사진에서 미리 병합하지 않습니다. 실제 사용한 bucket/선택의 런타임 병합 메모는 기존 bounded-by-use 정책을 사용합니다.

런타임 공간은 살아 있는 발생에 결합된 gate/group 및 읽기 에지 수에 비례하고, 정착 scratch는 무효화·조회·재평가한 슬롯 수에 비례합니다. 직전 성공 결과 한 세대만 보유하며 커밋 이력을 누적하지 않습니다. 재귀 깊이는 runtime 발생 공간에만 들어가고 청사진 메모리에 곱하지 않습니다. branchless 또는 자격 그룹이 없는 청사진은 공유 빈 계획/부재 슬롯으로 추가 Map/Set을 만들지 않습니다.

준비 시간은 기존 분석에서 gate·리터럴 소속·기여·읽기 에지를 한 번 등록하는 O(B+M+P+C)입니다. 목록 순서 자료의 병합을 포함하되 모든 bucket에 모든 선언을 복사하는 준비는 하지 않습니다. heap byte는 엔진 자료구조별 차이가 있으므로 이 문서에서 수치를 추정하여 사실로 적지 않습니다. 승인 후 별도 세션에서 청사진 준비·보유 슬롯 수와 실제 heap을 기록합니다.

## 10. 관리자 승인 지점과 열린 확인

승인 대상은 인식 식/순수 읽기 증명, 비교 방식별 표, 발생별 세대 무효화, 같은 위치·순서의 적용, 성공한 커밋 함수값 재사용, B2/B4/B5의 코드 수준 연결입니다. 원장에는 96C-01대로 BLUEPRINT-007·017과 SETTLE-020의 좁은 보충이 필요합니다. SETTLE-018·044, FRAGMENT-048의 AND와 정적 판별 오류 정책, ERROR의 드러남은 뒤집지 않습니다.

열린 확인은 두 가지입니다.

1. **discriminator의 0 부호 경계:** BLUEPRINT-017의 설명 `===`와 현재 기술 게이트의 `Object.is`가 다릅니다. 이 설계는 차등 기준을 보존하기 위해 현재 방식별 표를 제안합니다. 관리자가 이 읽기를 확인해야 합니다. 통일을 원한다면 별도 계약/기준 평가 수정이며 이번 두 최적화에 섞지 않습니다. 확인 전에도 일반 문자열 태그의 동등성은 성립합니다.
2. **U19 비용의 분모:** 조각 수만 늘리고 actual live 폭/입력/출력 크기를 고정한 행에서 무관한 branch 처리 0회를 요구합니다. 서로 다른 live 필드를 실제로 N개 더 만드는 행의 필수 출력 비용까지 branch 최적화로 없어졌다고 보고하지 않는 이 구분을 확인해야 합니다. 해당 비용은 새 지연 출력 설계를 열지 않고 단계별로 그대로 기록합니다.

승인 후에만 제품 변경과 차등 검증을 시작합니다. 게이트 계수·동등성·잔여 순회 증거를 함께 제출하고, 전체 기준 (1)의 잔여 B 축이 보이면 그 위치를 남긴 채 미충족으로 보고합니다.
