# 139b 세션: G27 수정(B4·B1) React 판정 part 2

139C-01에 따라 최종 측정 React 기준 번들 `r136-final`과 G27 수정 후보 `r139`를 비교하였습니다. 105C-01, round-128에서 수정된 124C-01, round-128 독립 확인 규칙 및 131C-01을 기존 러너의 결과 그대로 적용하였습니다. 표시 회귀 **0행**, 확인 회귀 **0행**, 채택을 막는 회귀 **0행**, 유의한 이득 **0행**이며 part 2 판정은 **ADOPT**입니다. 실행 상태는 `passed`이고 종료 표식은 `SESSION_131_OK`입니다. 전체 wall time은 **3,453.654초(57분 33.654초)**입니다. [part 1인 session 139a](./profile-139a-session.md)의 판정도 **ADOPT**입니다.

## 실행 환경과 입력

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- 시작 HEAD: `b13dadc9d9e09bc7522d6a6f130b9b8d2bc5e6c9`
- D: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`
- S: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`
- 엔진: `codex`
- 티어: `mid`
- 번들 매니페스트 기준 리비전: `daca1d14a8406e5ca939bad5e99f5be29768a5b3`

실행 전에 `D/profile-139a-session.md`, `D/profile-136f-session.md`, `D/harness-131.md`를 읽고 보고 형식과 실행 계약을 확인하였습니다. 시작 작업 트리가 깨끗하며 HEAD가 지정값과 일치함을 확인하였습니다. 두 실제 번들의 SHA-256이 요청값과 일치함을 먼저 확인한 뒤 기존 `D/tools/run-session-131.mjs`를 한 번 실행하였습니다. 측정 코드 작성, git 쓰기, 설치, 제품 변경, 번들 재빌드 및 측정 중 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너 결과를 읽고 이 보고서와 요청된 산출물을 보관하였습니다. 측정 및 결과 확인에 사용한 Node는 모두 위 지정 경로입니다.

행 파일은 `S/rows-fb-2.json`이며 SHA-256은 `d75117981d7b782d1429f0b63131c75e1ce87c9daef508d099978aee12315ea9`입니다. 실제 선택 설정은 `flat-500/off`, `array-100/off`, `array-push-100/off`, `array-replace-200/off`, `array-push-remove-100/off`입니다. 검증은 모두 OFF입니다. 각 설정의 16개 열을 선택하여 총 80행을 보고하였으며 공식 판정 20행과 기록 60행입니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r136-final.cjs`이며 SHA-256은 `1d0ad52295ebb91e590d12f4119e5d5e4170ec23dc61f7b08aac7cdc7b6958cb`, 크기는 963,333바이트입니다. 후보는 `S/bundles/r139.cjs`이며 SHA-256은 `1756485ae182ea5b537544c866a7d4c474984c7ed8a9cfb8c56c6e43185806cd`, 크기는 963,587바이트입니다. 실행 전 직접 확인한 해시와 러너 최종 JSON의 해시가 모두 요청값과 일치합니다. 두 매니페스트의 공통 기준 리비전을 현재 HEAD나 후보의 빌드 HEAD로 해석하지 않습니다.

작업 계수는 지정된 `S/session-135-counts/react-counts.json`을 그대로 사용하였고 SHA-256은 `4115fc9db9ddfd598f29896de3227f4c954d2e402320068b1a51686f6db24391`입니다. 후보용 계수를 새로 수집하지 않았습니다. A/A는 **134C-01 및 139C-01에 따라 session 136i를 재사용**하였습니다. `S/session-136i/final.json`의 SHA-256은 `32873daf99a0f37b320099eed3f046cd4f77e5cc9a5bf2347b5f682d80c3ff9f`이고 상태는 `passed`, 판정은 `AA_PASS`입니다. 같은 Node·V8·실제 경로의 A/A이며 이번 세션에서 별도 A/A는 실행하지 않았습니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 하나의 로그로 보냈으며 셸의 백그라운드 프로세스를 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=verdict --lane=react \
  --rows=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/rows-fb-2.json \
  --watch-in-selection \
  --base=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r136-final \
  --candidate=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r139 \
  --blocks=24 \
  --touch-counts=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-135-counts/react-counts.json \
  --aa=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136i/final.json \
  --node-version=v26.11.1 \
  --out=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-139b \
  > /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-139b.log 2>&1 &
runner_pid=$!
wait "$runner_pid"
```

별도의 짧은 명령으로 폴링하였으며 최초 sleep은 2초, 이후 각 sleep은 50초였습니다. 각 폴링 명령은 진행 행을 한 줄 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_OK`를 함께 확인한 뒤 폴링을 종료하였고 실행 셸의 종료 코드도 0입니다. 시작 셸은 `nice(5) failed: operation not permitted`를 출력하였지만 러너가 시작되어 사전 검사와 모든 단계를 통과하였습니다. 입력·옵션 거부나 사전 예산 거부는 없었습니다.

## 번들 차분

두 실제 번들의 SHA-256이 [session 139a 보고서의 “번들 차분”](./profile-139a-session.md#번들-차분)에 기록한 번들과 일치함을 실행 전에 확인하였습니다. 해당 절에는 **B4의 terminal child 읽기 감지기에서 사용하는 로드 번호 비교와 그 번호 관리, B1의 타입 유도용 선언 변경**에 대한 완전한 비압축 차분이 있습니다. [보존된 차분 파일](./profile-139a-session/r136-final-vs-r139.diff)을 함께 참조합니다. 이번 part 2에서는 번들을 재빌드하거나 차분을 중복 보관하지 않았습니다.

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. 고정 감시 fixture 중 이번 선택에 포함한 설정은 **`array-replace-200/off`**입니다. 최종 scoping에서 명시적으로 `reason=watch`인 행과 실제 사용 블록은 다음과 같습니다.

| 감시 행 | calls | 첫 블록 | 확인 블록 |
| --- | ---: | ---: | --- |
| array-replace-200/off/profiler-mount | 19 | 24 | null |

이 감시 행은 선택 목록에 이미 들어 있어 `rowSelection.watchAdded=[]`입니다. 나머지 고정 감시 설정인 `array-500/off`, `flat-50/off`, `oneOf-20/off`, `sample-1/off`, `computed-visible-derived/off`는 같은 G27 수정 후보의 [part 1인 session 139a](./profile-139a-session.md#감시-범위와-실제-블록)에서 측정되었습니다. 두 part의 선택 설정을 합치면 고정 감시 설정 6개가 모두 포함됩니다. part 1의 `sample-1/off`와 `computed-visible-derived/off`는 명시적 `watch` 행 분류가 아닌 양수 계수의 `touched` 행으로 24블록 측정되었다는 구별을 유지합니다.

처음 계획과 실제 사용 블록은 모두 **80행이 24블록**입니다. 131C-01에 따라 측정한 블록을 전부 사용하였으며 79행은 `scopeReason=touched`, 1행은 `scopeReason=watch`입니다. `all-measured-blocks` 승격이나 축소 행은 없습니다.

| 실제 블록 | 설정 | 공식 판정 행 | 기록 행 |
| ---: | --- | ---: | ---: |
| 24 | flat-500/off, array-100/off, array-push-100/off, array-replace-200/off, array-push-remove-100/off | 20 | 60 |

실제 축소 행은 **0개**입니다. 모든 공식 판정 행의 관측 상태는 “관측되지 않음”이며 기록 행은 “기록”입니다.

**`array-1000`과 `nested-d5-f4`는 B4가 reset 경로 밖에서는 실행되지 않으므로 측정하지 않았습니다(139C-01).** 감시 설정의 범위 충족을 이 제외 설정까지 측정한 것으로 해석하지 않습니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너 결과 그대로 적용하였습니다. 차이의 부호는 기준에서 후보를 뺀 값이므로 음수는 손실입니다. 131C-01의 순서통계량 구간은 모든 행에서 24블록, k=6, 포함률 하한 99.3389248848%입니다.

| 구분 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | --- | --- |
| 공식 판정 행 | 20 | 모두 24 | 각 null |
| 표시 회귀 | 0 | 해당 없음 | 해당 없음 |
| 확인 회귀 | 0 | 해당 없음 | 해당 없음 |
| 채택을 막는 회귀 | 0 | 해당 없음 | 해당 없음 |

첫 통과에서 표시된 회귀가 없어 `confirmationPlan=[]`, `report.confirmation=null`이며 독립 확인 worker는 실행하지 않았습니다. 모든 행의 `confirmBlocks`와 `confirmStatus`는 null입니다. 확인 회귀 0행은 표시 회귀가 없어 확인 측정이 필요하지 않았다는 뜻입니다. 공식 판정 20행의 구간은 모두 0을 포함하며 `verdict.regression=false`, `verdict.gain=false`입니다.

예를 들어 `array-push-100/off/update-wall`의 차이 중앙값은 −0.277726500ms이나 구간 [−0.464628000, +0.651674000]ms가 0을 포함하여 회귀로 표시되지 않았습니다. `array-push-remove-100/off/update-wall`도 차이 중앙값 −0.403813000ms, 구간 [−5.743827000, +0.352827000]ms로 0을 포함합니다. 두 행은 첫 24블록이며 확인 블록은 모두 null입니다. 음의 점 추정을 확인된 회귀로 분류하지 않습니다.

## 유의한 이득

유의한 이득은 **0행**이며 `report.gains=[]`입니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다. 양의 점 추정을 유의한 이득으로 해석하지 않습니다.

다음은 `array-100/off`의 공식 마운트와 `flat-500/off`의 공식 마운트·갱신 결과입니다. 차이 중앙값과 구간은 블록 차이 통계이며 양수는 기준보다 후보가 빠르다는 뜻입니다.

| 행 | 차이 중앙값(ms) | 구간(ms) | 첫 블록 | 확인 블록 | 분류 |
| --- | ---: | --- | ---: | --- | --- |
| array-100/off/mount-wall | −0.086020 | [−0.496584, +0.169583] | 24 | null | 유의한 변화 관측되지 않음 |
| array-100/off/mount-active | −0.115208 | [−0.490126, +0.155459] | 24 | null | 유의한 변화 관측되지 않음 |
| flat-500/off/mount-wall | +0.019520 | [−0.708749, +0.503875] | 24 | null | 유의한 변화 관측되지 않음 |
| flat-500/off/mount-active | +0.086146 | [−0.706707, +0.496417] | 24 | null | 유의한 변화 관측되지 않음 |
| flat-500/off/update-wall | −0.014688 | [−0.082167, +0.062503] | 24 | null | 유의한 변화 관측되지 않음 |
| flat-500/off/update-active | −0.012833 | [−0.078543, +0.064040] | 24 | null | 유의한 변화 관측되지 않음 |

여섯 행 모두 구간이 0을 포함하고 `gain=false`, `regression=false`입니다. 같은 fixture의 wall과 active는 별개 보고 열이며 독립된 시나리오를 뜻하지 않습니다. 이번 비교는 최종 측정 기준 `r136-final`에서 G27 수정 후보로의 변화이며, 이전 최적화의 개별 기여나 그 이득을 다시 판정한 결과로 해석하지 않습니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 적용 결과, **면제된 회귀는 없습니다**. 표시 회귀 자체가 없어 면제 대상과 `report.exemption.rows`가 모두 비어 있습니다. `axisGainMs=0`, `regressionTotalMs=0`입니다. 면제 객체의 `provisional=true` 및 기록용 label은 실제 행에 면제를 부여했다는 뜻이 아닙니다.

| fixture | 마운트 행의 calls | 갱신 행의 calls |
| --- | ---: | ---: |
| flat-500 | 3,512 | 100 |
| array-100 | 2,819 | 20 |
| array-push-100 | 19 | 3,800 |
| array-replace-200 | 19 | 5,610 |
| array-push-remove-100 | 19 | 5,600 |

작업 계수는 공식 wall·active 열과 해당 단계의 기록·no-GC 열에 적용됩니다. 각 설정을 모두 24블록으로 측정하였습니다. 계수는 지정된 입력에 따른 작업 범위의 계수이고 시간이나 절감량으로 해석하지 않습니다.

## part 2의 결정

러너 판정은 **ADOPT**입니다. 139C-01의 G27 수정(B4·B1) 후보에 대해 선택된 5개 fixture의 공식 판정 20행에서 채택을 막는 회귀가 표시되지 않았습니다. 유의한 이득도 0행입니다. 공식 판정 행은 모두 24블록이며 축소 측정은 없습니다. 이번 결정은 part 2의 선택 행 및 실제 포함된 감시 행에 한정하며, 위 감시 범위와 제외 근거를 유지합니다. B4·B1의 기여를 개별적으로 분해하지 않습니다. 같은 후보의 **part 1은 session 139a이며 ADOPT**입니다. `array-1000`과 `nested-d5-f4`의 측정 제외는 139C-01의 reset 경로 범위에 따릅니다.

## 시간 분해와 예산

시작 시각은 최종 JSON의 `environment.startedAt` 기준 **2026-10-11 17:12:13.997 KST**, 종료 시각은 **18:09:47.652 KST**입니다. `time.totalMs=3453654.1486670002`에 따른 wall time은 **3,453.654초**, 즉 **57분 33.654초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 보고서 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

첫 통과의 사전 추정은 4,021.117초이고 확인 여유는 1,200.000초입니다. 합계 5,221.117초가 시작 시 남은 예산 7,099.940초 안에 들어가 사전 검사를 통과하였습니다. 실제 로그의 사전 검사 메시지는 다음과 같습니다.

```text
SESSION_131_ESTIMATE: first pass 4021.117s + reserve 1200.000s = 5221.117s; remaining 7099.940s
```

표시 회귀가 없어 확인 직전의 추가 예산 검사는 필요하지 않았습니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 3,453.607 |
| 독립 확인 구간: `time.confirmMs` | 0.000 |
| 보고 계산: `time.reportMs` | 0.047 |
| 전체 wall time | 3,453.654 |

`time.confirmMs`의 원값 0.0028329999186098576ms는 확인 분기의 부수 비용이며 독립 확인 측정은 0개입니다. 첫 통과 worker 240개가 순차 실행되었고 worker wall time의 합은 3,452.526초입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 52.146 |
| 예열 | 1,135.104 |
| 강제 GC | 117.815 |
| 시계 밖 minor GC | 16.538 |
| 표본 | 2,208.524 |
| digest | 218.131 |
| React 보정 | 39.832 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-139b-session/summary.md)
- [러너의 최종 JSON gzip](./profile-139b-session/final.json.gz)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-139b-session/raw-sha256.txt)

최종 JSON 원본은 14,633,406바이트로 5MB를 초과하여 gzip으로 보관하였습니다. 보관한 gzip은 352,859바이트, 요약은 12,120바이트, `raw-sha256.txt`는 76,942바이트이며 각 파일이 5MB 미만입니다. 번들은 보관하지 않았습니다. `raw-sha256.txt`는 러너의 `sha256.txt`를 그대로 복사한 목록이며 경로는 원 세션 디렉터리 기준입니다. 원자료와 실행 로그 `S/session-139b.log`는 S의 원 세션에 남아 있습니다.

압축을 풀어 원본 JSON과 바이트 동일성을 확인하였습니다. 요약 및 SHA-256 목록 복사본도 각각 원본과 바이트가 같습니다. 압축 해제한 JSON의 SHA-256은 `202f48052562f86179dffb4a6ea15bccf62617b3e20a9bd4962f72b0c7616dfd`입니다.
