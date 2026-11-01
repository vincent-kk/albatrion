# B0 분기 전환 비용 장부

같은 프로세스 쌍의 oneOf-80은 0.16.1 **87.459 µs**, 단계 시작 판 **522.583 µs**, **5.975배**입니다. 두 값 모두 **쓰기 2회(왕복 1회) 합계**이며 쓰기당 43.730 / 261.291 µs입니다. discriminator-80과 if-80은 새 엔진 전용으로 각각 왕복 947.291 / 1,191.791 µs, 같은 새 판 active-80의 1.813 / 2.281배입니다. 제품 코드·시험·공개 겉면 변경은 없습니다. 이 문서는 목표선이나 개선 판정을 제안하지 않습니다.

## 환경과 창

- 단계 시작 커밋: `0eb03ff3bb54bf06af95271d157aefece1b9bf32`. 바로 전 `b8db53997`에서 제품 코드는 같고 분기 전환 단계 문서만 추가된 판입니다.
- Node v26.12.1(`{node-home}/bin/node`), Apple M1 Max, macOS 27.0.1(26A434), AC 전원·배터리 80%입니다. 각 B0 entry가 내부에서 `NODE_ENV=production`을 고정했습니다.
- L은 설치된 공개 `@canard/schema-form@0.16.1`입니다. SHA-256 `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46`.
- S의 `dist/index.node.mjs` SHA-256은 `59932cf4b9b12e52ce2610d3c4c1ad212705c1a714265234fbf24c753c55841b`입니다. 제품 번들은 수정하지 않았고 원자료 사본에는 장치가 내부 export 한 줄만 덧붙였습니다.

첫 시도는 09:26 UTC의 5.106820초 CPU 사전 점검에서 `mds_stores` 116.9025%로 중지했습니다. **정식 표본은 0개**였습니다. 코디네이터가 표본 0의 새 사전 점검을 허용했고, 2분 뒤 처음 통과한 표본에서 시작했습니다. 중지된 기록은 `preparation/quiet-precheck-blocked-0926.json`에 보존했습니다.

정식 사전 점검은 5.155433초이며 quiet-since는 **2026-10-27T09:28:40.861Z**입니다. D4의 고정 기준은 일반 프로세스 ≥50%, `mds_stores` ≥10%, 다른 Node/Bun/vitest/tsc/rolldown ≥10%입니다. 시작 표본의 최고 부하는 TGOnDeviceInferenceProviderService 17.2633%, mds 14.3538%였고 기준을 넘은 프로세스는 없었습니다. 쌍 30프로세스→단계 18프로세스를 순서대로 한 번 실행했고 정식 프로세스 종료는 **09:29:17.807 UTC**입니다. 종료 CPU 점검은 09:29:22.963 UTC까지 이어졌으며 mds 17.8512%, mds_stores 5.8210%로 고부하 기준을 넘지 않았습니다. 방해를 관측한 정식 창이나 재측정은 없습니다. 시작·종료 표본 사이 전체 시간의 무부하를 증명하는 연속 모니터는 아닙니다.

## 장치·통계의 의미

각 프로세스 20예열·100표본·행당 독립 3프로세스입니다. 쌍 장치는 한 프로세스 안의 두 판을 AB/BA로 교대하고 각 판별자 쓰기 뒤 정착을 보장합니다. 루트 생성·잎 탐색·사전 점검·값 단언·타이머 태스크 양보는 갱신 타이머 밖입니다. 기존 `switch-oneOf-80`의 실제 단위가 쓰기 두 번이므로 코디네이터 확인에 따라 신규 행도 그 단위를 따릅니다. 형제 0만 기존대로 쓰기 한 번입니다.

총합은 세 **실행 최소값의 중앙값**, 폭은 **최소값의 최댓값−최솟값**입니다. 단계별 시간은 세 **실행별 중앙값의 중앙값**입니다. `computeNode` 재귀의 inclusive를 합하면 중복되므로, 정착 단계 표는 한 쓰기에서 최상위 단계에 귀속한 self를 먼저 합칩니다. 함수별 장부는 전 단계의 호출을 합한 self·inclusive·호출 수·할당량을 따로 보여 줍니다. 개별 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.

`discriminator`는 호스트 `controls.discriminator: 'kind'`와 분기별 `kind.const`를 사용합니다. `if`는 요청된 `allOf`의 if/then 스키마와 실제 AJV8 플러그인을 사용하고 각 guard 포인터가 정확히 한 번 컴파일됨을 사전 검사합니다. 검증기 누락은 사전 점검 실패입니다. 두 행에 동일 스키마를 0.16.1로 실행하면 discriminator는 `COMPOSITION_PROPERTY_REDEFINITION`, if는 allOf 안 조건 키워드가 폼 구성에 적용되지 않아 초기 payload 누락으로 실패합니다. AJV validatorFactory를 연결해도 후자의 형상은 바뀌지 않으므로 두 행에 레거시 쌍을 만들지 않았습니다.

모든 새 행은 초기·중간·복귀 호스트의 정확한 키와 모든 payload 기본값을 검사했습니다. 중첩 호스트는 `/outer/inner`이며 20분기입니다. payload12는 문자열·숫자·불리언을 네 번 반복하는 12잎입니다. 기존 canonical·탐침 24개 fixture는 `b8db53997`과 양쪽 엔진의 구조가 같습니다.

## 같은 프로세스 쌍

값은 쓰기 2회(왕복 1회) 합계와 쓰기당 환산입니다. 형제 0은 기존 장치대로 쓰기 1회입니다. 단위 µs.

| 행                      | 쓰기 수 | 0.16.1 합계 / 쓰기당 | 단계 시작 합계 / 쓰기당 |       S÷L | S÷active80 | L 폭/쓰기 | S 폭/쓰기 |
| ----------------------- | ------: | -------------------: | ----------------------: | --------: | ---------: | --------: | --------: |
| switch-oneOf-80         |       2 |      87.459 / 43.730 |       522.583 / 261.291 |     5.975 |      1.000 |     7.188 |    21.709 |
| switch-siblings-0       |       1 |      31.166 / 31.166 |       101.834 / 101.834 |     3.267 |      0.390 |     4.333 |    13.833 |
| switch-discriminator-80 |       2 |            해당 없음 |       947.291 / 473.645 | 해당 없음 |      1.813 | 해당 없음 |    38.729 |
| switch-if-80            |       2 |            해당 없음 |      1191.791 / 595.895 | 해당 없음 |      2.281 | 해당 없음 |     2.750 |
| switch-nested-oneOf-20  |       2 |      56.959 / 28.480 |       666.459 / 333.229 |    11.701 |      1.275 |    11.417 |   111.501 |
| switch-oneOf-2          |       2 |      31.209 / 15.604 |       236.500 / 118.250 |     7.578 |      0.453 |    15.728 |   110.855 |
| switch-oneOf-10         |       2 |      61.250 / 30.625 |       462.125 / 231.062 |     7.545 |      0.884 |     4.896 |    13.521 |
| switch-oneOf-40         |       2 |      48.292 / 24.146 |       390.292 / 195.146 |     8.082 |      0.747 |    11.188 |   101.834 |
| switch-oneOf-160        |       2 |     102.916 / 51.458 |       596.875 / 298.438 |     5.800 |      1.142 |    12.958 |   123.666 |
| switch-payload-12       |       2 |    216.750 / 108.375 |       961.166 / 480.583 |     4.434 |      1.839 |    21.209 |   138.958 |

## 세 항 분해

단위는 µs/쓰기, slope는 µs/쓰기/분기입니다. 각 회귀는 다섯 점의 최소제곱이며 목표선을 제안하지 않습니다.

| 항                      | 0.16.1 | 단계 시작 판 |
| ----------------------- | -----: | -----------: |
| 회귀 floor              | 21.307 |      169.906 |
| 회귀 slope              |  0.202 |        0.872 |
| Δ: payload12 − payload3 | 64.645 |      219.291 |
| 형제 0 최소 폼          | 31.166 |      101.834 |

| 분기 N | L 실측 | L 적합 | L 잔차 |  S 실측 |  S 적합 |  S 잔차 |
| ------ | -----: | -----: | -----: | ------: | ------: | ------: |
| 2      | 15.604 | 21.711 | -6.107 | 118.250 | 171.650 | -53.400 |
| 10     | 30.625 | 23.328 |  7.297 | 231.062 | 178.627 |  52.435 |
| 40     | 24.146 | 29.393 | -5.247 | 195.146 | 204.791 |  -9.645 |
| 80     | 43.730 | 37.479 |  6.250 | 261.291 | 239.675 |  21.616 |
| 160    | 51.458 | 53.651 | -2.193 | 298.438 | 309.444 | -11.007 |

## 계측 오버헤드

모두 scratch esbuild 판의 µs/쓰기입니다. 총합은 실행별 최소값의 중앙값, 단계 기준 중앙값은 실행별 중앙값의 중앙값입니다.

| 행                      | 무계측 최소 중앙 | 계측 최소 중앙 |    차이 | 계측/무계측 | 계측 중앙의 중앙 |
| ----------------------- | ---------------: | -------------: | ------: | ----------: | ---------------: |
| switch-oneOf-80         |          169.584 |        188.417 |  18.833 |       1.111 |          243.499 |
| switch-siblings-0       |           50.500 |         58.958 |   8.458 |       1.167 |           81.604 |
| switch-discriminator-80 |          460.125 |        572.833 | 112.708 |       1.245 |          702.354 |
| switch-if-80            |          587.250 |        698.541 | 111.291 |       1.190 |          833.229 |
| switch-nested-oneOf-20  |          250.250 |        274.792 |  24.542 |       1.098 |          349.478 |
| switch-payload-12       |          343.167 |        350.625 |   7.458 |       1.022 |          460.396 |

## 정착 단계: switch-oneOf-80

µs/쓰기, 같은 최상위 단계에 속한 self를 먼저 합한 뒤 실행별 중앙값의 중앙값을 계산했습니다. 재귀·하위 함수는 그 최상위 단계 안에만 포함됩니다.

| 정착 단계             |   총 µs | 하위 self µs                                                                                                                                  |
| --------------------- | ------: | --------------------------------------------------------------------------------------------------------------------------------------------- |
| markWrite             |   1.520 | markWrite=1.520                                                                                                                               |
| registerRecalculation |  12.959 | registerRecalculation=12.959                                                                                                                  |
| computeNode           | 103.479 | primeHost=2.917, updateOutput=5.103, computeNode=35.147, wheelPreparation=8.687, markWrite=2.875, assembleObject=9.084, selectChildren=35.978 |
| runDeriveRounds       |   0.000 |                                                                                                                                               |
| transitionSettlement  |   4.958 | transitionSettlement=4.958                                                                                                                    |
| finalizeExits         |  55.458 | getControlLayers=11.564, setLatentRaw=11.208, captureExitedRaw=5.709, assembleObject=0.792, updateOutput=1.792, finalizeExits=23.873          |
| commitSettlement      |  46.145 | getControlLayers=3.958, markCommitDeliveries=11.876, updateInactiveValuesMemo=18.666, commitSettlement=8.500                                  |
| everythingElse        |  17.124 | unwrappedEntry=17.124                                                                                                                         |

## 단계 장부: switch-oneOf-80

시간은 µs/쓰기입니다. self는 겹치지 않는 시간, inclusive는 하위 단계 포함 시간입니다. 각 셀은 실행별 중앙값의 중앙값이며 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.

| 단계                     | self µs | inclusive µs | 호출/쓰기 | 할당 B/쓰기 | 할당 표본 수(3실행) |
| ------------------------ | ------: | -----------: | --------: | ----------: | ------------------- |
| markWrite                |   4.375 |        4.375 |     4.000 |     896.640 | 153 / 159 / 136     |
| registerRecalculation    |  12.959 |       12.959 |     1.000 |   10223.200 | 1771 / 1794 / 1768  |
| computeNode              |  35.147 |      111.874 |     5.000 |   24154.320 | 4204 / 4212 / 4331  |
| wheelPreparation         |   8.687 |       14.541 |     1.000 |    2773.440 | 390 / 402 / 400     |
| primeHost                |   2.917 |        2.917 |     1.000 |     366.640 | 68 / 72 / 66        |
| selectChildren           |  35.978 |       57.709 |     1.000 |   16623.920 | 2761 / 2870 / 2888  |
| evaluateGate             |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| runDeriveRounds          |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| transitionSettlement     |   4.958 |        4.958 |     1.000 |    3056.800 | 549 / 557 / 559     |
| finalizeExits            |  23.873 |       55.458 |     1.000 |   14409.600 | 2599 / 2656 / 2644  |
| getControlLayers         |  15.520 |       15.520 |    12.000 |   16024.800 | 2857 / 2920 / 2914  |
| captureExitedRaw         |   5.709 |       18.876 |     3.000 |    3250.960 | 611 / 573 / 607     |
| setLatentRaw             |  11.208 |       11.208 |     6.000 |   11990.560 | 2068 / 2088 / 2020  |
| updateOutput             |   6.958 |       17.083 |     6.000 |     748.080 | 163 / 137 / 131     |
| assembleObject           |   9.979 |        9.979 |     2.000 |   12469.280 | 2345 / 2278 / 2312  |
| commitSettlement         |   8.500 |       46.145 |     1.000 |    4696.560 | 827 / 868 / 871     |
| updateInactiveValuesMemo |  18.666 |       18.666 |     1.000 |   23303.840 | 3859 / 4086 / 4048  |
| markCommitDeliveries     |  11.876 |       11.876 |     1.000 |    8494.640 | 1532 / 1620 / 1556  |
| everythingElse           |  17.124 |       17.124 |     1.000 |    6627.520 | 1194 / 1154 / 1172  |

## 정착 단계: switch-siblings-0

µs/쓰기, 같은 최상위 단계에 속한 self를 먼저 합한 뒤 실행별 중앙값의 중앙값을 계산했습니다. 재귀·하위 함수는 그 최상위 단계 안에만 포함됩니다.

| 정착 단계             |  총 µs | 하위 self µs                                                                                                                                     |
| --------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| markWrite             |  1.417 | markWrite=1.417                                                                                                                                  |
| registerRecalculation |  6.666 | registerRecalculation=6.666                                                                                                                      |
| computeNode           | 46.355 | primeHost=2.834, updateOutput=3.666, computeNode=13.813, wheelPreparation=3.354, evaluateGate=4.980, assembleObject=2.541, selectChildren=13.876 |
| runDeriveRounds       |  0.000 |                                                                                                                                                  |
| transitionSettlement  |  1.229 | transitionSettlement=1.229                                                                                                                       |
| finalizeExits         |  0.000 |                                                                                                                                                  |
| commitSettlement      | 12.208 | markCommitDeliveries=8.563, updateInactiveValuesMemo=0.167, commitSettlement=3.417                                                               |
| everythingElse        | 11.938 | unwrappedEntry=11.938                                                                                                                            |

## 단계 장부: switch-siblings-0

시간은 µs/쓰기입니다. self는 겹치지 않는 시간, inclusive는 하위 단계 포함 시간입니다. 각 셀은 실행별 중앙값의 중앙값이며 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.

| 단계                     | self µs | inclusive µs | 호출/쓰기 | 할당 B/쓰기 | 할당 표본 수(3실행) |
| ------------------------ | ------: | -----------: | --------: | ----------: | ------------------- |
| markWrite                |   1.417 |        1.417 |     1.000 |     242.640 | 41 / 43 / 50        |
| registerRecalculation    |   6.666 |        6.666 |     1.000 |    3965.760 | 730 / 747 / 731     |
| computeNode              |  13.813 |       51.749 |     4.000 |    6547.120 | 1195 / 1125 / 1130  |
| wheelPreparation         |   3.354 |        8.480 |     1.000 |    1562.960 | 283 / 247 / 286     |
| primeHost                |   2.834 |        2.834 |     1.000 |     479.200 | 83 / 88 / 94        |
| selectChildren           |  13.876 |       23.812 |     1.000 |    7246.640 | 1317 / 1281 / 1363  |
| evaluateGate             |   4.980 |        4.980 |     6.000 |    1757.840 | 316 / 334 / 324     |
| runDeriveRounds          |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| transitionSettlement     |   1.229 |        1.229 |     1.000 |     797.200 | 146 / 126 / 152     |
| finalizeExits            |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| getControlLayers         |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| captureExitedRaw         |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| setLatentRaw             |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| updateOutput             |   3.666 |        6.209 |     4.000 |     458.560 | 83 / 95 / 85        |
| assembleObject           |   2.541 |        2.541 |     1.000 |    1609.040 | 278 / 300 / 291     |
| commitSettlement         |   3.417 |       12.208 |     1.000 |    1354.800 | 280 / 245 / 247     |
| updateInactiveValuesMemo |   0.167 |        0.167 |     1.000 |       0.000 | 0 / 0 / 0           |
| markCommitDeliveries     |   8.563 |        8.563 |     1.000 |    5103.440 | 856 / 939 / 928     |
| everythingElse           |  11.938 |       11.938 |     1.000 |    4844.000 | 897 / 833 / 849     |

## 정착 단계: switch-discriminator-80

µs/쓰기, 같은 최상위 단계에 속한 self를 먼저 합한 뒤 실행별 중앙값의 중앙값을 계산했습니다. 재귀·하위 함수는 그 최상위 단계 안에만 포함됩니다.

| 정착 단계             |   총 µs | 하위 self µs                                                                                                                                                           |
| --------------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| markWrite             |   1.584 | markWrite=1.584                                                                                                                                                        |
| registerRecalculation |   3.791 | registerRecalculation=3.791                                                                                                                                            |
| computeNode           | 566.167 | primeHost=11.167, updateOutput=7.144, computeNode=53.645, assembleObject=32.564, wheelPreparation=7.646, evaluateGate=221.668, markWrite=2.958, selectChildren=214.251 |
| runDeriveRounds       |   0.000 |                                                                                                                                                                        |
| transitionSettlement  |   5.187 | transitionSettlement=5.187                                                                                                                                             |
| finalizeExits         |  50.062 | getControlLayers=6.520, setLatentRaw=11.250, captureExitedRaw=5.583, assembleObject=0.542, updateOutput=0.750, finalizeExits=23.022                                    |
| commitSettlement      |  42.500 | getControlLayers=1.750, markCommitDeliveries=11.958, updateInactiveValuesMemo=19.166, commitSettlement=7.480                                                           |
| everythingElse        |  17.729 | unwrappedEntry=17.729                                                                                                                                                  |

## 단계 장부: switch-discriminator-80

시간은 µs/쓰기입니다. self는 겹치지 않는 시간, inclusive는 하위 단계 포함 시간입니다. 각 셀은 실행별 중앙값의 중앙값이며 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.

| 단계                     | self µs | inclusive µs | 호출/쓰기 | 할당 B/쓰기 | 할당 표본 수(3실행)   |
| ------------------------ | ------: | -----------: | --------: | ----------: | --------------------- |
| markWrite                |   4.626 |        4.626 |     4.000 |    1361.280 | 275 / 229 / 236       |
| registerRecalculation    |   3.791 |        3.791 |     1.000 |    1507.120 | 272 / 283 / 280       |
| computeNode              |  53.645 |      575.561 |     6.000 |   32956.160 | 5544 / 5535 / 5563    |
| wheelPreparation         |   7.646 |       26.313 |     1.000 |    4639.360 | 485 / 473 / 486       |
| primeHost                |  11.167 |       11.167 |     1.000 |   10284.080 | 1897 / 1890 / 1920    |
| selectChildren           | 214.251 |      427.667 |     2.000 |  114388.880 | 20785 / 20571 / 20276 |
| evaluateGate             | 221.668 |      221.668 |   800.000 |  210049.840 | 38823 / 38950 / 38964 |
| runDeriveRounds          |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0             |
| transitionSettlement     |   5.187 |        5.187 |     1.000 |    2964.800 | 492 / 561 / 542       |
| finalizeExits            |  23.022 |       50.062 |     1.000 |   13929.920 | 2570 / 2530 / 2549    |
| getControlLayers         |   8.271 |        8.271 |    12.000 |    3088.960 | 563 / 553 / 553       |
| captureExitedRaw         |   5.583 |       16.334 |     3.000 |    2609.760 | 488 / 467 / 506       |
| setLatentRaw             |  11.250 |       11.250 |     6.000 |   11777.920 | 2029 / 2117 / 2029    |
| updateOutput             |   7.959 |       41.271 |    13.000 |    2405.440 | 438 / 464 / 446       |
| assembleObject           |  33.147 |       33.147 |     8.000 |   57611.840 | 10734 / 10812 / 10687 |
| commitSettlement         |   7.480 |       42.500 |     1.000 |    4666.160 | 864 / 863 / 852       |
| updateInactiveValuesMemo |  19.166 |       19.166 |     1.000 |   22599.280 | 4081 / 3949 / 3959    |
| markCommitDeliveries     |  11.958 |       11.958 |     1.000 |    8342.640 | 1527 / 1579 / 1530    |
| everythingElse           |  17.729 |       17.729 |     1.000 |    6300.960 | 1153 / 1110 / 1092    |

## 정착 단계: switch-if-80

µs/쓰기, 같은 최상위 단계에 속한 self를 먼저 합한 뒤 실행별 중앙값의 중앙값을 계산했습니다. 재귀·하위 함수는 그 최상위 단계 안에만 포함됩니다.

| 정착 단계             |   총 µs | 하위 self µs                                                                                                                                                          |
| --------------------- | ------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| markWrite             |   1.937 | markWrite=1.937                                                                                                                                                       |
| registerRecalculation |   3.625 | registerRecalculation=3.625                                                                                                                                           |
| computeNode           | 617.541 | primeHost=9.417, updateOutput=8.668, computeNode=76.837, assembleObject=28.439, wheelPreparation=8.709, evaluateGate=292.862, markWrite=3.605, selectChildren=183.323 |
| runDeriveRounds       |   0.000 |                                                                                                                                                                       |
| transitionSettlement  |   5.313 | transitionSettlement=5.313                                                                                                                                            |
| finalizeExits         |  96.750 | getControlLayers=45.292, setLatentRaw=12.334, captureExitedRaw=7.042, assembleObject=0.542, updateOutput=1.625, finalizeExits=27.063                                  |
| commitSettlement      |  62.167 | getControlLayers=14.375, markCommitDeliveries=12.646, updateInactiveValuesMemo=20.500, commitSettlement=11.959                                                        |
| everythingElse        |  25.542 | unwrappedEntry=25.542                                                                                                                                                 |

## 단계 장부: switch-if-80

시간은 µs/쓰기입니다. self는 겹치지 않는 시간, inclusive는 하위 단계 포함 시간입니다. 각 셀은 실행별 중앙값의 중앙값이며 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.

| 단계                     | self µs | inclusive µs | 호출/쓰기 | 할당 B/쓰기 | 할당 표본 수(3실행)   |
| ------------------------ | ------: | -----------: | --------: | ----------: | --------------------- |
| markWrite                |   5.521 |        5.521 |     4.000 |    1327.040 | 226 / 242 / 231       |
| registerRecalculation    |   3.625 |        3.625 |     1.000 |    1573.920 | 269 / 291 / 297       |
| computeNode              |  76.837 |      627.688 |     5.000 |   52352.800 | 8356 / 8272 / 8541    |
| wheelPreparation         |   8.709 |       30.480 |     1.000 |    3263.360 | 457 / 441 / 445       |
| primeHost                |   9.417 |        9.417 |     1.000 |    9614.800 | 1736 / 1786 / 1779    |
| selectChildren           | 183.323 |      430.521 |     2.000 |  102014.720 | 18859 / 18884 / 18878 |
| evaluateGate             | 292.862 |      292.862 |   640.000 |  352328.720 | 64895 / 65382 / 65190 |
| runDeriveRounds          |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0             |
| transitionSettlement     |   5.313 |        5.313 |     1.000 |    3038.640 | 554 / 536 / 572       |
| finalizeExits            |  27.063 |       96.750 |     1.000 |   14692.320 | 2556 / 2593 / 2575    |
| getControlLayers         |  59.874 |       59.874 |    12.000 |    2315.680 | 440 / 401 / 413       |
| captureExitedRaw         |   7.042 |       33.104 |     3.000 |    2561.680 | 479 / 497 / 479       |
| setLatentRaw             |  12.334 |       12.334 |     6.000 |   11813.120 | 2115 / 2036 / 2011    |
| updateOutput             |  10.790 |       41.833 |    11.000 |    2060.320 | 357 / 381 / 397       |
| assembleObject           |  29.042 |       29.042 |     7.000 |   46108.080 | 8602 / 8604 / 8571    |
| commitSettlement         |  11.959 |       62.167 |     1.000 |    4601.200 | 792 / 834 / 792       |
| updateInactiveValuesMemo |  20.500 |       20.500 |     1.000 |   22788.960 | 3965 / 3993 / 4043    |
| markCommitDeliveries     |  12.646 |       12.646 |     1.000 |    8868.800 | 1518 / 1559 / 1611    |
| everythingElse           |  25.542 |       25.542 |     1.000 |    6709.280 | 1145 / 1175 / 1207    |

## 정착 단계: switch-nested-oneOf-20

µs/쓰기, 같은 최상위 단계에 속한 self를 먼저 합한 뒤 실행별 중앙값의 중앙값을 계산했습니다. 재귀·하위 함수는 그 최상위 단계 안에만 포함됩니다.

| 정착 단계             |   총 µs | 하위 self µs                                                                                                                                                        |
| --------------------- | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| markWrite             |   1.625 | markWrite=1.625                                                                                                                                                     |
| registerRecalculation |  19.666 | registerRecalculation=19.666                                                                                                                                        |
| computeNode           | 189.021 | primeHost=5.833, updateOutput=7.353, computeNode=59.918, wheelPreparation=10.457, markWrite=3.646, assembleObject=8.229, selectChildren=68.938, evaluateGate=20.127 |
| runDeriveRounds       |   0.000 |                                                                                                                                                                     |
| transitionSettlement  |   5.459 | transitionSettlement=5.459                                                                                                                                          |
| finalizeExits         |  60.042 | getControlLayers=11.396, setLatentRaw=13.479, captureExitedRaw=6.063, assembleObject=3.000, updateOutput=1.708, finalizeExits=24.188                                |
| commitSettlement      |  52.084 | getControlLayers=3.876, markCommitDeliveries=14.500, updateInactiveValuesMemo=24.500, commitSettlement=8.646                                                        |
| everythingElse        |  19.000 | unwrappedEntry=19.000                                                                                                                                               |

## 단계 장부: switch-nested-oneOf-20

시간은 µs/쓰기입니다. self는 겹치지 않는 시간, inclusive는 하위 단계 포함 시간입니다. 각 셀은 실행별 중앙값의 중앙값이며 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.

| 단계                     | self µs | inclusive µs | 호출/쓰기 | 할당 B/쓰기 | 할당 표본 수(3실행) |
| ------------------------ | ------: | -----------: | --------: | ----------: | ------------------- |
| markWrite                |   5.291 |        5.291 |     4.000 |    3169.120 | 486 / 469 / 503     |
| registerRecalculation    |  19.666 |       19.666 |     1.000 |   16299.200 | 2864 / 2938 / 2839  |
| computeNode              |  59.918 |      485.417 |    10.000 |   50763.520 | 8968 / 9039 / 8913  |
| wheelPreparation         |  10.457 |       96.875 |     3.000 |    5184.720 | 834 / 900 / 908     |
| primeHost                |   5.833 |        5.833 |     3.000 |    2007.120 | 372 / 366 / 354     |
| selectChildren           |  68.938 |      138.250 |     4.000 |   39486.320 | 6851 / 6856 / 6891  |
| evaluateGate             |  20.127 |       20.127 |    40.000 |   11645.280 | 2122 / 2177 / 2145  |
| runDeriveRounds          |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0           |
| transitionSettlement     |   5.459 |        5.459 |     1.000 |    3163.120 | 576 / 578 / 643     |
| finalizeExits            |  24.188 |       60.042 |     1.000 |   16517.760 | 2950 / 2978 / 3028  |
| getControlLayers         |  15.314 |       15.314 |    18.000 |   23265.360 | 4138 / 4267 / 4294  |
| captureExitedRaw         |   6.063 |       20.855 |     3.000 |    3176.640 | 598 / 594 / 585     |
| setLatentRaw             |  13.479 |       13.479 |     6.000 |   14435.520 | 2448 / 2456 / 2414  |
| updateOutput             |   9.083 |       20.668 |    14.000 |    2526.800 | 435 / 468 / 502     |
| assembleObject           |  11.209 |       11.209 |    10.000 |   15270.240 | 2772 / 2815 / 2750  |
| commitSettlement         |   8.646 |       52.084 |     1.000 |    4660.800 | 844 / 900 / 848     |
| updateInactiveValuesMemo |  24.500 |       24.500 |     1.000 |   28462.240 | 4989 / 4877 / 4955  |
| markCommitDeliveries     |  14.500 |       14.500 |     1.000 |    9643.440 | 1762 / 1765 / 1812  |
| everythingElse           |  19.000 |       19.000 |     1.000 |    7531.120 | 1317 / 1324 / 1333  |

## 정착 단계: switch-payload-12

µs/쓰기, 같은 최상위 단계에 속한 self를 먼저 합한 뒤 실행별 중앙값의 중앙값을 계산했습니다. 재귀·하위 함수는 그 최상위 단계 안에만 포함됩니다.

| 정착 단계             |   총 µs | 하위 self µs                                                                                                                                   |
| --------------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| markWrite             |   0.729 | markWrite=0.729                                                                                                                                |
| registerRecalculation |  18.687 | registerRecalculation=18.687                                                                                                                   |
| computeNode           | 160.021 | primeHost=2.645, updateOutput=4.689, computeNode=45.123, wheelPreparation=9.062, markWrite=5.021, assembleObject=35.730, selectChildren=57.252 |
| runDeriveRounds       |   0.000 |                                                                                                                                                |
| transitionSettlement  |   7.688 | transitionSettlement=7.688                                                                                                                     |
| finalizeExits         | 179.521 | getControlLayers=33.291, setLatentRaw=31.273, captureExitedRaw=12.124, assembleObject=1.458, updateOutput=1.417, finalizeExits=102.416         |
| commitSettlement      |  78.812 | getControlLayers=12.206, markCommitDeliveries=14.709, updateInactiveValuesMemo=35.854, commitSettlement=15.771                                 |
| everythingElse        |  21.730 | unwrappedEntry=21.730                                                                                                                          |

## 단계 장부: switch-payload-12

시간은 µs/쓰기입니다. self는 겹치지 않는 시간, inclusive는 하위 단계 포함 시간입니다. 각 셀은 실행별 중앙값의 중앙값이며 셀 중앙값의 합은 총합 중앙값과 같을 필요가 없습니다.

| 단계                     | self µs | inclusive µs | 호출/쓰기 | 할당 B/쓰기 | 할당 표본 수(3실행)   |
| ------------------------ | ------: | -----------: | --------: | ----------: | --------------------- |
| markWrite                |   5.709 |        5.709 |    13.000 |    4607.440 | 616 / 627 / 655       |
| registerRecalculation    |  18.687 |       18.687 |     1.000 |   20789.280 | 3604 / 3563 / 3663    |
| computeNode              |  45.123 |      173.479 |    14.000 |   69016.320 | 12217 / 12566 / 12268 |
| wheelPreparation         |   9.062 |       13.833 |     1.000 |    3176.720 | 434 / 467 / 488       |
| primeHost                |   2.645 |        2.645 |     1.000 |     344.320 | 64 / 62 / 65          |
| selectChildren           |  57.252 |      110.354 |     1.000 |   61215.040 | 10178 / 10455 / 10295 |
| evaluateGate             |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0             |
| runDeriveRounds          |   0.000 |        0.000 |     0.000 |       0.000 | 0 / 0 / 0             |
| transitionSettlement     |   7.688 |        7.688 |     1.000 |    9682.960 | 1775 / 1764 / 1771    |
| finalizeExits            | 102.416 |      179.521 |     1.000 |   52964.400 | 9709 / 9575 / 9488    |
| getControlLayers         |  45.476 |       45.476 |    48.000 |   63385.600 | 11357 / 11485 / 11476 |
| captureExitedRaw         |  12.124 |       49.770 |    12.000 |   13591.680 | 2273 / 2333 / 2422    |
| setLatentRaw             |  31.273 |       31.273 |    24.000 |   47000.480 | 7396 / 7432 / 7354    |
| updateOutput             |   6.561 |       43.604 |    15.000 |    1861.760 | 341 / 347 / 327       |
| assembleObject           |  37.105 |       37.105 |     2.000 |   43201.200 | 7988 / 7991 / 8143    |
| commitSettlement         |  15.771 |       78.812 |     1.000 |   14549.440 | 2670 / 2657 / 2607    |
| updateInactiveValuesMemo |  35.854 |       35.854 |     1.000 |   88695.920 | 14562 / 14551 / 14693 |
| markCommitDeliveries     |  14.709 |       14.709 |     1.000 |   21575.920 | 3959 / 3872 / 3952    |
| everythingElse           |  21.730 |       21.730 |     1.000 |   11418.240 | 1965 / 1973 / 2044    |

## 계측 방법과 그 오차

제품 `src`는 읽기만 하고 저장소 밖 `stages/scratch/`에 같은 entry와 설정의 esbuild 무계측/계측 번들을 만들었습니다. AST 기반 esbuild 플러그인이 지정 함수의 몸체를 try/finally 타이머로 감싸고, computeNode의 staticList부터 첫 budget cap 계산까지를 scratch의 `wheelPreparation` 함수로 감쌉니다. 그 구간에 들어 있는 primeHost·초기 dirty 자식 계산·출력 호출은 하위 단계로도 계측합니다. 정확한 목록과 경계는 `stages/scratch/instrumentation.json`에 있습니다. `everythingElse`에는 컨텍스트 생성·진입 검사와 포착되지 않은 계측 비용이 포함됩니다.

위 오버헤드 표의 계측/무계측 비율은 1.022~1.245배입니다. 이 비용을 단계 값에서 보정해 빼지 않았습니다. 특히 evaluateGate처럼 빈번하고 짧은 함수는 타이머 비용의 영향을 받습니다. **scratch 무계측과 배포 dist의 절대 시간에도 차이가 있으므로 아래 값을 함께 읽어야 합니다.** 두 경로의 번들러·모듈 구성·JIT 상태가 같다는 보장은 없고, 이 차이의 원인을 분리한 실험은 하지 않았습니다.

| 행                      | scratch 무계측 / dist 쓰기당 |
| ----------------------- | ---------------------------: |
| switch-oneOf-80         |                       0.6490 |
| switch-siblings-0       |                       0.4959 |
| switch-discriminator-80 |                       0.9715 |
| switch-if-80            |                       0.9855 |
| switch-nested-oneOf-20  |                       0.7510 |
| switch-payload-12       |                       0.7141 |

따라서 단계 장부는 계측된 scratch 실행의 비용 위치를 보여 주며, 배포 dist 총합의 정확한 가산 분해로 사용할 수 없습니다. 배포 판 간 비교와 세 항 회귀는 쌍 장치의 dist 값을 사용했습니다.

호출 수는 시간 통과 뒤 타이머를 끈 별도 100쓰기의 V8 `Profiler.startPreciseCoverage`입니다. 타이머의 중앙 호출 수와 정밀 커버리지 호출 수가 모든 지정 함수에서 일치했습니다. 호출 0인 runDeriveRounds는 이 픽스처에 파생 규칙이 없기 때문입니다. active-80의 evaluateGate 0은 직접 선택 표가 해당 wrapper를 호출하지 않는 경로이며, 게이트 판정 작업이 전부 없다는 뜻은 아닙니다.

할당은 다시 별도 100쓰기에서 inspector의 `HeapProfiler.startSampling`을 512B 간격으로 실행했습니다. major/minor GC로 수거된 객체도 포함하고 가장 안쪽 지정 함수에 selfSize를 귀속했습니다. scratch 엔진 프레임 바깥의 하네스·inspector 할당은 제외했습니다. 할당 표는 실행별 B/쓰기 추정치의 중앙값이고 잔존 힙이 아닙니다. 표본 k개의 상대 오차 규모 `1/√k`는 거친 참고값이며 신뢰구간이 아닙니다. 예를 들어 수십 표본인 작은 단계는 대략 10%대의 오차 규모가 있고, 0표본은 0할당의 증명이 아닙니다. 비활성 타이머 호출과 scratch 준비 함수/반환 객체는 할당 통과에도 남습니다. 이 장부를 제품 판의 정확한 byte 수로 해석하지 않습니다.

## 두 번째 바퀴의 입력 증거

별도 진단 쓰기 `kind_0 → kind_79`에서 if와 discriminator 모두 세 프로세스 각각 2개의 불일치를 기록했습니다. 최초 프레임의 key는 루트 포인터 `""`, input kind는 `value`, gate kind는 각각 `if` / `discriminator`입니다. 같은 프레임(frame 1)에서 두 값은 다음과 같습니다.

```json
{"previous":{"common":"shared","kind":"kind_79"},"next":{"common":"shared","kind":"kind_79","payload_79_a":"a_79"},"previousIdentity":2,"nextIdentity":3,"sameIdentity":false}
{"previous":{"common":"shared","kind":"kind_79"},"next":{"common":"shared","kind":"kind_79","payload_79_a":"a_79","payload_79_b":79},"previousIdentity":2,"nextIdentity":4,"sameIdentity":false}
```

선택 과정에서 활성 payload를 계산·발행하면서 **게이트들이 읽는 루트 투영 객체의 내용과 identity가 라운드 안에서 바뀝니다**. `recordGateFrameInput.ts`는 첫 raw 객체를 유지한 채 후속 raw를 `Object.is`로 비교하므로 `consistent=false`가 됩니다. `canSkipGateWheel.ts`는 이 프레임의 확인 바퀴 생략을 허용하지 않습니다. 실제 쓰기당 selectChildren는 active-80에서 1회, if/discriminator에서 2회이고 evaluateGate는 각각 640/800회입니다.

프레임에 기록되는 값은 `evaluateGate.ts`의 `readProjectedValue`가 반환한 raw입니다. 이어서 생성하는 `{ ...host }` 판정 입력 복사본은 이 witness에 기록되지 않습니다. 따라서 확인된 원인은 선택 도중 투영 raw의 변화이며, 게이트별 입력 복사를 없애는 것만으로 이 witness가 일관돼지는지는 B1에서 별도로 확인해야 합니다. 진단의 structuredClone·JSON 기록은 시간·호출 수·할당 통과 밖입니다. 전체 두 값과 identity는 각 `*.gate-inputs.json`에 있습니다.

## 확실하지 않음

- 회귀는 다섯 크기의 기술적 최소제곱 분해입니다. 단계 시작 판의 잔차는 약 −53.400~+52.435 µs/쓰기이고 일부 행의 실행 최소값 범위도 큽니다. N=2→10→40의 시간이 단조롭지 않습니다. floor와 slope를 정확한 구조 상수나 인과 효과로 취급할 근거는 부족합니다. 같은 창을 다시 측정하지 않았습니다.
- payload12−payload3는 9개 추가 나감·9개 추가 들어옴의 관측 차이이며 추가 잎당 순수 상수 비용으로 분리한 값은 아닙니다. 활성 크기·조립 크기·잠복 원본 크기도 함께 바뀝니다.
- scratch와 dist의 차이, 타이머 오버헤드, 힙 샘플링 오차는 위에 공개했습니다. 단계 값에 임의의 정규화나 오버헤드 차감을 적용하지 않았습니다.
- 레거시는 재진입 기본값·노드 수명·쓰기에 따른 검증 의미가 현재 판과 다릅니다. 이 장치는 공통 fixture의 활성 키·값 전환을 비교하며 전체 공개 의미 동치를 증명하는 장치가 아닙니다.
- D4의 6.8739배와 이번 5.975배는 서로 다른 창의 결과입니다. 제품 변화나 성능 개선의 증거로 사용하지 않습니다.
- 시작·종료 CPU 표본 사이의 모든 외부 부하·열 상태를 연속 관측하지 않았습니다. 검사한 양 끝에는 고부하 판정이 없었습니다.

## 검증과 인계

제품 src·시험·dist 차분은 0입니다. recursive 의존 build와 AJV8 build, schema-form typecheck/lint/build가 exit 0입니다. 기본 다섯 프로젝트는 874파일·5,418시험 통과(기존 todo 1), verify 묶음은 642파일·4,431시험 통과(기존 todo 1)입니다. 기존 시험 기대값은 수정하지 않았습니다. 장치 검사는 24개 기존 fixture 동등성, 신규 10행 사전 점검, guard 포인터당 1회 컴파일, 검증기 누락 거부, 두 미지원 레거시 행을 확인했습니다.

원자료 검사 `reportLedger.mjs`는 쌍 30·단계 18개의 독립 PID, 행마다 20예열·100표본·3실행, AB/BA 교대, 유한 양수, 최소값·중앙값, 매 표본의 self/정착 단계 합계와 전체 시간 일치, 타이머/정밀 커버리지 호출 수 일치를 확인했습니다. 전후 배달 비교·제품 호출 수 상한 시험·새 제품 성능 개선 관문·B2 잔존 힙·공개 선언 diff 검사는 제품 변경이 없는 이 도구 PR에 해당 없음입니다. 독립 antigravity 검토와 PR 생성은 코디네이터에게 인계합니다.

- 정식 원자료: `{scratch}/perf-runs/20261027T0928-b8db539-b0/`.
- 통계·표: 원자료의 `summary.json`, `tables.md`; 재현 도구는 `design-optimization/tools/profile/branch-switch/reportLedger.mjs`입니다.
- 번들 사본·해시·환경·명령·stdout/stderr·CPU 표본·coverage·heapprofile·gate 입력·준비/검증 로그를 위 디렉터리에 보존했습니다.
- 시작하지 않은 첫 시도: `{scratch}/perf-runs/20261027T0926-b8db539-b0/`(사전 점검 사본도 정식 raw의 preparation에 보존).
- PR 본문: `{scratch}/perf-runs/453-briefs/b0-pr-body.md`. 코디네이터 결정에 따라 워커는 PR을 생성하지 않습니다.
