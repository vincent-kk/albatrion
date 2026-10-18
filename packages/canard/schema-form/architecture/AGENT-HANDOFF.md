# 메인 에이전트 인계 — Claude 원장 관리자에서 codex 메인 에이전트로

이 문서는 메인 에이전트(codex)가 Claude 세션의 자리를 이어받아 쓰는 작업대다. 설계의 정본은 `ledger/`, 진행 상황의 단일 진입점은 `PLAN.md`, 재개 지점과 일하는 법은 `HANDOFF.md`다. 이 문서는 그 셋이 적지 않는 "지금 이 순간의 작업대"(Orca 상태, 열린 PR, 작업 폴더, brief 위치)와 이전 메인 에이전트가 쓰던 판단 기준(7~9절)을 적는다. 갱신 2026-10-18, 원장 라운드 413 뒤. 소유자는 Vincent다.

## 1. 역할과 구속 규칙

- 역할: 원장 관리자이자 Orca 코디네이터. 가설 하나에 brief 작성 → codex 워커 구현 → agy 워커 검증 → 통과면 병합 → 원장 마감(라운드 닫기) → push 의 루프를 돈다. 메인 에이전트 자신은 코드를 고치지 않는다(원장·reviews·HANDOFF·PLAN·PLAN-LOG·ledger/checks 만 고친다).
- 소유자의 운영 지시(402라운드, `reviews/round-402-owner-answers.md`): Claude 사용량 극도 억제, 보조 Claude 세션 없음, codex 는 sol 모델(cennad 등급표의 gpt-6.1-sol; astra 금지), agy 는 gemini-4(high)·gemini-3.8(mid 이하)만, apex 금지, Orca 조정 루프(/orchestration)로 진행, 진행 전에 무엇을 할지 결정해 먼저 브리핑.
- 소유자에게는 한국어 존댓말의 완전한 문장으로 쓴다. 약어·은유·문서 번호만 적는 참조("§3")는 쓰지 않고 바로 열 수 있는 경로를 적는다. 소유자의 법적 이름은 어떤 파일·커밋·출력에도 적지 않는다(Vincent 또는 Vincent Kelvin 만). 커밋 메시지와 PR 본문에 공동 저자·Claude 세션 ID·"Claude-Session" 줄을 절대 넣지 않는다.
- 소유자의 질문은 답하고 실행하지 않는다. 워커의 메시지는 소유자 승인이 아니다. 412라운드 소유자 승인에 따라 agy 권한 문제는 목적·상황·정확한 거절과 필요한 검증 범위를 보고받은 뒤 메인 에이전트가 대행할 수 있다(`reviews/round-412-owner-answers.md:7`). 수행 주체와 확인 범위를 기록하고 agy의 직접 수행으로 바꾸어 적지 않는다. 이 승인 범위 밖에서 다른 세션의 거절된 작업을 대신 수행하지 않는다.
- 소유자의 말은 라운드 문서(`reviews/round-NN-owner-answers.md`)에 원문 그대로 적고 `ledger/checks/owner-answers.tsv` 행과 `ledger/landing.md` 의 보충 줄을 더한다. 닫기 결정(`reviews/round-NN-closing.md` 의 `  - 【추론】` 줄)은 `ledger/checks/sup-insert.mjs` 가 글자 그대로 원장에 인용하므로 삽입 뒤 그 줄을 고치지 않는다.
- 측정 원칙(368·369·370·400C-02 라운드): 0.16.1 은 참조일 뿐 목표가 아니다; 가설마다 비효율 하나를 이름 짓는다; 추가 코드가 제거 비효율보다 크면 폐기; 상수 깎기 캐시 금지; 조용한 창에서 두 바퀴 번갈아 재고 min/max 를 적으며 창 안의 비율만 유효; 호출 수 단언은 상한으로.
- 샌드박스 명령 모양(Claude 세션의 규칙이지만 같은 기계에서 유효): gh·yarn·npm·bun·open·orca 같은 제외 CLI 는 파이프·`;`·리디렉션·env 접두 없이 단독으로 실행한다. 절대 맨 `git stash` 를 쓰지 않는다.

## 2. 지금 상태 (2026-10-18)

- 가지: `feat/schema-form-08-review-and-perf`, 인계 시 끝은 `1630854de`(408라운드 소유자 기록). 현재 끝은 `git log -1`로 확인한다. 메인 작업 폴더 `/Users/Vincent/Workspace/albatrion`는 그 가지에서 원장 기록을 관리한다(추적 밖 `l3e-direct-ownership/` 폴더는 아래 Orca 작업 폴더다; `git add .`를 쓰지 말 것).
- 병합된 PR: #416 L3-e 조각 소유 직접 판정(`fde6ab359`, 403C-01), #417 L3-b items 없는 배열 끝 덧붙임 지름길(`8e35b01fc`, 404C-01), #418 L3-a 선언 밖 키 일반 대입(`89ea2c98b`, 405C-01), #419 L3-c 선언 밖 값 구조 비교 한 번(`bb4ff19d9`, 406C-01), #420 L3-d staticSpec 전달(`67484c0be`, 407C-01). L3 구현 묶음 다섯 가설 완료.
- 열린 PR: 없음. PR #422는 412라운드 소유자 승인에 따른 코디네이터 metadata 대체 확인과 최종 head 확인 뒤 `ef6747ea074bb8ddd0413533e5ff352154743afb`로 squash 병합했다. 제품 변경은 0이며 itemless 최적화 구현은 아직 하지 않았다. 다음은 별도 계획·독립 검토다.
- 측정 결과 표(정본, PR #421로 커밋됨): `verification/perf-optimization/l3e-direct-ownership-results.md`, `l3b-array-append-results.md`, `l3a-extras-plain-assignment-results.md`, `l3c-extras-single-compare-results.md`, `l3d-static-spec-pass-through-results.md`. 같은 창의 옛 판 표본 등 결손을 미검증으로 구별했으며 M3 세 판 완전 비교와 소유자 수용은 남아 있다.
- 병합된 마운트 보고: `verification/perf-optimization/mount-breakdown-results.md`(PR #422 병합 완료). 첫 창은 2026-10-18T10:59:59.475Z–11:03:09.740Z, 원자료는 TMPDIR/mount-breakdown-task_7e0e67a1893f다. current 분해·호출 수는 유효한 방향 단서지만 legacy factory 반환 뒤 public value getter에서 지연 합성이 일어나 옛 판 완료 시간·상대 비율은 무효다(Node·Bun 지원 12장면씩 총 480회 readiness 확인). canonical 완료 경계 보정 `234d88ce0`은 두 판 모두 공개 노드 값을 후위 순서로 관측하는 비용을 시간에 포함한다. Node·Bun과 adapter·first-batch의 네 가드 조합은 각각 통과 28·옛 판 미지원 4·실패 0이고 타입 검사·린트·전체 시험(759파일·4785통과·기존 todo 1)·빌드도 통과했다. 새 창은 2026-10-18T11:49:39.642Z–11:52:05.641Z, 원자료는 TMPDIR/mount-breakdown-completed-task_7e0e67a1893f이며 네 실행이 모두 종료했다. 제품 dist·Winglet 603파일·첫 창 58파일·이전 raw 138파일 해시를 보존했다. 최종 보고·PR 갱신·자체 독립 수치 검산과 승인된 metadata 대체 확인은 완료했으며 새 창을 첫 factory-only 창과 절대시간으로 비교하지 않는다. seiri task는 `mount-readiness-boundary`다. 그 뒤 첫 제품 후보는 item·prefixItems 및 대응 후보가 모두 없는 배열의 N회 빈 선언 조회 제거이며, 전체 이벤트·revision·참조 동치 가드와 계획 검증이 선행한다.
- 워커 brief 원본: `verification/perf-optimization/l3-briefs/` (가설별 구현 brief 와 검증 brief 여섯 편). 다음 가설의 brief 는 이 꼴을 복제해 쓴다.

## 3. Orca 상태

최신 상태(413라운드): PR #422는 `ef6747ea074bb8ddd0413533e5ff352154743afb`로 병합했다. 아래 과거 dispatch와 대기 문구는 경위이며 현재 재개 명령이 아니다. 마지막 구현 채널은 `ctx_d0177fc5f7c1`(PR 본문 승인 반영), 원장 검사 채널은 `ctx_fc228b5a0afc`(소유자412 검사)이며 실제 worker_done을 수락하고 둘 다 release를 요청해 외부 터미널 retained로 남았다. 다음 원장 검사에는 메인 검사 터미널을, 계획에는 구현 터미널을 재사용한다. 412라운드 승인에 따른 코디네이터 metadata 대체 확인을 완료했으며 agy 직접 수행으로 바꾸지 않는다.

- run: `run_313832ef19e0` (objective: schema-form L3 implementation bundle). 현재 codex 코디네이터 터미널은 `term_edfe8a93-bd0e-47ad-8bdb-670109008352`다. 다음 메인 에이전트도 자기 터미널에서 `orca orchestration run-use --id run_313832ef19e0 --json`으로 묶고 안내는 `orca skills get orchestration`으로 읽는다. 기다림은 한 번에 60초 이내로 두고 checkpoint마다 소유자에게 진행 상황을 보고한다.
- 작업 폴더(Orca 최상위 worktree): `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`, id `e6ce1c03-a2d9-41a9-a217-79ad5c407d6d::/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`. 가설마다 이 폴더에서 origin 가지 끝 기준으로 새 가지를 만든다(worker-start 에 `--worktree 'id:<위 id>'`).
- codex 워커 터미널: `term_0cf34ebb-ef46-4ba8-9fea-e5107e842e52` (Orca launch.effective에서 gpt-6.1-sol, effort high 확인). 현재 dispatch는 `ctx_78ce2501c5f0`(마운트 원인 분해, 기준 `214534c2f`, 가지 `perf/schema-form-mount-breakdown` 예정)이며 이전 문서 dispatch `ctx_f68f235dc62c`를 마친 같은 터미널을 재사용했다. 재사용은 `worker-start --spec '...' --worktree 'id:<위 id>' --terminal term_0cf34ebb-ef46-4ba8-9fea-e5107e842e52 --json`이다. 옛 handle `term_4172d8a2-ba30-4eda-91ce-0f63839e2f84`는 terminal_handle_stale이었고 재조회 결과 작업 폴더에 셸만 남아 있어 새 워커를 시작했다. 옛 handle로 보내지 않는다. 메인 원장 검사용 별도 codex 터미널 `term_afdd38e8-12ea-4fdb-8610-79bbf73f99bc`도 같은 모델·effort로 시작했으며 마지막 dispatch `ctx_dda051d0f10e`의 410라운드 검사 결과를 수락하고 release를 요청했으나 기존 터미널이라 retained(external_terminal)로 남아 있다. 같은 메인 작업 폴더의 다음 검사에 재사용할 수 있다.
- 검증 워커: 가설마다 새로 띄운다(`worker-start --spec ... --worktree current --agent antigravity --model gemini-4-argon-medium --json`; 끝나면 `worker-release`). 마지막 검증 dispatch `ctx_29acb9cd7092`(PR #421, 여섯 축 통과·수정 관찰 없음, worker_done 수신 뒤 released). 표준 샌드박스의 Orca 런타임 메타데이터 접근 오류가 있었으므로 실패 뒤 권한을 넓히거나 다른 도구로 우회하지 말고 정확한 오류를 보고한다. 실제 완료 신호 없이 코디네이터가 worker_done을 대신 만들지 않는다.
- 마운트 원시 자료 사전 검산 dispatch `ctx_4db9d84f5038`는 current 산술·계측·계수·계약 분류의 터미널 보고를 마쳤으나 Orca metadata 읽기 거절로 후속 메시지와 worker_done을 전달하지 못했다. 최종 idle 응답을 확인한 뒤 abandon했고 release도 요청했으나 `identity_unproven`으로 retained다(터미널 `term_e983896d-d3f6-4bef-9d60-93267895462b`). 프로세스를 닫았다고 주장하지 않는다. 그 보고는 최종 PR 검증이 아니며, legacy 완료 경계 수정과 새 표·최종 커밋에 대한 독립 검증이 다시 필요하다. 권한 우회는 하지 않는다.
- 최종 g4 정적 검토 dispatch `ctx_7142980ae632`는 터미널에 통과를 적었지만 최종 병합 근거로 전부 수락하지 않았다. 기존 구현자 validate-completed.py 재실행은 새 독립 수치 계산이 아니며 Git 검사는 global config 접근 거절로 미확인이다. 정적 호출 경로·계약·가드 검토만 재사용하고, 축약 경로 관찰은 실제 문서와 대조해 반영한다. 명시적 최종 idle 응답 뒤 worker-stop이 새 검증 터미널을 닫았고 worker-release는 released였다. 별도의 좁은 독립 계산·정상 gh 메타데이터·최종 문서 확인은 g3.8 flash high dispatch `ctx_012021627dcf`·task `task_66e80cc270b2`·터미널 `term_65d6c9e9-0d63-4b5c-8415-c36e8f0ce3ea`에서 진행한다. 시작은 outcome_unknown이었지만 live 상태를 확인했으므로 중복 시작하지 않는다. brief는 `verification/perf-optimization/l3-briefs/mount-completed-independent-brief.md`다.
- Filid seam dispatch `ctx_4e79e9faa1fb`는 실제 worker_done으로 완료했다. 세 snapshot은 `e216ba42c97f592b0810c4daba0218ee95b091b1a2d6600cf152d66cd4e14776`으로 일치했고 facts bootstrap은 완료했으나, 고유 finding 76(오류 24·경고 52)과 진단 130으로 전역 FAIL·분석 완전성 미확정이다. 모든 finding evidence 339경로의 기준 대조에서 바뀐 경로는 없었다. 이번 다섯 경로는 기존 architecture·bench ignore로 자동 감사 제외이며 수동 공개 경계 확인을 자동 통과로 바꾸지 않는다. 새 guard의 자동 role/cap 판정도 미확인이다. 실제 축약 참조 5위치만 명확히 하고 전역 한계를 PR·보고서에 넣는 후속 문서 task는 `task_adbf08a23895`·dispatch `ctx_4f7048d92704`이며 같은 codex 터미널을 재사용한다. brief는 `verification/perf-optimization/l3-briefs/mount-report-findings-brief.md`, 작업 폴더 사본은 `.seiri/tasks/mount-readiness-boundary/report-findings-brief.md`다. 원자료·수치·제품·도구는 동결이다.
- 최신 정리: codex 문서 보완 dispatch `ctx_4f7048d92704`는 실제 worker_done 뒤 release를 요청했고 기존 외부 터미널이라 retained(external_terminal)이며 idle이다. g3.8 `ctx_012021627dcf`는 자체 스크립트로 새 표32행·11200표본·계측6400표본·readiness 원시 로그12개를 검산해 일치를 보고했고 Git·gh metadata는 UNVERIFIED였다. 명시적 최종 idle 뒤 같은 터미널을 증거 확인 task `task_c43c24a7519f`·dispatch `ctx_59253b4692d6`로 재사용하여 실제 gh 종료1과 config.yml의 operation not permitted를 확인했다. 이미 거절된 명령을 재시도하지 않았으며 최종 idle 뒤 worker-stop이 터미널을 닫고 release는 released였다. 독립 수치 검토 당시 보고서 hash는 `eef5c73ab656619b53b256d64ab6a9d3d4fd7d1699fcdd9915293eccb2c5e3fb`, 후속 상태 문장을 반영한 최종 hash는 `3efc5b947324b1c7441003b49e56ceb75c0fcee9ecd08c0632f9dc8ca580ba28`다. 후속 변경의 수치512셀/1104숫자와 raw/tool246파일 보존을 별도 확인했다. 코디네이터 자체 PR/commit 확인은 head/base·다섯 경로·CLEAN·review 없음·금지 줄0이지만 독립 metadata 통과로 대체하지 않는다.
- 411라운드 메인 원장 검사 채널은 task `task_17e6d964f343`·dispatch `ctx_00fdf76400c5`·터미널 `term_afdd38e8-12ea-4fdb-8610-79bbf73f99bc`다. 기존 27개 검사와 소유자 원문·삽입된 결정·토큰 차이를 확인하며 완전한 count 표를 worker_done으로 받는다. nested 작업 폴더나 제품 게이트를 대신 검사하지 않는다. 소유자 판단 전 병합 보류와 다음 라운드 번호 412를 유지한다.
- 주의: 워커가 `run-use` 나 `--terminal` 없는 `check` 를 실행하면 코디네이터 바인딩을 빼앗아 `consumer_fenced` 가 난다. brief 에 "run-use 금지, check 는 --terminal 로" 를 적고, 끊기면 `run-use` 로 다시 묶는다. 새 최상위 작업 폴더를 만들면 기준이 master(0.16.1)일 수 있으니 brief 첫 단계에 기준 커밋 확인을 둔다.

## 4. 라운드 닫기 절차 (`architecture/` 에서)

1. `reviews/round-NN-closing.md` 를 쓴다(1행 제목, 3행 머리 문단, 5행 `## 편집자 결정`, 7행 `- **NNC-01 (...)**`, 8행 `  - 【추론】 ...`, 9·10행 둘째 결정, `## 남은 것`, 끝에 `다음 라운드 번호는 NN+1이다.`).
2. `node ledger/checks/sup-insert.mjs reviews/round-NN-closing.md <plan.json>` — plan 은 `[{"code":"NNC-01","line":8,"targets":["ledger/goal.md:GOAL-011", ...]}]`.
3. `node ledger/checks/round-close.mjs NN "<PLAN 5절 표 행>" "<HANDOFF 1절 bullet, 끝에 ' 다음 라운드 번호는 NN+1.'>" "<HANDOFF 5절 지도 행>"`.
4. `HANDOFF.md` 5행(1절 제목)을 손으로 갱신한다(역따옴표 파일 이름과 새 숫자 표기를 피한다).
5. `HANDOFF.md` 4절의 검사를 모두 돌린다: verbatim-check, sup-check, ref-check, owner-cited, bundle 과 sentence-check(17영역 모두 missing 0), tokens inventory·check(411라운드 현재 missing 466; 수가 바뀌면 토큰별 원인을 대조하고 미해명 증가를 통과로 보지 않음), plan-links, doc-coverage(알려진 미인용 LANDING-209·210 둘만). 인계 당시의 471은 기준 커밋에서 재현되지 않았고 실제 기준은 470이었다. 409라운드의 감소 둘은 새 소유자 원문 인용과 이전 라운드의 PLAN-LOG 이동 때문이며, 411라운드의 감소 둘은 새 추론 문자열의 /payload·112행 충족이다. 후자는 과거 계약의 의미적 해소가 아니다. 자료 삭제나 검사 변경은 없다(reviews/round-409-owner-answers.md, reviews/round-411-closing.md).
6. 바뀐 파일을 경로로 지정해 커밋하고, 커밋 전 `HEAD == origin/feat/schema-form-08-review-and-perf` 를 확인하며(아니면 rebase), 커밋마다 push 한다.
7. 소유자 라운드(소유자의 새 지시)는 `reviews/round-NN-owner-answers.md`(표: 확인·물음 요지·답 원문·반영) + `ledger/checks/owner-answers.tsv` 행(`reviews/round-NN-owner-answers.md:L<TAB>NN<TAB>라벨<TAB>"원문" (날짜, 원장 세션)`) + `ledger/landing.md` 의 직전 소유자 줄 뒤에 `  > 소유자(NN라운드, 라벨): "원문" (\`reviews/round-NN-owner-answers.md:L\`)` + round-close.

## 5. 다음 할 일 (400C-04 순서; 408라운드 소유자 지시로 마운트 해결과 정상동작 검증까지 codex 메인 에이전트의 몫)

1. **완료.** 측정 결과 표 다섯(l3e·l3b·l3a·l3c·l3d)을 `verification/perf-optimization/`의 정본 측정 문서로 정리한 문서 PR #421을 병합했다(`c350e7651`, 제품 코드 변경 0). 같은 창의 옛 판 표본 등 결손은 미검증이며 M3 완전 비교를 대체하지 않는다.
2. **마운트 문제 해결.** 현재 유효한 기준은 PR #422의 별도 완료 경계 창이며 과거 창의 수치와 연결하지 않는다. 완료된 B0 객체 1000키는 Node 0.9511 ms·Bun 0.4750 ms(같은 창 옛 판 대비 +1972.2%·+239.1%), BN 객체 1000키는 6.6765 ms·4.0709 ms(+243.4%·+194.1%)다. 이 잔여를 수용한 것은 아니다. 절차는 (가) 원인 분해와 가드 보강 결과를 독립 검증하고 마감한다. 첫 창 current 계측은 방향 단서이며 완료 경계의 새 total 성분이나 절감량으로 바꾸지 않는다(400C-02). (나) 실제 합성 청사진의 item·prefixItems와 대응 후보 부재가 증명된 배열의 N회 빈 선언 조회부터 계획·독립 계획 검토 후 별도 구현 PR로 간다. 가설마다 L3와 같은 루프(brief → codex 구현 → agy 검증 → 병합 → 라운드 닫기)를 지킨다. 그다음 nextExtras 결과 키 재열거와 첫 객체 합성의 중간 이름 구성 제거는 각각 별도 증명이 필요하다. (다) 원장 계약이 요구하는 정착 순서·출발점 고정·게이트 평가 결과·발생 정체와 소유·폼마다 청사진 생성은 지키되 현재 루프·할당이 최솟값이라고 단정하지 않는다. NODE-018의 바이트 추정은 의무 레코드 크기가 아니며 heap은 아직 측정하지 않았다. 지울 근거가 없는 잔여는 재측정 수치와 근거를 적어 M3 수용 후보로 올린다. 결정 58은 분해 뒤 실험 조건이 입증되면 소유자에게 돌아오며 현재 fixture에는 그 게이트 조건이 없다.
3. **정상동작 검증.** 성능 PR 마다 아래 7절의 증거를 모두 갖춘다. 마운트 묶음이 끝나면 M3 종합 재측정(세 판 dist 를 한 창에서, 368·369 형식)과 함께 전체 정상동작 검증 보고(7절)를 소유자에게 올리고 수용 판정을 받는다.
4. 그다음 플러그인·내장 fallback 결함 여덟 수정 PR(393·396라운드; 결정 54 는 이때) → 9단계.
5. 묶음이 끝나면 Orca 작업 폴더 `l3e-direct-ownership` 를 지운다(`orca worktree` 삭제 명령은 소유자 승인 뒤).

## 6. 열린 소유자 물음

없음. PR #422는 412라운드 소유자가 승인한 코디네이터 metadata 대체 확인 뒤 병합했다. 이후 agy 권한 문제도 목적·상황·정확한 거절·필요 범위를 확인한 뒤 대행하고 수행 주체를 구별한다. 결정 58은 마운트 실험 조건이 입증되면, 결정 54는 플러그인 PR 때 돌아온다.

## 7. 정상동작 검증의 기준 (codex 메인 에이전트가 수행)

성능 변경은 "관측이 같다"가 증명되어야 병합한다. 증거는 다음 전부이며 하나라도 빠지면 PR 을 열지 않는다.

- 네 게이트: `yarn workspace @canard/schema-form typecheck`, `lint`, `test`(전체; unit·render·storybook 세 프로젝트), `build`. 기존 시험의 기대값 변경은 0건이어야 하고, 바뀐 기대가 필요하면 그것은 성능 변경이 아니라 사양 변경이므로 멈추고 소유자에게 묻는다.
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

## 9. 원장 해석과 판단의 기준 (이전 메인 에이전트가 쓰던 잣대)

- **정본의 순서.** 소유자의 말(round-NN-owner-answers.md 원문) > 원장 항목(`ledger/*.md`, 현행 항목) > 라운드 닫기 결정(NNC-kk; 원장 보충으로 인용됨) > DETAIL.md(알고리즘 기술) > 코드. DETAIL 만 근거인 반복은 "현재 알고리즘"이지 "계약상 필요"가 아니다(400C-03). 코드만의 불변(예: `__proto__` 보호)은 시험으로 고정하고 원장 보충으로 적는다.
- **성능 변경의 수용 기준(370·400·406라운드).** 가설은 지우는 비효율 하나를 이름 짓는다. 추가 코드가 제거 비효율보다 크면 폐기하되, 이는 줄 수가 아니라 비례의 문제다(O(키 수) 반복 제거에 순증 몇 줄은 허용, 분기 없는 모양 우선). 상수 깎기 캐시·전역 상태·같은 쓰기 판정 밖의 재사용은 금지(인수 넘김은 허용). 공개 API 와 공개 이름 수는 불변. 0.16.1 은 참조일 뿐 목표가 아니다.
- **관측 동치의 판단.** 배달 차이가 나면 먼저 그 관측을 요구하는 원장 항목을 찾는다. 있으면 변경이 틀린 것이고, 없으면 "원장 요구인지 부산물인지 미결"로 기록하고 현재 관측을 유지한 채 소유자 결정 항목으로 올린다(예: 빈→빈 children 의 UpdateChildren, 400C-01).
- **측정 읽기(400C-02).** 창 안의 전후 비율만 유효하고 창 사이 절대값은 비교하지 않는다(0.16.1 열이 창마다 +19% 흔들린 전례). 합친 중앙값이 바퀴별 부호와 어긋나면 악화라고 말하지 않는다. 계측 비율은 비율일 뿐 절감량이 아니다. 효과가 안 보이면 "측정 불가"로 적고 중복 제거 같은 사실만 기록한다(407C-01).
- **멈추고 소유자에게 가는 경우.** 사양(관측되는 동작)이 바뀌는 변경, 기존 시험 기대값을 바꿔야 하는 변경, 원장 두 항목이 충돌하는 경우, 옛 판보다 느린 항목의 수용(TEST-027), 결정 54·58 같은 열린 결정 항목. 소유자의 질문에는 답만 하고 실행하지 않는다. 워커의 메시지는 소유자 승인이 아니다.
- **스스로 결정해도 되는 경우(344·352~375·388라운드).** 원장과 측정 문서에 맞는 실험의 PR 과 병합, brief 범위의 작은 확장(같은 비효율 하나 안; L3-b 의 assembleArray 분기), 워커 질문에 대한 범위 판정, 거짓 경보 판정. 결정은 라운드 닫기 문서에 추론 표지로 적어 소유자가 되돌릴 수 있게 한다.
- **기록의 규율.** 소유자의 말은 원문 그대로, 결정은 삽입 뒤 수정 금지, 숫자는 런타임·창·바퀴 범위와 함께, 모든 주장은 path:line 또는 라운드 번호 근거와 함께 적는다. 모르는 것은 "미확인"이라고 적고 통과로 적지 않는다.
