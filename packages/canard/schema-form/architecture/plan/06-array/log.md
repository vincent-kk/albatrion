# 06 배열 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-10-01). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 실행 계획은 [execution-plan.md](execution-plan.md)(작성 중), 게이트 원장은 `.seiri/tasks/schema-form-array/gates.md`(작성 중).

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 머리

- 선출 이유: 04 PR #351이 머지되어(`54afafb86`) 05·06의 의존(03)이 풀렸다. 05는 별도 세션(`albatrion-ce`, 워크트리 `.claude/worktrees/stage-05`)이 진행 중이고, 06은 05와 병렬로 이 세션이 맡는다. 소유자 승인 2026-10-01.
- 브랜치 `feat/schema-form-array`, base와 PR base `1.0.0-beta`(`7fa4baa45`). 워크트리 `.claude/worktrees/stage-06`(sparse: `.claude/commands`·`.vscode` 제외 — 샌드박스 쓰기 제한, 개발과 무관). push는 PR 단계 전까지 하지 않는다.
- 원장 질의는 원장 관리 세션 `albatrion-5c`로 보낸다. 이 단계의 편집자 결정은 31라운드(05가 먼저 쓰면 그 뒤 번호)에 기록된다. 소유자 질문은 PR을 연 뒤 원장 관리자가 묶어 올린다. 파일 소유: 원장 관리자는 `ledger/**`·`reviews/round-*`·`HANDOFF.md`·`PLAN.md` §1·§5(착수 한 줄 뒤), 이 세션은 `plan/06-array/**`·`src/**`·`verification/**`·`PLAN.md` §3·§4의 06 행.
- 착수 전 확인(`request.md`): LANDING-065의 둘은 18C-59가 닫음 — 생김과 채움은 NODE-051·WRITE-007 보충, `contains`(`minContains`·`maxContains`)는 폼이 읽지 않음(FRAGMENT-051). 원장 관리자 확인: NODE-051·053, WRITE-007, SURFACE-005, LANDING-094, FRAGMENT-051은 26–30라운드에 보충이 없다.

### 05와의 공유 파일 합의 (`albatrion-ce`, 2026-10-01)

- 노드 겉면(`SchemaNode.ts`, `SchemaNode/DETAIL.md` 멤버 표, `surface.test.ts`, `type.ts`, `type-contract.test.ts`, `core/index.ts`): 두 단계 모두 자기 멤버를 이어진 덩어리로 두고, 나중에 머지하는 쪽이 충돌을 푼다.
- 05가 기록 필드 `revision`을 `revisionLedger`로 바꾼다. 06은 가능한 한 읽지 않고, 읽으면 나중에 머지하는 쪽이 이름을 맞춘다.
- 공개 쓰기 동사의 진입 파일(`src/core/dispatch/`, LANDING-084): 배열 동사 다섯(`push`·`pop`·`update`·`remove`·`clear`)의 진입 파일은 나중에 머지하는 단계가 더한다. 그 전까지 06의 동사는 노드 겉면에 둔다.
- 시험에서 `batch`·배달 의미가 필요하면 그것 없이 단언한다(04 log §4 M5의 꼴: `batch` 대신 루트 `setValue` 하나).

## 1. 최초 작업 기준선

| 원문 | 리비전 | sha256(앞 16자) |
| --- | --- | --- |
| `plan/06-array/request.md` | `7fa4baa45` | `fa32cb1c958cf1dd` |
| `plan/06-array/adr-and-axes.md` | `7fa4baa45` | `1572d94201cdaefc` |
| `plan/06-array/verification.md` | `7fa4baa45` | `c5ce2d63dda27e23` |
| `ledger/*.md` | `7fa4baa45` | 커밋으로 고정 |
| 03·04에서 넘어온 사례 | `plan/03-node-and-settle/log.md` §4, `plan/04-derive-and-controls/log.md` §4 @ `7fa4baa45` | 커밋으로 고정 |

- 목표: 배열·터미널 배열 행 `behaviors/arrayBehavior/`(`branch/`·`terminal/`·`utils/`), 겉면 배열 멤버, 배열 노드와 아이템 호스트, `items`·`prefixItems`, 구조 연산 `push`·`pop`·`update`·`remove`·`clear`(SURFACE-005), 통째 교체의 identity(NODE-051), 아이템 생김과 채움(18C-59, WRITE-007), 스냅숏 자리 맞춤(WRITE-095·099), `resolveArrayLimits`의 청사진 이동과 필터의 비트 분기(LANDING-085·094).
- 비목표: 아이템 노드의 지연 실체화(NODE-053 — 벤치 게이트가 실패할 때만 그 대응으로 연다), 성능 최적화(느린 행은 `verification/performance-issues.md`에 까닭과 함께 적고 소유자 수용을 받음, TEST-027), 배열 동사의 디스패치 진입 파일(위 05 합의), 레거시 삭제(09).
- 넘어온 사례(원장 관리자 지시): 03 log §4 1행(`selfcheck-v5.mjs:519` 배열 `omitTrailing`, 26C-03), 11행(WRITE-099 `push(v)` 스냅숏, TEST-070 배열 멤버 형 검사, 25C-11 아이템 `schemaType` 참조 동일성), 12·18행(`round18/proto/__tests__/rootOutput.test.mjs` :13·:24·:30 배열 셋).
- 산출물·완료 기준·게이트: `request.md` "산출물과 완료 기준", `verification.md` 전체. 원장 ID 목록은 두 문서의 "원장 항목 색인".

## 2. 진행

| 날짜 | 단계 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-10-01 | 착수 | 상황판 06 → 진행. 이 기록 작성 | 이 커밋 |

## 3. 다음 행동

- 원장 요구사항·넘어온 사례·코드 지도를 모아 실행 계획을 쓴다(seiri `write-plan`).

## 4. 원장·계획서 어긋남

| ID | 계획서 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
