# 136h 세션: F-B·F-C·F-F 조합 React 판정 part 4 (마지막 part, F-E 제외)

이번 part 4의 판정은 **ADOPT**입니다. 표시 회귀 0행, 확인 회귀 0행, 면제 회귀 0행, 채택을 막는 회귀 0행이며 유의한 이득도 0행입니다. 실행 상태는 `passed`, 종료 표식은 `SESSION_131_OK`, 실행 셸의 종료 코드는 0입니다. 범위는 `nested-d5-f4/off`의 공식 판정 4행과 기록 12행에 한정합니다. 네 고침 합본은 part 4에 도달하지 않았으므로 이 설정에서 비교할 앞선 합본 측정값은 없습니다.

## 실행 환경과 입력

- 작업 트리: `{repo}`
- D: `packages/canard/schema-form/architecture/verification/07-switch`
- S: `{scratch}`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `{node-home}/versions/node/v26.11.1/bin/node`
- 엔진: Codex
- 번들 매니페스트 기준 리비전: `e805074de8a9cb0c072a81284a166ab985a113be`

실행 전에 `D/profile-136g-session.md`와 `D/harness-131.md`를 먼저 읽고 `D/fbx-a1000-diagnosis.md`의 하나씩 뺀 조합 비교 및 후보 매니페스트를 확인하였습니다. 136C-01에 따라 준비된 F-B·F-C·F-F 후보를 사용하였으며 F-E는 보류하였습니다. 시작 작업 트리는 `git status --short`의 빈 출력으로 확인하였습니다. 기존 `D/tools/run-session-131.mjs`를 한 번 실행하였으며 측정 코드 작성, git 쓰기, 설치, 제품 코드 변경, 번들 재빌드 및 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너 결과와 지정된 기존 A/A를 읽고 이 기록과 요청된 산출물을 보관하였습니다. 측정 및 결과 확인에서 사용한 Node는 모두 위 지정 경로입니다.

행 파일은 `S/rows-fb-5.json`이며 SHA-256은 `d79bb1067688bcfb751d49db3c23bbd70f4cd5e9b6a0df9b99663ba86ec36eb6`입니다. 요청한 nested-d5의 실제 선택 설정은 **`nested-d5-f4/off`** 한 개입니다. 해당 설정의 16개 열을 선택하여 공식 판정 4행과 기록 12행을 보고하였습니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r133-base.cjs`이고 SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. 후보 번들은 `S/bundles/r136-no-fe.cjs`이고 SHA-256은 `1d0ad52295ebb91e590d12f4119e5d5e4170ec23dc61f7b08aac7cdc7b6958cb`입니다. 후보 매니페스트는 `S/bundles/r136-no-fe-manifest.json`이며 SHA-256은 `89ba062e965435726dd0dfc3570b84e275bcd93b3b4358d12c41a81c140f0172`입니다. 작업 계수는 지정된 `S/session-135-counts/react-counts.json`을 그대로 사용하였고 SHA-256은 `4115fc9db9ddfd598f29896de3227f4c954d2e402320068b1a51686f6db24391`입니다. 이번 후보용 계수를 새로 수집하지 않았습니다. A/A는 **`S/session-132d/final.json`을 재사용**하였으며 SHA-256은 `28bf1fd5d4c0d96bc138e36a833d981c474f393e7cf122fc491477c060a18bd7`입니다. 이번 세션에서 재빌드나 별도 A/A는 실행하지 않았습니다. 매니페스트의 기준 리비전을 현재 HEAD라고 해석하지 않습니다.

재사용 A/A의 실행 상태는 `passed`, 판정은 `AA_PASS`이며 같은 Node 판과 실제 경로를 기록합니다. **Q133에 따라 8블록 A/A 행이 24블록 verdict 행의 하한을 공급할 수 있습니다. 이번 공식 판정 4행 모두 8블록 A/A 행을 하한 계산 입력으로 재사용한 경우입니다.** 105C-01 하한은 A/A 차이 중앙값의 절댓값과 이번 기준 중앙값의 0.5% 중 큰 값입니다. A/A 구간 폭을 하한으로 사용하지 않습니다.

| 행 | A/A 블록 | A/A 중앙값 절댓값(ms) | 이번 판정 블록 | 이번 105C-01 하한(ms) |
| --- | ---: | ---: | ---: | ---: |
| nested-d5-f4/off/update-wall | 8 | 0.000749000 | 24 | 0.019750837 |
| nested-d5-f4/off/update-active | 8 | 0.000562996 | 24 | 0.019773963 |
| nested-d5-f4/off/mount-wall | 8 | 0.880146500 | 24 | 0.946487395 |
| nested-d5-f4/off/mount-active | 8 | 0.866770500 | 24 | 0.934459583 |

이번 네 행 모두 최종 하한은 이번 기준 중앙값의 0.5%가 결정합니다. A/A 8블록 구간은 k=1, 포함률 하한 99.21875%이며 이번 판정 24블록 구간과 구별합니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 하나의 로그로 보냈으며 셸의 백그라운드 프로세스를 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=verdict --lane=react \
  --rows={scratch}/rows-fb-5.json \
  --watch-in-selection \
  --base={scratch}/bundles/r133-base \
  --candidate={scratch}/bundles/r136-no-fe \
  --blocks=24 \
  --touch-counts={scratch}/session-135-counts/react-counts.json \
  --aa={scratch}/session-132d/final.json \
  --node-version=v26.11.1 \
  --out={scratch}/session-136h \
  > {scratch}/session-136h.log 2>&1 &
```

별도의 짧은 명령으로 폴링하였으며 최초 sleep은 2초, 이후 각 sleep은 50초입니다. 각 폴링 명령은 최종 JSON 존재 여부와 로그의 마지막 행을 포함한 진행 행을 한 줄 출력하였고 이후에는 생성된 JSON 파일 수도 함께 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_OK`를 함께 확인한 뒤 폴링을 종료하였으며 실행 셸의 종료 코드도 0입니다. 시작 셸은 `nice(5) failed: operation not permitted`를 출력하였지만 러너가 시작되어 사전 검사와 모든 단계를 통과하였습니다. 옵션·입력 거부나 사전 예산 거부는 없었습니다. 별도 confirm 실행은 시작하지 않았습니다.

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. **이번 part 4에 포함된 고정 감시 설정은 없습니다.** `nested-d5-f4/off`는 고정 감시 설정에 속하지 않으며 `rowSelection.watchAdded=[]`이고 최종 scoping의 `reason=watch` 행도 0개입니다.

고정 감시 설정인 `array-500/off`, `array-replace-200/off`, `flat-50/off`, `oneOf-20/off`, `sample-1/off`, `computed-visible-derived/off`는 모두 이번 part에 포함되지 않았습니다. 같은 F-E 제외 후보의 part 1·2 기록은 `D/profile-136e-session.md`와 `D/profile-136f-session.md`에 있습니다. 앞선 `D/profile-136g-session.md`가 정리한 대로 part 1의 다섯 설정과 part 2의 `array-replace-200/off`가 합쳐 고정 감시 설정 6개를 포함합니다. 이번 마지막 part는 그 감시 설정을 재측정하지 않았습니다. `sample-1/off`와 `computed-visible-derived/off`가 앞선 part에서 양수 계수의 `touched` 행으로 측정되었다는 구별도 유지합니다.

처음 계획과 실제 사용 블록은 모두 **16행이 24블록**입니다. 131C-01에 따라 측정한 블록을 전부 사용하였으며 16행 모두 `scopeReason=touched`입니다. `all-measured-blocks` 승격이나 축소 행은 없습니다.

| 실제 블록 | 설정 | 공식 판정 행 | 기록 행 |
| ---: | --- | ---: | ---: |
| 24 | nested-d5-f4/off | 4 | 12 |

실제 축소 행은 **0개**입니다. 모든 공식 판정 행의 관측 상태는 “관측되지 않음”이며 기록 행은 “기록”입니다. 모든 행의 확인 블록은 null입니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너 결과 그대로 적용하였습니다. 표시 회귀 0행, 확인 회귀 0행, 확인 대기 회귀 0행, 채택을 막는 회귀 0행입니다. `report.flaggedRegressions=[]`, `report.blockingRegressions=[]`, `report.confirmation=null`이며 확인 원자료도 없습니다. 표시 회귀가 없어 독립 확인 대상이 생기지 않았고 확인 예산 거부 메시지도 없습니다.

| 구분 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | --- | --- |
| 공식 판정 행 | 4 | 모두 24 | null |
| 표시 회귀 | 0 | 해당 없음 | 해당 없음 |
| 확인 회귀 | 0 | 해당 없음 | 해당 없음 |
| 확인 대기 회귀 | 0 | 해당 없음 | 해당 없음 |
| 채택을 막는 회귀 | 0 | 해당 없음 | 해당 없음 |

차이는 기준에서 후보를 뺀 값이며 음수는 손실입니다. 아래 중앙값과 구간은 블록 차이 통계입니다. 131C-01의 순서통계량 구간은 24블록, k=6, 포함률 하한 99.3389248848%입니다.

| 행 | 차이 중앙값(ms) | 구간(ms) | 하한(ms) | 첫 블록 | 확인 블록 | 분류 |
| --- | ---: | --- | ---: | ---: | --- | --- |
| nested-d5-f4/off/update-wall | 0.026081500 | [−0.046793000, 0.052331000] | 0.019750837 | 24 | null | 유의한 변화 관측되지 않음 |
| nested-d5-f4/off/update-active | 0.025937438 | [−0.044459045, 0.052791834] | 0.019773963 | 24 | null | 유의한 변화 관측되지 않음 |
| nested-d5-f4/off/mount-wall | 0.128938000 | [−1.682041000, 1.617875000] | 0.946487395 | 24 | null | 유의한 변화 관측되지 않음 |
| nested-d5-f4/off/mount-active | −0.054625950 | [−1.310666009, 1.564418030] | 0.934459583 | 24 | null | 유의한 변화 관측되지 않음 |

네 구간 모두 0을 포함합니다. 갱신 두 행의 양의 중앙값은 하한보다 크지만 구간이 0을 포함하여 이득 요건을 충족하지 않습니다. 마운트 두 행은 중앙값의 절댓값도 하한보다 작습니다. wall과 active는 같은 fixture의 별개 보고 열이며 독립적인 두 시나리오를 뜻하지 않습니다.

## 유의한 이득

유의한 이득은 **0행**입니다. `report.gains=[]`이며 공식 판정 4행 모두 `verdict.gain=false`입니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다.

**네 고침 합본(F-B·F-C·F-F·F-E)은 part 4에 도달하지 않았으므로 nested-d5의 앞선 첫 측정이나 독립 확인값과 비교하지 않습니다.** 이번 값으로 이전 회귀의 해소나 이전 이득의 유지·소실을 판단하지 않습니다. 아래는 이번 세 고침 후보의 기준·후보 중앙값만 기록합니다.

| 행 | 136h 기준 / 후보 중앙값(ms) |
| --- | ---: |
| nested-d5-f4/off/update-wall | 3.950167500 / 3.932876000 |
| nested-d5-f4/off/update-active | 3.954792559 / 3.938893974 |
| nested-d5-f4/off/mount-wall | 189.297479000 / 189.316083000 |
| nested-d5-f4/off/mount-active | 186.891916519 / 186.945853989 |

이 기준·후보 중앙값의 차이와 블록별 차이의 중앙값은 서로 다른 통계입니다. 갱신 점 추정은 약 +26.1·+25.9µs이지만 구간은 음의 값도 포함하므로 이득이나 동등성을 확정하지 않습니다. F-E 단독의 인과 기여를 확정하지 않습니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 적용 결과, **면제된 회귀는 없습니다**. 표시 회귀 자체가 없어 면제 대상과 `report.exemption.rows`가 모두 비어 있습니다. `axisGainMs=0`, `regressionTotalMs=0`입니다. 면제 객체의 `provisional=true` 및 기록용 label은 실제 행에 면제를 부여했다는 뜻이 아닙니다.

| fixture | 마운트 행의 calls | 갱신 행의 calls |
| --- | ---: | ---: |
| nested-d5-f4 | 9,560 | 300 |

작업 계수는 공식 wall·active 열과 해당 단계의 기록·no-GC 열에 적용됩니다. 설정을 모두 24블록으로 측정하였습니다. 계수는 지정된 입력에 따른 작업 범위의 계수이고 시간이나 절감량으로 해석하지 않습니다.

## part 4의 결정

러너 판정은 **ADOPT**입니다. 136C-01의 F-B·F-C·F-F 후보에 대해 선택된 `nested-d5-f4/off`의 공식 판정 4행에서 채택을 막는 회귀가 표시되지 않았습니다. 유의한 이득은 0행입니다. 공식 판정 행은 모두 24블록이며 축소 측정은 없습니다. 네 고침 합본은 이 part에 도달하지 않았으므로 앞선 합본값과의 비교 결론은 없습니다. 이번 결정은 마지막 part 4의 선택 행에 한정하며 이번에 포함한 고정 감시 설정은 없습니다. 개별 F-B·F-C·F-F의 기여로 분해하거나 다른 part를 포함한 React 전체의 별도 채택 판정을 발행하지 않습니다. F-E의 보류를 유지합니다.

## 시간 분해와 예산

시작 시각은 최종 JSON의 `environment.startedAt` 기준 2026-10-11 10:18:01.642 KST, 종료 시각은 10:43:04.534 KST입니다. 최종 JSON의 `time.totalMs=1502891.4134159999`에 따른 wall time은 **1,502.891초**, 즉 **25분 2.891초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 기록 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

첫 통과의 사전 추정은 1,573.945초이고 확인 여유는 1,200.000초입니다. 합계 2,773.945초가 시작 시 남은 예산 7,099.960초 안에 들어가 사전 검사를 통과하였습니다. 표시 회귀가 없어 확인 직전의 추가 예산 검사는 필요하지 않았습니다. 사전 검사와 종료 로그는 다음과 같습니다.

```text
SESSION_131_ESTIMATE: first pass 1573.945s + reserve 1200.000s = 2773.945s; remaining 7099.960s
SESSION_131_OK: {scratch}/session-136h/final.json; all steps passed; wall 1502.891s
```

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 1,502.876 |
| 독립 확인 구간: `time.confirmMs` | 0.000 |
| 보고 계산: `time.reportMs` | 0.016 |
| 전체 wall time | 1,502.891 |

`time.confirmMs`의 원값 0.0032079999800771475ms는 확인 분기의 부수 비용이며 독립 확인 측정은 0개입니다. 첫 통과 worker 48개가 순차 실행되었고 worker wall time의 합은 1,502.620초입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 10.491 |
| 예열 | 491.768 |
| 강제 GC | 39.567 |
| 시계 밖 minor GC | 8.222 |
| 표본 | 982.909 |
| digest | 207.443 |
| React 보정 | 14.302 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-136h-session/summary.md)
- [러너의 최종 JSON gzip](./profile-136h-session/final.json.gz)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-136h-session/raw-sha256.txt)

최종 JSON 원본은 2,938,542바이트이며 136g와 같은 산출물 모양으로 gzip 보관하였습니다. 보관한 gzip은 74,627바이트, 요약은 3,963바이트, `raw-sha256.txt`는 15,550바이트이므로 모든 보관 산출물은 5MB 미만입니다. 해시 목록은 러너의 `sha256.txt`를 그대로 복사한 목록이며 경로는 원 세션 디렉터리 기준입니다. 원자료와 실행 로그 `S/session-136h.log`는 S의 원 세션에 남아 있습니다.

압축을 풀어 원본 JSON과 바이트 동일성을 확인하였습니다. 요약 및 SHA-256 목록도 원본과 바이트가 같습니다. 압축 해제한 JSON의 SHA-256은 `ee9e3e2454d4e51de39ad958e5f27adef577e249e9a2029ba4b422552e1efbad`입니다.

## 커밋에 적용한 소스

채택 커밋 `daca1d14a`는 `fbx.patch`에서 `fe.patch`를 역적용한 트리이며, 실행 파일 셋은 이 판정에 쓴 fb·fc·ff 적용 트리와 바이트가 같습니다. 개별 `fb.patch`에 있던 `tools/measure-react-render-counts.mjs`의 변경(`countsOnly`일 때도 다섯 쓰기를 포함)은 커밋에 넣지 않았으며, 시간 측정 재현에는 필요하지 않습니다. 시간 판정은 `run-session-131.mjs` 경로로 재며 이 도구를 쓰지 않습니다. 이 도구의 계수 전용 모드에서 그 변경이 하던 일은 커밋된 시험 도우미 `runtimeCounts.mjs`가 같은 치환을 메모리에서 적용하여 재현합니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `daca1d14a840`, `e805074de8a9`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
