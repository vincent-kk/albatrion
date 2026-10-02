# 07 전환 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-10-02). 실행 계획은 [execution-plan.md](execution-plan.md), 구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-switch/gates.md`.

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 재개 지점

- 단계: 07 전환(PR-7). 선출 까닭: 02–06이 모두 머지되었고(06 `07a083c18`), 07보다 먼저 처리할 원장 작업이 없다(원장 관리자 착수 답 1). 08·최적화·09는 07 뒤, 릴리스 전환은 D-2에 막힘.
- 브랜치 `feat/schema-form-switch`, base `1.0.0-beta`(`93ff8d7bc`, 69라운드). 작업 자리는 워크트리 `.claude/worktrees/stage-07`(샌드박스가 쓰기를 막는 `.claude/commands/`·`.vscode/`는 이 워크트리에서만 sparse-checkout으로 뺌). PR: 아직 없음.
- seiri 작업 `schema-form-switch`(게이트 원장은 워크트리의 `.seiri/tasks/schema-form-switch/gates.md`), 워크플로우 단계: write-plan(리뷰 1차 반영) → review-plan(고친 범위 재확인).
- 다음 행동: U2(문서 선행, codex 진행 중) 확인과 커밋, 그 뒤 U3·U4.

## 1. 최초 기준선

| 원문 | 커밋 | sha256 앞 12자 |
| --- | --- | --- |
| `plan/07-switch/request.md` | `ce7c2780c` | `2d18c8e8f6ec` |
| `plan/07-switch/adr-and-axes.md` | `ce7c2780c` | `3a0de74015f6` |
| `plan/07-switch/verification.md` | `85e7d01af` | `03921fe0fb80` |
| `reviews/round-68-closing.md` | `1ba284393` | `eb4076c56b01` |

목표·비목표·산출물·완료 기준·게이트는 `request.md`의 "산출물과 완료 기준"과 `verification.md`의 "게이트"를 그대로 쓰고, 실행 계획 §1이 단위와 증거에 잇는다. 구현에 맞춰 이 기준선을 다시 쓰지 않는다.

## 2. 진행

| 날짜 | 단위 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-10-02 | U0 | 원장 관리자에게 착수 확인 1–6과 물음 Q1–Q10을 보내 답을 받음(68C-01–10). 현재 코드·시험·원장 조사(서브에이전트 여섯). 실행 계획·ADR·게이트 원장 작성. Q11–Q15 송부 | `reviews/round-68-closing.md` |
| 2026-10-02 | U0 | 작업 공간 사고: 메인 체크아웃에서 07 브랜치를 만든 탓에 원장 관리자의 68·69라운드 커밋(`1ba284393`·`93ff8d7bc`)이 07 브랜치에 들어감. 소유자가 `1.0.0-beta`를 `93ff8d7bc`로 맞췄고, 07은 워크트리로 옮김. 07의 첫 커밋 `a44003ddd`는 `93ff8d7bc` 위 | 원장 관리자와의 교신 |
| 2026-10-02 | U0 | Q11–Q15 답(69C-01–05, 권장안대로) 반영. 계획 리뷰 1차 `rework-required`(F1–F10) 반영 | `reviews/round-69-closing.md`, 계획 §9 |
| 2026-10-02 | U0 | 계획 리뷰 재확인 `cleared`(G1). Q16 → 70C-01(`nodeFromJSONSchema` 서명 확정) | 계획 §9, `reviews/round-70-closing.md` |
| 2026-10-02 | U2 | 문서 선행 커밋 `9bf211ff1`(DETAIL 16편, codex). codex가 계획 U4의 상호작용 초기화 번호 문장이 REACT-024보다 좁음을 찾아 계획을 고침. antigravity 원장 대조(세션 `59e1ad97`): 차단 0, 비차단 3(인용 오기 둘, 단계 일정 문장 하나) → `1891c8fb3` | 계획 §9, 커밋 |
| 2026-10-02 | U3 | `@winglet/react-utils` 선택 인자 둘과 `minor` changeset(codex), 시험 183 → 188, G6·G7 | `561b37137` |
| 2026-10-02 | U4 | core 통로(codex, apex): 원자 판정 수정 `f00089331`(03·04 결함, 69C-04)과 바인딩 전용 통로 일곱 `a0d30bb36`. core 시험 1,586 → 1,611, unit+render 5,145 초록, G9–G11. codex가 멈춘 항목 하나(일반 `setValue`의 직접 대상 Refresh 보정이 `selfcheck-v5` 기대와 부딪힘, 기존 동작 유지)는 antigravity 리뷰에 판정을 맡김 | 커밋 |
| 2026-10-02 | U4 | antigravity 코드 리뷰(세션 `f65e7a88`): 차단 1 — 호출자가 잎에 쓴 `setValue`가 그 잎을 Refresh에서 뺌(03–06은 입력 출처가 없어 직접 대상을 쓴 입력으로 근사). EVENT-071·18C-94대로 입력 출처 쓰기만 자신을 빼게 고침 `13c50ba51`, 회귀 :756 사례는 입력 통로로 옮기고 짝 사례("호출자 setValue는 그 잎에 1회")를 더함. 분류는 72C-01(03–06 결함 아님). 비차단 1(레코드 칸 순서) 반영. 리뷰어가 시험 유효성 항목에 답하지 못해 U14 최종 검증에 다시 맡김 | `reviews/round-72-closing.md` |
| 2026-10-02 | U5 | 진입점과 형 전환(codex, apex). **붉은 중간 커밋(D1)**: `tsc`가 렌더 계층(providers·components·hooks·formTypeDefinitions·app·helpers·`src/__tests__`)과 stories에서 붉음 — U6–U9가 닫음. core·types·`src/index.ts`·`__legacy__`·bench는 형 오류 0, core·types·레거시 시험 4,174건 초록. 조율자 보정: 03–06 core 벤치 셋(array·node-and-settle·dispatch-and-validation)의 옛 쪽이 `src/core/nodeFromJSONSchema`를 가리켜 전환 뒤 새 엔진끼리 견줄 뻔함 → `src/__legacy__/core/nodeFromJSONSchema`와 레거시 `JSONSchema` 형으로 돌림. 레거시 형 묶음 index 둘을 이름 다시 내보내기로(71C-01). `<Form>`을 그리는 레거시 시험 두 파일(`IfThenElse.onChange.realReact`, `NullableFormScenarios`, 14건)이 붉음 — 처분은 원장 관리자에게 물음(Q18) | §7 |
| 2026-10-02 | U1 | 워크트리에 `yarn install --immutable`과 `@canard/schema-form`의 작업 공간 의존 빌드. 옛 엔진 패키지 벤치 일곱을 `3911b7591`에서 재어 `verification/07-switch/bench-legacy-baseline.json`(종료 코드 1은 03–06의 독립 스크립트 넷이 vitest 묶음이 아니라서 난 "No test suite found"뿐). 처분표·이주 점검표(128행)와 추출 스크립트·옛 스토리 정리표(49파일)·스파이크 사례표(§5)를 codex(세션 셋)가 쓰고 조율자가 확인. BF에 `@canard/schema-form_0.16.0` 별칭(G3–G5) | `verification/07-switch/` |

## 3. 자율 판단

실행 계획 §2.1의 "자율 결정" 행이 판단 기록이다(I1, I8, I9, I12, I22). Q11–Q15의 권장은 69라운드로 닫혀 "닫힘"이 되었다. 구현 중 바뀌면 여기에 날짜와 함께 적는다.

| 날짜 | 물음 | 채택 | 까닭 |
| --- | --- | --- | --- |
| 2026-10-02 | 바인딩 전용 함수의 이름(계획 §3.1의 가칭) | `buildSchemaNodeTree`, `mountSchemaNode`, `reloadSchemaNodeForm`, `adoptSchemaNodeTree`, `writeSchemaNodeInput`, `finishSchemaNodeInput`, `readSchemaNodeInteractionReset` | 동사가 앞에 오는 core 진입의 이름 관례(`dispatch*`, `write*`)를 따르고, settle 내부의 `resetSchemaNodeForm`과 겹치지 않게 폼 reset 통로를 `reload`로 |
| 2026-10-02 | BF의 0.16.0 별칭 모양 | `npm:` 범위 대신 레지스트리 tarball 주소 | 작업 공간 판이 0.16.0이라 `npm:@canard/schema-form@0.16.0`이 작업 공간으로 풀림(transparent workspaces). tarball 주소로 배포 판을 강제. 그 판이 의존하는 `@winglet/*`(`^0.15.0` 등)는 작업 공간 판으로 연결되므로 옛 판 쪽 측정에도 작업 공간의 `@winglet`이 쓰임 — U13 보고서에 적음 |
| 2026-10-02 | 처분표의 판단 필요 행(`VirtualizationManager.test.ts`) | 그대로 산다 | 가상화는 "그대로 쓰는 것"(LANDING-087)이고 시험이 옛 엔진이 아니라 매니저를 직접 단언. 전환 뒤 붉어지면 U8에서 다시 처분 |
| 2026-10-02 | BF `fixtures/equivalent`의 옛 문법 쌍 | U1이 아니라 U13에서 새 문법 쪽과 함께 | 쌍과 `[data-path]` 일치 시험은 한 단위에서 함께 써야 시험이 쌍을 바로 검증함. 기준선 포착과 무관 |

## 4. 원장·계획서·코드 어긋남

실행 계획 §2.2의 M1–M9를 옮긴다. 셈의 차이: `request.md:26`의 438건과 `ledger/test.md:421`의 447건은 계획서 시점의 수이고, 전환 직전 셈(`3911b7591`)은 `src/__tests__` 47파일 444건, 렌더 프로젝트가 모으는 비레거시 시험 전체 52파일 521건이다(68C-01, 처분표 머리의 셈 규칙). 옛 스토리는 오늘 49파일 33,545줄(TEST-025는 33,533줄). TEST-005의 17파일 기준("표면만 고친다" 가운데 조합·옛 키 없음)으로 센 파일은 4파일 24건이다. 18라운드 뒤의 이주 행(LANDING-164·199·202 등)이 많은 시나리오의 기대값을 바꿔 "버리고 새로 쓴다"가 늘었다. TEST-005는 고치지 않는다(68C-01).

2026-10-02 재집계(`3911b7591`): 현재 `vite.config.ts`의 `renderTests`에서 `src/__legacy__`를 제외하면 52파일 521호출 지점이며(`.test.tsx` 51파일과 DOM 의존 `.test.ts` 1파일), `src/__tests__`는 47파일 444건으로 설계 시점 438·447건과 각각 +6·−3건 차이가 납니다. 앞의 53파일 인용 대신 현재 파일 목록과 TEST-005의 4파일 판정 기준은 `verification/07-switch/render-disposition.md`를 따르며 원장은 고치지 않습니다(68C-01).

| ID | 처리 상태 |
| --- | --- |
| M1–M4, M9 | 68라운드로 닫힘 |
| M5 | U2에서 고침 |
| M6 | 69C-03: PR-7의 일(코드와 원장의 어긋남), U4에서 고침 |
| M7 | 69C-04: 03·04의 결함, U4에서 별도 커밋으로 고침 |
| M8 | 69C-05: 결함이 아닌 빈자리, U4에서 미룸 선택을 더함 |

## 7. 레거시 이동 목록(71C-01)

07이 새 코드에서 지우거나 바꾼 것 가운데 레거시가 계속 쓰는 것을 `src/__legacy__/` 안 같은 상대 경로로 옮기거나 사본으로 둔 목록이다. 레거시의 가져오기는 별칭 접두만 바꿨다. 새 코드는 이 경로를 가져오지 않는다(LANDING-159 규칙 1, G19).

| 원래 자리 | 레거시 자리 | 처분 | 근거 |
| --- | --- | --- | --- |
| `src/core/types/node.ts`, `constructor.ts` | `src/__legacy__/core/types/` (index는 이름으로 다시 내보내고 `event`·`state`·`value`는 남은 core 형을 가리킴) | 옮김 | LANDING-087, 71C-01 |
| `src/core/nodeFromJSONSchema.ts`의 옛 구현과 `contextNodeFactory` | `src/__legacy__/core/nodeFromJSONSchema.ts`, `src/__legacy__/core/index.ts` | 옮김 | 70C-01 |
| `src/types/jsonSchema.ts`의 옛 `JSONSchema` 묶음 | `src/__legacy__/types/jsonSchema.ts` | 사본(새 형은 core 스키마 형으로 뜻이 바뀜) | GOAL-088, 71C-01 조건 1 |
| `src/types/error.ts`의 `ValidateFunction`·`ValidatorFactory`·`JSONSchemaError` | `src/__legacy__/types/error.ts` | 옮김(공개 형에서 빠짐) | 32C-01, I12 |
| `src/helpers/jsonSchema/`의 `extractSchemaInfo`·`filter`·`getResolveSchema`·`isNullBranch`·`stripSchemaExtensions` | `src/__legacy__/helpers/jsonSchema/` | 사본(옛 `JSONSchema` 형에 묶임) | 71C-01 조건 1 |

## 5. 스파이크 사례표(68C-09)

68C-09·LANDING-095에 따라 각 실행 사례의 단언을 판정한다. 매개변수는 각각 한 행으로 펼쳤다(`caret`: `sync`의 A·`microtask`의 B, `entry`: `layout`·`passive` × `act`·`native`). 기존 45사례와 EVENT-070 필수 추가 1행이며, `(가) 옮김` 27행·`(가) 더함` 1행·`(나) 옮기지 않음` 18행이다. 새 자리는 `packages/canard/schema-form/` 기준의 계획 경로이고, 꺾쇠 뒤 따옴표는 새 시험 제목이다. 스파이크 파일은 설계 기록으로 보존하며, 이 표는 이식·추가 시험의 실행 완료를 뜻하지 않는다.

| 파일 | 사례 | 판정 | 새 자리 또는 까닭 |
| --- | --- | --- | --- |
| `spikes/events/caret.spike.test.tsx` | `[A-1a] card formatter, typing at the end: caret after each keystroke` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "포맷터의 끝 입력마다 값과 캐럿이 일치한다"(EVENT-003) |
| `spikes/events/caret.spike.test.tsx` | `[A-1b] card formatter, inserting mid-text: caret follows the inserted digit` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "포맷터의 중간 삽입 뒤 캐럿이 삽입한 숫자를 따른다"(EVENT-003) |
| `spikes/events/caret.spike.test.tsx` | `[A-1c] card formatter WITHOUT bookkeeping, inserting mid-text: caret jumps to the end in both modes` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "캐럿 복구가 없는 사용자 포맷터의 캐럿을 바인딩이 대신 복구하지 않는다"(EVENT-003의 입력 소유 책임) |
| `spikes/events/caret.spike.test.tsx` | `[A-2] plain controlled input, typing "xy" at index 2 of "abcd"` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "일반 제어 입력의 중간 연속 삽입에서 캐럿과 값이 유지된다"(EVENT-002·003) |
| `spikes/events/caret.spike.test.tsx` | `[A-2c] DOM value right after the input event returns matches the committed node value` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "입력 이벤트 반환 직후 DOM이 커밋 값과 일치하고 입력은 한 번 갱신된다"(EVENT-002·003) |
| `spikes/events/caret.spike.test.tsx` | `[A-5] composition: DOM keeps the composed text after the input event returns` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "IME 조합의 각 입력 직후 DOM이 조합 중인 글자를 보존한다"(EVENT-065·REACT-029, 실제 브라우저 확인도 별도 필요) |
| `spikes/events/caret.spike.test.tsx` | `[A-3] 1,000 setValue calls in one click handler → commits and renders` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "한 React 클릭의 1,000개 쓰기가 한 커밋에서 모든 입력에 반영된다" |
| `spikes/events/caret.spike.test.tsx` | `[A-3b] 1,000 setValue calls from a native click outside act → one commit` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "act 밖 네이티브 클릭의 1,000개 쓰기가 한 커밋으로 반영된다" |
| `spikes/events/caret.spike.test.tsx` | `[A-3c] 1,000 setValue calls inside store.batch → one dispatch, one commit` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "batch의 1,000개 쓰기는 한 통지 순회와 한 React 커밋으로 반영된다"(EVENT-002·004) |
| `spikes/events/caret.spike.test.tsx` | `[A-4] listener writes another node during the wave → one commit, final values, no tearing` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "리스너 되먹임의 두 파동 뒤 최종 값이 찢어짐과 snapshot 경고 없이 반영된다"(EVENT-007·008) |
| `spikes/events/caret.spike.test.tsx` | `[B-1a] card formatter, typing at the end: caret after each keystroke` | (나) 옮기지 않음 | 마이크로태스크 통지 대안의 설계 탐색이다. 제품은 동기 통지(EVENT-002)이며 제품 단언은 A-1a로 옮긴다. |
| `spikes/events/caret.spike.test.tsx` | `[B-1b] card formatter, inserting mid-text: caret follows the inserted digit` | (나) 옮기지 않음 | 마이크로태스크 대안 비교이며 제품에 없는 모드다(EVENT-002). 제품 단언은 A-1b로 옮긴다. |
| `spikes/events/caret.spike.test.tsx` | `[B-1c] card formatter WITHOUT bookkeeping, inserting mid-text: caret jumps to the end in both modes` | (나) 옮기지 않음 | 마이크로태스크 대안 비교다(EVENT-002). 입력의 캐럿 소유 책임(EVENT-003)은 A-1c로 검증한다. |
| `spikes/events/caret.spike.test.tsx` | `[B-2] plain controlled input, typing "xy" at index 2 of "abcd"` | (나) 옮기지 않음 | `it.fails`인 마이크로태스크 통지 반례이며 제품의 실패 계약이 아니다(EVENT-002). |
| `spikes/events/caret.spike.test.tsx` | `[B-2c] DOM value right after the input event returns matches the committed node value` | (나) 옮기지 않음 | `it.fails`인 지연 통지 반례다. EVENT-002·003의 제품 단언은 A-2c로 옮긴다. |
| `spikes/events/caret.spike.test.tsx` | `[B-5] composition: DOM keeps the composed text after the input event returns` | (나) 옮기지 않음 | `it.fails`인 지연 통지의 조합 입력 반례다. 제품의 동기 통지·DOM 보존은 EVENT-002·065·REACT-029를 따른다. |
| `spikes/events/caret.spike.test.tsx` | `[B-3] 1,000 setValue calls in one click handler → commits and renders` | (나) 옮기지 않음 | 마이크로태스크 대안의 커밋 수 비교다(EVENT-002). 제품 사례는 A-3로 옮긴다. |
| `spikes/events/caret.spike.test.tsx` | `[B-3b] 1,000 setValue calls from a native click outside act → one commit` | (나) 옮기지 않음 | 마이크로태스크 대안의 네이티브 클릭 측정이다(EVENT-002). 제품 사례는 A-3b로 옮긴다. |
| `spikes/events/caret.spike.test.tsx` | `[B-3c] 1,000 setValue calls inside store.batch → one dispatch, one commit` | (나) 옮기지 않음 | 마이크로태스크 대안의 배치 탐색이다(EVENT-002). 제품 배치 단언은 A-3c로 옮긴다. |
| `spikes/events/caret.spike.test.tsx` | `[B-4] listener writes another node during the wave → one commit, final values, no tearing` | (나) 옮기지 않음 | 지연 통지 대안의 되먹임 관찰이다(EVENT-002). 제품의 되먹임·최종 값 단언은 A-4로 옮긴다. |
| `spikes/events/entry.spike.test.tsx` | `commit counter hook is live` | (나) 옮기지 않음 | 스파이크 전용 DevTools 계수 훅의 설치 확인이며 제품 동작이 아니다(68C-09의 설계 탐색). |
| `spikes/events/entry.spike.test.tsx` | `[layout / act] keystroke in a; layout effect writes b` | (가) 옮김 | `src/components/Form/__tests__/entry.test.tsx` → "act 입력 뒤 layout 이펙트 쓰기는 별도 진입과 onChange·검증 요청을 만들고 최종 DOM과 emit이 일치한다"(EVENT-026·070) |
| `spikes/events/entry.spike.test.tsx` | `[layout / native] keystroke in a; layout effect writes b` | (가) 옮김 | `src/components/Form/__tests__/entry.test.tsx` → "네이티브 입력 뒤 layout 이펙트 쓰기는 별도 진입이며 첫 onChange와 최종 emit을 구분한다"(EVENT-026·070, 검증 요청 각 1회·최종 DOM 일치 포함) |
| `spikes/events/entry.spike.test.tsx` | `[passive / act] keystroke in a; passive effect writes b` | (가) 옮김 | `src/components/Form/__tests__/entry.test.tsx` → "act 입력 뒤 passive 이펙트 쓰기는 별도 진입과 onChange·검증 요청을 만들고 최종 DOM과 emit이 일치한다"(EVENT-026·070) |
| `spikes/events/entry.spike.test.tsx` | `[passive / native] keystroke in a; passive effect writes b` | (가) 옮김 | `src/components/Form/__tests__/entry.test.tsx` → "네이티브 입력 뒤 passive 이펙트 쓰기는 별도 진입이며 첫 onChange와 최종 emit을 구분한다"(EVENT-026·070, 검증 요청 각 1회·최종 DOM 일치 포함) |
| `spikes/events/entry.spike.test.tsx` | `[control] keystroke in a with no effect writer -> 1 entry, 1 onChange` | (가) 옮김 | `src/components/Form/__tests__/entry.test.tsx` → "이펙트 쓰기가 없는 입력은 진입·onChange·React 커밋이 각각 한 번이다"(EVENT-026·REACT-011) |
| `spikes/events/entry.spike.test.tsx` | `[listener] keystroke in a; a store listener (not React) writes b -> 1 entry, 1 onChange, 2 waves` | (가) 옮김 | `src/components/Form/__tests__/entry.test.tsx` → "리스너 쓰기는 한 진입의 두 파동이며 최종 값으로 onChange가 한 번 호출된다"(EVENT-008·026) |
| `spikes/work-loop/redteam4-events/current.test.tsx` | `commits and timing` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "10,000개 구독 필드의 루트 전체 쓰기 뒤 DOM에 이전 값이 남지 않는다". `domStale === 0` 단언을 이식하고 레거시 시간·커밋 측정치는 제품 기준으로 복사하지 않는다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `1a. listener calls flushSync mid-wave (setState of another component)` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "리스너가 다른 컴포넌트를 flushSync해도 배달 뒤 모든 필드가 최종 커밋 값을 보인다"(EVENT-007) |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `1b. node.setValue during render and inside getSnapshot` | (나) 옮기지 않음 | 렌더·getSnapshot 쓰기의 경고와 호출 수를 출력하는 설계 탐색이며 제품 단언이 없다. 렌더 중 쓰기의 문서 책임은 REACT-013이다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `1c. tearing with 1,000 nodes, flushSync mid-wave, bumpAllFirst=false` | (나) 옮기지 않음 | 리스너 직전 revision 증가 대안은 EVENT-007로 대체되었다. 제품의 일괄 증가 사례는 `bumpAllFirst=true`로 옮긴다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `1c. tearing with 1,000 nodes, flushSync mid-wave, bumpAllFirst=true` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "revision 일괄 증가 뒤 파동 중 flushSync에서도 1,000개 필드의 최종 DOM이 일치한다"(EVENT-007) |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `1c-plain. 1,000 nodes, no flushSync: commits per handler` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "flushSync 없는 한 핸들러의 1,000개 필드 변경은 한 React 커밋이다" |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `parent tracks root, child tracks f0; consumer flushSync on root=false` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "루트 구독 부모와 필드 구독 자식이 같은 최종 값을 렌더한다"(EVENT-005·007) |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `parent tracks root, child tracks f0; consumer flushSync on root=true` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "루트 리스너의 flushSync 뒤에도 자식 DOM이 최종 값과 일치한다"(EVENT-005·007) |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `7a. focus() from outside a React handler (act) — is the re-publish nested?` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "React 핸들러 밖 focus 명령이 지연 필드를 마운트하고 입력에 도달한다". 공개 `publish` 대신 현행 명령 API를 사용한다(EVENT-063·073). |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `7b. focus() inside a React event handler` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "React 클릭 안의 focus 명령이 지연 필드를 마운트하고 입력에 도달한다"(EVENT-063·073) |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `7c. focus() published by a listener that then flushSyncs — reveal commit inside the wave` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "리스너의 focus 명령 뒤 flushSync가 있어도 노출된 입력에 포커스가 도달한다"(EVENT-063·073) |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `7d. consumer listener on the deferred node flushSyncs after the reveal setState — reveal commit inside the wave` | (가) 옮김 | `src/__tests__/e2e/controls.test.tsx` → "지연 필드 리스너가 노출 상태를 flushSync해도 입력은 focus 명령을 한 번 받는다"(EVENT-063·073) |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `7e. discrete click publishes focus; consumer flushSync mid-wave — reveal commit nests inside the wave` | (나) 옮기지 않음 | 모형의 공개 `publish`·재발행 조합으로 내부 리스너가 두 번 받는다는 설계 탐색 단언이다. 공개 `publish`는 EVENT-063·073으로 대체되어 이 중복 횟수를 제품 계약으로 남기지 않는다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `7f. wave cap vs React-mediated loops: layout effect writes back on every render` | (나) 옮기지 않음 | 단언 없이 200회 안전장치와 관측값을 출력하는 순환 탐색이다. EVENT-070이 요구한 양쪽 이펙트·React 18·19 종료 단언은 마지막 추가 행으로 대체한다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `microtaskNotify=false` | (나) 옮기지 않음 | 캐럿·값을 출력할 뿐 단언 없는 초기 모형 탐색이다. EVENT-003의 수용 단언은 `caret`의 A-1a·A-1b·A-2로 옮긴다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `microtaskNotify=true` | (나) 옮기지 않음 | 단언 없는 마이크로태스크 통지 대안 관찰이며 EVENT-002가 동기 통지로 정했다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `model: synchronous notify` | (가) 옮김 | `src/__tests__/e2e/notify.test.tsx` → "10,000개 동기 구독 필드의 한 핸들러 변경이 한 React 커밋으로 배달된다". 시간 출력에는 예산을 새로 부여하지 않는다. |
| `spikes/work-loop/redteam4-events/react.test.tsx` | `C is committed but never bumped → its component never re-renders` | (나) 옮기지 않음 | 마지막 파동의 C가 커밋됐는데 DOM은 비어 있다는 초기 모형 결함을 고정한다. 마지막 파동도 배달하는 EVENT-008·revision 일괄 증가 EVENT-007로 대체되어 낡은 DOM 단언을 이식하지 않는다. |
| `spikes/events/effect-feedback.spike.test.tsx`(새) | EVENT-070: `useLayoutEffect`·`useEffect`에서 두 필드가 `node.setValue`로 서로를 되쓴다 | (가) 더함 | `spikes/events/`에 추가하여 `react18`·`render` 두 판 실행(React 18·19). 두 이펙트 모두 React가 순환을 throw나 중단으로 끊는지 단언한다. 계속 돌면 EVENT-070대로 소유자에게 올린다(68C-09·REACT-017). |

## 6. UI 플러그인 고친 줄(68C-07)

U12에서 채운다.
