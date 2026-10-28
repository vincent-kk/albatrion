# B3 — 분기 전환 단계 전체 관문

단일 창의 품질은 **통과**(0.16.1 앞5/뒤5 비 중앙 1.013434155)입니다. 관문별 원판정은 아래와 같으며 제품·시험·기존 도구·기대값을 바꾸지 않았습니다.

## 관문

| 관문                       | 판정 | 측정 근거                                                                          |
| -------------------------- | ---- | ---------------------------------------------------------------------------------- |
| 446C-06 oneOf-80           | FAIL | 왕복 304.083 µs, 0.16.1의 4.140배; 상한 1.5배·1 ms                                 |
| discriminator-80           | FAIL | 왕복 245.187 µs; 같은 형상 oneOf-80의 L을 기준으로 1.5배·1 ms 적용, 직접 L 쌍 없음 |
| if-80                      | FAIL | 왕복 393.458 µs, active+160 guard 상한 308.800 µs; guard 0.029482 µs/호출          |
| TEST-093 형제 1000/0       | FAIL | 21.238배; 창 전 코디네이터가 3배로 고정                                            |
| 다른 canonical 행 TEST-073 | PASS | 전체10/10 주판정 회귀 0건: 없음                                                    |
| Node 노드당 힙             | FAIL | S 중앙 1439.098 → E 중앙 1440.346 B/node; Bun은 아래 보고                          |
| 제거 경로 장부             | PASS | E의 setLatentRaw·captureExitedRaw·updateInactiveValuesMemo 최대 호출 모두0         |

판정은 무계측 총합 행을 기준으로 합니다. 단계 장부는 보조 자료이며 매핑 불일치 항목을 단계간 비교에서 제외합니다. 비율 관문은 창 품질 실패 시 판정 불가이며 재측정하지 않습니다.

## 입력·프로토콜

- S: `0eb03ff3bb54bf06af95271d157aefece1b9bf32`(B0 원장, 설계 최적화 가지와의 merge-base `b8db53997`과 제품 동일). E: `95853ae5f`(#481 병합). L: 설치된 공개 0.16.1 별칭.
- 정식 창: 2026-10-27T23:51:59.548Z–2026-10-28T00:01:32.242Z; Node 26.12.1 / Bun 1.4.4 / Apple M1 Max. 사전 검사 2회, 표본0 대기 후 창1회·재시도0.
- 각 레인은 한 번 빌드한 불변 번들 사본으로 실행하고 전후 SHA-256을 대조했습니다. L은 기존 설치 배포본을 재사용했습니다. AJV8 dist 빌드, S/E 각각22행×2동작=44동작 및 L의 호환18행×2동작=36동작을 통과했습니다.
- 기존 alternate를 그대로 재사용해 행마다 S0/E0…S9/E9 새 프로세스440개를 실행했습니다. 각 자식에서 L을 같이 재므로 L20/S10/E10이며, 창 전에 승인받아 A 역할 L10만 주표·품질에 사용하고 나머지 L10은 보조로 보존했습니다. if·discriminator·구독2행은 L 쌍이 없고 payload-12는 실제 쌍을 사용합니다.
- 20예열·100표본, 대표값은 프로세스 최소값10개의 중앙값입니다. 아래 범위·폭은 요청된 프로세스별100표본 중앙값10개의 최소~최대 및 차이입니다. 최소값의 범위도 raw에 별도 보존합니다.
- 품질은 A 역할 L10의 앞5/뒤5 **프로세스 중앙값** 비를 호환18행에서 중앙 집계했습니다. 기존 장치의 A/B 레거시 품질은 보조로 raw에 그대로 남깁니다.
- TEST-073은 프로세스별100표본을 모두 처리량1000/ms로 바꿔 전체10/10 Welch 양측 검정(평균 −15% 초과 및 p<0.05)을 적용하고 앞5/뒤5를 병기했습니다.
- 각 왕복은 2쓰기이며 형제·leaf·bulk·wave는1쓰기, single은10쓰기, mount는1마운트입니다. 타이머 밖 fixture 준비·단언·task 양보는 기존 장치 그대로입니다.

## 세 레인 — 전체22행

단위 ms. 셀은 **최소값 중앙 / 프로세스 중앙값 최소~최대 (폭)** 입니다.

| 행                          |                                L 0.16.1 |                                S 단계 시작 |                                E 단계 종료 |
| --------------------------- | --------------------------------------: | -----------------------------------------: | -----------------------------------------: |
| single-flat-1000            | 0.533375 / 0.560000~1.095354 (0.535354) |    0.081958 / 0.105187~0.181500 (0.076313) |    0.090729 / 0.106667~0.189625 (0.082958) |
| mount-oneOf-80              | 0.353583 / 0.428770~0.483834 (0.055063) |    2.084063 / 2.385354~2.535084 (0.149730) |    2.158084 / 2.482855~2.676604 (0.193749) |
| mount-flat-1000             | 2.122979 / 2.211729~2.301021 (0.089292) |    2.145313 / 2.384437~2.510396 (0.125959) |    2.152583 / 2.399896~2.547104 (0.147208) |
| mount-nested-d6-f4          | 6.678146 / 7.892187~9.679709 (1.787521) | 16.112375 / 16.987500~18.240187 (1.252687) | 16.115063 / 17.036062~18.492478 (1.456416) |
| single-nested-d6-f4         | 0.033437 / 0.036583~0.071292 (0.034708) |    0.173063 / 0.159791~0.349209 (0.189417) |    0.159750 / 0.158437~0.350833 (0.192396) |
| switch-oneOf-80             | 0.073459 / 0.111500~0.140792 (0.029292) |    0.491063 / 0.602563~0.815646 (0.213083) |    0.304083 / 0.350584~0.589500 (0.238916) |
| bulk-flat-2000              | 1.491917 / 1.705666~2.187083 (0.481417) |    1.823688 / 1.913792~2.208938 (0.295146) |    1.781979 / 1.955979~2.146312 (0.190333) |
| bulk-nested-d6-f4           | 3.601667 / 4.015937~4.240708 (0.224771) |    4.015937 / 4.596792~5.386104 (0.789312) |    4.034063 / 4.939521~5.259625 (0.320104) |
| switch-discriminator-80     |                                 쌍 없음 |    0.877709 / 0.997208~1.113167 (0.115959) |    0.245187 / 0.289563~0.334791 (0.045229) |
| switch-if-80                |                                 쌍 없음 |    1.162855 / 1.248833~1.392083 (0.143250) |    0.393458 / 0.442167~0.506000 (0.063833) |
| switch-nested-oneOf-20      | 0.060375 / 0.077209~0.114979 (0.037770) |    0.679916 / 0.710688~1.021187 (0.310500) |    0.567459 / 0.637604~0.846938 (0.209334) |
| switch-siblings-0           | 0.031187 / 0.039104~0.078000 (0.038896) |    0.099792 / 0.120396~0.215063 (0.094668) |    0.097459 / 0.114541~0.261146 (0.146605) |
| switch-siblings-100         | 0.137396 / 0.171312~0.330105 (0.158792) |    0.273562 / 0.272000~0.534771 (0.262771) |    0.263520 / 0.276604~0.538104 (0.261500) |
| switch-siblings-1000        | 2.536042 / 2.760291~3.453000 (0.692709) |    2.078709 / 2.299063~2.870166 (0.571103) |    2.069854 / 2.406583~2.684250 (0.277667) |
| switch-siblings-4000        | 7.922395 / 8.228563~9.381501 (1.152938) |    6.763312 / 7.132084~7.686396 (0.554313) |    6.670855 / 7.338166~7.598666 (0.260500) |
| leaf-gate-250               | 0.097687 / 0.123708~0.230083 (0.106375) |    0.033958 / 0.050187~0.098542 (0.048354) |    0.032770 / 0.043813~0.117437 (0.073625) |
| leaf-gate-1000              | 0.594063 / 0.559458~1.303209 (0.743751) |    0.033687 / 0.054333~0.122771 (0.068438) |    0.033688 / 0.045646~0.103271 (0.057626) |
| leaf-gate-4000              | 2.615063 / 3.181646~3.985500 (0.803854) |    0.783312 / 0.932313~1.218916 (0.286604) |    0.800271 / 0.990438~1.268583 (0.278145) |
| leaf-gate-8000              | 5.168771 / 5.333313~5.463604 (0.130291) |    1.568625 / 1.618146~1.663167 (0.045021) |    1.558917 / 1.612187~1.637417 (0.025230) |
| wave-1000                   |                                 쌍 없음 |    1.739625 / 1.842208~2.051042 (0.208834) |    1.708188 / 1.856854~2.037104 (0.180250) |
| single-flat-1000-subscribed |                                 쌍 없음 |    0.090250 / 0.089562~0.145458 (0.055896) |    0.086250 / 0.102041~0.130083 (0.028042) |
| switch-payload-12           | 0.208437 / 0.272541~0.359854 (0.087313) |    0.924896 / 1.185854~1.546604 (0.360750) |    0.548646 / 0.596687~0.987312 (0.390625) |

## 분기 쓰기당 환산

| 행                      | 쓰기 수 | L µs/write | S µs/write | E µs/write |
| ----------------------- | ------: | ---------: | ---------: | ---------: |
| switch-oneOf-80         |       2 |     36.729 |    245.531 |    152.041 |
| switch-discriminator-80 |       2 |    쌍 없음 |    438.854 |    122.593 |
| switch-if-80            |       2 |    쌍 없음 |    581.427 |    196.729 |
| switch-nested-oneOf-20  |       2 |     30.187 |    339.958 |    283.729 |
| switch-siblings-0       |       1 |     31.187 |     99.792 |     97.459 |
| switch-siblings-100     |       1 |    137.396 |    273.562 |    263.520 |
| switch-siblings-1000    |       1 |   2536.042 |   2078.709 |   2069.854 |
| switch-siblings-4000    |       1 |   7922.395 |   6763.312 |   6670.855 |
| switch-payload-12       |       2 |    104.218 |    462.448 |    274.323 |

## 형제 선형항

창 전에 상한3배를 고정했습니다. 네 점(0·100·1000·4000)의 최소제곱이며 회귀 기울기는 형제1000개당 µs입니다.

| 레인 | 1000/0 배 | 기울기 µs/1000형제 | 절편 µs |
| ---- | --------: | -----------------: | ------: |
| L    |    81.317 |           1969.061 | 146.202 |
| S    |    20.830 |           1656.884 | 191.316 |
| E    |    21.238 |           1634.544 | 191.378 |

## TEST-073

| 행                          |         전체 Δ% / p |          앞5 Δ% / p |           뒤5 Δ% / p | 주판정 |
| --------------------------- | ------------------: | ------------------: | -------------------: | ------ |
| single-flat-1000            |     -1.707 / 0.3466 |     -2.980 / 0.2047 |      -0.288 / 0.9172 | 선 안  |
| mount-oneOf-80              |  -4.405 / 1.306e-25 |  -5.766 / 2.734e-23 |   -3.039 / 5.939e-07 | 선 안  |
| mount-flat-1000             |      0.918 / 0.1508 |     1.417 / 0.09971 |       0.415 / 0.6604 | 선 안  |
| mount-nested-d6-f4          |     -0.711 / 0.2226 |     -0.189 / 0.8209 |      -1.231 / 0.1314 | 선 안  |
| single-nested-d6-f4         |     3.413 / 0.08975 |  27.822 / 2.748e-19 |  -17.474 / 7.101e-12 | 선 안  |
| switch-oneOf-80             | 45.207 / 1.336e-102 |  27.745 / 9.355e-33 |   63.772 / 4.928e-73 | 선 안  |
| bulk-flat-2000              |      0.502 / 0.2287 |     -0.571 / 0.3642 |     1.579 / 0.003847 | 선 안  |
| bulk-nested-d6-f4           |     -0.811 / 0.2786 |     -0.098 / 0.9268 |      -1.522 / 0.1485 | 선 안  |
| switch-discriminator-80     |         241.184 / 0 |         233.542 / 0 | 248.725 / 5.373e-267 | 선 안  |
| switch-if-80                |         175.587 / 0 |         166.665 / 0 |          184.808 / 0 | 선 안  |
| switch-nested-oneOf-20      |  12.800 / 4.305e-23 |  13.077 / 8.777e-12 |    12.489 / 6.02e-15 | 선 안  |
| switch-siblings-0           |    -3.664 / 0.08432 |    -6.775 / 0.02118 |      -0.101 / 0.9733 | 선 안  |
| switch-siblings-100         |    5.238 / 0.001833 |      1.239 / 0.5818 |    8.676 / 0.0001867 | 선 안  |
| switch-siblings-1000        |      0.089 / 0.8592 |     1.458 / 0.04709 |     -1.246 / 0.06834 | 선 안  |
| switch-siblings-4000        |      0.329 / 0.2294 |     0.651 / 0.09155 |       0.005 / 0.9899 | 선 안  |
| leaf-gate-250               |     -0.434 / 0.8756 |   11.140 / 0.006531 |   -10.819 / 0.004037 | 선 안  |
| leaf-gate-1000              |      3.805 / 0.1348 | -12.901 / 1.752e-05 |   26.952 / 3.845e-10 | 선 안  |
| leaf-gate-4000              |  -2.640 / 0.0006465 |      1.701 / 0.1346 |   -6.846 / 5.438e-11 | 선 안  |
| leaf-gate-8000              |   1.174 / 8.533e-09 |   1.336 / 1.422e-06 |    1.012 / 0.0007037 | 선 안  |
| wave-1000                   |      0.642 / 0.1453 |     -1.231 / 0.0477 |    2.566 / 3.623e-05 | 선 안  |
| single-flat-1000-subscribed |      1.619 / 0.1409 |      0.353 / 0.7988 |      2.872 / 0.09173 | 선 안  |
| switch-payload-12           | 57.398 / 1.216e-148 |  62.191 / 6.888e-81 |   52.655 / 7.426e-70 | 선 안  |

보조 반창은 앞5 회귀0건, 뒤5 `single-nested-d6-f4` 1건(-17.474%, p=7.101e-12)입니다. 전체10/10 주판정은22행 모두 회귀0건이며 보조 신호를 대체하거나 숨기지 않습니다.

## 단계 장부와 호환 범위

기존 B4-2 builder는 단계 시작 소스의 앵커를 지원하지 않습니다. 코디네이터 승인으로 저장소 밖 호환 실행기에서 기존 함수 타이머와 시간 루프를 재사용하고, S의 wheelPreparation만 기존 B0의 staticList→첫 cap 구간으로 연결했으며 siblings-1000을 registry에 추가했습니다. 선택적 helper 존재 검사는 이전 소스의 동명 helper도 허용하도록 완화했습니다. 제품·기존 도구·타이밍 루프는 변경하지 않았습니다.

4행×S/E×3프로세스=24개로 창 전 승인했습니다(브리프의18개와 차이). 값은100쓰기 중앙값의3프로세스 중앙값, 단위µs/쓰기입니다. wrapped 총합은 각 표본의 self 합과 일치하며 계측 오버헤드를 빼지 않습니다. 개별 단계 중앙값의 합과 총합 중앙값은 다릅니다. scratch 계측 번들의 절대 시간을 배포 번들 총합과 직접 비교하지 않습니다.

| 행                   | S wrapped / unwrapped | E wrapped / unwrapped |
| -------------------- | --------------------: | --------------------: |
| switch-oneOf-80      |     238.146 / 221.292 |     172.438 / 154.563 |
| switch-payload-12    |     504.376 / 448.959 |     281.563 / 245.666 |
| switch-siblings-0    |       84.667 / 71.792 |       84.980 / 72.458 |
| switch-siblings-1000 |   2060.334 / 2039.875 |   2070.666 / 2045.417 |

| 행                   | 단계                     |  S self |  E self | 최대호출 S/E | B0 매핑               |
| -------------------- | ------------------------ | ------: | ------: | -----------: | --------------------- |
| switch-oneOf-80      | markWrite                |   4.207 |   1.542 |          4/1 | 폭 안                 |
| switch-oneOf-80      | registerRecalculation    |  12.562 |  12.687 |          1/1 | 폭 안                 |
| switch-oneOf-80      | primeHost                |   2.813 |   2.458 |          1/1 | 폭 안                 |
| switch-oneOf-80      | updateOutput             |   6.896 |   7.416 |          6/6 | 폭 안                 |
| switch-oneOf-80      | computeNode              |  33.438 |  32.104 |          5/5 | 폭 안                 |
| switch-oneOf-80      | wheelPreparation         |   8.668 |   2.812 |          1/1 | 폭 안                 |
| switch-oneOf-80      | createChildNode          |   3.813 |   0.000 |          3/0 | B0 대응 없음          |
| switch-oneOf-80      | enterFieldNode           |   3.416 |   0.000 |          3/0 | B0 대응 없음          |
| switch-oneOf-80      | assembleObject           |   9.187 |   8.854 |          2/2 | 폭 안                 |
| switch-oneOf-80      | selectChildren           |  31.458 |  28.519 |          1/1 | 매핑 불일치·비교 제외 |
| switch-oneOf-80      | transitionSettlement     |   5.042 |   3.917 |          1/1 | 폭 안                 |
| switch-oneOf-80      | getControlLayers         |  13.521 |   1.437 |         12/6 | 매핑 불일치·비교 제외 |
| switch-oneOf-80      | setLatentRaw             |  11.187 |   0.000 |          6/0 | 폭 안                 |
| switch-oneOf-80      | captureExitedRaw         |   5.834 |   0.000 |          3/0 | 폭 안                 |
| switch-oneOf-80      | finalizeExits            |  22.794 |  20.354 |          1/1 | 폭 안                 |
| switch-oneOf-80      | markCommitDeliveries     |  11.021 |  11.584 |          1/1 | 폭 안                 |
| switch-oneOf-80      | updateInactiveValuesMemo |  18.292 |   0.000 |          1/0 | 폭 안                 |
| switch-oneOf-80      | commitSettlement         |   8.418 |   9.459 |          1/1 | 폭 안                 |
| switch-oneOf-80      | everythingElse           |  16.938 |  13.687 |          1/1 | B0 대응 없음          |
| switch-oneOf-80      | cloneFromSlot            |   0.000 |   8.042 |          0/3 | B0 대응 없음          |
| switch-oneOf-80      | enterSlotClone           |   0.000 |   0.750 |          0/3 | B0 대응 없음          |
| switch-payload-12    | markWrite                |   7.105 |   1.500 |         13/1 | 매핑 불일치·비교 제외 |
| switch-payload-12    | registerRecalculation    |  19.646 |  18.583 |          1/1 | 매핑 불일치·비교 제외 |
| switch-payload-12    | primeHost                |   2.709 |   2.375 |          1/1 | 폭 안                 |
| switch-payload-12    | updateOutput             |   6.832 |   7.019 |        15/15 | 폭 안                 |
| switch-payload-12    | computeNode              |  46.332 |  45.666 |        14/14 | 폭 안                 |
| switch-payload-12    | wheelPreparation         |   9.666 |   3.251 |          1/1 | 매핑 불일치·비교 제외 |
| switch-payload-12    | createChildNode          |   5.084 |   0.000 |         12/0 | B0 대응 없음          |
| switch-payload-12    | enterFieldNode           |   6.377 |   0.000 |         12/0 | B0 대응 없음          |
| switch-payload-12    | assembleObject           |  34.583 |  36.104 |          2/2 | 폭 안                 |
| switch-payload-12    | selectChildren           |  58.708 |  48.748 |          1/1 | 폭 안                 |
| switch-payload-12    | transitionSettlement     |   8.020 |   7.834 |          1/1 | 폭 안                 |
| switch-payload-12    | getControlLayers         |  46.917 |   3.416 |        48/24 | 폭 안                 |
| switch-payload-12    | setLatentRaw             |  37.230 |   0.000 |         24/0 | 매핑 불일치·비교 제외 |
| switch-payload-12    | captureExitedRaw         |  13.396 |   0.000 |         12/0 | 폭 안                 |
| switch-payload-12    | finalizeExits            | 103.938 |  35.856 |          1/1 | 폭 안                 |
| switch-payload-12    | markCommitDeliveries     |  15.125 |  15.146 |          1/1 | 폭 안                 |
| switch-payload-12    | updateInactiveValuesMemo |  44.041 |   0.000 |          1/0 | 매핑 불일치·비교 제외 |
| switch-payload-12    | commitSettlement         |  17.646 |  14.542 |          1/1 | 매핑 불일치·비교 제외 |
| switch-payload-12    | everythingElse           |  23.291 |  15.271 |          1/1 | B0 대응 없음          |
| switch-payload-12    | cloneFromSlot            |   0.000 |  16.272 |         0/12 | B0 대응 없음          |
| switch-payload-12    | enterSlotClone           |   0.000 |   1.874 |         0/12 | B0 대응 없음          |
| switch-siblings-0    | markWrite                |   1.500 |   1.542 |          1/1 | 폭 안                 |
| switch-siblings-0    | registerRecalculation    |   6.729 |   6.855 |          1/1 | 폭 안                 |
| switch-siblings-0    | primeHost                |   2.875 |   3.355 |          1/1 | 폭 안                 |
| switch-siblings-0    | updateOutput             |   3.750 |   3.813 |          4/4 | 매핑 불일치·비교 제외 |
| switch-siblings-0    | computeNode              |  14.312 |  14.707 |          4/4 | 폭 안                 |
| switch-siblings-0    | wheelPreparation         |   3.417 |   2.500 |          1/1 | 폭 안                 |
| switch-siblings-0    | evaluateGate             |   5.189 |   5.104 |          6/6 | 폭 안                 |
| switch-siblings-0    | assembleObject           |   2.541 |   2.625 |          1/1 | 폭 안                 |
| switch-siblings-0    | selectChildren           |  14.707 |  15.500 |          1/1 | 매핑 불일치·비교 제외 |
| switch-siblings-0    | transitionSettlement     |   1.250 |   1.250 |          1/1 | 매핑 불일치·비교 제외 |
| switch-siblings-0    | markCommitDeliveries     |   8.958 |   9.125 |          1/1 | 매핑 불일치·비교 제외 |
| switch-siblings-0    | updateInactiveValuesMemo |   0.208 |   0.000 |          1/0 | 매핑 불일치·비교 제외 |
| switch-siblings-0    | commitSettlement         |   3.354 |   3.333 |          1/1 | 폭 안                 |
| switch-siblings-0    | everythingElse           |  12.228 |  11.479 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | markWrite                |   2.396 |   1.875 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | registerRecalculation    |   9.000 |   9.083 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | primeHost                | 655.271 | 651.583 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | updateOutput             |   6.792 |   7.208 |          4/4 | B0 대응 없음          |
| switch-siblings-1000 | computeNode              | 299.438 | 300.624 |          4/4 | B0 대응 없음          |
| switch-siblings-1000 | wheelPreparation         |   5.792 |   4.208 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | evaluateGate             |   6.520 |   6.688 |          6/6 | B0 대응 없음          |
| switch-siblings-1000 | assembleObject           | 254.854 | 260.500 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | selectChildren           | 691.709 | 697.188 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | transitionSettlement     |   1.667 |   1.854 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | markCommitDeliveries     |  22.459 |  22.729 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | updateInactiveValuesMemo |   0.292 |   0.000 |          1/0 | B0 대응 없음          |
| switch-siblings-1000 | commitSettlement         |  77.375 |  76.874 |          1/1 | B0 대응 없음          |
| switch-siblings-1000 | everythingElse           |  18.042 |  17.563 |          1/1 | B0 대응 없음          |

### B0 원장과 같은 S 행 대조

서로 다른 창입니다. 현재 S 자체 폭(max−min) 밖의 차이는 지시에 따라 매핑 불일치로 적고 해당 단계 비교에서 제외했습니다. 원인이나 성능 변화로 해석하지 않습니다. 형제1000은 B0 계측행이 없어 대조 불가입니다.

| 행                | 단계                     | B0 self | 현재 S self | 현재 S 폭 | 판정                  |
| ----------------- | ------------------------ | ------: | ----------: | --------: | --------------------- |
| switch-oneOf-80   | markWrite                |   4.375 |       4.207 |     0.333 | 폭 안                 |
| switch-oneOf-80   | registerRecalculation    |  12.959 |      12.562 |     1.333 | 폭 안                 |
| switch-oneOf-80   | computeNode              |  35.147 |      33.438 |     3.294 | 폭 안                 |
| switch-oneOf-80   | wheelPreparation         |   8.687 |       8.668 |     0.291 | 폭 안                 |
| switch-oneOf-80   | primeHost                |   2.917 |       2.813 |     0.229 | 폭 안                 |
| switch-oneOf-80   | selectChildren           |  35.978 |      31.458 |     2.624 | 매핑 불일치·비교 제외 |
| switch-oneOf-80   | evaluateGate             |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-oneOf-80   | runDeriveRounds          |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-oneOf-80   | transitionSettlement     |   4.958 |       5.042 |     0.333 | 폭 안                 |
| switch-oneOf-80   | finalizeExits            |  23.873 |      22.794 |     1.687 | 폭 안                 |
| switch-oneOf-80   | getControlLayers         |  15.520 |      13.521 |     0.145 | 매핑 불일치·비교 제외 |
| switch-oneOf-80   | captureExitedRaw         |   5.709 |       5.834 |     0.499 | 폭 안                 |
| switch-oneOf-80   | setLatentRaw             |  11.208 |      11.187 |     1.207 | 폭 안                 |
| switch-oneOf-80   | updateOutput             |   6.958 |       6.896 |     0.354 | 폭 안                 |
| switch-oneOf-80   | assembleObject           |   9.979 |       9.187 |     1.062 | 폭 안                 |
| switch-oneOf-80   | commitSettlement         |   8.500 |       8.418 |     0.374 | 폭 안                 |
| switch-oneOf-80   | updateInactiveValuesMemo |  18.666 |      18.292 |     1.188 | 폭 안                 |
| switch-oneOf-80   | markCommitDeliveries     |  11.876 |      11.021 |     1.646 | 폭 안                 |
| switch-payload-12 | markWrite                |   5.709 |       7.105 |     0.792 | 매핑 불일치·비교 제외 |
| switch-payload-12 | registerRecalculation    |  18.687 |      19.646 |     0.521 | 매핑 불일치·비교 제외 |
| switch-payload-12 | computeNode              |  45.123 |      46.332 |     2.730 | 폭 안                 |
| switch-payload-12 | wheelPreparation         |   9.062 |       9.666 |     0.146 | 매핑 불일치·비교 제외 |
| switch-payload-12 | primeHost                |   2.645 |       2.709 |     0.104 | 폭 안                 |
| switch-payload-12 | selectChildren           |  57.252 |      58.708 |     2.044 | 폭 안                 |
| switch-payload-12 | evaluateGate             |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-payload-12 | runDeriveRounds          |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-payload-12 | transitionSettlement     |   7.688 |       8.020 |     0.563 | 폭 안                 |
| switch-payload-12 | finalizeExits            | 102.416 |     103.938 |    18.631 | 폭 안                 |
| switch-payload-12 | getControlLayers         |  45.476 |      46.917 |     1.794 | 폭 안                 |
| switch-payload-12 | captureExitedRaw         |  12.124 |      13.396 |     1.751 | 폭 안                 |
| switch-payload-12 | setLatentRaw             |  31.273 |      37.230 |     1.583 | 매핑 불일치·비교 제외 |
| switch-payload-12 | updateOutput             |   6.561 |       6.832 |     0.456 | 폭 안                 |
| switch-payload-12 | assembleObject           |  37.105 |      34.583 |     4.000 | 폭 안                 |
| switch-payload-12 | commitSettlement         |  15.771 |      17.646 |     0.938 | 매핑 불일치·비교 제외 |
| switch-payload-12 | updateInactiveValuesMemo |  35.854 |      44.041 |     2.938 | 매핑 불일치·비교 제외 |
| switch-payload-12 | markCommitDeliveries     |  14.709 |      15.125 |     0.667 | 폭 안                 |
| switch-siblings-0 | markWrite                |   1.417 |       1.500 |     0.083 | 폭 안                 |
| switch-siblings-0 | registerRecalculation    |   6.666 |       6.729 |     0.187 | 폭 안                 |
| switch-siblings-0 | computeNode              |  13.813 |      14.312 |     0.606 | 폭 안                 |
| switch-siblings-0 | wheelPreparation         |   3.354 |       3.417 |     0.229 | 폭 안                 |
| switch-siblings-0 | primeHost                |   2.834 |       2.875 |     0.166 | 폭 안                 |
| switch-siblings-0 | selectChildren           |  13.876 |      14.707 |     0.499 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | evaluateGate             |   4.980 |       5.189 |     0.252 | 폭 안                 |
| switch-siblings-0 | runDeriveRounds          |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-siblings-0 | transitionSettlement     |   1.229 |       1.250 |     0.000 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | finalizeExits            |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-siblings-0 | getControlLayers         |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-siblings-0 | captureExitedRaw         |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-siblings-0 | setLatentRaw             |   0.000 |       0.000 |     0.000 | 폭 안                 |
| switch-siblings-0 | updateOutput             |   3.666 |       3.750 |     0.084 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | assembleObject           |   2.541 |       2.541 |     0.042 | 폭 안                 |
| switch-siblings-0 | commitSettlement         |   3.417 |       3.354 |     0.146 | 폭 안                 |
| switch-siblings-0 | updateInactiveValuesMemo |   0.167 |       0.208 |     0.000 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | markCommitDeliveries     |   8.563 |       8.958 |     0.376 | 매핑 불일치·비교 제외 |

## 힙·보유 상한

기존 node-and-settle --heap-child, 5001노드, 런타임·레인별7표본입니다. Node의 주표는 중앙값≤중앙값을 적용하고 기존 B2의 S 최댓값 기준도 함께 공개합니다. Bun은 보고만 합니다.

| 런타임 | S 중앙 B/node |   S 최대 |   E 중앙 | E−S 중앙 | 기존 B2 중앙≤S최대 |
| ------ | ------------: | -------: | -------: | -------: | ------------------ |
| node   |      1439.098 | 1889.544 | 1440.346 |    1.248 | PASS               |
| bun    |      2224.772 | 2224.796 | 2250.904 |   26.132 | FAIL               |

120쓰기 후 슬롯 Map의 V8 strong-edge dominator 보유량입니다. 공유 청사진과 외부에서 보유한 detached 노드는 제외하며 중첩 Map 바이트는 합산하지 않습니다. K는 호스트가 보유한 비활성 엔트리 수, M은 보유 서브트리 최대 노드 수입니다. 관측은 고정 fixture의 K·M 상한 기록이며 임의의 입력 이력 전체에 대한 증명은 아닙니다.

| 행                      | 호스트         | 슬롯 K |   M | K·M | 보유노드 | unread bytes | read bytes | reset 후 슬롯호스트 |
| ----------------------- | -------------- | -----: | --: | --: | -------: | -----------: | ---------: | ------------------: |
| switch-discriminator-80 | `root`         |      3 |   1 |   3 |        3 |         5408 |       5728 |                   0 |
| switch-if-80            | `root`         |      3 |   1 |   3 |        3 |         5408 |       5800 |                   0 |
| switch-nested-oneOf-20  | `/outer/inner` |      3 |   1 |   3 |        3 |         5336 |       5656 |                   0 |
| switch-oneOf-80         | `root`         |      3 |   1 |   3 |        3 |         5336 |       5656 |                   0 |
| switch-payload-12       | `root`         |     12 |   1 |  12 |       12 |        18120 |      18696 |                   0 |
| switch-siblings-0       | 없음           |      0 |   0 |   0 |        0 |            0 |          0 |                   0 |
| switch-siblings-100     | 없음           |      0 |   0 |   0 |        0 |            0 |          0 |                   0 |
| switch-siblings-1000    | 없음           |      0 |   0 |   0 |        0 |            0 |          0 |                   0 |
| switch-siblings-4000    | 없음           |      0 |   0 |   0 |        0 |            0 |          0 |                   0 |

## React whole-form — 보고 전용

benchmark-form --equivalent --mode=render --fixture=oneOf-20을 S/E마다 한 번 실행했습니다. 각 실행은 L과 latest를 교대하며100표본입니다. update-settled를 보고하고 B5 관문을 판정하지 않습니다. 두 실행의 L은 각자의 쌍이며 하나의 레거시 기준으로 합치지 않습니다.

| 실행 | metric         | L 중앙 ms | 현재 중앙 ms |    비 |
| ---- | -------------- | --------: | -----------: | ----: |
| S    | update-settled |  6.406562 |     6.559937 | 1.024 |
| E    | update-settled |  6.509667 |     6.592855 | 1.013 |

## oneOf-80 누적 — 이전 창 인용

아래 과거 값은 각 결과 문서의 채택된 최종 창에서 인용했습니다. 이번 창의 재측정값과 혼합해 개선 효과나 비율을 계산하지 않습니다. 단위µs/쓰기이며 왕복÷2입니다.

| 위치      | 이전 창 인용 µs/write | B3 재측정 µs/write | 출처·창                                         |
| --------- | --------------------: | -----------------: | ----------------------------------------------- |
| 0.16.1    |                43.730 |             36.729 | [B0](b0-ledger.md), 09:28 창                    |
| 단계 시작 |               261.291 |            245.531 | [B0](b0-ledger.md), 같은 창                     |
| B1 후     |               252.406 |                  — | [B1](b1-results.md), 마지막 승인 교대 창        |
| B2-P2 후  |               220.573 |                  — | [B2-P2](b2-p2-results.md), 채택 창              |
| B4-1 후   |               146.219 |                  — | [B4-1](b4-1-results.md), 후보2 B10 0.292438ms÷2 |
| B4-2 후   |              187.0835 |            152.041 | [B4-2](b4-2-results.md), B10 0.374167ms÷2       |

## 검증·인계

원표본은 실행 디렉터리에 보존하고 저장소에는 요약만 둡니다. 행수·PID·교대순서·100표본·최소값·self 합·불변 번들 해시를 다시 계산했습니다. 제품 src·시험·배포 산출물 차분은0입니다. 단계 시작 archive의 첫 build는 workspace 의존성 링크 누락으로 마지막 typecheck가 실패했지만 runtime·선언 생성은 완료했고, 링크 복원 후 같은 typecheck는 통과했습니다. 종료 판 재귀 build와 AJV8 build는 통과했습니다.

[판정](raw/b3/judgement.json) · [22행](raw/b3/results.summary.json) · [품질](raw/b3/quality.json) · [CPU 창](raw/b3/window.json) · [입력 해시](raw/b3/inputs.json) · [Welch](raw/b3/welch.json) · [단계](raw/b3/stages.json) · [B0 매핑](raw/b3/stage-mapping.json) · [S manifest](raw/b3/stage-manifest-S.json) · [E manifest](raw/b3/stage-manifest-E.json) · [힙](raw/b3/heaps.json) · [보유량](raw/b3/retention.json) · [K·M 무계측 검사](raw/b3/retention-bounds.json) · [계측 번들 해시](raw/b3/stage-hashes.json) · [장치 검증](raw/b3/validation.json)

### 마감 검사

| 검사             | 결과                                                       |
| ---------------- | ---------------------------------------------------------- |
| lint / typecheck | exit 0 / 0                                                 |
| unit             | 561파일·3802시험 통과·기존 todo1                           |
| render           | 129파일·761시험 통과                                       |
| react18          | 129파일·761시험 통과                                       |
| production       | 9파일·20시험 통과                                          |
| storybook        | 100파일·251시험 통과 (98파일 통과 + IME 두 파일 직렬 확인) |

전체 프로젝트 병렬 시험의 첫 실행은 Node 4GB 힙 OOM으로 중단되었고 두 IME Storybook 클릭이 timeout이었습니다. unit은8GB에서 통과했고 나머지 프로젝트는 분리 실행했습니다. Storybook 전체 실행의98파일 통과와 실패했던 두 파일의 직렬5시험 통과를 합쳐100파일·251시험을 확인했습니다. 성능 창 종료 뒤의 기능 검증이며 정식 성능 재측정은 아닙니다.

Filid scan/validate/verification은 같은 snapshot을 사용했습니다. **FAIL / certainty indeterminate**: 구조 finding 202개(실패 항목 6개), 검증 진단 22개, 중복 제거 202개입니다. detail-document-contract 진단176개 등 변경 범위 밖의 기존 항목을 그대로 기록했으며 이번 문서 전용 작업에서 제품·모듈 계약을 수정하지 않았습니다.

[마감 검사](raw/b3/checks.json) · [FCA 진단](raw/b3/filid.json)
