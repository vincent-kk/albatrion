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
| 2026-10-03 | U8 | 렌더 처분·하니스 이주 1a821faa7, 재귀 확장 수정 29d061941, placeholder 경로 추적 수정 fc651e734; 78C-01에 따라 중단 5파일을 삭제하고 유효한 관찰을 U9 e2e로 인계 | 78C-01·02, `verification/07-switch/u8-disposition-report.md` |
| 2026-10-02 | U0 | 원장 관리자에게 착수 확인 1–6과 물음 Q1–Q10을 보내 답을 받음(68C-01–10). 현재 코드·시험·원장 조사(서브에이전트 여섯). 실행 계획·ADR·게이트 원장 작성. Q11–Q15 송부 | `reviews/round-68-closing.md` |
| 2026-10-02 | U0 | 작업 공간 사고: 메인 체크아웃에서 07 브랜치를 만든 탓에 원장 관리자의 68·69라운드 커밋(`1ba284393`·`93ff8d7bc`)이 07 브랜치에 들어감. 소유자가 `1.0.0-beta`를 `93ff8d7bc`로 맞췄고, 07은 워크트리로 옮김. 07의 첫 커밋 `a44003ddd`는 `93ff8d7bc` 위 | 원장 관리자와의 교신 |
| 2026-10-02 | U0 | Q11–Q15 답(69C-01–05, 권장안대로) 반영. 계획 리뷰 1차 `rework-required`(F1–F10) 반영 | `reviews/round-69-closing.md`, 계획 §9 |
| 2026-10-02 | U0 | 계획 리뷰 재확인 `cleared`(G1). Q16 → 70C-01(`nodeFromJSONSchema` 서명 확정) | 계획 §9, `reviews/round-70-closing.md` |
| 2026-10-02 | U2 | 문서 선행 커밋 `9bf211ff1`(DETAIL 16편, codex). codex가 계획 U4의 상호작용 초기화 번호 문장이 REACT-024보다 좁음을 찾아 계획을 고침. antigravity 원장 대조(세션 `59e1ad97`): 차단 0, 비차단 3(인용 오기 둘, 단계 일정 문장 하나) → `1891c8fb3` | 계획 §9, 커밋 |
| 2026-10-02 | U3 | `@winglet/react-utils` 선택 인자 둘과 `minor` changeset(codex), 시험 183 → 188, G6·G7 | `561b37137` |
| 2026-10-02 | U4 | core 통로(codex, apex): 원자 판정 수정 `f00089331`(03·04 결함, 69C-04)과 바인딩 전용 통로 일곱 `a0d30bb36`. core 시험 1,586 → 1,611, unit+render 5,145 초록, G9–G11. codex가 멈춘 항목 하나(일반 `setValue`의 직접 대상 Refresh 보정이 `selfcheck-v5` 기대와 부딪힘, 기존 동작 유지)는 antigravity 리뷰에 판정을 맡김 | 커밋 |
| 2026-10-02 | U4 | antigravity 코드 리뷰(세션 `f65e7a88`): 차단 1 — 호출자가 잎에 쓴 `setValue`가 그 잎을 Refresh에서 뺌(03–06은 입력 출처가 없어 직접 대상을 쓴 입력으로 근사). EVENT-071·18C-94대로 입력 출처 쓰기만 자신을 빼게 고침 `13c50ba51`, 회귀 :756 사례는 입력 통로로 옮기고 짝 사례("호출자 setValue는 그 잎에 1회")를 더함. 분류는 72C-01(03–06 결함 아님). 비차단 1(레코드 칸 순서) 반영. 리뷰어가 시험 유효성 항목에 답하지 못해 U14 최종 검증에 다시 맡김 | `reviews/round-72-closing.md` |
| 2026-10-02 | U5 | 진입점과 형 전환(codex, apex). **붉은 중간 커밋(D1)**: `tsc`가 렌더 계층(providers·components·hooks·formTypeDefinitions·app·helpers·`src/__tests__`)과 stories에서 붉음 — U6–U9가 닫음. core·types·`src/index.ts`·`__legacy__`·bench는 형 오류 0, core·types·레거시 시험 4,174건 초록. 조율자 보정: 03–06 core 벤치 셋(array·node-and-settle·dispatch-and-validation)의 옛 쪽이 `src/core/nodeFromJSONSchema`를 가리켜 전환 뒤 새 엔진끼리 견줄 뻔함 → `src/__legacy__/core/nodeFromJSONSchema`와 레거시 `JSONSchema` 형으로 돌림. 레거시 형 묶음 index 둘을 이름 다시 내보내기로(71C-01). `<Form>`을 그리는 레거시 시험 두 파일(`IfThenElse.onChange.realReact`, `NullableFormScenarios`, 14건)이 붉음 — 처분은 원장 관리자에게 물음(Q18) | §7 |
| 2026-10-02 | U5 | Q18 → 73C-01: 레거시 파일은 고치지 않고, `<Form>`을 그리는 레거시 사례 14건은 처분표 추가 행으로 처분(09 §4.3), 붉음은 render·unit 포함 글롭에서 `src/__legacy__/**` 전체를 빼서 없앰(LANDING-159 보충). 처분표 머리에 뺀 레거시 시험 수를 적음. U8에서 반영 | `reviews/round-73-closing.md` |
| 2026-10-02 | U5 | 74라운드 소유자 답(레거시 완전 분리, `72ae01e62`): 레거시가 가져오던 새 코드를 전환 직전 내용의 사본으로 레거시 안에 둠(codex, 진행 중), 양방향 가져오기 0을 lint와 점검 스크립트로(G13b). Q19 → 75C-01: `<Form>`을 그리는 레거시 시험 두 파일은 사례를 처분표 행으로 새 e2e에 옮긴 뒤 지움(U8), lint 예외 없음. 별칭 종료는 이주 점검표 맺음 줄로 | `reviews/round-74-owner-answers.md`, `round-75-closing.md` |
| 2026-10-03 | U5–U8 | **전환 묶음 끝 초록**(`996827895`): `tsc` 0, lint 초록, render 34파일 181건, 레거시 양방향 import 0. 게이트 G8·G12·G13·G13b·G14·G15·G16·G17·G17b 충족. U8 위임은 자동 권한 판정기가 한 번 막아 소유자의 명시 허가("노르덴컨트롤의 답에 따른 동작을 허가") 뒤 77C-01 범위로 다시 맡김. 옛 스토리의 글롭·tsconfig 제외는 U9까지의 임시 발판(77C-01) | `reviews/round-77-closing.md`, `round-78-closing.md` |
| 2026-10-03 | U9 | e2e 26파일 195건(codex 두 묶음, 파일당 15건 이하, 사례 제목은 원장 ID로 시작, 78C-01), 스파이크 (가) 이식과 EVENT-070 사례 추가(실행은 U11). 찾은 결함: SETTLE-049 부분 트리 로드 밖 주입 대상의 Refresh 누락(`56817740d`), 폼 수준 오류 목록에서 루트 외부 오류가 빠짐(Q22 → 79C-01, `d5fc1e3f4`). 공유 시나리오의 빈 입력을 `clear` 단계로. 시나리오 스토리 10파일 43건·사용법 4파일, 옛 스토리 49파일 삭제와 임시 제외 해제(77C-01). Storybook의 Chromium 실행은 샌드박스가 Mach 포트 등록을 막아(`Permission denied (1100)`) 이 세션에서 돌지 않음 — 브라우저 게이트(U11)는 소유자가 직접 실행해야 함. G18·G19·G19b 충족 | `reviews/round-79-closing.md` |
| 2026-10-03 | U10·U12 | U12 UI 플러그인 이름 이주(`05516c496`, 08 목록 114줄). U10 이주 점검 128행 처분(`2cef0c37a`), Q23 → 80C-01·02로 LANDING-209·210 행 추가(130행, `--check-complete` 통과). 80C-03: 05·03 결함 둘은 §8, LANDING-021의 옛 `SetValueOption` 잔재 제거는 07 몫(LANDING-087), `FormHandle.reset(option?)`은 U6이 빠뜨린 것을 채움(`8e184e2a2`) | `reviews/round-80-closing.md` |
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

U8(77C-01·75C-01): `src/__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx`는 지움(공개 겉면의 시험, 사례 2건은 `verification/07-switch/render-disposition.md`의 레거시 추가 행 1–2), `NullableFormScenarios.test.tsx`는 지움(공개 겉면의 시험, 사례 12건은 같은 표의 추가 행 3–14). ESLint·격리 도구의 두 파일 예외도 제거했습니다. 레거시 시험 157파일·2311건은 LANDING-159 보충대로 unit·render에서 제외하며, 두 파일 삭제 후 참고용 시험은 155파일·2297건입니다.

U8 중단 기록: 원장 충돌 5파일의 원문 보존은 78C-01의 "버리고 새로 쓴다" 처분으로 닫아 삭제했습니다. 유효한 관찰의 U9 예정 사례와 변경 근거는 렌더 처분표에, 소비자가 볼 변경은 이주 점검표에 교차 기록했습니다. 재귀 확장·placeholder 경로 결함은 29d061941·fc651e734로 고쳤으며 귀속은 §8에 적습니다. 파일별 관찰과 검증은 `verification/07-switch/u8-disposition-report.md`에 있습니다. I21의 옛 스토리 보존 해석은 77C-01에 따라 U9까지의 임시 제외로 바로잡았으며 U9 끝에 파일과 제외 설정을 함께 없앱니다.

07이 새 코드에서 지우거나 바꾼 것 가운데 레거시가 계속 쓰는 것을 `src/__legacy__/` 안 같은 상대 경로로 옮기거나 사본으로 둔 목록이다. 레거시의 가져오기는 별칭 접두만 바꿨다. 새 코드는 이 경로를 가져오지 않는다(LANDING-159 규칙 1, G19).

| 원래 자리 | 레거시 자리 | 처분 | 근거 |
| --- | --- | --- | --- |
| `src/core/types/node.ts`, `constructor.ts` | `src/__legacy__/core/types/` (index는 이름으로 다시 내보내고 `event`·`state`·`value`는 남은 core 형을 가리킴) | 옮김 | LANDING-087, 71C-01 |
| `src/core/nodeFromJSONSchema.ts`의 옛 구현과 `contextNodeFactory` | `src/__legacy__/core/nodeFromJSONSchema.ts`, `src/__legacy__/core/index.ts` | 옮김 | 70C-01 |
| `src/types/jsonSchema.ts`의 옛 `JSONSchema` 묶음 | `src/__legacy__/types/jsonSchema.ts` | 사본(새 형은 core 스키마 형으로 뜻이 바뀜) | GOAL-088, 71C-01 조건 1 |
| `src/types/error.ts`의 `ValidateFunction`·`ValidatorFactory`·`JSONSchemaError` | `src/__legacy__/types/error.ts` | 옮김(공개 형에서 빠짐) | 32C-01, I12 |
| `src/helpers/jsonSchema/`의 `extractSchemaInfo`·`filter`·`getResolveSchema`·`isNullBranch`·`stripSchemaExtensions` | `src/__legacy__/helpers/jsonSchema/` | 사본(옛 `JSONSchema` 형에 묶임) | 71C-01 조건 1 |
| 레거시가 가져오던 새 코드 전부(전이 폐쇄): `errors`, `helpers/{error,warning,defaultValue,dynamicExpression,schemaIntersection,jsonPointer,jsonSchema}`, `app/constants`, `types/{value,injectTo}`, `core/types/{event,state,value}`와 `core/blueprint`·`core/validation`이 닿는 새 core 103파일 — 모두 190파일 | `src/__legacy__/` 같은 상대 경로 | 사본(전환 직전 `1def2cc4f`의 내용, 가져오기는 별칭 접두만 바꿈). 목록은 `verification/07-switch/legacy-copies.md` | 74라운드 소유자 답 |
| 렌더 계층으로 가던 형 전용 연결(옛 스키마의 `FormTypeInput` 칸 형, 렌더 오류 형, 플러그인 형) | 레거시 안의 최소 형(`ComponentType<never>`, 로컬 `FormatError`, `PluginErrorFeatures`) | 대체 — 옛 렌더 계층은 복제하지 않음 | 75C-01 |
| `src/__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx`, `NullableFormScenarios.test.tsx` | — | 지움 예정(U8, 공개 겉면의 시험, 사례는 처분표 추가 행) | 75C-01 |

## 8. 앞 단계 결함

| 날짜 | 귀속 | 결함 | 재현 스키마 | 수정 커밋 | 근거 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-03 | 03 정착(78C-02) | self-recursive `$ref: "#"` 배열 아이템이 자라지 않음. hasRecursiveExpansion이 배열 아이템 아래의 확장을 거부해 RECURSIVE_SHAPE_DIVERGED를 냄 | `{ type: 'object', properties: { id: { type: 'string' }, children: { type: 'array', items: { $ref: '#' } } } }`, 값 `{ id: 'root', children: [{}] }` | `29d061941` | BLUEPRINT-030, 78C-02 |
| 2026-10-03 | 07 바인딩 | 앞 행 remove 뒤 deferred placeholder가 UpdatePath를 따르지 않아 옛 경로에 남음. 이동한 노출 필드 주소와 겹쳐 다시 placeholder로 관찰됨 | `{ type: 'object', properties: { items: { type: 'array', items: { type: 'string' } } } }`; 값은 items의 문자열 12개, 가상화 threshold 10·eagerCount 3·backfill None. `/items/11`을 드러낸 뒤 0번 행 remove → `/items/10`에서 재현 | `fc651e734` | LANDING-087, WRITE-045; reveal 기록은 노드 identity를 유지하며 placeholder의 경로 추적 누락을 고침 |
| 2026-10-03 | 05 디스패치(80C-03 가) | `Overwrite`와 `Merge`를 함께 준 `setValue`가 `Overwrite`로 동작함. 05가 오류 코드 표에 `INVALID_WRITE_OPTION`을 "확정·동일"로 올렸으나 동작을 두지 않음 | 아무 노드에 `node.setValue(v, SetValueOption.Overwrite \| SetValueOption.Merge)` | `2cef0c37a` | LANDING-141, 증거 `src/__tests__/migration/node-surface.test.tsx > LANDING-141 Overwrite combined with Merge throws INVALID_WRITE_OPTION` |
| 2026-10-03 | 03 정착(80C-03 나) | 켜진 `then`의 `required`가 자식의 필수 표시에 반영되지 않음. 정착의 커밋 배달(`settle/utils/commit/markCommitDeliveries.ts`)이 유효 스키마의 `required` 변화를 자식에 싣지 않음 | 객체 호스트에 `if`/`then: { required: ['b'] }`, 조건 값을 바꿔 `then`을 켬 | `2cef0c37a` | LANDING-132·SCHEMA-041, 증거 `src/__tests__/migration/schema-controls.test.tsx > LANDING-132 conditional required updates the input required flag` |

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

U12는 LANDING-067·206, 68C-07에 따라 공개 표면의 이름과 컴파일에 필요한 대응만 고칩니다. `node.strategy`와 렌더러 등록 키를 사용하고, 정수 판별은 작성된 종류인 `schemaType`으로 옮겨 기존 정수 파싱·선택을 유지합니다. 배열의 삭제된 `maxItems`·`length` 게터는 같은 상한 계산(닫힌 튜플 포함)과 branch 자식 수·terminal 값 길이로 대응합니다. `presentation.*`·옵션 키, 빈 입력 방출, union 지원은 08 목록에 남깁니다.

검증 범위: 네 플러그인의 번들·선언 생성 및 `src`·`stories`를 포함한 전체 타입 검사, 지정된 이름 검색. 후속 요청으로 `stories/**`도 수정 범위에 포함됐습니다. schema-form의 `exports["."].types`는 `dist/index.d.ts`이므로 새 엔진의 dist를 먼저 생성합니다. 설치와 git 쓰기는 하지 않습니다.

### U12 변경 줄

수정 뒤의 줄 번호와 전후 식을 아래에 기록합니다. 삽입 줄의 이전 값은 `∅`입니다.

| 플러그인 | 파일:줄(패키지 기준) | 이전 → 이후 | 같은 입력에서 렌더 결과·방출 값이 같은가 |
| --- | --- | --- | --- |
| antd5 | `src/components/FormGroup.tsx:18` | `if (node.group === 'branch') {` → `if (node.strategy === 'branch') {` | 같음 — 같은 branch/terminal 전략으로 같은 JSX 분기를 선택합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:5` | `∅` → `import { isArray } from '@winglet/common-utils/filter';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:6` | `∅` → `import { minLite } from '@winglet/common-utils/math';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:25` | `∅` → `jsonSchema,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:32` | `∅` → `const maxItems = minLite(` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:33` | `∅` → `typeof jsonSchema.maxItems === 'number' ? jsonSchema.maxItems : Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:34` | `∅` → `!jsonSchema.items && isArray(jsonSchema.prefixItems)` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:35` | `∅` → `? jsonSchema.prefixItems.length` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:36` | `∅` → `: Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:37` | `∅` → `);` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:38` | `∅` → `const length = node.children?.length ?? node.value?.length ?? 0;` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputArray.tsx:64` | `{!readOnly && node.maxItems > node.length && (` → `{!readOnly && maxItems > length && (` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd5 | `src/formTypeInputs/FormTypeInputNumber.tsx:62` | `type: ['number', 'integer'],` → `schemaType: ['number', 'integer'],` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:84` | `test: ({ type, formType, jsonSchema }) => {` → `test: ({ schemaType: type, formType, jsonSchema }) => {` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputSlider.tsx:53` | `type: ['number', 'integer'],` → `schemaType: ['number', 'integer'],` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd5 | `src/index.ts:10` | `FormGroup,` → `FormTypeGroupRenderer: FormGroup,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd5 | `src/index.ts:11` | `FormLabel,` → `FormTypeLabelRenderer: FormLabel,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd5 | `src/index.ts:12` | `FormInput,` → `FormTypeInputRenderer: FormInput,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd5 | `src/index.ts:13` | `FormError,` → `FormTypeErrorRenderer: FormError,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd6 | `src/components/FormGroup.tsx:18` | `if (node.group === 'branch') {` → `if (node.strategy === 'branch') {` | 같음 — 같은 branch/terminal 전략으로 같은 JSX 분기를 선택합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:5` | `∅` → `import { isArray } from '@winglet/common-utils/filter';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:6` | `∅` → `import { minLite } from '@winglet/common-utils/math';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:25` | `∅` → `jsonSchema,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:32` | `∅` → `const maxItems = minLite(` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:33` | `∅` → `typeof jsonSchema.maxItems === 'number' ? jsonSchema.maxItems : Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:34` | `∅` → `!jsonSchema.items && isArray(jsonSchema.prefixItems)` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:35` | `∅` → `? jsonSchema.prefixItems.length` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:36` | `∅` → `: Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:37` | `∅` → `);` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:38` | `∅` → `const length = node.children?.length ?? node.value?.length ?? 0;` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputArray.tsx:64` | `{!readOnly && node.maxItems > node.length && (` → `{!readOnly && maxItems > length && (` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd6 | `src/formTypeInputs/FormTypeInputNumber.tsx:62` | `type: ['number', 'integer'],` → `schemaType: ['number', 'integer'],` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:84` | `test: ({ type, formType, jsonSchema }) => {` → `test: ({ schemaType: type, formType, jsonSchema }) => {` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputSlider.tsx:53` | `type: ['number', 'integer'],` → `schemaType: ['number', 'integer'],` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd6 | `src/index.ts:10` | `FormGroup,` → `FormTypeGroupRenderer: FormGroup,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd6 | `src/index.ts:11` | `FormLabel,` → `FormTypeLabelRenderer: FormLabel,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd6 | `src/index.ts:12` | `FormInput,` → `FormTypeInputRenderer: FormInput,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd6 | `src/index.ts:13` | `FormError,` → `FormTypeErrorRenderer: FormError,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd-mobile | `src/components/FormGroup.tsx:18` | `if (node.group === 'branch') {` → `if (node.strategy === 'branch') {` | 같음 — 같은 branch/terminal 전략으로 같은 JSX 분기를 선택합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:4` | `∅` → `import { isArray } from '@winglet/common-utils/filter';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:5` | `∅` → `import { minLite } from '@winglet/common-utils/math';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:30` | `∅` → `jsonSchema,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:37` | `∅` → `const maxItems = minLite(` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:38` | `∅` → `typeof jsonSchema.maxItems === 'number' ? jsonSchema.maxItems : Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:39` | `∅` → `!jsonSchema.items && isArray(jsonSchema.prefixItems)` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:40` | `∅` → `? jsonSchema.prefixItems.length` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:41` | `∅` → `: Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:42` | `∅` → `);` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:43` | `∅` → `const length = node.children?.length ?? node.value?.length ?? 0;` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputArray.tsx:68` | `{!readOnly && node.maxItems > node.length && (` → `{!readOnly && maxItems > length && (` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputNumber.tsx:51` | `type: ['number', 'integer'],` → `schemaType: ['number', 'integer'],` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:89` | `test: ({ type, formType, jsonSchema }) => {` → `test: ({ schemaType: type, formType, jsonSchema }) => {` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputSlider.tsx:57` | `test: ({ type, jsonSchema, format }) => {` → `test: ({ schemaType: type, jsonSchema, format }) => {` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| antd-mobile | `src/index.ts:10` | `FormGroup,` → `FormTypeGroupRenderer: FormGroup,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd-mobile | `src/index.ts:11` | `FormLabel,` → `FormTypeLabelRenderer: FormLabel,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd-mobile | `src/index.ts:12` | `FormInput,` → `FormTypeInputRenderer: FormInput,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| antd-mobile | `src/index.ts:13` | `FormError,` → `FormTypeErrorRenderer: FormError,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| mui | `src/components/FormGroup.tsx:14` | `if (node.group === 'branch') {` → `if (node.strategy === 'branch') {` | 같음 — 같은 branch/terminal 전략으로 같은 JSX 분기를 선택합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:5` | `∅` → `import { isArray } from '@winglet/common-utils/filter';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:6` | `∅` → `import { minLite } from '@winglet/common-utils/math';` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:25` | `∅` → `jsonSchema,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:32` | `∅` → `const maxItems = minLite(` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:33` | `∅` → `typeof jsonSchema.maxItems === 'number' ? jsonSchema.maxItems : Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:34` | `∅` → `!jsonSchema.items && isArray(jsonSchema.prefixItems)` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:35` | `∅` → `? jsonSchema.prefixItems.length` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:36` | `∅` → `: Infinity,` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:37` | `∅` → `);` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:38` | `∅` → `const length = node.children?.length ?? node.value?.length ?? 0;` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputArray.tsx:66` | `{!readOnly && node.maxItems > node.length && (` → `{!readOnly && maxItems > length && (` | 같음 — 기존 게터의 상한(기본 Infinity·닫힌 튜플)과 길이(branch 자식 수·terminal 값 길이)를 공개 필드로 같은 방식으로 계산합니다. |
| mui | `src/formTypeInputs/FormTypeInputNumber.tsx:29` | `type,` → `schemaType: type,` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| mui | `src/formTypeInputs/FormTypeInputNumber.tsx:120` | `type: ['number', 'integer'],` → `schemaType: ['number', 'integer'],` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| mui | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:124` | `test: ({ type, formType, jsonSchema }) =>` → `test: ({ schemaType: type, formType, jsonSchema }) =>` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| mui | `src/formTypeInputs/FormTypeInputSlider.tsx:113` | `test: ({ type, formType }) =>` → `test: ({ schemaType: type, formType }) =>` | 같음 — 정수 종류를 schemaType으로 읽어 기존 number/integer 선택·정수 파싱·step과 방출 값을 유지합니다. union 지원은 추가하지 않습니다. |
| mui | `src/index.ts:10` | `FormGroup,` → `FormTypeGroupRenderer: FormGroup,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| mui | `src/index.ts:11` | `FormLabel,` → `FormTypeLabelRenderer: FormLabel,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| mui | `src/index.ts:12` | `FormInput,` → `FormTypeInputRenderer: FormInput,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |
| mui | `src/index.ts:13` | `FormError,` → `FormTypeErrorRenderer: FormError,` | 같음 — 등록 슬롯의 공개 이름만 대응하며 기존 렌더 컴포넌트와 입력 정의 순서를 유지합니다. |

src 수정 줄 수(추가·교체된 이후 줄, 공백 줄 제외): antd5 19줄, antd6 19줄, antd-mobile 19줄, mui 20줄. 총 77줄이며 모든 수정 줄의 판정은 같음입니다.

#### U12 stories 후속 수정

후속 요청에서 각 플러그인의 `stories/**`를 허용했습니다. 수정 전 전체 타입검사에서 네 패키지 각각 8건의 같은 오류를 재현했습니다. 새 렌더러 prop 이름, 공개 `ValidationIssue` 이름 및 `onValidate`의 읽기 전용 배열 형식만 대응하며 schema·presentation·옵션 키·validator 구현·handle 호출은 변경하지 않습니다.

| 플러그인 | 파일:줄(패키지 기준) | 이전 → 이후 | 같은 입력에서 렌더 결과·방출 값이 같은가 |
| --- | --- | --- | --- |
| antd5 | `stories/FormComponent.stories.tsx:163` | `FormErrorRenderer={FormError}` → `FormTypeErrorRenderer={FormError}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd5 | `stories/FormComponent.stories.tsx:176` | `FormInputRenderer={FormInput}` → `FormTypeInputRenderer={FormInput}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd5 | `stories/FormComponent.stories.tsx:189` | `FormLabelRenderer={FormLabel}` → `FormTypeLabelRenderer={FormLabel}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd5 | `stories/FormComponent.stories.tsx:202` | `FormGroupRenderer={FormGroup}` → `FormTypeGroupRenderer={FormGroup}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd5 | `stories/FormTypeInput.stories.tsx:7` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| antd5 | `stories/FormTypeInput.stories.tsx:37` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| antd5 | `stories/RegisterPlugin.stories.tsx:11` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| antd5 | `stories/RegisterPlugin.stories.tsx:612` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| antd6 | `stories/FormComponent.stories.tsx:163` | `FormErrorRenderer={FormError}` → `FormTypeErrorRenderer={FormError}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd6 | `stories/FormComponent.stories.tsx:176` | `FormInputRenderer={FormInput}` → `FormTypeInputRenderer={FormInput}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd6 | `stories/FormComponent.stories.tsx:189` | `FormLabelRenderer={FormLabel}` → `FormTypeLabelRenderer={FormLabel}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd6 | `stories/FormComponent.stories.tsx:202` | `FormGroupRenderer={FormGroup}` → `FormTypeGroupRenderer={FormGroup}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd6 | `stories/FormTypeInput.stories.tsx:7` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| antd6 | `stories/FormTypeInput.stories.tsx:38` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| antd6 | `stories/RegisterPlugin.stories.tsx:11` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| antd6 | `stories/RegisterPlugin.stories.tsx:612` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| antd-mobile | `stories/FormComponent.stories.tsx:163` | `FormErrorRenderer={FormError}` → `FormTypeErrorRenderer={FormError}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd-mobile | `stories/FormComponent.stories.tsx:176` | `FormInputRenderer={FormInput}` → `FormTypeInputRenderer={FormInput}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd-mobile | `stories/FormComponent.stories.tsx:189` | `FormLabelRenderer={FormLabel}` → `FormTypeLabelRenderer={FormLabel}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd-mobile | `stories/FormComponent.stories.tsx:202` | `FormGroupRenderer={FormGroup}` → `FormTypeGroupRenderer={FormGroup}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| antd-mobile | `stories/FormTypeInput.stories.tsx:7` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| antd-mobile | `stories/FormTypeInput.stories.tsx:31` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| antd-mobile | `stories/RegisterPlugin.stories.tsx:11` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| antd-mobile | `stories/RegisterPlugin.stories.tsx:613` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| mui | `stories/FormComponent.stories.tsx:163` | `FormErrorRenderer={FormError}` → `FormTypeErrorRenderer={FormError}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| mui | `stories/FormComponent.stories.tsx:176` | `FormInputRenderer={FormInput}` → `FormTypeInputRenderer={FormInput}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| mui | `stories/FormComponent.stories.tsx:189` | `FormLabelRenderer={FormLabel}` → `FormTypeLabelRenderer={FormLabel}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| mui | `stories/FormComponent.stories.tsx:202` | `FormGroupRenderer={FormGroup}` → `FormTypeGroupRenderer={FormGroup}` | 같음 — 새 공개 슬롯으로 같은 렌더 컴포넌트를 연결하며 기존 입력 스키마와 JSX를 유지합니다. |
| mui | `stories/FormTypeInput.stories.tsx:7` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| mui | `stories/FormTypeInput.stories.tsx:35` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| mui | `stories/RegisterPlugin.stories.tsx:11` | `type JSONSchemaError,` → `type ValidationIssue,` | 같음 — 지워지는 타입 가져오기만 바꾸며 검증 오류의 런타임 객체를 변환하지 않습니다. |
| mui | `stories/RegisterPlugin.stories.tsx:612` | `const [errors, setErrors] = useState<JSONSchemaError[]>([]);` → `const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);` | 같음 — onValidate의 읽기 전용 배열을 같은 setter로 보관하며 초기 배열·콜백·오류 표시는 유지합니다. |
| antd5 | `stories/components/StoryLayout.tsx:13` | `errors?: any[];` → `errors?: readonly any[];` | 같음 — 읽기만 하는 표시 prop의 타입을 넓히며 같은 배열 참조와 JSON.stringify(errors, null, 2) 출력을 유지합니다. |
| antd6 | `stories/components/StoryLayout.tsx:13` | `errors?: any[];` → `errors?: readonly any[];` | 같음 — 읽기만 하는 표시 prop의 타입을 넓히며 같은 배열 참조와 JSON.stringify(errors, null, 2) 출력을 유지합니다. |
| antd-mobile | `stories/components/StoryLayout.tsx:13` | `errors?: any[];` → `errors?: readonly any[];` | 같음 — 읽기만 하는 표시 prop의 타입을 넓히며 같은 배열 참조와 JSON.stringify(errors, null, 2) 출력을 유지합니다. |
| mui | `stories/components/StoryLayout.tsx:13` | `errors?: any[];` → `errors?: readonly any[];` | 같음 — 읽기만 하는 표시 prop의 타입을 넓히며 같은 배열 참조와 JSON.stringify(errors, null, 2) 출력을 유지합니다. |

stories 후속 수정은 각 플러그인 9줄씩 총 36줄입니다. src와 stories를 합쳐 antd5 28줄·antd6 28줄·antd-mobile 28줄·mui 29줄, 전체 113줄이며 모두 같음으로 판정합니다. 컴파일 때문에 동작 또는 옵션 키를 바꿔야 하는 새 줄은 없으므로 08 목록 114행을 유지합니다.

읽기 전용 상태 배열 대응 뒤 전체 검사에서 TS4104가 각 2건 드러났습니다. 원인은 두 사용처가 아니라 `StoryLayout`의 `errors?: any[]` 표시 prop입니다. 이 컴포넌트는 오류 배열을 변경하지 않고 JSON.stringify로 표시하므로 prop을 `readonly any[]`로 넓혀 같은 참조를 받게 합니다. 배열 복사나 오류 변환은 추가하지 않습니다.

### 08 목록

기존 키를 새 presentation 표면으로 옮기거나 방출 값을 바꾸는 줄은 07에서 수정하지 않습니다. 같은 작성 입력을 그대로 넣었을 때 옵션 읽기·입력 선택·방출 값이 달라질 수 있으므로 08에서 소비자 이주와 함께 검증합니다.

| 플러그인 | 파일:줄(패키지 기준) | 수정하지 않은 식 | 08 작업 | 같은 입력에서 렌더 결과·방출 값이 같은가 |
| --- | --- | --- | --- | --- |
| antd5 | `src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:71` | `test: ({ type, formType }) => type === 'boolean' && formType === 'switch',` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputDate.tsx:43` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputDateRange.tsx:68` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputDateRange.tsx:98` | `test: ({ type, format, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputDateRange.tsx:100` | `(format === 'date-range' &#124;&#124; formType === 'dateRange') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputMonth.tsx:43` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputMonthRange.tsx:67` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputMonthRange.tsx:97` | `test: ({ type, format, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputMonthRange.tsx:99` | `(format === 'month-range' &#124;&#124; formType === 'monthRange') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputNumber.tsx:37` | `const handleChange = useHandle((value: number &#124; null) => {` | 빈 수 입력·null/NaN 방출 이주 | 다름 — 동일한 빈 입력의 방출 값이 null/NaN에서 undefined 등으로 바뀝니다(LANDING-182–184). |
| antd5 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:84` | `test: ({ schemaType: type, formType, jsonSchema }) => {` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:87` | `(formType === 'radio' &#124;&#124; formType === 'radiogroup') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputSlider.tsx:20` | `if (value === null) onChange(NaN);` | 빈 수 입력·null/NaN 방출 이주 | 다름 — 동일한 빈 입력의 방출 값이 null/NaN에서 undefined 등으로 바뀝니다(LANDING-182–184). |
| antd5 | `src/formTypeInputs/FormTypeInputSlider.tsx:31` | `...(jsonSchema.options?.lazy === false` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputSlider.tsx:54` | `formType: 'slider',` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputString.tsx:16` | `formType?: 'password';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputString.tsx:41` | `if (jsonSchema.format === 'password' &#124;&#124; jsonSchema.formType === 'password')` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:84` | `test: ({ type, formType, jsonSchema }) => {` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:87` | `formType === 'checkbox' &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:76` | `test: ({ type, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:77` | `type === 'string' && formType === 'switch' && jsonSchema.enum?.length === 2,` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputTextarea.tsx:67` | `test: ({ type, format, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputTextarea.tsx:68` | `type === 'string' && (format === 'textarea' &#124;&#124; formType === 'textarea'),` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputTimeRange.tsx:63` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputTimeRange.tsx:100` | `test: ({ type, format, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputTimeRange.tsx:102` | `(format === 'time-range' &#124;&#124; formType === 'timeRange') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputUri.tsx:25` | `formType?: 'uri';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputUri.tsx:95` | `const rawProtocols = jsonSchema.options?.protocols &#124;&#124; DEFAULT_PROTOCOLS;` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputUri.tsx:194` | `test: ({ type, format, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputUri.tsx:195` | `type === 'string' && (format === 'uri' &#124;&#124; formType === 'uri'),` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd5 | `src/formTypeInputs/FormTypeInputNumber.tsx:62` | `schemaType: ['number', 'integer'],` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd5 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:84` | `test: ({ schemaType: type, formType, jsonSchema }) => {` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd5 | `src/formTypeInputs/FormTypeInputSlider.tsx:53` | `schemaType: ['number', 'integer'],` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd6 | `src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:71` | `test: ({ type, formType }) => type === 'boolean' && formType === 'switch',` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputDate.tsx:43` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputDateRange.tsx:68` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputDateRange.tsx:98` | `test: ({ type, format, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputDateRange.tsx:100` | `(format === 'date-range' &#124;&#124; formType === 'dateRange') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputMonth.tsx:43` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputMonthRange.tsx:67` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputMonthRange.tsx:97` | `test: ({ type, format, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputMonthRange.tsx:99` | `(format === 'month-range' &#124;&#124; formType === 'monthRange') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputNumber.tsx:37` | `const handleChange = useHandle((value: number &#124; null) => {` | 빈 수 입력·null/NaN 방출 이주 | 다름 — 동일한 빈 입력의 방출 값이 null/NaN에서 undefined 등으로 바뀝니다(LANDING-182–184). |
| antd6 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:84` | `test: ({ schemaType: type, formType, jsonSchema }) => {` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:87` | `(formType === 'radio' &#124;&#124; formType === 'radiogroup') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputSlider.tsx:20` | `if (value === null) onChange(NaN);` | 빈 수 입력·null/NaN 방출 이주 | 다름 — 동일한 빈 입력의 방출 값이 null/NaN에서 undefined 등으로 바뀝니다(LANDING-182–184). |
| antd6 | `src/formTypeInputs/FormTypeInputSlider.tsx:31` | `...(jsonSchema.options?.lazy === false` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputSlider.tsx:54` | `formType: 'slider',` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputString.tsx:16` | `formType?: 'password';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputString.tsx:41` | `if (jsonSchema.format === 'password' &#124;&#124; jsonSchema.formType === 'password')` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:84` | `test: ({ type, formType, jsonSchema }) => {` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:87` | `formType === 'checkbox' &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:76` | `test: ({ type, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:77` | `type === 'string' && formType === 'switch' && jsonSchema.enum?.length === 2,` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputTextarea.tsx:67` | `test: ({ type, format, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputTextarea.tsx:68` | `type === 'string' && (format === 'textarea' &#124;&#124; formType === 'textarea'),` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputTimeRange.tsx:63` | `const { minimum, maximum } = jsonSchema.options &#124;&#124; {};` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputTimeRange.tsx:100` | `test: ({ type, format, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputTimeRange.tsx:102` | `(format === 'time-range' &#124;&#124; formType === 'timeRange') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputUri.tsx:25` | `formType?: 'uri';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputUri.tsx:95` | `const rawProtocols = jsonSchema.options?.protocols &#124;&#124; DEFAULT_PROTOCOLS;` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputUri.tsx:194` | `test: ({ type, format, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputUri.tsx:195` | `type === 'string' && (format === 'uri' &#124;&#124; formType === 'uri'),` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd6 | `src/formTypeInputs/FormTypeInputNumber.tsx:62` | `schemaType: ['number', 'integer'],` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd6 | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:84` | `test: ({ schemaType: type, formType, jsonSchema }) => {` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd6 | `src/formTypeInputs/FormTypeInputSlider.tsx:53` | `schemaType: ['number', 'integer'],` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd-mobile | `src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:55` | `test: ({ type, formType }) => type === 'boolean' && formType === 'switch',` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputNumber.tsx:30` | `const handleChange = useHandle((value: number &#124; null) => {` | 빈 수 입력·null/NaN 방출 이주 | 다름 — 동일한 빈 입력의 방출 값이 null/NaN에서 undefined 등으로 바뀝니다(LANDING-182–184). |
| antd-mobile | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:89` | `test: ({ schemaType: type, formType, jsonSchema }) => {` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:92` | `(formType === 'radio' &#124;&#124; formType === 'radiogroup') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputSlider.tsx:21` | `if (value === null) onChange(NaN);` | 빈 수 입력·null/NaN 방출 이주 | 다름 — 동일한 빈 입력의 방출 값이 null/NaN에서 undefined 등으로 바뀝니다(LANDING-182–184). |
| antd-mobile | `src/formTypeInputs/FormTypeInputSlider.tsx:33` | `range: jsonSchema.options?.range,` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputSlider.tsx:34` | `marks: jsonSchema.options?.marks,` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputSlider.tsx:35` | `...(jsonSchema.options?.lazy === false` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputString.tsx:13` | `formType?: 'password';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:92` | `test: ({ type, formType, jsonSchema }) => {` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:95` | `formType === 'checkbox' &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:71` | `test: ({ type, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:72` | `type === 'string' && formType === 'switch' && jsonSchema.enum?.length === 2,` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputTextarea.tsx:52` | `test: ({ type, format, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputTextarea.tsx:53` | `type === 'string' && (format === 'textarea' &#124;&#124; formType === 'textarea'),` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| antd-mobile | `src/formTypeInputs/FormTypeInputNumber.tsx:51` | `schemaType: ['number', 'integer'],` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd-mobile | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:89` | `test: ({ schemaType: type, formType, jsonSchema }) => {` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| antd-mobile | `src/formTypeInputs/FormTypeInputSlider.tsx:57` | `test: ({ schemaType: type, jsonSchema, format }) => {` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| mui | `src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:16` | `formType: 'switch';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:76` | `test: ({ type, formType }) => type === 'boolean' && formType === 'switch',` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputNumber.tsx:75` | `onChange(null);` | 빈 수 입력·null/NaN 방출 이주 | 다름 — 동일한 빈 입력의 방출 값이 null/NaN에서 undefined 등으로 바뀝니다(LANDING-182–184). |
| mui | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:18` | `formType: 'radio';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:23` | `formType: 'radio';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:60` | `const radioLabels = jsonSchema.radioLabels;` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:124` | `test: ({ schemaType: type, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:126` | `(formType === 'radio' &#124;&#124; formType === 'radiogroup') &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputSlider.tsx:16` | `formType: 'slider';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputSlider.tsx:57` | `const isLazy = jsonSchema.lazy ?? false;` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputSlider.tsx:113` | `test: ({ schemaType: type, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputSlider.tsx:114` | `(type === 'number' &#124;&#124; type === 'integer') && formType === 'slider',` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputString.tsx:17` | `formType?: 'password';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputString.tsx:74` | `jsonSchema.format === 'password' &#124;&#124; jsonSchema.formType === 'password'` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:23` | `formType: 'checkbox';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:130` | `test: ({ type, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputStringCheckbox.tsx:132` | `formType === 'checkbox' &&` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:16` | `formType: 'switch';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:105` | `test: ({ type, formType, jsonSchema }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputStringSwitch.tsx:106` | `type === 'string' && formType === 'switch' && jsonSchema.enum?.length === 2,` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputTextarea.tsx:17` | `formType?: 'textarea';` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputTextarea.tsx:117` | `test: ({ type, format, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputTextarea.tsx:118` | `type === 'string' && (format === 'textarea' &#124;&#124; formType === 'textarea'),` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputUri.tsx:25` | `}> & { format?: 'uri'; formType?: 'uri' };` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputUri.tsx:128` | `protocolsProp &#124;&#124; jsonSchema.options?.protocols &#124;&#124; DEFAULT_PROTOCOLS;` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputUri.tsx:231` | `test: ({ type, format, formType }) =>` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputUri.tsx:232` | `type === 'string' && (format === 'uri' &#124;&#124; formType === 'uri'),` | presentation.*·옵션 키 이주 | 다름 — 기존 작성 키의 읽기 위치나 컴포넌트 선택 조건이 달라질 수 있습니다. |
| mui | `src/formTypeInputs/FormTypeInputNumber.tsx:120` | `schemaType: ['number', 'integer'],` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| mui | `src/formTypeInputs/FormTypeInputRadioGroup.tsx:124` | `test: ({ schemaType: type, formType, jsonSchema }) =>` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |
| mui | `src/formTypeInputs/FormTypeInputSlider.tsx:113` | `test: ({ schemaType: type, formType }) =>` | union 항목 지원 | 다름 — 같은 union 스키마에서 선택되는 입력 컴포넌트와 값 해석이 바뀌므로 08에서 별도로 설계합니다(LANDING-206). |

08 목록: 114행(antd5 33행, antd6 33행, antd-mobile 18행, mui 30행). 위 코드는 수정하지 않았습니다. union 항목 행의 schemaType 이름 대응만 위 변경 표에 포함되며 union 조건을 추가하는 일은 08입니다.

### U12 명령 결과

수정 전 전체 타입 검사: antd5·antd6는 `src` 각 9건 및 `stories` 각 8건, antd-mobile은 `src` 8건 및 `stories` 8건, mui는 `src` 10건 및 `stories` 8건으로 실패했습니다. 새 schema-form dist를 참조한 결과입니다.

모든 npx 호출에는 `npm_config_offline=true`와 `--no-install`을 적용했습니다. 실행 디렉터리는 아래 패키지 자신의 디렉터리입니다. build 스크립트의 yarn 호출을 아래 도구 호출로 펼쳤으며 schema-form은 플러그인이 읽는 런타임 번들과 선언만 생성했습니다(`build:hashes`와 schema-form 전체 typecheck는 이 작업의 범위가 아닙니다). 생성한 dist는 소스 수정 목록에 포함하지 않습니다.

| 대상 | 명령 | 결과 |
| --- | --- | --- |
| schema-form | `npx --no-install rolldown -c` | 통과(0), 새 ESM·CJS dist 생성 |
| schema-form | `npx --no-install -c 'node ../../aileron/script/build/buildTypes.mjs'` | 통과(0), tsc → tsc-alias → fixDtsExtensions, 새 공개 선언 생성 |
| antd5·antd6·antd-mobile·mui 각각 | `npx --no-install rolldown -c` | 네 번 모두 통과(0), 각 플러그인의 ESM·CJS 생성 |
| antd5·antd6·antd-mobile·mui 각각 | `npx --no-install -c 'node ../../aileron/script/build/buildTypes.mjs'` | 네 번 모두 통과(0), 각 플러그인의 선언 생성 |
| antd5·antd6·antd-mobile·mui 각각 | `npx --no-install tsc --noEmit --composite false --incremental false -p tsconfig.declarations.json` | 네 번 모두 통과(0), `src` 전용 검사 |
| antd5·antd6·antd-mobile·mui 각각 | `npx --no-install tsc --noEmit --composite false --declaration false --emitDeclarationOnly false --rootDir . -p tsconfig.json` | 후속 최종 검사 네 번 모두 통과(0), `src`·`stories` 오류 0건. 초기 stories 각 8건과 readonly 대응 중간 각 2건의 실패를 제거함 |
| 네 플러그인의 `src` | 요청의 grep 식을 `/bin/bash`에서 실행 | 통과(0), `node.group`·`FormTypeRenderer` 필드 0건 및 각 플러그인에 `node.strategy` 존재 |
| 네 플러그인 | `rg --files <plugin> -g '*.test.*' -g '*.spec.*'` | 자체 시험 파일 각 0개, 조건부 `npx vitest run` 대상 없음 |
| 네 플러그인의 `src` | `npx --no-install prettier --check '<src>/**/*.{ts,tsx}'` | 통과(0), 네 디렉터리 모두 검사 |
| 수정 경로 | `git diff --check -- <네 src> <log.md>` (`GIT_OPTIONAL_LOCKS=0`) | 통과(0), 읽기 전용 검사 |
| 배열 상한·길이 대응 | context-mode JS 탐침: 실제 수정 식과 레거시 resolveArrayLimits·게터 규칙 비교 | 96조합 통과(상한 없음·0·3, 닫힌 튜플·명시 상한·열린 튜플 × branch/terminal·null/값 길이 × 네 플러그인), DOM 시험을 대체하지 않음 |
| 후속 변경 stories 16파일 | context-mode JS 탐침: HEAD와 수정본을 TypeScript transpileModule로 변환해 비교 | 통과, 승인된 렌더러 prop 이름 네 곳의 대응 외에 생성 JavaScript 동일. 스키마·옵션·콜백·오류 표시의 런타임 코드는 유지함 |

초기 전체 검사의 stories 오류는 후속 요청에서 허용한 범위에서 모두 제거했습니다. 새 렌더러 prop 이름 네 곳, `ValidationIssue` 가져오기와 상태 배열, 읽기만 하는 `StoryLayout.errors`의 readonly 형식만 대응했습니다. validator 객체와 handle 호출에는 컴파일 오류가 없어 변경하지 않았습니다. presentation·옵션 키를 바꿔야 컴파일되는 스토리는 없었습니다.

후속 최종 빌드는 네 패키지 각각 자신의 디렉터리에서 `npx --no-install rolldown -c` → `npx --no-install -c 'node ../../aileron/script/build/buildTypes.mjs'` → 위 `tsconfig.json` 전체 타입 검사 순서로 실행했고, 총 12명령이 모두 종료 코드 0입니다. package.json build의 번들·선언·전체 typecheck 단계를 모두 펼쳐 실행했으므로 U12/G24의 네 플러그인 전체 빌드 게이트는 초록입니다. 초기 src 이름 검색의 통과는 src 수정이 없어 계속 유효합니다. 자체 시험 파일도 추가하지 않았으며 이전의 각 0개 기록을 유지합니다.

소스 전용 검사 진단 중 `--declaration false`를 선언 설정에 함께 넣은 호출은 TS5069(declarationDir와 모순)로 실패했습니다. 이 옵션을 제거한 위의 `tsconfig.declarations.json` 명령으로 네 패키지를 검사하여 통과했습니다.

### U8 후속 표면 복구

- SURFACE-056·060, LANDING-157의 `SchemaNodeState` 이름이 새 엔진에서 빠져 있음을 확인했습니다. 비트와 동작을 유지하고 내부 소비자·core·패키지 경계를 같은 이름으로 연결합니다. 상태 렌더 시험은 이름·렌더러 속성·presentation만 바꾸며 기대값은 유지합니다.
- 77C-01(A)로 중단한 파일은 그대로 두고, 재귀 `$ref`의 형상 실패는 표면 실패와 분리하여 보고합니다.
