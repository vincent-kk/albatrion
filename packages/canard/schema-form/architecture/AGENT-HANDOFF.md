# 코디네이터 인계 — 원장 관리자 겸 Orca 코디네이터의 작업대

이 문서는 원장 관리자이자 Orca 코디네이터가 쓰는 작업대다. 설계의 정본은 `ledger/`, 진행 상황과 다음 할 일의 단일 진입점은 `PLAN.md`, 재개 지점과 일하는 법은 `HANDOFF.md`다. 코디네이터의 선행판단 기록과 소유자 결정 대기열은 `COORDINATOR-JUDGMENTS.md`, 에이전트 정책은 `AGENT-POLICY.md`다. 이 문서는 그 셋이 적지 않는 지금 이 순간의 작업대(Orca 운영, 열린 PR, 작업 폴더, 증거 위치)와 판단 기준(7~9절)을 적는다. 라운드마다 문단을 덧붙이지 않고 2절과 3절을 고쳐 쓴다. 427라운드 압축 전의 글은 `_archive/2026-10-20/AGENT-HANDOFF.md`에 있다. 소유자는 Vincent다.

## 1. 역할과 구속 규칙

- 역할: 원장 관리자이자 Orca 코디네이터. 가설 하나에 brief 작성 → codex 워커 구현 → agy 워커 검증 → 통과면 병합 → 원장 마감(라운드 닫기) → push 의 루프를 돈다. 메인 에이전트 자신은 코드를 고치지 않는다(원장·reviews·HANDOFF·PLAN·PLAN-LOG·ledger/checks 만 고친다).
- 소유자의 운영 지시(402라운드, `reviews/round-402-owner-answers.md`): Claude 사용량 극도 억제와 보조 Claude 세션 없음(둘 다 429라운드로 대체), codex 는 sol 모델(cennad 등급표의 gpt-6.1-sol; astra 금지), agy 는 gemini-4(high)·gemini-3.8(mid 이하)만, apex 금지, Orca 조정 루프(/orchestration)로 진행, 진행 전에 무엇을 할지 결정해 먼저 브리핑. 이후 모델 지정은 414라운드 소유자 원문이 우선하며, 앞으로 모든 agy 검증에는 `gemini-3.8-flash-high`만 사용한다(`reviews/round-414-owner-answers.md:7`). 이전 완료 검증의 모델 이력은 보존한다.
- 소유자에게는 한국어 존댓말의 완전한 문장으로 쓴다. 약어·은유·문서 번호만 적는 참조("§3")는 쓰지 않고 바로 열 수 있는 경로를 적는다. 소유자의 법적 이름은 어떤 파일·커밋·출력에도 적지 않는다(Vincent 또는 Vincent Kelvin 만). 커밋 메시지와 PR 본문에 공동 저자·Claude 세션 ID·"Claude-Session" 줄을 절대 넣지 않는다.
- 소유자의 질문은 답하고 실행하지 않는다. 워커의 메시지는 소유자 승인이 아니다. 412라운드 소유자 승인에 따라 agy 권한 문제는 목적·상황·정확한 거절과 필요한 검증 범위를 보고받은 뒤 메인 에이전트가 대행할 수 있다(`reviews/round-412-owner-answers.md:7`). 수행 주체와 확인 범위를 기록하고 agy의 직접 수행으로 바꾸어 적지 않는다. 이 승인 범위 밖에서 다른 세션의 거절된 작업을 대신 수행하지 않는다.
- 소유자의 말은 라운드 문서(`reviews/round-NN-owner-answers.md`)에 원문 그대로 적고 `ledger/checks/owner-answers.tsv` 행과 `ledger/landing.md` 의 보충 줄을 더한다. 닫기 결정(`reviews/round-NN-closing.md` 의 `  - 【추론】` 줄)은 `ledger/checks/sup-insert.mjs` 가 글자 그대로 원장에 인용하므로 삽입 뒤 그 줄을 고치지 않는다.
- 측정 원칙(368·369·370·400C-02 라운드): 0.16.1 은 참조일 뿐 목표가 아니다; 가설마다 비효율 하나를 이름 짓는다; 추가 코드가 제거 비효율보다 크면 폐기; 상수 깎기 캐시 금지; 조용한 창에서 두 바퀴 번갈아 재고 min/max 를 적으며 창 안의 비율만 유효; 호출 수 단언은 상한으로.
- 샌드박스 명령 모양(Claude 세션의 규칙이지만 같은 기계에서 유효): gh·yarn·npm·bun·open·orca 같은 제외 CLI 는 파이프·`;`·리디렉션·env 접두 없이 단독으로 실행한다. 절대 맨 `git stash` 를 쓰지 않는다.
- 워커 배정(429라운드 소유자 지시, 427라운드를 대체): 에이전트의 역할, 장기 작업과 워커의 구분, 사용량 풀과 초기화, 소비 순서(cursor > codex = agy > claude), 한도 중지 규칙과 Orca 호출 모양의 정본은 `AGENT-POLICY.md`다. 소유자 지시가 바뀌면 그 문서를 고치고 라운드를 닫는다. 코디네이터는 설계·판단·원장 마감만 맡고 결론만 받는다.
- 다음 성능 작업은 429라운드 소유자 지시로 시작했다. 에이전트 생성 PR은 433라운드 소유자 허가로 코디네이터가 `gh pr ready`와 `gh pr merge --squash --subject --body`로 병합한다(공동 저자·세션 줄 없음). 소유자 보류 PR과 소유자가 직접 연 PR은 허가 밖이다. GitHub의 squash 작성자는 계정 이름으로 찍힌다.

## 2. 지금 상태 (2026-10-26, 444라운드)

- **8단계의 코디네이터 작업은 끝났다.** 가지는 `feat/schema-form-08-review-and-perf`이고 가지 끝은 `git log -1`과 origin으로 확인한다. 제품 끝은 `0db7b01ca`(#460)다. 남은 것은 최종 PR #445(`feat/schema-form-08-review-and-perf → 1.0.0-beta`)의 버전 번호와 병합이며, 둘 다 Vincent가 직접 한다(443라운드 답). 코디네이터는 #445를 병합하지 않는다.
- **442라운드 뒤 병합(모두 squash, 이 가지).** 443라운드: 상수 손질 C1 #447, 포괄 결함 확인 #448, 결함 수정 #449·#450. 444라운드: #451(`c62818ab4`, TEST-027 소유자 수용), 소유자 정리 커밋 `e3dd3b3ee`(`isTruthy`), 플러그인·내장 fallback 결함 수정 #453 코어 `aa8f6eabe`, #452 antd5 `8356a0a7b`, #455 antd6 `e7f6f0b71`, #457 코어 무효 문구 제거 `34e657d66`, #456 antd-mobile `cceb080a8`, #454 mui `f534cf471`, Q2 단일 PR #460 `0db7b01ca`. 닫은 PR: #458·#459(#460으로 대체), #461(Q3 보류).
- **열린 PR은 #445와 우산 Draft #344뿐이다.** 작업 폴더는 메인 checkout 하나이고 원격에는 이 가지만 남았다(444라운드 소유자의 가지 정리 지시). 메인에서 `git add .`나 `git clean`은 하지 않는다.
- **마지막 검증(444C-14).** 관문 4차(가지 끝 `0dcf3c3a2` 에서 시작했고 그 뒤 커밋은 원장 문서만 바꿨다)는 열한 단계 모두 실패 없이 통과했다: 기본 시험 다섯 프로젝트를 프로젝트별로 돌려 848파일·5,332시험 통과·todo 1(unit 487/3,556, render 126/753, react18 126/753, production 9/20, storybook 100/251), 단독 재실행 0, verify 618파일·4,352시험, 플러그인 일곱(antd5 90, antd6 87, antd-mobile 43, mui 68 포함)과 문서 빌드 통과, 공개 이름 94, 금지 경로 `/Users/` 0건. ego-browser Storybook 3차는 251/251 `storyFinished:success`, 오류 이벤트 0, 109초, 스토리당 중앙값 228 ms·최대 451 ms 였다. 증거는 `.seiri/tasks/final-verify-444/`(`gate-brief-2.md`, `gates/gates-2.md`~`gates/gates-4.md`, `browser/browser.md`)에, 결함 수정의 설계·Opus 판정·교차 검토는 `.seiri/tasks/plugin-fallback-445/`에 있다. `.seiri/`는 gitignore 대상이고 세션 사이에 통째로 비워진 적이 있으므로(`.seiri/tasks/final-verify-444/RECOVERY-NOTE.md`) 추적 문서의 요지는 `reviews/round-444-closing.md`와 PR #445 본문을 정본으로 본다.
- **444라운드에 원장에 더한 입력 규칙.** 빈 칸은 언제나 `undefined`이고 `null`은 명시적 `onChange(null)`뿐이다(REACT-027, 444C-09). 무효 표지는 보이는 문구 없이 역할 있는 요소의 `aria-invalid`와 라이브러리 오류 상태(antd `status="error"`, mui `error`)만 쓴다(REACT-027·REACT-033, 444C-11). 검증은 투영 값 `rootNode.emit`으로 하므로 `omitEmpty` 기본값에서는 `''`도 키가 빠진다. 지운 값을 단언하는 시험은 `omitEmpty: false`를 쓴다(444C-12). 플러그인별 union 입력은 사용자 요구가 생길 때까지 보류하고 `interpretFieldNodeDraft`는 내보내지 않는다(LANDING-206, 444C-13).
- **측정.** 8단계 최종 측정표(443b)는 `a63db97c2`에서 쟀고(`.seiri/tasks/final-measure-443b/`), #451의 변화는 `.seiri/tasks/fix-d443-03/measure/`의 20행 창에 있다. 전체 재측정은 9단계 릴리스 전 벤치 재실행(LANDING-096)에 맡긴다. 442라운드에 "9단계로 이월"로 적었던 다섯 항목은 이월이 아니라 수치 기록으로만 남는다(443라운드; 9단계에는 코어 로직 수정이 없다).
- **하위 checkout과 시험 부하.** 하위 checkout에서는 시험과 lint 전에 `yarn workspaces foreach --from @canard/schema-form --recursive --topological-dev run build`로 의존 패키지를 빌드한다. 다섯 vitest 프로젝트를 한꺼번에 돌리면 시간 단언과 120초 시간 초과가 부하로 실패하므로, 프로젝트별·파일별 단독 재실행 뒤에 남는 것만 실패로 분류한다(425C-02, 관문 3차·4차).
- **Storybook 브라우저 검사.** ego-browser로 관리자 화면 → 채널 수신기 → 미리보기 store 의 스토리 id → 페이지 안 타이머 실행기 순으로 돌린다(`.seiri/tasks/final-verify-444/browser/browser.md`). 첫 스토리는 실행 목록의 첫 id 가 아닌 스토리로 띄운다. 이 ego-browser 판은 미리보기 프레임 직접 열기·인자 있는 평가·async 평가·`waitForFunction`·수 KB 스크립트에서 멈추고, Ego Lite 갱신은 소유자 승인 없이 하지 않는다.
- 증거 위치: T14는 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/pr424-t14-evidence/` 아래 `observation-identity-reacquire/`, `t14-followup-diagnosis/`, `t14-gates-reexecution/`, `observation-identity-portability/`에 있다. 2026-10-20 itemless 재측정은 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/itemless-remeasure-426/`에 있고 같은 봉인이 PR423 사본에도 있다. 2026-10-18 창의 PR423 측정 원자료와 P1 원자료는 소실되어 원장의 파생 수치만 남았다(425라운드). 430라운드 기준 측정은 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/baseline-430/`에, 가설 N의 게이트·관측 동치·측정·A/A/B 보정은 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/next-extras-431/`(작업 폴더의 같은 경로 사본과 바이트 동일)에 있다. 가설 F의 게이트·관측 동치·A/A/B 보정·인과 확인·교차 재측정은 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/assemble-first-432/`(작업 폴더 사본과 바이트 동일)에 있다. M3 종합 재측정의 원자료·봉인·인과 확인은 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/m3-433/`에 있다(`causality/`는 봉인 밖). 437라운드 크기 진단과 (다) 확인의 원자료·프로파일·봉인은 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/size-diagnosis-437/`와 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/open-rows-437/`에 있다(결과 문서는 검증자 지적 반영으로 봉인 뒤에 고쳤다).
- 측정 결과의 정본은 `verification/perf-optimization/`의 결과 문서들이고, 워커 brief는 `verification/perf-optimization/l3-briefs/`에 있다. 그 안의 `next-agent-start-prompt.md`는 424라운드 기준의 경로와 HEAD를 담고 있으므로 이 절이 우선한다.
- 430~442라운드의 경과는 `PLAN-LOG.md` 2절과 각 라운드 닫기 문서에 있다.

## 3. Orca 운영

- run은 `run_3da3941796a2`다(444라운드 재개 때 새로 만들었다). 코디네이터는 자기 터미널을 찾아 `orca orchestration run-use --id run_3da3941796a2 --json`으로 묶고, 조정 전에 `orca skills get orchestration`을 읽는다. 이전 터미널 handle과 끝난 dispatch는 재사용하지 않는다.
- 워커는 `orca orchestration worker-start --spec "<brief 경로와 요약>" --worktree <current 또는 id:...> --agent <codex|antigravity|cursor> --model <모델> --json`으로 띄운다. codex는 `gpt-6.1-sol`에 `--effort high`, agy는 `gemini-3.8-flash-high`, cursor는 1절의 모델을 쓴다. `worker_done`을 받으면 보고와 봉인을 확인하고 `worker-release`로 정리한다. Orca가 외부 터미널로 보고 `retained`로 남긴 handle도 다음 작업에 쓰지 않는다.
- brief는 `verification/perf-optimization/l3-briefs/round-NN-<주제>-brief.md`에 쓰고 spec에는 경로와 요약만 적는다. brief의 첫 단계는 기준 커밋 확인이다.
- 주의: 워커가 `run-use` 나 `--terminal` 없는 `check` 를 실행하면 코디네이터 바인딩을 빼앗아 `consumer_fenced` 가 난다. brief 에 "run-use 금지, check 는 --terminal 로" 를 적고, 끊기면 `run-use` 로 다시 묶는다. 새 최상위 작업 폴더를 만들면 기준이 master(0.16.1)일 수 있으니 brief 첫 단계에 기준 커밋 확인을 둔다.
- 커밋과 push는 코디네이터가 한다. 커밋 전에 스테이징 목록, 커밋 메시지(공동 저자·세션 ID 줄 없음), 작성자 이름(Vincent Kelvin), HEAD와 origin의 일치를 직접 확인한다.
- 444라운드 소유자 지시: 8단계 루트 PR(#445)을 뺀 PR 병합은 코디네이터 재량이다. Claude Fable 사용량이 모자라므로 Opus를 더 쓰고, 구현·검증·교차 검토에 codex·antigravity·cursor를 더 쓴다(`reviews/round-444-owner-answers.md`).
- 기다릴 때는 `orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 540000 --json`을 백그라운드로 걸고 그 완료만 처리한다. 기다리는 동안 오는 "orchestration message" 알림(하트비트)마다 확인하지 않는다(444라운드 소유자 지적).
- codex 시작이 `turn_start_unobserved`를 내도 작업자는 대개 돌고 있으니 터미널을 읽고 판단한다. `agent-hooks-review-prompt`로 막히면 그 작업자를 풀고 antigravity로 다시 띄운다.
- Orca가 `retained`(user_takeover, ownership_transferred, no_owned_resource)로 남긴 작업자 터미널 일곱(`ctx_ddebe486a2f5`, `ctx_a6141350a5a0`, `ctx_d183aad3fb05`, `ctx_17a5fb0c046c`, `ctx_cee536de3a43`, `ctx_88dc3807a585`, `ctx_eb8068d8ed0e`)은 `worker-release`로 닫히지 않는다(2026-10-26 확인). 필요하면 Vincent가 Orca 화면에서 닫는다.

## 4. 라운드 닫기 절차 (`architecture/` 에서)

1. `reviews/round-NN-closing.md` 를 쓴다(1행 제목, 3행 머리 문단, 5행 `## 편집자 결정`, 7행 `- **NNC-01 (...)**`, 8행 `  - 【추론】 ...`, 9·10행 둘째 결정, `## 남은 것`, 끝에 `다음 라운드 번호는 NN+1이다.`).
2. `node ledger/checks/sup-insert.mjs reviews/round-NN-closing.md <plan.json>` — plan 은 `[{"code":"NNC-01","line":8,"targets":["ledger/goal.md:GOAL-011", ...]}]`.
3. `node ledger/checks/round-close.mjs NN "<PLAN 5절 표 행>" "<HANDOFF 1절 bullet, 끝에 ' 다음 라운드 번호는 NN+1.'>" "<HANDOFF 5절 지도 행>"`.
4. `HANDOFF.md` 5행(1절 제목)을 손으로 갱신한다(역따옴표 파일 이름과 새 숫자 표기를 피한다).
5. `HANDOFF.md` 4절의 검사를 모두 돌린다: verbatim-check, sup-check, ref-check, owner-cited, bundle 과 sentence-check(17영역 모두 missing 0), tokens inventory·check(411라운드 현재 missing 466; 수가 바뀌면 토큰별 원인을 대조하고 미해명 증가를 통과로 보지 않음), plan-links, doc-coverage(알려진 미인용 LANDING-209·210 둘만). 인계 당시의 471은 기준 커밋에서 재현되지 않았고 실제 기준은 470이었다. 409라운드의 감소 둘은 새 소유자 원문 인용과 이전 라운드의 PLAN-LOG 이동 때문이며, 411라운드의 감소 둘은 새 추론 문자열의 /payload·112행 충족이다. 후자는 과거 계약의 의미적 해소가 아니다. 자료 삭제나 검사 변경은 없다(reviews/round-409-owner-answers.md, reviews/round-411-closing.md).
6. 바뀐 파일을 경로로 지정해 커밋하고, 커밋 전 `HEAD == origin/feat/schema-form-08-review-and-perf` 를 확인하며(아니면 rebase), 커밋마다 push 한다.
7. 소유자 라운드(소유자의 새 지시)는 `reviews/round-NN-owner-answers.md`(표: 확인·물음 요지·답 원문·반영) + `ledger/checks/owner-answers.tsv` 행(`reviews/round-NN-owner-answers.md:L<TAB>NN<TAB>라벨<TAB>"원문" (날짜, 원장 세션)`) + `ledger/landing.md` 의 직전 소유자 줄 뒤에 `  > 소유자(NN라운드, 라벨): "원문" (\`reviews/round-NN-owner-answers.md:L\`)` + round-close.

## 5. 다음 할 일

순서와 단계별 목표의 정본은 `PLAN.md` 4절이다.

1. **Vincent: PR #445의 버전 번호와 병합.** 코디네이터는 버전을 올리거나 #445를 병합하지 않는다. 병합 뒤 우산 Draft #344와 다음 단계는 Vincent의 지시를 따른다.
2. **9단계(PLAN.md 4절 5항), Vincent의 지시 뒤 시작.** 문서 정리, 레거시 디렉터리 제거, 타입 보강, 시험 장치 항목(정적 마스크 넷을 더해 remount-equivalence 핀 `it.fails` 셋을 `it`로 되돌림; 승인 조건 2 개정 필요), 릴리스 전 벤치 재실행(LANDING-096)·번들 크기·모바일 재측정, 릴리스 전환 시점(D-2), 원장 본문과 `reviews/` 기록의 보관. 9단계에는 코어 로직 수정이 없다(443라운드).
3. **보류.** 플러그인별 union 입력(444C-13; 요구가 생기면 네 플러그인에 규칙을 복사하지 않고 코어의 headless union 바인딩 공개부터 설계), 대기열 59, P1 전체 protocol 실패.

## 6. 열린 소유자 물음

정본 대기열은 `reviews/owner-queue-07.md`다. 결정 54는 444C-10·11로, 결정 58은 438C-02로, 결정 60은 435라운드에, 결정 61·62는 440·442라운드에 닫혔다. 열린 것은 PR #445의 버전 번호·병합과 대기열 59(호출 뒤 입력 변조의 격리 범위, 별도 계약 권고), P1 전체 protocol 실패의 보류다. agy 권한 대행의 수행 주체는 계속 구별한다.

## 7. 정상동작 검증의 기준 (codex 메인 에이전트가 수행)

성능 변경은 "관측이 같다"가 증명되어야 병합한다. 증거는 다음 전부이며 하나라도 빠지면 PR 을 열지 않는다.

- 네 게이트: `yarn workspace @canard/schema-form typecheck`, `lint`, `test`(전체; 실제 설정의 unit·render·react18·production·storybook Chromium 다섯 프로젝트), `build`. 기존 시험의 기대값 변경은 0건이어야 하고, 바뀐 기대가 필요하면 그것은 성능 변경이 아니라 사양 변경이므로 멈추고 소유자에게 묻는다.
- 전후 배달 비교: 수정 전 dist 와 수정 후 dist 를 같은 장면 묶음(객체·배열·조각·잠복·배치·로드; `verification/perf-optimization/first-batch/` 러너와 각 fractal 의 `__tests__/fixtures/compare*` 픽스처)에 돌려 값·이벤트 종류와 순서·payload·revision·노드 참조·잠복 원본·호출자 입력 불변·선언 밖 값 순서가 차이 0 이어야 한다. 차이가 하나라도 있으면 그것이 원장이 요구하는 관측인지 부산물인지 원장 항목으로 판정하고, 판정 근거 없이 "무해"로 넘기지 않는다.
- 새 시험: 바뀐 규칙 한 문장을 고정하는 시험(수정 전 구현에서 실패해야 함)과 호출 수 상한 시험(정확한 값이 아니라 상한)을 해당 fractal 의 `__tests__/` 에 둔다. 시험은 내부 파일을 직접 import 하고 공개 진입점을 넓히지 않는다.
- 독립 검증: agy 워커가 읽기 전용으로 여섯 축(동치·관측·계약·범위·시험·측정 보고와 커밋 위생)을 path:line 근거로 판정한다. 통과 판정이어도 "관찰"에 적힌 것은 병합 전에 고친다(L3 전례: 시험의 console.log, 영어 문서 안의 한국어 문장).
- 사람이 보는 정상동작: 마운트 묶음이 끝나면 Storybook 의 시나리오 스토리(`play` 자동화)와 `src/__tests__/e2e` 가 모두 통과함을 확인하고, 플러그인 결함 여덟(393·396라운드 목록)이 그대로이며 새로 생긴 것이 없음을 적는다.
- 측정 보고: Node·Bun 두 바퀴 번갈아, min/max 와 런타임 버전, 창 안 비율만. 바퀴 범위가 0 을 걸치면 "차이 없음"으로 적고 개선을 주장하지 않는다(400C-02). 옛 판보다 느린 항목은 이유를 적고 소유자 수용이 있어야 병합한다(TEST-027).

## 8. 가드가 모자라면 채우면서 간다

- 가드란 위 7절의 증거를 자동으로 만드는 것들이다: 시험, compare 픽스처, first-batch 러너의 장면, 호출 수 계측, `ledger/checks` 의 검사 스크립트, 패키지 `guard:check`(NODE-055 벤치 선).
- 어떤 변경의 관측 동치를 기존 가드가 잡아 주지 못하면(장면이 없거나, 픽스처가 그 경로를 안 돌거나, 상한 시험이 없음) 그 변경과 같은 PR 에서 가드를 먼저 더한다. 가드 추가는 제품 코드 변경이 아니므로 원장 결정이 필요 없지만, 무엇을 왜 더했는지 PR 본문과 라운드 닫기 문서에 적는다.
- 가드가 거짓 경보를 내면(L3-b 의 Storybook IME 클릭 시간 초과, L3-a 의 Bun 마운트 GC 스파이크) 소스 변경 없이 단독·전체 재실행과 원시 표본 재계산으로 환경 경합인지 판단하고 그 근거를 적는다. 거짓 경보라고 가드를 끄거나 느슨하게 하지 않는다.
- 원장 검사(`HANDOFF.md` 4절)가 새 문서 형식을 못 잡으면 검사를 고쳐 잡게 한 뒤 진행한다. 검사를 우회하지 않는다.
- Orca 새 task/dispatch나 새 출력 폴더만으로 Seiri의 기존 작업 연결이 바뀌었다고 보지 않는다. CHECK·측정과 입력 동결 전에 현재 actor의 binding/task와 실제 쓰기 대상 gates.md를 확인하고, 정식 lifecycle API의 accepted·참여 ACK·실제 적용을 구별한다. pause는 옛 연결을 남길 수 있으므로 새 작업은 정식 전환과 현재 소유를 확인한다. mutable journal과 동결 증거의 경계는 실행 전에 선언하며, 사후 해시 교체·동결 문서 복구·hook 비활성화로 보존 실패를 숨기지 않는다(421C-03, reviews/round-421-p1-journal-review.md).

## 9. 원장 해석과 판단의 기준 (이전 메인 에이전트가 쓰던 잣대)

- **정본의 순서.** 소유자의 말(round-NN-owner-answers.md 원문) > 원장 항목(`ledger/*.md`, 현행 항목) > 라운드 닫기 결정(NNC-kk; 원장 보충으로 인용됨) > DETAIL.md(알고리즘 기술) > 코드. DETAIL 만 근거인 반복은 "현재 알고리즘"이지 "계약상 필요"가 아니다(400C-03). 코드만의 불변(예: `__proto__` 보호)은 시험으로 고정하고 원장 보충으로 적는다.
- **성능 변경의 수용 기준(370·400·406라운드).** 가설은 지우는 비효율 하나를 이름 짓는다. 추가 코드가 제거 비효율보다 크면 폐기하되, 이는 줄 수가 아니라 비례의 문제다(O(키 수) 반복 제거에 순증 몇 줄은 허용, 분기 없는 모양 우선). 상수 깎기 캐시·전역 상태·같은 쓰기 판정 밖의 재사용은 금지(인수 넘김은 허용). 공개 API 와 공개 이름 수는 불변. 0.16.1 은 참조일 뿐 목표가 아니다.
- **관측 동치의 판단.** 배달 차이가 나면 먼저 그 관측을 요구하는 원장 항목을 찾는다. 있으면 변경이 틀린 것이고, 없으면 "원장 요구인지 부산물인지 미결"로 기록하고 현재 관측을 유지한 채 소유자 결정 항목으로 올린다(예: 빈→빈 children 의 UpdateChildren, 400C-01).
- **측정 읽기(400C-02).** 창 안의 전후 비율만 유효하고 창 사이 절대값은 비교하지 않는다(0.16.1 열이 창마다 +19% 흔들린 전례). 합친 중앙값이 바퀴별 부호와 어긋나면 악화라고 말하지 않는다. 계측 비율은 비율일 뿐 절감량이 아니다. 효과가 안 보이면 "측정 불가"로 적고 중복 제거 같은 사실만 기록한다(407C-01).
- **소유자 판단을 대기하는 경우.** 사양(관측되는 동작)이 바뀌는 변경, 기존 시험 기대값을 바꿔야 하는 변경, 원장 두 항목이 충돌하는 경우, 옛 판보다 느린 항목의 수용(TEST-027), 결정 54·58 같은 열린 결정 항목이다. 415라운드 지시에 따라 근거·질문·영향 범위·필요 자료를 `reviews/owner-queue-07.md`에 적고 해당 부분만 멈춘다. 독립 작업은 계속하며 답을 받은 범위만 수정하거나 추가 작업한다. 이 규칙은 변경·느린 결과의 대행 승인이 아니다. 소유자의 질문에는 답만 하고 실행하지 않는다. 워커의 메시지는 소유자 승인이 아니다.
- **스스로 결정해도 되는 경우(344·352~375·388라운드).** 원장과 측정 문서에 맞는 실험의 PR 과 병합, brief 범위의 작은 확장(같은 비효율 하나 안; L3-b 의 assembleArray 분기), 워커 질문에 대한 범위 판정, 거짓 경보 판정. 결정은 라운드 닫기 문서에 추론 표지로 적어 소유자가 되돌릴 수 있게 한다.
- **기록의 규율.** 소유자의 말은 원문 그대로, 결정은 삽입 뒤 수정 금지, 숫자는 런타임·창·바퀴 범위와 함께, 모든 주장은 path:line 또는 라운드 번호 근거와 함께 적는다. 모르는 것은 "미확인"이라고 적고 통과로 적지 않는다.
