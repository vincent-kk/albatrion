# 05 통지와 검증 — 실행 계획

Planning method: 저장소 지침 — PLAN.md §2와 plan/prompts.md의 단계 실행 절차; 단위의 단계·명령·기대 결과는 seiri write-plan 불변식.

구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-dispatch-and-validation/gates.md`, 진행과 어긋남은 [log.md](log.md)에 적는다. 최초 작업 기준선(원문 경로·리비전·해시, 목표·비목표)은 `log.md` §1이며 이 계획은 그 기준선을 다시 쓰지 않는다.

정본의 순서: 원장 `ledger/<area>.md`(`상태: 현행` 항목의 결정·보충·충돌 줄) > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 이 계획. 이 계획이 원장과 다르게 읽히면 원장대로 간다. 원장 관리 세션이 질의 Q1–Q7에 답했고 31라운드 편집자 기록 31C-01~05로 적는다(커밋 해시는 원장 관리 세션이 붙인 뒤 `log.md` §2에 적는다). 이 계획은 그 답을 반영했다(§2.3).

경로 약어: `PKG` = `packages/canard/schema-form`, `ARCH` = `PKG/architecture`, `SCN` = `packages/aileron/schema-form-scenarios`, `P6`·`P7`·`P8` = `packages/canard/schema-form-ajv6-plugin`·`…-ajv7-plugin`·`…-ajv8-plugin`. 단계 번호와 원장 PR 번호는 04 = PR-3 + PR-6, 05 = PR-4, 06 = PR-5, 07 = PR-7이다(LANDING-204). "→ 0n"은 단계 번호다.

## 1. 목표와 완료 기준

목표: 루트 디스패처와 진입 사슬, `batch`, 진입당 `onChange` 1회, 명령 메서드 `request(kind)`, `onError`의 core 쪽(기록 형·코드 형·보고기·사슬 끝 전달·묶음·전달 중 쓰기 거부·경고 구조 키), 검증기 계약(`compileGuard`·`rejectedKey`·선택 `release`·`bind` 거부)과 사본·가드 캐시, 검증 실행(커밋 번호 스탬프·합치기·에러 라우팅·검증 불가·실행 실패), ajv6·7·8 플러그인 구현, 상태·오류·명령 사건과 검증 결과의 배달 경로를 세운다(LANDING-064·084·093·206). 새 엔진은 07까지 `<Form>`에 닿지 않으므로 옛 시험 전체가 회귀 신호이고, React 바인딩은 훅 수준에서만 시험한다(LANDING-159, `verification.md` 검증 원칙).

| 완료 기준(`request.md`) | 단위 | 관찰할 증거 |
| --- | --- | --- |
| `src/core/dispatch/`·`src/core/validation/`과 문서, `app/plugin/type.ts` 개정 | U2, U3, U4, U5a, U5b, U6, U7, U8 | 문서 선행 커밋(G3), 경계 린트 목록(G4), 디스패처·검증 시험 초록(G13–G24), 의존 방향 시험(G12) |
| 명령 메서드 하나(소유자가 정한 이름·형)와 멤버 목록 시험(`FormHandle` 쪽은 07) | U6, U9 | `request(kind)`·`SchemaNodeRequestType` 시험(G17·G18), 멤버 표·멤버 목록 시험·공개 형(G25) |
| `onError` core 쪽과 코드 표 상수(ERROR-164), `TYPE_MISMATCH` | U3, U5b | 코드 표 기계 대조 시험(G7), 보고기 시험 태그(G15·G16) |
| 검증기 계약과 ajv6·7·8 구현, `bind` 거부 | U3, U7, U11a, U11b, U11c | 플러그인 계약 게이트 넷·`bind-refusal`·`union-types`(G30–G35) |
| 차등 테스트와 훅 수준 바인딩 시험 초록, `verification.md`의 게이트 전부 | U12, U13, U14, U15, U16a, U16b | 차등 스위트(G37), 회귀·시나리오(G38·G39), 훅 시험(G40), 벤치 행(G41–G43), 06 통합(G44–G46), 최종 게이트(G47–G54) |

비목표(원장 ID와 함께):

- 렌더 계층의 `onError`(Form 속성, 바깥 감싸개, 바운더리, `componentStack`, 로드 기록의 준비 이펙트 전달, 네이티브 submit의 오류 층 거부)와 명령의 실행(`DeferrableNodeProxy`의 재발행 통로 포함)은 07이다(ERROR-032의 PR-7 줄, EVENT-063, 31C-01).
- `FormHandle`의 명령 넷(`focus`·`select`·`refresh`·`remount`, 경로 선택 인자)과 `FormHandle.batch`는 07이다(EVENT-073 30라운드 보충, SURFACE-008, REACT-025).
- 바인딩의 검증기 선택(Form 속성 > `FormProvider` > 플러그인)을 새 엔진 트리 생성 인자로 넘기는 것, 검증기 참조가 바뀌면 재생성하는 것, 참조 세기의 증감을 부르는 커밋 이펙트는 07이다(VALIDATE-044 (2)(3), CONTROLS-075). 05는 core가 받는 인자와 증감 함수까지다.
- 마운트 정착 동안 `onChange`·`onDiagnosticsChange` 가리기, `handleChange`를 `batch` 하나로 묶기, 유효 스키마 따라가기, `useChildNodeErrors` 재구현은 07이다(REACT-007·011·012, LANDING-170).
- 공개 `NodeEventType` → `SchemaNodeEventType`의 소비자 이주(`src/index.ts`, `components/`, `providers/`, `hooks/`)는 07이다(LANDING-158, SURFACE-056 "소비자 이주는 PR-7"). 05는 새 엔진의 형을 새 이름으로 처음부터 만든다(I3).
- `degraded` 동안의 제출 거부와 그 시험(`SUBMIT_WHILE_DEGRADED`)은 07이다(TEST-069 (다)의 PR-7 줄, ERROR-138). 05는 코드 표에 그 행을 둔다.
- UI 플러그인 넷의 `presentation.*` 이주는 플러그인 PR이다(LANDING-070 충돌 줄, LANDING-206). ajv 셋은 05다.
- 코드 표 문서와 이주 안내, README 사용 규칙은 08이다(ERROR-032의 PR-8 줄, ERROR-031).
- 배열 메서드(`push`·`pop`·`update`·`remove`·`clear`)는 06의 기제다. 그 `dispatch` 진입 파일은 05·06 가운데 뒤에 머지하는 단계가 더한다(33C-01): 06이 뒤면 06이, 05가 뒤면 05의 U16a가 둔다.
- 성능 최적화. 벤치는 재고 보고만 하고, 새로 느린 것은 `ARCH/verification/performance-issues.md` "열림"에 행을 더한다(`reviews/round-27-owner-answers.md:11`). 계약을 어기는 비용(정착 범위 밖 순회, SETTLE-017)은 최적화가 아니라 결함이라 고친다.

## 2. 해석과 자율 결정

원장으로 답이 정해지는 것은 여기서 닫는다. Q1–Q7은 31C-01~05로 닫혔다(Q6은 답이 바뀌었다). O1·O3은 32C-01·02로, O2는 33C-01로, Q8은 34C-01로 닫혔고 F1의 별칭 유지는 34C-02가 확인했다. 열린 원장 질문은 없다(§2.3).

### 2.1 해석 표

| # | 물음 | 채택한 해석 | 근거 | 상태 |
| --- | --- | --- | --- | --- |
| I1 | 진입 사슬의 순서와 깊이 | 진입은 같은 루트의 다른 공개 쓰기가 스택에 없을 때의 공개 쓰기 호출 하나다(`setValue`·`resetSubtree`·폼 수준 reset·마운트 로드·`batch`, 06 뒤 배열 동사). 읽기·`subscribe`·상태 칸 쓰기·명령은 진입이 아니다. 루트 런타임의 진입 깊이가 1 → 0이 될 때 순서는 커밋(이미 끝남) → 통지 파동(되먹임 파동 포함) → 검증 요청 → `onChange` → 사슬 끝 기록마다 `onError` → throw다. 리스너·사용자 함수 안의 공개 쓰기는 깊이 ≥ 2의 같은 사슬이고 그 정착은 동기로 커밋하며 통지는 현재 파동 뒤 다음 파동이다. `onChange` 안의 쓰기는 깊이 0에서 새 진입이다 | EVENT-008·027·033, ERROR-004·019, 31C-01 | 닫힘 |
| I2 | 예산 | 되먹임 파동 25(최외곽 사슬마다, 깊이 1 → 0에서 초기화)와 `onChange` 중첩 25다. 넘어도 커밋 → 검증 요청 → `onChange`(중첩 초과분만 건너뜀)를 지키고, 사슬 끝에서 모든 환경에 `FEEDBACK_LIMIT_EXCEEDED`를 던진다. `diagnostics`에 적지 않는다. `injectTo` 함수 안의 공개 쓰기(04 I13)는 리스너 되먹임과 같은 안쪽 진입이며 같은 예산을 쓴다 | EVENT-008·020·021·022·034, CONTROLS-079, 04 `execution-plan.md` I13 | 닫힘 |
| I3 | `SchemaNodeEventType` 개명의 몫 | 새 엔진의 이벤트 비트 열거는 처음부터 `SchemaNodeEventType`이다(안쪽·공개 한 이름, 별칭 없음). 공개 형이 PR마다 자라는 규칙에 따라 `subscribe`를 들이는 05가 만든다. 옛 `core/types/event.ts`의 `NodeEventType`·`PublicNodeEventType`과 그 소비자(`src/index.ts:44`, `components/`, `providers/`, `hooks/`)는 07의 이주까지 그대로다. 요청 비트·`UpdateValue`·`UpdatePath`·`UpdateState`·`UpdateError` 등 남는 비트의 값은 옛 열거와 같은 자리로 두어 07의 이주가 비트 변환 없이 이름만 바꾸게 한다. `RequestEmitChange`·`RequestInjection`은 두지 않는다 | SURFACE-056(`ledger/surface.md:883`), SURFACE-060, LANDING-158·170, `reviews/round-26-closing.md:16` | 닫힘 |
| I4 | 명령 메서드 | `request(kind: SchemaNodeRequestType): void` 하나. `SchemaNodeRequestType`은 공개 TS 열거이고 멤버 `Focus`·`Select`·`Refresh`·`Remount`의 값은 `SchemaNodeEventType.RequestFocus`·`RequestSelect`·`RequestRefresh`·`RequestRemount`다. 한 호출에 종류 하나, 둘째 인자 없음, OR 한 입력은 받지 않는다(열거 밖 값은 무동작이 아니라 개발 모드 경고 없이 무시 — 형이 막는다). 원본을 쓰지 않고 요청 비트만 낸다. 진입이 아니다: 깊이 > 0이면 대기열에 비트를 합쳐 깊이가 0이 될 때 한 번 배달하고, 깊이 0이면 호출 안에서 동기로 배달한다. 검증 요청·`onChange`는 없다. 떼어진 노드에서는 무동작이다 | EVENT-063·073(30라운드 보충), SURFACE-058, NODE-044, 31C-01, `reviews/round-30-owner-answers.md:7-10` | 닫힘 |
| I5 | 05가 겉면에 더하는 멤버 | 기제를 들여오는 PR이 멤버를 든다(26C-01). 05: `request`, `subscribe`, `revision(mask?)`, `validate`, `errors`, `setExternalErrors`, `clearExternalErrors`, `state`, `setState`, `globalState`, `globalErrors`, `setSubtreeState`, `clearSubtreeState`, `batch`. 모두 한 문장 위임이다(NODE-010). `setValue`·`resetSubtree`의 위임은 settle에서 dispatch 진입으로 옮긴다 | `reviews/round-26-closing.md:11-12`, `reviews/raw-round17-node-structure.md:136`, SURFACE-053, SURFACE-008, EVENT-001, LANDING-064 | 닫힘 |
| I6 | `revision`이 레코드 필드와 겉면 메서드로 겹침 | 03의 레코드 필드 `revision: number`(커밋마다 바뀐 노드 +1)는 겉면 메서드 `revision(mask?)`(비트별 배달 원장의 합, 리스너 유무와 무관한 단조 카운터)와 이름이 겹친다. 레코드 필드를 비트별 원장 칸(가칭 `revisionLedger`)으로 바꾸고, 커밋이 배달 집합 전체의 해당 비트를 한 번에 올린다. `revision(mask)`는 dispatch의 읽기 함수에 한 문장으로 위임한다. 03·04 시험의 `node.revision` 단언 8파일은 `node.revision(…)`으로 옮긴다 | EVENT-001·004·007, LANDING-084(비트별 배달 원장 개념), REACT-006, ADR D3 | 자율 결정 |
| I7 | 배달 집합과 비트를 누가 정하는가 | 정착의 커밋이 노드마다 이번 정착의 비트(값·경로·자식 형상·유효 스키마 `UpdateJsonSchema`·계산 상태 `UpdateComputedProperties`(`watchValues` 포함)·상호작용 상태(`resetInteraction`)·`RequestRefresh` 대상·루트 `UpdateDiagnostics`·활성 변화)와 그 페이로드를 `record/`의 표시 함수로 적고, dispatch가 그 집합을 문서 순서 위→아래로 한 번 순회해 배달한다. 노드는 일정을 잡지 않는다 | EVENT-004·006·007·043·064·066·071, SETTLE-007, 28C-07, ADR D3 | 닫힘 |
| I8 | 상태·외부 오류·명령 사건 | 정착 밖 사건이다. 같은 루트 디스패처가 같은 비트 공간으로 배달한다: 깊이 > 0이면 노드마다 비트를 합쳐 대기했다가 깊이가 0이 될 때 한 번, 깊이 0이면 호출 안에서 동기로. `setState`의 `dirty`·`touched` 변경은 `UpdateState`, 같은 진입의 두 경로는 한 번, `onStateChange`는 최외곽 진입 끝에 한 번. 외부 오류는 `UpdateError`. 셋 다 검증 요청·`onChange`를 내지 않는다. 전달 중(`onError` 핸들러 안) 쓰기 거부의 대상이다 | EVENT-012·045·067, ERROR-029, 31C-01 | 닫힘 |
| I9 | 보고기와 소비자 조건 | core는 트리 생성 인자로 보고기 `{ report(record): void; hasConsumer(): boolean }`(가칭 `FormErrorReporter`)를 받아 런타임에 둔다. 사건마다 `hasConsumer()`를 먼저 묻는다. 바인딩의 판정은 "핸들러가 있거나 `NODE_ENV !== 'production'`"이다(07이 Form 속성으로 만든다). 05의 시험은 보고기를 직접 넘긴다. 같은 사건은 모든 환경에서 같은 `code`·`level`·`details`·`surface`이고, 프로덕션에서도 핸들러가 있으면 경고를 받는다. `RESET_REBUILT_BY_REFERENCE`·`MULTIPLE_GATED_BRANCHES_ACTIVE`는 `hasConsumer()`일 때만 판정한다. 개발 모드 전용 예외는 `NON_JSON_WHOLE_VALUE` 깊이 점검 하나이며 `hasConsumer`가 아니라 `NODE_ENV`로 판정한다 | ERROR-013·021·030·196, WRITE-099, 31C-02 | 닫힘(31C-02) |
| I10 | 가드 | 가드 표는 core가 (검증기 인스턴스, 작성 루트 객체 정체)마다 한 항목에 사본·가드 표·전체 검증 함수(또는 그 실패)와 함께 든다. 가드 키는 작성 루트 안의 자리다. 프로덕션은 처음 필요할 때 컴파일하고, 개발 모드는 캐시 항목마다 한 번 모든 가드를 미리 컴파일한다. 실패는 캐시에 남고, 그 항목을 쓰는 폼 인스턴스마다 자기 `GUARD_FAILED`를 기록한다. 시점: 개발 모드는 마운트 커밋 뒤(`surface: 'sink'`), 프로덕션은 그 가드를 처음 평가한 사슬 끝(`'thrown'`), 평가되지 않은 가드는 기록하지 않는다. 컴파일 실패·던짐·boolean 아닌 값은 그 게이트의 가드 실패(게이트 거짓, 정착 오류)다 | VALIDATE-018·044 (4)·047·048, ERROR-041·164(`GUARD_FAILED` 행), 31C-03·Q5 답 | 닫힘(Q5 답) |
| I11 | 검증기가 없을 때 | 고른 결과가 없음이고 모드가 `None`이 아니면 거부하지 않고 검증 없이 간다. 트리마다 한 번 `VALIDATOR_MISSING` 경고(같은 스키마 reset·`setValue(V)`로 다시 내지 않음). `if` 게이트가 있으면 그 조각은 꺼지고 `CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR` 경고를 트리마다 한 번 | ERROR-146–151·153·154, W-01·W-02(검증 문서) | 닫힘 |
| I12 | 시험 대역의 정리 | `runtime.ifPredicates`와 `src/core/__tests__/ifPredicate.ts`를 없앤다. 03·04 시험은 실제 검증기 계약을 구현한 시험용 검증기(`PKG`의 개발 의존 `ajv` 8로 `compile`·`compileGuard`를 구현, 옛 `src/__legacy__/core/__tests__/utils/createValidatorFactory.ts`와 같은 자리 개념)를 트리 생성 인자로 넘기고, `if: {}`에 술어로 뜻을 주던 사례는 `if`에 같은 뜻의 스키마(`{ properties: { enabled: { const: true } }, required: ['enabled'] }`)를 적는다. 던지는 가드와 boolean 아닌 가드는 공개 계약 `Validator`를 구현한 시험용 검증기(`compileGuard`가 던지는 함수·Promise를 돌려줌)로 시험한다. 이것은 공개 계약의 인자이지 시험만을 위한 주입 자리가 아니다 | TEST-069 (나)(`ledger/test.md:1153-1158`), VALIDATE-044 (4), 26C-04 | 자율 결정 |
| I13 | `Validator`·`ValidationIssue`·`ValidateFunction`의 자리와 공개 이름 | core의 형 파일은 React를 가져오지 않는다(GOAL-088). 그래서 세 형은 `src/core/validation/type.ts`에 선언한다. `Validator`(새 계약 형)는 새 엔진 모듈에서만 내보내고 공개 `src/index.ts`·`src/core/index.ts`에서 내보내지 않는다(32C-01). `ValidationIssue`는 오늘의 공개 `PublicJSONSchemaError`의 개명이며(ERROR-032, LANDING-070), `src/types/error.ts`가 `ValidationIssue`를 이름으로 다시 내보낸다(한 선언). 공개 `ValidatorFactory`·`ValidateFunction`(`src/types/error.ts:119,209`, `src/index.ts:72-73`)은 `validatorFactory` 속성의 형이므로 07까지 오늘의 선언을 그대로 둔다(32C-01). core 계약의 `ValidateFunction`은 `core/validation/type.ts`의 별개 선언이며 공개 색인에 오르지 않는다 — 두 선언의 이름이 같으므로 `src/types/error.ts`의 선언 머리에 "legacy public shape until PR-7; the engine contract is `core/validation`'s `ValidateFunction`" 한 줄을 둔다(이름 함정). 오늘의 공개 이름 상태: `src/index.ts:74`의 `PublicJSONSchemaError as JSONSchemaError`(형)가 공개 이름 `JSONSchemaError`의 유일한 수출이고, 던지는 클래스 `JSONSchemaError`(`src/errors/JSONSchemaError.ts:24`)는 이름으로 공개되지 않으며 `src/index.ts:16-21`은 가드 `isJSONSchemaError`만 내보낸다(그 술어 형이 클래스를 가리킴). 05는 이 상태를 지킨다: `src/index.ts`가 `ValidationIssue`를 더해 내보내고, 형 별칭 `JSONSchemaError`는 `ValidationIssue`를 가리키는 형 수출로 07까지 남긴다(`export type { ValidationIssue, ValidationIssue as JSONSchemaError }`). 클래스는 계속 이름으로 공개하지 않는다. 별칭의 삭제는 소비자 이주(07)다 — ajv 셋의 스토리 여섯(`stories/13.FormError.stories.tsx`, `stories/19.SubmitUsecase.stories.tsx`)이 공개 이름 `JSONSchemaError`를 가져온다. 레거시 Form 형(`src/components/Form/type.ts:22`에서 `@/schema-form/types`로 가져와 `:54,123,125`에서 씀)은 안쪽 `JSONSchemaError extends …`(`key` 칸, 레거시 전용)를 쓰며, 이 안쪽 형은 레거시 삭제까지 이름을 두고 `ValidationIssue`를 확장한다 | ERROR-032, LANDING-024·064·070·159(규칙 3), SURFACE-014·056, VALIDATE-044, GOAL-088, 32C-01 | 닫힘(32C-01) |
| I14 | 공개 `validatorFactory` 속성의 형 | 계약 통일은 core가 받는 계약 형 하나를 정하고 core 트리 생성 인자와 ajv 셋이 그 형을 쓰게 하는 것까지가 05다. Form·`FormProvider` 속성 `validatorFactory`는 07까지 오늘의 형과 동작을 지킨다(LANDING-064의 PR-7 행, LANDING-036 이주 33) | LANDING-036·064·159, VALIDATE-044, 32C-01 | 닫힘(32C-01) |
| I26 | 플러그인이 계약 형을 얻는 길 | 플러그인 쪽 계약은 공개 `ValidatorPlugin`(`src/app/plugin/type.ts`)이며 PR-4가 더하기만 하는 개정을 한다(LANDING-084 "`app/plugin/type.ts` 개정"): `compile`·`bind?`는 그대로, 선택 멤버 `compileGuard?(root, pointer)`·`release?(root)`와 넷째 선택 멤버 `dialect?`(VALIDATE-026, Q9b — 35라운드 원장 관리자 답, 커밋 대기)를 더하고, 정규화된 오류에 `rejectedKey`가 생긴다(`ValidationIssue`). 선택 멤버는 PR-7에서 LANDING-036 이주 33과 함께 필수가 된다. core의 `Validator`는 `src/core/validation/`에만 있고 공개 색인에 오르지 않는다. 두 형은 `compileGuard`를 가진 `ValidatorPlugin` 값이 구조적으로 `Validator`를 만족하도록 맞춘다(`Validator`의 필수 멤버 `compile`·`compileGuard`가 `ValidatorPlugin`의 `compile`·선택 `compileGuard?`와 같은 서명, `release?`도 같음). core 쪽 일치는 플러그인 모양의 값을 `Validator`로 받는 core 시험이 단언하고, 플러그인 시험은 오늘처럼 공개 색인에서 `ValidatorPlugin`을 가져온다. 하위 경로 수출도, 플러그인 안의 중복 선언도 두지 않는다 | VALIDATE-044, LANDING-036·070·084, 32C-01, 34C-01 | 닫힘(34C-01) |
| I15 | 레거시 import 분리 | 레거시 `ValidationManager`가 `PluginManager.validator?.compile`로 떨어지는 폴백(`ValidationManager.ts:1`, `:203`)을 바인딩 계층 `providers/RootNodeContext/RootNodeContextProvider.tsx`로 옮긴다: 거기서 `(schema) => factory?.(schema) || PluginManager.validator?.compile(schema)`를 만들어 넘긴다. 레거시 `<Form>`의 동작은 같다(같은 순서, 같은 시점). core만 쓰는 호스트(`nodeFromJSONSchema`를 직접 부름)는 등록 플러그인으로 떨어지지 않고 인자로 넘겨야 한다 — 원장이 정한 바뀜이며 PR 본문에 적는다 | LANDING-064(착수 전 칸), CONTROLS-075 (1), REACT-002, VALIDATE-044 (2) | 닫힘 |
| I16 | 레거시 폴백 검증기의 루트 `''` | 원장은 `getFallbackValidator.ts:19`(03이 `src/__legacy__/…`로 옮김)를 05에서 `''`로 고치라고 한다. 레거시 `ValidationManager`는 `host.find(dataPath)`로 배정하며 `find('')`는 자기(루트)를 돌려주므로 같은 노드에 간다. 고치기 전에 레거시가 `'/'` 문자열에 기대는 자리를 찾고(경계 있는 탐색), 있으면 멈추고 질의한다 | FRAGMENT-053, LANDING-093(18C-74 보충), LANDING-205 | 닫힘(탐색 뒤 확인) |
| I17 | 차등 시험의 독립 검증기 | ajv가 아닌 구현 `@cfworker/json-schema`를 개발 의존으로 더한다. 판정 대상은 (작성 스키마, 방출 값의 JSON 왕복)이다. 플러그인 패키지마다(그 플러그인의 판정 대 독립 검증기)와 core 시나리오(새 엔진 `validate()`의 판정 대 독립 검증기, 시험용 검증기 I12)에 둔다. 같은 major의 새 Ajv 대조는 덧붙인 회귀 검사로만 남길 수 있다. 의존 추가는 소유자 확인 대기다(U12a) | TEST-001(`ledger/test.md:94,96`), TEST-017, LANDING-071, VALIDATE-027·028(`ledger/validate.md:415-416`), 31C-04 | 닫힘(31C-04), 설치만 소유자 확인 대기 |
| I18 | 플러그인 계약 게이트의 자리 | 플러그인 패키지는 공개 `@canard/schema-form`만 가져오고 그 진입점은 07까지 옛 엔진이다. 그래서 VALIDATE-046·047의 (i)–(iv)는 플러그인 계약 수준(`compile`·`compileGuard`·`release`의 판정을 독립 ajv와 비교)으로 각 플러그인 패키지에서 시험하고, VALIDATE-046 (iii) 재생성 reset의 원자성은 core에서 시험용 검증기로 한 번 더 본다. 에러 라우팅 규칙 (5)의 플러그인별 `$ref` 아래 `schemaPath` 모양은 각 플러그인이 내는 모양을 플러그인 시험이 단언하고, 같은 모양 셋을 core 라우팅 시험이 입력으로 쓴다 | VALIDATE-043·046·047, 18C-53·57·58, LANDING-159 | 자율 결정 |
| I19 | `VALIDATOR_BIND_REFUSED`를 던지는 형 | 세 플러그인 모두 네이티브 `Error`를 확장한 플러그인 안 하위 클래스를 던진다(이름 `ValidatorBindRefusedError`, 가칭 — `name`도 그 이름이며 `'UnhandledError'`가 아님). 필드는 `group: 'UNHANDLED_ERROR'`, `code: 'VALIDATOR_BIND_REFUSED'`, `details`(문제 된 옵션 이름 목록)다. 세 패키지의 클래스는 같은 모양이며(ajv8 포함) `BaseError`도 새 의존도 쓰지 않는다. core의 `isUnhandledError`는 `instanceof` 가드(`src/errors/UnhandledError.ts:30`)라 이 객체를 알아보지 못하며 이는 받아들인다. 플러그인 문서에 "호출자는 `group`과 `code`로 가른다" 한 줄을 적는다 | VALIDATE-050, ERROR-100·164, SURFACE-014, 32C-02, 35라운드 35C-07(원장 관리자 답, 커밋 대기) | 닫힘(35C-07이 32C-02를 고침) |
| I20 | 오류 코드 상수의 자리 | 코드 표(ERROR-164 행 + 그 뒤 더해진 행, 살아 있는 코드 60)는 렌더 계층 코드까지 포함하는 패키지 전체의 표라 `src/errors/`(기존 fractal)가 소유한다. 상수는 표의 순서를 따르고 문서 주석에 level·부류·언제를 적는다. settle의 `settle/utils/errors/settleErrorCode.ts`는 표의 상수를 이름으로 가져와 쓰도록 바뀐다(04 ADR D6의 "05가 이름을 확정하면 이 파일만 고친다"). 기록 형 `FormErrorRecord`·코드 형 `FormErrorCode`·보고기 형도 `src/errors/`의 형 파일이다 | ERROR-013·017·031·164·198, `request.md:50`, 04 `execution-adr.md` D6 | 자율 결정 |
| I21 | `reason`의 값 | 코드마다 닫힌 리터럴 합집합이다: `VALIDATOR_COMPILE_FAILED`·`GUARD_FAILED` → `'duplicateSchemaId'`(+ `$id`), `TYPE_MISMATCH` → `'unconvertible' \| 'ambiguous'`, `DISCRIMINATOR_MISMATCH` → `'missing' \| 'kind' \| 'overlap' \| 'key'`. 원장이 이름 붙이지 않은 원인(검증기가 던짐 등)에는 `reason`을 두지 않고 던진 값은 그 행의 `details` 칸에 둔다. 새 코드는 없다 | ERROR-201, VALUE-037(`ledger/value.md:615`), 31C-03 | 닫힘(31C-03) |
| I22 | ajv8 `allowUnionTypes` | ajv8의 세 진입점(`default`·`2019`·`2020`)에만 `allowUnionTypes: true`를 더한다. 판정을 바꾸지 않고 `strictTypes: "log"`의 `console.warn`만 없앤다. ajv7(`strict: false`)·ajv6(엄격 모드 없음)과 VALIDATE-003의 다른 기본값은 그대로다. `bind`는 ajv7·8에서 `instance.opts`, ajv6에서 `instance._opts`를 읽는다 | VALIDATE-003·050·051(`ledger/validate.md:101,813-814`), 31C-04(Q4 답) | 닫힘 |
| I23 | 가칭 이름의 확정 | 확정은 05의 판단이며 `log.md`와 PR 본문에 적고 원장 관리자가 보충을 단다(31C-05). 이미 정해진 이름(`union`·`unionBehavior`·`isUnionNode`, `SCHEMA_FORM_WARNING.TYPE_MISMATCH`, `INJECT_TARGET_NOT_FOUND` 삭제, 맨앞 `Node` 금지)을 먼저 대조한다. U2가 `ledger/*.md`의 `가칭`을 모두 모아 이름마다 확정 여부를 정한다 | ERROR-164 머리 문단, ERROR-198, SURFACE-056·061, CONTROLS-079, 31C-05 | 닫힘(31C-05) |
| I24 | 커밋 번호 스탬프와 실행 합치기 | 검증 요청은 최외곽 진입마다 한 번이고, 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돈다. 결과는 스탬프가 최신일 때만 자기 파동으로 배달하며 정착 파동에 섞지 않는다. 늦은 결과는 버린다. 결과 파동의 리스너 예외는 `onError` 한 번과 주인 없는 싱크 한 번이며 처리되지 않은 거부가 되지 않는다. 결과 배달은 dispatch가 validation에 넘기는 콜백이다 | EVENT-046, VALIDATE-006·049, ERROR-019 (5), LANDING-084 | 닫힘 |
| I25 | 같은 `$id`의 `bind` 인스턴스 | 플러그인은 같은 `$id`의 살아 있는 두 루트를 같은 설정의 다른 인스턴스에 등록해 떼어 둔다. 기본 인스턴스는 플러그인이 같은 옵션으로 만든다. `bind` 인스턴스는 `instance.constructor`와 그 옵션으로 만들되, 사용자 정의 키워드·형식까지 같은지 보장할 수 없으면 VALIDATE-046의 실패 처리(소유자에게 (a) 동시 사용 미지원 문서화 또는 (b) `bind`가 인스턴스 생성 함수를 받음)를 그대로 따른다 | VALIDATE-046(실패 줄), ERROR-201 | 게이트로 판정 |

### 2.2 원장·계획서·코드 어긋남(U0에서 `log.md` §4로 옮김)

| # | 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:17`, `request.md:37`, `adr-and-axes.md:18`, `verification.md:23` | (log.md §4에 이미 있음) 명령 메서드를 착수 전 소유자 결정으로 적음 | EVENT-073 30라운드 보충 | I4 |
| M2 | `request.md:32` | `EventCascadeManager`·`ValidationManager`와 시험을 `src/__legacy__/`로 옮기라고 적었으나 03이 이미 옮겼다 | LANDING-159·205 | U1에서 이동 0을 G2로 확인, PR 본문 "레거시 이동 목록"에 "03에서 완료, 05 이동 0" |
| M3 | `ledger/fragment.md:807`과 LANDING-093 18C-74 보충의 경로 `src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19` | 파일은 03 이동 뒤 `PKG/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`에 있다 | FRAGMENT-053 | 원장 경로는 바꾸지 않는다(원장 관리자 몫). 옮겨진 파일을 고친다(I16) |
| M4 | `verification.md:31` | 패키지 검사를 `yarn workspace … lint`·`test`로 적었다. 이 작업 트리의 게이트는 같은 스크립트가 부르는 이진(`eslint`·`vitest`·`tsc`)을 `npx`로 부른다(04 §8 선례, `yarn`은 샌드박스 제외 명령이라 성공 표지를 붙일 수 없음) | — | 같은 명령임을 §8에 적는다 |
| M5 | 03 코드 `PKG/src/core/record/type.ts:63-64`의 `revision: number` | 겉면 `revision(mask)`(EVENT-001 원장 유지)와 이름이 겹친다 | EVENT-001·007 | I6 |
| M6 | 03 시험의 `if: {}` + 술어 대역 | 실제 가드에서는 `if: {}`가 언제나 참이라 대역이 준 뜻을 잃는다 | TEST-069 (나) | I12 |

### 2.3 원장 질의와 답, 열린 질문

| 질의 | 해석 행 | 답(31라운드) | 반영한 단위 |
| --- | --- | --- | --- |
| Q1 명령의 배달 시점 | I4, I8 | 31C-01: 같은 루트 디스패처, 최외곽 진입 끝에 한 번, 노드마다 비트를 합침. 재발행 통로는 렌더 계층 `DeferrableNodeProxy`(07). 정정: `request(kind)`는 진입을 열지 않는다(EVENT-027) — 깊이 > 0이면 대기·합침, 깊이 0이면 호출 안에서 동기 배달. 검증 요청·`onChange` 없음 | U5a, U6 |
| Q2 프로덕션 경고 | I9 | 31C-02: ERROR-021 일반 규칙, `hasConsumer()` = 핸들러 있음 ∨ `NODE_ENV !== 'production'`. `RESET_REBUILT_BY_REFERENCE`·`MULTIPLE_GATED_BRANCHES_ACTIVE`는 `hasConsumer()`일 때만 판정. 개발 모드 전용은 `NON_JSON_WHOLE_VALUE` 하나 | U5b |
| Q3 `reason: 'duplicateSchemaId'` | I21 | 31C-03: 코드마다 닫힌 `reason` 값, 새 코드 없음, 원장에 없는 원인에는 `reason`을 두지 않음 | U3, U8, U11 |
| Q4 VALIDATE-051 대 VALIDATE-003 | I22 | 확인: ajv8 세 진입점만 | U11c |
| Q5 개발 모드 일괄 컴파일 | I10 | 확인: 캐시 항목마다 한 번, 실패는 캐시, 폼마다 자기 기록, 시점은 ERROR-021대로 | U7 |
| Q6 차등 시험 오라클 | I17 | 31C-04로 바뀜: ajv 아닌 `@cfworker/json-schema`, 개발 의존, 소유자 확인 필요 | U12a, U12b |
| Q7 가칭 이름 | I23 | 31C-05: 05가 정하고 기록, 원장 관리자가 보충 | U2 |

열린 질문(받는 이와 막는 범위):

| # | 받는 이 | 물음 | 제안 | 막는 범위 |
| --- | --- | --- | --- | --- |
| O1 | 원장 관리 세션 | `validatorFactory` 통일의 범위 | 닫힘: 32C-01(I13·I14) | — |
| O2 | 조율 세션 | 06의 배열 동사의 `dispatch` 진입 파일 | 닫힘: 33C-01 — 뒤에 머지하는 단계가 더한다(U16a) | — |
| O3 | 원장 관리 세션 | `VALIDATOR_BIND_REFUSED`의 JS 클래스 | 닫힘: 32C-02(I19) | — |
| Q8 | 원장 관리 세션 | 플러그인이 계약 형을 얻는 길(패키지 `exports`가 `.` 하나) | 닫힘: 34C-01 — 공개 `ValidatorPlugin`에 선택 `compileGuard?`·`release?`(I26) | — |

## 3. 구조

### 3.1 새 fractal과 바뀌는 자리

| 자리 | 종류 | 책임(원장) |
| --- | --- | --- |
| `PKG/src/core/dispatch/` | 새 fractal | 진입 사슬의 소유: 쓰기 동사마다 진입 함수 한 파일, 진입 깊이·예산, 통지 파동과 리스너 격리, 비트별 `revision` 원장 읽기, `batch`, 진입당 `onChange` 1회와 검증 요청, 정착 밖 사건(상태·외부 오류·명령)의 대기와 배달, 사슬 끝의 기록 전달·묶음·throw, 전달 중 쓰기 거부, 경고 구조 키, 주인 없는 싱크, 검증 결과 파동(LANDING-064·084, EVENT 영역, ERROR-004·005·008·019·023·024·028·029) |
| `PKG/src/core/validation/` | 새 fractal | 검증기 계약 형(`Validator`·`ValidateFunction`·`ValidationIssue`), (검증기 인스턴스, 작성 루트)마다 사본·가드 표·전체 검증 함수 캐시, 가드 컴파일(늦은/개발 모드 일괄), 검증 실행(스탬프·합치기·실행 실패·검증 불가·검증기 없음), 에러 라우팅과 루트 `''` 정규화, 노드 오류 읽기, 참조 세기와 최근 해제 목록(LANDING-064·093, VALIDATE 영역, FRAGMENT-053) |
| `PKG/src/core/record/` | 기존 fractal, 칸 추가 | 이벤트 비트 열거 `SchemaNodeEventType`과 명령 열거 `SchemaNodeRequestType`(ADR D2), 비트별 원장 필드(I6), 배달 표시 함수, 런타임 칸(진입 깊이·예산·대기열·보고기·검증기·검증 모드·콜백·전달 중 깃발·경고 키 집합·검증 스탬프·오류 맵)(NODE-004·045, 26C-06) |
| `PKG/src/core/settle/` | 기존 fractal | 커밋이 배달 집합과 비트를 표시(I7), `if` 게이트가 validation의 가드를 부름(I10), 오류 코드는 `src/errors/`의 표 |
| `PKG/src/core/SchemaNode/` | 기존 fractal | 겉면 멤버 열넷(I5)의 한 문장 위임, 공개 형 `SchemaNodeEventType`·`SchemaNodeRequestType`, `setValue`·`resetSubtree`의 dispatch 위임 |
| `PKG/src/errors/` | 기존 fractal | 코드 표 상수(I20), `FormErrorRecord`·`FormErrorCode`·`FormErrorReporter` 형 |
| `PKG/src/app/plugin/type.ts` | 기존 organ | 공개 `ValidatorPlugin`에 선택 `compileGuard?`·`release?`를 더함(VALIDATE-044, LANDING-084, 34C-01 — I26) |
| `P6`·`P7`·`P8` | 형제 패키지 | 동기 `compileGuard`, `rejectedKey`, 같은 `$id` 떼어 두기, 선택 `release(root)`, `bind` 거부, 루트 `''`, ajv8 `allowUnionTypes`(LANDING-206) |

`dispatch/`·`validation/` 뿌리에는 `INTENT.md`·`DETAIL.md`·`index.ts`·형만 든 `type.ts`를 두고 구현은 `utils/<주제>/`에 둔다(FCA §4, seiri structure §2). dispatch의 진입 함수는 `dispatch/utils/entry/`에 동사마다 한 파일이다(`request.md:50`, `reviews/raw-round17-node-structure.md` §6 규칙 7).

### 3.2 의존 방향

- 전체 순서: `blueprint` < `record` < {`behaviors`, `navigation`} < `validation` < `settle`(`settle/derive` 포함) < `dispatch` < `SchemaNode`(NODE-016에 둘을 끼움, ADR D1).
- `settle` → `validation/index.ts`(가드 평가 하나). `validation`은 `settle`·`dispatch`·`SchemaNode`를 `import type`으로도 가져오지 않는다. 검증 결과 배달은 dispatch가 넘기는 콜백이다(LANDING-084).
- `dispatch` → `settle/index.ts`(쓰기·로드·맥락 변경), `validation/index.ts`(검증 요청·실행), `record/index.ts`. `SchemaNode` → `dispatch/index.ts`(쓰기·명령·상태·검증·구독), `settle/index.ts`(읽기), `validation/index.ts`(오류 읽기), `navigation`.
- 새 fractal은 `__legacy__`와 `app/plugin`을 가져오지 않는다(LANDING-159 규칙 1, CONTROLS-075 (1)). core의 형 파일은 React를 가져오지 않는다(GOAL-088): `validation`은 `src/types`의 색인을 가져오지 않는다.
- `src/types/error.ts` → `src/core/validation/index.ts`(`ValidationIssue`를 다시 내보냄, I13). `app/plugin/type.ts`는 `core/validation`을 가져오지 않는다(인라인 서명, I26). `app/plugin/__tests__/validatorConformance.test.ts` → `src/core/validation/index.ts`(형과 수명 함수, 시험만).
- `src/core/index.ts`는 바인딩이 07에 부를 이름(`retainValidationRoot`·`releaseValidationRoot`, 가칭)을 이름으로 다시 내보낸다. 근거는 바인딩 전용 내부 통로의 선례다: NODE-010("`core/index.ts`는 이들을 이름으로 다시 내보내고 `src/index.ts`는 내보내지 않는다")과 28C-08이 `setContext`를 같은 자리에 두었고(`src/core/index.ts:2`, 04에서 머지됨), LANDING-159 규칙 3("`src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다")은 기존 수출을 바꾸지 않는다는 뜻으로 읽는다 — 이 이름들은 옛 수출을 대체하지 않고 더해질 뿐이며 `src/index.ts`는 이들을 가져오지 않는다. 나머지 수출은 07까지 옛 엔진이다. `Validator`와 그 형은 `src/core/index.ts`에서도 내보내지 않는다(32C-01). 공개 `src/index.ts`는 `./core`에서 이름을 골라 가져오므로 새 엔진이 새지 않는다(G27이 dist로 확인).
- `src/core/__tests__/dependencyDirection.test.ts`의 `FRACTALS`에 `validation`·`dispatch`를 위 순서로 더하고, `validation`의 금지 목록(settle·dispatch·SchemaNode·app/plugin·legacy·`src/types` 색인)을 단언한다(NODE-045).

### 3.3 바뀌는 계약 문서(코드보다 먼저, U2)

| 문서 | 바꾸는 것 |
| --- | --- |
| `dispatch/INTENT.md`·`DETAIL.md`(새로) | 진입점 이름 붙은 수출과 서명(§4 U5a·U5b·U6), 진입·깊이·파동·예산·순서 규칙, 정착 밖 사건, 사슬 끝 기록 규칙, 전달 중 쓰기 거부, 금지 의존, INTENT 첫 줄의 이름 함정(이 `dispatch`는 루트 디스패처이며 Redux식 액션 디스패치가 아님) |
| `validation/INTENT.md`·`DETAIL.md`(새로) | `Validator` 계약 문장(VALIDATE-044 보충의 값·스키마 불변, 동기 가드, `bind`는 core가 부르지 않음), 캐시 단위와 수명(VALIDATE-018·021·045·048), 가드 시점(I10), 라우팅 규칙 (1)–(6)(VALIDATE-043), 루트 `''`(FRAGMENT-053), 검증 불가·실행 실패·검증기 없음, 금지 의존 |
| `record/DETAIL.md` | 두 열거, `revisionLedger`(I6)와 그 비용, 배달 표시 함수, 런타임 칸(§3.1)과 대가(NODE-045), `ifPredicates` 삭제 |
| `settle/DETAIL.md` | 커밋의 배달 표시(I7), 가드는 validation, 사슬 끝 throw는 dispatch가 모음(settle은 커밋 뒤 자기 호출 끝에서 던지고 dispatch가 잡음), 코드 표 이름 |
| `SchemaNode/DETAIL.md` | 멤버 표 열넷과 위임 대상, `setValue`·`resetSubtree`의 dispatch 위임, 공개 형 두 열거, 떼어진 노드에서 명령·상태 진입 무동작(NODE-044) |
| `src/core/DETAIL.md` | DAG에 `validation`·`dispatch`, 진입점 표면의 새 이름 |
| `src/errors/DETAIL.md` | 코드 표와 순서 규칙, 기록·코드·보고기 형 |
| `src/app/DETAIL.md` | `ValidatorPlugin` 개정, `PluginManager`의 검증기 칸은 바인딩이 읽는 등록소(CONTROLS-075) |

## 4. 작업 단위

**담당 배정(`plan/prompts.md` §1).** 위임은 cennad 경유로만 한다. 구현은 codex(한 단위 한 세션, 이어지는 고침은 같은 세션), 대조·리뷰는 antigravity, 대체는 Claude 서브에이전트(기계적 적용 sonnet·중간, 진단·게이트 판정 opus·높음, 대체 사실은 `log.md` §2). 조율 세션은 브리프·원장 질의·판단·커밋·PR을 맡는다. 파일마다 작성자는 하나이며 병렬 단위는 아래 파일 범위가 서로 겹치지 않는다. 구현 단위는 `seiri:implement`로 하고 새 동작은 고치기 전에 붉은 시험(까닭이 "기제 없음")을 먼저 기록한다. 시험 이름에 원장 ID 태그를 싣고 게이트가 그 문자열을 찾는다. 명령은 저장소 루트(이 작업 트리)에서 돈다.

순서: U0 → U1 → U2 → U3 → U4 → {U5a → U5b → U6, U7} → U8 → U9 → {U13, U14, U15}; U10은 U3 뒤 언제든; U11a·U11b·U11c는 U3·U7 뒤 병렬; U12a는 U0 뒤 소유자 답을 기다림; U12b는 U8·U11·U12a 뒤; U16a → U16b가 마지막. U7은 U5a와 병렬이 가능하다(U7: `validation/`·`settle/utils/gates/`·시험 대역 정리, U5a: `dispatch/`). 두 단위가 함께 쓰는 시험 도우미(`makeSchemaNodeTree.ts`, `settle/__tests__/fixtures/createTestTree.ts`)는 U7만 고치고, U5a의 시험은 `if` 게이트 없는 스키마만 쓰거나 U7이 끝난 뒤 그 사례를 더한다.

### U0 착수 — 이 계획, ADR, 게이트 원장, 질의 반영

- 산출: `execution-plan.md`, `execution-adr.md`, `.seiri/tasks/schema-form-dispatch-and-validation/gates.md`, `log.md`(§2 진행, §4에 M2–M6, §2에 31C-01~05·32C-01·02·33C-01·34C-01·02의 반영).
- 완료: antigravity의 `seiri:review-plan`이 `cleared`(G1, 수동).

### U1 레거시 확인

- 원장: LANDING-159·205, `request.md:32`.
- `EventCascadeManager`·`ValidationManager`와 시험이 `src/__legacy__/` 아래에만 있음을 확인한다. 옮길 파일은 0이다. 결과를 `log.md` §4(M2)와 PR 본문 "레거시 이동 목록"에 "03에서 완료, 05 이동 0"으로 적는다.
- 완료: G2. 담당: 조율 세션(코드 변경 없음).

### U2 문서 선행, 경계 린트, 가칭 확정

- 원장: LANDING-064·084, CONTROLS-075, NODE-004·010·016·045, 26C-01·06, ERROR-164·198, SURFACE-056·061, 31C-05.
- 고칠 파일: §3.3의 문서 전부(새 넷 + 고침 여섯), `PKG/eslint.config.js`(두 블록의 `files`에 `src/core/dispatch/**`·`src/core/validation/**`를 더하고, `no-restricted-imports`의 `patterns`에 `@/schema-form/app/plugin`·`**/app/plugin`·`**/app/plugin/**`을 더함), `log.md`(가칭 확정 목록).
- 단계:
  1. `grep -n "가칭" ARCH/ledger/*.md`로 모은 이름마다 확정·유지·삭제를 정해 `log.md`에 "31C-05 가칭 확정" 표로 적는다. 05가 쓰는 이름(코드 표의 가칭 코드, `FormErrorRecord`·`FormErrorCode`·`FormErrorReporter`, `Validator`, `revisionLedger`, `UpdateJsonSchema`, `VALIDATOR_BIND_REFUSED`, `retainValidationRoot`·`releaseValidationRoot`, `WRITE_IN_OBSERVER`, `MULTIPLE_ERRORS`, 방언 불일치 코드(ERROR-188), 06에서 온 `ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197), 상태 플래그 공개 형의 이름)은 모두 이 표에 든다. 맨앞 `Node`·`VALUE_TYPE_MISMATCH`·`INJECT_TARGET_NOT_FOUND`를 쓰지 않음을 대조한다.
  2. 문서를 쓴다. DETAIL이 계약으로 드는 서명은 §4의 각 단위가 적은 것이다. 이후 서명을 바꾸면 DETAIL을 먼저 고친다.
  3. 문서와 린트 설정만 든 커밋. `dispatch/index.ts`·`validation/index.ts`의 첫 커밋은 이 커밋의 자손이다.
- 완료: G3·G4, antigravity의 원장 대조 차단 지적 0(G5, 수동), 가칭 표(G6).

### U3 오류 층과 검증기 형

- 원장: ERROR-005·013·017·031·032·164·198·201, LANDING-024·070, SURFACE-014·061, VALIDATE-044·050, GOAL-088, 31C-03.
- 만들 파일: `PKG/src/errors/formErrorCode.ts`(코드 표 상수, 표 순서, 문서 주석에 level·부류·언제), `PKG/src/errors/type.ts`(`FormErrorRecord`, `FormErrorCode`, `FormErrorReporter`, `reason` 닫힌 합집합), `PKG/src/errors/__tests__/formErrorCode.ledger.test.ts`, `PKG/src/core/validation/type.ts`·`index.ts`(형만: `Validator`, `GuardFunction`, `ValidateFunction`, `ValidationIssue`).
- 고칠 파일: `PKG/src/errors/index.ts`(`export *` — `src/errors/INTENT.md`의 저장소 관례가 seiri 규칙보다 앞섬), `PKG/src/types/error.ts`(`PublicJSONSchemaError` → `ValidationIssue` 다시 내보내기, `JSONSchemaError extends ValidationIssue`; 공개 `ValidatorFactory`·`ValidateFunction`은 오늘 선언 그대로 두고 이름 함정 한 줄만 더함 — I13), `PKG/src/index.ts`(형 수출 `ValidationIssue`를 더하고 `JSONSchemaError`는 `ValidationIssue`의 형 별칭으로 07까지 유지: `export type { ValidationIssue, ValidationIssue as JSONSchemaError }`; 던지는 클래스 `JSONSchemaError`는 오늘처럼 이름으로 공개하지 않고 가드 `isJSONSchemaError`만 그대로 — I13. `Validator`는 공개하지 않음 — 32C-01), `PKG/src/helpers/error/formatValidationError/utils/replacePattern.ts`, `PKG/src/app/plugin/type.ts`(오늘의 `ValidatorPlugin { bind?, compile }`에 선택 멤버 `compileGuard?(root: JSONSchema, pointer: string): (value: unknown) => boolean`·`release?(root: JSONSchema): void`·`readonly dialect?: string`을 인라인 서명으로 더함 — 더하기만 하는 공개 형 변경, PR-7에서 `compileGuard`가 필수가 됨. `Validator`를 가져오지 않으므로 공개 `.d.ts`에 새 계약 형 이름이 새지 않는다 — I26, 34C-01), `PKG/src/app/plugin/__tests__/validatorConformance.test.ts`(만듦: `compileGuard`를 가진 `ValidatorPlugin` 모양의 값을 `const validator: Validator = plugin`으로 받아 형 검사로 구조 일치를 단언하고 그 값으로 core의 `retainValidationRoot`·가드 읽기를 한 번 돌림, 단언·`any` 없음. 자리는 `app/plugin` 쪽이다 — `app` → `core`는 허용 방향이고, `core/validation`이 `app/plugin`을 가져오면 U2의 경계 린트와 의존 방향 시험이 막는다; 시험 이름에 `34C-01 ValidatorPlugin satisfies Validator`), `PKG/src/core/settle/utils/errors/settleErrorCode.ts`(표 상수를 이름으로 가져옴).
- 서명(DETAIL과 같게):
  - `interface Validator { compile(copy: BlueprintSchema): ValidateFunction; compileGuard(root: BlueprintSchema, pointer: string): GuardFunction; release?(root: BlueprintSchema): void; readonly dialect?: string }`(메서드 문법 — 플러그인이 `JSONSchema`로 구현해도 맞음)
  - `type GuardFunction = (value: unknown) => boolean`
  - `type ValidateFunction<Value = unknown> = (data: Value) => Promise<readonly ValidationIssue[] | null> | readonly ValidationIssue[] | null` — 문서 주석 "입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다"(ERROR-032)를 코드 주석 언어(영어)로 "Returns the verdict for its input and never throws; a throw is an execution failure." 같은 문서 주석에 이름 함정 한 줄 "Engine contract; the public `ValidateFunction` in `src/types/error.ts` keeps its legacy shape until PR-7."을 둔다. 공개 `ValidateFunction`·`ValidatorFactory`는 07까지 바꾸지 않는다(Q9c, 35라운드 원장 관리자 답, 커밋 대기)
  - `Validator`의 문서 주석은 VALIDATE-044 보충의 계약 문장을 옮긴다: "Core passes the emitted tree by reference to `compile` results and guards. Validators and guards must not modify the received value or schema. Not using value-modifying custom keywords (ajv `modifying: true`) is the consumer's responsibility." 가드는 동기이며 비동기 형식·키워드를 지원하지 않는다는 문장도 둔다(VALIDATE-016).
  - `interface ValidationIssue<SourceError = unknown> { dataPath: string; keyword?: string; message?: string; schemaPath?: string; rejectedKey?: string; details?: Record<string, unknown>; source?: SourceError }`(오늘 칸 + `rejectedKey`, FRAGMENT-020)
  - `interface FormErrorRecord { level: 'error' | 'warning'; code: FormErrorCode; message: string; path?: string; schemaPath?: string; details?: object; error?: unknown; aggregate?: readonly FormErrorRecord[]; surface?: 'thrown' | 'rejected' | 'sink'; componentStack?: string }`(ERROR-017, `componentStack` 채움은 07)
  - `interface FormErrorReporter { report(record: FormErrorRecord): void; hasConsumer(): boolean }`
- 기계 대조 시험: 시험이 `ARCH/ledger/error.md`를 파일로 읽어(가져오기 아님) ERROR-164 표의 살아 있는 행과 그 뒤 보충·항목이 더한 행을 원장 순서로 뽑고, `formErrorCode.ts`의 상수 목록·순서·level과 같음을 단언한다(제외 행, `(코드 없음)`, 오늘만의 코드, `INJECT_TARGET_NOT_FOUND`는 빠짐; 살아 있는 코드 60 — 검증 문서 §11의 셈을 시험이 다시 셈). 시험 이름에 `ERROR-164 code table`.
- 완료: G7·G8·G9.

### U4 이벤트 형, 비트별 원장, 배달 집합

- 원장: EVENT-001·004·006·007·043·060·064·066·071, SETTLE-007, LANDING-170, WRITE-096, SURFACE-056·057·060, 28C-07, `reviews/round-26-closing.md:69`.
- 만들 파일: `PKG/src/core/record/SchemaNodeEventType.ts`, `PKG/src/core/record/SchemaNodeRequestType.ts`, `PKG/src/core/record/utils/markSchemaNodeEvent.ts`(노드·비트·페이로드를 런타임 배달 표에 합침), `PKG/src/core/settle/utils/commit/markCommitDeliveries.ts`, `PKG/src/core/settle/__tests__/settle.delivery.test.ts`.
- 고칠 파일: `PKG/src/core/record/type.ts`(필드 `revision` → `revisionLedger`, 런타임 칸), `PKG/src/core/record/index.ts`, `PKG/src/core/SchemaNode/SchemaNode.ts`(필드 이름과 생성자 대입 한 줄만), `PKG/src/core/settle/utils/commit/commitSettlement.ts`(`node.revision++` 자리를 `markCommitDeliveries`로), `PKG/src/core/__tests__/makeSchemaNodeTree.ts`·`PKG/src/core/settle/__tests__/fixtures/createTestTree.ts`(런타임 칸), `node.revision`을 단언하는 시험 8파일(`grep -rl "revision" PKG/src/core | grep __tests__`로 확정).
- 단계: 붉은 시험 먼저. 배달 집합 = 로컬·방출·진단이 바뀐 노드, 대기 신호 비트가 있는 노드, 활성 깃발이 바뀐 노드(값이 같아도), 유효 스키마가 바뀐 노드, 상호작용 상태가 바뀐 노드, 경로가 바뀐 노드(EVENT-006·066). 비트: `UpdateValue`(페이로드 `{ previous, current }`, 옵션의 출처 칸 — WRITE-096), `UpdatePath`, `UpdateChildren`, `UpdateComputedProperties`(상태 키·`watchValues`), `UpdateJsonSchema`(메모한 유효 스키마 참조가 마지막 통지와 다를 때, 트리 생성 때는 내지 않음, 페이로드 `{ previous, current }`, 개발 모드는 페이로드 객체만 동결 — EVENT-064), `UpdateState`(resetInteraction), `RequestRefresh`(03의 `refreshTargets`, 로드는 로드된 모든 노드 — EVENT-039·071), 루트 `UpdateDiagnostics`(진단이 바뀐 커밋만 — EVENT-043). 커밋이 배달 집합 전체의 비트별 원장을 한 번에 올린다(EVENT-007). 원장은 노드 생성자에서 공유 동결 빈 상수, 첫 배달에 할당한다.
- 완료: G10·G11·G12(03·04 시험 전체 초록, 의존 방향 시험 포함).

### U5a 디스패처 ①: 진입 사슬, 파동, `batch`, `onChange`, 예산

- 원장: EVENT-004·008·009·010·011·013·014·015·016·017·019·020·021·022·026·027·030·031·032·033·034·035·061·072, LANDING-022·064·084, CONTROLS-079, GOAL-010, 26C-03·06.
- 만들 파일: `PKG/src/core/dispatch/index.ts`·`type.ts`, `dispatch/utils/entry/`(`dispatchSetValue.ts`·`dispatchResetSubtree.ts`·`dispatchResetForm.ts`·`dispatchMount.ts`·`dispatchBatch.ts`·`dispatchContextChange.ts`), `dispatch/utils/chain/`(`enterSchemaNodeChain.ts`·`exitSchemaNodeChain.ts`·`runDeliveryWaves.ts`·`deliverWave.ts`), `dispatch/utils/read/`(`readSchemaNodeRevision.ts`·`subscribeSchemaNode.ts`), 시험 `dispatch/__tests__/`(`dispatch.entry.test.ts`·`dispatch.waves.test.ts`·`dispatch.batch.test.ts`·`dispatch.onChange.test.ts`·`dispatch.budget.test.ts`).
- 고칠 파일: `PKG/src/core/SchemaNode/utils/setContext.ts`(settle 대신 `dispatchContextChange`에 한 문장 위임 — 맥락 변경도 커밋을 낳으므로 배달과 `onChange`가 필요).
- 서명(이름 붙은 수출): `dispatchSetValue(node, value, option)`, `dispatchResetSubtree(node, option)`, `dispatchResetForm(root, value?, option?)`, `dispatchMount(root, value?, option?)`, `dispatchBatch(node, fn: () => void)`, `dispatchContextChange(root, context)`, `subscribeSchemaNode(node, listener): () => void`, `readSchemaNodeRevision(node, mask?)`. 리스너 사건 모양은 오늘의 `{ type, payload?, options? }`를 잇는다(EVENT-001 "유지").
- 단계(붉은 시험 먼저):
  1. 진입 깊이·사슬 상태는 런타임 칸(26C-06). settle의 throw(커밋 뒤)를 잡아 모으고 사슬 끝에서 던진다(하나면 원래 값, 둘 이상이면 U5b의 묶음).
  2. 파동: 시작 때 배달 집합과 리스너 목록을 고정, 문서 순서 위→아래, 떼어진 노드는 건너뛰고 비트를 지움, 중간 구독은 다음 파동부터, 해지된 것은 부르지 않음, 리스너 예외는 하나씩 격리해 모음(EVENT-009·010·011, SETTLE-007).
  3. `batch(fn)`: 표시만 하고 끝에서 정착 한 번·파동 한 번, 중첩은 바깥이 이김, 안의 `reset`은 즉시 정착하되 커밋은 끝의 파동 하나에 합침, 리스너 안의 `batch`는 자기 배치이며 되먹임으로 셈, `fn`이 던지면 표시된 쓰기는 정착·통지하고 예외는 사슬 머리 끝에서, updater는 부른 자리에서 앞선 표시를 잇고 평범한 읽기는 직전 커밋, 문서 주석은 EVENT-061의 문장(EVENT-013–017·019·035·061, WRITE-015 "억제가 이김"은 `batch` 안에서도 — 03 로그 넘김).
  4. `onChange`: 최외곽 동기 진입당 한 번, 마지막 파동 뒤, 방출 참조가 바뀐 때만, 검증 요청 다음(I1). `reset`은 `OnChange` 비트면 방출이 같아도 검증 요청 한 번(onChange는 아님). `resetSubtree()`의 로드 뒤 검증·`batch` 안의 즉시 정착은 그 하위 트리에만(EVENT-026·031·032·033·072).
  5. 예산(I2): 되먹임 파동 25, `onChange` 중첩 25, 초과는 사슬 끝 `FEEDBACK_LIMIT_EXCEEDED`, `diagnostics`에 적지 않음. `injectTo` 함수 안의 공개 쓰기를 같은 예산으로 셈(04 I13).
  6. 재생성 reset의 사슬 넘김(EVENT-030): 옛 루트의 진입 깊이·`batch` 표시·파동 수·중첩 수·모은 오류를 새 루트에 넘기는 함수 `adoptSchemaNodeChain(previousRoot, nextRoot)`를 dispatch가 이름으로 내보낸다. 부르는 쪽(폼 수준 재생성)은 07이며 05는 함수 시험만 한다.
- 완료: G13·G14.

### U5b 디스패처 ②: `onError` core 쪽

- 원장: ERROR-004·005·008·013·014·016·017·019·021·022·023·024·025·028·029·030·096·097·099·100·101·196·204, WRITE-099, VALUE-037, TEST-017, 31C-02.
- 만들 파일: `dispatch/utils/report/`(`createFormErrorRecord.ts`·`deliverChainRecords.ts`·`bundleChainErrors.ts`·`reportOwnerlessError.ts`·`dedupeWarningRecord.ts`·`assertNotInDelivery.ts`), 시험 `dispatch/__tests__/dispatch.report.test.ts`·`dispatch.bundle.test.ts`·`dispatch.observer-write.test.ts`·`dispatch.warning-key.test.ts`.
- 고칠 파일: `dispatch/utils/chain/exitSchemaNodeChain.ts`(U5a 파일, 같은 세션이 이음), settle의 경고 판정 자리(`TYPE_MISMATCH` 기록은 `settle/utils/commit/commitSettlement.ts`의 `warnDevelopmentIssue` 호출을 런타임 기록으로, `MULTIPLE_GATED_BRANCHES_ACTIVE`는 `oneOf` 호스트의 이미 계산된 게이트 결과를 세는 자리 — 경계 있는 탐색: `grep -rn "oneOf" PKG/src/core/settle/utils/gates PKG/src/core/settle/utils/compute`로 정하고 브리프에 파일을 적음).
- 단계(붉은 시험 먼저): 사슬 끝 기록마다 발생 순서로 `report`(경고 포함), 정착 중에는 아무것도 전달하지 않음; 묶음(둘 이상 → `SchemaFormError` `MULTIPLE_ERRORS`, `details.errors` 순서, `aggregate`와 구성 기록, 원래 값은 펴지 않고 첫째); 핸들러가 던질 때(부른 쪽이 있으면 남은 전달을 끝내고 묶어 던짐, 없으면 싱크 한 번·전달 계속·핸들러 예외를 다시 `onError`에 보내지 않음); 전달 중 깃발과 쓰기 거부(`WRITE_IN_OBSERVER` 즉시, `onError`에 안 감, `validate()`는 허용, 다른 폼은 막지 않음); 경고 구조 키(코드·위치·코드별 판별 칸, 첫 통과에만 서식, 같은 노드의 다른 `allOf` 키워드는 따로)와 폼 수준 로드에서만 초기화(마운트·폼 수준 reset, `setValue(V)`·`resetSubtree()`는 아님 — ERROR-204); `hasConsumer()`가 거짓이면 기록·서식·경고 집합·정착 경고 판정을 만들지 않음(할당 계측 시험); 마운트 뒤 붙은 핸들러는 그 뒤 사건만; 원시 예외 전달; 주인 없는 싱크(ERROR-008: `window`면 `reportError`, 아니면 `ErrorEvent` 분기, 없으면 `console.error` 한 번, Node의 uncaught 방출 없음); 청사진 오류·경고(PR-1의 수집기)를 기록으로; `RESET_REBUILT_BY_REFERENCE`·`MULTIPLE_GATED_BRANCHES_ACTIVE`는 `hasConsumer()`일 때만; `NON_JSON_WHOLE_VALUE` 깊이 점검은 개발 모드에서만(I9).
- 완료: G15·G16.

### U6 정착 밖 사건과 명령 메서드

- 원장: EVENT-012·037·039·040·045·063·067·073, SURFACE-053, NODE-044, ERROR-029, 31C-01, `reviews/round-30-owner-answers.md:7-10`.
- 만들 파일: `dispatch/utils/entry/`(`dispatchSetState.ts`·`dispatchSetSubtreeState.ts`·`dispatchClearSubtreeState.ts`·`dispatchSetExternalErrors.ts`·`dispatchClearExternalErrors.ts`·`dispatchRequest.ts`), `dispatch/utils/chain/flushQueuedEvents.ts`, 시험 `dispatch/__tests__/dispatch.state.test.ts`·`dispatch.request.test.ts`·`dispatch.external-errors.test.ts`.
- 서명: `dispatchRequest(node, kind: SchemaNodeRequestType): void`, `dispatchSetState(node, state)`, `dispatchSetSubtreeState(node, state)`, `dispatchClearSubtreeState(node)`, `dispatchSetExternalErrors(node, errors: readonly ValidationIssue[])`, `dispatchClearExternalErrors(node)`.
- 단계(붉은 시험 먼저, I4·I8): 깊이 > 0이면 비트를 노드마다 합쳐 대기, 깊이가 0이 될 때 한 번(정착 파동 뒤의 별도 파동), 깊이 0이면 호출 안에서 동기; 한 진입의 여러 명령은 노드마다 한 번; 원본·`revision` 외 값 불변, 검증 요청·`onChange` 없음; 떼어진 노드에서 무동작; `onStateChange`는 최외곽 진입 끝 한 번; 전달 중 쓰기 거부 대상. `SchemaNodeRequestType` 네 멤버 값이 요청 비트와 같음을 단언(`RequestRemount` 유지 — EVENT-037).
- 완료: G17·G18.

### U7 검증 ①: 계약, 사본·가드 캐시, 실제 가드

- 원장: VALIDATE-001·004·005·014·015·016·017·018·019·033·034·044·047·048·050, ERROR-041·143·146–154, TEST-069 (나), 18C-25, 26C-04, 31C-03, Q5 답.
- 만들 파일: `validation/utils/cache/`(`readValidationEntry.ts` — 검증기 인스턴스마다 `WeakMap<작성 루트, 항목>`), `validation/utils/copy/createValidatorCopy.ts`(한 번 깊이 복사, 키워드 자리의 `controls`·`options`·`presentation`만 사본에서 뺌, `options.virtual` 포함, `required` 재작성 없음), `validation/utils/guard/`(`readSchemaNodeGuard.ts` 늦은 컴파일, `compileEntryGuards.ts` 개발 모드 일괄), `PKG/src/core/__tests__/fixtures/createTestValidator.ts`(ajv 8 계약 구현과 던지는·Promise를 내는 변형), 시험 `validation/__tests__/`(`validation.copy.test.ts`·`validation.guard.test.ts`·`validation.cache.test.ts`·`validation.missing.test.ts`).
- 고칠 파일: `PKG/src/core/settle/utils/gates/evaluateGate.ts`(`runtime.ifPredicates` → `readSchemaNodeGuard(runtime, gate)`, 없으면 조각 꺼짐과 경고 기록, boolean 아님·던짐 → `GUARD_FAILED`), `PKG/src/core/record/type.ts`(`ifPredicates` 삭제, `validator?`·`validationMode?` 칸 — U4가 칸 자리를 만들었으면 이음), `PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts`(씨앗 형), 대역 정리(I12): `PKG/src/core/__tests__/ifPredicate.ts` 삭제, `makeSchemaNodeTree.ts`·`settle/__tests__/fixtures/createTestTree.ts`·`scenarios/utils/createCoreScenarioAdapter.ts`·`navigation/__tests__/fixtures/createNode.ts`와 술어를 쓰는 시험 파일(`grep -rl "ifPredicate" PKG/src/core`로 확정, 2026-10-01 기준 19파일: `record.test.ts`, `SchemaNode/__tests__/context.test.ts`·`surface.test.ts`, `effectiveList.test.ts`, 회귀 `r9b`·`stage03-defects`·`selfcheck-v5-gates`·`r9`·`selfcheck-v5-fragments`·`edge-cases-controls`·`edge-cases`, `behaviors/__tests__/rows.test.ts`, `settle.context`·`settle.controls`·`settle.gates`, 도우미 넷).
- 단계: 붉은 시험 먼저. 시험이 `if: {}`에 술어로 준 뜻을 같은 뜻의 `if` 스키마로 옮기고, 기대값은 바꾸지 않는다(바뀌면 멈추고 기록 — 그 차이가 TEST-069 (나)가 찾으려는 것). 던지는 대역 둘(`settle.gates.test.ts`)은 던지는 가드를 내는 시험용 검증기로. 개발 모드 일괄 컴파일은 캐시 항목마다 한 번이며 실패 기록은 마운트 커밋 뒤, 프로덕션은 첫 평가 사슬 끝(I10). `if` 내용을 읽는 경고·공허한 참 경고가 없음을 단언(VALIDATE-047, ERROR-198).
- 완료: G19·G20·G21(03·04 정착 시나리오·회귀가 실제 가드로 초록 — TEST-069 (나)).

### U8 검증 ②: 실행, 스탬프, 라우팅, 검증 불가, 수명

- 원장: VALIDATE-006·007·008·009·010·011·021·026·036·042·043·045·046·048·049·051, FRAGMENT-020·053, ERROR-019·029·039·040·155·156·157·188·201·204, EVENT-046·072, WRITE-093·099, LANDING-084, 18C-53·56·101·105, 31C-03.
- 만들 파일: `validation/utils/run/`(`requestSchemaNodeValidation.ts`·`runSchemaNodeValidation.ts`), `validation/utils/route/`(`routeValidationIssues.ts`·`normalizeIssueDataPath.ts`·`isOffUnionBranchIssue.ts`), `validation/utils/lifetime/`(`retainValidationRoot.ts`·`releaseValidationRoot.ts`·`recentReleaseList.ts`), `validation/utils/read/readSchemaNodeErrors.ts`, `dispatch/utils/entry/dispatchValidate.ts`, `dispatch/utils/chain/deliverValidationWave.ts`, 시험 `validation/__tests__/`(`validation.run.test.ts`·`validation.route.test.ts`·`validation.route.ajv-shapes.test.ts`·`validation.compile-failed.test.ts`·`validation.lifetime.test.ts`·`validation.same-id.test.ts`·`validation.dialect.test.ts`).
- 서명: `requestSchemaNodeValidation(root, deliver: (issues, commit) => void)`, `dispatchValidate(node): Promise<readonly ValidationIssue[]>`, `readSchemaNodeErrors(node): readonly ValidationIssue[]`, `retainValidationRoot(validator, authoredRoot)`, `releaseValidationRoot(validator, authoredRoot)`.
- 단계(붉은 시험 먼저):
  1. 판정 = 검증기(작성 스키마의 사본, 방출 값 참조), 값은 복사하지 않음, 스탬프·합치기(I24), `ValidationMode.None`은 판정 없음, `validate()`는 새로 검증.
  2. 라우팅(VALIDATE-043): 폼 수준 목록(`globalErrors`), 정규화된 `dataPath`(`'/'` → `''`)로 배정, `rejectedKey`는 호스트, 터미널 아래는 터미널, 형상에 없으면 주인 없음, 규칙 (5) 꺼진 `oneOf`·`anyOf` 분기만 표시에서 거름(가를 수 없으면 무력, `allOf`·`if`·`controls.active`는 거르지 않음, 청사진 조각 표 사용, `if` 내용 안 읽음), union 호스트 에러는 호스트(VALIDATE-051), 판정 불변. 표시 기제(`ENHANCED_KEY` 등)는 새 core에 없음(VALIDATE-010).
  3. 실행 실패(`VALIDATOR_THREW`): `validate()` 거부, `OnChange` 검증은 `onError` 한 번 뒤 싱크 한 번, 처리되지 않은 거부 없음, `onValidate`·결과 아님. 검증 불가(`VALIDATOR_COMPILE_FAILED`): 폼 수준 로드마다 한 번, 첫 `OnChange` 검증·`validate()` 거부, 노드 `errors`에 넣지 않음, 그 로드에서 `OnChange` 재예약 없음, `resetSubtree()`는 다시 내지도 초기화하지도 않음(WRITE-099 게이트 S-09).
  4. 수명(VALIDATE-021·045): 커밋에서 +1, 정리에서 −1, 0이면 최근 해제 목록(크기 8, 인스턴스마다 내부 상수), 밀려날 때와 같은 `$id` 재등록 직전에만 `release(root)` 한 번 뒤 core 캐시 삭제, 목록 안의 루트가 다시 커밋하면 다시 컴파일하지 않음. 시험: 서로 다른 스키마 1,000개 마운트·언마운트에서 등록 수 ≤ 살아 있는 루트 + 8, 같은 객체 재마운트는 컴파일 0(18C-56).
  5. 같은 `$id`(VALIDATE-046 (iii)): 옛 트리가 살아 있는 재생성 reset이 원자적으로 성공(시험용 검증기). 등록 실패는 `reason: 'duplicateSchemaId'`(I21).
  6. 방언 불일치(VALIDATE-026, ERROR-188, LANDING-064, Q9b — 35라운드 원장 관리자 답, 커밋 대기): core의 판정이다. 트리 생성 때 개발 모드에서만 검증기가 선언한 `dialect`와 작성 스키마의 `$schema`를 견주고, 다르면 트리 생성 인자의 보고기로 경고 기록 하나를 낸다(핸들러가 있으면 `onError`가 받음, 없으면 개발 모드 콘솔). 프로덕션에서는 견주지 않는다. 선언이 없거나 `$schema`가 없으면 아무것도 내지 않는다. 시험 `validation.dialect.test.ts`(`ERROR-188`).
  7. `resetSubtree()` 게이트(18C-101, EVENT-072): `OnChange` 폼에서 `batch` 안팎으로 불러 정착 시점·검증 요청 수·검증 불가 기록·경고등 경로 집합이 그 하위 트리에만 걸림.
  8. ajv 셋의 `$ref` 아래 `schemaPath` 모양(I18)을 입력으로 규칙 (5)의 귀속을 단언(18C-53).
- 완료: G22·G23·G24.

### U9 겉면

- 원장: NODE-010·044, EVENT-001·063·073, SURFACE-008·053·056·058·060, 26C-01, LANDING-064.
- 고칠 파일: `PKG/src/core/SchemaNode/SchemaNode.ts`(멤버 열넷, `state`는 저장 필드 + 같은 이름 게터·세터 짝, `setValue`·`resetSubtree`의 위임을 dispatch로), `SchemaNode/type.ts`(공개 형에 열넷과 열거 둘), `SchemaNode/index.ts`(열거 둘을 이름으로), `SchemaNode/__tests__/surface.test.ts`(멤버 목록 시험 이름을 `26C-01 PR-4 member list matches the DETAIL table exactly`로), `SchemaNode/__tests__/type-contract.test.ts`, `PKG/src/core/index.ts`(이름으로 다시 내보냄, §3.2).
- 단계: 멤버는 한 문장 위임이며 분기·`new` 없음(NODE-010 린트). 06이 같은 파일에 멤버를 더하므로 05의 추가는 각 파일에서 연속한 한 덩어리로 둔다(§7). `src/index.ts`에 새 이름이 없고 dist에 새 엔진 이름이 끌려오지 않음을 확인한다.
- 완료: G25·G26·G27.

### U10 레거시 import 분리와 폴백 검증기의 루트 `''`

- 원장: LANDING-064(착수 전 칸), CONTROLS-075, REACT-002, FRAGMENT-053, LANDING-093·205.
- 고칠 파일: `PKG/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts`(`PluginManager` import와 `:203`의 폴백 삭제), `PKG/src/providers/RootNodeContext/RootNodeContextProvider.tsx`(`:94`에서 폴백 조합, I15), `PKG/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts`(`dataPath: ''`)와 그 시험 `…/ValidationManager/__tests__/getFallbackValidator.test.ts`.
- 단계: 먼저 경계 있는 탐색 — `grep -rn "'/'\|Separator" PKG/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager PKG/src/components PKG/src/hooks`에서 루트 오류의 `'/'` 문자열에 기대는 자리를 찾고 `find('')`가 루트를 돌려줌을 레거시 시험으로 고정한다(I16). 기대는 자리가 있으면 멈추고 조율 세션이 질의한다.
- 완료: G28·G29.

### U11a·U11b·U11c ajv6·ajv7·ajv8 플러그인(병렬, 패키지마다 한 세션)

- 원장: LANDING-070·093·206, VALIDATE-002·003·015·016·017·019·033·043·044·045·046·047·050·051, FRAGMENT-020·053, BLUEPRINT-044(ajv8 설정), TEST-077, 18C-53·56·57·58, 31C-04(Q4).
- 고칠·만들 파일(패키지마다, `P8` 예; `P6`·`P7`은 `src/validator/validatorPlugin.ts` 하나): `src/validator/createValidatorFactory.ts`(`compile`이 등록된 사본 루트를 공유), `src/validator/createGuardCompiler.ts`(동기 `compileGuard`, `allErrors: false` 인스턴스, 같은 설정), `src/validator/utils/registerSchemaRoot.ts`(루트마다 `addSchema` 한 번·고유 키, 같은 `$id`는 같은 설정의 다른 인스턴스 — I25), `src/validator/utils/releaseSchemaRoot.ts`, `src/validator/utils/assertBindableInstance.ts`(`coerceTypes`·`useDefaults`·`removeAdditional` — ajv7·8은 `opts`, ajv6은 `_opts`), `src/validator/utils/ValidatorBindRefusedError.ts`(I19, 35C-07: `class ValidatorBindRefusedError extends Error`, 필드 `readonly group = 'UNHANDLED_ERROR'`·`readonly code = 'VALIDATOR_BIND_REFUSED'`·`readonly details: { options: readonly string[] }`(문제 된 옵션 이름), `this.name = 'ValidatorBindRefusedError'`; 세 패키지에서 같은 파일 내용, 새 의존 없음), `src/validator/utils/transformErrors.ts`(P6은 `transformDataPath.ts`: 루트 `''`, `rejectedKey` — FRAGMENT-020의 표), `src/{default,2019,2020}/validatorPlugin.ts`(P8: `allowUnionTypes: true`, `bind` 거부, `compileGuard`, `release`, `dialect` 선언 — 진입점마다 자기 방언 URI, VALIDATE-026·044), 시험 `src/validator/__tests__/`(`bind-refusal.test.ts`·`same-id.test.ts`·`guard-scope.test.ts`·`release.test.ts`·`rejected-key.test.ts`·`routing-shapes.test.ts`, P8에 `union-types.test.ts`), 기존 `datapath.test.ts`·`transformErrors.test.ts`의 루트 기대(`'/'` → `''`), 문서(P7·P8 `CLAUDE.md`와 세 패키지 `README.md`에 `bind` 거부 규칙과 한 줄 "Callers discriminate the refusal by `group` (`'UNHANDLED_ERROR'`) and `code` (`'VALIDATOR_BIND_REFUSED'`); core's `isUnhandledError` does not recognize it." — 32C-02; P6에는 `CLAUDE.md`가 없어 README에만).
- 단계(붉은 시험 먼저):
  1. `bind` 거부(TEST-077): 세 옵션 각각과 조합에서 즉시 던지고 인스턴스를 붙이지 않음, 던진 것이 `group === 'UNHANDLED_ERROR'`·`code === 'VALIDATOR_BIND_REFUSED'`·`name === 'ValidatorBindRefusedError'`·`details.options`가 켜진 옵션 이름 목록이며 `onError`로 가지 않음(35C-07), 거부 뒤 앞 인스턴스 유지, 셋이 꺼진 인스턴스와 기본 인스턴스는 붙음, 원본 스키마 불변.
  2. VALIDATE-046 (i)–(iv)를 기본 인스턴스와 `bind(instance)` 인스턴스 둘 다(ajv6·7·8), VALIDATE-047 (i)–(iv)는 ajv7·8, ajv6은 (i)만. 판정은 같은 패키지의 독립 ajv 인스턴스가 작성 스키마를 직접 컴파일한 결과와 비교. (i)–(iii)이 어긋나면 가드 컴파일 방식을 이 단위가 고친다(18C-58). (iv)만 어긋나면 "한 자리를 여러 동적 범위에서 씀" 미지원 문서화를 권고로 상신.
  3. `release(root)`: `removeSchema(key)`와 컴파일 결과 버림, 해제 뒤 다른 루트의 늦은 가드 컴파일이 맞음.
  4. `rejectedKey`와 `required`의 빠진 자식 경로(VALIDATE-043 (2)), 루트 `''`.
  5. P8: `{type:['string','number']}` 컴파일에서 `console.warn` 0회, `{type:[…], nullable:true}` 컴파일 뒤 작성 `type` 배열 불변(BLUEPRINT-044, TEST-077).
  6. import 줄: `import type { ValidationIssue, ValidatorPlugin } from '@canard/schema-form'` — 공개 진입점에서만 가져오고(LANDING-070), 플러그인의 소스와 스토리는 PR-4에서 새 이름 `ValidationIssue`로 바꾼다(`JSONSchemaError` 별칭은 바깥 소비자를 위해 07까지 남음, 34C-02). 플러그인 객체는 `satisfies ValidatorPlugin`으로 형을 맞추고, 시험이 `typeof plugin.compileGuard === 'function'`·`typeof plugin.release === 'function'`을 단언한다(선택 멤버라 형만으로는 빠짐을 못 잡음). 플러그인 안에 계약 형을 다시 선언하지 않는다(I26, 34C-01).
- 완료: U11a G30·G31, U11b G32·G33, U11c G34·G35. 실패 처리는 VALIDATE-046·047의 실패 줄 그대로.

### U12a 독립 검증기 개발 의존 — 소유자 확인 대기

- 원장: TEST-001, 31C-04.
- `@cfworker/json-schema`(버전 고정)를 `PKG`·`P6`·`P7`·`P8`의 `devDependencies`에 더하는 것을 소유자에게 묻는다. 확인 뒤 조율 세션이 단독 호출 `yarn install`로 잠금 파일을 갱신한다(설치는 이 단위만 멈춤). 이 단위의 물음은 이 개발 의존 하나다.
- 완료: G36(수동, 소유자 답과 설치 커밋).

### U12b 차등 테스트

- 원장: TEST-001·017, LANDING-071, VALIDATE-001·007·036·051, GOAL-003.
- 만들 파일: `PKG/src/core/__tests__/scenarios/differential.spec.ts`(새 엔진 `validate()` 판정 대 독립 검증기, 시험용 검증기), `P6`·`P7`·`P8`의 `src/__tests__/differential.test.ts`(플러그인 판정 대 독립 검증기). 사례는 SCN의 순수 데이터에서 읽는다(아래 U13의 `validation` 부류).
- 판정 대상은 (작성 스키마, 방출 값의 `JSON.parse(JSON.stringify(…))`)이고, 같은 사례에서 두 판정이 같아야 한다. `&if`만으로 가르던 스키마가 폼에서도 무효가 됨(VALIDATE-036), union 값의 형 오류는 union 노드(VALIDATE-051)를 사례에 둔다. 어긋나면 폼 쪽이 틀린 것으로 보고 VALIDATE 항목과 대조한다(`verification.md:32`).
- 완료: G37.

### U13 회귀 이식과 시나리오

- 원장: TEST-011·017·023·069 (나)(다)(라), LANDING-071, EVENT-071, WRITE-015·096, CONTROLS-079, 03 `log.md` §4의 8·10·12·13·14·18행과 머리 98·101행, 04 `execution-plan.md` §6.2.
- 만들 파일: 회귀 `PKG/src/core/__tests__/regression/`의 `r9-notify.test.ts`, `selfcheck-v5-notify.test.ts`, `root-output-notify.test.ts`, `r7-port-notify.test.ts`, `r8-port-notify.test.ts`; SCN `src/notify/`·`src/validation/`(부류 데이터)·`src/types.ts`(기대 어휘: 배달 순서·`onChange` 횟수·검증 요청 횟수·노드 `errors`·`onError` 기록 코드), `SCN/index.ts`(이름으로 `notifyScenarios`·`validationScenarios`), `SCN/src/__tests__/families.test.ts`; 코어 러너 `PKG/src/core/__tests__/scenarios/notify.spec.ts`·`validation.spec.ts`, `scenarios/utils/`의 실행·단언 도우미.
- 사례(§6.1). 각 사례는 원천 파일과 줄을 시험 이름에 한 번 싣고, 현행 원장으로 기대를 바꾼 사례는 원장 ID를 함께 싣는다. SCN은 schema-form을 가져오지 않는다.
- 완료: G38·G39.

### U14 훅 수준 바인딩 시험

- 원장: LANDING-064·080·093, REACT-006, TEST-017(`ledger/test.md:350` — `hooks/`의 첫 시험).
- 만들 파일: `PKG/src/hooks/__tests__/useSchemaNodeTracker.test.tsx`, `useSchemaNodeSubscribe.test.tsx`.
- 고칠 파일: `PKG/src/hooks/useSchemaNodeTracker.ts`·`useSchemaNodeSubscribe.ts`의 형 매개변수 제약만(옛 `SchemaNode` 합집합 대신 `subscribe`·`revision`을 가진 구조 형 — 옛 노드도 만족, 선언 자리의 형 수정이며 동작 무변경). 단언·`any` 없음.
- 단언: 새 엔진 노드로 동기 통지와 `useSyncExternalStore`(쓰기 한 진입 → 렌더 한 번, 스냅숏이 `revision(mask)`), StrictMode 이중 호출에서 구독 누수·중복 없음, 구독 뒤 따라잡기(구독 전 배달은 재생하지 않고 `onSubscribe`가 현재 상태를 읽음). React 18 실행은 07이다(LANDING-080의 07 줄).
- 완료: G40.

### U15 벤치

- 원장: TEST-027·072·076, LANDING-093(18C-30 보충), `reviews/round-27-owner-answers.md:7-11`.
- 만들 파일: `PKG/bench/dispatch-and-validation.bench.ts`(행 `TEST-076-mount`: 마운트를 폼 몫과 검증기 몫(`compileGuard`)으로 나눔, 같은 실행의 옛 엔진 대비; `TEST-076-guards200`: 가드 200개 조건부 폼 생성; `EVENT-004-wave`: 1,000 노드 변경 한 파동), `ARCH/verification/05-dispatch-and-validation/performance.md`.
- 단계: `node --import tsx`와 `/opt/homebrew/bin/bun`으로 같은 입력을 돈다. 판정은 TEST-072의 선(같은 실행에서 옛 판 대비 처리량 15% 넘는 하락 ∧ Welch p<0.05). 가드 200개 행은 미리 적은 수용 필요 항목이며 미리 받아들인 것이 아니다 — 수치를 바꿔 적고 선을 넘으면 Vincent의 수용을 받는다. 03·04 벤치(`bench/node-and-settle.bench.ts`, `bench/derive-and-controls.bench.ts`)를 다시 돌려 05 뒤 값을 기록만 한다. 새로 느린 것은 `ARCH/verification/performance-issues.md` "열림"에 행. P-03(게이트 형제 첫 로드 이차)이 배달 경로와 겹치면 수치만 그 행에 덧붙인다. 공개 `<Form>` 선(`guard:check`)도 돈다(레거시 경로의 import 분리 영향).
- 완료: G41·G42·G43.

### U16a 06과의 통합

- 원장: 33C-01, LANDING-064·065·084, EVENT-027·035, TEST-069, 06 `log.md` "05와의 공유 파일 합의".
- 기준과 방향: 05·06 가운데 뒤에 머지하는 쪽이 갱신된 `1.0.0-beta`를 자기 브랜치에 merge한다(`git fetch origin 1.0.0-beta` 뒤 `git merge --no-ff origin/1.0.0-beta`). rebase는 하지 않는다. 05가 뒤라면 이 단위를 PR 앞에서 하고, 05가 먼저라면 갱신된 `1.0.0-beta`를 merge해 G44만 확인하고 넘길 목록을 `log.md`에 적는다.
- 충돌 파일과 파일마다의 규칙:
  - `src/core/SchemaNode/SchemaNode.ts`, `SchemaNode/DETAIL.md` 멤버 표: 05 멤버 덩어리를 먼저, 06 멤버 덩어리를 그 뒤에 둔다(덩어리 안의 순서는 각 단계의 것 그대로).
  - `SchemaNode/__tests__/surface.test.ts`: 기대 멤버 목록을 합집합으로 하고 DETAIL 표와 일대일로 비교한다. 시험 이름은 `26C-01 PR-4 and PR-5 member list matches the DETAIL table exactly`.
  - `SchemaNode/type.ts`, `SchemaNode/__tests__/type-contract.test.ts`: 합집합을 취한다.
  - `src/core/index.ts`: 두 단계의 수출을 모두 이름으로 다시 내보낸다(wildcard 없음).
  - `src/core/record/type.ts`: 05의 `revisionLedger`를 유지하고, 06 코드가 옛 필드 `revision`을 읽으면 그 자리를 `revisionLedger`로 맞춘다(06 log 합의).
- 조건부 단계(05가 뒤에 머지할 때만, 33C-01): 06의 배열 쓰기 동사 다섯의 겉면 위임을 `dispatch` 진입으로 옮긴다.
  - 만들 파일: `dispatch/utils/entry/dispatchPush.ts`·`dispatchPop.ts`·`dispatchUpdate.ts`·`dispatchRemove.ts`·`dispatchClear.ts`(각각 진입을 열고 06이 PR-2 모양으로 둔 정착 호출 하나를 감싸고 진입을 닫음), `dispatch/__tests__/dispatch.array-entry.test.ts`.
  - 고칠 파일: `SchemaNode.ts`의 06 배열 멤버 다섯을 진입 함수에 한 문장 위임으로, `dispatch/index.ts`·`dispatch/DETAIL.md`의 이름 붙은 수출과 서명.
  - 시험(붉은 시험 먼저): `batch` 안의 배열 동사가 형제 진입으로 합쳐짐(EVENT-035), 진입당 `onChange` 한 번, 배열 동사 안 되먹임이 사슬 끝에서 throw(EVENT-027), 배열이 아닌 노드에서 배열 동사를 부르면 throw 전에 보고기로 `ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197) 기록 하나를 냄(33C-01, 35C-01 — 35라운드 원장 관리자 답, 커밋 대기). `arrayBehavior/`에는 자기 진입 사슬이 없다.
  - PR 본문에 다섯 진입 파일의 추가를 적는다.
- 완료: G44, G45(05가 먼저 머지하면 33C-01을 까닭으로 ABANDON), G46.

### U16b 최종 검증과 PR

- 검사: 플러그인 셋(G47), 원장 인용(G48), 작업 트리 깨끗함(G49), 패키지 unit·render(G53), lint·typecheck(G54). storybook은 소유자가 sandbox 밖에서(G52).
- 독립 `seiri:verify`(최초 기준선 대 diff), PLAN §2 7단계(codex·antigravity 원장 대 구현 대조), PR(base `1.0.0-beta`) 본문에 `request.md` 완료 기준·`verification.md` 리뷰 체크리스트·가칭 확정 표·레거시 이동 목록(이동 0)·미룬 사례와 PR 번호(§6.2)·어긋남 ID(§2.2)·열린 질문의 처리. PR 뒤 `filid:enrich-docs`, filid 스캔 1회(G50), `seiri:request-review`, 독립 검증자 판정(G51).

## 5. 요구사항 → 단위 → 검증 추적표

요구사항 ID는 두 원장 목록(`ledger-dispatch.md`의 R·X·C, `ledger-validation.md`의 G·B·P·R·S·O·W와 게이트)과 코드 지도 §A다. 검증 칸의 태그는 시험 이름에 실린 문자열이며 게이트가 찾는다. "제외"는 원장이 다른 PR에 둔 것이다.

### 5.1 디스패치·통지·명령(`ledger-dispatch.md`)

| 요구사항 | 원장 | 단위 | 검증 |
| --- | --- | --- | --- |
| R1.01–R1.04 루트 디스패처 하나, 한 순회, 배달 집합, 커밋 때 원장 일괄 | EVENT-004·006·007·066 | U4, U5a | `settle.delivery.test.ts`(`EVENT-006 delivery set`, `EVENT-007 revision at commit`), `dispatch.waves.test.ts`(`EVENT-004 one traversal`) — G10·G11·G13·G14 |
| R1.05–R1.07 파동, 깊이 ≥ 2의 되먹임, 예산 초기화 | EVENT-008·020 | U5a | `dispatch.waves.test.ts`(`EVENT-008 next wave`), `dispatch.budget.test.ts`(`EVENT-008 budget reset`) — G14 |
| R1.08–R1.09 사용자 함수 안 공개 쓰기 = 되먹임, 초과는 사슬 끝, 진단 아님 | EVENT-008·020, CONTROLS-079 | U5a | `dispatch.budget.test.ts`(`EVENT-008 user function write`, `CONTROLS-079 injectTo write feedback`) — G14 |
| R1.10–R1.11 떼어진 노드 건너뜀, 리스너 목록 고정 | EVENT-009·011 | U5a | `dispatch.waves.test.ts`(`EVENT-009`, `EVENT-011`) — G14 |
| R1.12 리스너 격리와 사슬 끝 묶음·기록 | EVENT-010, ERROR-005 | U5a, U5b | `dispatch.waves.test.ts`(`EVENT-010`), `dispatch.bundle.test.ts` — G14·G16 |
| R1.13 상태 칸 쓰기·명령은 정착 입력·진입 아님 | EVENT-012 | U6 | `dispatch.state.test.ts`(`EVENT-012`) — G18 |
| R1.14–R1.16 진입의 정의, 깊이 1 → 0 순서, dispatch 소유·겉면 위임 | EVENT-027, LANDING-064·084 | U5a, U9 | `dispatch.entry.test.ts`(`EVENT-027 entry`), `surface.test.ts` — G14·G25 |
| R1.17–R1.18 예산 초과에도 커밋·검증 요청·`onChange`, 26번째 중첩 | EVENT-021·022·034 | U5a | `dispatch.budget.test.ts`(`EVENT-021`, `EVENT-034`) — G14 |
| R1.19 재생성 reset의 사슬 넘김 | EVENT-030 | U5a | `dispatch.entry.test.ts`(`EVENT-030 adopt chain`) — G14 |
| R1.20 `UpdateDiagnostics` | EVENT-043, SURFACE-007 | U4 | `settle.delivery.test.ts`(`EVENT-043`) — G11 |
| R1.21 `UpdateJsonSchema` | EVENT-064, SURFACE-057 | U4 | `settle.delivery.test.ts`(`EVENT-064`) — G11 |
| R1.22 계산 상태 비트에 `watchValues` | 28C-07 | U4 | `settle.delivery.test.ts`(`28C-07 watchValues bit`) — G11 |
| R1.23 정착 통지 단계의 문서 순서 | SETTLE-007 | U5a | `dispatch.waves.test.ts`(`SETTLE-007 document order`) — G14 |
| R1.24 진입 깊이·예산 칸 | 26C-06 | U2, U4 | `record/DETAIL.md`(G3), `record.test.ts` — G12 |
| R1.25 겉면 멤버 | 26C-01 | U9 | `surface.test.ts`(`26C-01 PR-4 member list`) — G25 |
| R1.26 두 관리자 교체, 새 fractal, 원장 개념·세대·`transformErrors` 유지 | LANDING-084 | U2, U5a, U8 | G3, `validation.run.test.ts`(`VALIDATE-006 generation`) — G23 |
| R1.27 시험 전용 주입 자리 없음, 실제 술어 | TEST-069 | U7 | G20(`ifPredicates` 0), G21 |
| R2.01–R2.11 `batch` | EVENT-013–017·019·035·061 | U5a | `dispatch.batch.test.ts`(`EVENT-013`…`EVENT-061`) — G14 |
| R2.12 `resetSubtree()`의 batch 안 즉시 정착은 그 하위 트리 | EVENT-072 | U5a, U8 | `dispatch.batch.test.ts`(`EVENT-072`), `validation.run.test.ts`(`18C-101`) — G14·G23 |
| R2.13 `FormHandle.batch` | SURFACE-008 | 제외(07) | — |
| R3.01–R3.02 최외곽 진입당 `onChange` 한 번, 참조 비교 | EVENT-026·031, LANDING-022 | U5a | `dispatch.onChange.test.ts`(`EVENT-026`, `EVENT-031`) — G14 |
| R3.03–R3.04 reset의 검증 요청 예외, 하위 트리 | EVENT-032·072 | U5a, U8 | `dispatch.onChange.test.ts`(`EVENT-032`) — G14 |
| R3.05–R3.06 `onChange` 안 쓰기 새 진입, 중첩 25 | EVENT-033·034 | U5a | `dispatch.onChange.test.ts`(`EVENT-033`) — G14 |
| R3.07 리스너 안 `setValue`·`RequestRefresh` 배달 수 | EVENT-071, 26C-03 | U4, U13 | `settle.delivery.test.ts`(`EVENT-071 refresh delivery count`) — G11 |
| R3.08 이펙트 순환·문서 | EVENT-036·070 | 제외(07·08) | — |
| R4.01–R4.02 정착 밖 사건, `UpdateState` 합침, `onStateChange` 한 번 | EVENT-045·067 | U6 | `dispatch.state.test.ts`(`EVENT-045`, `EVENT-067`) — G18 |
| R4.03–R4.04, R4.06 검증 결과 파동, 결과 파동 리스너 예외, dispatch의 콜백 | EVENT-046, LANDING-084 | U8 | `validation.run.test.ts`(`EVENT-046`) — G23 |
| R4.05 유효 스키마 변경은 정착 파동 | EVENT-045·064 | U4 | G11 |
| R4.07 `UpdateValue` 출처 칸 | WRITE-096 | U4 | `settle.delivery.test.ts`(`WRITE-096 source`) — G11 |
| R4.08 렌더 계층 구독 | — | 제외(07) | — |
| R4.09 `RequestEmitChange`·`RequestInjection` 없음 | LANDING-170 | U4 | `settle.delivery.test.ts`(`LANDING-170 no emit-change bit`) — G11 |
| R5.01–R5.07 `request(kind)`, 종류 하나, 열거 별칭, 둘째 인자 없음, 원본 불변, 비트 합침, `publish` 없음 | EVENT-063·073 | U6, U9 | `dispatch.request.test.ts`(`EVENT-073`), `type-contract.test.ts` — G18·G25 |
| R5.08–R5.09 멤버 표·멤버 목록 시험·공개 형·08 §13 행 | EVENT-063, SURFACE-058 | U9 | G25. 08 §13 행은 `ARCH/_archive`의 설계서라 고치지 않고 PR 본문에 적음 |
| R5.10–R5.12 Refresh·Remount 뜻, 로드 아닌 쓰기의 Refresh 대상 | EVENT-039·040·071 | U4 | `settle.delivery.test.ts`(`EVENT-039`, `EVENT-071`) — G11 |
| R5.13 `RequestRemount` 유지 | EVENT-037 | U6 | `dispatch.request.test.ts`(`EVENT-037`) — G18 |
| R5.14 `FormHandle` 명령 | EVENT-073 | 제외(07) | — |
| R5.15 열거 이름 | `reviews/round-30-owner-answers.md:8` | U2, U4 | 가칭 표(G6), `SchemaNodeRequestType` 시험 — G18 |
| R6.01–R6.03 훅 시험 | REACT-006, LANDING-064·080, TEST-017 | U14 | G40 |
| R6.04 core는 `app/plugin`을 가져오지 않음 | REACT-002, CONTROLS-075 | U2, U10 | G4, G28 |
| R6.05 렌더 계층 | REACT-007·011·012, LANDING-170 | 제외(07) | — |
| R7.01 레거시 이동 | LANDING-159·205 | U1 | G2 |
| R7.02 import 분리 | LANDING-064 | U10 | G28·G29 |
| R7.03 루트 `''` | FRAGMENT-053, LANDING-093 | U10, U11 | G28, G30·G32·G34 |
| R7.04 경계 린트 | CONTROLS-075 | U2 | G4 |
| R7.05 공개 진입점은 07까지 옛 엔진 | LANDING-159 | U9 | G27 |
| R8.01–R8.03 TEST-017 목록 | TEST-017 | U5a–U8, U11–U14 | G14·G16·G18·G21·G23·G37·G40 |
| R8.04 되먹임·중첩 예산, 사슬 끝 throw | TEST-069 (다) | U5a | G14 |
| R8.05 실제 가드 재실행 | TEST-069 (나) | U7 | G21 |
| R8.06 `selfcheck-v5` g, `r7-port` X2·X3·D-17 | TEST-069 (라) | U13 | G38 |
| R8.07 경고 중복 키 초기화 | ERROR-204 | U5b | `dispatch.warning-key.test.ts`(`ERROR-204`) — G16 |
| R8.08 `VALIDATOR_COMPILE_FAILED` 폼 수준 기록 | WRITE-099 | U8 | `validation.compile-failed.test.ts`(`WRITE-099`) — G23 |
| R8.09 `resetSubtree()` 게이트(검증 몫) | EVENT-072 | U8 | `validation.run.test.ts`(`18C-101`) — G23 |
| R8.10 WRITE-093의 05 몫(귀속·경고 코드) | WRITE-093 | U3, U8 | G7, `validation.route.test.ts`(`WRITE-093`) — G23 |
| R8.11 컴파일 예산 | TEST-072·076 | U15 | G41–G43 |
| R8.12 플러그인 시험 파일 | TEST-077 | U11 | G31·G33·G35 |
| R8.13 차등 스위트 | LANDING-071 | U12b | G37 |
| R8.14 18C 게이트 소속 메모 | — | 5.2 | — |
| X1–X8 | (각 줄) | 제외 | §1 비목표 |
| C1–C10 원장 안 긴장 | (각 줄) | 해석 | C1·C2·C3·C4 → I4·I5(30라운드가 이김), C5 → I4·I8(31C-01), C6 → 제외(07, `ledger/test.md:358`), C7 → WRITE-099가 이김(U8), C8 → 18라운드가 이김(재귀 예산, 03), C9 → 원장 PR 번호와 단계 번호의 차이(LANDING-204), C10 → 26C-03이 PR-4에 배달 수를 둠(U4) |

### 5.2 검증기·검증·`onError`(`ledger-validation.md`)

| 요구사항 | 원장 | 단위 | 검증 |
| --- | --- | --- | --- |
| G-01 내장 검증기 없음 | VALIDATE-014, ERROR-143 | U7 | 의존 방향 시험(`validation` 비시험 파일에 `ajv` 없음) — G12 |
| G-02–G-03 `Validator` 형, `bind`는 core가 부르지 않음 | VALIDATE-044 | U3, U7 | `type-contract`(G9), `validation.cache.test.ts`(`VALIDATE-044 core never binds`) — G19 |
| G-04 속성 `validatorFactory`가 `Validator`를 받음 | VALIDATE-044 (1), LANDING-036 | 제외: 07(32C-01) | — |
| G-05–G-07 고르는 순서·없음·참조 바뀌면 재생성 | VALIDATE-042·044 | U7(인자·없음), U10(레거시 순서 유지), 07(바인딩) | `validation.missing.test.ts` — G19 |
| G-08–G-09 `app/plugin` 금지, 린트 범위 | CONTROLS-075 | U2, U10 | G4·G28 |
| G-10–G-14 `compile`·`compileGuard` 서명, 동기, 같은 boolean, 사본, 루트 문맥 | VALIDATE-015–017·044 | U3, U7, U11 | `validation.guard.test.ts`(`VALIDATE-044 non-boolean`), 플러그인 `guard-scope.test.ts` — G19·G31·G33·G35 |
| G-15–G-18 캐시 단위·정체 공유·전체 함수·팩토리 인스턴스 | VALIDATE-018·048 | U7 | `validation.cache.test.ts`(`VALIDATE-048`) — G19 |
| G-19 플러그인은 가드 캐시 없음, 등록은 인스턴스 | VALIDATE-019 | U11 | `release.test.ts` — G31·G33·G35 |
| G-20–G-22 깊이 복사 한 번, 그룹 객체만 제거, `options.virtual` | VALIDATE-001·004·005·034·050 | U7 | `validation.copy.test.ts`(`VALIDATE-050`, `VALIDATE-034`) — G19 |
| G-23–G-26 늦은 컴파일·개발 모드 일괄·실패는 가드 실패·미평가 무기록 | ERROR-041 | U7 | `validation.guard.test.ts`(`ERROR-041`) — G19 |
| G-27 전체 컴파일 실패는 검증 불가 | ERROR-155 | U8 | G23 |
| G-28 `rejectedKey` | FRAGMENT-020 | U11, U8 | `rejected-key.test.ts`, `validation.route.test.ts` — G23·G31·G33·G35 |
| G-29–G-30 루트 `''` 정규화, 플러그인·폴백 | FRAGMENT-053 | U8, U10, U11 | `validation.route.test.ts`(`FRAGMENT-053`) — G23·G28 |
| G-31–G-40 수명·참조 세기·최근 해제 목록·`release`·같은 객체 재마운트·`FinalizationRegistry` 아님 | VALIDATE-021·045 | U8, U11 | `validation.lifetime.test.ts`(`VALIDATE-045 live plus 8`, `VALIDATE-021`) — G23 |
| G-41–G-42 같은 `$id` 떼어 두기, 재생성 원자성 | VALIDATE-046, ERROR-201 | U11, U8 | `same-id.test.ts`, `validation.same-id.test.ts` — G23·G31·G33·G35 |
| G-43–G-44 가드 = 전체 검증의 `if`, `if` 내용 안 읽음·공허한 참 경고 없음 | VALIDATE-047, ERROR-198 | U11, U7 | `guard-scope.test.ts`, `validation.guard.test.ts`(`ERROR-198 no vacuous warning`) — G19 |
| G-45 가드·검증 인스턴스 같은 설정, 가드는 `allErrors: false` | VALIDATE-033 | U11 | `guard-scope.test.ts`(`VALIDATE-033`) — G31·G33·G35 |
| G-46 `Validator` 문서 주석 | VALIDATE-044·050 | U3 | 문서 주석 검사(G8의 grep) |
| G-47 인터프리터형 검증기 허용, 폼 기제 없음 | VALIDATE-027·032 | U2 | `validation/DETAIL.md`(G3) |
| G-48 기각안(내장 검증기) | VALIDATE-028 | 작업 없음 | ADR 0004가 이미 기각 |
| G-49 플러그인 패키지 범위 | VALIDATE-025 | U11 | G30–G35 |
| G-50 `ValidateFunction` 문서 주석 | ERROR-032·039 | U3 | G8 |
| G-51 `ValidationIssue` 개명(공개 별칭 `JSONSchemaError`는 07까지 유지) | ERROR-032, LANDING-024·070, 34C-02 | U3 | G8 |
| G-52 `None`은 판정 없음 | VALIDATE-008 | U8 | `validation.run.test.ts`(`VALIDATE-008`) — G23 |
| G-53–G-54 판정의 정의, 스탬프, 방출 값 직렬화 동치·복사 없음 | VALIDATE-001·006·007·051 | U8, U12b | G23·G37 |
| G-55 `&if`만의 판별 무효 | VALIDATE-036 | U12b | G37 |
| G-56 컴파일 예산 | TEST-072·076 | U15 | G41–G43 |
| G-57 차등 | TEST-001·017 | U12b | G37 |
| B-01–B-09 `bind` 거부와 시험 | VALIDATE-050, TEST-077, ERROR-100 | U11 | `bind-refusal.test.ts` — G31·G33·G35 |
| B-10–B-11 같은 설정, 기본값 불변 | VALIDATE-002·003 | U11 | `bind-refusal.test.ts`(`VALIDATE-003 defaults`) |
| P-01–P-07 동기 `compileGuard`, 형 가져오기, 캐시는 core, `release`, 루트 `''`, `required` 경로, 정규화 | LANDING-070, VALIDATE-019·043·044·045, FRAGMENT-053 | U11 | G30–G35 |
| P-08–P-09 ajv8 `allowUnionTypes`와 시험 | VALIDATE-051, BLUEPRINT-044, TEST-077 | U11c | `union-types.test.ts` — G35 |
| P-10 기본 ajv8의 draft-07·`validateFormats: false` 문서 | VALIDATE-002 | U11c | README 문단(G35의 파일 검사) |
| P-11 방언 선언과 `DIALECT_MISMATCH` | VALIDATE-026·044, ERROR-188·199, LANDING-064 | U3, U8, U11c | `validation.dialect.test.ts`(`ERROR-188`, 트리 생성·개발 모드 전용·`onError` 기록) — G22·G23; ajv8 진입점의 `dialect` 선언 — G35 |
| P-12–P-13 게이트 적용 범위, `$ref` 아래 `schemaPath` 모양 | VALIDATE-043·046·047 | U11, U8 | `routing-shapes.test.ts`, `validation.route.ajv-shapes.test.ts` — G23 |
| R-01–R-03, R-05–R-07 판정 불변, 폼 수준 목록, `dataPath` 배정, 터미널, 형상 밖 | VALIDATE-043·009 | U8 | `validation.route.test.ts`(`VALIDATE-043`) — G23 |
| R-04 `rejectedKey`는 호스트 | VALIDATE-043 (3) | U8 | 같은 파일 |
| R-08–R-11 꺼진 분기 거르기와 무력 조건, 거르지 않는 것, 조각 표 | VALIDATE-043 (5) | U8 | `validation.route.test.ts`(`VALIDATE-043 rule 5`) |
| R-12–R-13 union 호스트·판별자 노드 | VALIDATE-043 (6) | U8 | 같은 파일 |
| R-14 중복 메시지·번역 | VALIDATE-043 (6) | 제외(렌더 계층) | — |
| R-15 검증 결과에 새 코드 없음 | VALIDATE-043 | U3 | G7(표에 없음) |
| R-16–R-17 union 형 오류는 union 노드, 규칙 A는 검증기 아님 | VALIDATE-051 | U8 | `validation.route.test.ts`(`VALIDATE-051`) |
| R-18 주인 없는 검증 오류 싱크 | VALIDATE-011 | U8 | 같은 파일 |
| R-19 표시 기제 없음 | VALIDATE-010 | U8 | G24 |
| R-20 ajv 셋의 귀속 시험 | 18C-53 | U8, U11 | G23 |
| S-01 로드 뒤 검증(마운트 요청은 렌더 계층) | ERROR-040 | U5a(reset 끝 요청), 07(마운트 준비) | G14 |
| S-02 `resetSubtree()` 하위 트리 | 18C-101 | U8 | G23 |
| S-03–S-04 `VALIDATOR_THREW`, 핸들러 안 `validate()` 문서 | ERROR-029·039 | U8, U2 | `validation.run.test.ts`(`ERROR-039`) — G23 |
| S-05–S-09 검증 불가 | ERROR-155–157, WRITE-099 | U8 | `validation.compile-failed.test.ts` — G23 |
| S-10 경고 키 초기화 | ERROR-204 | U5b | G16 |
| S-11 일괄 컴파일은 항목마다 | VALIDATE-048 | U7 | G19 |
| S-12–S-13 `validate()` 거부 전 기록, 마이크로태스크 경로 | ERROR-019 | U8, U5b | G16·G23 |
| S-14 `degraded` 제출 | ERROR-138·139 | 제외(07) | — |
| S-15 스탬프·합치기 | VALIDATE-049 | U8 | `validation.run.test.ts`(`VALIDATE-049`) — G23 |
| O-01–O-04 기록 형·코드 형·모양·`message` 규칙 | ERROR-013·017 | U3, U5b | G7·G16 |
| O-05–O-10 보고기 인자·`hasConsumer` 판정·늦은 핸들러·무소비자 할당 0 | ERROR-013·030 | U5b | `dispatch.report.test.ts`(`ERROR-030 no consumer allocation`) — G16 |
| O-11–O-13 받는 것·받지 않는 것·제출 거부 기록 | ERROR-014·016·100·101 | U5b, U8 | `dispatch.report.test.ts`(`ERROR-101`) — G16 |
| O-14–O-15 사건마다 한 기록·순서·호출자 오류 시점 | ERROR-004·019 | U5b | `dispatch.report.test.ts`(`ERROR-019`) — G16 |
| O-16–O-17 환경 동일, 핸들러가 기본 드러남을 못 바꿈 | ERROR-021·022·096·097 | U5b | `dispatch.report.test.ts`(`ERROR-021`, `ERROR-022`) — G16 |
| O-18–O-21 중복 방지·묶음·핸들러 예외 | ERROR-005·023·028 | U5b | `dispatch.bundle.test.ts`(`ERROR-005`, `ERROR-028`) — G16 |
| O-22 전달 중 쓰기 거부 | ERROR-029 | U5b, U6 | `dispatch.observer-write.test.ts`(`ERROR-029`) — G16 |
| O-23–O-25 경고 구조 키·초기화·청사진 경고 | ERROR-024·204 | U5b | `dispatch.warning-key.test.ts`(`ERROR-024`) — G16 |
| O-26–O-27 정착 경고·`RESET_REBUILT_BY_REFERENCE`의 소비자 조건 | ERROR-196, 31C-02 | U5b | `dispatch.report.test.ts`(`ERROR-196`) — G16 |
| O-28 `FormErrorCode` 이름 수출 | ERROR-031 | U3 | G7 |
| O-29 `onListenerError`·`throwOnBudgetExceeded` 없음 | ERROR-072·099 | U5b | `dispatch.report.test.ts`(`ERROR-099`) |
| O-30 서버 | ERROR-025 | 07(이펙트) — 싱크 서버 분기만 U5b | `dispatch.report.test.ts`(`ERROR-008`) |
| O-31 주인 없는 싱크 | ERROR-008 | U5b | 같은 파일 |
| O-32 사슬 끝 throw의 환경 무관 | ERROR-070 | U5a | `dispatch.budget.test.ts`(`ERROR-070 all environments`) — G14 |
| O-33 `NON_JSON_WHOLE_VALUE` 개발 모드 | WRITE-099, VALUE-037 | U5b | `dispatch.report.test.ts`(`WRITE-099 dev only`) — G16 |
| O-34 TEST-017의 core 목록 | TEST-017 | U5b, U7, U8, U11, U12b | G16·G19·G23·G37 |
| O-35 이주 안내 | ERROR-042 | 제외(08) | — |
| W-01–W-03 검증기 없음·조건부 경고·검증기 원천은 청사진 오류 아님 | ERROR-144–154 | U7 | `validation.missing.test.ts`(`ERROR-146`, `ERROR-153`) — G19 |
| W-04 `DIALECT_MISMATCH`·`NON_JSON_WHOLE_VALUE`·`TYPE_MISMATCH` | ERROR-186·188, VALUE-037 | U3, U5b, U8 | G7·G16·G23 |
| W-05 공허한 참 경고 없음 | ERROR-198 | U7 | G19 |
| W-06 같은 `$id`의 `reason` | ERROR-201, 31C-03 | U8 | `validation.same-id.test.ts`(`31C-03 duplicateSchemaId`) — G23 |
| W-07 가칭 확정, `INJECT_TARGET_NOT_FOUND` 삭제 | ERROR-164·198, 31C-05 | U2, U3 | G6·G7 |
| 게이트 VALIDATE-046 (i)–(iv) × ajv6·7·8 × 기본·`bind` | VALIDATE-046, 18C-57 | U11 | `same-id.test.ts` — G31·G33·G35 |
| 게이트 VALIDATE-047 (i)–(iv) ajv7·8, ajv6 (i) | VALIDATE-047, 18C-58 | U11 | `guard-scope.test.ts` — G31·G33·G35 |
| 게이트 VALIDATE-045 1,000 마운트 | 18C-56 | U8 | G23 |
| 게이트 VALIDATE-043 ajv 셋 귀속 | 18C-53 | U8, U11 | G23 |
| 게이트 WRITE-099 검증 불가 기록 | 18C-105 | U8 | G23 |
| 게이트 18C-101(검증 몫) | EVENT-072 | U8 | G23 |
| 게이트 18C-25 실제 가드 재실행 | TEST-069 (나) | U7 | G21 |
| 게이트 BLUEPRINT-044(ajv8 설정) | 18C-90 | U11c | G35 |
| 게이트 ERROR-204(키 초기화) | 26C-02 | U5b | G16 |
| 게이트 TEST-072·076 | 18C-30 | U15 | G41–G43 |
| 모순 1–9 | (각 줄) | 해석 | 1 → I9(31C-02), 2 → 제외(07), 3 → I21(31C-03), 4 → I22, 5 → I23, 6 → I10(Q5 답), 7 → ERROR-204 충돌 줄이 이김(U5b), 8 → 모순 아님(가드 시점이 두 차이 중 하나), 9 → I17(31C-04) |
| 코드 표 Part A·B(살아 있는 코드 60) | ERROR-164·198 | U3 | G7 |

### 5.3 03·04에서 넘어온 사례(코드 지도 §A)

| 넘김 | 원천 | 단위 | 검증 |
| --- | --- | --- | --- |
| `round9/r9.mjs:76`(경고 4)·`:80`(검증기 결과 4) | 03 `log.md:98` | U13 | `r9-notify.test.ts` — G38 |
| `round9/regress/selfcheck-v5.mjs:348`(통지) | 03 `log.md:98` | U13 | `selfcheck-v5-notify.test.ts` — G38 |
| WRITE-015 "`batch` 안에서도 억제가 이김" | 03 `log.md:66,101` | U5a | `dispatch.batch.test.ts`(`WRITE-015 suppression in batch`) — G14 |
| 8행 ERROR-204 경고 중복 키 초기화 | 03 `log.md:114` | U5b | G16 |
| 10행 EVENT-071 배달 수, WRITE-096 출처 칸 | 03 `log.md:116` | U4 | G11 |
| 12·18행 `round18/proto/__tests__/rootOutput.test.mjs:40` | 03 `log.md:118,124` | U13 | `root-output-notify.test.ts` — G38 |
| 13행 `round9/regress/r7-port.mjs` D-17·X2·X3·E4·E6 | 03 `log.md:119` | U13 | `r7-port-notify.test.ts` — G38 |
| 14행 `selfcheck-v5` 무리 g(8) | 03 `log.md:120` | U13 | `selfcheck-v5-notify.test.ts` — G38 |
| 5행 `if` 게이트만 대역 뒤, 가드 컴파일은 05 | 03 `log.md` §4 | U7 | G20·G21 |
| 04 `execution-plan.md:23` `compileGuard`와 실제 가드 재실행 | 04 | U7 | G21 |
| 04 `:24` 통지·배달·`batch`·출처 칸·`resetInteraction` 배달 | 04 | U4, U5a | G11·G14 |
| 04 `:52` I13 `injectTo` 안 공개 쓰기 | 04 | U5a | G14 |
| 04 `:55` I16 `r8-port` P1 iii `batch` 두 변형, `r7-port` E3·X3c `batch` 변형 | 04 §6.2 | U13 | `r8-port-notify.test.ts`, `r7-port-notify.test.ts` — G38 |
| 04 `:60` I21 오류 코드 이름 확정 | 04 ADR D6 | U3 | G7 |
| 04 `:371` 계산 상태 비트 배달 | 04 §6.2 | U4 | G11 |
| `performance-issues.md` P-03 | 03·04 | U15 | `performance.md`의 기록 — G41 |

## 6. 회귀 이식과 넘기는 사례

### 6.1 05 몫(TEST-069 (라))

원천 경로는 모두 `ARCH/spikes/` 아래다. `r7-port.mjs`·`r8-port.mjs`는 로그만 내는 탐침이라 기대값은 기록된 출력(`round9/regress/r7port-new-output.txt`, `round9/regress/r8port-output.txt`)에서 읽는다. `round18/proto/REPORT-v7.md`에는 05 몫 사례의 기대 치환이 없다. 프로토타입 스위치 가운데 현행 원장의 구성 하나만 이식하고(04 I14와 같은 방식), 현행 원장과 다른 기대는 원장 ID를 시험 이름에 실어 바꾼다.

| 원천 | 05로 옮기는 것 | 수 | 기대값 |
| --- | --- | --- | --- |
| `round9/r9.mjs` P3 | `:76` 경고 수, `:80` 검증기 결과 × `oneOf`·`anyOf` × `else` 있음·없음 | 8 | `else` 있음 0, 없음 2(`IF_WITHOUT_ELSE_FALSE`가 보고기 기록으로); 검증 배열 `oneOf`+else `[true,false,false]`, `oneOf` 없음 `[false,true,false]`, `anyOf`+else `[true,false,false]`, `anyOf` 없음 `[true,true,true]`(`round9/r9-output.txt:3-7`) |
| `round9/regress/selfcheck-v5.mjs` | A8a/E11 `:348` | 1 | `zip:=''` 쓰기에 루트 방출 참조 유지, 통지 0 |
| `round9/regress/selfcheck-v5.mjs` 무리 g | g1 `:681` 배달 순서, g2 `:696` 파동 페이로드와 커밋, g3 `:712` 1,000 쓰기 `batch` 한 정착·한 파동, g4 `:723` 리스너 격리, g6 `:745` 같은 값 무통지, g7 `:756` Refresh 대상, g8 `:765` 파동 상한 | 7 | g8은 원천의 41파동·`wave-cap-exceeded`가 옛 상한이라 현행 EVENT-020(되먹임 25, 사슬 끝 `FEEDBACK_LIMIT_EXCEEDED`)으로 바꾼다. g4의 `lastSettle.errors`는 사슬 끝 throw(EVENT-010)로. g5 `:736`(배열 행 제거)은 06으로 넘김(§6.2) |
| `round18/proto/__tests__/rootOutput.test.mjs` | `:40` 마지막 루트 필드를 비우면 `onChange`가 `{}`를 받음 | 1 | `{}` |
| `round9/regress/r7-port.mjs` | D-17 `:478-519`, X2 `:296-318`, X3 `:320-336`, E4 `:129-161`, E6 `:163-181`, E3 `batch` 변형 `:87-127`, X3c `batch` 변형 `:338-347` | 7 | D-17·E6의 "한 틱 30 쓰기 → 25에서 걸림"은 틱 단위 예산이라 현행 EVENT-008(최외곽 사슬마다 초기화)로 바꿔 각 쓰기가 자기 진입이고 걸리지 않음을 단언, 되먹임 사슬 30은 26번째에서 사슬 끝 throw. X2 `batch` = `{kind:'b', x:'B'}`, X3은 현행 정착 범위 행만(`batch` → `{tgt:'mine'}`), E4 리스너 되돌림 `onChange` 1·검증 1 / `batch(bad, orig)` `onChange` 0·검증 0, E3·X3c `batch` 최종 `tgt:'mine'` |
| `round9/regress/r8-port.mjs` | P1 iii `batch_a2_dMine`·`batch_dMine_a2` `:61-86` | 2 | 둘 다 `"f(2)"` |
| 새로(원천 없음) | WRITE-015 `batch` 안 억제, `injectTo` 안 공개 쓰기(CONTROLS-079), `resetInteraction` 배달(EVENT-066), `UpdateValue` 출처 칸(WRITE-096), 계산 상태 비트(EVENT-064, 28C-07) | 5 | 원장 문장대로 |
| 합계 | | 26 + 새 5 | |

### 6.2 05에서 다시 넘기는 사례

| 사례 | 까닭 | 받는 단계 |
| --- | --- | --- |
| `selfcheck-v5.mjs` g5 `:736`(파동 중 배열 아이템 제거) | 배열 행은 PR-5 | 06 |
| `FormHandle` 명령 넷·`batch`, 렌더 계층 `onError`, 마운트 가리기, `degraded` 제출 거부, React 18 실행, 바인딩의 검증기 선택과 참조 세기 이펙트 | PR-7(§1 비목표) | 07 |
| 배열 동사의 dispatch 진입 | 33C-01: 뒤에 머지하는 단계가 더함 | 06 또는 05 U16a |

## 7. 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 06이 병렬로 같은 겉면 파일(`SchemaNode.ts`, `SchemaNode/DETAIL.md` 멤버 표, `surface.test.ts`, `type.ts`, `type-contract.test.ts`, `core/index.ts`)과 `record/type.ts`에 멤버·칸을 더해 두 번째 머지에서 충돌 | 05의 추가를 파일마다 연속한 한 덩어리로 둔다. 오류 저장은 레코드 필드가 아니라 런타임 칸에 두어 레코드 칸 충돌을 줄인다(ADR D3). 뒤에 머지하는 쪽이 갱신된 `1.0.0-beta`를 merge(rebase 없음)하고 U16a의 파일별 규칙으로 풀며 G44가 합집합을 확인한다. 05가 뒤면 배열 동사 진입 파일 다섯도 05가 더한다(G45, 33C-01) |
| 레코드 필드 `revision` 개명이 03·04 시험과 커밋을 흔듦 | U4에서 개명과 시험 이전만 하고 전체 unit을 돈다(G12). 비트별 원장 의미가 커밋당 +1 단언과 다르면 시험 이름에 EVENT-007을 싣고 바꾼다 |
| 술어 대역을 실제 가드로 옮기며 기대값이 바뀜 | 기대값을 바꾸지 않는 이전만 한다(U7). 바뀌면 멈추고 그 사례를 `log.md` §4에 적어 원장과 대조한다(TEST-069 (나)의 목적) |
| ajv `addSchema` 등록과 `compile`의 `$async` 감쌈이 같은 `$id`로 부딪힘 | 플러그인이 루트를 한 번 등록하고 `compile`·`compileGuard`가 그 등록을 공유한다(U11). VALIDATE-046 (i)이 판정한다 |
| `bind` 인스턴스를 같은 설정으로 복제할 수 없음 | VALIDATE-046의 실패 줄대로 소유자에게 (a)·(b)를 올린다. 기본 인스턴스 게이트는 계속 |
| 공개 형 이름 `JSONSchemaError`를 잃으면 바깥 소비자와 스토리의 형 검사가 깨짐 | 지우지 않는다: `src/index.ts`가 `ValidationIssue`를 더해 내보내고 `JSONSchemaError`를 `ValidationIssue`의 형 별칭으로 07까지 남긴다(I13, 34C-02). 별칭 삭제는 LANDING-024 이주 21(PR-7 또는 PR-8 이주 안내)이다. 던지는 클래스 `JSONSchemaError`는 오늘처럼 이름으로 공개하지 않으므로 같은 이름의 값·형이 공개 색인에서 겹치지 않는다. ajv 셋의 소스와 스토리는 PR-4에서 `ValidationIssue`로 옮긴다(LANDING-070). G8이 별칭 유지와 `Validator` 비공개를 확인한다 |
| 레거시 폴백 `''`가 레거시 렌더의 루트 오류 표시를 바꿈 | U10의 경계 있는 탐색과 레거시·render 시험(G29). 기대는 자리가 있으면 멈춤 |
| core만 쓰는 호스트가 등록 플러그인 폴백을 잃음 | 원장이 정한 바뀜(CONTROLS-075)이며 PR 본문에 이주 메모 |
| 진입 사슬 비용이 03·04 벤치 행을 떨어뜨림 | 최적화하지 않는다. U15가 재고 `performance-issues.md`에 행을 더한다. 정착 범위 밖 순회가 원인이면 결함이라 고친다 |
| 독립 검증기 설치가 늦어짐 | U12a만 멈춘다. U12b 밖의 모든 단위는 진행한다 |
| `npx vitest`가 샌드박스에서 `.npmrc` 읽기 거부로 실패 | 04 선례대로 `npx`는 샌드박스 안에서 돈다. 실패하면 명령 모양을 고치고 허용 목록을 넓히자고 하지 않는다 |
| storybook이 sandbox 안에서 안 뜸 | 01–04 선례대로 소유자가 sandbox 밖에서 돈다(G52) |
| `! grep` 게이트가 대상 디렉터리가 없을 때 통과함(grep 종료 코드 2를 `!`가 뒤집음) | 부정 grep을 쓰는 게이트(G2·G8·G20·G24·G26·G27·G28·G45)는 앞에 `test -d`/`test -f`로 대상의 존재를 단언하거나 같은 게이트 안의 긍정 단언이 대상을 요구한다 |

## 8. 검증 명령(저장소 루트 = 이 작업 트리)

2026-10-01 확인: `PKG/package.json`의 `lint` = `eslint "src/**/*.{ts,tsx}"`, `test` = `vitest`, `typecheck` = `tsc --noEmit --composite false --rootDir . -p tsconfig.json`; `P6`·`P7`·`P8`은 같은 `lint`·`typecheck`와 `test` = `yarn run -T vitest`(jsdom); vitest 프로젝트 `unit`·`render`·`storybook`(`PKG/vite.config.ts`); `ARCH/ledger/checks/plan-links.mjs`(끝 줄 `problems 0`); `/opt/homebrew/bin/bun`; 루트 `tsx`; `@aileron/benchmark-form`의 `guard:check`(요약 줄 `summary: 0 regression(s)`). 아래 `npx` 형태는 같은 스크립트의 이진을 부르며 성공 표지를 붙이기 위한 것이다(M4).

- 단위 범위: `(cd packages/canard/schema-form && npx vitest run --project unit <경로>)`
- 패키지 unit·render: `(cd packages/canard/schema-form && npx vitest run --project unit --project render)`
- lint·typecheck: `(cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json)`
- 플러그인(셋 각각): `(cd packages/canard/schema-form-ajv8-plugin && npx vitest run && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json)`
- SCN: `(cd packages/aileron/schema-form-scenarios && npx vitest run --config vite.config.ts && npx tsc --noEmit --strict --composite false -p tsconfig.json && npx eslint index.ts "src/**/*.{ts,tsx}")`
- 원장 인용: `(cd packages/canard/schema-form/architecture && node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md)`
- 05 벤치: `(cd packages/canard/schema-form && node --import tsx bench/dispatch-and-validation.bench.ts)` 및 `(cd packages/canard/schema-form && /opt/homebrew/bin/bun bench/dispatch-and-validation.bench.ts)`
- 03·04 벤치 기록 재측정: `bench/node-and-settle.bench.ts`, `bench/derive-and-controls.bench.ts`를 같은 두 엔진으로
- 공개 `<Form>` 선: `yarn workspace @aileron/benchmark-form guard:check`(단독 호출)
- 06과 merge한 뒤의 겉면 합집합: `(cd packages/canard/schema-form && npx vitest run --project unit src/core/SchemaNode/__tests__/surface.test.ts src/core/SchemaNode/__tests__/type-contract.test.ts)`(G44)
- 번들 누출 확인: `(cd packages/canard/schema-form && npx rolldown -c)` 뒤 `dist/index.mjs`·`dist/index.cjs`에서 새 엔진에만 있는 이름(`dispatchSetValue`·`readSchemaNodeGuard`·`routeValidationIssues`)을 찾음

## 9. 리뷰 기록

| 날짜 | 리뷰 | 판정 | 반영 |
| --- | --- | --- | --- |
| 2026-10-01 | `seiri:review-plan`(antigravity, 세션 `15dafbc0`) 1차, HEAD `81649244f` | `rework-required` | 차단 셋(F1 공개 별칭 유지, F2 거짓 통과 게이트, F3 06 머지 절차)·비차단 둘(F4 린트, F5 번호). 32–34라운드와 함께 반영 — [plan-review.md](plan-review.md) |
| 2026-10-01 | 같은 세션 범위 한정 재확인, HEAD `07fbc5878` | `cleared` | 지적 0. 뒤의 35라운드 답 반영은 조율 세션의 근거 대조만(`grounded-only`) — [plan-review.md](plan-review.md) |
