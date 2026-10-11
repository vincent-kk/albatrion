# 132g 세션: F-D′ React 판정 part A

이번 part A의 판정은 **ADOPT**입니다. 표시 회귀 0행, 확인 회귀 0행, 채택을 막는 회귀 0행이며 유의한 이득도 0행입니다. 실행 상태는 `passed`이고 종료 표식은 `SESSION_131_OK`입니다. 판정은 sample-2, sample-3, array-100, array-500의 선택 행에 한정합니다.

## 실행 환경과 입력

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- D: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`
- S: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`
- 엔진과 tier: **codex mid**
- 기준 리비전: `af057ab024668315f9fad441c60dd6a6c38f0f36`

실행 전에 `D/profile-132f-session.md`, `D/harness-131.md`의 마지막 두 절 및 `D/fd-prime-implementation.md`를 읽었습니다. 시작 작업 트리는 깨끗했습니다. 기존 `D/tools/run-session-131.mjs`를 한 번 실행하였으며 측정 코드 작성, git 쓰기, 설치, 제품 코드 변경, 번들 재빌드 및 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너 결과를 읽고 이 기록과 요청된 산출물을 보관하였습니다.

행 파일은 `S/rows-fd-a.json`이며 SHA-256은 `3a9bd24648785845865708edab4fab2f38ab4c1cb9737a29b04a6e7e93476c0f`입니다. 설정은 `sample-2/off`, `sample-3/off`, `array-100/off`, `array-500/off`입니다. 각 설정의 16개 열을 선택하여 총 64행을 보고하였으며 공식 판정 16행과 기록 48행입니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r132-base.cjs`이고 SHA-256은 `43b1dac346a93ca4fc751d0d979b6a0f322e2c8761405d2318879cfc556f0b1c`입니다. 후보 번들은 `S/bundles/r132-fdp.cjs`이고 SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. 작업 계수는 `S/session-132g-counts/react-counts.json`이고 SHA-256은 `a8d5aa17d280dcda7b5d212613a3d16f11339e8115354c91a6be772cc3769d44`입니다. A/A는 `S/session-132b/final.json`을 사용하였으며 SHA-256은 `7c8574ce7cf6d87fb06ef85d892b8589e03af650e1a3e333b748a8d4a5ae93ff`입니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 하나의 로그로 보냈으며 셸의 백그라운드 프로세스를 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=verdict --lane=react \
  --rows=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/rows-fd-a.json \
  --watch-in-selection \
  --base=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r132-base \
  --candidate=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r132-fdp \
  --blocks=24 \
  --touch-counts=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132g-counts/react-counts.json \
  --aa=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132b/final.json \
  --node-version=v26.11.1 \
  --out=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132g \
  > /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-132g.log 2>&1 &
```

별도의 짧은 명령으로 폴링하였으며 최초 sleep은 2초, 이후 각 sleep은 50초입니다. 각 명령은 진행 행을 한 줄 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_OK`를 함께 확인한 뒤 폴링을 종료하였으며 실행 셸의 종료 코드도 0입니다.

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. 이번 part A가 포함한 고정 감시 설정은 `array-500/off`입니다. 최종 scoping에서 명시적으로 `watch`인 행은 `array-500/off/mount-wall-nogc`이고 작업 계수는 1,002, 블록 수는 24입니다. 대응 공식 행인 `array-500/off/mount-wall`도 작업 계수 1,002에 따라 24블록입니다. 감시 행이 선택 목록에 이미 들어 있어 `rowSelection.watchAdded`는 빈 배열입니다.

분할 세션 전체에서 요구되는 나머지 감시 설정인 `array-replace-200`, `flat-50`, `oneOf-20`, `sample-1`, `computed-visible-derived`는 이번 part A에 포함되지 않았습니다. 따라서 이 기록만으로 전체 분할 판정의 감시 범위 충족이나 F-D′ React 전체 범위의 채택을 주장하지 않습니다.

처음 계획은 32행이 24블록, 32행이 8블록이었습니다. 설정별 worker가 공유한 모든 측정 블록을 사용하는 131C-01에 따라 **64행 전부 실제 24블록**입니다. 8블록 계획의 32행은 `scopeReason=all-measured-blocks`로 승격되었습니다. 실제 축소 행은 **0개**이므로 “줄인 검출력에서 관측되지 않음”에 해당하는 행도 **0개**입니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너의 결과 그대로 적용하였습니다. 차이의 부호는 기준에서 후보를 뺀 값이므로 음수는 손실입니다. 131C-01의 순서통계량 구간은 24블록에서 k=6, 포함률 하한 99.3389248848%입니다.

| 구분 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | ---: | --- |
| 공식 판정 행 | 16 | 각 24 | 각 null |
| 표시 회귀 | 0 | 해당 없음 | 해당 없음 |
| 확인 회귀 | 0 | 해당 없음 | 해당 없음 |
| 채택을 막는 회귀 | 0 | 해당 없음 | 해당 없음 |

첫 통과에서 표시된 회귀가 없어 `confirmationPlan=[]`, `report.confirmation=null`이며 독립 확인 worker는 실행하지 않았습니다. 모든 행의 `confirmBlocks`와 `confirmStatus`는 null입니다. 공식 판정 16행의 관측 상태는 모두 “관측되지 않음”이며 기록 48행은 “기록”입니다.

예를 들어 `sample-3/off/update-wall`의 차이 중앙값은 −0.022187500ms이지만 구간 [−0.030458000, +0.004083000]ms가 0을 포함하여 회귀로 표시되지 않았습니다. `array-500/off/update-wall`도 차이 중앙값 +0.026271000ms, 구간 [−0.003208000, +0.071625000]ms로 0을 포함합니다. 각각 첫 24블록이며 확인 블록은 null입니다.

## 유의한 이득

유의한 이득은 **0행**입니다. `report.gains=[]`이며 첫 통과의 공식 판정 행에서 이득으로 판정된 행이 없습니다. 양의 차이 중앙값만으로 유의한 이득을 추가 판정하지 않았습니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 적용 결과, **면제된 회귀는 없습니다**. 표시 회귀 자체가 없어 면제 대상과 `report.exemption.rows`가 모두 비어 있습니다. `axisGainMs=0`, `regressionTotalMs=0`입니다. 면제 객체의 `provisional=true` 및 기록용 label은 실제 행에 면제를 부여했다는 뜻이 아닙니다.

| fixture | 마운트 행의 calls | 갱신 행의 calls |
| --- | ---: | ---: |
| sample-2 | 4 | 0 |
| sample-3 | 14 | 0 |
| array-100 | 202 | 0 |
| array-500 | 1,002 | 0 |

작업 계수는 공식 wall·active 열과 해당 단계의 기록·no-GC 열에 적용됩니다. 갱신 작업 계수가 0이라는 이유로 회귀를 면제하지 않았으며, 갱신 행도 실제 24블록 전부를 사용하여 같은 회귀 규칙을 적용하였습니다.

## part A의 결정

**ADOPT**입니다. 선택된 네 fixture의 공식 판정 16행에서 채택을 막는 회귀가 관측되지 않았습니다. 유의한 이득은 없으며 이 판정으로 속도 향상을 주장하지 않습니다. 이번 결정은 part A의 선택 행 및 포함된 감시 행에 한정합니다.

## 시간 분해와 예산

시작 시각은 2026-10-10 16:51:08.817 KST, 종료 시각은 17:43:52.521 KST입니다. 최종 JSON의 `time.totalMs=3163703.0025`에 따른 wall time은 **3,163.703초**, 즉 **52분 43.703초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 기록 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

첫 통과의 사전 추정은 3,204.244초이고 확인 여유는 1,200.000초입니다. 합계 4,404.244초가 시작 시 남은 예산 7,099.936초 안에 들어가 사전 검사를 통과하였습니다. 표시 회귀가 없어 확인 직전의 추가 예산 검사는 필요하지 않았습니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 3,163.662 |
| 독립 확인 구간: `time.confirmMs` | 0.000 |
| 보고 계산: `time.reportMs` | 0.041 |
| 전체 wall time | 3,163.703 |

`time.confirmMs`의 원값 0.0034999996423721313ms는 확인 분기의 부수 비용이며 독립 확인 측정은 0개입니다. 첫 통과 worker 192개가 순차 실행되었고 worker wall time의 합은 3,162.769초입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 43.059 |
| 예열 | 1,027.829 |
| 강제 GC | 115.750 |
| 시계 밖 minor GC | 17.138 |
| 표본 | 2,052.613 |
| digest | 439.327 |
| React 보정 | 30.765 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-132g-session/summary.md)
- [러너의 최종 JSON gzip](./profile-132g-session/final.json.gz)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-132g-session/raw-sha256.txt)

최종 JSON 원본은 11,643,760바이트로 5MB를 초과하여 gzip으로 보관하였습니다. 보관한 gzip은 271,584바이트이고 요약 원본은 9,905바이트이므로 두 산출물 모두 5MB 이하입니다. `raw-sha256.txt`는 러너의 `sha256.txt`를 그대로 복사한 61,262바이트 목록이며 경로는 원 세션 디렉터리 기준입니다. 원자료와 실행 로그는 S의 원 세션에 남아 있습니다.

압축을 풀어 원본 JSON과 바이트 동일성을 확인하였습니다. 요약 및 SHA-256 목록도 원본과 바이트가 같습니다. 압축 해제한 JSON의 SHA-256은 `7d0159c9bd1a679b4cc08e5f480c292dfb3caf596346849a35f17a87196801f0`입니다.
