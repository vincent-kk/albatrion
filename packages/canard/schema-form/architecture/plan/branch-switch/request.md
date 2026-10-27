# 분기 전환 — 게이트 전환 비용을 변화량에 비례시키는 설계 (453라운드)

## 요청

설계 최적화 단계(446~452라운드)는 분기 전환 oneOf-80 행을 0.16.1의 6.87배(왕복 0.511 ms 대 0.0743 ms)에서 멈추고 "설계의 대규모 개편 없이 도달 가능한 상한"으로 기록했다(452C-01). Vincent는 다음 단계를 분기 전환에만 집중하도록 열었고, 두 가지를 더했다. 첫째, 분기 전환은 oneOf로 대표되지만 모든 분기에 해당한다. 둘째, `if`/`then` 구문으로 검증기가 판정하는 분기 전환도 대상에 넣되, 검증기 분기는 기존 사례(측정 행)가 없으므로 앞선 개선과 맞물리게 고치는 것을 최우선으로 한다(`../../reviews/round-453-owner-answers.md`). 관문 수치는 446C-06을 유지한다: oneOf-80 왕복이 0.16.1의 1.5배 안이고 1 ms 아래.

## 사실 — 지금 엔진이 전환 한 번에 하는 일

전환 쓰기 한 번(판별자 `kind`를 바꿔 잎 3개가 나가고 3개가 들어옴)의 작업량을 현재 src를 번들해 V8 정밀 커버리지로 센 결과다(기호: D = 호스트 선언 수 81, E = 자식 엔트리 수 242, G = 게이트 수 80, A = 활성 자식 수 5, L = 루트 잠복 항목 수, Δ = 나감+들어옴 6).

| 게이트 종류 | 쓰기당 엔진 호출(분기 80) | 분기 1개 추가당 증가 |
| --- | --- | --- |
| `active`(식) | 2,752 | 약 12.5 |
| `if`(검증기 guard) | 19,706 | 약 225 |
| `discriminator` | 20,467 | 약 234 |
| `active`, 모든 분기를 한 번씩 방문한 뒤(L=237) | 4,648 | L 항이 더해짐 |

세 종류는 같은 선택 경로를 탄다(`settle/utils/compute/childSelection/selectEntryStep.ts:100-135`의 `evaluateGate`). 다른 것은 판정의 입력과 계획의 유무다.

1. **`active`만 직접 선택 계획과 선택 표를 가진다.** `getDirectChildSelectionPlan.ts:102`가 `gate.kind !== 'active'`를 거부하므로 `if`·`discriminator` 호스트는 바퀴마다 모든 엔트리를 돌고(`selectChildren.ts:215-220`), 프레임이 `consistent=false`가 되어 두 번째 전체 바퀴를 한 번 더 돈다(`gates/canSkipGateWheel.ts:32`). 평가 수는 `if`가 쓰기당 8G, `discriminator`가 10G다.
2. **`if`·`discriminator`는 게이트마다 호스트 값을 복사한다.** `gates/evaluateGate.ts:51`의 `{ ...host }`가 평가마다 O(A)이고, `if`의 guard는 호출마다 WeakMap 2단 조회와 포인터 문자열 slice, Map 조회를 거쳐 가져온다(`validation/utils/guard/readFieldNodeGuard.ts:15-38`). 컴파일 자체는 (검증기, 루트 스키마, 포인터)마다 한 번이라 문제가 아니다.
3. **`active` 호스트의 선택은 이미 O(A+Δ)다.** 선택 표가 직전·다음 키와 입력 이름만 방문한다(`gates/gateSelection/getTableVisitSteps.ts:9-42`). 형상은 매번 비게이트 baseline에서 처음부터 계산되고(`compute/primeHost.ts:11,102`), 바퀴 이전 구조와의 차분이 `pendingExits`가 된다(`selectChildren.ts:269-287`). 직전 활성 집합에서 출발하지 않으므로 SETTLE-044·GOAL-029는 지금도 지켜진다.
4. **변화량에 비례하지 않는 항은 선택 밖에 있다.**
   - 바퀴 준비: 게이트 목록 복사와 `Set`(`compute/computeNode.ts:165-166`), `byLocation('')` 전체 spread 뒤 filter가 2회(`gates/getGateRegistry.ts:206-210`), `gates.every(getGateExpression)` G회(`computeNode.ts:192-194`), 예산 상한 캐시 검사 `every` 2회(`gates/getGateBudgetCap.ts:68-74`). 모두 O(G), 호스트 수명 동안 바뀌지 않는 값이다.
   - 나감 정책: 나가는 노드마다 `getControlLayers`가 루트 선언 D개를 훑고(`settle/utils/controls/getControlLayers.ts:82,117`), 쓰기당 12회 호출되어 약 12×D 방문이다. 정책은 청사진에서 정해지는 값이다.
   - 출력 재조립: `assembleObject`가 자식 엔트리 E개를 모두 돌며 `Map`과 `Set`을 만든다(`behaviors/objectBehavior/branch/utils/assembleObject.ts:175-199`). 활성 자식은 A개다.
   - 비활성 값 메모: 잠복이 하나라도 있고 들어옴·나감이 있으면 매번 dirty가 되어(`commit/commitSettlement.ts:238-242`) 루트 잠복 L개 전부를 `find`로 다시 확인하고 정렬하며 호스트별 목록을 다시 만든다(`commit/updateInactiveValuesMemo.ts:33-138`; L=477에서 쓰기당 `find` 477회, `compareOrder` 963회).
   - 잠복 경로 색인: 정착마다 잠복 키 L개를 `JSON.parse`해 O(L·depth)로 다시 만든다(`latentStore/getLatentPathIndex.ts:17-23`). 잠복 키는 `[path, identity]` JSON 문자열이라 넣고 뺄 때마다 stringify·parse가 붙는다(쓰기당 `getBlueprintNodeIdentity` 61회, `PathKeyedMap` set 22·delete 12).
   - 존재 등록이 구조를 두 번째로 diff하고(`dependencies/registerPresenceChanges.ts:31-37`), 재계산 등록이 경로 문자열을 잘라 조상을 만든다(`dependencies/registerRecalculation.ts:97-113`).

측정값으로 보면 분기 2개·형제 0의 가장 작은 폼에서도 쓰기 하나가 0.100 ms(0.16.1은 0.031 ms)이고, oneOf-80은 쓰기당 0.255 ms다. 즉 **고정 바닥 약 100 µs + 호스트 크기 항 약 155 µs(분기당 1.9 µs)**이며, 0.16.1은 바닥 31 µs에 분기당 0.08 µs다. 관문(쓰기당 56 µs)에 닿으려면 바닥을 절반 아래로, 호스트 크기 항을 15분의 1 아래로 깎아야 한다. 447C-06의 "설계 Ⅰ+Ⅱ로도 왕복 0.156~0.24 ms가 하한"은 도출이 기록되지 않아 이 단계의 관문으로 쓰지 않고, B0의 장부가 대체한다(편집자 정정, 재검증 목록).

비교 대상의 의미 차이도 적어 둔다. 0.16.1은 모든 분기의 자식 노드를 생성 때 만들어 두고 전환 때 두 분기의 자식만 reset하며 재진입 값은 분기 기본값으로 돌리고 쓰기 경로에서 검증하지 않는다(0.16.1 `BranchStrategy.ts:465-520`). 새 판은 잠복 원본을 보존하고 재진입 노드가 새 인스턴스다(NODE-044). 관문은 그래도 0.16.1 시간 기준이다.

## 설계 명제

**게이트 전환 한 번의 비용은 O(G)의 작은 상수항 + O(Δ) + 작은 바닥이어야 하고, 호스트 선언 수 D·엔트리 수 E·루트 잠복 수 L에 비례하는 항이 없어야 한다.** 게이트 G개를 모두 다시 평가하는 것은 BLUEPRINT-007이 정한 바이며 유지한다. 대신 평가 하나의 비용을 입력 identity 비교 수준으로 내리고, 평가 밖의 모든 장부를 Δ에만 비례시킨다. 세 게이트 종류는 같은 설계를 탄다.

## 바꿀 것

### Ⅰ. 게이트 판정의 통일 — 세 종류를 "읽기 목록 + 판정 함수" 하나로 (최우선)

- 청사진이 게이트마다 `GatePredicate { reads, evaluate }`를 컴파일해 둔다. `active`는 지금의 식 의존 목록이 `reads`다. `discriminator`는 `reads = [host/propertyName]` 하나와 태그 값 집합이다. `if`는 `reads = [host]`(호스트 투영 객체 하나, identity 비교)와 extras이고, `evaluate`는 검증기 guard다. guard는 등록된 occurrence에 한 번 묶어 두고 호출마다 포인터로 찾지 않는다.
- 직접 선택 계획과 선택 표를 `reads`만 보고 만들게 해 `if`·`discriminator`도 `active`와 같은 O(A+Δ) 선택을 탄다(`getDirectChildSelectionPlan.ts:102`의 종류 제한 제거). `discriminator`는 태그 값 → 엔트리 목록의 표를 청사진에 두어 분기 선택이 O(1) 조회가 된다.
- `if`·`discriminator`의 입력 객체는 **호스트마다 바퀴 라운드당 한 번** 만들고 그 라운드의 모든 게이트가 같은 객체를 받는다(지금은 게이트마다 `{ ...host }`). 같은 객체이므로 프레임의 입력 일관성 검사가 통과해 두 번째 전체 바퀴가 사라진다(원인 확인은 B0의 일이다).
- 게이트 입력 메모(BLUEPRINT-053)를 세 종류 모두에 적용한다: `reads`의 값이 모두 `Object.is`로 같으면 판정을 부르지 않고 직전 결과를 쓴다. 던진 평가는 메모하지 않는다. 이것은 입력이 같은 순수 술어의 결과 재사용이라 GOAL-029와 어긋나지 않는다.
- 검증기 분기의 관문: 같은 형상의 `active` 행에 게이트당 guard 호출 1회의 비용을 더한 값 안. 0.16.1에 같은 의미의 쌍이 있으면 그 쌍의 1.5배도 함께 적는다.

### Ⅱ. 호스트 수명 준비물 — 호스트 크기에 비례하는 상수 작업을 수명당 한 번으로

- 바퀴 계획: 게이트 배열·식 표·baseline 가능 여부·예산 상한을 호스트 수명 동안 한 번 계산해 호스트 레코드에 둔다(지금은 쓰기마다 O(G) 복사·검사 여러 번). `rebuild`·청사진 교체·호스트 재진입에서 버린다.
- 엔트리별 나감 정책과 제어 계층: 청사진 노드가 자기 엔트리의 `unsetOnInactive`·정책 상속 결과를 들고, 나가는 노드는 그것을 읽기만 한다(지금은 노드마다 루트 선언 D개를 훑는 `getControlLayers`를 세 곳에서 부른다).
- 정적 자식 준비물(D2-P5, SETTLE-052): 게이트·overlay·relocated 게이트가 없는 정적 엔트리는 호스트 수명 동안 한 번 준비하고 동적 엔트리만 매 정착 고정 출발점에서 고른다. 보류 가지 `perf/schema-form-d2-sibling-linear`(4681c0aff)의 DETAIL 세 곳이 출발 자료다. 형제 1,000/0의 선형항(452C-03)이 이 항목의 대상이다.

### Ⅲ. 변화량 적용 — Δ 밖의 장부를 없앰

- 잠복 키: 노드 레코드가 자기 `[path, identity]` 키를 한 번 만들어 들고, 잠복 저장·색인·메모가 그 키를 재사용한다(stringify·parse 왕복 제거). 살아 있는 노드의 집합(`pendingExits`·`entered`·`exited`·`changedNodes`)은 노드 identity로 잡고, 아직 없는 노드를 가리켜야 하는 것(게이트 읽기·의존 표식·`changedRaw`)만 경로 키로 남긴다.
- 비활성 값 메모: 전체 재구성 대신 증분 유지. 나감은 자기 호스트의 목록에 청사진 엔트리 순서(호스트의 엔트리 색인)로 끼우고, 들어옴은 뺀다. 정렬과 전수 `find`가 사라지고 Δ가 닿은 호스트만 바뀐다. `inactiveValues`의 공개 결과(순서·내용)는 같아야 한다.
- 잠복 경로 색인: 정착마다의 재구성(`getLatentPathIndex`)을 없애고 영속 `PathStoreIndex`의 O(depth) 질의만 쓴다.
- 출력 재조립: 호스트의 활성 자식 목록 A개를 청사진 순서로 걸어 조립한다(E개 전수와 `Map`·`Set` 제거). 방출 객체는 지금처럼 새 객체다.
- 존재 등록과 재계산 등록: 이미 있는 Δ 집합을 쓰고, 조상은 경로 문자열을 자르지 않고 노드의 부모 사슬을 걷는다.

### Ⅳ. 바닥 — 남는 고정 비용

Ⅰ~Ⅲ 뒤 형제 0·분기 2 폼의 쓰기 하나에 남는 비용을 B0와 같은 장부로 다시 재어, 정착 컨텍스트 생성·커밋·배달·GC 가운데 큰 것부터 깎는다. 목표선은 B0 뒤에 적는다(측정 전 고정, TEST-081).

### Ⅴ. 설계 Ⅱ — 내부 레코드 유지와 수명별 핸들 (조건부)

Ⅰ~Ⅳ로 관문에 못 미치면 NODE-060의 설계 Ⅱ로 간다: 내부 레코드는 비활성일 때도 raw를 들고 남으며, 공개 `FieldNode`는 수명마다 새로 발급해 NODE-044를 지킨다. 잠복 직렬화·노드 재생성·메모가 사라지고 나감은 레코드의 비활성 표시가 된다. 비용은 호스트당 K·M의 보유 메모리이며 여섯 의미 시험(`plan/design-optimization/verification.md`)이 그대로 관문이다. 착수 여부는 B3의 수치로 Vincent가 정한다.

## 단계

| 단계 | 무엇 | 끝났다는 것 |
| --- | --- | --- |
| B0 측정 장부 | 쓰기 한 번의 단계별 µs와 할당 장부(형제 0, oneOf-80, 깊은 분기 하나)를 세 게이트 종류에 대해 측정 장치에 추가. `switch-if-80`(검증기 AJV)·`switch-discriminator-80` 행과 두 번째 바퀴의 원인 확인. 단계 시작 판과 0.16.1 | 장부 표와 세 항(바닥·호스트 크기·Δ)의 분해가 적힘. B1~B3의 목표선을 이 표로 측정 전에 고정 |
| B1 게이트 통일(Ⅰ) | `GatePredicate`, 종류 무관 선택 계획·표, 라운드당 입력 한 번, 입력 메모 | `if`·`discriminator` 행이 `active` 행과 같은 차수. 그림자 검증(`gateSelectionTable` verify·`gateWheelEvaluation` shadow)으로 동등성 |
| B2 준비물과 Δ 적용(Ⅱ·Ⅲ) | 가설마다 PR 하나: 바퀴 계획, 나감 정책 준비물, 정적 자식 준비물(D2-P5), 잠복 키, 증분 메모, 색인, 조립, 등록 | 각 PR이 겨냥한 항이 폭 (다) 밖으로 줄고 다른 행이 TEST-073 선을 넘지 않음 |
| B3 관문 재측정 | D0 장치·같은 창에서 oneOf-80과 세 종류 행, 형제 탐침, 다른 canonical 행 | 관문 통과면 B5로. 미달이면 수치와 Ⅴ의 추정을 Vincent에게 |
| B4 설계 Ⅱ(Ⅴ, 조건부) | 슬롯 레코드와 수명별 핸들, 여섯 의미 시험, 메모리 상한 | 여섯 시험 초록, 상한 기록 |
| B5 마감 | 통합 판 재측정(코어 표·React `--equivalent`·B2 힙), 루트 PR, 설계 문서·ADR 반영 | 관문 판정과 Vincent의 수용 |

## 관문

- oneOf-80 왕복이 0.16.1의 1.5배 안이고 1 ms 아래(446C-06 유지). 같은 형상의 `discriminator` 행도 같은 선. `if` 행은 Ⅰ의 선.
- 형제 1,000 전환이 형제 0의 작은 상수 배 안.
- 다른 canonical 행과 구독 경로 행이 TEST-073 선을 넘지 않음. B2 노드당 힙은 Node가 단계 시작 이하, Bun은 Vincent 수용(452라운드). 설계 Ⅱ는 보유 메모리 상한을 따로 적음.
- 공개 겉면 변경 0, 기존 시험 기대값 변경 0, 전후 배달 비교 차이 0.

## 원장과의 접촉

- 유지: NODE-044(재진입은 새 인스턴스), SETTLE-044·GOAL-029(출발점 고정, 형상은 순수 함수), BLUEPRINT-007(모든 게이트 재평가, 역색인 없음), SETTLE-001(정착 단계 순서), ERROR-125.
- 쓰는 것: BLUEPRINT-053(게이트 입력 메모, 세 종류로 확장), SETTLE-052(정적 자식 준비물), NODE-060(설계 Ⅱ의 자리).
- 새 항목(453라운드): 단계의 자리(LANDING), 설계 명제와 세 항 예산(SETTLE), 게이트 판정 통일(BLUEPRINT), 단계 구성과 관문(TEST), 검증기 분기의 포함(FRAGMENT 또는 BLUEPRINT).

## 하지 않는 것

- 꺼진 분기의 공개 노드 객체를 살려 두는 것(0.16.1 방식, NODE-044 기각).
- 게이트의 읽기 경로로 평가를 건너뛰는 역색인(BLUEPRINT-007). 입력 메모는 평가 결과의 재사용이지 건너뛰기가 아니다.
- 정착 단계 순서 변경, 공개 겉면 변경, 시험 기대값 변경. 하나라도 유일한 길로 보이면 멈추고 라운드로 올린다.
- 마운트·일괄 입력의 추가 최적화(이 단계는 분기 전환에만 집중한다는 Vincent의 지시).
