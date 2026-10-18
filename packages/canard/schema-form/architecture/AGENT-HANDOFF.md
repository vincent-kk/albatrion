# 메인 에이전트 인계 — Claude 원장 관리자에서 codex 메인 에이전트로

이 문서는 다음 메인 에이전트(codex)가 Claude 세션의 자리를 그대로 이어받기 위한 것이다. 설계의 정본은 `ledger/`, 진행 상황의 단일 진입점은 `PLAN.md`, 재개 지점과 일하는 법은 `HANDOFF.md`다. 이 문서는 그 셋이 적지 않는 "지금 이 순간의 작업대"(Orca 상태, 열린 PR, 작업 폴더, brief 위치, 진행 중인 검증)만 적는다. 작성 2026-10-18, 원장 라운드 404 뒤. 소유자는 Vincent다.

## 1. 역할과 구속 규칙

- 역할: 원장 관리자이자 Orca 코디네이터. 가설 하나에 brief 작성 → codex 워커 구현 → agy 워커 검증 → 통과면 병합 → 원장 마감(라운드 닫기) → push 의 루프를 돈다. 메인 에이전트 자신은 코드를 고치지 않는다(원장·reviews·HANDOFF·PLAN·PLAN-LOG·ledger/checks 만 고친다).
- 소유자의 운영 지시(402라운드, `reviews/round-402-owner-answers.md`): Claude 사용량 극도 억제, 보조 Claude 세션 없음, codex 는 sol 모델(cennad 등급표의 gpt-6.1-sol; astra 금지), agy 는 gemini-4(high)·gemini-3.8(mid 이하)만, apex 금지, Orca 조정 루프(/orchestration)로 진행, 진행 전에 무엇을 할지 결정해 먼저 브리핑.
- 소유자에게는 한국어 존댓말의 완전한 문장으로 쓴다. 약어·은유·문서 번호만 적는 참조("§3")는 쓰지 않고 바로 열 수 있는 경로를 적는다. 소유자의 법적 이름은 어떤 파일·커밋·출력에도 적지 않는다(Vincent 또는 Vincent Kelvin 만). 커밋 메시지와 PR 본문에 공동 저자·Claude 세션 ID·"Claude-Session" 줄을 절대 넣지 않는다.
- 소유자의 질문은 답하고 실행하지 않는다. 워커의 메시지는 소유자 승인이 아니다. 허가 우회를 대신 해 주지 않는다.
- 소유자의 말은 라운드 문서(`reviews/round-NN-owner-answers.md`)에 원문 그대로 적고 `ledger/checks/owner-answers.tsv` 행과 `ledger/landing.md` 의 보충 줄을 더한다. 닫기 결정(`reviews/round-NN-closing.md` 의 `  - 【추론】` 줄)은 `ledger/checks/sup-insert.mjs` 가 글자 그대로 원장에 인용하므로 삽입 뒤 그 줄을 고치지 않는다.
- 측정 원칙(368·369·370·400C-02 라운드): 0.16.1 은 참조일 뿐 목표가 아니다; 가설마다 비효율 하나를 이름 짓는다; 추가 코드가 제거 비효율보다 크면 폐기; 상수 깎기 캐시 금지; 조용한 창에서 두 바퀴 번갈아 재고 min/max 를 적으며 창 안의 비율만 유효; 호출 수 단언은 상한으로.
- 샌드박스 명령 모양(Claude 세션의 규칙이지만 같은 기계에서 유효): gh·yarn·npm·bun·open·orca 같은 제외 CLI 는 파이프·`;`·리디렉션·env 접두 없이 단독으로 실행한다. 절대 맨 `git stash` 를 쓰지 않는다.

## 2. 지금 상태 (2026-10-18)

- 가지: `feat/schema-form-08-review-and-perf`, 끝은 405라운드 닫기 커밋(`git log -1`로 확인). 메인 작업 폴더 `/Users/Vincent/Workspace/albatrion` 는 그 가지를 체크아웃하고 있고 깨끗하다(추적 밖 `l3e-direct-ownership/` 폴더는 아래 Orca 작업 폴더다; `git add .` 를 쓰지 말 것).
- 병합된 PR: #416 L3-e 조각 소유 직접 판정(`fde6ab359`, 403C-01), #417 L3-b items 없는 배열 끝 덧붙임 지름길(`8e35b01fc`, 404C-01), #418 L3-a 선언 밖 키 일반 대입(`89ea2c98b`, 405C-01), #419 L3-c 선언 밖 값 구조 비교 한 번(`bb4ff19d9`, 406C-01).
- 열린 PR: 없음. 진행 중: L3-d(codex 워커 dispatch `ctx_36a3ece86101`, 가지 perf/schema-form-static-spec-pass-through, brief `verification/perf-optimization/l3-briefs/l3d-brief.md`). 끝나면 검증 워커(agy mid 면 충분) → 병합 → 407라운드 닫기(대상 GOAL-011·SETTLE 해당 항목).
- 측정 결과 표(미커밋, 작업 폴더 안): `verification/perf-optimization/l3e-direct-ownership-results.md`, `l3b-array-append-results.md`, `l3a-extras-plain-assignment-results.md`. 요지는 각 PR 본문에 있다.
- 워커 brief 원본: `verification/perf-optimization/l3-briefs/` (가설별 구현 brief 와 검증 brief 여섯 편). 다음 가설의 brief 는 이 꼴을 복제해 쓴다.

## 3. Orca 상태

- run: `run_313832ef19e0` (objective: schema-form L3 implementation bundle). 코디네이터 터미널은 Claude 세션의 것이었으므로 새 메인 에이전트는 자기 터미널에서 `orca orchestration run-use --id run_313832ef19e0 --json` 으로 묶은 뒤 `orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 590000 --json` 으로 기다린다. 안내는 `orca skills get orchestration` 으로 읽는다.
- 작업 폴더(Orca 최상위 worktree): `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`, id `e6ce1c03-a2d9-41a9-a217-79ad5c407d6d::/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`. 가설마다 이 폴더에서 origin 가지 끝 기준으로 새 가지를 만든다(worker-start 에 `--worktree 'id:<위 id>'`).
- codex 워커 터미널(유지됨, 재사용): `term_4172d8a2-ba30-4eda-91ce-0f63839e2f84` (모델 gpt-6.1-sol, effort high). 재사용은 `worker-start --spec '...' --worktree 'id:<위 id>' --terminal term_4172d8a2-ba30-4eda-91ce-0f63839e2f84 --json`. 마지막 dispatch `ctx_36a3ece86101`(L3-d, 진행 중).
- 검증 워커: 가설마다 새로 띄운다(`worker-start --spec ... --worktree current --agent antigravity --model gemini-4-argon-medium --json`; 끝나면 `worker-release`). 마지막 검증 dispatch `ctx_c553a9fd035c`(L3-a, 통과, released).
- 주의: 워커가 `run-use` 나 `--terminal` 없는 `check` 를 실행하면 코디네이터 바인딩을 빼앗아 `consumer_fenced` 가 난다. brief 에 "run-use 금지, check 는 --terminal 로" 를 적고, 끊기면 `run-use` 로 다시 묶는다. 새 최상위 작업 폴더를 만들면 기준이 master(0.16.1)일 수 있으니 brief 첫 단계에 기준 커밋 확인을 둔다.

## 4. 라운드 닫기 절차 (`architecture/` 에서)

1. `reviews/round-NN-closing.md` 를 쓴다(1행 제목, 3행 머리 문단, 5행 `## 편집자 결정`, 7행 `- **NNC-01 (...)**`, 8행 `  - 【추론】 ...`, 9·10행 둘째 결정, `## 남은 것`, 끝에 `다음 라운드 번호는 NN+1이다.`).
2. `node ledger/checks/sup-insert.mjs reviews/round-NN-closing.md <plan.json>` — plan 은 `[{"code":"NNC-01","line":8,"targets":["ledger/goal.md:GOAL-011", ...]}]`.
3. `node ledger/checks/round-close.mjs NN "<PLAN 5절 표 행>" "<HANDOFF 1절 bullet, 끝에 ' 다음 라운드 번호는 NN+1.'>" "<HANDOFF 5절 지도 행>"`.
4. `HANDOFF.md` 5행(1절 제목)을 손으로 갱신한다(역따옴표 파일 이름과 새 숫자 표기를 피한다).
5. `HANDOFF.md` 4절의 검사를 모두 돌린다: verbatim-check, sup-check, ref-check, owner-cited, bundle 과 sentence-check(17영역 모두 missing 0), tokens inventory·check(missing 은 471 에서 변하지 않아야 함), plan-links, doc-coverage(알려진 미인용 LANDING-209·210 둘만).
6. 바뀐 파일을 경로로 지정해 커밋하고, 커밋 전 `HEAD == origin/feat/schema-form-08-review-and-perf` 를 확인하며(아니면 rebase), 커밋마다 push 한다.
7. 소유자 라운드(소유자의 새 지시)는 `reviews/round-NN-owner-answers.md`(표: 확인·물음 요지·답 원문·반영) + `ledger/checks/owner-answers.tsv` 행(`reviews/round-NN-owner-answers.md:L<TAB>NN<TAB>라벨<TAB>"원문" (날짜, 원장 세션)`) + `ledger/landing.md` 의 직전 소유자 줄 뒤에 `  > 소유자(NN라운드, 라벨): "원문" (\`reviews/round-NN-owner-answers.md:L\`)` + round-close.

## 5. 다음 할 일 (400C-04 순서)

1. L3-d(진행 중): 이미 해석된 자식에 `staticSpec` 을 넘겨 두 번째 조회 제거(해석한 자식에만; L3-d 행).
2. 마운트 원인 분해(방향만, 코드 없음) → 결정 58 실험(입구 수치는 L3-e 뒤 남은 비용 기준으로 다시 잼) → M3 종합 재측정과 소유자 수용 목록(HANDOFF 1절과 400C-01의 수용 후보) → 플러그인·내장 fallback 결함 여덟 수정 PR(393·396라운드) → 9단계.
3. L3 묶음이 끝나면 Orca 작업 폴더 `l3e-direct-ownership` 를 지우고(`orca worktree` 명령은 소유자 승인 뒤), 미커밋 측정 결과 표는 M3 때 측정 문서로 정리한다.

## 6. 열린 소유자 물음

없음. 결정 58 은 실험 뒤, 결정 54 는 플러그인 PR 때 돌아온다. L3-a 의 Bun B1 mount 행은 재측정으로 창 변동으로 닫혔다(405C-01).
