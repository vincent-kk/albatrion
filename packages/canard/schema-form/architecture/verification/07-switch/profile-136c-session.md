# 136c 세션: F-B·F-C·F-F·F-E 결합 React 판정 part 3

이번 part 3은 **독립 확인 측정의 예산 부족으로 실패**하였습니다. 첫 통과의 판정은 **CONFIRMATION_PENDING**입니다. 표시 회귀 2행, 확인 회귀 0행, 미확인 회귀 표시 2행이며 유의한 이득은 2행입니다. 실행 상태는 `failed`이고 종료 표식은 `SESSION_131_FAILED`, 실행 셸의 종료 코드는 1입니다. 최종 ADOPT 또는 REJECT는 발행되지 않았습니다. 범위는 `array-1000/off`의 선택 행에 한정합니다. 공식 판정 4행을 모두 24블록으로 측정하였으며 축소 행은 없습니다. 아래 감시 범위의 제한도 함께 적용합니다.

## 실행 환경과 입력

- 작업 트리: `{repo}`
- D: `packages/canard/schema-form/architecture/verification/07-switch`
- S: `{scratch}`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `{node-home}/versions/node/v26.11.1/bin/node`
- 엔진: Codex
- 번들 매니페스트 기준 리비전: `e805074de8a9cb0c072a81284a166ab985a113be`

실행 전에 `D/profile-136b-session.md`, `D/harness-131.md`, `D/fb-ff-fe-implementation.md`를 읽고 `D/performance.md`의 Q133 방법을 확인하였습니다. 시작 작업 트리는 요청에서 깨끗한 상태로 지정되었습니다. 기존 `D/tools/run-session-131.mjs`를 한 번 실행하였으며 측정 코드 작성, git 쓰기, 설치, 제품 코드 변경, 번들 재빌드 및 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너가 보존한 결과를 읽고 이 기록과 요청된 산출물을 보관하였습니다. 측정 및 결과 확인에서 사용한 Node는 모두 위 지정 경로입니다. 예산 거부 뒤 재실행하거나 측정 조건을 변경하지 않았습니다.

행 파일은 `S/rows-fb-4.json`이며 SHA-256은 `2e4b599f458fb220cd6750bb9e2c89fca2c8961996ea3195fa648a28b33c8497`입니다. 실제 선택 설정은 요청된 **`array-1000/off`** 한 개입니다. 해당 설정의 16개 열을 선택하여 공식 판정 4행과 기록 12행을 첫 통과에서 보고하였습니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r133-base.cjs`이고 SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. 후보 번들은 `S/bundles/r133-fbx.cjs`이고 SHA-256은 `9e4ba12ac2d9f124a88b29f4b1d12e990dcf65446c7dbf16365131d2aa54c32d`입니다. 작업 계수는 `S/session-135-counts/react-counts.json`이고 SHA-256은 `4115fc9db9ddfd598f29896de3227f4c954d2e402320068b1a51686f6db24391`입니다. A/A는 round 134에 따라 `S/session-132c/final.json`을 재사용하였으며 SHA-256은 `d14093e382ebbf89d9c72e0f31df1d69198622d8f4b4ab1253113c502b363604`입니다. 재사용한 A/A의 실행 상태는 `passed`, 판정은 `AA_PASS`이고 `array-1000/off`의 공식 4행은 각각 8블록입니다. Q133에 따라 이번 24블록 판정 행의 105C-01 하한에 이 8블록 A/A를 사용하는 것이 허용됩니다. 별도의 24블록 A/A를 실행하지 않았습니다.

요청에서 명시한 `D/g27-fixes.md`의 현재 HEAD 재빌드와 기준 번들의 바이트 동일성 확인을 전제로 하며, 이번 세션에서 재빌드나 별도 A/A는 실행하지 않았습니다. 매니페스트의 기준 리비전을 현재 HEAD라고 해석하지 않습니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 하나의 로그로 보냈으며 셸의 백그라운드 프로세스를 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=verdict --lane=react \
  --rows={scratch}/rows-fb-4.json \
  --watch-in-selection \
  --base={scratch}/bundles/r133-base \
  --candidate={scratch}/bundles/r133-fbx \
  --blocks=24 \
  --touch-counts={scratch}/session-135-counts/react-counts.json \
  --aa={scratch}/session-132c/final.json \
  --node-version=v26.11.1 \
  --out={scratch}/session-136c \
  > {scratch}/session-136c.log 2>&1 &
```

별도의 짧은 명령으로 폴링하였으며 최초 sleep은 2초, 이후 각 sleep은 50초입니다. 각 명령은 진행 행을 한 줄 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_FAILED`를 함께 확인한 뒤 폴링을 종료하였으며 실행 셸의 종료 코드도 1입니다. 시작 셸은 `nice(5) failed: operation not permitted`를 출력하였지만 러너가 시작되어 최초 사전 검사와 첫 통과의 worker 48개를 완료하였습니다.

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. **이번 part 3에서 포함한 고정 감시 설정은 없습니다.** 선택한 `array-1000/off`는 고정 감시 설정이 아니며 `rowSelection.watchAdded=[]`입니다. 최종 JSON의 scoping 16행은 모두 `reason=touched`이고 명시적 `watch` 행은 0개입니다.

| 감시 행 | calls | 첫 블록 | 확인 블록 |
| --- | ---: | ---: | --- |
| 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 |

고정 감시 설정인 `array-500/off`, `flat-50/off`, `oneOf-20/off`, `sample-1/off`, `computed-visible-derived/off`, `array-replace-200/off`는 이번 part 3에 포함되지 않았습니다. `D/profile-136b-session.md`에 따르면 앞의 다섯 설정은 part 1인 `D/profile-136a-session.md`에서, `array-replace-200/off`는 part 2에서 측정되었습니다. 그 기록상 part 1과 part 2를 합치면 고정 감시 설정 6개가 포함됩니다. part 1의 `sample-1/off`와 `computed-visible-derived/off`는 명시적 `watch` 분류가 아닌 양수 계수의 `touched` 행으로 24블록 측정되었다는 구별을 유지합니다. 감시 범위의 충족을 이번 실패 세션의 채택이나 결합 React 전체 범위의 채택으로 해석하지 않습니다.

처음 계획과 실제 사용 블록은 모두 **16행이 24블록**입니다. 131C-01에 따라 측정한 블록을 전부 사용하였으며 첫 보고의 16행은 모두 `scopeReason=touched`입니다. `all-measured-blocks` 승격이나 축소 행은 없습니다.

| 실제 블록 | 설정 | 공식 판정 행 | 기록 행 |
| ---: | --- | ---: | ---: |
| 24 | array-1000/off | 4 | 12 |

실제 축소 행은 **0개**입니다. 독립 확인 worker는 시작되지 않았습니다. 실패 최종 JSON에는 `report`가 없으므로 행별 최종 `confirmBlocks`, `confirmStatus`, `observation131`도 발행되지 않았습니다. 아래의 확인 블록 `null` 표기는 확인 측정 미실시를 나타내며, 성공 최종 보고에서 읽은 필드가 아닙니다. 행별 통계와 첫 판정은 보존한 `first-report.json`에서 읽었습니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너의 결과 그대로 적용하였습니다. 차이의 부호는 기준에서 후보를 뺀 값이므로 음수는 손실입니다. 131C-01의 순서통계량 구간은 첫 보고의 모든 행에서 24블록, k=6, 포함률 하한 99.3389248848%입니다.

| 구분 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | --- | --- |
| 공식 판정 행 | 4 | 모두 24 | 미실시 |
| 표시 회귀 | 2 | 모두 24 | null: 미실시 |
| 확인 회귀 | 0 | 해당 없음 | 미실시 |
| 확인 대기 회귀 표시 | 2 | 모두 24 | null: 예산 거부 |
| 최종 채택을 막는 확인 회귀 | 미확정 | 해당 없음 | 최종 판정 미발행 |

첫 통과에서 다음 2행이 표시되어 `confirmationPlan`에 들어갔습니다.

| 표시 행 | 차이 중앙값(ms) | 구간(ms) | 105C-01 하한(ms) | 첫 블록 | 확인 블록 | 상태 |
| --- | ---: | --- | ---: | ---: | --- | --- |
| array-1000/off/update-active | −0.143312544 | [−0.191874921, −0.068041027] | 0.029374450 | 24 | null | 확인 대기: 예산 거부 |
| array-1000/off/update-wall | −0.139729500 | [−0.190249000, −0.068375000] | 0.029187500 | 24 | null | 확인 대기: 예산 거부 |

두 행은 구간 전체가 0 아래이고 손실 중앙값이 해당 행의 하한을 넘었습니다. 첫 보고의 `confirmation=null`, `decision=CONFIRMATION_PENDING`입니다. 독립 확인 전 예산 검사에서 실패하여 확인 worker는 실행하지 않았습니다. round-128 규칙은 두 독립 측정 모두 회귀일 때만 확인 회귀로 셉니다. 따라서 확인 회귀 0행은 이번 표시가 해소되었거나 회귀가 없다는 뜻이 아니며, **두 표시 모두 미확인**입니다. 첫 보고의 `blockingRegressions=[]`도 채택 근거로 사용할 수 없습니다.

## 유의한 이득

첫 통과의 유의한 이득은 **2행**입니다. 아래는 `first-report.json`의 `gains`에 있는 공식 판정 행만 기록한 것입니다. 양의 값은 기준보다 후보가 빠르다는 뜻이며 차이 중앙값과 구간은 블록 차이 통계입니다.

| 행 | 차이 중앙값(ms) | 구간(ms) | 첫 블록 | 확인 블록 |
| --- | ---: | --- | ---: | --- |
| array-1000/off/mount-active | 10.087021 | [4.888291, 16.722500] | 24 | null |
| array-1000/off/mount-wall | 10.315750 | [5.119708, 16.505458] | 24 | null |

두 행 모두 구간 전체가 0 위에 있고 차이 중앙값이 러너의 행별 A/A·0.5% 하한을 넘었습니다. mount-active의 하한은 2.955099480ms, mount-wall의 하한은 2.965025105ms입니다. 같은 fixture의 wall과 active는 별개 보고 열이며 독립된 두 시나리오를 뜻하지 않습니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다. 이득 2행은 첫 통과의 관측으로 보존하며, 확인이 미완료된 세션 전체의 채택으로 해석하지 않습니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 첫 통과 적용 결과, **면제된 회귀는 없습니다**. 두 표시 행 모두 `exempted=false`입니다. `axisGainMs=0`, `regressionTotalMs=0.28304204362939345`이고 면제 계산은 `provisional=true`입니다. 별도 코어 축 이득 입력을 제공하지 않았으며 React 마운트 이득을 코어 축 이득으로 대체하지 않았습니다.

| 표시 행 | 손실 비율 | no-GC 차이 중앙값(ms) | no-GC 구간(ms) | 면제 결과 |
| --- | ---: | ---: | --- | --- |
| array-1000/off/update-active | 8.048723% | 0.014000028 | [−0.002790987, 0.027333975] | 면제 없음 |
| array-1000/off/update-wall | 7.863594% | 0.014292500 | [−0.000958000, 0.027792000] | 면제 없음 |

각 no-GC 열은 24블록 측정되었고 구간이 0을 포함하며 작업 계수가 있습니다. 그러나 두 행 모두 조건 (1)의 축 이득 요건과 조건 (2)의 2%·5µs 요건을 충족하지 않았습니다. no-GC 구간이 0을 포함한다는 사실만으로 면제가 성립하지 않습니다. 면제 객체의 기록용 label은 실제 행에 면제를 부여했다는 뜻이 아닙니다.

| fixture | 마운트 행의 calls | 갱신 행의 calls |
| --- | ---: | ---: |
| array-1000 | 28,019 | 20 |

작업 계수는 공식 wall·active 열과 해당 단계의 기록·no-GC 열에 적용됩니다. 선택한 16행의 계수는 모두 양수이며 해당 설정을 모두 24블록으로 측정하였습니다. 계수는 런타임 작업 수 차이의 계수이고 시간이나 절감량으로 해석하지 않습니다.

## part 3의 결정

첫 통과의 판정은 **CONFIRMATION_PENDING**, 세션 실행 상태는 **failed**입니다. `array-1000/off/update-active`와 `array-1000/off/update-wall`의 표시 회귀 2행을 독립 확인하지 못하여 최종 ADOPT 또는 REJECT가 없습니다. 공식 판정 행은 모두 24블록이며 축소 측정은 없습니다. 첫 통과의 유의한 이득은 `array-1000/off`의 마운트 wall·active 2행에 한정합니다. 이번 기록은 part 3의 선택 행에 한정하며 고정 감시 설정은 이번 part에 포함되지 않았습니다. 개별 F-B·F-C·F-F·F-E의 기여로 분해하거나 결합 React 전체의 채택을 주장하지 않습니다.

러너의 실패 메시지는 다음과 같습니다. 요청에 따라 거부 뒤 실행을 중단하였고 조건을 바꾸어 재시도하지 않았습니다.

```text
Before measurement: estimated 5000.012s + confirmation reserve 0.000s exceeds remaining budget 2242.264s; split --rows
```

## 시간 분해와 예산

시작 시각은 최종 JSON의 `environment.startedAt` 기준 2026-10-11 00:27:11.643 KST, 종료 시각은 2026-10-11 01:48:11.353 KST입니다. 최종 JSON의 `time.totalMs=4859709.311334`에 따른 wall time은 **4,859.709초**, 즉 **80분 59.709초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 기록 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

최초 사전 추정은 5,000.012초이고 확인 여유는 1,250.003초입니다. 합계 6,250.015초가 시작 시 남은 예산 7,099.964초 안에 들어가 첫 검사를 통과하였습니다. 첫 통과에서 표시된 2행의 독립 확인을 실행하려면 같은 `array-1000/off` 설정의 24블록 worker 48개가 필요하다는 추정이 나왔습니다. 확인 직전 추정 5,000.012초가 남은 예산 2,242.264초를 넘어 `confirmPreflight.fits=false`로 거부되었습니다. 최초 확인 여유는 완료 보장이 아니며, 실패를 최초 사전 검사 거부나 입력 검증 실패로 해석하지 않습니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 4,859.693 |
| 독립 확인 구간: `time.confirmMs` | 0.000 |
| 보고 계산: `time.reportMs` | 0.016 |
| 전체 wall time | 4,859.709 |

독립 확인 측정은 0개입니다. 첫 통과 worker 48개가 순차 실행되었고 모두 종료 코드 0이며 worker wall time의 합은 4,859.444초입니다. 세션 실패는 이 첫 통과 뒤의 확인 예산 거부입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 10.679 |
| 예열 | 1,579.171 |
| 강제 GC | 95.190 |
| 시계 밖 minor GC | 5.102 |
| 표본 | 3,229.108 |
| digest | 810.908 |
| React 보정 | 36.269 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-136c-session/summary.md)
- [러너의 실패 최종 JSON gzip](./profile-136c-session/final.json.gz)
- [러너의 첫 통과 보고 JSON](./profile-136c-session/first-report.json)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-136c-session/raw-sha256.txt)

최종 JSON 원본은 2,876,362바이트이며 part 2와 같은 보관 형식으로 66,670바이트의 gzip을 보존하였습니다. 요약 원본은 1,947바이트, 첫 보고는 34,237바이트이고 `raw-sha256.txt`는 러너의 `sha256.txt`를 그대로 복사한 15,518바이트 목록입니다. 각 보존 산출물은 5MB 이하이며 SHA-256 목록의 경로는 원 세션 디렉터리 기준입니다. 실패 최종 JSON에 행별 `report`가 없으므로 회귀 표시·이득·잠정 면제와 `CONFIRMATION_PENDING`을 검토할 수 있도록 첫 보고도 함께 보존하였습니다. 러너 요약의 빈 행별 표나 일반 문구를 최종 채택 판정으로 사용하지 않았습니다.

압축 해제한 JSON과 원본의 바이트 동일성을 확인하였고 요약·첫 보고·SHA-256 목록도 원본과 바이트가 같습니다. 보고서의 산출물 링크가 모두 존재함을 확인하였습니다. 원자료와 실행 로그 `S/session-136c.log`는 S의 원 세션에 남아 있습니다. 최종 JSON 원본의 SHA-256은 `ee10e8e7a6ef971cfb5fc479ee5c3b1ff7998f775db82539ce4362891c4c6817`이고 첫 보고의 SHA-256은 `75d6fa80d0cb7fc3d7872df01d08c6269937db546ad28c1be65f14e77f35939e`입니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `e805074de8a9`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
