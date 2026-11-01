# G26-148: 공식 React update 절차 재대조

공식 136k 절차의 현재 wall gap은 `array-push-100 +7.076580 ms`, `array-replace-200 +8.840917 ms`, `array-push-remove-100 +9.852989 ms`입니다. push 계열은 작은 gap 쪽을 재현했습니다. 두 push 행이 모두 정확히 `+7~8 ms`인 것은 아니며, 이번 결과는 약 `+7~10 ms`입니다. 공식 절차에서 `+16~18 ms`는 재현되지 않았습니다.

`drainTicks(2)` wall 배율은 같은 fixture 순서로 `1.688641× / 1.108735× / 1.547835×`입니다. 이 lane은 공식 wall·active lane과 별도로 측정했습니다.

## 1. 환경과 번들

| 항목 | 확인값 |
| --- | --- |
| Node 실행 파일 | `{node-home}/versions/node/v26.11.1/bin/node` |
| Node / V8 | `v26.11.1 / 14.6.202.34-node.37` |
| CPU / 메모리 / OS | `Apple M1 Max / 68719476736 bytes (64 GiB) / Darwin 25.6.0 arm64` |
| React / react-dom / esbuild | `19.2.6 / 19.2.6 / 0.25.9` |
| 저장소 | `{repo}` |
| 현재 HEAD | `34b370eedcc293e704ad3a57c5a02612ddad200f` |
| 현재 HEAD의 실제 src tree | `478434371c1d23f4345b81cfafa33fb762ba019a` |
| `b1035b73b` src tree | `fc6685b6baf5452eb838ef4bfa40e26cbaea2158` |
| 136k의 `aa1433cba` src tree | `80c23cc2d0e389cc5e925b434a2d7a228d8532f0` |
| 측정 설정 | production profiling React, validation OFF, `--expose-gc`, 제품 계측 없음 |
| Git 상태 | 시작과 종료 모두 clean; HEAD와 src tree 동일 |

요청에 기재된 `fc6685b6…`는 이전 HEAD의 tree입니다. 현재 HEAD의 타입 단언 제거 때문에 tree ID는 바뀌었습니다. 공식 빌더를 현재 HEAD와 `b1035b73b`에 각각 적용한 두 React 번들은 전체 bytes와 SHA-256이 동일했습니다. 이 확인에는 checkout이나 Git 쓰기를 사용하지 않았으며 `git show <commit>:<path>`로 blob을 읽었습니다.

| 번들·파일 | bytes | SHA-256 |
| --- | ---: | --- |
| 이번 공식 HEAD: `react-official-head.cjs` | 895723 | `8ff383c3032130c1b32ceb4db5881f7de572ae09b11f76ce95ae4959a90a18ca` |
| 같은 공식 빌더의 이전 HEAD: `react-official-b103.cjs` | 895723 | `8ff383c3032130c1b32ceb4db5881f7de572ae09b11f76ce95ae4959a90a18ca` |
| 보존된 136k HEAD: `diag/official-136k.cjs` | 895469 | `10d83155a1182622f6b57e966a60200a04d6ce5f9ecb2804fd5837933ba8a309` |
| stage-1 주 측정 HEAD: `diag/stage1-current.cjs` | 910192 | `fe622cd4e13d94a060e441d0ef82d9fe6b818e6e0ba1ac1e1b9348b9855a8718` |
| stage-1 주 측정 구판 harness: `old-published.cjs` | 25929 | `de8c87160a9c84ee914698bcf1ddd941075c256b7876449288490dab285cc926` |
| 실제 실행한 공개판 ESM: `@canard/schema-form_0.16.0/dist/index.mjs` | 247510 | `78362ee2e5b7c0bdca5f9b80f7490c32a54ea344565e97c2b4088080a3c861b2` |
| 공개판 CJS 참고 해시: `dist/index.cjs` | 257733 | `19b9be1d81803928ead079d7ef225c61dc71ba8fdb1cf3f19d8926ebd28c44e2` |
| 보존된 131/136i 계열: `r136-final.cjs` | 963333 | `1d0ad52295ebb91e590d12f4119e5d5e4170ec23dc61f7b08aac7cdc7b6958cb` |
| 보존된 131/139 계열: `r139.cjs` | 963587 | `1756485ae182ea5b537544c866a7d4c474984c7ed8a9cfb8c56c6e43185806cd` |

`1756485a…`는 131/139 계열의 번들입니다. 이번 공식 136k 빌더의 entry와 번들 구성은 달라서 `8ff383c3…`가 나옵니다. 사용자가 제공한 standalone core `0e5bf3c3…`는 별도 재빌드·재측정하지 않았습니다. 필요한 공식 React 번들은 현재 worktree의 committed HEAD에서 새로 준비했습니다.

원본 `measure-react-136k.mjs` SHA-256은 `921e775001823ff3b1296ffba1a1a3324eb9564f1fa4b2a3117425d4ca84c136`, 공식 사본 `measure-official.mjs`는 `5a822d19dd65fbc2773dba51dc0fcf4fe7157aea95d4e33e468de88e62f62025`입니다. 구판은 이미 설치된 공개판을 사용했으며 외부 fetch·설치를 하지 않았습니다.

환경 근거는 [environment-before.json](environment-before.json), 빌드 근거는 [official-raw/react-bundle.json](official-raw/react-bundle.json), 이전 HEAD 근거는 [previous-head/react-bundle.json](previous-head/react-bundle.json), 번들·dependency 연결 근거는 [comparison-evidence.json](comparison-evidence.json)에 있습니다.

## 2. 공식 절차와 실제 명령

읽은 정본은 `packages/canard/schema-form/architecture/verification/07-switch/profile-136k-final.md`, 같은 디렉터리의 `performance.md` 중 “React production profiling 공식 표”와 “render-update-wall”, 보존된 `measure-react-136k.mjs`와 `session-136k-driver.mjs`입니다. 저장소에 링크만 남고 JSON이 없는 일부 136k 산출물은 보존된 scratch의 `session-136k/` 원시 파일과 driver를 직접 읽었습니다.

`measure-official.mjs`는 원본의 HEAD 단언, raw·bundle 경로, Node 단언과 calibration-all의 대상 fixture 선택만 바꿨습니다. 세 fixture 외의 보정을 생략한 것은 요청 범위에 맞춘 선택입니다. 각 worker 내부의 별도 보정, 측정 코드, 예열·표본 수, commit·값·DOM 경로 단언은 유지했습니다. 원본 raw의 오래된 `source` 설명 문자열은 실행 로직이 아니며, 실제 입력은 HEAD 단언과 `git show` 및 번들 해시로 확인했습니다.

빌더는 `write:false`, `sourcemap:false`, `bundle:true`, `packages:'external'`, `platform:'node'`, `format:'cjs'`, `jsx:'automatic'`, `NODE_ENV='production'`을 사용합니다. 공식 stdin entry는 `equivalentFixtures`, `mountEquivalentForm`, `applyInteraction`, `setupJsdom`, `drainTicks`를 export합니다. 제품과 benchmark TypeScript는 committed HEAD blob에서 읽고, `mountEquivalentForm`에 원 절차의 mount ELU 시계만 연결합니다. `react-dom/client`는 설치된 `react-dom/profiling`으로, 구판은 공개판 ESM의 절대 file URL로 연결합니다. esbuild service는 측정 전에 EOF로 자연 종료했으며 code 0 / signal null을 확인했습니다.

실행 순서는 아래와 같습니다.

1. 공식 `--prepare` 한 번.
2. calibration-all: immediate 구판 → immediate HEAD → record 구판 → record HEAD. 각각 요청한 세 fixture만 보정합니다.
3. immediate lane: push → replace → push/remove, 각 fixture에서 r1 → r2 → r3.
4. record lane: 같은 fixture·회차 순서. `--old-wait`를 사용합니다.
5. 각 pair의 버전 순서는 r1 구판→HEAD, r2 HEAD→구판, r3 구판→HEAD입니다. fixture·버전·회차·lane마다 새 worker를 사용합니다.

각 worker는 보정 1회 후 fresh schema clone·fresh mount로 예열 20회와 유효 표본 101회를 실행합니다. 공식 순서는 **clone → 강제 GC → mount → 초기 값·DOM 관측 → update → 최종 관측 → teardown**입니다. GC와 mount는 update 시계 밖입니다. update의 각 authored write를 `flushSync`로 실행하고 setImmediate 4회를 inline으로 기다린 다음 wall과 ELU active를 기록해 전체 sequence 값을 합산합니다. record lane은 같은 위치에서 `drainTicks(2)`를 기다리는 별도 fresh-process pass입니다. 실제 `drainTicks(2)` 구현은 `setTimeout(...,0)` 두 tick입니다.

판별·fixture별·metric별 표본은 `101 × 3 = 303`개입니다. pooled nearest-rank median은 정렬한 303개 중 152번째, p99는 300번째입니다. ratio는 pooled HEAD median / pooled 구판 median, gap은 두 pooled median의 차입니다. 회차 median을 평균하거나 두 lane을 합치지 않았습니다.

실제 shell 호출의 공통 설정과 command 형태는 다음과 같습니다. 모든 호출은 각각 별도 command로 실행했습니다. 전체 fixture·회차·버전·진단 flag와 시각은 [commands.json](commands.json)에 실제 argv 그대로 있습니다. pair가 실행한 두 worker의 순서와 결과는 `official-raw/pair-*.json`에 있습니다.

```sh
task_node={node-home}/versions/node/v26.11.1/bin/node
task_repo={repo}
task_out={scratch}/g26-148/control

cd "$task_repo"
"$task_node" --version
"$task_node" "$task_out/run-command.mjs" prepare --expose-gc "$task_out/measure-official.mjs" --prepare array-push-100 1 HEAD
"$task_node" "$task_out/run-command.mjs" calibration-immediate-0.16.0 --expose-gc "$task_out/measure-official.mjs" --calibrate-all 0.16.0
"$task_node" "$task_out/run-command.mjs" calibration-immediate-HEAD --expose-gc "$task_out/measure-official.mjs" --calibrate-all HEAD
"$task_node" "$task_out/run-command.mjs" calibration-record-0.16.0 --expose-gc "$task_out/measure-official.mjs" --calibrate-all 0.16.0 --old-wait
"$task_node" "$task_out/run-command.mjs" calibration-record-HEAD --expose-gc "$task_out/measure-official.mjs" --calibrate-all HEAD --old-wait

# Actual r1 examples; all 18 pair argv are recorded in commands.json.
"$task_node" "$task_out/run-command.mjs" pair-immediate-array-push-100-r1 --expose-gc "$task_out/measure-official.mjs" --pair array-push-100 1
"$task_node" "$task_out/run-command.mjs" pair-record-array-push-100-r1 --expose-gc "$task_out/measure-official.mjs" --pair array-push-100 1 --old-wait

# Committed previous HEAD preparation, without changing the checkout.
"$task_node" "$task_out/run-command.mjs" prepare-b103 --expose-gc "$task_out/prepare-previous-head.mjs" --prepare array-push-100 1 HEAD

# Crossover examples; subsequent interventions also have exact argv in commands.json.
"$task_node" "$task_out/run-command.mjs" diag-official-stage1-current-array-push-100 --expose-gc "$task_out/measure-cross.mjs" --worker array-push-100 1 HEAD --out="$task_out/diag/official-stage1-current" --bundle="$task_out/diag/stage1-current.cjs"
"$task_node" "$task_out/run-command.mjs" diag-stage-official-current-array-push-100 --expose-gc "$task_out/measure-stage-cross.mjs" HEAD array-push-100 plain cross --out="$task_out/diag/stage-official-current" --provenance="$task_out/diag/official-current-provenance.json"
```

wrapper는 child process group에 450초 종료 guard를 적용합니다. 공식 worker의 원래 205초 자기 종료 단언과 pair의 worker <220초 단언도 유지했습니다. 측정은 하나씩 실행했고 yarn/npm/pnpm/bun/npx, 설치, Git 쓰기, 저장소 파일 쓰기를 수행하지 않았습니다. 원시 파일·harness 사본·로그·보고서는 모두 이 control 디렉터리에 있습니다.

## 3. 공식 재측정 표

단위는 ms입니다. median/p99의 `/`는 두 quantile을 뜻합니다. 회차 열은 **구판 r1,r2,r3; HEAD r1,r2,r3** 순서입니다. 마지막 열은 보존된 136k 원시 303표본에서 다시 계산한 비교값입니다.

### array-push-100

| metric | 0.16.0 median/p99 | HEAD median/p99 | ratio | gap ms | 회차별 median: 구판; HEAD | 공식 136k: 구판 median/p99; HEAD median/p99 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| wall | 84.907210 / 98.230663 | 91.983790 / 100.166330 | 1.083345× | +7.076580 | 85.977459, 84.169411, 83.934167; 91.912713, 92.093169, 91.768791 | 84.888170 / 93.560671; 91.837088 / 103.719376 |
| active | 84.953041 / 98.303539 | 92.036875 / 100.228550 | 1.083385× | +7.083834 | 86.024041, 84.214040, 83.983790; 91.954452, 92.131878, 91.809748 | 84.928706 / 93.627210; 91.888543 / 103.790207 |
| drainTicks(2) wall | 244.504002 / 264.642588 | 412.879541 / 506.759162 | 1.688641× | +168.375539 | 244.168292, 244.678085, 244.398585; 421.997461, 424.188507, 396.646168 | 244.960125 / 269.229796; 422.117330 / 504.460585 |

### array-replace-200

| metric | 0.16.0 median/p99 | HEAD median/p99 | ratio | gap ms | 회차별 median: 구판; HEAD | 공식 136k: 구판 median/p99; HEAD median/p99 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| wall | 105.310958 / 112.090125 | 114.151875 / 119.988083 | 1.083951× | +8.840917 | 105.142417, 104.464292, 106.165333; 113.445500, 113.217666, 115.704041 | 106.484833 / 114.557041; 113.781459 / 119.517500 |
| active | 105.314542 / 112.094625 | 114.155875 / 119.992000 | 1.083952× | +8.841333 | 105.146375, 104.468542, 106.168917; 113.449459, 113.223666, 115.710834 | 106.489375 / 114.562625; 113.786000 / 119.521417 |
| drainTicks(2) wall | 106.229083 / 114.379041 | 117.779875 / 127.812208 | 1.108735× | +11.550792 | 106.381417, 106.097250, 106.065125; 118.467083, 116.744833, 117.919708 | 106.874000 / 113.323041; 116.002416 / 120.992708 |

### array-push-remove-100

| metric | 0.16.0 median/p99 | HEAD median/p99 | ratio | gap ms | 회차별 median: 구판; HEAD | 공식 136k: 구판 median/p99; HEAD median/p99 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| wall | 123.456713 / 133.011168 | 133.309702 / 152.495256 | 1.079809× | +9.852989 | 123.585592, 122.097130, 123.980824; 131.829538, 132.403656, 136.032452 | 122.520421 / 134.351551; 130.759743 / 142.729168 |
| active | 123.517831 / 133.089334 | 133.401370 / 152.579788 | 1.080017× | +9.883540 | 123.650997, 122.170455, 124.045586; 131.921035, 132.479915, 136.101122 | 122.595790 / 134.449879; 130.823046 / 142.823585 |
| drainTicks(2) wall | 576.298174 / 679.499992 | 892.014216 / 1085.890756 | 1.547835× | +315.716042 | 581.555300, 576.298174, 573.699874; 893.847327, 899.571369, 884.510166 | 583.081294 / 702.370006; 877.294755 / 1080.754757 |

세 fixture의 wall·active는 모든 회차에서 HEAD median이 구판보다 컸습니다.

## 4. harness 차이 비교와 추가 실험

추가 실험은 설정마다 새 worker, warmup 20, samples 101, React production profiling, validation OFF, inspector CPU profiling OFF입니다. 공식 303표본에 추가하지 않았습니다. 단일 block의 median이며 작은 차이의 유의성이나 A/A 판정에는 사용하지 않습니다.

### 구현의 구체적인 차이

| 항목 | 공식 136k | stage-1 주 측정 | 131 / A/A 136i |
| --- | --- | --- | --- |
| HEAD / 구판 module | bundled CJS / 공개 ESM dynamic import | 같은 형식 | HEAD 한 bundle을 사용하는 A/A |
| `@winglet/*` | external | p 접두 주 측정도 external; r 접두 보조만 inline | 원 prepare의 inline 구성 |
| load | `new Function(...)(bfRequire,...)` | CJS `require(file)`, package require banner | `loadBundle131`도 `new Function` |
| HEAD 초기화 | 첫 mount의 dynamic import | 미사용 render-count entry의 eager `init_src()` | render-count entry 포함 |
| process | fixture·version·round·lane마다 새 process | 같은 주 측정 layout; plain/profile 별도 process | 실제 136i는 formsPerProcess 1, samples 41, warmup 20, 8/24 blocks |
| GC / clone / mount 전 drain | clone → GC → mount | GC → 4×setImmediate → clone → mount | GC → drain → clone → mount |
| update drain | 4×setImmediate inline await | 같은 4 callback을 async `drain()`으로 await | async `drain()` 사용 |
| update loop / 기록 | indexed loop, wall·ELU, 4 fields/write | entries loop, wall·ELU에 hrtime window·kind/index 추가 | entries loop, telemetry/window 있음 |
| 초기·최종 값 정규화 | 재귀 clone한 object | JSON.stringify replacer·localeCompare; string 보관 | 재귀 정규화; telemetry 있음 |

package와 benchmark의 `createRequire`에서 HEAD가 쓰는 모든 external Winglet specifier가 같은 realpath로 해결됐습니다. `comparison-evidence.json`에 파일 SHA도 있습니다. stage-1의 “profiling OFF”는 inspector CPU profiler를 연결하지 않는 plain lane입니다. React production profiling이나 React Profiler를 끈다는 뜻이 아닙니다.

### bundle과 harness 교차 연결

단위는 ms, HEAD wall median입니다. 공식 303값 외에는 각 101표본입니다.

| harness / HEAD bundle | push | replace | push/remove |
| --- | ---: | ---: | ---: |
| 공식 / 새 공식 bundle (303) | 91.984 | 114.152 | 133.310 |
| 공식 / stage-1 bundle | 91.489 | 113.427 | 130.726 |
| stage-1 / 공식 bundle | 102.520 | 115.413 | 154.119 |
| stage-1 / stage-1 bundle, 이번 재실행 | 101.619 | 113.958 | 147.353 |
| 공식 / stage-1 bundle, eager `init_src()` 한 줄만 제거 | 91.252 | 115.033 | 131.084 |
| 공식 / 보존한 136k bundle (src tree `80c23cc…`) | 91.978 | 118.032 | 132.549 |
| 공식 / 새 공식 bundle, CJS `_compile` loader 사용 | 92.037 | 114.493 | 131.514 |

stage-1에서 공식 bundle을 require하는 banner는 dependency 해결을 설정하는 한 줄뿐이며 나머지 bytes는 공식 bundle과 같습니다. CJS loader 대조는 미변경 공식 bundle text를 `Module._compile`에 전달하고 require 해결 기준을 고정했습니다. eager-init 대조는 harness에서 생성한 entry call만 제거했으며 제품 구현은 편집하지 않았습니다.

큰 push 차이는 bundle 교환 후에도 harness 쪽에 남았습니다. eager 초기화, CJS vs new Function, external Winglet 해결 경로, 후속 src 변경만으로 이 차이를 설명할 수 없습니다. 136i는 136k와 같은 제품 src tree 세대에서도 forced-GC update-wall이 push `102.199 / 104.705`, push/remove `148.968 / 147.166`, replace `115.095 / 115.480 ms`였습니다. 같은 제품 세대에서 다른 측정 loop가 이미 다른 값을 냈다는 근거입니다. 보존한 역사 bundle의 replace 단일 대조는 `118.032 ms`였으므로, 이 대조를 모든 행의 엄밀한 source A/A라고 해석하지 않습니다.

### GC·clone·pre-drain 및 update loop 대조

stage-1의 주 HEAD bundle을 고정했습니다. 단위는 ms, HEAD wall median, 각 101표본입니다.

| stage-1 변경 | push | push/remove |
| --- | ---: | ---: |
| GC 순서 flag 추가 baseline, 원래 순서 | 102.009 | 153.844 |
| clone만 GC 앞으로 이동 | 102.463 | 146.380 |
| mount 전 추가 drain만 제거 | 102.104 | 145.181 |
| 위 두 변경 동시 적용 | 101.785 | 152.842 |
| write loop만 indexed로 변경 | 102.280 | 146.310 |
| update 4×setImmediate만 inline으로 변경 | 101.470 | 151.594 |
| indexed + inline | 106.250 | 146.094 |

어느 변경도 push를 공식 약 92 ms 수준으로 돌려놓지 않았고, push/remove도 공식 약 131~133 ms 수준으로 돌려놓지 않았습니다. 단일 block의 push/remove에는 약 145~154 ms 변동이 있습니다. 예를 들어 pre-drain 제거의 약 9 ms 차이를 그대로 인과적인 절감량으로 단정할 수 없습니다. 두 변경을 함께 적용했을 때 같은 개선이 나타나지도 않았습니다.

### 추가 시계·inspector 준비 대조

같은 stage-1 주 HEAD bundle과 sequence를 사용했습니다. 단위는 ms, HEAD wall median, 각 101표본입니다.

| stage-1 변경 | push | push/remove |
| --- | ---: | ---: |
| timed 구간의 두 `hrtime.bigint()` 호출 제거 | 106.354 | 146.865 |
| inspector import와 미접속 Session 생성 제거 | 102.092 | 155.120 |
| 위 두 변경 동시 적용 | 102.765 | 146.147 |

이 변경들도 공식 수준을 재현하지 못했습니다. inspector CPU profiler의 ON/OFF나 추가 시계 호출만을 확정 원인으로 지목할 근거가 없습니다. 모든 추가 실험의 wall·active·p99, bundle SHA, commit 검사 수는 `analysis.json`의 `diag`에 있습니다. 모든 공식형 교차 대조의 값·DOM digest는 공식 baseline과 같고, stage형 대조는 원 stage-1 baseline digest와 같음을 검증했습니다.

## 5. 확립한 사실과 남은 불명점

공식 절차의 현재 값은 약 +7~10 ms입니다. stage-1의 약 +16~18 ms를 공식 값 대신 사용할 수 없습니다. replace는 이번에 +8.841 ms였고 wall과 active가 같은 방향을 보였습니다. drainTicks(2)는 다른 종료점을 측정하는 기록 lane이므로 공식 wall gap으로 환산하거나 더하지 않습니다.

교차 실험으로 큰 push 차이를 측정 harness의 loop 쪽으로 좁혔습니다. 어떤 단일 요인이 잔차를 만드는지는 확정하지 못했습니다. script 분할·async scope, canonicalization·보관 object, write 기록량·할당, V8 최적화와 GC 상호작용은 직접 분리 측정하지 않았습니다. 이들은 미검증 후보이며 확정 원인으로 취급하지 않습니다.

작은 차이를 엄밀하게 귀속하려면 반전 순서의 여러 block A/A와 같은 harness에서 할당·JIT/GC 진단이 필요합니다. 추가 실험은 원인을 좁히는 단일 block이며 공개 성능의 새 판정 절차가 아닙니다. 136i / 139a / 139b 자체를 재실행하거나 판정을 변경하지 않았습니다. CPU profile에 의한 단계별 귀속도 수행하지 않았습니다. OS 외부 부하나 thermal 상태를 고정하지 않았으므로 역사 136k 값과의 1~수 ms 차이를 제품 회귀라고 단정하지 않습니다.

## 6. 최종 검증과 저장물

공식 18 pairs / 36 workers, worker별 warmup 20 / samples 101, 행별 303표본을 확인했습니다. 공식 loop의 checkedWrites는 437052, failedWrites는 0입니다. 모든 HEAD write는 commit 1, 구판은 worker별 보정값과 일치했고 pair의 최종 값·DOM digest도 일치했습니다. 최대 공식 worker 본문은 111.2579625초였습니다.

추가 진단은 38개의 순차 worker입니다. 측정·빌드·집계의 bounded command 기록은 66개이며 각 command가 8분 이내에 정상 종료했습니다. 최종 검증의 시각·경과 시간·최대 command 시간·파일 크기는 [verification.json](verification.json)에 있습니다. 최초 Node 단언 확인은 `2026-10-11 13:35:17 UTC` (22:35:17 KST)였으며 전체 세션은 2시간 제한 이내입니다.

원시 값은 `official-raw/`, 진단은 `diag/`, 실제 argv·stdout은 `logs/`에 있습니다. [analysis.json](analysis.json)은 nearest-rank 계산과 전체 대조의 파생값입니다. [commands.json](commands.json), [verification.json](verification.json), [sha256.json](sha256.json)은 실제 command 순서, 검증 단언, 저장물 hash를 기록합니다. 공식·진단 표의 수치는 원시 quantile과 대조했으며 각 파일은 5MB 미만입니다. 저장소와 Git 상태는 변경하지 않았습니다.
