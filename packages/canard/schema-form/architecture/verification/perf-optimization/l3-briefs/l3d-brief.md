# L3-d 구현 brief — 이미 해석된 자식에 staticSpec 을 넘겨 두 번째 조회 제거

저장소: /Users/Vincent/Workspace/albatrion (yarn 모노레포). 패키지: packages/canard/schema-form (패키지 CLAUDE.md의 명령을 따르십시오). 작업 폴더: /Users/Vincent/Workspace/albatrion/l3e-direct-ownership (이미 있는 Orca 작업 폴더; 본 폴더 /Users/Vincent/Workspace/albatrion 은 건드리지 않습니다).

Orca 규칙: `orca orchestration run-use` 와 코디네이터 명령(run-create, worker-start, worker-release 등)을 실행하지 마십시오. 후속 메시지는 preamble 의 handle 로 `check --terminal <handle>` 만 쓰십시오. 질문은 preamble 의 ask 명령으로 하십시오.

## 0. 첫 단계: 기준 커밋 맞추기

작업 폴더에서 `git status` 가 깨끗한지 확인하고(미커밋 측정 결과 파일들과 .seiri/tasks 는 그대로 두어도 됨), `git fetch origin feat/schema-form-08-review-and-perf` 뒤 `git checkout -b perf/schema-form-static-spec-pass-through origin/feat/schema-form-08-review-and-perf` 로 새 가지를 만듭니다. 기준 커밋을 `git log -1 --oneline` 으로 확인해 보고에 적으십시오(PR #419 병합 뒤의 원장 커밋이어야 합니다). 이전 가지 perf/schema-form-extras-single-compare 는 병합되었으니 지워도 됩니다. `yarn install` 을 한 번 돌립니다.

## 1. 목표 (가설 L3-d, 정본 문서)

정본은 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## B — BN 모든 키 쓰기 격차" 절의 (a) 문단("Node 창의 유일한 (a)는 이미 해석한 자식에서 쓰지 않는 기본 인자 `staticSpec`를 다시 읽는 1000회입니다 … 2.75%")과 "### L3 가설 다섯" 표의 L3-d 행("해석한 자식에만 적용하며 해석·참조·배달 관측을 유지합니다")입니다. 먼저 이 두 곳을 읽으십시오.

비효율: 모든 키 쓰기에서 자식마다 입력을 해석할 때 `staticSpec`(src/core/engine/settle/utils/input/staticSpec.ts) 을 한 번 조회해 해석하고, 그 뒤 markWrite(또는 그 호출 사슬)가 이미 해석된 자식에 대해 기본 인자로 `staticSpec` 을 다시 조회하는데 그 결과는 쓰이지 않습니다(Node 1000키 all-keys 에서 사용 1001회·미사용 1000회; 격차의 2.75%).

반영할 것: 해석한 자식에 대해서는 첫 조회로 얻은 spec 을 인수로 넘겨 두 번째 조회를 없앱니다. 호출 경로를 먼저 path:line 으로 추적하십시오(interpretFieldNodeInput.ts, markWrite.ts, transitionSettlement.ts, loadStaticFirstTree.ts, distributeLatentValue.ts, distributeMovedLatentInput.ts 가 staticSpec 을 씁니다). 해석되지 않은 자식(해석 경로를 타지 않은 호출자)은 지금처럼 조회합니다.

먼저 지킬 조건(L3-d 행): 해석한 자식에만 적용합니다. 해석·참조·배달 관측(해석 결과, 노드 참조, UpdateValue·revision·onChange 배달 기록)이 그대로여야 합니다. 캐시 금지(인수 넘김만; 함수 밖에 spec 을 저장하지 않음). 공개 API 불변. 기존 시험 기대값 변경 0건. 호출 횟수 단언은 상한으로. 추가 코드가 제거보다 크면 중단하고 보고.

## 2. 순서

1. settle DETAIL 을 코드보다 먼저 고칩니다(해석한 자식의 spec 전달을 적은 문장; 틀리게 되는 문장만). INTENT 는 손대지 않습니다.
2. 코드를 고칩니다.
3. 시험: (가) 모든 키 쓰기 N=1000 에서 staticSpec 조회 수가 N+1 이하(상한)임을 계측으로 단언(수정 전에는 약 2N+1 로 실패해야 함); (나) 해석된 자식과 해석되지 않은 자식의 쓰기에서 배달 기록·참조가 수정 전과 같음(자기 비교 또는 전체 배달 비교 픽스처).
4. 게이트: `yarn workspace @canard/schema-form typecheck`, `lint`, `test`, `build`.
5. 측정: first-batch 러너의 B 장면(BN 모든 키 쓰기 N=1000, 가능하면 한 키도; Node·Bun)을 두 바퀴 번갈아 재고 min/max 를 적습니다(수정 전 dist 는 기준 커밋 빌드). 결과 파일은 작업 폴더 architecture/verification/perf-optimization/l3d-static-spec-pass-through-results.md 에 두되 커밋하지 않고 경로만 보고. 측정 중 다른 게이트·빌드 금지. 효과는 작을 것으로 예상(격차의 약 3%)이므로 바퀴 범위를 반드시 적습니다.
6. 커밋 둘(`docs(schema-form): ...` DETAIL 만, `perf(schema-form): ...` 코드+시험). 본문에 "codex 구현" 한 줄. 공동 저자·세션 ID·"Claude-Session" 줄 금지. 사용자의 법적 이름 금지.
7. push 뒤 `gh pr create --repo vincent-kk/albatrion --base feat/schema-form-08-review-and-perf --title "..." --body-file <파일>`. 본문에 규칙 한 문장, 호출 경로 표, 조회 수 전후, 측정 표. 병합하지 않습니다.

## 3. 보고 (worker_done)

성공: --outcome succeeded. 요약에 가지 이름, 기준 커밋, 커밋 해시 둘, PR 번호·URL, 게이트 네 개 결과, 측정 표 경로, 바뀐 파일 목록, 기존 시험 기대값 변경 0건, 추가·제거 줄 수(런타임과 시험 따로), 조회 수 전후.

중단(추가 코드가 제거보다 큼, 관측이 깨짐, 두 번째 조회가 실제로는 쓰이는 값임): 고치지 말고 --outcome failed 와 근거(path:line)로 보고.
