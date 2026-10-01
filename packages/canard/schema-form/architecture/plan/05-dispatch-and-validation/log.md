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
| 2026-10-01 | U3 | codex(세션 `8e05b415`): 코드 표 상수(원장에서 센 현행 60), 기록 형 셋, core `Validator`·`ValidateFunction`·`GuardFunction`·`ValidationIssue`, 공개 `ValidatorPlugin`의 선택 멤버 셋, `ValidationIssue` 공개와 `JSONSchemaError` 별칭 유지. 원장 대조 시험·형 정합 시험이 먼저 붉음(까닭: 기제 없음). 적합성 시험의 실행 부분은 U7 몫이라 이름 붙인 `it.todo`. ajv6·7·8 형 검사 통과. G7·G8·G9 충족(조율 세션 재실행) | `dcd006ba6` |
| 2026-10-01 | U2 | antigravity 원장 대조(G5, 세션 `525f01e6`) `blocking findings`: 차단 셋(디스패치의 `onChange`·`reset` 검증 요청·`batch` 안 `reset`·안쪽 쓰기 예산, VALIDATE-046 같은 `$id` 계약, 31C-02 `NON_JSON_WHOLE_VALUE` 예외)·비차단 다섯. codex(같은 세션 `8e05b415`)가 원장 줄을 확인하며 문서 넷을 고침 | 이 커밋 |
| 2026-10-01 | 이탈 | U2가 `SchemaNode/DETAIL.md` 멤버 표에 05의 13행을 문서 선행으로 더해(34 → 47), `surface.test.ts`의 길이 단언이 U9까지 붉다(codex가 원인을 그 13행뿐으로 확인). 그래서 unit 전체를 요구하는 G12·G21은 U9 뒤에 잰다. 단위별 범위 게이트는 그대로 | — |
| 2026-10-01 | U4 | codex(세션 `9fec47c2`): 열거 둘, 비트별 원장 `revisionLedger`, 커밋의 배달 표시. 계획의 `UpdateValue` 설명에 EVENT-023(호스트의 `local`·`emit`)·EVENT-024(마지막 통지 기준 `previous`)가 빠져 원장대로 구현. G10·G11 충족 | `5c90023ac` |
| 2026-10-01 | U5a | codex(세션 `feab8128`): 진입 사슬·파동·`batch`·`onChange`·예산·`adoptSchemaNodeChain`, 의존 방향 시험에 `dispatch` 추가. U5b·U7과 이을 자리를 이름 붙여 둠. G3·G13·G14 충족. 계획은 U5a·U7 병렬을 허용하나 둘 다 `record/type.ts`를 고치고 같은 작업 트리에서 시험을 돌리므로 차례로 진행 | `833b55dd7` |
| 2026-10-01 | 소유자 결정 | `@cfworker/json-schema` 개발 의존을 더하지 않음 — "ajv 까지만 일단 지원하는 방향으로 하자 … ajv 내부에 추가 개발의존성은 원치않아". 차등 테스트는 같은 ajv의 직접 판정과의 경로 비교로(소유자 선택), "다른 구현" 요구는 ajv 아닌 플러그인이 생길 때로 미룸. 원장 관리자에게 40라운드 기록을 요청. U12a 포기(G36 ABANDON), U12b 범위 고침 | 원장 기록 대기 |
| 2026-10-01 | U7 | codex(세션 `48c432d4`): 사본·캐시·가드 읽기·개발 모드 일괄 컴파일, `evaluateGate`가 실제 가드를 읽음, 시험용 ajv 8 검증기. 술어 대역 삭제와 사용처 24파일(계획 추정 19) 이전 — 기대값을 바꿔야 한 사례 0(TEST-069 (나)가 찾을 차이 없음). G19·G20 충족 | `3ef2ed652` |
| 2026-10-01 | U5b | codex(U5a와 같은 세션 `feab8128`): 사슬 끝 기록 전달·묶음·핸들러 예외·전달 중 쓰기 거부·경고 구조 키·주인 없는 싱크·청사진 오류 기록화. `oneOf` 호스트 자리는 `settle/utils/compute/selectNodeSchema.ts:18`. 계획 :214의 일반 중복 억제 대신 VALUE-037(`ledger/value.md:610`, 다시 켜질 때 재전달)을, ERROR-024의 "루트 전체 교체에서 키 초기화" 대신 그 항목의 충돌 줄과 ERROR-204를 따름. 바인딩(07)이 부를 자리 둘(정적 청사진 기록의 커밋 뒤 전달, 부른 쪽 없는 마운트)은 core 쪽만 준비. G15·G16 충족 | 이 커밋 |
| 2026-10-01 | U6 | codex: 정착 밖 사건(`setState`·하위 트리 상태·외부 오류·`request`)의 진입과, 진입 안에서는 노드별로 합쳐 큐에 두고 깊이 0이면 호출 안에서 동기 배달(31C-01). G17·G18 충족 | `a93e766c9` |
| 2026-10-01 | U8 | U7 세션 이어 쓰기가 "세션 없음"으로 실패(cennad 조회 문제) → codex 새 세션(`3500d216`): 실행·스탬프·라우팅·검증 불가·수명·같은 `$id`·방언 경고, `deliverValidationWave`와 `dispatchValidate`, 적합성 시험의 실행 부분. ajv6·7 모양은 리터럴 fixture. 같은 `$id` 재생성 reset의 원자성을 위해 계획 파일 목록 밖의 `adoptSchemaNodeChain`에 사전 검사를 더함(M4). G22·G23·G24 충족(조율 세션 재실행), tsc·eslint 통과, core unit 1,269 통과·실패는 `surface.test.ts` 하나(위 이탈) | `44f8dbd79` |
| 2026-10-01 | U8 리뷰 | antigravity(세션 `c6e6739d`) `rework-required` → codex(세션 `6a30f5ca`)가 고침: 자식 조회의 `hasOwnProperty`, 라우팅 한 번에 활성 선언 ID 집합 하나(조율 세션이 오류가 있을 때만 짓도록 한 줄 더 고침), `release` 정확 횟수(1,000 루트 중 992)와 같은 `$id` 재등록 해제 단언. 차단으로 든 크래시는 반증(실행 계획 리뷰 기록) | `8a202b4b4` |
| 2026-10-01 | U10 | codex(세션 `adfc2bb9`): 레거시 `ValidationManager`의 `PluginManager` import와 폴백을 `RootNodeContextProvider`로 옮김(같은 순서·시점, `ValidatorFactory` 반환 형 때문에 한 식을 분기로 풂), 폴백 검증기의 루트 `''`. 경계 있는 탐색에서 루트 `'/'`에 기대는 자리 0. G28 충족(조율 세션 재실행) | `bc1418da2` |
| 2026-10-01 | U9 | 첫 codex 세션(`6850db6d`)이 착수 전에 멈춤(M5) → 43라운드 답 merge → codex 새 세션(`8c0d2d6f`): 멤버 열넷, `setValue`·`resetSubtree`의 dispatch 위임, 기록 필드 `state` → `interactionState`, EVENT-062 기제(런타임 `globalStateCounts`·`globalState`, 상태 쓰기 진입 셋과 커밋 훅 `settle/utils/commit/commitGlobalState.ts`, 루트의 `UpdateGlobalState`). 03·04 시험은 필드 이름과 fixture의 새 런타임 칸만 바뀜, 기대값이 바뀐 것은 05의 상태 사건 시험 하나(43C-01의 새 계약). G25·G26·G27·G21 충족(조율 세션 재실행). G12(unit 346 파일·4,262 통과)와 G29(204 파일·2,974 통과)는 마커가 출력 끝에 찍혔으나 출력이 길어 hook이 증거로 잡지 못함 — 저장된 출력에서 확인 | `164817735` |
| 2026-10-01 | U14 | codex(세션 `671b781a`): 두 훅의 형 제약을 `subscribe`·`revision(mask?)`를 가진 구조 형으로(동작 무변경), 새 엔진 노드로 동기 통지·StrictMode·구독 뒤 따라잡기 시험. G40 충족(조율 세션 재실행). 같은 구조 형이 세 곳에 인라인으로 반복됨 — 이름 붙인 형 하나로 묶는 것은 PR 리뷰의 후속 항목 | `fa9a49678` |
| 2026-10-01 | U11a | codex(세션 `0ec8915f`): ajv6 등록 공유·동기 가드·해제·`bind` 거부·루트 `''`. VALIDATE-046 (i)–(iv) 기본·`bind` 인스턴스 모두 통과, VALIDATE-047 (i) 통과. G30·G31 충족(조율 세션 재실행) | `29bebdf04` |
| 2026-10-01 | M6 수정 | U11b 첫 세션(`3826b684`)이 멈춘 계약 충돌을 codex(세션 `dea49c3b`)가 core에서 고침: 세 호출에 같은 사본, VALIDATE-019 동일성 시험 | `ad286a22c` |
| 2026-10-01 | U13 | codex(세션 `afa0fe6a`): 05 몫 회귀 이식 다섯 파일(31 사례), SCN `notify`·`validation` 부류와 코어 러너. 사례 `selfcheck-v5.mjs:765`가 엔진 결함(M7)을 드러내 그 파일은 수정과 함께 커밋. G39 충족(조율 세션 재실행) | `27c2eeae6` |
| 2026-10-01 | U11c | codex(세션 `d15bc93e`): ajv8 세 진입점(`allowUnionTypes`, 방언 선언), 등록 공유, `bind` 거부, 오류 변환. VALIDATE-046 (i)–(iv)·VALIDATE-047 (i)–(iii) 일치, (iv)는 같은 위치를 여러 동적 범위에서 쓸 때 독립 판정이 갈려 계획대로 미지원 문서화 — 소유자 상신 항목. 거부 오류 클래스 파일은 세 패키지에서 같음. G34·G35 충족(조율 세션 재실행) | `02f66d132` |
| 2026-10-01 | M7 수정 | codex(세션 `ba36c445`): 상한에 닿은 리스너 되먹임 쓰기를 진입 전에 거부(`refuseListenerFeedback`, 공개 쓰기 진입 12곳이 결과를 확인). core unit 1,313 통과, G38 충족(조율 세션 재실행) | `dbd0cfdc3` |
| 2026-10-01 | U11b | M6 수정 뒤 codex 새 세션(`42bfe63a`)이 ajv6을 본떠 구현. VALIDATE-046 (i)–(iv) 기본·`bind` 인스턴스 일치, VALIDATE-047 (i)–(iii) 일치, (iv)는 ajv8과 같이 미지원 문서화(소유자 상신 항목). 동적 참조 사례에서 독립 오라클도 스택이 넘쳐 참조를 자식 한 단계로 한정해 판정. 거부 오류 클래스 파일 세 패키지 동일(`cmp`). G32·G33 충족(조율 세션 재실행) | `5934ff18c` |
| 2026-10-01 | 원장 | 44·45라운드 merge — 둘 다 06의 몫(통째 교체의 이차 비용, 가상 노드의 쓰기 종류 전달)이라 05 영향 없음. 06은 아직 `1.0.0-beta`에 머지되지 않음 | merge 커밋 |
| 2026-10-01 | U12b | codex(세션 `681db4bc`): 같은 ajv 경로 비교 넷(core는 SCN `validationScenarios` 전부, 플러그인은 사례를 파일 안에 둠 — 플러그인에 SCN 개발 의존을 더하지 않는다는 소유자 결정 때문에 계획의 "SCN에서 읽음"과 다름). 파일 머리에 교차 구현 오라클은 ajv 아닌 플러그인을 기다린다고 적음(40라운드). 불일치 0. 사례 수가 적음(core 2, ajv6·7 각 3, ajv8 3×3) — PR 리뷰에서 판단 받음. G37 충족(조율 세션 재실행) | `6c494f9ce` |
| 2026-10-01 | U15 | codex(세션 `cc34b6de`)의 첫 벤치는 세 행 모두 옛 판 대비 0.27–0.40×. Claude opus 진단이 벤치의 불공정 셋(옛 판 마운트 타이머가 마이크로태스크 연쇄를 빼먹음, 옛 판이 고쳐 쓰는 작성 스키마를 표본마다 재사용, 파동 행의 `setTimeout` 바닥)과 05 코드의 비례하지 않는 비용 셋(배달 정렬의 `indexOf`, `markCommitDeliveries`의 자동 쓰기 탐색과 커밋마다 모든 감시 노드 재읽기)을 찾음 → 44C-01대로 05가 고침(`a9b297df1`, `70ffd59a6`; 감시 색인은 Claude opus verifier의 조건부 통과 뒤 지적 A–G 반영). 가드 인스턴스의 루트 재컴파일은 46라운드(질의 Q11)로 비례하는 느린 행, 후보 A는 소유자 답 대기. 04 코드의 파생 이차 비용 둘은 47라운드(질의 Q12)로 06 몫(06 `c9acb7a9c`에서 고침). 보정 뒤 재측정(Node 24.20.0, Bun 1.4.2): mount 0.433×/0.381×, guards200 0.565×/0.469×, wave 0.233×/0.120× — 남는 비례 비용은 P-16–P-20으로 소유자 수용 대기(G42). G41·G43 충족(`guard:check` 회귀 0·개선 14) | `b80a57faf` |
| 2026-10-01 | U16a | 06은 아직 `1.0.0-beta`에 머지되지 않아 05가 먼저 머지 → G45 ABANDON(33C-01), G46은 "06에 넘길 목록"으로 충족. 원장 46–48라운드 merge(48은 06 몫). G44 충족 | merge 커밋 |
| 2026-10-01 | U16b | G47·G48(삭제된 Form 속성 두 행의 대체된 인용을 현행 항목으로 고침)·G54 충족. G53 unit·render 409 파일·4,857 통과 — 출력이 길어 hook이 증거로 잡지 못함(G12·G29와 같음), 저장된 출력에서 확인 | `026d09a51` |
| 2026-10-01 | G51 | Claude opus verifier `FAIL`: 차단 F1(깊이 0의 정착 밖 파동에서 쓰는 리스너 뒤의 예외가 사라짐, EVENT-010·ERROR-004·ERROR-019 (5)), F2(결과 파동 리스너 실패가 `onError`에 둘, ERROR-023), F3(`validate()` 거부에 기록 없음, 개발 모드에서 `OnChange` 컴파일 실패 싱크 생략, ERROR-019 (3)·ERROR-155), F4(디스패처의 시험 전용 주입 칸 `requestValidation`, TEST-069), F5(ajv6 제품 코드의 형 단언). PR 전 조건 C1: 레거시 `<Form>` 경로에서 플러그인 `compile`이 마운트마다 Ajv 인스턴스를 만들어 붙잡음(ajv8 300 루트 0.27 → 4.6 ms, 2.2 → 17.5 MB). 비차단 N1–N7. core·플러그인 codex 두 세션이 고침 | `253b08b89`, `bf0ffc32a` |
| 2026-10-01 | G51 재검 1 | `FAIL`: R1(중첩 진입이 실패를 잃거나 두 번 기록 — 둘러싼 사슬이 칸 하나), R2(ajv7·8 컴파일러 교체가 `bind` 인스턴스의 사용자 스키마·정의 없는 키워드를 놓쳐 65번째 컴파일부터 깨짐), R3(공개 `JSONSchemaError`의 제네릭 매개변수가 빠짐). 그 사이 질의 Q13 → 50라운드 50C-01: `JSONSchemaError`는 `ValidationIssue`를 넓히는 공개 인터페이스(`details?: Record<string, any>`, `key?`)로 PR-7까지 유지. codex 두 세션이 고침, ajv6은 고정판 6.12의 내부 `_schemas`를 형 보강 선언으로 읽음(조율 세션 결정, 형 단언 없음) | `d958a5007`, `007922ad0` |
| 2026-10-01 | G51 재검 2·3 | 재검 2 `FAIL`: R4(R1 수정이 만든 가드 실패 이중 기록) → `collectChainRecords`로 합침(`0d870e020`), 잠정 상한 64는 P-21. 재검 3 `FAIL`: B1(사슬 끝 기록에 `path`·`schemaPath`가 없음, ERROR-017), B2(같은 가드의 반복 실패 기록 수가 사슬 안팎에서 다름) → B2는 계획 I10(질의 Q5 답: 폼마다 자기 `GUARD_FAILED` 하나)대로 폼마다 한 번(조율 세션 결정) | `958ff3ec1` |
| 2026-10-01 | G51 재검 4, PR | 재검 4 `PASS`(`958ff3ec1`). PR [#352](https://github.com/vincent-kk/albatrion/pull/352) 생성. filid 문서 점검: 패키지 루트 스캔에서 05가 바꾼 fractal의 문서 지적 0(범위 밖 기존 `hasExtensionKeys` 문서 없음 2건) | `9e4cadab8` |
| 2026-10-01 | 52라운드 반영 | 소유자가 46C-01 A안을 조건부 수용(`reviews/round-52-owner-answers.md:8`, 원장 커밋 `f1ac6b7e8`). ajv 플러그인 셋의 `compileGuard`가 자족한 `if` 부분 스키마를 가드 인스턴스에서 직접 컴파일하고 루트 등록에 기록해 `release`가 함께 풂. 옵션 `configure({ directGuardCompile })` 기본 켜짐(이름은 조율 세션이 붙인 가칭, 31C-05 목록으로). 안정성: 가드 시험·같은 ajv 경로 비교를 옵션 양쪽으로, 자족·비자족 모음의 판정 일치 시험. codex 초안의 boolean 가드 해제가 `removeSchema(undefined)`로 가드 인스턴스 전체를 비우던 결함을 조율 세션이 고치고 회귀 시험을 바꿈. 벤치에 제품 ajv8 플러그인 행 넷을 더해 재측정: 200그룹 약 171→78 ms(0.31×→0.75×), 8그룹 약 8→5.5 ms(0.19×→0.30×), 둘 다 선 아래라 P-16·P-17로 소유자 수용 묶음 | `e623395c8` |

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
| `onListenerError` | ERROR-004·014·099 | 삭제 | — | 대체된 과거 Form 속성이며 기록은 `onError`가 받습니다. |
| `throwOnBudgetExceeded` | ERROR-072·099 | 삭제 | — | 모든 환경에서 사슬 끝에 던지므로 스위치를 두지 않습니다. |

## 3. 다음 행동

- 남은 게이트: G51(독립 검증), PR 뒤 G50(filid 스캔), G52(소유자의 storybook 실행), G42(소유자 수용).
- PR 뒤 원장 관리 세션에 보낼 소유자 상신 묶음: (1) VALIDATE-047 (iv) — 한 위치를 여러 동적 범위에서 쓰는 스키마의 가드 미지원 문서화 권고(ajv7·ajv8), (2) U15의 느린 행 P-16–P-19 수용(P-20 가드 루트 재컴파일은 46라운드에서 이미 소유자에게 물음), (3) 31C-05 가칭 확정 목록의 보충 기록, (4) 한 쓰기가 서로 다른 가드 둘에서 실패하면 정착이 첫 실패만 던져 둘째 기록이 드러나지 않는 03 정착 정책(G51 재검 3의 비차단 지적)의 처리.

### 06에 넘길 목록(05가 먼저 머지할 때, 33C-01·G46)

06은 `1.0.0-beta`에 머지되지 않았으므로(2026-10-01) 05가 먼저 머지하면 06이 두 번째로 머지하는 단계다. 위 머리의 33C-01 합의 문장대로 06이 맡을 것:

1. 배열 동사 다섯(`push`·`pop`·`update`·`remove`·`clear`)의 진입 파일을 `src/core/dispatch/utils/entry/dispatch{Push,Pop,Update,Remove,Clear}.ts`로 두고 `dispatch/index.ts`에 이름으로 내보내며, 겉면은 그것에 한 문장으로 위임하고 `arrayBehavior/`에는 진입 사슬을 두지 않는다. 진입 시험 `dispatch/__tests__/dispatch.array-entry.test.ts`(33C-01·EVENT-035·ERROR-197 태그). 각 진입은 `if (!enterSchemaNodeChain(node)) return;`로 되먹임 상한의 거부 결과를 확인한다(M7, `dbd0cfdc3`).
2. `ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197)를 던지기 직전에 `onError` 보고를 잇는다(35C-01). 이름은 05의 가칭 확정 표에 있다.
3. `UpdatePath` 배달은 레코드의 `(previous, current)` 사실에서 디스패처가 한다(35C-02).
4. 겉면 충돌: `SchemaNode.ts`·`SchemaNode/DETAIL.md` 멤버 표·`surface.test.ts`(이름 `26C-01 PR-4 …`, 개수는 두 단계의 합)·`SchemaNode/type.ts`·`type-contract.test.ts`·`src/core/index.ts`·`record/type.ts`를 합집합으로 맞춘다. 05의 추가는 각 파일에서 연속한 한 덩어리다.
5. 05가 바꾼 기록 계약을 따른다: 기록 필드 `state` → `interactionState`(공개 `state`는 게터·세터), 런타임 `globalStateCounts`·`globalState`와 정착 커밋 훅 `settle/utils/commit/commitGlobalState.ts`(43C-01) — 배열 아이템이 형상에 들고 날 때도 이 훅이 센다. `setValue`·`resetSubtree`는 dispatch 진입을 거친다.
6. 검증기 계약: `compile`·`compileGuard`·`release`는 같은 사본 객체를 받는다(M6, VALIDATE-019).
7. `if` 술어 대역(`src/core/__tests__/ifPredicate.ts`, 런타임 `ifPredicates`)은 U7에서 지웠고 `evaluateGate`는 실제 가드를 읽는다. 06 브랜치의 시험 약 10 파일(새 배열 시험 포함)이 아직 쓰므로 시험용 검증기(`src/core/__tests__/fixtures/createTestValidator.ts`)로 옮긴다.

## 4. 원장·계획서 어긋남

| ID | 계획서 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:17`, `request.md:37`, `adr-and-axes.md:18`, `verification.md:23` | 명령 메서드의 이름·형·`FormHandle` 모양을 "착수 전 소유자 결정"으로 적음 | EVENT-073 보충(30라운드) | 30라운드 답대로 구현한다 |
| M2 | `execution-plan.md:181`(U3) | `FormErrorRecord.details?: object`, `aggregate?: readonly FormErrorRecord[]` | ERROR-017(`ledger/error.md:458`): `details?: ErrorDetails`, `aggregate?: SchemaFormError` | 원장 서명대로 문서·구현(codex U2 보고) |
| M3 | `execution-plan.md` U16a | 35C-02(`UpdatePath` 배달은 레코드의 `(previous, current)` 사실에서 디스패처가 함)가 없음 | 35라운드 35C-01·02 | 나중에 머지하는 단계의 디스패치 연결에 든다 — U16a 조건부 단계에 더함 |
| M4 | `execution-plan.md:236`·`:241`(U8) | 만들 파일 목록에 `adoptSchemaNodeChain` 수정이 없고, 검증 불가 기록을 하위 트리 범위로 읽힐 여지가 있음 | VALIDATE-046 (iii)(같은 `$id` 재생성 reset의 원자성), VALIDATE-048·18C-105(`ledger/validate.md:769`, `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록) | 사전 검사를 `adoptSchemaNodeChain`에 두고 기록은 폼 수준으로 구현(codex U8 보고), antigravity U8 리뷰에서 판정 |
| M5 | `execution-plan.md:48`(I5)·U9 | `globalState`를 멤버 하나로만 적고 EVENT-062의 유도 기제(런타임의 키별 참 노드 수, 상태 쓰기 진입과 정착 커밋의 형상 출입 때의 갱신, 0과 1 사이를 넘을 때만 새 객체와 루트의 `UpdateGlobalState`)가 빠짐. codex U9 첫 세션(`6850db6d`)이 착수 전에 멈춰 물음 | 43라운드 43C-01(질의 Q10, `reviews/round-43-closing.md`): 기제 전부가 PR-4 몫, PR-4 행의 "상태 사건"에 접혀 있던 것 | U9 범위에 더함. 공개 `state` 세터가 `dispatchSetState`에 위임하도록 기록 필드 `state`를 저장 전용 이름으로 바꿈(U4의 `revisionLedger`와 같은 결, 43C-01이 원장과 어긋나지 않음을 확인) |
| M6 | U3·U7 구현(`validation/type.ts`의 `compileGuard`·`release` TSDoc "Authored root", `readSchemaNodeGuard.ts:28`·`compileEntryGuards.ts:31`·`evictValidationRoot.ts:19`) | core가 `compile`에는 엔진 사본을, `compileGuard`·`release`에는 작성 루트를 넘겨 플러그인이 세 호출을 한 등록에 묶을 수 없음. codex U11b 세션(`3826b684`)이 착수 중에 멈춰 보고 | VALIDATE-019(`ledger/validate.md:305-308`, "사본 루트의 등록"), VALIDATE-045·18C-56, ADR D9 | core가 세 호출에 같은 사본 객체를 넘기도록 고침(캐시·수명의 키는 작성 루트 그대로). 그 뒤 U11b를 다시 맡김 |
| M7 | U5a 구현(`dispatch/utils/chain/enterSchemaNodeChain.ts:25`) | 되먹임 상한에 닿은 뒤의 리스너 쓰기를 차단 목록에 넣고 오류만 기록하고 그 쓰기는 정착·커밋함(`selfcheck-v5.mjs:765`, 기대 `p24`·실제 `p25`) | EVENT-008("그 파동의 리스너 되먹임만 거부"), EVENT-020 | 진입 전에 거부하도록 고침(`dbd0cfdc3`) |
