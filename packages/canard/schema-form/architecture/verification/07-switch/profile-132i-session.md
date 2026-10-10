# 132i 세션: F-D′ React 판정 part C

이번 part C의 러너 판정은 **ADOPT**입니다. 표시 회귀 0행, 확인 회귀 0행, 채택을 막는 회귀 0행이며 유의한 이득은 2행입니다. 실행 상태는 `passed`이고 종료 표식은 `SESSION_131_OK`입니다. 판정은 지정된 `array-1000/off`의 선택 행에 한정합니다. 실제 축소 행은 0개이며 아래 감시 범위의 제한도 함께 적용합니다.

## 실행 환경과 입력

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- D: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`
- S: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`
- 엔진: Codex
- 기준 리비전: `af057ab024668315f9fad441c60dd6a6c38f0f36`

실행 전에 `D/profile-132h-session.md`와 `D/harness-131.md`를 읽었습니다. 시작 작업 트리는 요청에서 깨끗한 상태로 명시되었습니다. 기존 `D/tools/run-session-131.mjs`를 한 번 실행하였으며 측정 코드 작성, git 쓰기, 설치, 제품 코드 변경, 번들 재빌드 및 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너 결과를 읽고 이 기록과 요청된 산출물을 보관하였습니다. 측정 및 결과 확인에서 사용한 Node는 모두 위 지정 경로입니다.

행 파일은 `S/rows-fd-d.json`이며 SHA-256은 `2e4b599f458fb220cd6750bb9e2c89fca2c8961996ea3195fa648a28b33c8497`입니다. 선택 설정은 `array-1000/off`입니다. 이 설정의 16개 열을 선택하여 총 16행을 보고하였으며 공식 판정 4행과 기록 12행입니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r132-base.cjs`이고 SHA-256은 `43b1dac346a93ca4fc751d0d979b6a0f322e2c8761405d2318879cfc556f0b1c`입니다. 후보 번들은 `S/bundles/r132-fdp.cjs`이고 SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. 작업 계수는 `S/session-132g-counts/react-counts.json`이고 SHA-256은 `a8d5aa17d280dcda7b5d212613a3d16f11339e8115354c91a6be772cc3769d44`입니다. A/A는 session 132c의 `react-129-array-1000`, `S/session-132c/final.json`을 사용하였으며 SHA-256은 `d14093e382ebbf89d9c72e0f31df1d69198622d8f4b4ab1253113c502b363604`입니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 하나의 로그로 보냈으며 셸의 백그라운드 프로세스를 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=verdict --lane=react \
  --rows=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/rows-fd-d.json \
  --watch-in-selection \
  --base=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r132-base \
  --candidate=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r132-fdp \
  --blocks=24 \
  --touch-counts=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132g-counts/react-counts.json \
  --aa=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132c/final.json \
  --node-version=v26.11.1 \
  --out=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132i \
  > /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132i.log 2>&1 &
```

별도의 짧은 명령으로 폴링하였으며 최초 sleep은 2초, 이후 각 sleep은 50초입니다. 각 명령은 진행 행을 한 줄 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_OK`를 함께 확인한 뒤 폴링을 종료하였으며 실행 셸의 종료 코드도 0입니다. 시작 셸은 `nice(5) failed: operation not permitted`를 출력하였지만 러너가 시작되어 사전 검사와 모든 단계를 통과하였습니다.

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. 이번 선택의 `array-1000/off`는 고정 감시 설정에 해당하지 않으므로 `watch` 행은 0개이며 `rowSelection.watchAdded=[]`입니다. 고정 감시 설정인 array-500, array-replace-200, flat-50, oneOf-20, sample-1, computed-visible-derived는 이번 part C의 범위 밖입니다. 이번 기록만으로 분할 세션 전체의 감시 범위 충족이나 F-D′ React 전체 범위의 채택을 주장하지 않습니다.

처음 계획은 마운트 8행이 24블록, 갱신 8행이 8블록이었습니다. 설정별 worker가 공유한 모든 측정 블록을 사용하는 131C-01에 따라 **16행 모두 실제 24블록**입니다. 갱신 8행은 `scopeReason=all-measured-blocks`로 승격되었습니다. 마운트 8행의 `scopeReason`은 `touched`입니다.

| 실제 블록 | 설정 | 공식 판정 행 | 기록 행 |
| ---: | --- | ---: | ---: |
| 24 | array-1000/off | 4 | 12 |
| 8 | 해당 없음 | 0 | 0 |

실제 축소 행은 **0개**입니다. 계획상 8블록이었던 갱신 행에도 측정한 24블록을 모두 사용했으므로 “줄인 검출력에서 관측되지 않음” 상태의 공식 판정 행은 없습니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너의 결과 그대로 적용하였습니다. 차이의 부호는 기준에서 후보를 뺀 값이므로 음수는 손실입니다. 131C-01의 순서통계량 구간은 모든 행의 24블록에서 k=6, 포함률 하한 99.3389248848%입니다.

| 구분 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | --- | --- |
| 공식 판정 행 | 4 | 각 24 | 각 null |
| 표시 회귀 | 0 | 해당 없음 | 해당 없음 |
| 확인 회귀 | 0 | 해당 없음 | 해당 없음 |
| 채택을 막는 회귀 | 0 | 해당 없음 | 해당 없음 |

첫 통과에서 표시된 회귀가 없어 `confirmationPlan=[]`, `report.confirmation=null`이며 독립 확인 worker는 실행하지 않았습니다. 모든 행의 `confirmBlocks`와 `confirmStatus`는 null입니다. 공식 판정 4행의 회귀 관측 상태는 “관측되지 않음”, 기록 12행의 상태는 “기록”입니다. 이득 여부는 아래 `report.gains`에 별도로 기록합니다.

`array-1000/off/mount-wall`의 차이 중앙값은 +3.017082500ms이나 구간 [−1.409209000, +6.143625000]ms가 0을 포함하여 유의한 변화로 표시되지 않았습니다. `array-1000/off/mount-active`도 차이 중앙값 +3.929020501ms, 구간 [−0.779250946, +6.384375036]ms로 0을 포함합니다. 두 행 모두 첫 24블록이며 확인 블록은 null입니다.

## 유의한 이득

유의한 이득은 **2행**입니다. 아래는 `report.gains`에 있는 공식 판정 행만 기록한 것입니다. 양의 값은 기준보다 후보가 빠르다는 뜻이며 차이 중앙값과 구간은 블록 차이 통계입니다.

| 행 | 차이 중앙값(ms) | 구간(ms) | 첫 블록 | 확인 블록 |
| --- | ---: | --- | ---: | --- |
| array-1000/off/update-wall | 0.071168 | [0.030417, 0.107666] | 24 | null |
| array-1000/off/update-active | 0.070417 | [0.032208, 0.107417] | 24 | null |

두 행 모두 구간 전체가 0 위에 있고 러너의 행별 A/A·0.5% 하한을 넘었습니다. wall의 하한은 0.029187500ms, active의 하한은 0.029374450ms로 각각 같은 행의 A/A 크기가 결정하였습니다. 같은 fixture의 wall과 active는 별개 보고 열이며 독립된 두 시나리오를 뜻하지 않습니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 적용 결과, **면제된 회귀는 없습니다**. 표시 회귀 자체가 없어 면제 대상과 `report.exemption.rows`가 모두 비어 있습니다. `axisGainMs=0`, `regressionTotalMs=0`입니다. 면제 객체의 `provisional=true` 및 기록용 label은 실제 행에 면제를 부여했다는 뜻이 아닙니다.

| fixture | 마운트 행의 calls | 갱신 행의 calls |
| --- | ---: | ---: |
| array-1000 | 2,002 | 0 |

작업 계수는 공식 wall·active 열과 해당 단계의 기록·no-GC 열에 적용됩니다. 계수 0인 갱신 행에 회귀 면제를 부여하지 않았습니다. 마운트의 양수 계수 때문에 같은 설정의 worker가 24블록을 측정하였고, 131C-01에 따라 갱신 행도 실제 24블록을 모두 사용하였습니다. 갱신 행의 이득은 이 작업 계수 자체의 이득으로 단정하지 않습니다.

## part C의 결정

러너 판정은 **ADOPT**입니다. 선택된 `array-1000/off`의 공식 판정 4행에서 채택을 막는 회귀가 표시되지 않았습니다. 유의한 이득은 위 배열 갱신 2행에 한정합니다. 공식 판정 행은 모두 실제 24블록을 사용하였습니다. 이번 결정은 part C의 선택 행에 한정하며, 위 감시 범위의 제한을 유지합니다.

## 시간 분해와 예산

최종 JSON의 실행 환경에 기록된 시작 시각은 2026-10-10 18:47:51.333 KST, 종료 시각은 20:10:38.668 KST입니다. `time.totalMs=4967334.1913749995`에 따른 wall time은 **4,967.334초**, 즉 **82분 47.334초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 기록 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

첫 통과의 사전 추정은 5,000.012초이고 확인 여유는 1,250.003초입니다. 합계 6,250.015초가 시작 시 남은 예산 7,099.965초 안에 들어가 사전 검사를 통과하였습니다. 표시 회귀가 없어 확인 직전의 추가 예산 검사는 필요하지 않았습니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 4,967.318 |
| 독립 확인 구간: `time.confirmMs` | 0.000 |
| 보고 계산: `time.reportMs` | 0.016 |
| 전체 wall time | 4,967.334 |

`time.confirmMs`의 원값 0.005749999545514584ms는 확인 분기의 부수 비용이며 독립 확인 측정은 0개입니다. 첫 통과 worker 48개가 순차 실행되었고 worker wall time의 합은 4,967.049초입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 10.606 |
| 예열 | 1,617.185 |
| 강제 GC | 95.337 |
| 시계 밖 minor GC | 4.308 |
| 표본 | 3,298.097 |
| digest | 818.463 |
| React 보정 | 36.737 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-132i-session/summary.md)
- [러너의 최종 JSON gzip](./profile-132i-session/final.json.gz)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-132i-session/raw-sha256.txt)

최종 JSON 원본은 2,922,446바이트이며 132h와 같은 산출물 형태로 gzip을 보관하였습니다. 보관한 gzip은 74,242바이트이고 요약 원본은 3,931바이트이므로 두 산출물 모두 5MB 이하입니다. `raw-sha256.txt`는 러너의 `sha256.txt`를 그대로 복사한 15,518바이트 목록이며 경로는 원 세션 디렉터리 기준입니다. 원자료와 실행 로그 `S/session-132i.log`는 S의 원 세션에 남아 있습니다.

압축을 풀어 원본 JSON과 바이트 동일성을 확인하였습니다. 요약 및 SHA-256 목록도 원본과 바이트가 같습니다. 압축 해제한 JSON의 SHA-256은 `122b420aa342e5ae6d26c41a4787c02c9265865517602d6c85565ddc96b4f33a`입니다.
