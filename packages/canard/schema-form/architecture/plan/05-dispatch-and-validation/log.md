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

## 3. 다음 행동

- antigravity 계획 리뷰 판정을 받아 지적을 원장·코드와 대조하고, `cleared`까지 고친다.
- 소유자 확인 대기: `@cfworker/json-schema` 개발 의존 추가(U12a, 31C-04). 그 설치 단계만 멈춘다.
- 가칭 이름 확정 목록(U2, 31C-05)에 06이 더하는 `ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197)를 넣는다: 배열이 아닌 노드에 `push`·`pop`·`update`·`remove`·`clear`를 부르면 배열 동사의 공용 칸이 던지는 `SchemaFormError`, 기록은 `path`와 `details.method`(06 세션 `albatrion-52`, 35C-01). 06은 `onError`에 보고하지 않고 던지며, 던지기 직전의 보고는 나중에 머지하는 단계의 디스패치 연결과 함께 든다(33C-01).

## 4. 원장·계획서 어긋남

| ID | 계획서 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:17`, `request.md:37`, `adr-and-axes.md:18`, `verification.md:23` | 명령 메서드의 이름·형·`FormHandle` 모양을 "착수 전 소유자 결정"으로 적음 | EVENT-073 보충(30라운드) | 30라운드 답대로 구현한다 |
