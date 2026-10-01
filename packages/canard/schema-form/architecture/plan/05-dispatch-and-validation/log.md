# 05 통지와 검증 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-10-01, D-1 결정 뒤 05). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 실행 계획은 [execution-plan.md](execution-plan.md)(작성 중), 게이트 원장은 `.seiri/tasks/schema-form-dispatch-and-validation/gates.md`(작성 중).

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 머리

- 선출 이유: 04 PR #351이 머지되어(`54afafb86`) 05·06의 의존(03)이 풀렸다. 06은 바로 착수할 수 있었으나 소유자가 D-1(EVENT-073)을 먼저 정하고 05로 가는 쪽을 골랐다(2026-10-01). D-1은 30라운드로 닫혔다(`reviews/round-30-owner-answers.md:7-14`). 06은 별도 세션이 병렬로 맡는다.
- 브랜치 `feat/schema-form-dispatch-and-validation`, base와 PR base `1.0.0-beta`(`7fa4baa45`). 워크트리 `.claude/worktrees/stage-05`(sparse: `.claude/commands`·`.vscode` 제외 — 샌드박스 쓰기 제한, 개발과 무관).
- 원장 질의는 원장 관리 세션 `albatrion-5c`로 보낸다. 파일 소유: 원장 관리자는 `ledger/**`·`reviews/round-*`·`HANDOFF.md`·`PLAN.md` §5(착수 한 줄 뒤), 이 세션은 `plan/**`·`design/`·`adr/`·`src/**`·`verification/**`·`PLAN.md` §3·§4.
- 06과의 분담(33라운드 33C-01, `plan/06-array/log.md`와 같은 문장): "공개 쓰기 동사의 진입 파일(`src/core/dispatch/`, LANDING-084, 33라운드 33C-01): 배열 동사 다섯(`push`·`pop`·`update`·`remove`·`clear`)은 공개 쓰기 API(EVENT-027)이므로 진입 함수는 `dispatch`가 동사마다 하나씩 소유한다. 그 진입 파일은 나중에 머지하는 단계가 더하고, 그 PR 본문에 진입 파일 추가를 적는다. 두 머지가 끝난 뒤에는 모든 쓰기 동사의 진입이 `dispatch/`에 있고 겉면은 그것으로 위임한다(LANDING-064). `arrayBehavior/`와 노드 겉면은 자기 진입 사슬(깊이 계수, `onChange`, 사슬 끝 throw)을 갖지 않는다. 06이 먼저 머지되면 동사는 03의 겉면 쓰기와 같은 PR-2 꼴이다: settle 호출 하나, 자기 사슬 없음(TEST-069). 그래서 06의 시험은 배열 동사의 `batch` 합침(EVENT-035)이나 진입마다 한 번의 `onChange`를 단언하지 않는다." 노드 겉면 파일(`SchemaNode.ts`, `SchemaNode/DETAIL.md` 멤버 표, `surface.test.ts`, `type.ts`, `type-contract.test.ts`, `src/core/index.ts`)의 충돌도 나중에 머지하는 단계가 푼다.
- 착수 전 확인(`request.md`): LANDING-064의 넷은 18C-52·53·55·56·57·58이 닫음. D-1은 30라운드 — 노드 명령 메서드 `request(kind)` 하나, 종류 값은 내부 `NodeEventType` 요청 비트의 별칭인 TS 열거(이름 `SchemaNodeRequestType` 꼴, SURFACE-056), 한 호출에 종류 하나, 둘째 인자 없음. 폼 핸들 넷은 PR-7이라 이 단계 밖.

## 1. 최초 작업 기준선

| 원문 | 리비전 | sha256(앞 16자) |
| --- | --- | --- |
| `plan/05-dispatch-and-validation/request.md` | `7fa4baa45` | `5eba1ba7b314307a` |
| `plan/05-dispatch-and-validation/adr-and-axes.md` | `7fa4baa45` | `96a6d2051d5dbfb1` |
| `plan/05-dispatch-and-validation/verification.md` | `7fa4baa45` | `582fbf96646c21e6` |
| `ledger/*.md` | `7fa4baa45` | 커밋으로 고정 |
| 03·04에서 넘어온 사례 | `plan/03-node-and-settle/log.md` §4, `plan/04-derive-and-controls/log.md` §4 @ `7fa4baa45` | 커밋으로 고정 |

- 목표: 루트 디스패처와 진입 사슬, `batch`, 명령 메서드 `request(kind)`, `onError`의 core 쪽, 검증기 계약(`compileGuard`·`rejectedKey`·`bind` 거부)과 ajv6·7·8 플러그인 구현, 배달 경로(LANDING-064·084·093).
- 비목표: 렌더 계층의 `onError`와 명령 실행, 폼 핸들 명령 넷(07), UI 플러그인(08), 성능 최적화(27라운드 — 재고 이유만 적음).
- 산출물·완료 기준·게이트: `request.md` "산출물과 완료 기준", `verification.md` 전체. 원장 ID 목록은 두 문서의 "원장 항목 색인".

## 2. 진행

| 날짜 | 단계 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-10-01 | 착수 | 상황판 05 → 진행. 이 기록 작성 | `3f594ccef` |
| 2026-10-01 | U0 | 원장 요구사항 묶음 둘(디스패치·통지·명령, 검증기·`onError`·플러그인)과 넘어온 사례·코드 지도를 Claude scout(sonnet) 셋이 모음 — 자료 수집은 구현·리뷰 배정 밖. 원장 질의 Q1–Q7을 원장 관리 세션에 보냄 → 31라운드 31C-01~05로 닫힘(명령은 진입이 아니고 진입 밖이면 호출 안에서 동기 배달, 개발 모드만의 경고 예외는 `NON_JSON_WHOLE_VALUE` 하나, `reason` 값은 원장이 이름 붙인 것만, 차등 오라클은 ajv 아닌 구현, 가칭 이름은 이 PR이 확정) | `reviews/round-31-closing.md`(`f0dca3e67`) |
| 2026-10-01 | U0 | 실행 계획·구조 결정·게이트 원장 초안(Claude opus 서브에이전트 — 계획 작성은 구현·리뷰 배정 밖). `plan-links` problems 0. 31라운드를 merge(`81649244f`, 상황판 §5 끝 행 충돌은 두 행 모두 살림). 남은 원장 질의 O1(`validatorFactory` 통일의 범위)·O3(`VALIDATOR_BIND_REFUSED`의 클래스)를 원장 관리 세션에 보냄. 06과 공유 파일 분담 합의(두 번째로 머지하는 단계가 겉면 충돌과 배열 동사의 진입 파일을 맡음) | `2e1098d23`, `execution-plan.md`, `execution-adr.md` |
| 2026-10-01 | U0 | 계획 리뷰(seiri `review-plan`)를 antigravity에 맡김 | — |
| 2026-10-01 | U0 | 계획 리뷰 1차 `rework-required`(F1–F5) → 수정과 32–34라운드 반영 → 범위 한정 재확인 `cleared`. 35라운드 답(35C-07: 플러그인 셋 모두 네이티브 `Error` 하위 클래스, `dialect?`, 공개 `ValidateFunction` 유지)은 조율 세션의 근거 대조만 | `a497e5801`, `bb17d3e79`, `plan-review.md` |
| 2026-10-01 | U1 | G2 충족 — 옮길 레거시 0(03에서 완료) | — |
| 2026-10-01 | U2 | codex 첫 세션(`3fd0c308`)은 도구 연결 시간 초과로 변경 없이 끝났고 이어 쓰기는 "세션 없음"으로 실패. 대체로 띄운 Claude opus 서브에이전트는 소유자 지시("codex로 다시")로 멈추고 그 부분 변경(`eslint.config.js`)을 되돌림. codex 새 세션(`3da53670`)이 새 문서 넷·고친 문서 여덟·경계 린트·가칭 표(75행)를 씀. `src/core` eslint 전후 107 errors로 새 오류 0, G4 충족. 소유자 지시: codex가 계속 실패하면 대체하지 않고 멈춘다 | 이 커밋 |

### 31C-05 가칭 확정

`grep -n "가칭" packages/canard/schema-form/architecture/ledger/*.md`의 292개 일치 줄을 이름별로 합쳤습니다. 원장의 과거 인용은 현행 결정과 보충이 이깁니다. 코드 표 행은 ERROR-164의 새 설계 행과 후속 보충을 따릅니다.

| 이름 | 원장 ID | 처분(확정/유지/삭제) | 확정 이름 | 근거 |
| --- | --- | --- | --- | --- |
| `JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY` | ERROR-164·198 | 확정 | 동일 | 닫힌 목록 밖 키의 청사진 오류. |
| `JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH` | ERROR-164·198 | 확정 | 동일 | 판별 키 오류 네 이유를 한 코드로 둡니다. |
| `JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT` | ERROR-164·198 | 확정 | 동일 | 정적 선언 충돌의 청사진 오류. |
| `JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH` | ERROR-164·198 | 확정 | 동일 | 전략 충돌은 청사진에서 판정합니다. |
| `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` | CONTROLS-079·ERROR-198 | 삭제 | — | `injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `INJECT_TARGET_MISSING`입니다. |
| `JSON_SCHEMA_ERROR.INVALID_CONTROL_SHAPE` | ERROR-164·198 | 확정 | 동일 | 닫힌 목록 안 키의 값 모양 오류이며 `UNKNOWN_GROUP_KEY`와 다릅니다. |
| `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED` | ERROR-189·198 | 확정 | 동일 | 청사진 단계의 무한 재귀 형상. |
| `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH` | ERROR-192·198 | 확정 | 동일 | 같은 가상 이름의 fields 충돌. |
| `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND` | ERROR-193·198 | 확정 | 동일 | 청사진에 없는 자식 이름. |
| `JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED` | ERROR-200·198 | 확정 | 동일 | 행이 하나인 종류의 잘못된 terminal 옵션. |
| `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` | ERROR-195 | 삭제 | `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES` | 청사진 코드가 아니라 쓰기 오류로 부류를 옮겼습니다. |
| `SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT` | ERROR-164·198 | 확정 | 동일 | 실제로 동시에 켜진 선언의 정착 오류. |
| `SCHEMA_FORM_ERROR.BUDGET_EXCEEDED` | ERROR-164·190 | 확정 | 동일 | 원본 B를 커밋한 정착 예산 초과. |
| `SCHEMA_FORM_ERROR.EXPRESSION_THREW` | ERROR-164·198 | 확정 | 동일 | 식 예외는 자리별 결과를 커밋한 뒤 드러납니다. |
| `SCHEMA_FORM_ERROR.GUARD_FAILED` | ERROR-041·164 | 확정 | 동일 | 가드 컴파일·평가 실패의 한 코드. |
| `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING` | CONTROLS-079·ERROR-164 | 확정 | 동일 | 동적으로 정해진 대상 없음. |
| `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED` | EVENT-020·ERROR-164 | 확정 | 동일 | 되먹임 파동·중첩 예산 25의 사슬 끝 오류. |
| `SCHEMA_FORM_ERROR.LISTENER_THREW` | ERROR-017·164 | 확정 | 동일 | 소비자 콜백 예외의 부류 코드. |
| `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS` | ERROR-005·164 | 확정 | 동일 | 사슬의 복수 오류를 실제 `SchemaFormError` 하나로 묶습니다. |
| `SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION` | ERROR-164·198 | 확정 | 동일 | 충돌한 공개 쓰기 옵션의 호출자 오류. |
| `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE` | NODE-044·ERROR-164 | 확정 | 동일 | 재생성으로 버린 트리의 노드 쓰기만 거부합니다. |
| `SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER` | ERROR-029·164 | 확정 | 동일 | `onError` 전달 중 같은 폼에 대한 쓰기를 즉시 거부합니다. |
| `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED` | ERROR-138·164 | 확정 | 동일 | 코드는 05 표에 두고 제출 거부 동작은 07입니다. |
| `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED` | ERROR-155·164 | 확정 | 동일 | 한 로드의 검증 불가. |
| `SCHEMA_FORM_ERROR.VALIDATOR_THREW` | ERROR-039·164 | 확정 | 동일 | 실행 중 throw는 검증 결과가 아닙니다. |
| `SCHEMA_FORM_ERROR.RENDER_FAILED` | ERROR-017·164 | 확정 | 동일 | 렌더 계층의 소비자 예외 부류. |
| `SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED` | ERROR-190·198 | 확정 | 동일 | 정착 중 재귀 확장 예산 오류. |
| `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES` | ERROR-195·198 | 확정 | 동일 | 호출자/자동 쓰기 양쪽의 확정된 부류. |
| `SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY` | ERROR-197·198 | 확정 | 동일 | 06의 배열 전용 동사를 다른 종류에서 부른 호출자 오류. |
| `SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE` | ERROR-164·198 | 확정 | 동일 | 조건부 분기의 청사진 경고. |
| `SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT` | ERROR-164·198 | 확정 | 동일 | 터미널이 아닌 객체 잠금 경고. |
| `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR` | ERROR-153·164 | 확정 | 동일 | 검증기가 없을 때 조건부 조각을 끄고 트리마다 한 번 냅니다. |
| `SCHEMA_FORM_WARNING.VALIDATOR_MISSING` | ERROR-146·164 | 확정 | 동일 | 검증 모드가 None이 아닌 트리마다 한 번 냅니다. |
| `SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE` | ERROR-164·196 | 확정 | 동일 | 한 oneOf의 복수 활성 분기, 소비자가 있을 때만 판정. |
| `SCHEMA_FORM_WARNING.PRESENTATION_KEY_SUSPECT` | CONTROLS-011·ERROR-164 | 확정 | 동일 | 렌더 계층이 읽는 presentation의 의심 키. |
| `SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE` | ERROR-196·198 | 확정 | 동일 | 참조 재생성 reset의 소비자 조건 경고. |
| `SCHEMA_FORM_WARNING.DIALECT_MISMATCH` | ERROR-188·199 | 확정 | 동일 | 개발 모드의 `$schema`/선언 방언 불일치. |
| `SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM` | ERROR-191·198 | 확정 | 동일 | 폼이 지원하지 않는 의존 스키마 경고. |
| `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL` | ERROR-202·198 | 확정 | 동일 | 터미널 입력의 렌더 계층 경고. |
| `SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE` | FRAGMENT-055·ERROR-203 | 확정 | 동일 | 판별 리터럴이 목록 밖인 분기의 경고. |
| `SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE` | VALUE-037·ERROR-203 | 확정 | 동일 | 개발 모드의 JSON 부정합 검사. |
| `SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID` | REACT-033·ERROR-203 | 확정 | 동일 | 입력 정의 시험 객체의 모르는 키. |
| `SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM` | BLUEPRINT-044·ERROR-203 | 확정 | 동일 | 터미널 하위 예약 키는 폼에서 무시합니다. |
| `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` | SURFACE-061·ERROR-186 | 삭제 | `SCHEMA_FORM_WARNING.TYPE_MISMATCH` | 소유자가 경고등 이름을 확정했습니다. |
| `SCHEMA_FORM_WARNING.TYPE_MISMATCH` | SURFACE-061 | 확정 | 동일 | 확정된 경고등 코드입니다. |
| `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` | ERROR-164·198 | 삭제 | — | 소유자 판정으로 코드 행이 제거되었습니다. |
| `UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED` | VALIDATE-050·ERROR-100 | 확정 | 동일 | 플러그인 `bind`의 호출자 거부이며 폼 `onError` 대상이 아닙니다. |
| `FormErrorRecord` | ERROR-013·017·032 | 확정 | 동일 | `src/errors/`가 기록 데이터를 소유합니다. |
| `FormErrorCode` | ERROR-031·164 | 확정 | 동일 | `src/errors/`의 닫힌 코드 합집합입니다. |
| `FormErrorReporter` | ERROR-013·030 | 확정 | 동일 | `report`·`hasConsumer`를 트리 생성 인자로 받습니다. |
| `Validator` | VALIDATE-044 | 확정 | 동일 | React 없는 core 계약 형이며 공개 패키지 색인에는 내보내지 않습니다. |
| `ValidatorBindRefusedError` | VALIDATE-050·ERROR-100 | 확정 | 동일 | 플러그인 안의 네이티브 Error 하위 클래스이며 `group`·`code`로 구분합니다. |
| `revisionLedger` | EVENT-001·007, NODE-004 | 확정 | 동일 | 레코드 필드의 비트별 원장이고 겉면 이름은 `revision(mask?)`입니다. |
| `UpdateJsonSchema` | EVENT-064·SURFACE-057 | 확정 | 동일 | 공개 읽기 `jsonSchema`의 유효 참조 변경 비트입니다. |
| `retainValidationRoot` | VALIDATE-021·045, NODE-010 | 확정 | 동일 | 07의 바인딩이 부를 core 내부 수명 통로입니다. |
| `releaseValidationRoot` | VALIDATE-021·045, NODE-010 | 확정 | 동일 | 해제는 최근 목록에서 밀릴 때 또는 같은 `$id` 재등록 직전입니다. |
| `NodeState` | SURFACE-056 | 삭제 | `SchemaNodeState` | 맨앞의 홀로 선 `Node`는 공개 이름에 쓰지 않습니다. |
| `SchemaNodeState` | SURFACE-056 | 확정 | 동일 | 소유자가 정한 공개 상태 형 이름입니다. `NodeStateFlags`는 내부 형입니다. |
| `NodeEventType` | SURFACE-056·LANDING-158 | 삭제 | `SchemaNodeEventType` | 새 엔진은 새 이름을 처음부터 쓰고 옛 소비자 이주는 07입니다. |
| `SchemaNodeEventType` | SURFACE-056·060 | 확정 | 동일 | record가 소유하고 노드 진입점에서 공개합니다. |
| `SchemaNodeRequestType` (`Focus`, `Select`, `Refresh`, `Remount`) | EVENT-063·073, SURFACE-056 | 확정 | 동일 | 공개 TS 열거이며 네 멤버는 각 `Request*` 비트의 별칭입니다. |
| `valueTypeMismatch` | SURFACE-052·061 | 삭제 | `typeMismatch` | 소유자 확정 게터 이름이 이깁니다. |
| `valueTypeMismatches` | VALUE-030, SURFACE-061 | 삭제 | `typeMismatches` | 같은 경고등의 경로 목록도 소유자 이름으로 맞춥니다. |
| `typeMismatch`·`typeMismatches` | SURFACE-061 | 확정 | 동일 | `schemaType`·유효 목록 기준이며 검증 통과와 다릅니다. |
| `union` | BLUEPRINT-035 | 확정 | 동일 | 종류 이름은 소유자가 이미 확정했습니다. |
| `unionBehavior` | BLUEPRINT-035 | 확정 | 동일 | 동작 모듈 이름은 소유자가 이미 확정했습니다. |
| `isUnionNode` | BLUEPRINT-035 | 확정 | 동일 | 공개 가드 이름은 소유자가 이미 확정했습니다. |
| `setContext` | SURFACE-055, 28C-08 | 확정 | 동일 | 바인딩 전용 내부 통로로 이미 확정되었습니다. |
| `sameValue` | SETTLE-043 | 확정 | 동일 | SameValueZero와 구조 비교의 내부 판정 이름입니다. |
| `latent` | SURFACE-006 | 삭제 | `getInactiveValues(path)` | 원장의 값 읽기 이름이 옛 가칭을 대체했습니다. |
| `writeShape` | ERROR-195 | 확정 | 동일 | 자동 가상 쓰기 모양 오류의 진단 cause입니다. |
| `recursion` | ERROR-190 | 확정 | 동일 | 재귀 확장 중지의 exceededBudget 값입니다. |
| `duplicateSchemaId` | ERROR-201·31C-03 | 확정 | 동일 | 별도 코드가 아닌 두 컴파일 오류의 닫힌 reason입니다. |
| `onListenerError` | ERROR-054·099 | 삭제 | — | 대체된 과거 Form 속성이며 기록은 `onError`가 받습니다. |
| `throwOnBudgetExceeded` | ERROR-053·072·099 | 삭제 | — | 모든 환경에서 사슬 끝에 던지므로 스위치를 두지 않습니다. |

## 3. 다음 행동

- antigravity 계획 리뷰 판정을 받아 지적을 원장·코드와 대조하고, `cleared`까지 고친다.
- 소유자 확인 대기: `@cfworker/json-schema` 개발 의존 추가(U12a, 31C-04). 그 설치 단계만 멈춘다.
- 가칭 이름 확정 목록(U2, 31C-05)에 06이 더하는 `ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197)를 넣는다: 배열이 아닌 노드에 `push`·`pop`·`update`·`remove`·`clear`를 부르면 배열 동사의 공용 칸이 던지는 `SchemaFormError`, 기록은 `path`와 `details.method`(06 세션 `albatrion-52`, 35C-01). 06은 `onError`에 보고하지 않고 던지며, 던지기 직전의 보고는 나중에 머지하는 단계의 디스패치 연결과 함께 든다(33C-01).

## 4. 원장·계획서 어긋남

| ID | 계획서 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:17`, `request.md:37`, `adr-and-axes.md:18`, `verification.md:23` | 명령 메서드의 이름·형·`FormHandle` 모양을 "착수 전 소유자 결정"으로 적음 | EVENT-073 보충(30라운드) | 30라운드 답대로 구현한다 |
| M2 | `execution-plan.md:181`(U3) | `FormErrorRecord.details?: object`, `aggregate?: readonly FormErrorRecord[]` | ERROR-017(`ledger/error.md:458`): `details?: ErrorDetails`, `aggregate?: SchemaFormError` | 원장 서명대로 문서·구현(codex U2 보고) |
| M3 | `execution-plan.md` U16a | 35C-02(`UpdatePath` 배달은 레코드의 `(previous, current)` 사실에서 디스패처가 함)가 없음 | 35라운드 35C-01·02 | 나중에 머지하는 단계의 디스패치 연결에 든다 — U16a 조건부 단계에 더함 |
