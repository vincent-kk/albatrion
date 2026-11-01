# 136c2 세션: F-B·F-C·F-F·F-E 결합 React 판정 part 3의 독립 확인

이번 part 3의 최종 판정은 **REJECT**입니다. 136c에서 표시한 `array-1000/off/update-wall`과 `array-1000/off/update-active`가 독립적인 24블록 확인에서도 모두 회귀로 확인되었습니다. 표시 회귀 2행, 확인 회귀 2행, 면제 회귀 0행, 채택을 막는 확인 회귀 2행입니다. 실행 상태는 `passed`, 종료 표식은 `SESSION_131_OK`, 실행 셸의 종료 코드는 0입니다. 정상 계산한 REJECT이며 도구 실행 실패가 아닙니다. 범위는 part 3의 `array-1000/off` 선택 행에 한정합니다.

## 실행 환경과 입력

- 작업 트리: `{repo}`
- D: `packages/canard/schema-form/architecture/verification/07-switch`
- S: `{scratch}`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `{node-home}/versions/node/v26.11.1/bin/node`
- 엔진: Codex
- 번들 매니페스트 기준 리비전: `e805074de8a9cb0c072a81284a166ab985a113be`

먼저 `D/profile-136c-session.md`와 `D/harness-131.md`를 읽었습니다. 시작 작업 트리는 요청에서 깨끗한 상태로 지정되었습니다. 기존 `D/tools/run-session-131.mjs`를 요청한 인수 그대로 한 번 실행하였습니다. 측정 코드 작성, git 쓰기, 설치, 제품 변경, 번들 재빌드 및 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너의 결과를 읽고 이 보고서와 산출물을 보존하였습니다. 측정 및 결과 확인에 사용한 Node는 모두 위 지정 경로입니다.

첫 보고 입력은 `S/session-136c/first-report.json`이며 SHA-256은 `75d6fa80d0cb7fc3d7872df01d08c6269937db546ad28c1be65f14e77f35939e`입니다. 원래 첫 판정은 `CONFIRMATION_PENDING`이며 첫 측정을 다시 실행하지 않았습니다. 행 파일은 `S/rows-fb-4.json`, SHA-256은 `2e4b599f458fb220cd6750bb9e2c89fca2c8961996ea3195fa648a28b33c8497`입니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r133-base.cjs`, SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. 후보 번들은 `S/bundles/r133-fbx.cjs`, SHA-256은 `9e4ba12ac2d9f124a88b29f4b1d12e990dcf65446c7dbf16365131d2aa54c32d`입니다. 작업 계수는 `S/session-135-counts/react-counts.json`, SHA-256은 `4115fc9db9ddfd598f29896de3227f4c954d2e402320068b1a51686f6db24391`입니다. A/A는 `S/session-132c/final.json`, SHA-256은 `d14093e382ebbf89d9c72e0f31df1d69198622d8f4b4ab1253113c502b363604`입니다. 이 A/A는 같은 Node 판에서 실행한 `passed`·`AA_PASS` 자료이고 해당 설정의 공식 4행은 각각 8블록입니다. 136c가 기록한 Q133의 재사용 조건을 유지하였으며 별도 A/A나 재빌드를 수행하지 않았습니다. 매니페스트 기준 리비전을 현재 HEAD라고 해석하지 않습니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 지정 로그로 보냈으며 백그라운드 프로세스를 실행 셸의 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=confirm --lane=react \
  --rows={scratch}/rows-fb-4.json \
  --first-report={scratch}/session-136c/first-report.json \
  --base={scratch}/bundles/r133-base \
  --candidate={scratch}/bundles/r133-fbx \
  --blocks=24 \
  --touch-counts={scratch}/session-135-counts/react-counts.json \
  --aa={scratch}/session-132c/final.json \
  --node-version=v26.11.1 \
  --out={scratch}/session-136c2 \
  > {scratch}/session-136c2.log 2>&1 &
```

별도의 짧은 명령으로 최초 2초, 이후 각 55초를 sleep하고 진행 행을 한 줄씩 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_OK`를 함께 확인한 뒤 폴링을 종료하였습니다. 시작 셸에서 `nice(5) failed: operation not permitted`가 출력되었지만 러너는 사전 검사와 확인 worker 48개를 완료하였습니다. 옵션 또는 입력 거부는 없었으며 인수를 변경하거나 재실행하지 않았습니다.

## 감시 범위와 실제 블록

선택 설정은 `array-1000/off` 한 개입니다. 최종 보고는 136c의 공식 판정 4행과 기록 12행을 유지하며 모두 첫 24블록을 사용합니다. 이번 독립 확인 대상으로 내보낸 짝 행은 표시 회귀 2행이며 각각 확인 24블록을 사용합니다. `rowsBelowDesignBlocks=0`이고 축소 행은 없습니다. 131C-01에 따라 실제 측정 블록을 전부 사용하였습니다.

| 범위 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | ---: | --- |
| 공식 판정 행 | 4 | 모두 24 | 표시 회귀 2행 각각 24, 나머지 null |
| 기록 행 | 12 | 모두 24 | 최종 보고의 확인 필드 null |
| 표시 및 확인 회귀 | 2 | 각각 24 | 각각 24 |
| 축소 행 | 0 | 해당 없음 | 해당 없음 |

이번 명령에는 `--watch-in-selection`을 추가하지 않았습니다. 확인 전용 세션의 `rowSelection.watchAdded=[]`이며 이번 part에 새로 포함한 고정 감시 설정은 없습니다. 136c 기록에 따르면 고정 감시 설정 6개는 part 1·2에 나누어 포함되었습니다. 이번 독립 확인은 그 세션들을 다시 측정하거나 결합 React 전체 범위를 판정한 것이 아닙니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너 결과 그대로 적용하였습니다. 차이는 기준에서 후보를 뺀 값이며 음수는 손실입니다. 아래 중앙값은 블록 차이의 중앙값입니다. 첫 값은 `report.rows[].statistic`, 확인 값은 `report.confirmation.rows[].second.statistic`에서 읽었습니다. 각 24블록 구간은 131C-01의 k=6 순서통계량 구간이고 포함률 하한은 99.3389248848%입니다.

| 행 | 첫 중앙값(ms) | 첫 구간(ms) | 첫 하한(ms) | 첫 블록 | 확인 중앙값(ms) | 확인 구간(ms) | 확인 하한(ms) | 확인 블록 | confirmStatus |
| --- | ---: | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| array-1000/off/update-wall | −0.139729500 | [−0.190249000, −0.068375000] | 0.029187500 | 24 | −0.070583500 | [−0.103125000, −0.027500000] | 0.029187500 | 24 | 확인됨 |
| array-1000/off/update-active | −0.143312544 | [−0.191874921, −0.068041027] | 0.029374450 | 24 | −0.070208013 | [−0.102499962, −0.027208984] | 0.029374450 | 24 | 확인됨 |

두 행 모두 첫 측정과 독립 확인의 구간 전체가 0 아래이며, 각 손실 중앙값이 해당 하한을 넘었습니다. 러너는 두 행 모두 `second.verdict.regression=true`, `confirmed=true`, `confirmBlocks=24`, `confirmStatus=확인됨`으로 기록하였습니다. 확인 손실 중앙값이 첫 측정보다 작아졌지만 round-128 규칙의 양쪽 회귀 요건을 충족합니다. wall과 active는 같은 fixture의 별개 보고 열이며 독립적인 두 시나리오를 뜻하지 않습니다.

## 유의한 이득

136c 첫 통과에서 관측한 마운트 이득 2행을 유지합니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다.

| 행 | 첫 차이 중앙값(ms) | 첫 구간(ms) | 하한(ms) | 첫 블록 | 확인 블록 |
| --- | ---: | --- | ---: | ---: | --- |
| array-1000/off/mount-active | 10.087021 | [4.888291, 16.722500] | 2.955099480 | 24 | null |
| array-1000/off/mount-wall | 10.315750 | [5.119708, 16.505458] | 2.965025105 | 24 | null |

## 124C-01 면제와 작업 계수

round-128에서 수정한 124C-01의 최종 적용 결과, **면제된 회귀는 없습니다**. `axisGainMs=0`, `regressionTotalMs=0.28304204362939345`, `provisional=false`입니다. 회귀 합계와 아래 손실 비율은 러너가 첫 통과의 표시 손실로 계산한 값이며 확인 손실의 합계로 바꾸지 않았습니다. 별도 코어 축 이득 입력은 제공하지 않았습니다.

| 표시 행 | 첫 손실 비율 | 대응 no-GC 짝 행 | no-GC 차이 중앙값(ms) | no-GC 구간(ms) | 첫 블록 | 확인 블록 필드 | 면제 |
| --- | ---: | --- | ---: | --- | ---: | --- | --- |
| array-1000/off/update-wall | 7.863594% | array-1000/off/update-wall-nogc | 0.014292500 | [−0.000958000, 0.027792000] | 24 | null | 없음 |
| array-1000/off/update-active | 8.048723% | array-1000/off/update-active-nogc | 0.014000028 | [−0.002790987, 0.027333975] | 24 | null | 없음 |

최종 보고의 no-GC 짝 행 통계는 136c에서 보존한 첫 24블록입니다. 확인용 worker 원자료는 S에 남아 있지만 러너가 확인 짝 보고로 내보낸 행은 공식 표시 2행뿐입니다. no-GC 행의 `confirmBlocks`, `confirmStatus`, `confirmGcObservation`은 null이며 별도의 확인 no-GC 중앙값이나 구간을 계산하지 않았습니다. 위 표를 확인 no-GC 통계로 해석하지 않습니다.

두 no-GC 구간은 0을 포함하고 작업 계수도 존재하지만, 두 표시 행 모두 조건 (1)의 축 이득 요건과 조건 (2)의 2%·5µs 요건을 충족하지 못하여 `exempted=false`입니다. no-GC 구간이 0을 포함한다는 사실만으로 면제가 성립하지 않습니다. 면제 객체의 기록용 label도 실제 면제를 뜻하지 않습니다.

| no-GC 짝 행 | 기준/후보 쓰기 GC 비율 | 기준/후보 GC 없는 원시 중앙값(ms) | 기준/후보 표본 수 |
| --- | --- | --- | --- |
| array-1000/off/update-wall-nogc | 0 / 0 | 1.319000000 / 1.302395500 | 984 / 984 |
| array-1000/off/update-active-nogc | 0 / 0 | 1.322124988 / 1.306228966 | 984 / 984 |

위 GC 관측도 최종 보고가 유지한 첫 통과 자료이며 블록 차이 통계나 독립 확인 판정을 대체하지 않습니다. 공식 강제 GC 행의 `gcObservation`과 `confirmGcObservation`은 null입니다. null은 해당 열에서 GC를 관측하지 않았다는 뜻입니다. 작업 계수는 마운트 행 calls=28,019, 갱신 행 calls=20이며 시간이나 절감량이 아닙니다.

## part 3의 결정

**REJECT**입니다. 첫 측정과 독립적인 24블록 확인이 모두 회귀로 판정한 갱신 wall·active 2행이 있으며, 최종 면제는 없고 `blockingRegressions`는 이 2행입니다. 136c의 확인 대기를 이번 결과로 해소하였습니다. 마운트 이득 2행을 유지하지만 해당 회귀가 part 3의 채택을 막습니다. 이 결정은 part 3의 선택 행에 한정하며 개별 F-B·F-C·F-F·F-E의 기여를 분해하거나 결합 React 전체에 대한 별도 채택 판정을 발행하지 않습니다.

## 시간 분해와 예산

최종 JSON의 `environment.startedAt`는 2026-10-11 01:53:37.117 KST, `endedAt`는 2026-10-11 03:13:07.511 KST입니다. `time.totalMs=4770393.224791001`에 따른 wall time은 **4,770.393초**, 즉 **79분 30.393초**입니다. 마지막 요약·해시 목록 쓰기 및 보고서·산출물 보존 비용은 러너의 wall time에서 제외됩니다.

사전 추정 5,000.012초에 추가 확인 여유 0초를 더한 합계가 남은 예산 7,099.852초 안에 들어 `preflight.fits=true`였습니다. 확인 전용 실행이므로 첫 통과 비용을 다시 사용하지 않았습니다. 확인 worker 48개는 모두 종료 코드 0이며 worker wall time 합은 4,770.140초입니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 확인·보고 외 세션 비용 | 0.170 |
| 독립 확인: `time.confirmMs` | 4,770.202 |
| 보고 계산: `time.reportMs` | 0.021 |
| 전체 wall time | 4,770.393 |

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 10.538 |
| 예열 | 1,553.268 |
| 강제 GC | 94.194 |
| 시계 밖 minor GC | 5.093 |
| 표본 | 3,166.344 |
| digest | 783.451 |
| React 보정 | 35.797 |

예열과 표본은 GC 및 digest 시간을 포함하므로 단계들을 단순 합산하지 않습니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-136c2-session/summary.md)
- [러너의 최종 JSON](./profile-136c2-session/final.json)
- [입력으로 사용한 136c 첫 보고](./profile-136c2-session/first-report.json)
- [136c2 러너가 출력한 first-report.json](./profile-136c2-session/runner-first-report.json)
- [update-wall 독립 확인 짝 원자료](./profile-136c2-session/pair-array-1000-off-update-wall.json)
- [update-active 독립 확인 짝 원자료](./profile-136c2-session/pair-array-1000-off-update-active.json)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-136c2-session/raw-sha256.txt)

최종 JSON은 2,927,601바이트로 5MB 이하이므로 압축하지 않았습니다. 요약은 3,845바이트, 입력 첫 보고는 34,237바이트, 러너의 first-report는 36,273바이트, SHA-256 목록은 14,538바이트입니다. 러너의 이번 first-report 파일에는 최종 `REJECT`가 기록되어 있으므로 원래 `CONFIRMATION_PENDING` 입력과 구별하여 둘 다 보존하였습니다. SHA-256 목록의 경로는 원 세션 디렉터리 기준이며 일부 첫 원자료는 136c 세션을 참조합니다. 원 worker 자료와 로그 `S/session-136c2.log`는 S에 남아 있습니다.

최종 JSON의 SHA-256은 `377e1c0d8cff66b3eab60efca489709e76ef558a45b40f1e32f479a56f19cbe4`입니다. 입력 첫 보고의 SHA-256은 `75d6fa80d0cb7fc3d7872df01d08c6269937db546ad28c1be65f14e77f35939e`, 러너 first-report의 SHA-256은 `4adcea84061b04b26395bb4ebd28cc133dfb2bc6723836b58d3cea86cd00ddc4`입니다. 보존 파일의 원본과의 바이트 동일성, 각 파일의 5MB 상한 및 보고서의 산출물 링크 존재를 확인하였습니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `e805074de8a9`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
