# 06 배열 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-10-01). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 실행 계획은 [execution-plan.md](execution-plan.md)(작성 중), 게이트 원장은 `.seiri/tasks/schema-form-array/gates.md`(작성 중).

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 머리

- 선출 이유: 04 PR #351이 머지되어(`54afafb86`) 05·06의 의존(03)이 풀렸다. 05는 별도 세션(`albatrion-ce`, 워크트리 `.claude/worktrees/stage-05`)이 진행 중이고, 06은 05와 병렬로 이 세션이 맡는다. 소유자 승인 2026-10-01.
- 브랜치 `feat/schema-form-array`, base와 PR base `1.0.0-beta`(`7fa4baa45`). 워크트리 `.claude/worktrees/stage-06`(sparse: `.claude/commands`·`.vscode` 제외 — 샌드박스 쓰기 제한, 개발과 무관). push는 PR 단계 전까지 하지 않는다.
- 원장 질의는 원장 관리 세션 `albatrion-5c`로 보낸다. 이 단계의 편집자 결정은 원장 관리자가 새 라운드로 기록한다(05와 번호를 나눠 씀; 06의 첫 기록은 33라운드 33C-01). 소유자 질문은 PR을 연 뒤 원장 관리자가 묶어 올린다. 파일 소유: 원장 관리자는 `ledger/**`·`reviews/round-*`·`HANDOFF.md`·`PLAN.md` §1·§5(착수 한 줄 뒤), 이 세션은 `plan/06-array/**`·`src/**`·`verification/**`·`PLAN.md` §3·§4의 06 행.
- 착수 전 확인(`request.md`): LANDING-065의 둘은 18C-59가 닫음 — 생김과 채움은 NODE-051·WRITE-007 보충, `contains`(`minContains`·`maxContains`)는 폼이 읽지 않음(FRAGMENT-051). 원장 관리자 확인: NODE-051·053, WRITE-007, SURFACE-005, LANDING-094, FRAGMENT-051은 26–30라운드에 보충이 없다.

### 05와의 공유 파일 합의 (`albatrion-ce`, 2026-10-01)

- 노드 겉면(`SchemaNode.ts`, `SchemaNode/DETAIL.md` 멤버 표, `surface.test.ts`, `type.ts`, `type-contract.test.ts`, `core/index.ts`): 두 단계 모두 자기 멤버를 이어진 덩어리로 두고, 나중에 머지하는 쪽이 충돌을 푼다.
- 05가 기록 필드 `revision`을 `revisionLedger`로 바꾼다. 06은 가능한 한 읽지 않고, 읽으면 나중에 머지하는 쪽이 이름을 맞춘다.
- 공개 쓰기 동사의 진입 파일(`src/core/dispatch/`, LANDING-084, 33라운드 33C-01): 배열 동사 다섯(`push`·`pop`·`update`·`remove`·`clear`)은 공개 쓰기 API(EVENT-027)이므로 진입 함수는 `dispatch`가 동사마다 하나씩 소유한다. 그 진입 파일은 나중에 머지하는 단계가 더하고, 그 PR 본문에 진입 파일 추가를 적는다. 두 머지가 끝난 뒤에는 모든 쓰기 동사의 진입이 `dispatch/`에 있고 겉면은 그것으로 위임한다(LANDING-064).
  - `arrayBehavior/`와 노드 겉면은 자기 진입 사슬(깊이 계수, `onChange`, 사슬 끝 throw)을 갖지 않는다.
  - 06이 먼저 머지되면 동사는 03의 겉면 쓰기와 같은 PR-2 꼴이다: settle 호출 하나, 자기 사슬 없음(TEST-069). 그래서 06의 시험은 배열 동사의 `batch` 합침(EVENT-035)이나 진입마다 한 번의 `onChange`를 단언하지 않는다.
- 시험에서 `batch`·배달 의미가 필요하면 그것 없이 단언한다(04 log §4 M5의 꼴: `batch` 대신 루트 `setValue` 하나).
- `if` 술어 대역(05 `3ef2ed652`, 05 log "06에 넘길 목록" 7): 05가 `src/core/__tests__/ifPredicate.ts`와 런타임 `ifPredicates`를 없애고 `evaluateGate`가 검증기로 컴파일한 실제 가드(`readSchemaNodeGuard`)를 읽는다. 이 브랜치의 시험 약 10개 파일(새 배열 시험 포함)이 아직 `ifPredicates`를 쓴다. 06이 05 뒤에 머지하면 06이 그 시험을 시험 검증기 `src/core/__tests__/fixtures/createTestValidator.ts`(ajv 8)로 옮기고, 06이 먼저 머지하면 05가 리베이스에서 옮긴다(33C-01).
- 검증기 계약(05 log "06에 넘길 목록" 6, VALIDATE-019): `compile`·`compileGuard`·`release`에 같은 엔진 사본 객체를 넘긴다. 06은 검증기를 부르지 않으므로 나중에 머지하는 쪽이 시험 고정물만 맞춘다.

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
| 2026-10-01 | 착수 | 상황판 06 → 진행. 이 기록 작성 | `2688cbede` |
| 2026-10-01 | 원장 질의 | 05와의 진입 파일 합의를 33C-01로 기록(원장 관리자 `56a7844ef`). Q1–Q11을 원장 관리자가 35C-01~12로 답함(기록 커밋은 원장 관리자 쪽에서 뒤따름) | 실행 계획 §2.3 |
| 2026-10-01 | 조사 | 원장 계약 정리(항목 36과 닫기 6), 코드 지도, 넘어온 사례, 정착 기제 추적(경로 열쇠 저장소와 위험 14). 위험 목록은 실행 계획 §7과 ADR D4의 맥락으로 옮김 | 실행 계획 §2·§7 |
| 2026-10-01 | write-plan | [execution-plan.md](execution-plan.md), [execution-adr.md](execution-adr.md)(D1–D7), 게이트 원장 `.seiri/tasks/schema-form-array/gates.md`(G1–G22) | 이 커밋 |

| 2026-10-01 | 원장 머지 | 로컬 `1.0.0-beta`(35라운드 `3d934b5bd`까지)를 머지. `PLAN.md` §5 끝의 충돌만 양쪽 행을 살려 해소 | `213ddac72` |
| 2026-10-01 | review-plan | antigravity `rework-required`(F1–F5) → 고침 `0b3575524` → 고친 범위 재확인 `cleared`. G1·G2 충족 | 실행 계획 §9 |

| 2026-10-01 | 원장 질의 | U2 초안이 찾은 둘을 원장 관리자가 36라운드로 닫음: 행의 여덟째 칸 `arrange`(36C-01), 옛 철자의 `additionalItems`는 스키마 객체일 때만 06이 청사진에 컴파일(36C-02). 실행 계획 I4·U3 갱신 | `reviews/round-36-closing.md` |
| 2026-10-01 | U2 | 문서 선행: `arrayBehavior/` INTENT·DETAIL 새로, behaviors·종류 여섯·blueprint·record·settle·SchemaNode 문서 갱신(codex 세션 `ba0da3ae` 초안, 조율 세션이 원장 대조·36라운드 반영). `.ts` 변경 없음 | 이 커밋 |

| 2026-10-01 | 환경 | 워크트리에 패키지 전용 `ajv`가 없어 `tsc`가 옛 시험·스토리에서 35건 실패. 원래 작업 폴더의 `packages/canard/schema-form/node_modules/ajv`를 워크트리 같은 자리에 심볼릭 링크로 연결(무시되는 경로, 커밋 없음) 뒤 0건 | — |
| 2026-10-01 | U3 | `resolveArrayLimits` 청사진 이동, 아이템 자리 항목 `getItemEntry`, 옛 철자 `additionalItems` 컴파일(codex `faaf1c5d`). 조율 세션이 자리 항목의 게이트 객체 복사를 고침(게이트를 열쇠로 쓰는 `ifPredicates`와 짝이 깨짐) + 시험. 청사진 시험 558 → 577. G4 | `cf429e31c` |
| 2026-10-01 | 원장 질의 | `omitTrailing`이 자르는 것(37C-01): 방출 배열 꼬리의 빈 자리 — 채운 자리, 잎의 실제 `null`, 청사진 없는 자리의 `undefined`·`null` | `reviews/round-37-closing.md` |
| 2026-10-01 | U4 | `arrayBehavior/` 두 행, 모든 행의 여덟째 칸 `arrange`와 공유 거부 칸(ERROR-197), 레코드 칸 셋(codex `8a0344a4`). 조율 세션이 고침: 레코드 칸 셋을 공개 접근자가 아닌 내부 칸으로, 터미널 `update`의 반환 출처 `updated`, 아이템 수마다 쌓이던 항목 메모(반복 `push`에서 제곱 메모리)를 템플릿당 마지막 하나로. core 시험 1,157 통과. G3·G5 | `4d8b4bf0b` |

| 2026-10-01 | U5 | 배열 분배·위치 잇기·소멸·전체 배열 잠복·비구조 쓰기의 스냅숏 자리·원본 B 구조 되돌림(codex `44877b15`). 시험 두 파일 19건, core 시험 1,176 통과. 해석 셋: 꺼진 아이템 뒤 호스트가 나가면 그 아이템의 잠복 원본으로 자리를 채움; 배열 잠복은 `inactiveValues` 항목 하나; 스냅숏이 없고 새 수가 0이면 배열을 만들지 않음 | `af402b2af` |
| 2026-10-01 | 원장 질의 | 38C-01 배열 호스트의 잘못된 종류 값은 아이템 0·소멸·그 값 방출; 38C-02 나가는 배열 호스트의 잠복은 원본 트리; 39C-01 객체 행이 잘못된 종류 원본을 방출하지 않는 것은 03의 결함이며 06이 고침(M9) | `reviews/round-38-closing.md`, `round-39-closing.md` |
| 2026-10-01 | U5b 문서 | 잘못된 종류 원본의 방출과 배열 잠복 원본 트리를 behaviors·객체·배열·settle 문서에 먼저 적음 | `5202c5827` |
| 2026-10-01 | U5b | 객체·배열 행과 루트가 잘못된 종류 원본을 방출(39C-01), 나가는 배열 호스트의 잠복을 원본 트리로(38C-02). 03·04 기대 열하나 고침, 03 게이트 시험은 M10 | `056c1ce26` |
| 2026-10-01 | U6 | 구조 진입 `arrangeSchemaNodeItems`, 자리 적용 `applyArraySlots`, 경로 열쇠 저장소 옮김 `rekeyArrayRuntimePaths`, `SchemaNode` 동사 다섯과 겉면 39(codex `eddb8205`). core 시험 1,201 통과 | `592107ffd` |
| 2026-10-01 | 원장 질의 | Q17: 자리 이동에서 노드는 옛 자리와 새 자리의 템플릿(선언 자리 `items`·`prefixItems[i]`)이 같을 때만 다시 쓰고, 다르면 값이 새 자리 템플릿의 새 노드의 탄생 입력이 되며 옛 노드는 소멸. 원장 관리자 확인, 41라운드 편집자 결정으로 기록 예정. 두 템플릿 튜플 시험에 새 키 단언 추가 | NODE-002·052·057 |
| 2026-10-01 | U7 | 아이템 안 선언의 템플릿 경로 묶기(35C-08): `settle/utils/paths/`의 `bindTemplatePath`·`expandTemplatePaths`, 역의존 `affected`의 `*` 맞춤과 다른 아이템 고정 읽기의 호스트 하위 트리 의존(18C-13), 게이트 자리·파생 원천·`injectTo` 대상·`@` 맥락 소유자 묶기(codex `9d9504ef`). 게이트 등록·규칙 대상·상태 키 층·나감 정책 열쇠는 이미 노드의 실제 경로를 써서 바꾸지 않음. 시험 두 파일 15건. 해석: 아이템 자식에서 `../../0/x`가 다른 아이템 읽기, `(../../).length`가 배열 전체 읽기 | `eca49e27a` |
| 2026-10-01 | U8 | array 부류 장면 15개(codex `268525ba`). SCN 시험 18건, 코어 시나리오 시험 58건 통과. SCN 단계에 `pop`을 더하고 `update` 단계를 배열 색인·값으로 바꿈(옛 `schema` 모양은 쓰는 곳 없음); 장면 기대에 동기 반환·노드 동일성과 키·스냅숏·자리별 청사진 종류·`extras`를 더함(I19·I20). core 시험 1,231 통과 | 이 커밋 |
| 2026-10-01 | U9 | 회귀 이식 14건(codex `7c57bf8c`): 6.1의 배열 투영 5건(`settle.array-carryover.test.ts`, 26C-03·`rootOutput:13/24/30`), 레거시·GOAL 9건(`settle.array-legacy-ports.test.ts`). 이주 행과 기대가 다른 것 4건: 빈 중첩 배열의 `outputValue`는 `undefined`(LANDING-171, 2건), 코어의 `minItems` 자동 채움 없음(WRITE-022), `clear()`가 스냅숏 자리를 없애 재로드도 `[]`(LANDING-155·WRITE-095). 보류 1건: `virtual.render.test.tsx:199` 가상 노드 `setValue(undefined)`가 참조 잎을 비우지 않음 → 42라운드가 03의 결함으로 판정하고 06에 배정(M11·M12, U9b) | 이 커밋 |
| 2026-10-01 | U9b | 42라운드 가상 노드 결함 둘 수정(codex `8630aca6`): 호출자 쓰기의 참조 노드 부채질과 틀린 모양의 즉시 거부(`assertVirtualWriteShape`), 가상 노드의 `structure`·`children`이 실제 형제를 가리킴, 참조 노드 값 변화 시 같은 정착에서 다시 조립(청사진별 역참조 색인, 가상 노드 없는 청사진은 `null`), 나감·소멸·잠복 갈무리는 실제 부모가 소유한 노드만 걸음(`walkOwnedSchemaNodes`). 보류했던 `virtual.render.test.tsx:184-199` 이식을 되살림. 기존 기대 변경 없음. core 시험 1,254 통과. `Merge` 호출의 부채질은 45C-01대로 참조 노드마다 부분 쓰기(뒤 커밋에서 고침) | 이 커밋 |
| 2026-10-01 | U10 | `bench/array.bench.ts`를 Node·Bun에서 실행하고 03·04 벤치를 순차 재측정. TEST-032 잎 입력은 Node 667.32×·Bun 723.25×, array 1000 통째 쓰기는 4.11×·13.71× 느리고 노드당 메모리는 0.330×·0.461×. NODE-053/I18 판정: **소유자 수용 대기**(시간 두 행 및 03 `18C-67` Node 변동); 수용 전 G15 미충족, 지연 실체화 실패 대응 미착수. G14 수치와 재현 명령은 성능 기록, 느린 행은 P-13–P-15에 기록 | `verification/06-array/performance.md`, `verification/performance-issues.md`, 이 커밋 | |
| 2026-10-01 | U10b | 44라운드 계약 위반 둘 수정(codex `e51aeb07`): 통째 쓰기의 `dirtyChildren`이 정착 전체 `dirtyPaths`를 가지마다 훑던 제곱 비용을 부모별 색인(`DirtyPathSet`)으로, 잎 입력의 배열 `assemble`이 모든 자리를 다시 만들던 것을 재계산 자리만 고쳐 쓰는 증분 조립으로(`record`의 `assemble` 선택 인수, `updateOutput`의 전체 깊은 비교 생략). 조율 세션이 증분 길의 같음 판정을 `Object.is`로 맞춤. 규모 탐침(Node): 잎 입력 1k/10k/20k 0.151/0.360/1.242 → 0.050/0.017/0.019 ms, 통째 쓰기 1k/2k/4k 15.3/55.4/184.6 → 6.6/12.9/24.0 ms. 횟수 가드 시험 2건은 수정 전 자리 조회 2,004회·dirty 경로 방문 322,803회로 실패. core 시험 1,260 통과 | 이 커밋 |
| 2026-10-01 | 원장 질의 | Q20 → 45C-01: 가상 노드는 호출자의 쓰기 종류를 그대로 참조 노드에 넘김(`Merge`는 부분 쓰기). 조율 세션이 `markWrite`의 강제 통째 인수를 없애고 시험을 "45C-01 Merge performs a partial write at each referenced node"로 뒤집음(수정 전 코드에서 `{ first: 'new' }`로 실패 확인). core 시험 1,260 통과 | 이 커밋 |
| 2026-10-01 | U10 재측정 | `103433634`에서 06·03·04 벤치를 Node·Bun 순차 재측정(codex `3275534f`). 10,000개 배열 키 입력 Node 29.92/1.00 µs(29.92×), Bun 21.00/0.92 µs(22.90×) — 레거시는 같은 완료점이 아님; array 1000 통째 쓰기 Node 1.53×, Bun 4.19×; 노드당 메모리 0.330×·0.463× 통과. 두 시간 행은 비례 비용이라 NODE-053/I18대로 **소유자 수용 대기**(원장 관리자 경유). 03·04 행 재측정 비는 0.96–1.20×로 단일 재실행 퍼짐 안. 44C-01로 없앤 제곱 순회·전체 자리 재조립은 대장 R-11 | 이 커밋 |
| 2026-10-01 | verifier 고침 ① | 최종 verifier(새 문맥) FAIL의 차단 5건 가운데 3건과 비차단 2건을 고침(codex `82df681e`): 소멸 경로 일괄 정리(M17), 04 파생 헬퍼의 제곱 비용(M18), 시험의 이중 형 변환 6곳을 `instanceof` 좁히기로, 쓰는 곳 없는 수출 `ArrayArrangeResult`, 넘기지 않는 인수 `values`. `clear()` 1k/2k/4k 150.6/597.2/2,467.4 → 3.2/4.3/9.1 ms, 파생 규칙 배열 `push` 500/1k/2k 39.0/128.8/454.7 → 13.2/24.7/50.8 ms, 통째 쓰기 100.2/303.6/1,156.8 → 16.6/34.5/69.0 ms. 기존 기대 변경 없음. core 시험 1,262 통과. 남은 2건(47C-01 원본 트리 자리 수, 47C-02 `null`의 `push`)은 문서 `4e9c3ac8f` 뒤 코드 | 이 커밋 |
| 2026-10-01 | verifier 고침 ② | 47라운드 코드(codex `9a140773`): 원본 트리가 배열 자리 수를 지킴(M19), `null` 배열의 `push`(M20). 수정 전 실패 6건 확인. 바꾼 기존 기대 4건: `null` 위 `push` 반환 0 → 1(branch·terminal), `null` 위 `push` 계획 `noop` → 새 값, 객체 아이템 원본 `undefined` → `{ nestedArray: [] }`(47C-01). 조율 세션이 게이트 등록 지움을 소유한 자식으로 한정(M21, `d0a833754`, 수정 전 실패 확인). core 시험 1,266 통과 | 이 커밋 |
| 2026-10-01 | verifier 고침 ③ | 두 번째 verifier(새 문맥) FAIL: 앞선 10건은 모두 닫힘 확인, 새 차단 1건(M22)과 비차단(M23, 접두 검사 비용, 중복 제거 시험 부재). codex `88fccc21`이 M22·접두 검사·`getDeriveSourceNodes` 중복 제거 시험을, 조율 세션이 M23(48C-02)을 고침. 집단 나감의 제곱 비용 셋은 48C-01로 06 몫(다음 커밋). core 시험 1,269, render 539 통과 | 이 커밋 |
| 2026-10-01 | 48C-01 | 집단 나감의 세 루프 수정(M24). 수정 전 2천 행 계수 실패(메모 방문 8,004,000, 배열 조립 2,002, 잠복 키 방문 2,001,000) → 0/3/1. 나감·재진입 값과 `inactiveValues` 차등 시험 추가. 객체 속성 게이트 나감은 37/131/486 ms로 증가가 남음(원인 둘: P-04의 `getLatentOrder`와 `readProjectedValue` — 뒤의 것은 M29로 고침). core 시험 1,273, render 539 통과 | 이 커밋 |
| 2026-10-01 | verifier 고침 ④ | 세 번째 verifier(새 문맥) FAIL: 앞선 고침 모두 확인, 차등 231,000단계 차이 0, 같은 꼴의 전체 훑기 넷(M25–M29). 49C-01로 범위 확정: 배열 장면이 닿는 비용은 06이 고치고, 닿지 않는 03·04 비용은 "계약 위반, 수용 대상 아님" 열림 행으로. 다섯 고침을 고침마다 한 커밋으로. core 시험 1,280, render 539 통과 | 이 커밋 |
| 2026-10-01 | verifier 고침 ⑤ | 네 번째 verifier(새 문맥) FAIL: 앞선 고침 모두 확인, 차단 3건(M30 회귀, M31 U7 결함, M32 뜻 변화)과 비차단(M33, 열림 행 P-22 `af062fc8b`(05의 P-16–P-19와 겹치지 않게 번호를 옮김)). 고침마다 한 커밋. core 시험 1,286, render 539 통과 | 이 커밋 |
| 2026-10-01 | U10 같은 완료점 재측정 | 소유자 지시(52라운드 `round-52-owner-answers.md:7`): 레거시를 루트 커밋 적용(루트 값·`normalizedValue` 갱신 뒤 `onChange` 진입)까지 재고 새 엔진은 동기 `setValue` 반환까지(codex `97acd1ae`, ABBA 교대, 실행마다 2,001표본, Node·Bun 각 두 번). P-13 잎 입력 Node 13.0–13.6 / 459–488 µs(0.028×), Bun 14.6–15.9 / 184–185 µs(0.079–0.086×); P-14 통째 쓰기 Node 5,437–5,566 / 3,805–3,947 µs(1.41–1.43×), Bun 5,993–6,030 / 2,087–2,102 µs(2.87×). 실행 간 비율 차이 최대 9.65%. 다른 세션이 돌던 기계라 부하 평균을 함께 기록. 첫 시도는 codex 용량 오류로 실패해 같은 공급자로 다시 맡김 | 이 커밋 |
| 2026-10-01 | NODE-053 판정 | 54라운드 소유자 답(`reviews/round-54-owner-answers.md:7`): P-14(array 1000 루트 통째 쓰기, Node 1.41–1.43×·Bun 2.87×, 선형)를 PR-5에 수용, P-13은 같은 완료점에서 느리지 않아 닫음. I18대로 **통과**이며 지연 실체화를 넣지 않음. 개선은 07 뒤 성능 작업. G15 충족 | 이 커밋 |
| 2026-10-02 | verifier 고침 ⑥ | 다섯 번째 verifier 조건부 통과의 E1(51C-01, `86167c32c`·`769b8dcd0`, P-03 해결)·N1·N3 고침 뒤 여섯 번째 verifier: 51C-01의 게이트 입력 차이 0(198,300단계, 기록된 입력 약 216만), 차단 둘(M35·M36)을 고침, 비차단 M37은 57C-01. origin `1.0.0-beta`(`53cd6c898`) 머지, 열림 행 번호 P-16 → P-22. core 시험 1,292, render 539 통과 | 이 커밋 |
| 2026-10-02 | verify·PR | 일곱째 새 문맥 verifier(범위 한정) PASS: 커밋한 F1·F2가 검증된 패치와 같고, 새 가드가 앞 커밋에서 실패, 게이트 입력 관측 약 230만·상태 126,000단계 차이 0. 비차단 정리(`9b2930139`). G22 충족. draft PR [#353](https://github.com/vincent-kk/albatrion/pull/353)(base `1.0.0-beta`), 상황판 §3 → 리뷰(draft) | 이 커밋 |
| 2026-10-02 | PR 경계 filid | `filid:enrich-docs --include-detail --repair --auto-approve`(패키지 루트, 대상 여섯 모듈): 문서 12개 모두 RICH, 발견 0, 표지 `Enrich-docs skipped: all RICH`. 조율 세션이 원장 ID가 없던 두 결정을 DETAIL에 더함: 37C-01(`arrayBehavior/DETAIL.md`의 `omitTrailing` 빈 자리), 41C-01(`settle/DETAIL.md`의 같은 템플릿 재사용). `filid:scan`(저장소 루트, 스냅숏 `4801006202c6…`): FAIL·분석 불완전(저장소 전체 순환·경계 indeterminate, 원인은 schema-form 밖), 발견 236건 중 기준 시점부터 217건. 이 브랜치의 19건: `SchemaNode/__tests__/array-methods.typecheck.ts`가 자기 진입점을 가져옴 → `../type`으로 고침; `schema-form-scenarios/src/array`의 INTENT·DETAIL 없음과 `*.scenario.ts` 동료 경고 17건, `array.spec.ts` 동적 표 사례 상한 indeterminate 1건은 기준 시점의 형제 부류 일곱(`exit`·`fill`·`union`·`value`·`derive`·`settle`·`controls`)과 같은 꼴이라 그 꼴을 따르고 고치지 않음(부류 디렉토리의 문서 꼴은 SCN 패키지 전체의 결정). G21 충족 | 이 커밋 |
| 2026-10-02 | 판정 엔진 기록 | 소유자 지시(원장 관리자 전달, 2026-10-02): 검증에 antigravity를 쓸 수 있으면 쓰고 Claude 검증기는 대체로만. 지금까지의 판정 엔진: G1 계획 리뷰 antigravity(`7083e143`·`8d3d8821`); G2–G20 CHECK는 이 세션이 실행(G16–G20은 Claude worker 하위 에이전트가 실행); G22의 새 문맥 verifier 일곱 차례는 Claude verifier 하위 에이전트(opus) — 기계 탐침·차등 하네스를 샌드박스에서 돌려야 했음; G21 filid는 Claude 하위 에이전트가 filid 도구로 실행. 앞으로의 검증(PR 이후 약식 리뷰와 재검증)은 antigravity를 쓰고, 샌드박스 명령·이 세션 상태가 필요하거나 실패할 때만 Claude 검증기로 대체하며 그때 까닭을 적음 | 이 커밋 |
| 2026-10-02 | PR 이후 약식 리뷰 | antigravity(`94d8af30`, 판정 엔진 antigravity, 소유자 지시대로) 독립 약식 리뷰 `0795506cf`: 차단 0, 비차단 4. 받음 3: SF-ARRAY-01 `captureLatentDescendants.ts`의 `Array.isArray` → 공유 `isArray`(`071b6baf8`, 이 브랜치가 들인 줄), SF-ARRAY-02 `stringBehavior/DETAIL.md`에 공유 거부 칸 `arrange`(`0a21f4819`), SF-ARRAY-04 25C-11 PR-5 `it.todo`를 여덟 `node.type` 단언으로(`4549bd268`). 받지 않음 1: SF-ARRAY-03 `itemEntry/getItemEntry.ts` + `getItemEntry/utils/` 꼴은 기준 시점의 형제 `analyze/validateShape`·`analyze/compileBlueprintExpressions`와 같은 저장소 관례(함수 디렉토리 아래 `utils/`, seiri function-boundaries §4). core 1,293 통과(todo 1), tsc 0, eslint 0 | 이 커밋 |

## 3. 다음 행동

- U9b 결함 수정과 U11 최종 검증. U10의 느린 행은 원장 관리자를 거쳐 소유자 수용을 기다림.

## 4. 원장·계획서 어긋남

| ID | 계획서 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:11`·`:15` | LANDING-065 본문은 동사를 `push`·`remove`·`update` 셋으로 적음 | SURFACE-005(충돌 줄로 이김): 다섯 | 다섯을 구현 |
| M2 | `request.md:18`, `verification.md` 스냅숏 줄 | WRITE-095의 "새 자리는 `undefined`"만 인용 | WRITE-099(18C-105)가 구조 연산의 새 자리를 `v`로 좁힘 | 실행 계획 I8 |
| M3 | `request.md:16` 등 | "로드(`setValue(V)`·`reset`·마운트)" 문구가 남은 원장 인용 | WRITE-090(충돌 줄로 이김): `setValue(V)`는 로드가 아님 | 실행 계획 I2 |
| M4 | `verification.md` 게이트 줄 "`push`·삽입" | 삽입 동사가 없음 | SURFACE-005, 35C-03 | 삽입 절반은 해당 없음 |
| M5 | `src/core/behaviors/DETAIL.md:12` | "터미널 배열 행은 06단계에서 추가" — 배열 branch 행도 06이 더함 | LANDING-065·094 | U2에서 문서를 고침 |
| M6 | `src/core/settle/DETAIL.md:28` | "배열 구조의 생성·폐기 로그는 PR-5에서 더한다" | LANDING-062 충돌 줄, 35C-05 | U5에서 구현하고 현행 계약으로 바꿈 |
| M7 | `src/core/record/utils/updateSchemaNodeNameAndPath.ts` | 한 노드의 다섯 칸만 바꾸고 제품 호출자가 없음 | NODE-004·051 | U6의 경로 옮김 organ 안에서 씀 |
| M9 | `src/core/behaviors/objectBehavior/utils/projectObject.ts`, `objectBehavior/DETAIL.md`(03) | 비객체 `raw`를 든 객체 호스트가 아무것도 방출하지 않음(루트만 `local`로 대체) | VALUE-033 (4), WRITE-013, 39C-01: 받은 그대로 방출 | 06이 고침(U5b): 객체·배열 행과 루트가 잘못된 종류 원본을 방출. 03·04 시험의 옛 기대는 고친 목록과 함께 PR 본문에 |
| M10 | `src/core/settle/__tests__/settle.gates.test.ts`(03 시험 "reads a root child kept by the root output fallback") | `null`을 로드한 객체 루트가 `local`로 대체 방출하고 `#/child`를 읽는 게이트가 켜진다고 단언 | CONTROLS-080 (5)·18C-91: 식은 방출 트리를 읽고 원시 값 아래는 `undefined`; 39C-01 | 루트는 `null`을 방출하고 `probe`는 형상 밖, `child`는 편집 상태로 `'D'`를 든다고 고침(원장 관리자 확인, 새 라운드 없음). 함께 바뀐 03·04 기대 열하나는 39C-01의 직접 결과(PR 본문에 목록) |
| M11 | `src/core/settle/utils/write/markWrite.ts`(03) | 호출자가 가상 노드에 쓰면 표시만 하고 참조 노드로 나누지 않음; 틀린 모양의 호출자 거부 없음 | NODE-034, ERROR-195, 18C-21, 42C-01·02 | 06이 고침(U9b): 부채질 쓰기와 `INVALID_VIRTUAL_NODE_VALUES` 즉시 던짐. `virtual.render.test.tsx:184-199` 이식을 되살림 |
| M12 | `src/core/settle/utils/compute/selectChildren.ts`(03), `virtualBehavior` | 가상 노드 아래에 그림자 자식 `/period/startDate`를 만들어 읽어 값이 늘 `[undefined, undefined]` | NODE-034·054, 42C-01·02 | 06이 고침(U9b): `structure`가 실제 형제를 가리키고, 참조 노드가 바뀐 정착에서 가상 노드를 다시 조립 |
| M13 | `src/core/settle/utils/compute/dirtyChildren.ts`(03) | 가지마다 정착 전체 `dirtyPaths`를 훑어 통째 쓰기가 아이템 수의 제곱 | SETTLE-047·017, GOAL-011, 44C-01 | 06이 고침(U10b): 부모별 색인. P-14는 재측정 뒤 해결로 |
| M14 | `src/core/behaviors/arrayBehavior/DETAIL.md`(06 자신의 근사) | 잎 입력마다 배열 `assemble`이 모든 자리를 다시 만듦 | NODE-026, SETTLE-042, 44C-01 | 06이 고침(U10b): 형상이 같으면 재계산 자리만 고쳐 씀 |
| M15 | `src/core/record/DETAIL.md`(U10b) | `Behavior.assemble`의 선택 인수 문장이 코드와 같은 커밋 `1f2cf27e6`에 들어감(문서 선행 어긋남) | filid 문서 선행 | 최종 verifier가 지적. 내용은 현행 계약과 맞으며 기록만 남김 |
| M16 | 실행 계획 §7 첫 행 | 코드 추적의 위험 목록 1–14를 `log.md` 링크로 대조한다고 적었으나 그 목록은 파일로 남지 않음 | — | 최종 verifier가 지적. §7을 ADR D4의 저장소 열거와 저장소 옮김 시험으로 대조하도록 고침 |
| M17 | `src/core/settle/utils/transition/prunePerishedPath.ts`(06 U5) | 소멸 아이템마다 모든 경로 저장소를 훑고 열쇠를 `JSON.parse`해 `clear()`·짧아진 통째 쓰기가 제곱 비용 | SETTLE-047, 44C-01, 47C-02 | 최종 verifier가 찾음. 06이 고침: 소멸 경로 집합을 한 번에 지우는 `prunePerishedPaths`. 2,000개 `clear()`의 `JSON.parse` 4,006,002 → 4,004회 |
| M18 | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:44-47`, `getDeriveSourceNodes.ts:26`(04) | 대기 원천마다 모든 활성 규칙 열쇠를 훑고 원천 중복을 `includes`로 걸러 아이템마다 `derived`가 있으면 동사·쓰기가 제곱 비용 | SETTLE-047, 44C-01, 47C-02 | 최종 verifier와 05단계가 따로 찾음(05의 짝 N개 객체 고정물: 1,000짝 234 ms). 06이 고침: 원천 경로별 활성 열쇠 색인과 `Set`. 2,000개 `push`의 열쇠 순회 6,015,005 → 6,002회, 05 고정물 250/500/1,000/2,000짝 7.7/13.7/22.4/47.8 ms(파생 없음 2.2/3.8/6.1/12.2 ms) |
| M19 | `src/core/settle/utils/latent/readRawTree.ts`, `captureArrayLatent.ts`(06 U5b) | 원본이 없는 자리만 든 배열을 `undefined`로 접어 자리 수를 잃음: 살아 있는 아이템이 없는 자리의 `update`가 다른 아이템을 소멸시키고 잠복 재진입이 중첩 배열을 비움 | NODE-021·051, WRITE-007, 35C-06, GOAL-074, 47C-01 | 최종 verifier가 찾음. 06이 고침: 배열은 늘 자리 수 N의 배열로 읽음 |
| M20 | `arrangeBranchArray.ts`, `arrangeTerminalArray.ts`, `arrayBehavior/DETAIL.md`(06 U4) | `null`을 든 배열의 `push`까지 무동작 | 38C-01, 47C-02 | 최종 verifier가 찾음. 06이 고침: `push(x)`는 `[x]`, 나머지 넷은 무동작 |
| M21 | `src/core/settle/utils/gates/getGateRegistry.ts`(03) `remove` | 나가는 가상 노드의 자식(실제 형제)까지 게이트 등록을 지움 | 42C-02 | 최종 verifier가 지적(비차단). 06이 고침: 소유한 자식만 지움 |
| M22 | `src/core/settle/utils/transition/finalizePerished.ts`, `pruneArrayTailPaths.ts`(06 U5) | 자리 수가 바뀐 호스트마다 경로 저장소 전체를 훑어 중첩 배열 여럿을 늘리거나 줄이는 통째 쓰기가 O(호스트 수 × 저장소) | SETTLE-047, GOAL-011, 44C-01 | 두 번째 verifier가 찾음. 06이 고침: 바뀐 호스트를 모아 한 번만 훑음. 2,000행 `tags` 늘림 1,863.9 → 39.4 ms, `JSON.parse` 12,002,000 → 6,001회 |
| M23 | `arrangeTerminalArray.ts`, `arrayBehavior/DETAIL.md` | 터미널 배열의 `push`가 `null`·`undefined`만 바꾸고 수·객체에서는 무동작 | 47C-02 머리말, 48C-02 | 두 번째 verifier가 지적(비차단). 06이 고침(`59022ad3d`): 배열이 아닌 값 모두 `[x]` |
| M24 | `updateInactiveValuesMemo.ts:86-88`, `finalizeExits.ts:69-71`, `captureLatentDescendants.ts:44-49`(03·04) | 집단 나감이 나간 노드 수 × 전체(메모·조상 출력·잠복 저장소)로 제곱 비용 | SETTLE-017, 44C-01, 48C-01 | 두 번째 verifier가 찾음, 48C-01이 06에 배정. 06이 고침(codex `f5e0730f`): 메모 항목 한 번 분류, 조상 출력은 깊은 곳부터 조상마다 한 번, 정착 범위의 잠복 자손 경로 색인. P-03·P-04에 관련 관측만 덧붙이고 상태는 그대로 |
| M25 | `captureExitedRaw.ts`·`readLatentSlotSource.ts`(06), `distributeLatentValue.ts`·`markWrite.ts`의 `pruneLatentRaw`(03) | 호스트마다 잠복 저장소 전체를 훑고 열쇠를 `JSON.parse` | SETTLE-017·047, 44C-01, 48C-01, 49C-01 | 세 번째 verifier가 찾음. 06이 고침(codex `5d1f895f`, `130aec77d`): 정착 범위 잠복 경로 색인(자기 경로와 조상), 직접 변경 자리에서 색인 무효화. 색인 유지가 없으면 실패하는 두 형제 그룹 시험 추가 |
| M26 | `commitSettlement.ts:104-112`(03) | 커밋마다 형 불일치 경로마다 조상마다 전체 경로 거르기: 무관한 잎 입력 하나가 2천 행에서 590 ms | 49C-01 | 06이 고침(codex `d54f03f7`, `1418295da`): 한 번의 경로 순회 |
| M27 | `finalizeExits.ts:40-42`(03) | 나감마다 `typeMismatchPaths` 전체 복사·훑기 | 49C-01 | 06이 고침(`0bb4db661`): 첫 나감에서 조상 색인을 한 번 만듦 |
| M28 | `finishSettlement.ts`, `alignArraySnapshotSlots.ts`(06) | 크기가 바뀐 호스트마다 스냅숏 루트 배열을 경로 복사 | 49C-01 | 06이 고침(`fd66556bd`): 정착마다 한 초안, 용기마다 얕은 복사 한 번 |
| M29 | `readProjectedValue.ts:37`(03) | 게이트 평가마다 자식 항목 선형 탐색; 객체 집단 나감의 남은 비용 절반을 P-04의 `getLatentOrder` 몫으로 잘못 적었음 | 49C-01 | 06이 고침(`4f5d8ae17`): 청사진별 자식 이름 집합. P-04 관련 관측 문장을 고침 |
| M30 | `src/core/settle/utils/latent/readLatentSlotSource.ts`(06, `130aec77d`의 회귀) | 자리 읽기마다 들어온·되살아난 노드 전체로 집합을 다시 만들어 한 배열이 나가고 형제 배열이 들어오는 정착이 제곱 | 49C-01 | 네 번째 verifier가 찾음. 06이 고침(codex `71844513`, `6a9a34ad8`): 정착마다 들어온 잠복 열쇠 색인을 한 번 만들고 추가 자리에서 갱신. 1,000개에서 `JSON.stringify` 2,026,029 → 27,030회 |
| M31 | `src/core/settle/utils/write/getDependencyIndex.ts:83`(06 U7, `eca49e27a`) | 묶은 경로를 계산하고도 묶기 전 템플릿 경로를 펼쳐 한 행의 변화가 모든 행의 소유자를 표시 | 35C-08, 49C-01 | 네 번째 verifier가 찾음. 06이 고침(`ebadd2e09`): 묶은 경로만 펼침. 2,000행 통째 쓰기의 소유자 8,000,000 → 4,000 |
| M32 | `finishSettlement.ts`, `alignArraySnapshotSlots.ts`(06, `fd66556bd`의 회귀) | 한 초안 정렬이 경로 길이 순으로 정렬해 만든 용기의 열쇠 순서가 바뀌고, 배열 용기를 이름 마디로 지나는 경로에서 순차 결과와 다른 `defaultValue` | 49C-01(뜻을 바꾸지 않음) | 네 번째 verifier가 찾음. 06이 고침(`513f109fc`): 등록 순서 유지, 이름 마디는 순차 쓰기로 대체. 차등 검사 16 seed 차이 0 |
| M33 | 시험 제목·공유 헬퍼 | verifier 보고서 이름(FS-2 등)을 시험 제목에 씀, 같은 `DECLARED_NAMES` 캐시가 두 곳, 잠복 경로 색인 삭제 유지 시험 없음 | seiri naming·reuse-first·test-validity | 네 번째 verifier가 지적(비차단). 고침: `f8e4c0df4`, `80358b9de`, `settle/utils/declarations/getDeclaredChildNames.ts`(`6a9a34ad8`, `markWrite.ts`가 M30과 같은 파일이라 한 커밋) |
| M34 | `src/core/settle/utils/compute/selectChildren.ts:213-215`(03) | 호스트 자신의 gate도 `immediate`에 들어가 자식마다 자식 목록·출력을 다시 조립; 배열 통째 쓰기·재진입과 P-03 첫 로드가 제곱 비용 | 51C-01, NODE-026, SETTLE-017, 18C-15, SETTLE-045 | 호스트의 완료한 선택을 정착 범위에서 미루고 필요한 projected-value 읽기·선택 끝에서 갱신. 자식 변경 전에 하위 gate의 읽기 조상을 갱신하여 계산 중인 자식이 조상 출력에 섞이지 않게 함. 2천 배열·객체 host 조립 각각 2,003 → 4회, 같은 바퀴 관측 시험은 변경 전후 통과하며 사전 갱신을 빼면 실패. 초기 HEAD `476c27f11` 대비 100,800단계 차이 0, 노드 revision·identity 12,324건 포함. core 1,290·render 539 통과, tsc·eslint 0. P-03은 R-17로 해결에 이동. 사용자 지시로 `DETAIL.md`·`.seiri/`는 편집하지 않고 문장 제안을 보고함; 커밋·push·stash 없음 |
| M35 | `src/core/settle/utils/gates/flushPendingGateReads.ts`(06, 51C-01 수정) | 아이템 게이트가 있는 행 안에 자기 게이트가 있으면 들어오는 아이템 안의 읽기마다 미리 갱신이 일어나 배열 호스트를 행마다 다시 조립 | 51C-01, NODE-026 | 여섯 번째 verifier가 찾음. 06이 고침(codex `de09a83e`, `099314f29`): 들어오는 자식 안의 읽기는 미리 갱신을 건너뜀. 2,000행 조립 2,003 → 4회 |
| M36 | `src/core/settle/utils/gates/getGateRegistry.ts`의 `readsChanged`(04) | dirty 경로마다 바뀐 경로 전체를 견주어 게이트 행의 통째 쓰기가 제곱 | 49C-01, 52라운드 소유자 확인 | 여섯 번째 verifier가 찾음. 06이 고침(`32b7975e0`): 바뀐 경로와 그 조상 집합 조회. 2,000행 순회 12,006,000 → 8,000회 |
| M37 | `src/core/settle/DETAIL.md` | 51C-01 뒤 정착 도중 노드 객체 읽기가 들어온 자식을 보지 않음 | VALUE-013, EVENT-061, 57C-01 | 여섯 번째 verifier가 지적(비차단). 57C-01: 코드 변경 없음, 직전 커밋을 돌려준다는 문장을 더함(`16fa480ef`) |
| M38 | `schema-form-scenarios` family directories | The seven existing families' documents entered this PR by a package-wide decision. | 60C-01 | 기존 일곱 가족의 문서는 패키지 전체 결정(60C-01)으로 이 PR에 들었다 |
| M8 | 동사의 반환 값 | 원장이 정하지 않음 | GOAL-058(동기) | 레거시 반환을 동기로 지킴(실행 계획 I7, 자율 결정) |
