# 증거 소실과 checkout 복원 및 재취득 기록

2026-10-19. 소유자의 백업 없음 전제 재취득 지시에 따라 origin 가지에서 두 checkout을 다시 만들고 게이트·전체 시험 증거를 새 namespace에 취득했습니다. 이번 기록은 소실된 과거 원자료의 복원을 뜻하지 않으며 제품 수정·측정·P1·병합의 착수 승인을 만들지 않습니다.

## 소실 확인과 복원 가능 범위

424 인계 커밋87c8c015b76ea00b9c3e1b1eed35c705e1204898은 현지14:07에 게시됐으나 같은 날 현지22:10에는 `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`, `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity`와 임시 `mount-breakdown-task_7e0e67a1893f` 경로들이 없었습니다. 당시 Orca 목록에 albatrion child가 없었고 휴지통도 비어 있었습니다. Time Machine은 샌드박스에서 확인하지 못했습니다. 소유자는 정리 과정에서 지웠을 가능성을 말했으나 확정 원인은 확인하지 않았습니다.

origin의 `perf/schema-form-itemless-declarations` 끝282685f27aea0a82c042b4d945e2730dc9d4f9a3과 `vincent-kk/schema-form-observation-identity` 끝dfdda7f55abba36c76b0ebf57258ccb7f61f9f79는 남아 있었으며 PR423·PR424도 이 head의 OPEN Draft였습니다. Git에서 복원 가능한 것은 코드 가지이며 하위 폴더의 비공개 로컬 원자료는 git·휴지통에 없었습니다.

소실된 자료는 PR424의 `.seiri/tasks/observation-identity-portability/`(봉인355항목, SHA256 a19df224729b874c37709b5ad660a42d1a1a77fd9c6ff7cbb90eaa911e5654ca), PR423의 측정 원자료와 P1 실패 원자료입니다. 메인 `.seiri/tasks`의57항목(ledger421–424와 itemless AA 순서 probe 묶음 포함)은 남아 있습니다. 424 게시 영수증의 retainedWorktrees 주장은 이후 디스크 상태와 일치하지 않게 됐습니다.

## 다시 만든 작업환경

| 절대 경로 | 가지와 고정 상태 | 보존 사유 |
| --- | --- | --- |
| `/Users/Vincent/Workspace/albatrion` | feat/schema-form-08-review-and-perf. 인계 기준87c8c015b76ea00b9c3e1b1eed35c705e1204898. 제품 source1be215791f077fc7dc51825a357e916316193ecb | 원장 정본과 남아 있는 메인 로컬 증거입니다. |
| `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership` | vincent-kk/l3e-direct-ownership, HEAD282685f27aea0a82c042b4d945e2730dc9d4f9a3, merge-base6d7d78d32bfcd9b6822410ecec4fc769dc7aa3f5, src tree337fca70768f31ded96871fed934db370e9b7729 | PR423 checkout과 새 게이트·전체 시험 증거입니다. 같은 이름의 옛 폴더 원자료는 복구되지 않았습니다. |
| `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity-2` | vincent-kk/schema-form-observation-identity-2, HEADdfdda7f55abba36c76b0ebf57258ccb7f61f9f79, base5cfb7c74c8bfa517289673274e74c2395cb2717d | PR424 checkout과 새 baseline·head 시험 증거입니다. 옛 observation-identity 경로를 대체하는 새 checkout입니다. |

두 child는 coordinator terminal term_cf1521b2-1c36-4184-8a19-306d809755eb가 run_313832ef19e0에서 Orca로 만들었습니다. 로컬 가지는 읽기 전용 mirror이며 push하지 않았습니다. 두 폴더는 메인에서 추적 밖이며 스테이징하지 않습니다.

## 하위 checkout 환경 전제와 설치 경위

하위 checkout에는 workspace 의존 패키지의 dist가 없습니다. `yarn workspaces foreach --from @canard/schema-form --recursive --topological-dev run build` 없이 게이트를 실행하면 lint에 import/no-unresolved434건이 나오고 시험764파일 중715파일을 불러오지 못합니다. 두 child는 각각 `yarn install --immutable`을 한 번 실행했고 lockfile은 바뀌지 않았습니다.

T14 워커의 capture script가 cwd를 잘못 계산해 메인에서도 `yarn install --immutable`을 한 번 실행한 사고가 있었습니다. exit0, yarn.lock SHA256 a11dca484d6f6ad66dce8d1a708d0f3d4881ccae30716137ed0fc9ecb5e93404 불변이며 메인 tracked tree도 바뀌지 않았습니다. 해당 영수증은 T14 증거 namespace에 보존했습니다. 이 경위를 숨기거나 원장 담당자가 새 설치를 수행한 것으로 적지 않습니다.

## T14 재취득 증거와 실패 분류

정본은 `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity-2/.seiri/tasks/observation-identity-reacquire/`이며 최종 봉인 SHA256은27c9f9583ee314bdbf080d5904405b086720032a1e27d18f1864e4422450e43f, 파일81개입니다. 대상3파일26시험은 통과했고 typecheck/lint/build는 exit0/0/0입니다. base5cfb7c74c 전체 시험은759파일4785시험 통과·실패0·exit0입니다.

| head 실행 | 조건 | 결과와 한계 |
| --- | --- | --- |
| 1 | 차가운 Vite 의존 캐시, PR423 실행과 동시 | 18파일43시험 실패와 collection error1·RPC error1입니다. 실패42건은 `Failed to fetch dynamically imported module .../node_modules/.cache/storybook/10.4.1/.../sb-vitest/deps/...`였습니다. |
| 2 | 따뜻한 캐시, 동시 실행 | cx11-ime-during-switch Case·browser-gates EVENT-065·global-errors.timing 선형 시간 assertion의3시험이 실패했습니다. |
| 3 | 따뜻한 캐시, 단독, UTC13:53:40–13:55:51 | `src/core/__tests__/global-errors.timing.test.ts`의 "clears fields holding root issues one call at a time in linear time" 1시험이 실패했고760파일4808시험이 통과했습니다. |

이력46항목의 최종 분류는 contention-or-flaky(미확정)45와 head-only1입니다. head-only인 시간 assertion은 base와 head1회차에서는 통과했으나2·3회차에서 실패했으며 원인은 미확정입니다. 기대값·제품·설정은 바꾸지 않았습니다. 입력 소실로 readiness 검사는 건너뛰었습니다. 소실된 옛 결과61 failed/18 errors는 재현하지 못했으며 당시 원인을 소급해 증명하지 않았습니다.

## PR423 재취득 증거와 남은 원자료

정본은 `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership/.seiri/tasks/itemless-declarations-reacquire/`이며 최종 봉인 SHA256은912b5df4da0ad68b9f9d13eceff6f2b2878e86f6b4db422d4b6251314e3c5ce7, 파일59개입니다.

| 실행 | 조건 | 결과와 한계 |
| --- | --- | --- |
| 1 | 의존 패키지 빌드 전, 환경 무효 | typecheck0·lint1·test1·build0입니다. |
| 2 | 의존 패키지 빌드 뒤, T14와 동시 실행 | lint0입니다. 전체764파일 중746통과·18실패,4858시험 중4817통과·40실패·todo1입니다. 실패는 모두 Storybook으로 동적 모듈 fetch 오류39와 timeout1입니다. |
| 3 | 따뜻한 캐시 | 761파일 통과·3실패,4859시험 통과·4실패이며 모두 Storybook Error/TimeoutError입니다. 단독 실행은 하지 않아 경합을 배제하지 못합니다. |

측정·P1·비교 protocol은 다시 실행하지 않았습니다. PR423의136행 측정 원자료와 P1 원자료는 계속 소실 상태이며 원장의 파생 수치만 남았습니다. 새 시험 결과를 측정 원자료 복구로 간주하지 않습니다.

## 작업자와 현재 보류 범위

워커 모델은 codex gpt-6.1-sol high였습니다. PR423 task는 task_b71ba6e21e20·task_9aad2d140bfb·task_d4436c8336c4이며 T14 task는 task_1574895e5e1f·task_1e6deab81ee2·task_1b425da2e836입니다. 전달된 목록의 여섯 task는 모두 succeeded로 종결됐고 터미널은 해제되거나 Orca external terminal로 남았습니다. 브리프의 "다섯 dispatch" 표기는 열거된 여섯 ID와 수가 맞지 않으므로 집계 일치로 주장하지 않습니다.

실행 브리프는 verification/perf-optimization/l3-briefs/round-425-t14-evidence-reacquisition-brief.md와 round-425-pr423-checkout-reacquisition-brief.md이며, 원장 마감 절차는 같은 폴더의 round-425-ledger-close-brief.md입니다. 이 문서는 해당 브리프의 전달 사실을 기록하며 새 제품 검증이나 측정을 수행한 보고가 아닙니다.

owner54/58/59/60·TEST-027/M3·성능 수용·P1 전체 protocol 실패·T14 G5 및 독립 Gemini 3.8 구현 검토는 그대로 보류합니다. PR423·PR424는 미병합입니다. 제품 source1be215791f077fc7dc51825a357e916316193ecb와 제품 변경0을 유지하고 원장 마감 뒤 소유자의 다음 지시를 기다립니다.

다음 라운드 번호는426입니다.
