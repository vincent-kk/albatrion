# L3-c 구현 brief — nextExtras 끝의 sameValue 이중 비교 제거

저장소: /Users/Vincent/Workspace/albatrion (yarn 모노레포). 패키지: packages/canard/schema-form (패키지 CLAUDE.md의 명령을 따르십시오). 작업 폴더: /Users/Vincent/Workspace/albatrion/l3e-direct-ownership (이미 있는 Orca 작업 폴더; 본 폴더 /Users/Vincent/Workspace/albatrion 은 건드리지 않습니다).

Orca 규칙: `orca orchestration run-use` 와 코디네이터 명령(run-create, worker-start, worker-release 등)을 실행하지 마십시오. 후속 메시지는 preamble 의 handle 로 `check --terminal <handle>` 만 쓰십시오. 질문은 preamble 의 ask 명령으로 하십시오.

## 0. 첫 단계: 기준 커밋 맞추기

작업 폴더에서 `git status` 가 깨끗한지 확인하고(미커밋 측정 결과 파일들과 .seiri/tasks 는 그대로 두어도 됨), `git fetch origin feat/schema-form-08-review-and-perf` 뒤 `git checkout -b perf/schema-form-extras-single-compare origin/feat/schema-form-08-review-and-perf` 로 새 가지를 만듭니다. 기준 커밋을 `git log -1 --oneline` 으로 확인해 보고에 적으십시오(PR #418 병합 89ea2c98b 뒤의 원장 커밋이어야 합니다). 이전 가지 perf/schema-form-extras-plain-assignment 는 병합되었으니 지워도 됩니다. `yarn install` 을 한 번 돌립니다.

## 1. 목표 (가설 L3-c, 정본 문서)

정본은 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## A2 — extras 복사·재구성" 절 끝 문단(Overwrite 조사: "`nextExtras.ts`의 sameValue 뒤에 `markWrite.ts`가 extras를 다시 비교하고 `updateOutput.ts`가 같은 출력의 직전 참조를 되살립니다")과 "### L3 가설 다섯" 표의 L3-c 행("Merge 경로를 먼저 확인합니다. Overwrite의 markWrite 비교와 출력 참조 되살림을 유지합니다")입니다. 먼저 이 두 곳을 읽으십시오.

비효율: `src/core/engine/settle/utils/input/nextExtras.ts` 끝의 `sameValue(previous, next) ? previous : next` 가 선언 밖 값 전체를 구조 비교하는데(Node B0 한 키에서 nextExtras 포괄 시간의 31.2%), Overwrite 경로에서는 바로 뒤 `markWrite.ts` 의 `extrasChanged = !sameValue(node.undeclaredValues, extras)` 가 같은 비교를 다시 하고 `updateOutput.ts` 가 같은 출력의 직전 참조를 되살립니다. 조사 사본에서 nextExtras 의 비교만 빼도 추가 UpdateValue·revision·onChange 가 없었습니다(Overwrite 만 조사됨).

반영할 것: 먼저 Merge 경로(와 nextExtras 의 다른 모든 호출자)에서 nextExtras 의 되살림 결과(같은 값이면 이전 참조)를 누가 의존하는지 path:line 으로 전부 추적하십시오. 모든 호출자가 뒤에서 같은 비교를 하거나 참조 동일성에 의존하지 않으면, nextExtras 의 끝 비교를 없애고 그 책임을 호출자의 기존 비교 하나에 맡깁니다. 어느 호출자든 nextExtras 의 참조 되살림에 의존하면(예: Merge 경로가 그 참조로 변경 여부를 판단), 비교를 없애지 말고 그 호출자에서만 비교가 한 번이 되도록 바꾸되 추가 코드가 제거보다 크면 중단하고 보고하십시오. 결과적으로 선언 밖 값에 대한 구조 비교는 쓰기 한 번에 한 번이어야 합니다.

먼저 지킬 조건: SETTLE-043 의 같은 값 규칙(같은 값이면 커밋·emit 의 기존 참조 되살림)이 관측상 그대로여야 합니다 — 같은 값 쓰기에서 추가 UpdateValue·revision·onChange 가 없고 출력 참조가 이전과 같아야 합니다. Overwrite 와 Merge 둘 다 확인합니다. 캐시·전역 상태 금지. 공개 API 불변. 기존 시험 기대값 변경 0건. 호출 횟수 단언은 상한으로.

## 2. 순서

1. settle DETAIL 을 코드보다 먼저 고칩니다(선언 밖 값의 같은 값 판단이 어디서 한 번 일어나는지 적은 문장; 틀리게 되는 문장만). INTENT 는 손대지 않습니다.
2. 코드를 고칩니다.
3. 시험: (가) 같은 선언 밖 값을 Overwrite 로 다시 쓰면 UpdateValue·revision·onChange 가 없고 출력·undeclaredValues 참조가 이전과 같음; (나) Merge 로 같은 값·다른 값·새 키를 쓸 때의 배달 기록과 참조가 수정 전과 같음(자기 비교 행렬); (다) sameValue 호출 수가 쓰기 한 번에 상한(예: 선언 밖 값 전체 비교 1회 이하)임을 계측으로 단언.
4. 게이트: `yarn workspace @canard/schema-form typecheck`, `lint`, `test`, `build`.
5. 측정: first-batch 러너의 A2 장면(B0·B1 한 키·모든 키, Node·Bun)을 두 바퀴 번갈아 재고 min/max 를 적습니다(수정 전 dist 는 기준 커밋 빌드). 결과 파일은 작업 폴더 architecture/verification/perf-optimization/l3c-extras-single-compare-results.md 에 두되 커밋하지 않고 경로만 보고. 측정 중 다른 게이트·빌드 금지.
6. 커밋 둘(`docs(schema-form): ...` DETAIL 만, `perf(schema-form): ...` 코드+시험). 본문에 "codex 구현" 한 줄. 공동 저자·세션 ID·"Claude-Session" 줄 금지. 사용자의 법적 이름 금지.
7. push 뒤 `gh pr create --repo vincent-kk/albatrion --base feat/schema-form-08-review-and-perf --title "..." --body-file <파일>`. 본문에 규칙 한 문장, 호출자 추적 표(path:line 과 의존 여부), 측정 표, 같은 값 관측 유지 증거. 병합하지 않습니다.

## 3. 보고 (worker_done)

성공: --outcome succeeded. 요약에 가지 이름, 기준 커밋, 커밋 해시 둘, PR 번호·URL, 게이트 네 개 결과, 측정 표 경로, 바뀐 파일 목록, 기존 시험 기대값 변경 0건, 추가·제거 줄 수(런타임과 시험 따로), 호출자 추적 결론 한 문장.

중단(어느 호출자가 참조 되살림에 의존해 비교를 한 번으로 만들 수 없음, 추가 코드가 제거보다 큼, 같은 값 관측이 깨짐, 측정이 모든 행에서 악화): 고치지 말고 --outcome failed 와 근거(path:line, 수치)로 보고.
