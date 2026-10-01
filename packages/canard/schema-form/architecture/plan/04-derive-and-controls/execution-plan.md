# 04 파생 + 상태 키·제어 — 실행 계획

Planning method: 저장소 지침 — `PLAN.md` §2(한 PR의 순서)와 `plan/prompts.md`의 단계 실행 절차, 소유자의 04 착수 승인(2026-09-30). 단위마다 채우는 단계·명령·기대 결과는 seiri `write-plan`의 불변식에서 가져온다. 구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-04-derive-and-controls/gates.md`, 진행과 어긋남은 [log.md](log.md)에 적는다.

정본의 순서: 원장 `ledger/<area>.md`(`상태: 현행` 항목의 결정·보충·충돌 줄) > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 이 계획. 이 계획이 원장과 다르게 읽히면 원장대로 간다. 계획서와 원장의 어긋남은 §2.2에 모았고, U0에서 `log.md` §4로 옮긴다. 최초 기준선(원문 경로와 해시)은 `log.md` §1에 있다. 원장 관리 세션 `albatrion-79`가 질의 Q1–Q7에 답했고 28라운드(`reviews/round-28-closing.md`, 28C-01~08)로 적는다. 이 계획은 그 답을 반영했다(§2.3).

경로 약어: `PKG` = `packages/canard/schema-form`, `ARCH` = `PKG/architecture`, `SCN` = `packages/aileron/schema-form-scenarios`. 단계 번호와 원장 PR 번호의 대응은 04 = PR-3 + PR-6, 05 = PR-4, 06 = PR-5, 07 = PR-7이다(LANDING-204). 이 계획의 "→ 0n"은 단계 번호다.

## 1. 목표와 완료 기준

목표: 정착 루프의 계산 단계를 완결한다. (0) 맥락: `@`를 트리 런타임의 맥락 칸으로 읽고(03의 `@` → `extras` 읽기를 고침), 바인딩 전용 내부 통로 `setContext`(가칭)의 맥락 변경 정착과 겉면 게터 `context`를 세운다(28C-03·08, CONTROLS-080 (8), SURFACE-055). (1) 파생: `src/core/settle/derive/`가 `controls.derived`·`controls.injectTo`·`controls.unsetValue`·`controls.resetInteraction`의 에지를 판정하고, 같은 대상 규칙으로 대상마다 하나를 고르며, 진 쓰기의 에지를 소비한다. 파생 라운드 예산, `DisableAutomaticWrites`의 억제, 개발 모드 정착 기록을 함께 세운다(LANDING-063·083, SETTLE-004). (2) 상태 키·제어: 계산의 끝에서 `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`를 로컬 결합(잠금 OR·표시 AND)으로 한 번 정하고, `controls.children` 항목과 조각 `controls`의 값 키 층, `unsetOnInactive`의 네 층·식 값(직전 커밋)을 더하며, 겉면 계산 게터 다섯(`visible`·`enabled`·`readOnly`·`disabled`·`watchValues`)을 들인다(LANDING-066·086, SETTLE-003, CONTROLS-082, 28C-02·07). 새 엔진은 07까지 `<Form>`에 닿지 않으므로 옛 시험 전체가 회귀 신호다(LANDING-159).

| 완료 기준(`request.md`) | 단위 | 관찰할 증거 |
| --- | --- | --- |
| `src/core/settle/derive/`와 문서, 계산 단계 완결 | U2, U3, U4, U4b | 문서 선행 커밋 검사(G3), 파생 단계 시험과 03 정착 시험 초록(G5·G7), `@` 맥락 읽기와 맥락 변경 정착과 번들 무유출(G26·G27·G28·G30), 의존 방향 시험(G10) |
| 같은 대상 규칙·에지 소비·억제 비트·결합 표·`controls.children`·나감 정책 시험 | U3, U4, U5, U6 | 게이트 추적표 §5의 모든 행의 시험 이름 태그(G6·G7·G9·G11)와 초록 |
| 겉면 멤버 여섯: 계산 게터 다섯(`watchValues` 포함, 28C-07)과 `context`(28C-08) | U4b, U5 | `SchemaNode/DETAIL.md` 멤버 표·멤버 목록 시험·공개 형(G10), 떼어진 노드의 동결 읽기(G29) |
| 벤치 회귀 행(TEST-071) 통과(또는 소유자 수용) | U9 | `verification/04-derive-and-controls/performance.md`의 두 행과 판정(G17·G18) |
| 레거시 이동, `verification.md`의 게이트 전부 통과 | U1, U7, U8, U10 | 레거시 기호가 `src/__legacy__/` 밖에 없음(G2), 시나리오·회귀 수(G13–G16), 최종 게이트(G19–G25) |

비목표(원장 ID와 함께):

- `if` 게이트의 `compileGuard`와 같은 시나리오의 실제 가드 재실행은 05다(TEST-069 (나), LANDING-064). 04는 03의 술어 대역(`PKG/src/core/__tests__/ifPredicate.ts`)을 그대로 쓴다.
- 통지와 배달, `batch`, `UpdateValue`의 출처 칸, `resetInteraction`이 바꾼 노드의 배달은 05다(LANDING-064, EVENT-060·066). 04는 커밋의 `revision`과 쓰기 종류 기록까지만 단언한다(26C-03의 준용).
- `injectTo` 함수 안의 공개 쓰기를 리스너 되먹임으로 다루는 것과 그 되먹임 예산은 05다(CONTROLS-079, EVENT-008·027). 04는 이 경로를 단언하지 않는다(I13).
- 배열 행·아이템 호스트와 배열 원천·대상의 `injectTo`, 원본 B의 배열 구조 기록은 06이다(LANDING-065, TEST-069 (다)).
- 렌더 계층의 실효 잠금(Form 속성 `readOnly`·`disabled`의 OR, `handleChange`의 입력 버림), 포커스 아웃 `trim`, `degraded` 동안의 제출 거부는 07이다(CONTROLS-083 (2), GOAL-044, WRITE-078·100, LANDING-067). `FormProvider` 맥락과 Form 속성 `context`를 병합해 `setContext`를 부르는 바인딩도 07이다. 04는 통로와 그 정착, `node.context` 게터까지다. `FormTypeInputProps.context`도 07이다(28C-03·08, SURFACE-055).
- `watchValues`를 `FormTypeInputProps.watchValues`로 넘기는 것은 07, 계산 상태 비트의 배달(EVENT-064)은 05다. `omitEmpty` 아래 빈 문자열의 `undefined`(LANDING-137)는 게터가 방출 트리를 읽는 결과라 04에서 단언한다(28C-07, `reviews/round-28-closing.md:77`).
- 옛 `InjectionGuardManager`의 틱 기반 재진입 가드를 다시 만들지 않는다(GOAL-065, LANDING-030).
- 성능 최적화. 구현 단계에서는 수치를 기록만 하고 최적화는 구현 완료 뒤 별도 작업이다(`reviews/round-27-owner-answers.md:11`). TEST-071의 지름길이 없으면 그것은 기제 결함이라 고치는 것이 구현이고, 지름길이 있는데 선을 넘으면 기록과 소유자 수용을 따른다(28C-06, I17).

## 2. 해석과 자율 결정

원장으로 답이 정해지는 것은 여기서 닫는다. 원장 질의 Q1–Q7은 28라운드 답(`reviews/round-28-closing.md`의 28C-01~07)으로 모두 닫혔다. 답이 새로 부른 질의 Q8과 I27의 확인은 28C-08로 닫혔다. 막힌 단위는 없다. 답을 반영한 행의 근거 칸은 28C-0n을 인용한다. 28C-0n은 원장 항목을 새로 만들지 않고 현행 항목의 해석을 정하므로 인용 ID는 바뀌지 않는다.

### 2.1 해석 표

| # | 물음 | 채택한 해석 | 근거 | 상태 |
| --- | --- | --- | --- | --- |
| I1 | 파생 단계는 정착의 어디에 들고, 라운드·예산·`degraded`는 어떻게 도는가 | 계산(호스트 바퀴와 그 예산 검사) 뒤, 전이 앞에 든다. 한 라운드는 완성된 트리에서 후보를 모아 대상마다 하나를 적용한다. 쓰기가 하나라도 나오면 표시(재계산 목록 등록) → 계산 → 파생을 다시 돈다. 쓰기가 없으면 전이로 간다. 전이가 쓰기를 내면 표시 → 계산 → 파생 → 전이 순으로 다시 돈다. 그래서 `transitionSettlement`의 재계산 뒤에도 파생을 부른다. 파생 라운드는 쓰기를 적용한 라운드만 세며, 한 정착 전체에서 전이 뒤에도 이어 센다(곱하지 않는다). 상한 25를 넘길 라운드가 오면 원본 B(채움·`derived`·`injectTo`·`unsetValue`·나감 비움을 모두 되돌림, `unsetValue`가 지운 값 포함)를 커밋한다. `diagnostics`는 `degraded`·`cause: 'budget'`·`exceededBudget: 'derive'`·`iterations: 25`이며, 커밋 뒤 `settle` 호출 끝에서 모든 환경에 던진다 | SETTLE-004·005·010·011·017, EVENT-020("적용 라운드"), ERROR-070·132, TEST-069 (다), `design/03-settle-and-events.md` §1.2 | 닫힘 |
| I2 | 에지의 기준과 값 동등 | 규칙마다 기준점과 지금 값을 18C-50 (가)의 `sameValue`로 견준다. SameValueZero(`NaN`=`NaN`, `-0`=`0`)를 쓰고, 배열은 길이와 차례, 평범한 객체는 키 목록(순서 포함)과 값을 보며, 그 밖의 객체는 참조로 본다. 참조가 같으면 내려가지 않는다. 비교 대상은 `injectTo`의 원천 방출 값, `derived`의 의존 값 튜플(식 경로 ∪ 그 노드 모든 선언의 `controls.watch`, 같은 노드의 다른 식 경로는 빠짐), `unsetValue`·`resetInteraction`의 식 값이다. 기준점은 정착이 시작될 때 직전 커밋의 값이고, 정착 안에서는 그 규칙이 마지막으로 소비한 값이다(재발화 금지). 로드는 기준을 비워 발화하고, `resetSubtree()`는 원천이 그 하위 트리 안인 규칙만 비운다. 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋이 기준이라 `setValue(getValue())`는 발화하지 않는다. 형상 밖 노드의 규칙은 평가하지 않고, 다시 생기면 거짓→참으로 본다. 조각이 켜질 때 그 조각이 새로 들인 노드는 거짓→참이고, 형상에 남아 있던 공유 노드는 기준점만 잡고 발화하지 않는다 | 18C-50, 18C-102, SETTLE-043·046·048·049, SETTLE-028, WRITE-028·029, FRAGMENT-050 (2), CONTROLS-080 (8) | 닫힘 |
| I3 | 같은 대상 규칙의 순서 | 종류 순위는 `unsetValue` > `derived` > `injectTo` > 채움이다(채움은 전이 단계지만 순위는 단계를 가로질러, 생긴 노드의 `unsetValue`가 참이면 채우지 않는다). 같은 순위끼리는 원천(선언) 노드의 문서 순서(트리의 위→아래 전위 순서, 통지 순서와 같음)에서 나중이 이긴다. 같은 노드에 걸린 선언끼리는 층(조각의 `controls` < `controls.children` 항목 < 노드 자신)에서 세부가 이기고, 같은 층이면 조각 전순서(FRAGMENT-049)에서 나중이 이기며, 한 `children` 배열 안에서는 뒤 항목이 이긴다. 한 `injectTo` 반환 안에서 같은 대상이 둘이면 뒤의 것이 이긴다(객체는 키 삽입 순서, 배열은 차례). 순위는 정착 단위다: 앞 라운드에 더 높은 순위의 쓰기가 적용된 대상에는 뒤 라운드의 낮은 순위 후보를 버린다. 진 쓰기는 버리고 그 에지를 소비한다. 같은 대상에 규칙이 둘 와도 경고하지 않는다. 순위와 층은 조건 사다리가 아니라 표(`derive/utils/rank/`)로 둔다 | SETTLE-004(보충 셋), FRAGMENT-049, CONTROLS-073 (7), CONTROLS-079, SETTLE-005, `request.md` 절차의 seiri 줄 | 닫힘 |
| I4 | 식과 `injectTo`를 어떻게 부르고, 청사진을 넓혀야 하는가 | 문자열 식(`derived`·`unsetValue`·`resetInteraction`·상태 키·`unsetOnInactive`)은 청사진이 컴파일한 `BlueprintExpression.evaluate(dependencies)`, 곧 `createDynamicFunction`의 의존 주입 형태로 부른다. 의존 값은 선언 호스트를 기준점으로 푼 경로의 방출 값이다. `controls.injectTo`는 컴파일하지 않은 함수 그대로 `(value, ctx)`로 부른다. `value`는 원천의 방출 값이고, `ctx`는 오늘의 여덟 칸(`dataPath`·`schemaPath`·`jsonSchema`·`parentValue`·`parentJSONSchema`·`rootValue`·`rootJSONSchema`·`context`)을 이번 파생 라운드 트리의 방출 값으로 채운다. 청사진은 고치지 않는다: `derived` 의존 집합은 `BlueprintExpression.dependencies`와 선언의 `controls.watch`에서 나오고, 역의존 표(`Blueprint.dependencies`)가 이미 둘을 담는다. `injectTo`는 정적 대상·의존이 없다. 규칙 표는 derive가 청사진마다 한 번 만들어 약한 맵에 둔다(ADR D2) | LANDING-083, CONTROLS-079·080, SETTLE-043 (라), CONTROLS-032, `blueprint/utils/analyze/compileBlueprintExpressions.ts:50-91`, `blueprint/utils/diagnostics/validateControlGroups.ts:51` | 닫힘(청사진 무변경은 자율 결정) |
| I5 | `unsetOnInactive`의 식 값과 새 층 | 어느 선언이 걸리는가도, 식의 값도 그 노드가 형상에 있던 마지막 커밋의 것이다. 나가는 순간 형상 밖 노드를 새로 평가하지 않는다. 그래서 식 값은 형상에 있는 동안 계산해 커밋에서 런타임 칸에 적고 나감에서 읽는다(ADR D3). 층은 노드 자신 > 부모의 `controls.children` 항목 > 그 노드를 직접 선언한 조각의 `controls` > Form 속성이다. 같은 층은 하나라도 유지면 유지한다. 조각 층은 그 조각이 꺼지는 순간에도 적용된다. 나가는 객체·분기의 정책은 함께 나가는 하위 트리와 잠복 자손으로 내려가고, 자손의 명시한 선언이 가까운 순서로 이긴다. 선언의 나감(노드는 남고 선언한 조각만 꺼짐)도 사슬의 한 마디이며 그때 `extras`는 건드리지 않는다. 03은 노드 자신·Form 속성 층과 하위 트리 규칙을 세웠다. 04는 `children` 항목 층·조각 층·식 값을 더한다 | WRITE-031–039, CONTROLS-024·040·044, LANDING-092, LANDING-066 충돌 줄, TEST-069 (다), TEST-019 보충 | 닫힘 |
| I6 | 상태 키의 결합 | 한 노드에 겹치는 자리는 넷이다: 표준 `readOnly`, 자기 `controls.readOnly`·`controls.disabled`·`controls.visible`(켜진 노드 범위 선언 전부), 켜진 조각의 범위 제어(그 조각이 직접 선언한 직계 자식에게), 부모의 `controls.children` 항목(항목을 가진 선언이 켜져 있고 대상이 형상에 있을 때). 잠금(`readOnly`·`disabled`)은 하나라도 참이면 참(OR), 표시(`visible`)는 모두 참이어야 참(AND)이다. 결과는 선언의 순서와 자리에 무관하다. 표준 `readOnly`는 청사진의 유효 스키마 병합이 이미 OR로 합친 값(`blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:62-63`)을 읽는다. 계산의 끝, 최종 트리에서 한 번 정한다. 상태 키 식이 던지면 그 선언은 없는 것이고 커밋은 `degraded`(`cause: 'expression'`)다. core는 잠금으로 쓰기를 막지 않는다(`setValue`와 자동 쓰기 모두 잠긴 노드에 적용) | CONTROLS-042·045·046·073 (6)·082·083, SCHEMA-010, SETTLE-003, ERROR-122·132 | 닫힘 |
| I7 | `DisableAutomaticWrites`의 파생 쪽 범위 | 억제는 그 호출(로드·전체 교체 쓰기·`Merge`)이 일으킨 예약 층의 쓰기 전부를 끈다: 채움, `derived`, `injectTo`, `unsetValue`, 나감 비움. 포커스 아웃 `trim`은 호출 비트의 범위가 아니다(Form 속성만 억제, 21C-01, WRITE-100, 07). 로드된 값 자체와 투영은 막지 않는다. 호출 비트가 Form 속성 `disableAutomaticWrites`보다 우선하고 두 비트를 함께 주면 억제가 이긴다. 억제된 호출이 커밋한 값이 다음 호출의 기준점이 되므로 그 호출의 에지는 미뤄지지 않고 사라진다(뒤이은 입력의 새 에지만 발화). 개발 모드 기록에는 결과 "억제"로 남긴다. `controls.resetInteraction`은 자동 쓰기가 아니라서(EVENT-012) 억제된 로드에서도 평가한다: 커밋이 로드된 값으로 판정해 참이면 `dirty`·`touched`를 비운다 | WRITE-015·097, CONTROLS-029, SURFACE-039, TEST-016 보충, SETTLE-028·048, EVENT-012, 28C-04, `spikes/round9/r9.mjs:159-160`, `spikes/round9/regress/selfcheck-v5.mjs:651-657` | 닫힘(28C-04) |
| I8 | 개발 모드 정착 기록 | 모양은 원장이 정했다: 진입(공개 API, 옵션 비트), 라운드별 {단계, 규칙 종류, 원천 경로, 대상 경로, 이전 값, 이후 값, 결과(적용 / 누구에게 짐 / `undefined`라 후보 아님 / 억제 / 최종 형상 밖이라 철회)}, 예산 초과 때 마지막 라운드의 규칙 목록이다. 프로덕션은 기록하지 않고 `onError`에 가지 않는다. 기록은 콘솔 출력이 아니라 "(기록)" 층이다. 자리는 `record/`가 선언하는 `SchemaNodeRuntime` 칸 하나이고, 마지막 정착 하나만 담아 정착마다 바꾼다(누적하지 않음). 프로덕션에서는 칸을 만들지도 않는다. 개발 모드 판정은 ERROR-030과 같은 `process.env.NODE_ENV !== 'production'`(`settle/utils/commit/commitSettlement.ts:64`와 같은 식)이며 소비자 유무(`hasConsumer`)를 보지 않는다. 공개 멤버·`onError`·`FormHandle` 경로·개발 도구·`core/index` 노출은 두지 않는다. 시험이 그 칸을 읽는 것은 TEST-069 (나) 위반이 아니다. `record/DETAIL.md`에 칸의 비용 줄을 둔다(NODE-045) | ERROR-159 보충(`08-design-a-to-z.md:382`), ERROR-030, LANDING-063, TEST-016, TEST-069 (나), GOAL-086, NODE-004·045, 26C-06, 28C-01 | 닫힘(28C-01) |
| I9 | 겉면 계산 게터의 뜻 | `visible`·`readOnly`·`disabled`는 I6의 로컬 결합(CONTROLS-082) 결과를 읽는 게터다. 값은 레코드 필드에 두고 계산의 끝에서 쓴다(ADR D4). Form 속성의 전체 잠금은 렌더 계층의 것이라 게터에 들지 않는다. `enabled`는 `active && visible`이다(옛 `AbstractNode.enabled`, `src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:459-465`와 같음). 살아 있는 노드에서는 `visible`과 같고 `disabled`와는 무관하다. 떼어진 노드에서 `visible`·`readOnly`·`disabled`는 NODE-044의 동결 읽기로, 떼어질 때 한 번 잡는다(26C-10의 `typeMismatch`와 같은 방식, `settle/utils/detached/captureDetachedSchemaNodeReads.ts`). 26C-08의 예외는 `active`만 덮으므로 떼어진 노드의 `enabled`는 거짓이다 | LANDING-066, CONTROLS-022·023·082, 26C-01·08·10, NODE-010·044, 28C-02 | 닫힘(28C-02) |
| I10 | 루트 스키마 전역 상속의 제거가 닿는 것 | 새 엔진은 루트 스키마의 `readOnly`·`disabled`·`visible`·`active`·`pristine`을 루트 노드의 로컬 키로만 읽고 자손에 내리지 않는다. 옛 상속(`checkComputedOptionFactory`·`mergeShowConditions`)은 옛 엔진에 그대로 남아 07까지 `<Form>`을 섬긴다. 04는 새 엔진에서 "루트 `readOnly: true`가 자식을 잠그지 않는다"를 단언한다. 전체 잠금은 렌더 계층의 Form 속성이며 07이다 | GOAL-044·048, CONTROLS-045, LANDING-086·159(규칙 3) | 닫힘 |
| I11 | 레거시 이동이 04에서 뜻하는 것 | `InjectionGuardManager`·`getDerivedValueFactory`·`checkComputedOptionFactory`·`mergeShowConditions`와 그 시험은 03 U1이 `src/core/nodes`를 통째로 옮길 때 이미 `src/__legacy__/core/nodes/…`로 갔다(2026-09-30 확인: 네 이름을 쓰는 파일은 모두 `src/__legacy__/` 아래, `stories/`·`bench/`에는 없음). 04가 옮길 파일은 0이다. U1은 이동을 반복하지 않고 그 사실을 게이트로 확인해 PR 본문의 "레거시 이동 목록"에 "03에서 완료, 04 이동 0"으로 적는다 | LANDING-159·205, 03 `execution-plan.md` U1 | 기록(log §4) |
| I12 | `@` 맥락의 값 | CONTROLS-080 (8)은 `@`를 폼의 맥락 객체(`FormProvider`의 맥락과 Form 속성 `context`의 얕은 병합, 없으면 `{}`)로 정하고, SURFACE-055는 갱신을 바인딩 전용 통로 `setContext`(가칭)로 둔다. (1) `@`와 `ctx.context`는 `SchemaNodeRuntime`의 맥락 칸을 읽는다. 칸은 바인딩이 트리 생성 때 준 객체 하나이고, 없으면 `{}`다. 로드는 로드 시점의 맥락으로 평가한다. (2) 03 코드가 `@`를 호스트의 `extras`로 읽는 것(`settle/utils/paths/resolveDependencyPath.ts:5-11`, `settle/utils/gates/evaluateGate.ts:80`, `settle/utils/gates/getGateRegistry.ts:155`의 호스트 경로 치환, `settle/utils/write/getDependencyIndex.ts:32,42`의 역의존 표 제외, 시험 `settle/__tests__/settle.gates.test.ts:72-84`)은 원장 근거가 없는 결함이다(CONTROLS-080 (3)·(6)). 04가 고치고 03 이탈(M8)로 `log.md` §4에 적는다. `@`=`extras`를 단언하는 PR-2 시험(`:72-84`)은 틀린 것이라 고친다. (3) 맥락 변경 진입은 04의 기제다: 바인딩 전용 내부 통로 `setContext`(가칭)와 그 정착. 정착은 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산하고, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에 에지를 낸다. `injectTo`는 맥락 변경에 발화하지 않는다. 07은 맥락을 병합해 통로를 부르는 바인딩만 붙인다(U4b, ADR D9) | CONTROLS-080 (3)·(6)·(8), SURFACE-055, NODE-004·010, LANDING-063, 28C-03 | 닫힘(28C-03) |
| I13 | `injectTo` 함수 안의 공개 쓰기 | CONTROLS-079는 이를 리스너 되먹임과 같은 안쪽 진입으로 다루고 되먹임 예산에 넣는다. 그 기제(진입 사슬·되먹임 예산)는 05다. 04는 이 경로의 동작을 단언하지 않고 사례를 05로 넘긴다(log §4와 PR 본문에 PR 번호) | CONTROLS-079, EVENT-008·027, LANDING-064, 26C-03(준용), TEST-069 (라) | 자율 결정 |
| I14 | 프로토타입 스위치 변형의 이식 | 회귀 원천의 스위치(`CONTROL_COMBINE: 'nearest'`, `WRITE_CONFLICT`, `DERIVE_ORDER`, `COMMIT_ON_BUDGET: 'lastRound'`, `ROUND_CAP` 5·6, `LOAD_EDGE` skip·fill·ref, `DERIVED_MODE: 'level'`, `EDGE_COMPARE: 'write'`, `FINAL_SHAPE: false`, `EDGE_REF: 'entry'`)는 역사적 실험이다. 현행 원장의 구성 하나만 이식하고, 제품에서 같은 사례가 되는 변형은 하나로 접는다. 현행 원장과 다른 변형(`nearest` 결합은 CONTROLS-082, `lastRound` 커밋은 SETTLE-011, 상한 5·6은 EVENT-020)은 이식하지 않는다. 기대값은 `spikes/round18/proto/REPORT-v7.md`의 기대 치환을 따른다. 수는 §6.1이다 | TEST-069 (라), TEST-060, `REPORT-v7.md`("역사적 정책 실험 호환"), CONTROLS-082, SETTLE-011, EVENT-020 | 자율 결정(log §4) |
| I15 | `round9/regress/edge-cases.mjs`의 잠금 결합 사례의 기대 | `:66`의 "Form readOnly participates"와 `:67`의 "root disabled participates"는 Form 속성 잠금과 루트 `disabled`가 core 결합에 든다는 옛 기대다. 현행 원장에서 Form 속성 잠금은 렌더 계층이고 루트 키는 루트 노드에만 걸린다. `and-or` 행은 현행 기대로 이식한다: `x.readOnly`는 자기 `readOnly` 선언으로 참, `x.disabled`는 거짓. 시험 이름에 CONTROLS-045·GOAL-048을 싣는다. `nearest` 두 행은 이식하지 않는다 | GOAL-044·048, CONTROLS-045·082 | 자율 결정(log §4) |
| I16 | `batch`를 쓰는 프로토타입 사례 | `batch`는 05의 기제다. `round9/regress/r8-port.mjs` P1의 iii 가운데 `batch` 두 변형과 `round9/regress/r7-port.mjs` E3·X3c의 `batch` 변형은 05로 넘긴다. `round18/proto/__tests__/settleRules.test.mjs:59`의 나감 에지는 `batch` 없이도 같은 한 정착을 만들 수 있으므로, 원천의 게이트를 끄고 원천 값을 바꾸는 루트 `setValue(V)` 한 번으로 이식한다 | LANDING-064, TEST-069 (라), FRAGMENT-050 (1) | 자율 결정(log §4) |
| I17 | TEST-071 벤치의 판정 | 원장은 "한 원소 쓰기의 비교 비용이 값 크기와 무관, 통째 교체는 선형"과 실패 때 "지름길 구현을 고친다"만 적는다. "값 크기"는 바뀌지 않은 원소들의 깊은 크기이고, 원소 수 N에 비례하는 참조 비교(O(N))는 지름길이 치러야 하는 비용이다(28C-06 (나)). 판정선: 원소 1만 개(터미널 객체와 터미널 배열 각각)에서 원소 하나의 크기를 작게·크게 바꿔 재어 한 원소 쓰기의 비교 시간 비가 1.5 이하면 통과, 통째 교체는 두 크기의 시간 비가 크기 비의 0.5–2배면 선형이다. 기록은 TEST-027 절차대로 `ARCH/verification/04-derive-and-controls/performance.md`에 두고 계획서 `verification.md`는 고치지 않는다. 지름길이 없으면 18C-50·SETTLE-043 기제의 결함이라 고치는 것이 구현이다. 지름길이 있는데 선을 넘으면 27라운드대로 최적화하지 않고 까닭을 적어 `performance.md`에서 소유자 수용을 받는다 | TEST-071, TEST-027, 18C-50 (다), SETTLE-043, `round-27-owner-answers.md:7-11`, 28C-06 | 닫힘(28C-06) |
| I18 | `watchValues` 게터 | `watchValues`는 PR-6 core 게터다. 04는 게터 다섯(`visible`·`enabled`·`readOnly`·`disabled`·`watchValues`)을 들인다. 기제: 유효 스키마의 `controls.watch`(병합에서 나중이 이김)를 받아 그 경로들을 방출 트리에서 읽는다(CONTROLS-080 (5)). `FormTypeInputProps.watchValues`는 07, EVENT-064의 배달은 05다. LANDING-137(`omitEmpty` 아래 빈 문자열이 `undefined`)은 게터가 방출 트리를 읽는 결과라 04의 게터에 든다 | 26C-01, CONTROLS-032·080 (5), LANDING-066·137, EVENT-064, `reviews/raw-round17-node-structure.md:136`, 28C-07 | 닫힘(28C-07) |
| I19 | `unsetOnInactive` 식이 던질 때 | 던진 식의 선언은 "유지"로 센다(28C-05 (나), WRITE-031의 만장일치, ERROR-122의 자리별 값 표, ERROR-125의 "작성자의 잘못으로 커밋된 값을 잃지 않는다"). 층 규칙은 그대로다. 던짐은 사슬 끝의 `EXPRESSION_THREW`이고 그 식을 평가한 정착의 커밋은 `degraded`(`cause: 'expression'`)다(ERROR-126·159) | ERROR-122·125·126·132·159, WRITE-031, CONTROLS-024, 28C-05(`reviews/round-28-closing.md:55-58`) | 닫힘(28C-05) |
| I20 | 시나리오 어휘의 확장 | `ScenarioExpectation`에 상태 키 관찰 `states?: Record<경로, { visible?, readOnly?, disabled?, enabled? }>`를 더하고, 단계에 `resetSubtree`가 필요하면 `{ action: 'resetSubtree', path }`를 더한다. SCN은 schema-form을 가져오지 않는다. 부류는 `derive`·`controls` 둘을 새로 둔다 | TEST-011("필요하면 PR마다 더한다"), TEST-023, 25C-08(`diagnostics`를 더한 선례) | 자율 결정 |
| I21 | 04에서 처음 나는 정착 오류의 코드와 원인 | 동적 `injectTo` 대상 없음(대상 경로가 청사진에 없거나 터미널 아래)은 가칭 `INJECT_TARGET_MISSING`, `cause: 'injectTarget'`이다. 규칙을 후보에서 빼고 커밋한 뒤 사슬 끝에서 던지며 `degraded`다. 자동 쓰기가 가상 노드에 받을 수 없는 모양을 쓰면 가칭 `INVALID_VIRTUAL_NODE_VALUES`, `cause: 'writeShape'`이며 같은 처리다. 코드는 03 선례대로 settle 소유의 `settle/utils/errors/settleErrorCode.ts`에 두고 이름은 05(PR-4)에서 확정한다. `SchemaNodeDiagnostics.cause`(`record/type.ts:105`)와 SCN의 `diagnostics` 형에 `'writeShape'`를 더한다 | CONTROLS-079, ERROR-080·107·122·132·164(가칭 머리 문단)·195·198 | 자율 결정 |
| I22 | 값 동등 판정의 자리 | 18C-50 (가)는 판정 하나다. 03의 `settle/utils/compute/sameValue.ts`는 커밋의 참조 유지용 얕은 비교다. U3은 먼저 그 함수를 (가)로 넓혀 03 정착 시험 전체가 초록인지 본다(reuse-first §1.2, 판정 하나). 초록이 아니면 (가)를 derive의 에지 비교에만 두고 차이를 log §4에 적는다 | 18C-50, SETTLE-043, VALUE-012 | 자율 결정 |
| I23 | 조각 `controls` 층의 v7 나감 에지 사례 | `verification.md:26`과 TEST-069 (라)가 말하는 v7의 조각 `controls` 층 나감 에지 사례는 `spikes/round18/proto/__tests__/`에 없다(나감 에지는 노드 자신 층의 `round18/proto/__tests__/settleRules.test.mjs:59` 하나). 04는 FRAGMENT-050 (1)·(2)·(3)과 WRITE-032의 조각 층 사례를 새로 써서 `settle/__tests__/settle.exit-layers.test.ts`에 둔다 | FRAGMENT-050, WRITE-032, TEST-069 (라) | 기록(log §4) |
| I24 | `controls.resetInteraction`의 자리 | 판정은 커밋 단계에서 최종 트리의 식 값으로 한다. 시점은 `unsetValue`와 같다(로드는 로드된 값, 런타임은 거짓→참 에지). 에지 판정은 derive가 하고, 커밋이 `record/`의 `patchSchemaNodeInteractionState`로 `dirty`·`touched`를 비운다. 원본에는 쓰지 않는다. 상호작용 상태가 바뀐 노드는 커밋의 `revision` 일괄 증가에 든다. 배달은 05다. 식이 던지면 판정은 거짓이다 | SETTLE-006, CONTROLS-029, EVENT-066, ERROR-122, `reviews/raw-round17-node-structure.md:86` | 닫힘 |
| I25 | 채움 원천의 새 층 | 생긴 노드의 채움 순위는 노드 자신의 `controls.default` > `controls.children` 항목의 `default` > 조각 `controls.default` > 표준 `default`(유효 스키마) > 없음이다. 같은 층이면 전순서에서 나중이 이긴다. 조각의 `default`는 에지 규칙이 아니라 채움이다. 03의 `readDefault`(`settle/utils/transition/readDefault.ts`)에 두 층을 더한다 | CONTROLS-077, CONTROLS-073 (7), FRAGMENT-050 (4), SETTLE-005 | 닫힘 |
| I26 | `node.context` 게터의 PR | `node.context`는 04(PR-3)의 겉면 멤버다. 기제(런타임 맥락 칸)가 04에 들어오고 게터는 그 칸의 같은 참조를 돌려줄 뿐이다(26C-01의 규칙). `FormTypeInputProps.context`는 PR-7 렌더 계층이다. 그래서 04의 겉면 멤버는 여섯(`visible`·`enabled`·`readOnly`·`disabled`·`watchValues`·`context`)이고, 그 밖에 바인딩 전용 통로 `setContext`가 있다 | SURFACE-055, 26C-01, NODE-010, 28C-03·08 | 닫힘(28C-08) |
| I27 | 맥락 변경 정착의 입력·같음·억제·내보내기 | (1) 로드가 아니다: 에지 기준은 직전 커밋의 식 값이고(I2) 기준을 비우지 않는다. (2) 같음은 18C-50 (가)의 `sameValue`로 맥락 칸과 받은 객체를 견준다. 같은 참조도, 내용이 깊이 같은 새 객체도 바뀜이 아니라서 정착이 돌지 않는다(CONTROLS-080 (8) "바뀜의 기준은 스냅숏이라, 깊이 같은 값은 같은 참조로 본다"). 이때 칸도 바꾸지 않아 `node.context`는 옛 참조 그대로다. (3) 바뀌었으면 `@` 소유자와 조상을 재계산하고, `@`를 읽는 게이트·상태 키는 그 재계산에서 다시 정하며, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에 에지를 낸다. `injectTo`는 발화하지 않는다. (4) 억제 비트는 받지 않는다(옵션의 자리는 WRITE-015가 `setValue(V, option)`·`reset(option)`·마운트로, WRITE-091이 입력 `onChange`로 정한 것뿐, `reviews/round-28-closing.md:88`). 호출 옵션이 없으므로 Form 속성 `disableAutomaticWrites`(런타임 기본값)가 그 정착의 자동 쓰기에 기본값으로 든다(WRITE-015 우선순위 행 "호출에 둘 다 없으면 Form 속성을 따르고"). (5) 내보내기는 NODE-010대로 `SchemaNode/index.ts`가 이름으로 내보내고 `src/core/index.ts`가 이름으로 다시 내보내며 `src/index.ts`는 내보내지 않는다 | CONTROLS-080 (8), WRITE-015, NODE-010, SETTLE-043·048, 18C-50, 28C-03·08 | 닫힘(28C-08) |

### 2.2 원장·계획서·03 코드 어긋남(U0에서 `log.md` §4로 옮김)

| # | 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:34`, `request.md:47` | 네 기호와 시험을 `src/__legacy__/`로 옮기라고 적었으나 03 U1이 이미 옮겼다 | LANDING-159·205 | I11. 이동 0을 G2로 확인하고 PR 본문에 적는다 |
| M2 | `request.md:22` | LANDING-066 결정 칸 그대로 "하위 트리로 내려가는 정책"을 04 몫으로 적었다. LANDING-066의 충돌 줄은 하위 트리 규칙을 PR-2로 좁힌다(`request.md:23`은 맞게 적음) | LANDING-066 충돌 줄, LANDING-092, TEST-069 (다) | LANDING-092대로 간다. 04는 `children` 항목 층·조각 층·식 값만 더한다(I5) |
| M3 | `verification.md:21` | "`selfcheck-v5`의 f와 c 가운데 주입 단언"이라 적었으나 무리 c에는 주입 단언이 없다. 주입 단언 다섯은 무리 a(A4a·A4b·A4c·A4-cap·A6-automatic)에 있다 | TEST-069 (라)(같은 문구), 03 `log.md` §4의 2행 | a의 다섯과 f의 넷을 이식한다(§6.1) |
| M4 | `verification.md:21` | "`r8-port`의 `derived`·`injectTo` 행", "`r7-port`의 에지 발화"의 묶음 이름이 실제 파일과 맞지 않는다 | TEST-069 (라), 03 I9 | 03의 파일 대응을 따른다: `round9/regress/r8-port.mjs` 관찰, `round9/r9.mjs` P2·P5·P6·P7, `round9/regress/r7-port.mjs` 관찰, `round9/r9b.mjs` 네 프로브 |
| M5 | `verification.md:21`, `verification.md:26` | v7 나감 에지 사례 가운데 "조각 `controls` 층의 사례"가 v7 시험에 없고, 있는 사례(`round18/proto/__tests__/settleRules.test.mjs:59`)는 `batch`(05 기제)를 쓴다 | TEST-069 (라), FRAGMENT-050, LANDING-064 | I16·I23 |
| M6 | `verification.md:12` | "02 §9 목록"은 `ARCH/_archive/2026-09-29/02-target-overview.md:361`의 §9 검증 전략이며 파생·상태 키 상황 목록이 없다 | LANDING-071, TEST-023 | 상황은 TEST-016·019와 §5의 원장 게이트에서 뽑는다 |
| M7 | `adr-and-axes.md:26` | "자동 쓰기 여섯(포커스 아웃 trim 포함)과 억제 비트"는 호출 수준 억제 비트가 뒤이은 포커스 아웃 `trim`에 듣지 않는다는 WRITE-100을 빠뜨렸다 | WRITE-078·100, 21C-01 | 원장 변경 없음. 계획 문서 정정으로 처리하고 `log.md` §4에 적는다(`adr-and-axes.md`는 고치지 않음). 포커스 아웃 `trim`은 호출 비트가 아니라 Form 속성만 억제한다(28C-04, `reviews/round-28-closing.md:48`). `trim`은 07이다. 04의 억제 단언은 파생·주입·`unsetValue`·채움·나감 비움에 한정한다 |
| M8 | 03 코드(`settle/utils/paths/resolveDependencyPath.ts:5-11`, `settle/utils/gates/evaluateGate.ts:80`, `settle/utils/gates/getGateRegistry.ts:155`, `settle/utils/write/getDependencyIndex.ts:32,42`)와 시험(`settle/__tests__/settle.gates.test.ts:72-84`) | 03이 `@`를 호스트의 `extras`로 읽고, `@` 의존을 호스트 경로로 치환하며, 역의존 표에서 뺐다. 원장 근거가 없는 03 이탈이다 | CONTROLS-080 (3)·(6)·(8), 28C-03(`reviews/round-28-closing.md:36-37`) | U3·U4b가 고치고 시험을 다시 쓴다(G26). 조율 세션이 `log.md` §4에 M8로 적는다 |

28라운드(28C-01~08)는 M1–M7이 원장 변경을 부르지 않는다고 확인했다. 모두 계획 문서 쪽 정정이며 U0에서 `log.md` §4에 적는다.

### 2.3 원장 질의와 답(28라운드)

질의 Q1–Q7은 U0에서 원장 관리 세션 `albatrion-79`로 보냈고 `reviews/round-28-closing.md`의 28C-01~08로 답을 받았다. 답이 부른 Q8과 I27의 확인은 28C-08로 받았다. 막힌 단위는 없다. 답의 해시는 원장 관리 세션이 커밋한 뒤 `log.md` §2에 적는다.

| 질의 | 해석 행 | 물음 | 답 | 반영한 단위 |
| --- | --- | --- | --- | --- |
| Q1 | I8 | 개발 모드 정착 기록의 자리·보존·읽는 자·판정 | 28C-01: `record/`가 선언하는 `SchemaNodeRuntime` 칸(NODE-045, `record/DETAIL.md`에 비용 줄), 마지막 정착 하나를 정착마다 바꿈, 프로덕션에서는 만들지 않음, 콘솔이 아닌 "(기록)" 층. 공개 멤버·`onError`·`FormHandle`·개발 도구·`core/index` 노출 없음. 시험이 칸을 읽는 것은 TEST-069 (나) 위반이 아님. 판정은 ERROR-030과 같은 `process.env.NODE_ENV !== 'production'`, `hasConsumer`를 보지 않음 | U2, U3, ADR D8 |
| Q2 | I9 | `enabled`의 뜻과 떼어진 노드의 게터 | 28C-02: `enabled = active && visible`(살아 있는 노드에서는 `visible`과 같고 `disabled`와 무관). `visible`·`readOnly`·`disabled`는 CONTROLS-082의 로컬 결합이고 Form 속성 전체 잠금은 렌더 계층. 떼어진 노드의 세 게터는 NODE-044 동결 읽기(떼어질 때 한 번, 26C-10처럼). 26C-08 예외는 `active`만이라 떼어진 노드의 `enabled`는 거짓 | U5, ADR D4 |
| Q3 | I12 | `@`·`ctx.context`의 값, 03의 `@`=`extras` 읽기, 맥락 변경의 몫 | 28C-03: (1) 런타임 맥락 칸(바인딩이 트리 생성 때 준 객체, 없으면 `{}`), 로드는 로드 시점 맥락. (2) 03의 `@`=`extras`는 원장 근거 없는 결함(CONTROLS-080 (3)·(6)), 04가 고치고 03 이탈로 `log.md` §4에 적음, 그렇게 단언한 PR-2 시험은 고침. (3) 맥락 변경은 04의 기제: 바인딩 전용 내부 통로 `setContext`(가칭, SURFACE-055, NODE-010)와 그 정착. 역의존 표의 `@` 항목이 가리키는 노드와 조상을 재계산, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에 에지, `injectTo`는 발화하지 않음. 07은 병합과 호출 바인딩만 | U2, U3, U4, U4b, ADR D9 |
| Q4 | I7 | 억제된 로드의 `resetInteraction` | 28C-04: 자동 쓰기가 아니므로(EVENT-012) 억제된 로드에서도 평가한다. 커밋이 로드된 값으로 판정해 참이면 `dirty`·`touched`를 비운다 | U3 |
| Q5 | I19 | 던진 `unsetOnInactive` 식 | 28C-05 (나): "유지"로 센다(WRITE-031, ERROR-122·125). 층 규칙 불변. 던짐은 사슬 끝 `EXPRESSION_THREW`, 그 식을 평가한 정착의 커밋 `degraded`(ERROR-126·159) | U6 |
| Q6 | I17 | TEST-071의 "값 크기"와 판정선, 실패 처리 | 28C-06 (나): 바뀌지 않은 원소들의 깊은 크기, O(N) 참조 비교는 지름길의 필수 비용. 제안한 선이 맞다. `ARCH/verification/04-derive-and-controls/performance.md`에 TEST-027 절차로 기록하고 `verification.md`는 고치지 않는다. 지름길이 없으면 18C-50·SETTLE-043 기제 결함이라 고치는 것이 구현, 지름길이 있는데 선을 넘으면 27라운드대로 최적화 없이 까닭과 소유자 수용을 `performance.md`에 | U9 |
| Q7 | I18 | `watchValues`의 몫 | 28C-07: PR-6 core 게터. 04는 게터 다섯. 기제는 유효 스키마의 `controls.watch`(나중이 이김)를 방출 트리에서 읽기(CONTROLS-080 (5)). `FormTypeInputProps.watchValues`는 07, EVENT-064 배달은 05, LANDING-137은 게터의 결과라 04 | U2, U5 |
| Q8 | I26, I27 | `node.context`의 PR, 그리고 I27(맥락 변경 정착)의 확인 | 28C-08: `node.context`는 04(PR-3) 멤버이고 칸의 같은 참조를 돌려줌, `FormTypeInputProps.context`는 PR-7. 기준은 직전 커밋. 같은 참조와 깊이 같은 새 객체는 바뀜이 아니라 정착 없음. `setContext`는 억제 비트를 받지 않고 Form 속성 `disableAutomaticWrites`가 기본값으로 듦. 내보내기는 NODE-010대로 `SchemaNode/index.ts`와 `src/core/index.ts`, `src/index.ts`는 아님. `settle/utils/context/` 자리는 이의 없음 | U2, U4b, ADR D4·D9 |

## 3. 구조

### 3.1 새 fractal과 새 organ

| 자리 | 종류 | 책임(원장) |
| --- | --- | --- |
| `PKG/src/core/settle/derive/` | 새 fractal(`settle`의 자식) | 파생 규칙의 판정: 청사진마다 한 번 만드는 규칙 표, 규칙 발생의 기준점과 에지(값 동등 포함), `derived`·`unsetValue`·`resetInteraction` 식 평가와 `injectTo` 호출, 같은 대상 규칙의 순위·층 표와 승자 선택, 진 쓰기의 에지 소비, 개발 모드 기록 항목. 쓰기를 적용하지 않는다(LANDING-063·083, SETTLE-004·043, CONTROLS-079) |
| `PKG/src/core/settle/utils/derivation/` | settle의 organ(주제) | 파생 라운드 실행기: derive의 판정을 받아 `markWrite`로 자동 쓰기를 적용하고 재계산 목록 등록 → 계산을 다시 부르며, 파생 라운드를 세고 상한 25에서 원본 B 경로로 넘긴다. 억제 때는 판정을 기록만 한다(SETTLE-004·011·017, WRITE-015) |
| `PKG/src/core/settle/utils/context/` | settle의 organ(주제) | 맥락 변경 진입: `@` 소유자 목록(청사진마다 한 번)과, 맥락 칸을 바꾼 뒤 소유자와 조상을 재계산 목록에 넣어 정착을 한 번 도는 함수(CONTROLS-080 (8), 28C-03). `SchemaNode/`의 내부 통로 `setContext`가 settle 진입점을 거쳐 부른다 |
| `PKG/src/core/settle/utils/controls/` | settle의 organ(주제) | 층 해석(한 노드에 걸리는 노드 자신 선언·`children` 항목·조각 `controls`를 직전 커밋 또는 이번 최종 형상 기준으로 모음)과 계산 끝의 상태 키 결합. 전이(나감 정책·채움 층)와 derive(값 키 층)가 같은 층 해석을 쓴다(SETTLE-003, CONTROLS-042·073·077·082, WRITE-031–034) |

`derive/` 뿌리에는 `INTENT.md`·`DETAIL.md`·`index.ts`와 형만 든 `type.ts`를 두고(03의 `settle/type.ts` 선례), 구현은 `derive/utils/<주제>/`(`rules/`·`edges/`·`evaluate/`·`rank/`·`trace/`)에 둔다(FCA §4, seiri structure §2).

### 3.2 의존 방향

- 전체 순서는 그대로다: `blueprint` < `record` < {`behaviors`, `navigation`} < `settle` < `SchemaNode`(NODE-016). `settle/derive`는 `settle` 안에 있다.
- `settle`의 organ → `settle/derive`의 진입점(`index.ts`)만. 소비자는 `utils/derivation/`(라운드 실행기)와 `utils/commit/`(`resetInteraction` 판정 소비)다.
- `settle/derive` → `blueprint`·`record`의 진입점, 그리고 `settle` 안의 순수 organ 파일 셋: `utils/compute/sameValue.ts`, `utils/paths/resolveDependencyPath.ts`, `utils/controls/`의 층 해석. derive는 `settle/type.ts`, `settle/index.ts`, `utils/write`·`utils/transition`·`utils/commit`·`utils/derivation`을 `import type`으로도 가져오지 않는다. 그래서 `settle/type.ts`가 derive의 형을 가져와도 형 수준 순환이 생기지 않는다(ADR D1).
- `utils/controls/`는 `settle/type.ts`를 가져오지 않는 순수 함수만 둔다(derive가 가져오므로).
- 맥락 변경: `SchemaNode/`의 `setContext` → `settle/index.ts`의 맥락 변경 진입(이름 붙은 수출) → `settle/utils/context/`. `settle`은 `SchemaNode`를 가져오지 않는다(NODE-016, ADR D9).
- `src/core/index.ts` → `SchemaNode/index.ts`의 `setContext`(이름으로 다시 내보냄, NODE-010). `src/core/index.ts`의 나머지 수출은 07까지 옛 엔진을 가리킨다. 공개 `src/index.ts`는 `./core`에서 이름을 골라 가져오므로(`src/index.ts:32-55`) `setContext`가 새지 않고, 번들에 새 엔진이 끌려오지 않음을 G30이 dist로 확인한다.
- 새 코드는 `__legacy__`를 가져오지 않는다(LANDING-159 규칙 1). `eslint.config.js`의 `src/core/settle/**` 글롭이 derive를 이미 덮는다.
- `src/core/__tests__/dependencyDirection.test.ts`에 위 세 규칙(derive의 금지 목록, organ → derive 진입점만, `utils/controls`의 `settle/type.ts` 금지)을 더한다(NODE-045).

### 3.3 바뀌는 계약 문서(코드보다 먼저, U2)

| 문서 | 바꾸는 것 |
| --- | --- |
| `settle/derive/INTENT.md`·`DETAIL.md`(새로) | 진입점의 이름 붙은 수출과 서명, 판정 입력·출력 형, 순위·층 표, 기준점 규칙, 개발 모드 기록 항목의 모양, 금지 의존 |
| `settle/DETAIL.md` | `:7`의 단계 순서를 "표시 → 계산 → 파생(쓰기가 나오면 표시로) → 전이(쓰기가 나오면 표시로) → 커밋"으로 고침, 파생 라운드 예산과 원본 B, `exceededBudget: 'derive'`, 계산 끝의 상태 키 결합, 채움 층, 나감 정책의 네 층·식 값, `resetInteraction`, 새 오류 코드와 `cause: 'writeShape'`, `@`는 런타임 맥락 칸(03의 `extras` 읽기 정정, 28C-03), 맥락 변경 진입과 그 재계산·에지(`injectTo` 제외), 개발 모드 기록의 작성 시점(28C-01) |
| `record/DETAIL.md` | 레코드 필드 `visible`·`readOnly`·`disabled`(자리·쓰는 단계·비용), 런타임 칸: 커밋된 규칙 값(`committedRuleValues`, 가칭), 개발 모드 기록(가칭 `settlementTrace`, 마지막 정착 하나, 프로덕션에서는 만들지 않음, 비용 줄, 28C-01), 맥락(가칭 `context`, 트리 생성 때 받음, 없으면 `{}`, 28C-03), 떼어진 노드의 동결 읽기에 `visible`·`readOnly`·`disabled`(28C-02), `SchemaNodeDiagnostics.cause`의 `'writeShape'`(NODE-045) |
| `SchemaNode/DETAIL.md` | PR-6 멤버 표(`visible`·`enabled`·`readOnly`·`disabled`·`watchValues`, 28C-07)와 위임 대상(26C-01), 떼어진 노드에서의 값(28C-02), `:51`의 내부 통로 줄을 "`setContext`는 04에서 `SchemaNode/index.ts`가 이름 붙여 내보내고 `core/index.ts`가 이름으로 다시 내보내며 `src/index.ts`는 내보내지 않는다"로 고침(NODE-010, 28C-03·08), 멤버 표에 `context`(맥락 칸의 같은 참조, 28C-08) |
| `src/core/DETAIL.md` | `settle/derive`의 자리와 DAG 절, "진입점 표면" 절(`:18`)에 새 엔진의 바인딩 전용 통로 `setContext`를 이름으로 다시 내보냄과 그 까닭(NODE-010)을 더함, `:11`의 "07까지 레거시 엔진을 가리킨다"에 이 한 이름이 예외임을 적음 |
| `SCN/DETAIL.md` | `states` 기대, `resetSubtree` 단계(쓸 때), 부류 `derive`·`controls` |

`src/core/INTENT.md`와 `blueprint/`의 문서는 고치지 않는다(패키지 공개 경계와 청사진 계약이 바뀌지 않음, I4. `core/index.ts`의 내부 수출 하나는 DETAIL이 적는다). 공개 `src/index.ts`·`src/types`는 07까지 옛 엔진 그대로다(LANDING-159 규칙 3, 03 ADR D5).

## 4. 작업 단위

**담당 배정(소유자 결정 2026-09-30, `plan/prompts.md` §1).** 위임은 cennad 경유로만 한다.

| 역할 | 담당 | 무엇 |
| --- | --- | --- |
| 구현 | codex(cennad) | U1–U9(U4b 포함)의 코드·시험·문서 초안. 단위마다 한 세션이고, 이어지는 고침은 같은 세션을 잇는다. 기계적 단위(U1, U8의 이식 틀)는 낮은 effort, 판정이 많은 단위(U3–U6, U4b)는 높은 effort |
| 대조·리뷰 | antigravity(cennad) | `seiri:review-plan`, 원장 대 문서·코드 대조(G4), 단위 검토, 회귀 분류 확인, PLAN §2 7단계의 원장 대 구현 대조 |
| 대체 | Claude 서브에이전트 | codex나 antigravity가 사용량 초과로 멈추면 그 몫을 맡는다. 기계적 적용은 sonnet·중간 effort, 진단·게이트 판정은 opus·높은 effort. 대체한 사실과 까닭은 `log.md` §2에 적는다 |
| 조율과 판정 | 이 세션(조율 세션) | 브리프 작성, 원장 질의 발송과 답 반영, 원장 해석 판단, 지적 거르기, 커밋·push·PR, 기록 |
| 최종 게이트 | 독립 검증자 | PR 전 최초 기준선·원장 대 브랜치 diff 대조와 PASS 판정(G25) |

단위마다 한 작성자가 쓰고 다른 에이전트가 검증한다. 구현 단위는 `seiri:implement`로 하고, 새 동작은 고치기 전에 붉은 시험을 먼저 기록한다(붉음의 까닭이 "기제 없음"임을 확인). codex는 저장소 작업 트리에 쓰고(`workspace-write`), 커밋은 조율 세션이 단위마다 경로를 지정한 `git add`로 한다. 명령은 모두 저장소 루트에서 돈다. 순서는 U0 → U1 → U2 → U3 → U4 → U4b → U5 → U6 → {U7, U8, U9} → U10이다. U4b는 U3의 맥락 칸과 `@` 정정 위에 선다. U7·U8·U9는 파일 범위가 겹치지 않으므로 병렬로 할 수 있다.

### U0 착수 — 이 계획, ADR, 게이트 원장, 원장 질의

- 산출: `execution-plan.md`, `execution-adr.md`, `.seiri/tasks/schema-form-04-derive-and-controls/gates.md`, `log.md`(§2 진행, §4에 §2.2의 M1–M7과 I11·I14·I15·I16·I23 기록).
- 원장 질의 Q1–Q8을 `albatrion-79`로 보냈고 28C-01~08로 답을 받아 §2.1·§2.3, U2–U9, §5, ADR D4·D8·D9, 게이트를 고쳤다. `log.md` §4에는 M7의 계획 문서 정정과 28C-03 (2)의 03 이탈(`@` → `extras`)을 함께 적는다.
- 완료: antigravity의 `seiri:review-plan`이 `cleared`. 원장 답 반영 뒤 범위 한정 재검토(G1).

### U1 레거시 확인

- 원장: LANDING-159·205.
- 네 기호(`InjectionGuardManager`·`getDerivedValueFactory`·`checkComputedOptionFactory`·`mergeShowConditions`)와 그 시험이 `src/__legacy__/` 아래에만 있음을 확인한다(I11). 옮길 파일은 없다. `src/__legacy__/`는 보존한다(LANDING-205).
- 확인 대상 자리: `src/__legacy__/core/nodes/AbstractNode/utils/InjectionGuardManager/`, `…/getComputedPropertiesManager/ComputedPropertiesManager/utils/{getDerivedValueFactory,checkComputedOptionFactory}/`, `…/ComputedPropertiesManager/utils/__tests__/`, `src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/mergeShowConditions/`.
- 완료: G2. 결과를 `log.md` §4와 PR 본문 "레거시 이동 목록"에 적는다.
- 담당: 조율 세션이 게이트만 돌린다(코드 변경 없음).

### U2 문서 선행 — derive의 INTENT·DETAIL과 바뀌는 계약

- 원장: LANDING-063·066·083·086, SETTLE-002–006·011·017·043, NODE-004·010·016·045, 26C-01·06, CONTROLS-073·077·079·080·082, SURFACE-055, WRITE-031–039, ERROR-122·132·195, 28C-01·02·03·07.
- 쓰는 것: §3.3의 표 전부. `derive/DETAIL.md`가 계약으로 드는 것은 다음과 같다.
  - 진입점이 이름으로 내보내는 기호와 서명: 한 라운드의 판정 함수(입력: 루트 레코드와 derive 상태, 출력: 대상마다 하나인 승자 쓰기 목록과 소비할 에지와 기록 항목), `resetInteraction` 판정 함수, 규칙 표 함수, 상한 상수 `DERIVE_ROUND_CAP = 25`, derive 상태와 기록 항목의 형.
  - 순위 표(종류 순위)와 층 표(조각 < `children` 항목 < 노드 자신)의 정확한 값.
  - 기준점 규칙(I2)과 로드·`resetSubtree()`·재탄생·조각 켜짐의 기준 처리.
  - 금지 의존(§3.2)과 판정만 하고 쓰지 않는다는 경계.
- `settle/derive/INTENT.md` 첫 줄에 이름 함정을 적는다: 이 fractal의 `derive`는 파생 단계이며 `controls.derived` 키 하나가 아니다(seiri agent-legible §3).
- 완료:
  - 문서만 든 커밋. `settle/derive`·`settle`·`record`·`SchemaNode`의 첫 코드 커밋이 이 커밋보다 뒤다(G3).
  - antigravity의 원장 대조 차단 지적 0(G4, 수동).
- 담당: codex가 쓰고 antigravity가 원장과 대조한다. 여기서 정한 서명이 U3–U6의 인터페이스다. 이후 서명을 바꾸면 DETAIL을 먼저 고친다.

### U3 파생 ①: 에지·`derived`·`unsetValue`·`resetInteraction`·라운드·억제·기록

- 원장: SETTLE-004·005·006·010·011·017·028·043·046·048, WRITE-011·015·028·029·097, CONTROLS-026·028·029·038·080, EVENT-012·020·066, ERROR-030·070·122·132, TEST-016·069 (나)(다), 18C-50·102, GOAL-065, 28C-01·03·04.
- 붉은 시험 먼저(`settle/derive/__tests__/`, `settle/__tests__/`). 시험 이름에 원장 ID 태그를 싣는다(§5, G6).
- 규칙 표(`derive/utils/rules/`): 청사진마다 한 번 `Blueprint.expressions`의 `derived`·`unsetValue`·`resetInteraction` 식과 선언의 `controls.watch`를 규칙 발생 템플릿으로 모은다. 약한 맵에 두고 규칙이 없는 청사진은 빈 표를 공유한다. 규칙이 없는 청사진의 쓰기는 파생 단계를 건너뛴다(G6 비용, 03 벤치 B5가 그대로여야 함).
- 에지(`derive/utils/edges/`): I2의 기준점과 `sameValue`(I22). 기준점의 커밋 값은 런타임 칸에 둔다(ADR D3). 로드는 범위 안의 기준을 비우고, 나간 노드의 기준은 커밋에서 지운다(재탄생이 거짓→참이 되게).
- 평가(`derive/utils/evaluate/`): `derived`는 의존 튜플이 바뀐 에지에서 식을 평가하고 `undefined`면 쓰지 않는다. `unsetValue`는 거짓→참 에지에서 없음을 쓴다. 로드에서는 로드된 값으로 평가하며, 같은 정착의 채움·파생으로 참이 되어도 지운다. 참→거짓은 아무 일도 없다. 생긴 노드의 `unsetValue`가 참이면 그 노드는 채우지 않는다(전이의 채움이 derive의 판정을 읽음). 식이 던지면 그 규칙을 그 라운드의 후보에서 빼고 에지를 소비하며 커밋은 `degraded`(`cause: 'expression'`)다.
- `resetInteraction`: I24. 커밋이 derive의 판정을 받아 `patchSchemaNodeInteractionState`로 비우고 그 노드의 `revision`을 올린다.
- 라운드 실행기(`settle/utils/derivation/`): I1. `settle/utils/write/writeSchemaNode.ts:97-108`의 계산·바퀴 예산 검사 뒤와 `settle/utils/transition/transitionSettlement.ts:92` 재계산 뒤에서 부른다. 라운드 수는 정착 문맥에 한 번 두고 전이 뒤에도 이어 센다. 초과는 `restoreSourceB`가 파생 쓰기와 `unsetValue`의 지움까지 되돌리게 한다(되돌림 기록에 파생 쓰기를 적는다).
- 억제: I7. 억제된 호출에서는 규칙을 평가해 기록에 "억제"로 남기되 쓰지 않는다(기록은 개발 모드에서만). `resetInteraction`은 억제된 로드에서도 로드된 값으로 판정해 참이면 `dirty`·`touched`를 비운다(28C-04). 시험: `FormHandle.reset(DisableAutomaticWrites)` 경로와 같은 억제된 로드에서 `derived`는 쓰이지 않고 `resetInteraction`은 비운다.
- 개발 모드 기록(`derive/utils/trace/`가 항목을 만들고 커밋이 칸을 바꾼다): I8. 자리는 `record/type.ts`의 `SchemaNodeRuntime` 선택 칸 하나(가칭 `settlementTrace`)이며, 마지막 정착 하나를 정착마다 통째로 바꾼다. 프로덕션(`process.env.NODE_ENV === 'production'`)에서는 항목을 만들지도 칸을 만들지도 않는다. 공개 멤버·`core/index` 수출은 없고 시험은 런타임 칸을 직접 읽는다(28C-01, ADR D8).
- `@`(28C-03 (1)(2)): 식은 `SchemaNodeRuntime`의 맥락 칸(가칭 `context`, 트리 생성 때 `schemaNodeFactory`의 인자로 받고 없으면 `{}`)을 `@`로 읽는다. 03의 결함 다섯 자리를 고친다(28C-03, `reviews/round-28-closing.md:36`):
  - `settle/utils/paths/resolveDependencyPath.ts:5-11`: `@`를 `extras` 맥락으로 돌려주는 분기와 문서.
  - `settle/utils/gates/evaluateGate.ts:80`: `@`에 `projectedExtra`를 주는 분기. 맥락 칸을 준다.
  - `settle/utils/gates/getGateRegistry.ts:155`: `@` 의존을 호스트 경로로 치환하는 것. `@`는 경로가 아니므로 치환하지 않고 U4b의 `@` 소유자 목록으로 넘긴다.
  - `settle/utils/write/getDependencyIndex.ts:32,42`: `@`를 역의존 표에서 빼는 것. 경로 트라이에는 계속 넣지 않되, 빠진 `@` 항목을 U4b의 `@` 소유자 목록이 받는다(ADR D9).
  - 시험 `settle/__tests__/settle.gates.test.ts:72-84`(`CONTROLS-080 withholds omitted host extras from @ dependencies`): `@`가 호스트 `extras`를 읽는다고 단언하므로 틀렸다. 같은 스키마를 맥락 칸 기준으로 다시 써서 `@`가 맥락 객체를 읽고 `extras`를 읽지 않음을 단언한다(태그 `28C-03 context slot`). `:123-138`의 `@` 사례는 평가 호스트 자리만 단언하므로 그대로 둔다.
  - 고침은 03 이탈(M8)로 `log.md` §4에 적는다.
- 03의 SETTLE-048 시나리오(`setValue(getValue())`는 발화하지 않고 `FormHandle.reset()`은 발화)를 `derived`로 단언한다(03 `log.md` §4의 9행).
- 완료: derive·settle·record 시험 초록, 03 정착 시험 초록, §5의 U3 행 태그 전부(G5·G6), 다섯 자리의 `@` → `extras` 읽기 제거(G26).

### U4 파생 ②: `injectTo`와 같은 대상 규칙

- 원장: CONTROLS-027·034·053·054·079·084, SETTLE-004·046·049, WRITE-012·018·029, VALUE-031·032, GOAL-063, FRAGMENT-034, ERROR-080·107·122·124·132·195, LANDING-030·138·166, TEST-077, 26C-14.
- 붉은 시험 먼저. 시험 이름에 태그(§5, G7).
- `injectTo`(`derive/utils/evaluate/`): 원천의 방출 값 에지에서 `(value, ctx)`를 부른다. 반환 키는 원천 기준 경로이고, 항목마다 대상에 대한 전체 교체 후보다. `ctx.context`는 `@`와 같은 런타임 맥락 칸이다(28C-03 (1)). 값이 `undefined`인 항목은 쓰지 않는다. `null`·`undefined` 반환은 아무것도 쓰지 않고 에지를 소비한다. `@`는 대상이 아니다. 대상 경로가 청사진에 없거나 터미널 아래면 그 규칙을 후보에서 빼고 `INJECT_TARGET_MISSING`(I21)이다. 형상에 없는 대상은 오류가 아니며 03의 분배(`settle/utils/latent/distributeLatentValue.ts`)로 잠복 원본에 쓴다. 대상이 나중에 켜져도 다시 발화하지 않는다. 원천이 형상 밖이면 규칙을 평가하지 않고, 비활성 원천의 방출이 사라지는 것은 에지가 아니다. `injectTo`는 언제나 자동 쓰기라 null 조상을 객체로 만들지 않는다. 가상 노드에 받을 수 없는 모양을 쓰면 `cause: 'writeShape'`(I21)이다. 자동 순환 차단은 없고 예산이 잡는다.
- 같은 대상 규칙(`derive/utils/rank/`): I3. 순위 표와 층 표를 데이터로 두고 비교 함수 하나가 읽는다(seiri structure §3). 정착 단위 순위를 위해 "이 정착에서 대상에 적용된 가장 높은 순위"를 정착 문맥에 둔다.
- 로드의 발화 범위: 마운트와 `FormHandle.reset()`은 폼 전체, `resetSubtree()`는 원천이 그 하위 트리 안인 규칙만 발화하고, 발화한 규칙의 대상이 밖이어도 쓴다(SETTLE-049, 03 `log.md` §4의 9행).
- union 쓰기 경로: `behaviors/unionBehavior/__tests__/union.write-paths.test.ts:81-82`의 `it.todo` 둘을 실제 시험으로 바꾼다(`derived`·`injectTo`가 유효 union 목록을 지나 쓰임, TEST-077).
- TEST-071의 지름길 성질을 단위 시험으로도 둔다: 참조가 같은 원소는 내려가지 않음(방문 수 단언). 벤치는 U9다.
- 완료: G7·G8.

### U4b 맥락 변경 — `setContext` 내부 통로, 그 정착, `context` 게터

- 원장: CONTROLS-080 (8), SURFACE-055, NODE-010·045, WRITE-015, SETTLE-003·043·046·048, 18C-50, 26C-01·06, 28C-03 (3), 28C-08.
- 붉은 시험 먼저(`settle/__tests__/settle.context.test.ts`, `SchemaNode/__tests__/`). 시험 이름에 태그(§5, G27·G28).
- 통로와 내보내기(NODE-010, 28C-08, ADR D9):
  - 바인딩 전용 내부 통로 `setContext`(가칭)는 클래스 멤버가 아니라 `SchemaNode/`의 함수다. `SchemaNode/index.ts`가 이름으로 내보낸다.
  - `src/core/index.ts`가 이름으로 다시 내보낸다(`finishInput`과 같은 취급). 그 파일의 나머지 수출은 07까지 옛 엔진 그대로다.
  - 공개 `src/index.ts`는 내보내지 않는다. `src/index.ts:32-55`가 `./core`에서 이름을 골라 가져오므로 새지 않는다.
  - `SchemaNode/__tests__/surface.test.ts`의 키 목록 시험(`TEST-069 public index keys excludes binding-only channels`)에 `setContext`를 더하고 시험 이름을 뜻에 맞게 고친다. `src/index.ts`에 없음은 G27이 확인한다.
  - 트리의 루트 노드와 병합된 맥락 객체 하나를 받는다. 병합은 바인딩(07)의 일이다(`reviews/round-28-closing.md:34`).
- 같음(I27 (2)): 맥락 칸과 받은 객체를 18C-50 (가)의 `sameValue`로 견준다. 같은 참조와 깊이 같은 새 객체는 바뀜이 아니다. 이때는 정착이 없고 칸도 그대로다. 시험은 개발 모드 정착 기록 칸(28C-01)이 바뀌지 않았고, 루트 `revision`과 `node.context`의 참조가 그대로임을 단언한다.
- 정착 진입(`settle/utils/context/`, settle의 organ): 03의 `DependencyIndex`(`settle/utils/write/getDependencyIndex.ts:32,42`)는 `@`를 역의존 표에서 빼고, `settle/utils/gates/getGateRegistry.ts:155`는 `@`를 호스트 경로로 치환했다(U3이 치환을 없앰). 청사진의 `Blueprint.dependencies['@']`와 `@`를 읽는 `active` 게이트에서 `@` 소유자 목록을 따로 만든다. 바뀌었으면 칸을 바꾸고, 원본을 표시하지 않은 채 소유자 노드와 조상을 재계산 목록에 넣어 표시 → 계산 → 파생 → 전이 → 커밋을 한 번 돈다. `@`를 읽는 게이트·상태 키는 그 재계산에서 다시 정한다.
- 에지: `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에 에지를 낸다(기준은 직전 커밋의 식 값, I2). `injectTo`는 맥락 변경에 발화하지 않는다.
- 억제(I27 (4)): `setContext`는 옵션을 받지 않는다. Form 속성 `disableAutomaticWrites`(런타임 기본값)가 켜져 있으면 맥락 에지로 발화한 `derived`·`unsetValue`와 그 정착의 채움·나감 비움이 쓰이지 않는다. 시험: 같은 트리를 Form 속성 켬·끔으로 만들어 맥락 에지의 `derived`가 켬에서는 쓰이지 않고 끔에서는 쓰임을 단언한다.
- 겉면 게터 `context`(28C-08): `SchemaNode` 클래스에 한 문장 위임으로 더하고, 런타임 맥락 칸의 같은 참조를 돌려준다. `SchemaNode/DETAIL.md` 멤버 표·멤버 목록 시험·공개 형(`SchemaNode/type.ts`)을 함께 고친다(26C-01). `FormTypeInputProps.context`는 07이다.
- 번들 확인: `src/core/index.ts`가 `./SchemaNode`를 가져오게 되므로, 07 전에 새 엔진 코드가 `dist/index.mjs`·`dist/index.cjs`로 끌려오지 않음을 새 엔진에만 있는 이름(`writeSchemaNode`·`commitSettlement`·`getGateRegistry`)으로 확인한다(G30). 2026-09-30 기준 `1.0.0-beta`의 dist에는 셋 모두 없고 `src/__legacy__`에도 없다(`schemaNodeFactory`는 옛 엔진에도 있어 쓰지 않는다).
- 완료: G27·G28·G30. `record/DETAIL.md`의 맥락 칸, `settle/DETAIL.md`의 맥락 변경 진입, `SchemaNode/DETAIL.md`의 `:51`과 멤버 표, `src/core/DETAIL.md`의 진입점 표면이 U2 문서 커밋에 있다(G3).
- 담당: codex가 구현, antigravity가 원장 대조. 이름 `setContext`는 SURFACE-055의 가칭 그대로 쓰고, 원장이 이름을 확정하면 따른다.

### U5 상태 키 결합과 겉면 게터

- 원장: CONTROLS-032·042·045·046·070·073 (6)·080 (5)·082·083, LANDING-137, SCHEMA-010, SETTLE-003, FRAGMENT-033, GOAL-044·048, LANDING-066·086, NODE-010·044·045, 26C-01·08·10, ERROR-122·132, 28C-02·07.
- 붉은 시험 먼저. 결합 표의 모든 칸(자리 넷 × 키 셋 × 참/거짓 조합, OR/AND)을 표 주도 시험으로 둔다(`settle/__tests__/settle.controls.test.ts`).
- 층 해석(`settle/utils/controls/`): 한 노드에 걸리는 선언 셋을 모은다. (1) 켜진 노드 범위 선언, (2) 부모의 `controls.children` 항목 가운데 이름이 이 노드이고 항목을 가진 선언이 켜진 것(대상 해석은 청사진이 한 CONTROLS-073 (1)), (3) 켜진 조각 가운데 이 노드를 직접 선언한 조각의 `controls`. 기준은 "이번 최종 형상"과 "직전 커밋"(U6의 나감) 둘이다.
- 결합: I6. 계산의 끝(`computeNode` 뒤, 파생 앞)에서 재계산 목록의 노드만 다시 정한다(SETTLE-017). `children` 항목의 식은 호스트 기준으로 항목마다 한 번 평가해 모든 대상에 같은 값으로 건다(CONTROLS-073 (6)). 식이 던지면 그 선언은 없는 것이고 `degraded`다.
- 레코드 필드 `visible`·`readOnly`·`disabled`(ADR D4). 생성자에서 대입만 하고 계산의 끝에서 쓴다.
- 겉면: `SchemaNode` 클래스에 게터 다섯 `visible`·`enabled`·`readOnly`·`disabled`·`watchValues`를 한 문장 위임으로 더하고, `SchemaNode/DETAIL.md` 멤버 표·멤버 목록 시험(`SchemaNode/__tests__/surface.test.ts`)·공개 형(`SchemaNode/type.ts`)을 함께 고친다(26C-01, 28C-07).
  - `enabled`는 `active && visible`이다. `disabled`와 무관함을 단언한다(28C-02).
  - 떼어진 노드: `visible`·`readOnly`·`disabled`는 떼어질 때 한 번 잡은 동결 값이다. `settle/utils/detached/captureDetachedSchemaNodeReads.ts`가 `typeMismatch`처럼 세 값을 함께 잡는다(26C-10 방식). `enabled`는 `active`가 거짓이라 거짓이다(26C-08). 떼어진 뒤 조상의 잠금이 바뀌어도 세 값이 그대로임을 단언한다.
  - `watchValues`: 유효 스키마의 `controls.watch`(병합에서 나중이 이김)의 경로들을 방출 트리에서 읽은 값 배열이다(CONTROLS-080 (5)). 같은 커밋 안에서 두 번 읽으면 같은 참조다(패키지 설계 가치). 읽는 자리는 한 함수(`settle/utils/controls/`)이며 게터는 위임만 한다. `omitEmpty` 아래 빈 문자열은 방출 트리에서 이미 빠지므로 `watchValues`에서 `undefined`로 읽힘을 단언한다(LANDING-137, 28C-07). `FormTypeInputProps` 연결은 07이다.
- 루트 전역 상속 없음: 루트 스키마의 `readOnly: true`·`disabled: true`·`controls.visible: false`가 자손의 게터를 바꾸지 않음을 단언한다(I10).
- 잠금은 쓰기를 막지 않음: 잠긴 노드에 `setValue`와 `derived`·`injectTo`가 그대로 적용됨을 단언한다(CONTROLS-083 (1)).
- 03 회귀 `round9/r9.mjs` P4의 `and-or` 행과 `round9/regress/edge-cases.mjs`의 잠금 결합 세 사례는 U8에서 이식한다.
- 완료: G9·G10·G29.

### U6 값 키의 새 층과 나감 정책의 층

- 원장: CONTROLS-024·030·040·044·073 (7)·077, WRITE-031–039, FRAGMENT-035·050, VALUE-025, ERROR-122·125·126·159, TEST-019 보충, LANDING-092, 18C-51, 28C-05.
- 붉은 시험 먼저(`settle/__tests__/settle.exit-layers.test.ts`, `settle/derive/__tests__/`).
- 값 키의 층: `controls.children` 항목과 조각 `controls`의 `default`(I25), `derived`·`unsetValue`·`resetInteraction`을 각 대상에 그 층의 선언으로 건다. 같은 값이나 같은 식이 대상 모두에 쓰인다(식의 기준점은 호스트). 조각 층의 에지 규칙은 조각이 켜진 동안만 후보이고, 후보 여부는 그 라운드의 완성된 트리에서 정한다. 앞 라운드에 적용된 파생 쓰기는 뒤 라운드에서 조각이 꺼져도 되돌리지 않는다(FRAGMENT-050 (1)–(3)).
- 나감 정책: 03의 `settle/utils/transition/readUnsetPolicy.ts`·`settle/utils/transition/readDepartingAncestorPolicy.ts`·`settle/utils/transition/applyExitClearing.ts`를 U5의 층 해석(직전 커밋 기준)으로 넓힌다. 네 층·같은 층 유지 우선(WRITE-031), 조각 층은 꺼지는 순간에도 적용(WRITE-032), `children` 항목 층과 조각 층에서 켠 정책이 함께 나가는 하위 트리와 잠복 자손으로 내려감(WRITE-033·034, 03 `log.md` §4의 12행), 선언의 나감의 `extras` 불변(WRITE-034 (라)), 식 값은 커밋 때 적은 직전 커밋의 값(WRITE-038, ADR D3), 식이 던지면 그 선언은 "유지"로 세고 층 규칙은 그대로이며, 사슬 끝의 `EXPRESSION_THREW`와 `degraded`는 그 식을 평가한 정착(형상에 있던 마지막 커밋)의 것이다(28C-05, ERROR-126), `controls.visible: false`는 나감이 아니고 언제나 보존(WRITE-039), `children` 항목의 `controls.active: false`는 노드 게이트의 나감(WRITE-036).
- 조각 `controls` 층의 나감 에지 사례를 새로 쓴다(I23): 조각이 꺼지는 정착에서 그 조각의 `unsetValue`·`derived`·`injectTo`가 평가도 발화도 하지 않음, 조각 층 `unsetOnInactive: true`만 나감 원본을 한 번 비움.
- 완료: G11·G12.

### U7 시나리오와 SCN 부류

- 원장: TEST-011·016·019·023, 25C-08, 26C-02, LANDING-071.
- SCN: I20의 `states` 기대와(필요하면) `resetSubtree` 단계를 `src/types.ts`에 더하고, `src/derive/`·`src/controls/`에 부류 데이터를 둔다. `index.ts`는 `deriveScenarios`·`controlsScenarios`를 이름으로 내보내고, `src/__tests__/families.test.ts`의 부류 목록에 둘을 더한다. 시나리오 이름은 `derive.`·`controls.` 접두다. SCN은 schema-form을 가져오지 않는다.
- 부류에 넣는 상황(부류당 코어 러너 한 파일, 파일당 15건 이하):
  - `derive`: `derived` 에지와 사용자 값 유지, `setValue(getValue())` 무발화와 `FormHandle.reset()` 발화(SETTLE-048), `resetSubtree()`의 `injectTo` 범위(SETTLE-049), `unsetValue`의 로드·런타임 에지, 같은 대상 순위, 양방향 `injectTo`의 `undefined` 멈춤(FRAGMENT-034), 비수렴 쌍의 `degraded`(`exceededBudget: 'derive'`), `DisableAutomaticWrites` 로드.
  - `controls`: 결합 표의 대표 칸(잠금 OR·표시 AND·표준 `readOnly`), `controls.children` 항목의 호스트 기준 식과 값 키 층, 조각 범위 제어, 루트 키 무상속, 나감 정책의 `children` 항목 층·조각 층·식 값, `controls.visible` 보존.
- 코어 러너: `PKG/src/core/__tests__/scenarios/derive.spec.ts`, `PKG/src/core/__tests__/scenarios/controls.spec.ts`. `scenarios/utils/assertCoreScenarioExpectation.ts`가 `states`를 새 게터로 단언하고, `__tests__/scenarios/utils/executeCoreScenarioStep.ts`가 새 단계를 해석한다.
- 완료: G13·G14.

### U8 회귀 이식

- 원장: TEST-069 (라), TEST-060, 03 `log.md` §4의 2·3·9·12–18행.
- 자리: `PKG/src/core/__tests__/regression/<원천>-derive.test.ts`(PR-3 몫)와 `<원천>-controls.test.ts`(PR-6 몫). 원천마다 파일 하나다: `selfcheck-v5-derive`, `r9-derive`, `r9-controls`, `r8-port-derive`, `r9b-derive`, `r7-port-derive`, `edge-cases-derive`, `edge-cases-controls`, `settle-rules-derive`.
- 사례 목록과 수는 §6.1이다. 각 사례는 원천 파일과 줄(`<원천 파일>:<줄>`)을 시험 이름에 한 번만 싣고 주석에는 싣지 않는다(G15가 센다). 이식하며 기대를 바꾼 사례는 원장 ID를 시험 이름에 싣는다. 원천 스크립트는 고치지 않는다.
- 몫이 모호한 사례는 "건드리는 기제가 모두 있는 가장 이른 PR"로 정하고, 그래도 남으면 `log.md` §4에 적는다.
- 완료: G15·G16.

### U9 벤치

- 원장: TEST-071, 18C-50 (다), SETTLE-043, TEST-027, `reviews/round-27-owner-answers.md:7-11`, 28C-06.
- 새 스크립트 `PKG/bench/derive-and-controls.bench.ts`에 두 행을 둔다: `TEST-071-element`(객체 원천 `injectTo`, 원소 1만 개의 터미널 객체와 터미널 배열에서 원소 하나 쓰기의 에지 비교 비용, 원소 크기 두 가지), `TEST-071-whole`(통째 교체의 비교 비용, 전체 크기 두 가지). 03처럼 같은 입력으로 `(cd packages/canard/schema-form && node --import tsx bench/derive-and-controls.bench.ts)`와 `(cd packages/canard/schema-form && /opt/homebrew/bin/bun bench/derive-and-controls.bench.ts)`를 각각 돌린다.
- 보고: TEST-027 절차대로 `ARCH/verification/04-derive-and-controls/performance.md`에 첫 열이 `TEST-071-element`·`TEST-071-whole`인 두 행, 두 엔진의 명령·수치·판정(I17의 선, 28C-06)을 적는다. 계획서 `verification.md`는 고치지 않는다. 03의 `bench/node-and-settle.bench.ts`도 다시 돌려 B5·B6의 04 뒤 값을 `ARCH/verification/03-node-and-settle/performance.md`의 개선 이력 표 아래 기록으로 남긴다(판정 아님, 라운드 27 답 8·11행).
- 실패 처리(28C-06): 참조가 같은 원소에서 내려가지 않는 지름길이 없으면 18C-50·SETTLE-043 기제의 결함이라 고친다(구현이지 최적화가 아님). 지름길이 있는데 선을 넘으면 최적화하지 않고 까닭을 `performance.md`에 적어 소유자 수용을 받는다(27라운드). 다른 느린 수치는 기록만 한다.
- 완료: G17(보고서 행과 명령), G18(판정 또는 소유자 수용, 수동).

### U10 최종 검증과 PR

- 검사: 패키지 unit·render 전체(G19), lint·typecheck(G20), 원장 인용 검사(G21), 작업 트리 깨끗함(G22). storybook은 sandbox 밖에서 소유자가 돌린다(G23, 01–03 선례).
- 독립 `seiri:verify`: 최초 기준선 대 diff. 이어 PR을 연다(`1.0.0-beta` base).
- PLAN §2 7단계: codex와 antigravity가 원장 대 구현을 각각 한 번 대조하고 조율 세션이 지적을 걸러 반영한다.
- PLAN §2 8단계: PR 본문에 `request.md`의 완료 기준과 `verification.md`의 리뷰 체크리스트를 옮겨 각 항목을 닫는다. 규칙마다 상황 목록(§5), 벤치 행 결과, 레거시 이동 목록(이동 0), 미룬 단언의 사례와 PR 번호(I13·I16, §6.2), 원장 어긋남 ID(§2.2)를 적는다.
- PR 뒤: `filid:enrich-docs`, filid 스캔 1회(순환 0, G24), `seiri:request-review`, `seiri:receive-review`, 독립 검증자 판정(G25).

## 5. 게이트 추적표 — 원장이 PR-3·PR-6에 배정한 단언

시험 이름의 태그는 "원장 ID + 짧은 요지"이며 게이트 원장의 CHECK가 그 문자열을 찾는다.

| 원장 | 단언(요지) | 시험 자리 | 단위 |
| --- | --- | --- | --- |
| SETTLE-004·028 | 진 쓰기의 에지 소비, 한 정착에서 한 변화에 한 번만 소비(재발화 금지), 원천이 다른 값으로 다시 바뀌면 새 에지 | `settle/derive/__tests__/`(`SETTLE-004 edge consumed`) | U3 |
| SETTLE-048·046, 18C-102 | `setValue(getValue())`는 `derived` 무발화, `FormHandle.reset()`·마운트는 발화 | `settle/__tests__/`(`SETTLE-048 no fire`, `SETTLE-046 load fires`), 시나리오 `derive` | U3, U7 |
| WRITE-028 | `unsetValue` 로드는 로드된 값으로 평가·같은 정착의 채움으로 참이 되어도 지움, 런타임 거짓→참만, 참→거짓 무동작, 입력은 남음 | `settle/derive/__tests__/`(`WRITE-028 load unset`) | U3 |
| WRITE-029, 18C-51 | 형상 밖 노드의 규칙 무평가, 재탄생은 거짓→참, 비활성 원천의 사라짐은 에지 아님 | `settle/derive/__tests__/`(`WRITE-029 rebirth`) | U3 |
| WRITE-011, CONTROLS-026 | `derived`는 원본을 쓰고 `undefined`면 쓰지 않으며, 사용자 값은 다음 의존 변화까지 남음 | `settle/derive/__tests__/` | U3 |
| 18C-50, SETTLE-043 | `sameValue` (가)의 원시·배열·객체 키 순서·참조 객체, `derived` 의존 집합은 식 경로 ∪ `watch`이고 같은 노드의 다른 식 경로는 에지가 아님 | `settle/derive/__tests__/`(`18C-50 sameValue`) | U3 |
| WRITE-015·097, SURFACE-039, TEST-016 보충 | `DisableAutomaticWrites`가 그 호출의 `derived`·`injectTo`·`unsetValue`를 끄고, Form 속성과 호출 비트의 우선, 뒤 호출에서 다시 발화 | `settle/__tests__/`(`WRITE-015 suppress derive`) | U3, U4 |
| TEST-069 (다), EVENT-020, SETTLE-011 | 파생 라운드 초과: 원본 B, `degraded`·`cause:'budget'`·`exceededBudget:'derive'`·`iterations:25`, 호출 끝 throw, 폼 수준 로드 전까지 유지 | `settle/__tests__/`(`TEST-069 derive budget`) | U3 |
| TEST-016, ERROR-159 보충, LANDING-063, NODE-004, 28C-01 | 개발 모드 정착 기록의 항목(진입·라운드별 규칙·결과 다섯·예산 초과 때 마지막 라운드), 런타임 칸에 마지막 정착 하나(다음 정착이 바꿈), 프로덕션은 칸도 없음, 공개 멤버 없음 | `settle/derive/__tests__/`(`TEST-016 settle trace`, `28C-01 trace slot`) | U3 |
| SETTLE-006, CONTROLS-029, EVENT-066 | `resetInteraction`의 로드·에지 판정, 값 불변, 상태가 바뀐 노드의 `revision` 증가 | `settle/__tests__/`(`SETTLE-006 resetInteraction`) | U3 |
| CONTROLS-029, WRITE-097, EVENT-012, 28C-04 | 억제된 로드에서도 `resetInteraction`이 로드된 값으로 판정해 `dirty`·`touched`를 비움(같은 호출의 `derived`는 쓰이지 않음) | `settle/__tests__/`(`28C-04 suppressed resetInteraction`) | U3 |
| CONTROLS-080, 28C-03 | `@`는 런타임 맥락 칸(없으면 `{}`), 게이트·식·`ctx.context` 모두 같은 값, `extras`를 읽지 않음, 로드는 로드 시점 맥락 | `settle/__tests__/settle.gates.test.ts`(`:72-84`를 다시 쓴 사례)와 `settle/__tests__/settle.context.test.ts`(`28C-03 context slot`) | U3, U4 |
| CONTROLS-080, SURFACE-055, 28C-03·08 | `setContext`가 바뀐 맥락에서 `@` 소유자와 조상을 재계산하고 `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에 에지, `injectTo`는 무발화, 원본은 표시하지 않음 | `settle/__tests__/settle.context.test.ts`(`28C-03 setContext edge`, `28C-03 injectTo no fire`) | U4b |
| CONTROLS-080 (8), 18C-50, 28C-08 | 같은 참조와 깊이 같은 새 객체는 정착 없음(기록 칸·`revision`·`node.context` 참조 불변) | 같은 파일(`28C-08 deep-equal no settle`) | U4b |
| WRITE-015, 28C-08 | `setContext`는 옵션이 없고 Form 속성 `disableAutomaticWrites`가 맥락 에지의 자동 쓰기에 기본값으로 듦 | 같은 파일(`28C-08 form default suppression`) | U4b |
| SURFACE-055, NODE-010, 26C-01, 28C-08 | `node.context`는 맥락 칸의 같은 참조, `setContext`는 `SchemaNode/index.ts`·`src/core/index.ts`에만 이름으로 있음 | `SchemaNode/__tests__/`(`28C-08 context getter`), 키 목록 시험 | U4b |
| SETTLE-004 | 종류 순위, 원천 문서 순서, 층, 조각 전순서, 정착 단위 순위 — 규칙마다 한 상황 | `settle/derive/__tests__/`(`SETTLE-004 kind rank`, `… document order`, `… layer`, `… fragment order`, `… settle unit`) | U4 |
| CONTROLS-079 | `ctx` 여덟 칸, 반환의 `undefined` 항목·`null` 반환, 한 반환 안 같은 대상의 뒤 승, 대상 없음 → `INJECT_TARGET_MISSING`·`cause:'injectTarget'` | `settle/derive/__tests__/`(`CONTROLS-079 ctx`, `CONTROLS-079 undefined entry`, `CONTROLS-079 target missing`) | U4 |
| CONTROLS-053·054, ERROR-124 | 비활성 대상에 잠복 원본으로 쓰고 켜져도 재발화 없음, 비활성 원천은 무평가 | `settle/derive/__tests__/`(`CONTROLS-053 latent target`, `CONTROLS-054 inactive source`) | U4 |
| SETTLE-049 | `resetSubtree()`: 원천이 안이면 대상 재주입(대상이 밖이어도), 밖이면 대상·밖 노드 값 그대로 | `settle/__tests__/`(`SETTLE-049 injectTo scope`), 시나리오 `derive` | U4, U7 |
| VALUE-032, GOAL-063, LANDING-166 | 사용자가 일으킨 `injectTo`도 null 조상을 객체로 만들지 않음 | `settle/derive/__tests__/`(`VALUE-032 null ancestor`) | U4 |
| ERROR-195 | 가상 노드에 모양이 틀린 자동 쓰기 → 후보 제외, `cause:'writeShape'`, 호출 끝 throw | `settle/derive/__tests__/`(`ERROR-195 writeShape`) | U4 |
| ERROR-122·132·070 | 파생 규칙 식·`injectTo` throw → 후보 제외·에지 소비·`cause:'expression'`, 커밋 뒤 throw | `settle/derive/__tests__/` | U3, U4 |
| FRAGMENT-034, LANDING-030 | 양방향 주입은 `undefined` 반환으로 멈춤, 자동 차단 없이 예산이 잡음 | `settle/derive/__tests__/`, 회귀 `r9-derive`(P7) | U4, U8 |
| TEST-077 | `derived`·`injectTo`가 유효 union 목록을 지나 쓰임 | `behaviors/unionBehavior/__tests__/union.write-paths.test.ts` | U4 |
| CONTROLS-082·046, SCHEMA-010 | 결합 표의 모든 칸(잠금 OR·표시 AND), 순서·자리 무관, 한 자리의 `false`가 다른 자리의 잠금을 풀지 않음 | `settle/__tests__/settle.controls.test.ts`(`CONTROLS-082 readOnly OR`, `… disabled OR`, `… visible AND`) | U5 |
| CONTROLS-082, FRAGMENT-033 | 표준 `readOnly`와 `controls.readOnly`의 합 | 같은 파일(`CONTROLS-082 standard readOnly`) | U5 |
| CONTROLS-073 (6) | `children` 항목의 식은 호스트 기준, 항목마다 한 번 평가되어 모든 대상에 같은 값 | 같은 파일(`CONTROLS-073 children item expression`) | U5 |
| CONTROLS-042·077 | 조각 범위 제어는 조각이 켜진 동안 그 조각이 직접 선언한 직계 자식에만 | 같은 파일(`CONTROLS-042 fragment scope`) | U5 |
| CONTROLS-045, GOAL-048 | 루트 스키마 키의 무상속 | 같은 파일(`CONTROLS-045 no root inheritance`) | U5 |
| ERROR-122 | 상태 키 식 throw → 그 선언은 없는 것, `degraded` | 같은 파일(`ERROR-122 state key throw`) | U5 |
| CONTROLS-083 (1) | 잠긴 노드에도 `setValue`·자동 쓰기가 적용됨 | 같은 파일(`CONTROLS-083 locked writes`) | U5 |
| LANDING-066, CONTROLS-022·023·082, 26C-01, 28C-02·07·08 | 겉면 멤버 여섯(게터 다섯과 `context`)의 멤버 표·멤버 목록 시험·공개 형, `enabled = active && visible`이고 `disabled`와 무관 | `SchemaNode/__tests__/surface.test.ts`(`26C-01 PR-6 member list`, `28C-02 enabled`) | U4b, U5 |
| NODE-044, 26C-08·10, 28C-02 | 떼어진 노드의 `visible`·`readOnly`·`disabled`는 떼어질 때 잡은 동결 값, `enabled`는 거짓 | `settle/__tests__/`(`28C-02 detached frozen`) | U5 |
| CONTROLS-032·080, LANDING-066, 28C-07 | `watchValues`는 유효 스키마의 `controls.watch`(나중 승) 경로를 방출 트리에서 읽은 배열, 같은 커밋에서 같은 참조 | `settle/__tests__/settle.controls.test.ts`(`28C-07 watchValues`) | U5 |
| LANDING-137, 28C-07 | `omitEmpty` 아래 빈 문자열을 `watchValues`가 `undefined`로 읽음 | 같은 파일(`LANDING-137 watchValues omitEmpty`) | U5 |
| WRITE-031, CONTROLS-040 | 네 층마다 한 상황과 같은 층의 유지 우선 | `settle/__tests__/settle.exit-layers.test.ts`(`WRITE-031 node layer`, `… children layer`, `… fragment layer`, `… form layer`, `… same-layer keep`) | U6 |
| WRITE-032 | 직전 커밋의 선언으로 정하고 조각 층은 꺼지는 순간에도 적용 | 같은 파일(`WRITE-032 fragment turning off`) | U6 |
| WRITE-033·034, TEST-019 보충 | `children` 항목 층·조각 층에서 하위 트리·잠복 자손으로 내려감, 선언의 나감의 `extras` 불변 | 같은 파일(`WRITE-033 children subtree`, `WRITE-034 fragment latent`) | U6 |
| WRITE-038 | 식 값은 직전 커밋의 값(나감을 일으킨 변화를 보지 않음) | 같은 파일(`WRITE-038 previous commit`) | U6 |
| ERROR-122·125·126, WRITE-031, CONTROLS-024, 28C-05 | 던진 `unsetOnInactive` 식의 선언은 "유지"(아래 층의 비움을 덮음), 그 식을 평가한 정착의 사슬 끝 `EXPRESSION_THREW`와 `degraded` | 같은 파일(`28C-05 throw keeps`) | U6 |
| WRITE-039·036 | `controls.visible: false`는 보존, `children` 항목 `active: false`는 노드 게이트의 나감 | 같은 파일(`WRITE-039 visible preserved`) | U6 |
| FRAGMENT-050, 18C-51 | 나감은 조각 규칙의 에지가 아님, 새로 들인 노드만 거짓→참, 앞 라운드 파생 쓰기 유지 | 같은 파일(`FRAGMENT-050 exit not edge`) | U6 |
| CONTROLS-077·073 (7) | 값 키의 층(조각 < 항목 < 노드), 채움 순위, 같은 층 나중 승 | `settle/__tests__/`(`CONTROLS-077 fragment default`, `CONTROLS-073 value layer`) | U6 |
| TEST-019 | 상태 키·`controls.children`·조각 `controls`·`unsetOnInactive` 층의 코어 시나리오 | `src/core/__tests__/scenarios/controls.spec.ts` | U7 |
| TEST-016 | 같은 대상 규칙·에지 소비·억제·로드 발화의 코어 시나리오 | `src/core/__tests__/scenarios/derive.spec.ts` | U7 |
| TEST-069 (라) | 04 몫 회귀 이식(§6.1) | `src/core/__tests__/regression/*-derive.test.ts`, `*-controls.test.ts` | U8 |
| TEST-071, 18C-50 (다), SETTLE-043, 28C-06 | 한 원소 쓰기의 비교 비용이 바뀌지 않은 원소들의 깊은 크기와 무관(참조 비교 O(N)은 허용), 통째 교체는 새 값 크기에 선형 | `bench/derive-and-controls.bench.ts`, `verification/04-derive-and-controls/performance.md` | U9 |

## 6. 회귀 이식과 넘기는 사례

### 6.1 04 몫(TEST-069 (라), 파일 기준 — 03 I9·I14)

모든 원천 경로는 `ARCH/spikes/` 아래다. 수는 원천의 `eq`·`check` 호출과 반복 횟수(또는 03처럼 프로브·관찰 사례 수)로 센 값이며(2026-09-30), G15가 시험 이름의 `<원천 파일>:` 태그로 센다. 기대값은 `round18/proto/REPORT-v7.md`의 기대 치환을 따른다.

| 원천 | 04로 옮기는 것 | 수(PR-3 / PR-6) | 기대값과 넘기는 것 |
| --- | --- | --- | --- |
| `round9/regress/selfcheck-v5.mjs` | 무리 a의 주입 단언 A4a(`:274`), A4b(`:285`), A4c(`:297`), A4-cap(`:493`), A6-automatic(`:504`)과 무리 f(`:651`·`:653`·`:655`·`:657`) | 9 / 0 | A4a는 원본 B `{t:0,u:0}`로 emit = raw, `iterations` 25. A4b는 v7 치환대로 `stable`, `t='from-C'`, 중간 `c` 채움만 철회(FRAGMENT-050). A4c·A4-cap은 에지 모드 기대(원천이 안 바뀌면 무발화, 같은 값 쓰기는 한 라운드). A6-automatic은 호스트 null 유지(VALUE-032). f는 Form 속성 억제(WRITE-015) |
| `round9/r9.mjs` | P2 `unsetValue` 6(`:50`–`:63`), P5 같은 대상 4(`:128`·`:129`·`:132`·`:134`), P6 억제 12(`:151`–`:165`), P7 예산 5(`:176`–`:180`); P4 상태 키 `and-or` 8(`:104`–`:115`) | 27 / 8 | P5의 네 스위치 조합은 제품에서 한 사례라 접는다(16 → 4), 기대는 언제나 `D:1`(SETTLE-004). P7은 `base`·상한 25만(30 → 5): `degraded`·`exceededBudget:'derive'`·`iterations:25`, 원본 B `{a:0,b:0}`. P6의 `&default` 식 기본값은 `controls.default` 값으로 옮긴다(CONTROLS-018). P4 `nearest` 8은 이식하지 않는다(CONTROLS-082, I14). P1·P3는 03에서 이식함 |
| `round9/regress/r8-port.mjs`(관찰) | P1 `derived` 에지 8사례(i, ii, iii의 seq·seqRev, iv의 `load_a1`·`load_a1_dMine`, fn, idem), P2 로드의 `injectTo` 10사례(X3L, replace 넷, idem 넷, idemDefault), P4 X16·X16_noDefault 2사례 | 20 / 0 | 현행 구성(`edge`/`fire`/`value`, FINAL_SHAPE 켬, P2는 `fire`, P4는 `base`/상한 25)의 관찰 값을 `round9/regress/r8port-output.txt`에서 읽어 단언한다. X16 둘은 v7 치환대로 `raw=emit={t:'from-C'}`, 활성 조각 없음, `stable`. P1 iii의 `batch` 두 변형 → 05(I16). P3·P5와 P4의 N1·N9 등은 03에서 이식함 |
| `round9/r9b.mjs` | `final-shape-after-derived`(`:102`, 5검사), `final-shape-after-fill-dependency`(`:115`, 4검사), `final-shape-preserves-caller-raw`(`:127`, 3검사), `final-shape-feedback-budget`(`:137`, 4검사) | 4프로브(16검사) / 0 | 마지막 프로브는 v7 치환대로 `stable`, `t='from-C'`, 생김은 `/`와 `/t`뿐, 4라운드(FRAGMENT-050) |
| `round9/regress/r7-port.mjs`(관찰) | E3의 seq, X3c의 seq(`EDGE_REF=commit`), X3L(`LOAD_EDGE=fire`), X15, X16, XA4 = 6사례 | 6 / 0 | 현행 모드 관찰 값(`round9/regress/r7port-new-output.txt:13-82`). X15는 v7 치환대로 3라운드, X16은 `stable`·`t='from-C'`, XA4의 `write1`은 `degraded`·`exceededBudget:'derive'`·원본 B `{n:1}`. E3·X3c의 `batch` 변형 → 05(I16), X3L의 skip·fill·ref와 X16의 entry-scope는 이식하지 않는다(I14) |
| `round9/regress/edge-cases.mjs` | `clearValue` 자기 의존 4(`:12`·`:13` × 초기값 둘), 객체 비움 2(`:31`·`:32`), 자동 덮어쓰기 1(`:40`), 단계 순서 2(`:57` × 둘), 파생 예산 3(`:76` throw, `:77`, `:78`); 잠금 결합 `:49`, `:66`·`:67`의 `and-or` | 12 / 3 | 단계 순서 둘은 v7 치환대로 언제나 `undefined`(SETTLE-004의 `unsetValue` > `derived`). 파생 예산은 모든 환경에서 던짐(ERROR-070). `:66`·`:67`은 I15의 현행 기대(`readOnly` 참, `disabled` 거짓). `nearest` 둘은 이식하지 않는다 |
| `round18/proto/__tests__/settleRules.test.mjs` | 같은 순위 동점 `:15`, 정착 단위 순위 `:25`, 층·조각 순서 동점 `:36`(세 규칙 쌍), 나감 에지 `:59` | 4 / 0 | `:59`는 `batch` 대신 루트 `setValue(V)` 한 번(I16). 조각 `controls` 층의 나감 에지 사례는 v7에 없어 U6이 새로 쓴다(I23) |
| 합계 | | 82 / 11 | 03 `log.md` §4 앞머리 목록은 04로 넘긴 사례가 없다(`round9/r9.mjs:76`·`:80`, `round9/regress/selfcheck-v5.mjs:348` → 05, `round9/regress/selfcheck-v5.mjs:519` → 06, 배치 억제 → 05) |

03 `log.md` §4의 넘김 행과 이 표의 대응: 2행 → selfcheck a의 다섯, 3행 → r9 P4, 9행 → U3·U4의 SETTLE-048·049 시험과 시나리오 `derive`, 12행 → U6의 나감 층 시험과 시나리오 `controls`, 13행 → r9b 넷과 r7 여섯, 14행 → selfcheck a 다섯과 f 넷, 15행 → r9 P2·P5·P6·P7·P4, 16행 → r8 P1·P2·P4, 17행 → edge-cases 12와 잠금 결합, 18행 → settleRules 넷. 12행의 `round18/proto/__tests__/rootOutput.test.mjs` 사례는 05·06의 몫이라 여기 없다.

### 6.2 04에서 다시 넘기는 사례

| 사례 | 까닭 | 받는 단계 |
| --- | --- | --- |
| `round9/regress/r8-port.mjs` P1 iii의 `batch` 두 변형, `round9/regress/r7-port.mjs` E3·X3c의 `batch` 변형 | `batch`는 PR-4의 기제(LANDING-064) | 05 |
| `injectTo` 함수 안의 공개 쓰기(되먹임 예산) | 진입 사슬·되먹임 예산은 PR-4(CONTROLS-079, I13) | 05 |
| `resetInteraction`이 바꾼 노드의 배달, `UpdateValue`의 출처 칸 | 배달은 PR-4(EVENT-060·066) | 05 |
| 배열 원천·대상의 `injectTo`, 원본 B의 배열 구조 기록 | 배열 행은 PR-5(LANDING-065) | 06 |
| 실효 잠금(Form 속성 OR)과 `handleChange`의 입력 버림, `FormProvider` 맥락과 Form 속성 `context`를 병합해 `setContext`를 부르는 바인딩 | 렌더 계층·바인딩(CONTROLS-083 (2), SURFACE-055, 28C-03) | 07 |
| `FormTypeInputProps.watchValues` 전달, `FormTypeInputProps.context` | 렌더 계층(CONTROLS-032, SURFACE-055, 28C-07·08) | 07 |
| 계산 상태 비트(`watchValues` 포함)의 배달 | 배달은 PR-4(EVENT-064, 28C-07) | 05 |

## 7. 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 파생 단계를 전이 루프 안에 넣으며 03의 원본 B·전이 상한·나감 판정이 깨짐 | U3은 03 정착 시험 전체를 매 커밋 돌린다(G5). 파생 쓰기를 되돌림 기록에 넣는 순서(파생 → 채움 철회)를 DETAIL에 먼저 적는다 |
| 규칙이 없는 폼의 쓰기에 파생 단계 비용이 붙어 03 B5가 떨어짐 | 규칙 없는 청사진은 단계를 건너뛴다(U3). U9에서 B5·B6을 다시 재어 기록한다 |
| 03의 `@` 읽기를 고치며 PR-2 게이트 동작이 바뀜(`@` 게이트의 평가 호스트, 재계산 소유자) | 28C-03 (2)대로 고치고 03 이탈로 `log.md` §4에 적는다. `settle/__tests__/settle.gates.test.ts`의 `@` 사례를 맥락 칸 기준으로 다시 확인하고, `settle/utils/gates/getGateRegistry.ts:155`의 `@` → 호스트 대응을 `@` 소유자 목록(U4b)으로 옮긴 뒤 03 정착 시험 전체를 돌린다(G5·G26) |
| `src/core/index.ts`가 `./SchemaNode`를 가져오며 07 전에 새 엔진 코드가 공개 번들에 끌려옴(크기 증가, 두 엔진 공존) | `src/index.ts`는 이름을 골라 가져오고 패키지가 `sideEffects: false`라 트리 셰이킹을 기대하지만 가정으로 두지 않는다. U4b 끝에 번들만 다시 만들어 새 엔진에만 있는 이름이 dist에 없음을 확인한다(G30). 끌려오면 `SchemaNode/` 모듈의 최상위 부수 효과를 찾아 없애고, 그래도 남으면 조율 세션이 원장 관리 세션에 묻는다 |
| `sameValue`를 넓히며 03 커밋의 참조 유지가 바뀜 | I22대로 넓힌 뒤 03 시험이 초록이 아니면 derive 안에 따로 둔다 |
| 층 해석이 상태 키·채움·나감에서 서로 다르게 구현됨 | 층 해석을 `settle/utils/controls/` 한 곳에 두고 세 소비자가 같은 함수를 부른다(ADR D5) |
| 형 수준 순환(derive ↔ `settle/type.ts`) | §3.2의 금지 목록을 `__tests__/dependencyDirection.test.ts`로 매 실행 단언한다 |
| 회귀 기대가 현행 원장과 어긋난 채 이식됨 | REPORT-v7의 치환과 I14·I15를 따르고, 바꾼 사례는 원장 ID를 시험 이름에 싣는다. antigravity가 분류를 확인한다 |
| storybook이 sandbox 안에서 안 뜸 | 01–03 선례대로 unit·render는 여기서, storybook은 소유자가 sandbox 밖에서 돌린다 |

## 8. 검증 명령(저장소 루트)

03 §8의 명령을 그대로 쓴다(2026-09-30 확인: vitest 프로젝트 `unit`·`render`·`storybook`, `ledger/checks/plan-links.mjs`, `/opt/homebrew/bin/bun`, `@aileron/benchmark-form`의 `guard:check`가 있다).

- 단위 범위: `(cd packages/canard/schema-form && npx vitest run --project unit <경로>)`
- 패키지 unit·render: `(cd packages/canard/schema-form && npx vitest run --project unit --project render)`
- lint·typecheck: `(cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json)`
- SCN: `(cd packages/aileron/schema-form-scenarios && npx vitest run --config vite.config.ts && npx tsc --noEmit --strict --composite false -p tsconfig.json && npx eslint index.ts "src/**/*.{ts,tsx}")`
- 원장 인용: `(cd packages/canard/schema-form/architecture && node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md | tail -1)`
- 04 벤치: `(cd packages/canard/schema-form && node --import tsx bench/derive-and-controls.bench.ts)` 및 `(cd packages/canard/schema-form && /opt/homebrew/bin/bun bench/derive-and-controls.bench.ts)`
- 03 벤치 기록 재측정: `(cd packages/canard/schema-form && node --import tsx bench/node-and-settle.bench.ts)` 및 `(cd packages/canard/schema-form && /opt/homebrew/bin/bun bench/node-and-settle.bench.ts)`
- 공개 `<Form>` 가드: `yarn workspace @aileron/benchmark-form guard:check`(단독 호출)

## 9. 리뷰 기록

| 날짜 | 리뷰 | 판정 | 반영 |
| --- | --- | --- | --- |
| 2026-09-30 | 1차 독립 검토(antigravity, 세션 `0c589e67`) | `cleared` → 조율 세션 **기각** | 근거로 든 경로 여섯 가운데 다섯이 저장소에 없어 판정을 받지 않음(`log.md` §2). 근거 인용을 의무로 한 2차 검토를 요청 |
| 2026-09-30 | 2차 독립 검토(antigravity, 세션 `dd51aa1d`) | `cleared` | 현재 상태 주장 24건을 명령 출력으로 확인. 낮음 지적 둘(경로 표기 생략)을 전체 경로로 고침. 커버리지·원장 대조는 근거가 없어 범위 한정 재검토로 넘김 |
| 2026-09-30 | 범위 한정 재검토(같은 세션, 28라운드 `754169d05` 반영판) | `cleared` | 원장 항목·검증 게이트·28C-01~08·03 넘김 36행의 단위·시험 자리, I2·I3·I5·I6·I7·I27·D9의 원장 원문 대조(모순 0), G27·G30의 판정 가능성 확인. 새 지적 0. 검토자가 G30의 빌드를 실제로 돌려 추적하지 않는 `dist`를 다시 만들었음(무해, 기록) |
