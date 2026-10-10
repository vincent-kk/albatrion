# 132f 세션: F-D React 판정 part A

이번 part A의 판정은 **REJECT**입니다. `array-500/off/update-active`와 `array-500/off/update-wall`의 회귀가 첫 24블록 및 독립 확인 24블록에서 모두 확인되었습니다. 유의한 이득은 `sample-2/off/mount-active` 한 행입니다. 실행 상태는 `passed`이고 종료 표식은 `SESSION_131_OK`입니다. 도구 실행 성공과 후보 채택 판정은 구별합니다.

## 실행 환경과 입력

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- D: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`
- S: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`
- 엔진과 tier: **codex mid**
- 기준 리비전: `af057ab024668315f9fad441c60dd6a6c38f0f36`

실행 전에 `D/harness-131.md`의 마지막 두 절까지 읽고 `D/fd-implementation.md`를 확인하였습니다. 기존 `D/tools/run-session-131.mjs`만 실행하였으며, 측정 코드 작성, git 쓰기, 설치, 제품 코드 변경, 번들 재빌드 및 다른 무거운 작업은 수행하지 않았습니다. 시작 작업 트리는 깨끗했습니다.

행 파일은 `S/rows-fd-a.json`이며 SHA-256은 `3a9bd24648785845865708edab4fab2f38ab4c1cb9737a29b04a6e7e93476c0f`입니다. 설정은 `sample-2/off`, `sample-3/off`, `array-100/off`, `array-500/off`입니다. 각 설정의 16개 열을 선택하여 총 64행을 보고하였으며, 공식 판정 16행과 기록 48행입니다.

기준 번들은 `S/bundles/r132-base.cjs`이고 SHA-256은 `43b1dac346a93ca4fc751d0d979b6a0f322e2c8761405d2318879cfc556f0b1c`입니다. 후보 번들은 `S/bundles/r132-fd.cjs`이고 SHA-256은 `afe3b951fd7cbab3ba96aa932dac76f67303ea824e01cc0b90e8df09188ce9ce`입니다. 작업 계수는 `S/session-132e-counts/react-counts.json`, A/A는 `S/session-132b/final.json`을 사용하였습니다.

실행 인자는 다음과 같습니다. 이 문서의 D와 S는 위의 절대 경로를 뜻하며, 실제 명령에는 절대 경로를 전달하였습니다.

```text
$HOME/.nvm/versions/node/v26.11.1/bin/node D/tools/run-session-131.mjs
--kind=verdict --lane=react --rows=S/rows-fd-a.json
--watch-in-selection --base=S/bundles/r132-base --candidate=S/bundles/r132-fd
--blocks=24 --touch-counts=S/session-132e-counts/react-counts.json
--aa=S/session-132b/final.json --node-version=v26.11.1 --out=S/session-132f
```

러너를 백그라운드로 시작하고 stdout과 stderr를 `S/session-132f.log`에 함께 기록하였습니다. 실행 셸을 유지한 채 별도 짧은 명령으로 폴링하였으며, 각 폴링의 sleep은 50초 이하이고 진행 행은 한 줄입니다. 최초 셸의 백그라운드 `nice` 권한 오류와 실행 셸 종료 문제는 측정 시작 전에 해결하였습니다. 실제 세션은 한 번 완료되었으며 러너가 독립 확인을 자동 수행하였습니다.

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. 이번 part A가 포함한 고정 감시 설정은 `array-500/off`입니다. 최종 scoping에서 명시적으로 `watch`인 행은 `array-500/off/mount-wall-nogc`이며 24블록입니다. 대응 공식 행인 `array-500/off/mount-wall`도 작업 계수 2,502에 따라 24블록입니다. 감시 행이 선택 목록에 이미 들어 있어 `rowSelection.watchAdded`는 빈 배열입니다.

분할 세션 전체에서 요구되는 나머지 감시 설정인 `array-replace-200`, `flat-50`, `oneOf-20`, `sample-1`, `computed-visible-derived`는 이번 part A에 포함되지 않았습니다. 따라서 이 기록만으로 분할 판정 전체의 감시 설정 충족이나 F-D React 전체 범위의 판정을 주장하지 않습니다.

마운트 작업 계수는 sample-2가 4, sample-3이 20, array-100이 502, array-500이 2,502입니다. 네 설정의 갱신 작업 계수는 모두 명시적으로 0입니다. 처음 계획은 32행이 24블록, 32행이 8블록이었지만, 설정별 worker가 공유한 모든 측정 블록을 사용하는 131C-01에 따라 64행 전부 실제 24블록입니다. 8블록 계획의 32행은 `scopeReason=all-measured-blocks`로 승격되었습니다.

실제 축소 행은 **0개**이므로 “줄인 검출력에서 관측되지 않음”에 해당하는 행도 **0개**입니다. 두 회귀 행은 작업 계수 0 및 계획 8블록이어도 실제 24블록의 전체 구간으로 표시되었고, 추가 24블록에서 확인되었습니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너의 결과 그대로 적용하였습니다. 차이의 부호는 기준에서 후보를 뺀 값이므로 음수는 손실입니다. 131C-01의 순서통계량 구간은 24블록에서 k=6, 포함률 하한 99.3389248848%입니다.

| 행 | 첫 블록 | 첫 차이 중앙값(ms) | 첫 구간(ms) | 첫 회귀 하한(ms) | 확인 블록 | 확인 차이 중앙값(ms) | 확인 구간(ms) | 상태 |
| --- | ---: | ---: | --- | ---: | ---: | ---: | --- | --- |
| array-500/off/update-active | 24 | -0.050521493 | [-0.103749990, -0.001415968] | 0.020000625 | 24 | -0.053083032 | [-0.073749959, -0.006708026] | 확인됨 |
| array-500/off/update-wall | 24 | -0.048417000 | [-0.105751000, -0.000916000] | 0.019973020 | 24 | -0.053021000 | [-0.071999000, -0.006875000] | 확인됨 |

확인 통과의 회귀 하한은 update-active가 0.019661563ms, update-wall이 0.019640520ms입니다. 두 확인 구간은 모두 0 아래이고 손실 중앙값이 해당 하한을 넘었습니다. 표시 2행, 확인 2행, 채택을 막는 회귀 2행입니다.

## 유의한 이득

`sample-2/off/mount-active`는 첫 24블록에서 이득으로 판정되었습니다. 차이 중앙값은 **+0.038395989ms**, 구간은 **[+0.005750956, +0.057875954]ms**입니다. 보정한 기준 중앙값은 2.647124990ms이고 후보 중앙값은 2.615583504ms입니다. 짝 차이의 중앙값과 양쪽 중앙값의 단순 차이는 별도 통계입니다.

이득 행은 한 개입니다. round-128 규칙에 따라 이득은 독립 확인 대상이 아니며 `confirmBlocks=null`입니다. 다른 행을 유의한 이득으로 추가 판정하지 않았습니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 적용 결과, **면제된 회귀는 없습니다**. 두 회귀 행의 `workCount.calls`는 각각 **0**, `changedCodeExecutes`는 각각 **false**입니다. 작업 계수가 0이라는 사실만으로 면제되지 않았습니다.

각 대응 no-GC 열은 24블록이며 구간이 0을 포함합니다. update-active-nogc의 구간은 [-0.030665994, +0.025207937]ms, update-wall-nogc의 구간은 [-0.029499000, +0.025583000]ms입니다. no-GC 측정과 작업 계수 존재 조건은 충족하였으나 다음 두 조건을 충족하지 못했습니다.

- 축 이득은 0ms여서 회귀 합계 0.098938493ms의 열 배를 넘지 못했습니다.
- 첫 손실은 update-active가 1.262997858% 및 50.521493µs, update-wall이 1.212060069% 및 48.417000µs입니다. 비율은 2% 이내지만 절대 손실이 5µs를 넘어서 결합 조건을 충족하지 못했습니다.

두 행 모두 `exempted=false`입니다. no-GC 열의 구간과 작업 계수는 기록 근거이며, 확인된 공식 회귀를 해제하지 않습니다.

## part A의 결정

**REJECT**입니다. 두 확인 회귀가 면제를 받지 못하여 part A의 채택을 막습니다. 이득 한 행은 해당 결정을 바꾸지 않습니다. 판정은 위 네 fixture의 선택 행 및 포함된 감시 행에 한정합니다.

## 시간 분해와 예산

시작 시각은 2026-10-10 14:03:15.431 KST, 종료 시각은 15:38:23.297 KST입니다. 최종 JSON의 `time.totalMs`에 따른 wall time은 **5,707.865초**, 즉 **1시간 35분 7.865초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 기록 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

첫 통과의 사전 추정은 3,204.244초이고 확인 여유는 1,200.000초로, 합계 4,404.244초가 당시 남은 예산 7,099.942초 안에 들어갔습니다. 확인 직전에는 확인 추정 2,452.579초가 남은 예산 3,883.887초 안에 들어갔습니다. 두 예산 검사는 모두 통과하였습니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 3,216.118 |
| 독립 확인: `time.confirmMs` | 2,491.669 |
| 보고 계산: `time.reportMs` | 0.079 |
| 전체 wall time | 5,707.865 |

첫 통과 worker 192개와 확인 worker 48개가 순차 실행되어 총 240개입니다. worker wall time의 합은 5,706.801초이며 첫 통과는 3,215.222초, 확인은 2,491.579초입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 54.713 |
| 예열 | 1,854.423 |
| 강제 GC | 175.367 |
| 시계 밖 minor GC | 25.180 |
| 표본 | 3,734.309 |
| digest | 824.461 |
| React 보정 | 51.720 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며, 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-132f-session/summary.md)
- [러너의 최종 JSON gzip](./profile-132f-session/final.json.gz)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-132f-session/raw-sha256.txt)

최종 JSON 원본은 14,508,991바이트로 5MB를 초과하여 gzip으로 보관하였습니다. 요약 원본은 9,793바이트이므로 그대로 복사하였습니다. `raw-sha256.txt`는 러너의 `sha256.txt`를 그대로 복사한 75,560바이트 목록이며, 경로는 원 세션 디렉터리 기준입니다. 원자료와 실행 로그는 S의 원 세션에 남아 있습니다.

보관한 gzip은 333,304바이트로 5MB 이하이며, 압축을 풀어 원본 JSON과 바이트 동일성을 확인하였습니다. 요약 및 SHA-256 목록도 원본과 바이트가 같습니다. 압축 해제한 JSON의 SHA-256은 `cb35e1fe4492e437110481d8f28c212ab0be3549d6138c8e24faacefccbdf933`입니다. 종료 후 git 상태에는 이 기록과 산출물 디렉터리만 새 파일로 표시되었습니다.
