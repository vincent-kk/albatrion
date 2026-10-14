# 136b 세션: F-B·F-C·F-F·F-E 결합 React 판정 part 2

이번 part 2의 러너 판정은 **ADOPT**입니다. 표시 회귀 0행, 확인 회귀 0행, 채택을 막는 회귀 0행이며 유의한 이득은 6행입니다. 실행 상태는 `passed`이고 종료 표식은 `SESSION_131_OK`입니다. 판정은 지정된 5개 fixture의 선택 행에 한정합니다. 공식 판정 20행을 모두 24블록으로 측정하였으며 축소 행은 없습니다. 아래 감시 범위의 제한도 함께 적용합니다.

## 실행 환경과 입력

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- D: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`
- S: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`
- 엔진: Codex
- 번들 매니페스트 기준 리비전: `e805074de8a9cb0c072a81284a166ab985a113be`

실행 전에 `D/profile-136a-session.md`, `D/harness-131.md`, `D/fb-ff-fe-implementation.md`를 읽었습니다. 시작 작업 트리는 요청에서 깨끗한 상태로 지정되었습니다. 기존 `D/tools/run-session-131.mjs`를 한 번 실행하였으며 측정 코드 작성, git 쓰기, 설치, 제품 코드 변경, 번들 재빌드 및 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너 결과를 읽고 이 기록과 요청된 산출물을 보관하였습니다. 측정 및 결과 확인에서 사용한 Node는 모두 위 지정 경로입니다.

행 파일은 `S/rows-fb-2.json`이며 SHA-256은 `d75117981d7b782d1429f0b63131c75e1ce87c9daef508d099978aee12315ea9`입니다. 실제 선택 설정은 요청된 5개인 `flat-500/off`, `array-100/off`, `array-push-100/off`, `array-replace-200/off`, `array-push-remove-100/off`입니다. 각 설정의 16개 열을 선택하여 총 80행을 보고하였으며 공식 판정 20행과 기록 60행입니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r133-base.cjs`이고 SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. 후보 번들은 `S/bundles/r133-fbx.cjs`이고 SHA-256은 `9e4ba12ac2d9f124a88b29f4b1d12e990dcf65446c7dbf16365131d2aa54c32d`입니다. 작업 계수는 `S/session-135-counts/react-counts.json`이고 SHA-256은 `4115fc9db9ddfd598f29896de3227f4c954d2e402320068b1a51686f6db24391`입니다. A/A는 round 134에 따라 `S/session-132b/final.json`을 재사용하였으며 SHA-256은 `7c8574ce7cf6d87fb06ef85d892b8589e03af650e1a3e333b748a8d4a5ae93ff`입니다. 요청에서 명시한 `D/g27-fixes.md`의 현재 HEAD 재빌드와 기준 번들의 바이트 동일성 확인을 전제로 하며, 이번 세션에서 재빌드나 별도 A/A는 실행하지 않았습니다. 매니페스트의 기준 리비전을 현재 HEAD라고 해석하지 않습니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 하나의 로그로 보냈으며 셸의 백그라운드 프로세스를 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=verdict --lane=react \
  --rows=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/rows-fb-2.json \
  --watch-in-selection \
  --base=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r133-base \
  --candidate=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r133-fbx \
  --blocks=24 \
  --touch-counts=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-135-counts/react-counts.json \
  --aa=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132b/final.json \
  --node-version=v26.11.1 \
  --out=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136b \
  > /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136b.log 2>&1 &
```

별도의 짧은 명령으로 폴링하였으며 최초 sleep은 2초, 이후 각 sleep은 50초입니다. 각 명령은 진행 행을 한 줄 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_OK`를 함께 확인한 뒤 폴링을 종료하였으며 실행 셸의 종료 코드도 0입니다. 시작 셸은 `nice(5) failed: operation not permitted`를 출력하였지만 러너가 시작되어 사전 검사와 모든 단계를 통과하였습니다.

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. 고정 감시 fixture 중 이번 선택에 포함한 설정은 **`array-replace-200/off`**입니다. 최종 scoping에서 명시적으로 `watch`인 행과 실제 사용 블록은 다음과 같습니다.

| 감시 행 | calls | 첫 블록 | 확인 블록 |
| --- | ---: | ---: | --- |
| array-replace-200/off/profiler-mount | 19 | 24 | null |

이 감시 행은 선택 목록에 이미 들어 있어 `rowSelection.watchAdded=[]`입니다. 나머지 고정 감시 설정인 `array-500/off`, `flat-50/off`, `oneOf-20/off`, `sample-1/off`, `computed-visible-derived/off`는 이번 part 2에 포함되지 않았으며 part 1인 `D/profile-136a-session.md`에서 측정되었습니다. 두 part의 선택 설정을 합치면 고정 감시 설정 6개가 모두 포함됩니다. part 1의 `sample-1/off`와 `computed-visible-derived/off`는 명시적 `watch` 행 분류가 아닌 양수 계수의 `touched` 행으로 24블록 측정되었다는 구별을 유지합니다. 감시 설정의 범위 충족을 아직 측정하지 않은 나머지 설정이나 결합 React 전체 범위의 채택으로 해석하지 않습니다.

처음 계획과 실제 사용 블록은 모두 **80행이 24블록**입니다. 131C-01에 따라 측정한 블록을 전부 사용하였으며 79행은 `scopeReason=touched`, 1행은 `scopeReason=watch`입니다. `all-measured-blocks` 승격이나 축소 행은 없습니다.

| 실제 블록 | 설정 | 공식 판정 행 | 기록 행 |
| ---: | --- | ---: | ---: |
| 24 | flat-500/off, array-100/off, array-push-100/off, array-replace-200/off, array-push-remove-100/off | 20 | 60 |

실제 축소 행은 **0개**입니다. 모든 공식 판정 행의 관측 상태는 “관측되지 않음”이며 기록 행은 “기록”입니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너의 결과 그대로 적용하였습니다. 차이의 부호는 기준에서 후보를 뺀 값이므로 음수는 손실입니다. 131C-01의 순서통계량 구간은 모든 행에서 24블록, k=6, 포함률 하한 99.3389248848%입니다.

| 구분 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | --- | --- |
| 공식 판정 행 | 20 | 모두 24 | 각 null |
| 표시 회귀 | 0 | 해당 없음 | 해당 없음 |
| 확인 회귀 | 0 | 해당 없음 | 해당 없음 |
| 채택을 막는 회귀 | 0 | 해당 없음 | 해당 없음 |

첫 통과에서 표시된 회귀가 없어 `confirmationPlan=[]`, `report.confirmation=null`이며 독립 확인 worker는 실행하지 않았습니다. 모든 행의 `confirmBlocks`와 `confirmStatus`는 null입니다. 공식 판정 20행은 “관측되지 않음”, 기록 60행은 “기록”입니다. 확인 회귀 0행은 표시 회귀가 없어 확인 측정이 필요하지 않았다는 뜻입니다.

예를 들어 `array-replace-200/off/update-wall`의 차이 중앙값은 +2.002500500ms이나 구간 [−2.490500000, +4.770583000]ms가 0을 포함하여 유의한 변화로 표시되지 않았습니다. `array-push-remove-100/off/update-wall`도 차이 중앙값 +3.196834500ms, 구간 [−8.906803000, +8.635473000]ms로 0을 포함합니다. 두 행은 첫 24블록이며 확인 블록은 모두 null입니다.

## 유의한 이득

유의한 이득은 **6행**입니다. 아래는 `report.gains`에 있는 공식 판정 행만 기록한 것입니다. 양의 값은 기준보다 후보가 빠르다는 뜻이며 차이 중앙값과 구간은 블록 차이 통계입니다.

| 행 | 차이 중앙값(ms) | 구간(ms) | 첫 블록 | 확인 블록 |
| --- | ---: | --- | ---: | --- |
| array-100/off/mount-wall | 2.023875 | [0.191583, 3.434167] | 24 | null |
| array-100/off/mount-active | 2.037230 | [0.190083, 3.229126] | 24 | null |
| flat-500/off/mount-wall | 1.975896 | [0.158958, 4.391750] | 24 | null |
| flat-500/off/mount-active | 1.979584 | [0.039251, 4.442793] | 24 | null |
| flat-500/off/update-wall | 0.499667 | [0.167581, 0.656001] | 24 | null |
| flat-500/off/update-active | 0.499354 | [0.168208, 0.661458] | 24 | null |

여섯 행 모두 구간 전체가 0 위에 있고 차이 중앙값이 러너의 행별 A/A·0.5% 하한을 넘었습니다. 같은 fixture의 wall과 active는 별개 보고 열이며 독립된 여섯 시나리오를 뜻하지 않습니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다. 나머지 공식 판정 행의 유의한 이득은 보고되지 않았습니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 적용 결과, **면제된 회귀는 없습니다**. 표시 회귀 자체가 없어 면제 대상과 `report.exemption.rows`가 모두 비어 있습니다. `axisGainMs=0`, `regressionTotalMs=0`입니다. 면제 객체의 `provisional=true` 및 기록용 label은 실제 행에 면제를 부여했다는 뜻이 아닙니다.

| fixture | 마운트 행의 calls | 갱신 행의 calls |
| --- | ---: | ---: |
| flat-500 | 3,512 | 100 |
| array-100 | 2,819 | 20 |
| array-push-100 | 19 | 3,800 |
| array-replace-200 | 19 | 5,610 |
| array-push-remove-100 | 19 | 5,600 |

작업 계수는 공식 wall·active 열과 해당 단계의 기록·no-GC 열에 적용됩니다. 선택한 80행의 계수는 모두 양수이며 각 설정을 모두 24블록으로 측정하였습니다. 계수는 런타임 작업 수 차이의 계수이고 시간이나 절감량으로 해석하지 않습니다.

## part 2의 결정

러너 판정은 **ADOPT**입니다. 선택된 5개 fixture의 공식 판정 20행에서 채택을 막는 회귀가 표시되지 않았습니다. 유의한 이득은 위 `array-100/off`의 마운트 wall·active 2행과 `flat-500/off`의 마운트·갱신 wall·active 4행에 한정합니다. 공식 판정 행은 모두 24블록이며 축소 측정은 없습니다. 이번 결정은 part 2의 선택 행 및 실제 포함된 감시 행에 한정하며, 위 감시 범위의 제한을 유지합니다. 개별 F-B·F-C·F-F·F-E의 기여로 분해하거나 아직 측정하지 않은 part의 채택을 주장하지 않습니다.

## 시간 분해와 예산

시작 시각은 최종 JSON의 `environment.startedAt` 기준 2026-10-10 23:07:46.537 KST, 종료 시각은 2026-10-11 00:21:45.437 KST입니다. 최종 JSON의 `time.totalMs=4438899.1516660005`에 따른 wall time은 **4,438.899초**, 즉 **73분 58.899초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 기록 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

첫 통과의 사전 추정은 4,021.117초이고 확인 여유는 1,200.000초입니다. 합계 5,221.117초가 시작 시 남은 예산 7,099.930초 안에 들어가 사전 검사를 통과하였습니다. 표시 회귀가 없어 확인 직전의 추가 예산 검사는 필요하지 않았습니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 4,438.851 |
| 독립 확인 구간: `time.confirmMs` | 0.000 |
| 보고 계산: `time.reportMs` | 0.048 |
| 전체 wall time | 4,438.899 |

`time.confirmMs`의 원값 0.002457999624311924ms는 확인 분기의 부수 비용이며 독립 확인 측정은 0개입니다. 첫 통과 worker 240개가 순차 실행되었고 worker wall time의 합은 4,437.635초입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 62.418 |
| 예열 | 1,459.939 |
| 강제 GC | 145.906 |
| 시계 밖 minor GC | 20.270 |
| 표본 | 2,844.433 |
| digest | 289.692 |
| React 보정 | 51.004 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-136b-session/summary.md)
- [러너의 최종 JSON gzip](./profile-136b-session/final.json.gz)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-136b-session/raw-sha256.txt)

최종 JSON 원본은 14,631,868바이트로 5MB를 초과하여 gzip으로 보관하였습니다. 보관한 gzip은 350,940바이트이고 요약 원본은 12,100바이트이므로 두 산출물 모두 5MB 이하입니다. `raw-sha256.txt`는 러너의 `sha256.txt`를 그대로 복사한 76,942바이트 목록이며 경로는 원 세션 디렉터리 기준입니다. 원자료와 실행 로그 `S/session-136b.log`는 S의 원 세션에 남아 있습니다.

압축을 풀어 원본 JSON과 바이트 동일성을 확인하였습니다. 요약 및 SHA-256 목록도 원본과 바이트가 같습니다. 압축 해제한 JSON의 SHA-256은 `66670f7520bf85b7685871d7c2722e606fb770755f54f68b9f99f475cfb14b45`입니다.
