# 단계 01 — 설계문서 해상도 대조 원문과 판정

세 겹 검사의 (다)(PROCESS-051)다. 지시는 설계문서 여덟(`design/*.md`)을 원장과 대조하는 같은 지시서를 codex와 antigravity에 주었다. 찾을 것은 다섯이다: 원장에 없는 주장, 뒤집힌 현행 결정, 요약으로 바뀐 뜻, 진 충돌을 옮김, 빠진 보충. 검토자는 파일을 고치지 않았다. 문서는 네 묶음({00,07}, {01,04}, {02,03}, {05,06})으로 나눠 보냈다. ADR(`adr-next/*.md`, U8 뒤 `adr/`)은 설계문서의 절을 글자 그대로 모은 것이므로(`verify-adr` 대조) 따로 보내지 않았다. 기준은 커밋 `2f255ffec`, 원장 1,348항목(현행 1,076)이다. 검증자가 지적마다 인용한 두 자리를 원장과 대조해 확인·부분·기각·원장 물음으로 걸렀고, 확인과 부분만 고쳤다. 과정은 `plan/01-design-docs/log.md` §5(U7)에 있다.

## 1차 (2026-09-29)

지적 13(codex 12, antigravity 1), 중복을 합치면 12.

### 묶음 {00,07} — codex (session dff7f992-372d-46ef-a5b8-410b1702543f)

> # U7 round 1 — design/00-goals-and-values.md, design/07-landing-and-tests.md — findings 2
>
> F1 중간 kind 5
> - 문서: design/00-goals-and-values.md:237
> - 원장: GOAL-036 (ledger/GOAL.md:577) "제약은 2항뿐이다."
> - 문서 글: "3. `then`·`oneOf`·`allOf`·`anyOf` 블록에서 프로퍼티 노드를 선언할 수 있다(GOAL-036). 축 2항은 컨벤션이며 폼은 검사하지 않는다(GOAL-036, GOAL-035, FRAGMENT-023)."
> - 왜: 원장의 보충은 프로퍼티 노드 선언을 제한하는 항목이 축 2항뿐이라고 확정한다. 문서는 축 2항의 성격만 적고 유일한 제약이라는 범위를 빠뜨렸다.
> - 제안: 같은 문장 곁에 "제약은 축 2항뿐이다(GOAL-036)."를 더한다.
>
> F2 중간 kind 5
> - 문서: design/07-landing-and-tests.md:251
> - 원장: LANDING-124 (ledger/LANDING.md:1919) "| `NodeEventType` | 17종. 공개 서브셋 6종 | **3역할로 재정의** — 상태 통지 / `revision` 원장 / 명령 시그널. 17종 개별의 생사는 언급이 없다 | 재정의 + **미확인** | `core/types/event.ts:45-96` / `adr/0008:24-28` |"
> - 문서 글: "`NodeEventType` 17종의 개별 생사"
> - 왜: 문서는 개별 이벤트의 미확정 상태만 옮겼다. 원장의 보충이 더한 공개 서브셋 6종과 상태 통지·`revision` 원장·명령 시그널의 3역할 재정의가 이 문서에서 빠졌다.
> - 제안: LANDING-124의 기록 곁에 공개 서브셋과 3역할 재정의를 같은 ID로 옮기고, 개별 17종의 생사는 미확정이라고 유지한다.

### 묶음 {00,07} — antigravity (session fc2e35fc-9d90-47fb-830f-8cb48bed2492)

> # U7 round 1 — design/00-goals-and-values.md, design/07-landing-and-tests.md — findings 0

### 묶음 {01,04} — codex (session d5a42fa1-c7fb-4ac4-be48-60df8c2db9a6)

> # U7 round 1 — 01-schema-to-blueprint.md, 04-controls.md — findings 5
>
> F1 중간 4
> - 문서: design/01-schema-to-blueprint.md:44
> - 원장: SCHEMA-004 (ledger/SCHEMA.md:106) "객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 게이트 순환은 정착 오류로 한정한다(BLUEPRINT-030)."
> - 문서 글: "재귀는 지연 해석으로 유한 트리(11라운드 실측)."
> - 왜: 충돌 줄이 이 무조건적인 유한 트리 문구를 뒤집었는데 표 셀에 그대로 남고, 이긴 규칙만 뒤에 붙었습니다.
> - 제안: 유한 트리 문구를 지우고 순환의 두 오류 조건을 표 셀에 반영합니다.
>
> F2 높음 4
> - 문서: design/01-schema-to-blueprint.md:189
> - 원장: BLUEPRINT-012 (ledger/BLUEPRINT.md:258) "종류가 다른 선언이 함께 켜져도 정적 선언끼리는 허용 집합의 교집합이 비지 않으면, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들면, 켜진 게이트 선언은 정적 허용 집합과의 교집합이 비지 않으면 노드 하나이고 충돌이 아니다(BLUEPRINT-044, BLUEPRINT-041)."
> - 문서 글: "| 같은 이름 + 다른 종류가 **동시에** 활성 | 충돌이다."
> - 왜: 표 행의 무조건 충돌 판정은 원장이 이긴 세 가지 비충돌 조건과 반대입니다. 조건 설명이 같은 셀 뒤에 있어도 첫 판정이 남습니다.
> - 제안: 첫 판정을 조건별 충돌 여부로 바꾸고 무조건 충돌 문구를 삭제합니다.
>
> F3 높음 4
> - 문서: design/01-schema-to-blueprint.md:189
> - 원장: BLUEPRINT-012 (ledger/BLUEPRINT.md:256) "정적 선언(호스트 본체, 게이트 없는 `allOf`, `$ref`)끼리는 교집합으로 노드 하나를 정하고 교집합이 빌 때만 `ALL_OF_TYPE_REDEFINITION`이며, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들지 않을 때만 `SHARED_NODE_KIND_CONFLICT`다(BLUEPRINT-044)."
> - 문서 글: "게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다(폼이 서지 않는다)."
> - 왜: 충돌 줄이 뒤집은 일반화를 그대로 옮겨, 교집합이 비지 않는 정적 선언도 오류로 읽히게 합니다.
> - 제안: 이 문장을 삭제하고 정적 교집합과 게이트 없는 분기의 fold 조건만 남깁니다.
>
> F4 높음 4
> - 문서: design/01-schema-to-blueprint.md:189
> - 원장: BLUEPRINT-012 (ledger/BLUEPRINT.md:257) "정적 노드가 있는 칸에서는 켜진 게이트 선언과 정적 허용 집합의 교집합이 빌 때만 정착 오류다(BLUEPRINT-041 U2·U4)."
> - 문서 글: "게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다:"
> - 왜: 게이트 선언의 동시 활성만으로 오류를 내는 옛 조건이 남아 있습니다. 원장은 정적 노드와의 허용 집합 교집합이 비는 경우로 좁혔습니다.
> - 제안: 정착 오류의 조건을 빈 교집합으로 고치고, 뒤의 마운트·커밋 처리 설명은 그 조건에 붙입니다.
>
> F5 중간 4
> - 문서: design/01-schema-to-blueprint.md:197
> - 원장: BLUEPRINT-016 (ledger/BLUEPRINT.md:309) "`type`은 켜진 게이트 선언과 정적 허용 집합의 교집합이 비면 그 게이트들이 켜진 동안의 정착 오류(`SHARED_NODE_CONFLICT`)다(BLUEPRINT-041, BLUEPRINT-044)."
> - 문서 글: "켜진 `then`과의 런타임 교차가 공집합이면 throw하지 않고 검증기가 값을 기각한다."
> - 왜: 바로 다음 문장이 `type` 예외를 설명하지만, 앞 문장은 모든 런타임 교차에 throw가 없다고 단정한 채 남아 있습니다.
> - 제안: 앞 문장의 범위를 `type` 외의 교차로 한정하고 `type`의 빈 교집합은 정착 오류라고 명시합니다.

### 묶음 {01,04} — antigravity (session 1486677b-4689-421e-8c15-adfacda9a166)

> # U7 round 1 — design/01-schema-to-blueprint.md, design/04-controls.md — findings 1
>
> F1 중간 4
> - 문서: design/01-schema-to-blueprint.md:44
> - 원장: SCHEMA-004 (ledger/schema.md:106) "`08-design-a-to-z.md:86`의 "재귀는 지연 해석으로 유한 트리"는 18라운드 결정과 다르다: 객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 게이트 순환은 정착 오류로 한정한다(BLUEPRINT-030). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:24`)."
> - 문서 글: "| `$ref`, `$defs`·`definitions` | 참조를 따라 형상을 만든다. 재귀는 지연 해석으로 유한 트리(11라운드 실측). 객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 게이트 순환은 정착 오류로 한정한다 |"
> - 왜: 충돌 줄에 의해 패배한 결정문("재귀는 지연 해석으로 유한 트리")이 규칙 6에 따라 이긴 규칙으로 대체되지 않고, 패배한 문장이 문서 표 셀에 그대로 잔존해 있습니다.
> - 제안: 셀 내에서 패배한 문구 `재귀는 지연 해석으로 유한 트리(11라운드 실측). `를 삭제하고, `| $ref, $defs·definitions | 참조를 따라 형상을 만든다. 객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 게이트 순환은 정착 오류로 한정한다 |`로 수정합니다.

### 묶음 {02,03} — codex (session 30f5d475-1131-4463-a506-ee8e3ce5e53e)

> # U7 round 1 — design/02-node-and-value.md, design/03-settle-and-events.md — findings 1
>
> F1 중간 4
> - 문서: design/02-node-and-value.md:352
> - 원장: VALUE-031 (ledger/value.md:502) "`setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만들고, 잠복 원본이 지워지는 길은 나감 정책, 로드(마운트·`FormHandle.reset()`·`resetSubtree()`), V가 그 경로를 담지 않은 전체 교체 쓰기다(WRITE-090, WRITE-094)."
> - 문서 글: "【추론】 잠복 원본이 지워지는 길은 둘이다: 나감 정책 `unsetOnInactive`(작성자나 호출자가 켬), 그리고 모든 로드(`reset`, `setValue(V)`, 마운트)."
> - 왜: 충돌에서 진 옛 문장을 그대로 남겨 `setValue(V)`를 로드에 넣고 삭제 경로를 둘로 한정합니다. 같은 문서 350행과 541행은 이긴 규칙의 세 경로를 이미 옮겼으므로 내부에서도 모순됩니다.
> - 제안: 352행의 이 문장만 삭제하고 350행의 현행 세 경로 설명을 유지합니다.

### 묶음 {02,03} — antigravity (session d63012c6-6afe-4466-9b94-8d5db7563fe6)

> # U7 round 1 — design/02-node-and-value.md, design/03-settle-and-events.md — findings 0

### 묶음 {05,06} — codex (session ea2fc282-f09f-4631-a70b-201e844a76b3)

> # U7 round 1 — design/05-validation-and-errors.md, design/06-react-and-surface.md — findings 4
>
> F1 높음 4
> - 문서: design/05-validation-and-errors.md:771
> - 원장: ERROR-045 (ledger/ERROR.md:982) "`adr/0014-error-policy.md:311`의 "정적이면 청사진 오류, 동적이면 정착 오류(R17-1 나)"는 18라운드 결정과 다르다: 정적으로 아는 `injectTo` 대상은 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 동적 대상 없음(`INJECT_TARGET_MISSING`)이다(CONTROLS-079). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:386`)."
> - 문서 글: "정적이면 청사진 오류, 동적이면 정착 오류(R17-1 나). 정적으로 아는 `injectTo` 대상은 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 동적 대상 없음(`INJECT_TARGET_MISSING`)이다."
> - 왜: 이긴 규칙을 덧붙였지만 진 쪽의 정적/동적 분류도 같은 표 칸에 남겼습니다. 식의 *런타임* 오류와 `injectTo` 대상 없음에 청사진 오류 경로가 있는 것처럼 읽힙니다.
> - 제안: 해당 표 칸의 "정적이면 청사진 오류, 동적이면 정착 오류"를 지우고, `injectTo` 대상 없음은 `INJECT_TARGET_MISSING` 정착 오류라는 이긴 규칙만 남깁니다.
>
> F2 중간 4
> - 문서: design/05-validation-and-errors.md:462
> - 원장: ERROR-130 (ledger/ERROR.md:1971) "`adr/0014-error-policy.md:201`의 "exceededBudget?: 'hostWheel' | 'derive' | 'transition'"는 18라운드 결정과 다르다: 재귀 펼침의 멈춤이 `exceededBudget` 값 (가칭) `'recursion'`을 더한다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:28`)."; ERROR-130 (ledger/ERROR.md:1972) "`adr/0014-error-policy.md:201`의 "cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict'"는 18라운드 결정과 다르다: `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해진다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:666`)."
> - 문서 글: "모양은 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?: 'hostWheel' | 'derive' | 'transition', iterations?, commit? }`이며 모든 칸은 `commit` 번호의 커밋을 기술한다(ERROR-130, ERROR-131)."
> - 왜: 바로 뒤에서 `'recursion'`과 `'writeShape'`를 더한다고 설명하지만, 공개 기록의 "모양"으로 제시한 타입 자체에는 두 값이 없습니다. 충돌에서 폐기한 형을 그대로 옮긴 셈입니다.
> - 제안: 타입 모양의 `cause`와 `exceededBudget` 합집합에 이긴 두 값을 직접 넣고, 뒤의 설명은 중복 없이 정리합니다.
>
> F3 중간 4
> - 문서: design/05-validation-and-errors.md:499
> - 원장: ERROR-142 (ledger/ERROR.md:2121) "`adr/0014-error-policy.md:207`의 "`exceededBudget` 다섯 값을 셋으로 줄인다"는 18라운드 결정과 다르다: 재귀 펼침의 멈춤이 (가칭) `'recursion'`을 더해 `exceededBudget`의 값은 넷이다(ERROR-190). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:28`)."
> - 문서 글: "되먹임 파동과 `onChange` 중첩의 초과는 소비자 코드의 쓰기를 거부한 것이지 작성자의 선언을 뺀 것이 아니므로 `diagnostics`에 남기지 않고 사슬의 끝에서 던지기만 한다(`exceededBudget` 다섯 값을 셋으로 줄인다)(ERROR-142, EVENT-008, ERROR-130). 재귀 펼침의 멈춤이 (가칭) `'recursion'`을 더해 `exceededBudget`의 값은 넷이다(ERROR-142, ERROR-190)."
> - 왜: 첫 문장의 "다섯 값을 셋"은 충돌에서 진 글이며, 바로 다음 문장의 "넷"과도 모순됩니다.
> - 제안: "다섯 값을 셋으로 줄인다"를 제거하고 현행 값이 넷이라는 문장만 남깁니다.
>
> F4 중간 5
> - 문서: design/05-validation-and-errors.md:330
> - 원장: ERROR-159 (ledger/ERROR.md:2329) "서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다. 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e)."
> - 문서 글: "켜진 `then`과의 런타임 교차가 공집합인 것은 경고도 오류도 아니다 — 검증기가 값을 기각한다(검증 결과)"
> - 왜: 표는 검증 결과라는 분류까지만 전하며, 켜진 조각과의 서로소 `enum` 사례와 빈 값이 유효해질 수 있으므로 폼 전체를 멈추지 않는다는 보충의 조건·실패 장면을 싣지 않았습니다.
> - 제안: 표 뒤에 해당 보충을 ERROR-159 인용과 함께 옮겨, 정적 연언의 공집합 청사진 오류와 이 런타임 사례를 구별합니다.

### 묶음 {05,06} — antigravity (session 2db0e3f0-9331-4c3a-b8f1-8f35bcbcd1c4)

> # U7 round 1 — design/05-validation-and-errors.md, design/06-react-and-surface.md — findings 0

### 판정 (검증자)

u7-r1-00-07-codex.md#F1 기각 — "제약은 2항뿐이다."는 GOAL-036 보충의 옛 글이고 충돌 줄에서 졌다: "`07-conclusions.md:51`의 "제약은 2항뿐이다."는 정본과 다르다: 축 2항은 컨벤션이며 폼은 검사하지 않는다(GOAL-035, FRAGMENT-023). 정본이 이긴다" (ledger/goal.md:584). 문서 237행은 그 규칙 문장을 실었다(원장 관리 판정 묶음 4와 같다). 제안은 진 글을 되살린다.
u7-r1-00-07-codex.md#F2 부분 — LANDING-124 보충의 `NodeEventType` 행은 결정을 되풀이하지 않고 값(공개 서브셋 6종, 3역할 재정의, "재정의")을 더한다. 그래서 규칙 5대로 결정 곁에 옮겨야 하는데 표에 없다: "| `NodeEventType` | 17종. 공개 서브셋 6종 | **3역할로 재정의** — 상태 통지 / `revision` 원장 / 명령 시그널. …" (ledger/landing.md:1919). 제안처럼 일부를 풀어 쓰지 않는다. 행 전체를 원문대로 표의 명령 어휘 행 앞(출처 순서)에 넣고, 근거 칸의 `adr/0008:24-28`은 규칙 4대로 EVENT-001로 바꾼다(기존 예외 행 79가 덮는다).
u7-r1-01-04-codex.md#F1 = u7-r1-01-04-agy.md#F1 기각 — 충돌 규칙이 "…로 한정한다"로 좁히므로 규칙 6 부분 적용(원문을 남기고 규칙을 곁에)이다: "객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 게이트 순환은 정착 오류로 한정한다(BLUEPRINT-030)" (ledger/schema.md:106). 18라운드 결정도 지연 해석을 현행으로 든다: "(SCHEMA-004의 지연 해석)" (ledger/blueprint.md:489). 01-01-fix M3에서 이미 판정했다.
u7-r1-01-04-codex.md#F2 기각 — 셋째 충돌 줄은 "…이면 노드 하나이고 충돌이 아니다(BLUEPRINT-044, BLUEPRINT-041)"로 예외를 더하는 좁힘이다 (ledger/blueprint.md:258). 원장 관리 판정 묶음 1도 "문서는 부분 적용(01-02-fix H2)대로 원문을 남기고 이 좁힘을 곁에 둔다"고 정했다(W/ledger-answers-b1.md:7).
u7-r1-01-04-codex.md#F3 기각 — 첫째 충돌 줄의 규칙("…교집합이 빌 때만 `ALL_OF_TYPE_REDEFINITION`이며, … 들지 않을 때만 `SHARED_NODE_KIND_CONFLICT`다")은 정적 선언과 호스트의 게이트 없는 분기로 범위를 좁힌다 (ledger/blueprint.md:256). 정적 선언이 없는 이름에서는 원문이 현행이다: "정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10)" (ledger/blueprint.md:855). 문장을 지우면 이 경우가 빠진다.
u7-r1-01-04-codex.md#F4 기각 — 둘째 충돌 줄은 "정적 노드가 있는 칸에서는 … 빌 때만 정착 오류다"로 범위를 좁힌다 (ledger/blueprint.md:257). 정적 노드가 없는 이름에서는 원문이 현행이다: "fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로)" (ledger/blueprint.md:247).
u7-r1-01-04-codex.md#F5 기각 — 충돌 규칙은 `type`의 예외를 더하므로 부분 적용이다. 문서는 바로 다음 문장에 그 규칙을 옮겼다: "`type`은 켜진 게이트 선언과 정적 허용 집합의 교집합이 비면 그 게이트들이 켜진 동안의 정착 오류(`SHARED_NODE_CONFLICT`)다(BLUEPRINT-041, BLUEPRINT-044)" (ledger/blueprint.md:309). 제안한 "`type` 외의 교차로 한정"은 원장에 없는 글이다(01-02-fix H1이 이미 판정).
u7-r1-02-03-codex.md#F1 기각 — 인용이 틀렸다. design/02에는 "길은 둘이다"가 없다(`grep -c '길은 둘'` = 0). 350행이 첫째 충돌의 목록을 이미 통째로 옮겼다: "잠복 원본이 지워지는 길은 나감 정책, 로드(마운트·`FormHandle.reset()`·`resetSubtree()`), V가 그 경로를 담지 않은 전체 교체 쓰기다(WRITE-090, WRITE-094)" (ledger/value.md:502). 352행은 제출 후 파기 문단이다.
u7-r1-05-06-codex.md#F1 기각 — 충돌 규칙은 `injectTo`에 정적인 경우가 없다고 좁힐 뿐이다. 식 오류 갈래를 뒤집지 않으므로 부분 적용이다: "정적으로 아는 `injectTo` 대상은 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 동적 대상 없음(`INJECT_TARGET_MISSING`)이다(CONTROLS-079)" (ledger/error.md:982). 문서는 같은 칸에 그 규칙을 곁에 적었다. 항목은 현행(기록)이다.
u7-r1-05-06-codex.md#F2 기각 — 두 충돌 줄 모두 값을 "더한다"·"더해진다"이고 목록을 통째로 주지 않으므로 부분 적용이다: "재귀 펼침의 멈춤이 `exceededBudget` 값 (가칭) `'recursion'`을 더한다" (ledger/error.md:1971), "`cause`에 다섯째 값 (가칭) `'writeShape'`가 더해진다" (ledger/error.md:1972). 문서 462행은 두 규칙을 모양 바로 곁에 적었다.
u7-r1-05-06-codex.md#F3 기각 — 규칙 "재귀 펼침의 멈춤이 (가칭) `'recursion'`을 더해 `exceededBudget`의 값은 넷이다(ERROR-190)"가 값을 더하므로 부분 적용이다 (ledger/error.md:2121). 05-02-fix F2가 같은 자리를 이미 기각했다.
u7-r1-05-06-codex.md#F4 확인 — ERROR-159 보충 "서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 … 폼 전체를 멈춰서는 안 된다(R11-e)." (ledger/error.md:2329)는 결정 행(런타임 교차의 공집합은 경고도 오류도 아니다)에 "지금 고를 수 있는 값이 없는" 상태와 폼을 멈추지 않는 조건을 더하는데, design/05에 없다. 같은 글이 BLUEPRINT-016의 결정(ledger/blueprint.md:299, design/01)이지만, 규칙 5는 "문서를 넘어서는 되풀이는 … 그대로 둔다"이므로 design/05에도 옮긴다(선례: design/01 259행의 "(BLUEPRINT-044, WRITE-099)"). 원문대로 두 ID를 달아, 보충 순서대로 `presentation` 문장 뒤에 넣는다.
**원장 물음**
없음
요약: 지적 13 (중복 합침 뒤 12), 확인 1, 부분 1, 기각 10, 원장 물음 0

### 고침

확인 1과 부분 1을 원장 원문 그대로 옮겨 적었다. 예외 파일은 바뀌지 않았고, 고친 뒤 `doc-coverage`는 설계문서만, 설계문서와 ADR 모두 문제 0이다. 고친 절을 모은 ADR은 `build-adr.mjs`로 다시 만들었고(`0014-error-policy.md`만 바뀜), `verify-adr`는 FAILS 0이다.

```diff
diff --git a/packages/canard/schema-form/architecture/design/05-validation-and-errors.md b/packages/canard/schema-form/architecture/design/05-validation-and-errors.md
index 2c9671bcd..c78b0a7fa 100644
--- a/packages/canard/schema-form/architecture/design/05-validation-and-errors.md
+++ b/packages/canard/schema-form/architecture/design/05-validation-and-errors.md
@@ -349,6 +349,8 @@ R17-1 나에 따라 예산 초과, 식·가드 실패, 동적 `controls.injectTo
 
 `presentation`의 모르는 키는 플러그인 자유 칸이다(ERROR-159).
 
+서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다(ERROR-159, BLUEPRINT-016). 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e)(ERROR-159, BLUEPRINT-016).
+
 정착 추적은 개발 모드에서 정착마다 기록한다: 진입(공개 API, 옵션 비트), 라운드별 {단계, 규칙 종류, 원천 경로, 대상 경로, 이전 값, 이후 값, 결과(적용 / 누구에게 짐 / `undefined`라 후보 아님 / 억제 / 최종 형상 밖이라 철회)}, 예산 초과 시 마지막 라운드의 규칙 목록(ERROR-159). 프로덕션은 기록하지 않는다(ERROR-159). `onError`에 가지 않는다(ERROR-159).
 
 범위 밖: 렌더 중 쓰기는 core가 감지하지 않는다(원리 P5(core는 렌더러를 모른다), ERROR-160).
diff --git a/packages/canard/schema-form/architecture/design/07-landing-and-tests.md b/packages/canard/schema-form/architecture/design/07-landing-and-tests.md
index 26a6f18f4..8971e0036 100644
--- a/packages/canard/schema-form/architecture/design/07-landing-and-tests.md
+++ b/packages/canard/schema-form/architecture/design/07-landing-and-tests.md
@@ -245,6 +245,7 @@
 
 | 항목 | 현재 | 새 설계 | 변화 | 근거 |
 | --- | --- | --- | --- | --- |
+| `NodeEventType` | 17종. 공개 서브셋 6종 | **3역할로 재정의** — 상태 통지 / `revision` 원장 / 명령 시그널. 17종 개별의 생사는 언급이 없다 | 재정의 + **미확인** | `core/types/event.ts:45-96` / EVENT-001 |
 | 명령 어휘 | `RequestFocus`·`RequestSelect`·`RequestRefresh`·`RequestRemount`·`RequestEmitChange`·`RequestInjection` | 앞의 넷은 유지. 뒤의 둘은 **미확인** | 유지 + 미확인 | `core/types/event.ts:45-96` / EVENT-001 |
 | 공개 훅 5종 | `useSchemaNodeTracker`·`useSchemaNodeSubscribe`·`useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit` | 언급 없음. `useSchemaNodeTracker`의 `useSyncExternalStore` 방식은 유지한다고만 적혀 있다 | **미확인** | `src/index.ts:78-84` / EVENT-001 |
 
```

판정: 거른 지적 2(확인 1, 부분 1), 기각 10, 원장 물음 0 — 고침 뒤 2차로 간다

## 2차 (2026-09-29)

범위는 1차가 고친 두 곳(위 diff의 삽입 줄)과 같은 절의 둘레 문장이다. 나머지 줄은 1차에서 대조했고 바뀌지 않았다. 같은 지시서를 codex에 주었다(session 669d6daf-6dbc-4d5c-98f8-6395cf5261f4).

> # U7 round 2 — design/05-validation-and-errors.md, design/07-landing-and-tests.md — findings 0

판정: 거른 새 지적 0
