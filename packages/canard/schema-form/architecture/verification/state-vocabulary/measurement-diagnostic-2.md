| 항목 | 내용 |
| --- | --- |
| 기록 | 상태 어휘 단계 진단 측정 창 2 |
| 구분 | DIAGNOSTIC; 등록 창의 판정을 대체하지 않으며 별도로 기록합니다. |
| 등록 증거 커밋 | 39239082cbb99f463967efdfb8ae79fc4c835847 |
| 등록 판정 문장 | 등록 창의 판정(SV-1 FAIL, SV-2 PASS)은 그대로입니다. 이 진단 창은 Vincent의 재측정 요청에 따라 같은 B·F 고정 번들과 같은 규칙으로 한 번 더 잰 기록이며, 등록 판정을 대체하지 않습니다. |

| 항목 | 내용 |
| --- | --- |
| 구분 | 진단 창 수치 |

| 항목 | 내용 |
| --- | --- |
| 구분 | 고정 입력 |

| 항목 | 값 |
| --- | --- |
| B | 212967e0f1d2a044d40b9c090420b6b54a33d078 |
| F | 736ee7ed1aa97422aa6f7128d85fbbd4c6b64682 |
| 사전 등록 커밋 | d18dc9a5b1d585437075c01b1d8091ae903a1a23 |
| 규칙 버전 | state-vocabulary-v1 |
| 규칙 sha256 | db2a3baac3942b8372936a7a24fa57296bcdfbe29871a74e46d0e3d4cf568f0e |

| 관측 메타데이터 | 저장된 값 |
| --- | --- |
| startedAt | 2026-11-02T05:38:24.865Z |
| endedAt | 2026-11-02T06:10:42.787Z |
| toolCommit | 39239082cbb99f463967efdfb8ae79fc4c835847 |
| chromium | 145.0.7632.6 |
| count | 10 |
| warmup | 3 |
| node | v24.20.0 |
| react | 19.2.6 |
| playwright | 1.58.0 |
| esbuild | 0.25.9 |
| ajv | 8.17.1 |
| cpu | Apple M1 Max |
| logicalCpus | 10 |
| platform | darwin |
| arch | arm64 |
| release | 27.0.0 |
| memoryGiB | 64 |

| 항목 | 내용 |
| --- | --- |
| 구분 | checker 판정 데이터 |

| 게이트 | 저장된 판정 |
| --- | --- |
| SV-1 | PASS |
| SV-2 | PASS |
| C1 | PASS |
| C2 | PASS |
| C3 | PASS |
| C4 | PASS |
| C5 | PASS |
| C6 | PASS |

| 항목 | 내용 |
| --- | --- |
| 기록 | 진단 창에서는 C1부터 C6까지와 SV-2가 모두 PASS입니다. 등록 창에서 FAIL이었던 C2도 통과했습니다. 등록 판정은 바꾸지 않습니다. |

| 항목 | 내용 |
| --- | --- |
| 구분 | F/B 통계와 상한 |

| 항목 | 내용 |
| --- | --- |
| 기록 | 숫자는 checker JSON의 원문 숫자 토큰을 그대로 옮겼습니다. —는 해당 저장 필드가 없음을 뜻합니다. processing·processingTail의 B/F 값은 각 행 handler.p95이며, 다른 값은 metrics에서 옮깁니다. |

| 행 | 통계 | B 저장 값 | F 저장 값 | F/B 상한 | F − B 상한 |
| --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | handlerP95 | 1.550000011920929 | 1.8499999642372131 | 1.3333333333333333 | 0.5 |
| type-flat-500-validate-nonburst | eventProcessingP95 | 4.199999988079071 | 4.199999928474426 | — | — |
| type-flat-500-validate-nonburst | durationP95 | 16 | 16 | 10.32258056577113 | 14.449999988079071 |
| type-flat-500-validate-nonburst | arrivalP95 | 8.149999976158142 | 9.250000059604645 | 1.1923077087665688 | 1.5000001192092896 |
| type-flat-500-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-flat-500-validate-nonburst | firstPainted | 37.90000003576279 | 37.25 | 1.010652462743839 | 0.3999999761581421 |
| type-flat-500-validate-nonburst | eagerPainted | 90.69999992847443 | 92.5 | 1.021523180014801 | 1.9500001072883606 |
| type-flat-500-validate-nonburst | callDuration | — | — | — | — |
| type-flat-500-validate-nonburst | nextPainted | — | — | — | — |
| type-flat-500-validate-nonburst | resolutionTime | — | — | — | — |
| type-flat-500-validate-nonburst | postPaintBusy | 36.199999928474426 | 37.34999996423721 | 1.0511049746135257 | 1.8500000834465027 |
| type-flat-500-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-flat-500-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-500-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-500-validate-nonburst | processing | 2.200000047683716 | 2.5 | 1.1363636117336184 | 0.050000011920928955 |
| type-flat-500-validate-nonburst | processingTail | 2.200000047683716 | 2.5 | 1.1363636117336184 | 0.2999999523162842 |
| type-flat-500-validate-burst | handlerP95 | 0.7999999523162842 | 0.7999999523162842 | 1.12500001862645 | 0.09999996423721313 |
| type-flat-500-validate-burst | eventProcessingP95 | 1.050000011920929 | 0.9000000357627869 | 2.550000011920929 | 1.550000011920929 |
| type-flat-500-validate-burst | durationP95 | 16 | 16 | 1 | 0 |
| type-flat-500-validate-burst | arrivalP95 | 10.399999976158142 | 14.000000059604645 | — | — |
| type-flat-500-validate-burst | undelivered | 19 | 18 | 1.1111111111111112 | 2 |
| type-flat-500-validate-burst | firstPainted | 38.59999996423721 | 38.65000009536743 | 1.0453955916747986 | 1.75 |
| type-flat-500-validate-burst | eagerPainted | 94.10000002384186 | 93.55000001192093 | 1.0237580998608777 | 2.199999988079071 |
| type-flat-500-validate-burst | callDuration | — | — | — | — |
| type-flat-500-validate-burst | nextPainted | — | — | — | — |
| type-flat-500-validate-burst | resolutionTime | — | — | — | — |
| type-flat-500-validate-burst | postPaintBusy | 36.30000001192093 | 36.09999990463257 | 1.015341703544609 | 0.5500001311302185 |
| type-flat-500-validate-burst | flooredLongestFrame | — | — | — | — |
| type-flat-500-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-500-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-500-validate-burst | processing | 0.8000000715255737 | 0.9000000953674316 | 1.12500001862645 | 0 |
| type-flat-500-validate-burst | processingTail | 0.8000000715255737 | 0.9000000953674316 | 1.12500001862645 | 0.10000002384185791 |
| type-array-1000-validate-nonburst | handlerP95 | 1.2000000476837158 | 1.2000000476837158 | 1.0909091106131052 | 0.10000002384185791 |
| type-array-1000-validate-nonburst | eventProcessingP95 | 4.800000071525574 | 4.799999952316284 | 1.032967027640691 | 0.15000003576278687 |
| type-array-1000-validate-nonburst | durationP95 | 20 | 20 | 1.5 | 8 |
| type-array-1000-validate-nonburst | arrivalP95 | 13.649999976158142 | 13.650000035762787 | 1.0477941206118226 | 0.6499999761581421 |
| type-array-1000-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-array-1000-validate-nonburst | firstPainted | 138.85000002384186 | 140.1500000357628 | 1.0202166061539082 | 2.799999952316284 |
| type-array-1000-validate-nonburst | eagerPainted | 238.5 | 236.9000000357628 | 1.024332472162157 | 5.650000035762787 |
| type-array-1000-validate-nonburst | callDuration | — | — | — | — |
| type-array-1000-validate-nonburst | nextPainted | — | — | — | — |
| type-array-1000-validate-nonburst | resolutionTime | — | — | — | — |
| type-array-1000-validate-nonburst | postPaintBusy | 14.550000071525574 | 14.249999940395355 | 4.553633237233046 | 51.35000020265579 |
| type-array-1000-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-array-1000-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-array-1000-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-array-1000-validate-nonburst | processing | 1.399999976158142 | 1.3000000715255737 | 1.000000091699457 | 0 |
| type-array-1000-validate-nonburst | processingTail | 1.399999976158142 | 1.3000000715255737 | 1.000000091699457 | 1.1920928955078125e-7 |
| type-array-1000-validate-burst | handlerP95 | 1 | 1 | 1.052631526112229 | 0.04999995231628418 |
| type-array-1000-validate-burst | eventProcessingP95 | 4.600000023841858 | 4.799999952316284 | 2.238095178625752 | 2.5999999046325684 |
| type-array-1000-validate-burst | durationP95 | 32 | 32 | 1 | 0 |
| type-array-1000-validate-burst | arrivalP95 | 12.150000035762787 | 13 | 1.1059322088691428 | 1.2500000596046448 |
| type-array-1000-validate-burst | undelivered | 16 | 16 | 1 | 0 |
| type-array-1000-validate-burst | firstPainted | 138.85000002384186 | 137.70000004768372 | 1.0105301378909002 | 1.449999988079071 |
| type-array-1000-validate-burst | eagerPainted | 230.95000004768372 | 231.75 | 1.0150294053055975 | 3.449999988079071 |
| type-array-1000-validate-burst | callDuration | — | — | — | — |
| type-array-1000-validate-burst | nextPainted | — | — | — | — |
| type-array-1000-validate-burst | resolutionTime | — | — | — | — |
| type-array-1000-validate-burst | postPaintBusy | 14.150000095367432 | 14.100000023841858 | 1.073170724413131 | 1.0499998927116394 |
| type-array-1000-validate-burst | flooredLongestFrame | — | — | — | — |
| type-array-1000-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-array-1000-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-array-1000-validate-burst | processing | 1.2000000476837158 | 1.100000023841858 | 0.9166666501098215 | 0.050000011920928955 |
| type-array-1000-validate-burst | processingTail | 1.2000000476837158 | 1.100000023841858 | 0.9166666501098215 | -0.10000002384185791 |
| type-nested-d5-f4-validate-nonburst | handlerP95 | 2 | 1.5 | 0.9428571613467476 | -0.10000002384185791 |
| type-nested-d5-f4-validate-nonburst | eventProcessingP95 | 4.849999964237213 | 4.800000011920929 | — | — |
| type-nested-d5-f4-validate-nonburst | durationP95 | 16 | 16 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | arrivalP95 | 13.149999976158142 | 12.650000035762787 | 1.133047216712246 | 1.649999976158142 |
| type-nested-d5-f4-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | firstPainted | 67.89999997615814 | 67.19999998807907 | 1.009009008468805 | 0.5999999642372131 |
| type-nested-d5-f4-validate-nonburst | eagerPainted | 169.54999995231628 | 168.95000004768372 | 1.0069402533242438 | 1.1500000357627869 |
| type-nested-d5-f4-validate-nonburst | callDuration | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | nextPainted | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | resolutionTime | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | postPaintBusy | 166.4999998807907 | 166.59999990463257 | 1.0273224051270227 | 4.5000001192092896 |
| type-nested-d5-f4-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | processing | 4 | 3 | 1.15384619616898 | 0.04999995231628418 |
| type-nested-d5-f4-validate-nonburst | processingTail | 4 | 3 | 1.15384619616898 | 0.40000009536743164 |
| type-nested-d5-f4-validate-burst | handlerP95 | 1.0999999642372131 | 1 | 1.1111109933735537 | 0.10000002384185791 |
| type-nested-d5-f4-validate-burst | eventProcessingP95 | 2.649999976158142 | 1.75 | 2.0937501024454894 | 1.800000011920929 |
| type-nested-d5-f4-validate-burst | durationP95 | 16 | 16 | 1 | 0 |
| type-nested-d5-f4-validate-burst | arrivalP95 | 16.950000047683716 | 16.799999952316284 | — | — |
| type-nested-d5-f4-validate-burst | undelivered | 20 | 18 | 1 | 0 |
| type-nested-d5-f4-validate-burst | firstPainted | 68.14999997615814 | 68.60000002384186 | 1.0234604109313765 | 1.600000023841858 |
| type-nested-d5-f4-validate-burst | eagerPainted | 169.99999994039536 | 167.25 | 1.0011820330265553 | 0.19999998807907104 |
| type-nested-d5-f4-validate-burst | callDuration | — | — | — | — |
| type-nested-d5-f4-validate-burst | nextPainted | — | — | — | — |
| type-nested-d5-f4-validate-burst | resolutionTime | — | — | — | — |
| type-nested-d5-f4-validate-burst | postPaintBusy | 161.69999992847443 | 164.6000000834465 | 1.0432873273349448 | 6.899999976158142 |
| type-nested-d5-f4-validate-burst | flooredLongestFrame | — | — | — | — |
| type-nested-d5-f4-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-burst | processing | 2.600000023841858 | 1.2999999523162842 | 1.1818181128541314 | 0.02499997615814209 |
| type-nested-d5-f4-validate-burst | processingTail | 2.600000023841858 | 1.2999999523162842 | 1.1818181128541314 | 0.19999992847442627 |
| type-flat-2000-validate-nonburst | handlerP95 | 2.049999952316284 | 2.1999999284744263 | 1.4054054454611207 | 0.7500000596046448 |
| type-flat-2000-validate-nonburst | eventProcessingP95 | 5.399999976158142 | 5.600000023841858 | 1.325581402763152 | 1.550000011920929 |
| type-flat-2000-validate-nonburst | durationP95 | 16 | 20 | 1.5 | 8 |
| type-flat-2000-validate-nonburst | arrivalP95 | 12.200000047683716 | 11.5 | 1.04 | 0.5 |
| type-flat-2000-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-nonburst | firstPainted | 93.05000001192093 | 90.04999995231628 | 1.0022050708750747 | 0.19999992847442627 |
| type-flat-2000-validate-nonburst | eagerPainted | 241.5999999642372 | 240.3499999642372 | 1.0313018245180947 | 7.550000071525574 |
| type-flat-2000-validate-nonburst | callDuration | — | — | — | — |
| type-flat-2000-validate-nonburst | nextPainted | — | — | — | — |
| type-flat-2000-validate-nonburst | resolutionTime | — | — | — | — |
| type-flat-2000-validate-nonburst | postPaintBusy | 229.2500001192093 | 232.19999986886978 | 1.0506244434090617 | 11.350000202655792 |
| type-flat-2000-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-flat-2000-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-nonburst | processing | 3.100000023841858 | 3.200000047683716 | 1.3913043974027302 | 0.12499994039535522 |
| type-flat-2000-validate-nonburst | processingTail | 3.100000023841858 | 3.200000047683716 | 1.3913043974027302 | 0.9000000953674316 |
| type-flat-2000-validate-burst | handlerP95 | 1.350000023841858 | 1.399999976158142 | 1.1153845906963022 | 0.1499999761581421 |
| type-flat-2000-validate-burst | eventProcessingP95 | 5.399999976158142 | 5.600000023841858 | 1.4683544227393501 | 1.800000011920929 |
| type-flat-2000-validate-burst | durationP95 | 16 | 16 | 1.25 | 4 |
| type-flat-2000-validate-burst | arrivalP95 | 10.250000059604645 | 10.449999988079071 | 1.081218275616804 | 0.800000011920929 |
| type-flat-2000-validate-burst | undelivered | 18 | 18 | 1.125 | 2 |
| type-flat-2000-validate-burst | firstPainted | 91.35000002384186 | 92.70000004768372 | 1.0454296658464697 | 4.149999976158142 |
| type-flat-2000-validate-burst | eagerPainted | 242.55000001192093 | 241.5999999642372 | 1.0108832143306599 | 2.5999999046325684 |
| type-flat-2000-validate-burst | callDuration | — | — | — | — |
| type-flat-2000-validate-burst | nextPainted | — | — | — | — |
| type-flat-2000-validate-burst | resolutionTime | — | — | — | — |
| type-flat-2000-validate-burst | postPaintBusy | 232.54999989271164 | 227.1499999165535 | 1.01245085095778 | 2.849999785423279 |
| type-flat-2000-validate-burst | flooredLongestFrame | — | — | — | — |
| type-flat-2000-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-burst | processing | 1.600000023841858 | 1.600000023841858 | 1.142857179349783 | 0.04999998211860657 |
| type-flat-2000-validate-burst | processingTail | 1.600000023841858 | 1.600000023841858 | 1.142857179349783 | 0.20000004768371582 |
| mount-flat-500-validate | handlerP95 | — | — | — | — |
| mount-flat-500-validate | eventProcessingP95 | — | — | — | — |
| mount-flat-500-validate | durationP95 | — | — | — | — |
| mount-flat-500-validate | arrivalP95 | — | — | — | — |
| mount-flat-500-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-validate | firstPainted | 38.44999998807907 | 37.950000047683716 | 1.0198412714431415 | 0.75 |
| mount-flat-500-validate | eagerPainted | 89.30000001192093 | 88.55000001192093 | 1.0147559592786453 | 1.2999999523162842 |
| mount-flat-500-validate | callDuration | — | — | — | — |
| mount-flat-500-validate | nextPainted | — | — | — | — |
| mount-flat-500-validate | resolutionTime | — | — | — | — |
| mount-flat-500-validate | postPaintBusy | 32.34999990463257 | 32.199999928474426 | 1.0267716466844676 | 0.8499997854232788 |
| mount-flat-500-validate | flooredLongestFrame | — | — | — | — |
| mount-flat-500-validate | longestFrame | 0 | 0 | 1 | 0 |
| mount-flat-500-validate | longFrameCount | 0 | 0 | 1 | 0 |
| mount-flat-500-validate | flooredMountLongestFrame | — | — | 1 | 0 |
| mount-nested-d5-f4-validate | handlerP95 | — | — | — | — |
| mount-nested-d5-f4-validate | eventProcessingP95 | — | — | — | — |
| mount-nested-d5-f4-validate | durationP95 | — | — | — | — |
| mount-nested-d5-f4-validate | arrivalP95 | — | — | — | — |
| mount-nested-d5-f4-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-nested-d5-f4-validate | firstPainted | 67.04999995231628 | 67.64999997615814 | 1.0287225998011027 | 1.899999976158142 |
| mount-nested-d5-f4-validate | eagerPainted | 167.60000002384186 | 167.44999998807907 | 1.0120700056761571 | 1.9999999403953552 |
| mount-nested-d5-f4-validate | callDuration | — | — | — | — |
| mount-nested-d5-f4-validate | nextPainted | — | — | — | — |
| mount-nested-d5-f4-validate | resolutionTime | — | — | — | — |
| mount-nested-d5-f4-validate | postPaintBusy | 157.8999999165535 | 157.10000002384186 | 1.0126502228945287 | 2.000000238418579 |
| mount-nested-d5-f4-validate | flooredLongestFrame | — | — | — | — |
| mount-nested-d5-f4-validate | longestFrame | 83.80000001192093 | 84.19999998807907 | 1.0174174179901947 | 1.4500000476837158 |
| mount-nested-d5-f4-validate | longFrameCount | 2 | 2 | 1 | 0 |
| mount-nested-d5-f4-validate | flooredMountLongestFrame | — | — | 1.0174174179901947 | 1.4500000476837158 |
| mount-if-flat-500-validate | handlerP95 | — | — | — | — |
| mount-if-flat-500-validate | eventProcessingP95 | — | — | — | — |
| mount-if-flat-500-validate | durationP95 | — | — | — | — |
| mount-if-flat-500-validate | arrivalP95 | — | — | — | — |
| mount-if-flat-500-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-if-flat-500-validate | firstPainted | 105.89999997615814 | 105.90000003576279 | 1.011310084710739 | 1.199999988079071 |
| mount-if-flat-500-validate | eagerPainted | 123.30000001192093 | 123.19999998807907 | 1.0191368080098837 | 2.350000023841858 |
| mount-if-flat-500-validate | callDuration | — | — | — | — |
| mount-if-flat-500-validate | nextPainted | — | — | — | — |
| mount-if-flat-500-validate | resolutionTime | — | — | — | — |
| mount-if-flat-500-validate | postPaintBusy | 2 | 2 | 1.0256410319110738 | 0.050000011920928955 |
| mount-if-flat-500-validate | flooredLongestFrame | — | — | — | — |
| mount-if-flat-500-validate | longestFrame | 116.19999992847443 | 115.55000001192093 | 1.0051590715742722 | 0.6000000238418579 |
| mount-if-flat-500-validate | longFrameCount | 1 | 1 | 1 | 0 |
| mount-if-flat-500-validate | flooredMountLongestFrame | — | — | 1.0051590715742722 | 0.6000000238418579 |
| first-key-flat-500-validate | handlerP95 | 3.5 | 3.449999988079071 | 1.0144927571286075 | 0.050000011920928955 |
| first-key-flat-500-validate | eventProcessingP95 | — | — | — | — |
| first-key-flat-500-validate | durationP95 | 3.5 | 3.449999988079071 | 1.0144927571286075 | 0.050000011920928955 |
| first-key-flat-500-validate | arrivalP95 | 6.449999988079071 | 6.25 | 1.0240000250244143 | 0.15000015497207642 |
| first-key-flat-500-validate | undelivered | 0 | 0 | 1 | 0 |
| first-key-flat-500-validate | firstPainted | 38.30000001192093 | 38.94999998807907 | 1.0249017050662494 | 0.949999988079071 |
| first-key-flat-500-validate | eagerPainted | 98.85000002384186 | 96.65000003576279 | 1.0061130924502049 | 0.6000000238418579 |
| first-key-flat-500-validate | callDuration | — | — | — | — |
| first-key-flat-500-validate | nextPainted | — | — | — | — |
| first-key-flat-500-validate | resolutionTime | — | — | — | — |
| first-key-flat-500-validate | postPaintBusy | 36.54999989271164 | 36.14999985694885 | 1.0240113001246987 | 0.8499999046325684 |
| first-key-flat-500-validate | flooredLongestFrame | — | — | — | — |
| first-key-flat-500-validate | longestFrame | 0 | 0 | 1 | 0 |
| first-key-flat-500-validate | longFrameCount | 0 | 0 | 1 | 0 |
| first-key-flat-500-validate | processing | 3.600000023841858 | 3.8000000715255737 | 1.0555556033864446 | 0.050000011920928955 |
| first-key-flat-2000-validate | handlerP95 | 4.050000011920929 | 4.099999904632568 | 1.0375000089406967 | 0.15000003576278687 |
| first-key-flat-2000-validate | eventProcessingP95 | 5.949999988079071 | 5.899999976158142 | — | — |
| first-key-flat-2000-validate | durationP95 | 4.050000011920929 | 4.099999904632568 | 1.0375000089406967 | 0.15000003576278687 |
| first-key-flat-2000-validate | arrivalP95 | 10.050000011920929 | 10.249999940395355 | 1.0399999976158143 | 0.3999999761581421 |
| first-key-flat-2000-validate | undelivered | 0 | 0 | 1 | 0 |
| first-key-flat-2000-validate | firstPainted | 91.39999997615814 | 90.25 | 1.0178173715370247 | 1.5999999642372131 |
| first-key-flat-2000-validate | eagerPainted | 245.4000000357628 | 238.55000001192093 | 0.9845265112455908 | -3.75 |
| first-key-flat-2000-validate | callDuration | — | — | — | — |
| first-key-flat-2000-validate | nextPainted | — | — | — | — |
| first-key-flat-2000-validate | resolutionTime | — | — | — | — |
| first-key-flat-2000-validate | postPaintBusy | 235.69999992847443 | 227.5 | 0.9819456244671604 | -4.199999988079071 |
| first-key-flat-2000-validate | flooredLongestFrame | — | — | — | — |
| first-key-flat-2000-validate | longestFrame | 128.8999999165535 | 124.30000001192093 | 0.979841897138965 | -2.550000011920929 |
| first-key-flat-2000-validate | longFrameCount | 2 | 2 | 1 | 0 |
| first-key-flat-2000-validate | processing | 4.5 | 4.299999952316284 | 1.0238095008326769 | 0.15000003576278687 |
| mount-flat-500-none | handlerP95 | — | — | — | — |
| mount-flat-500-none | eventProcessingP95 | — | — | — | — |
| mount-flat-500-none | durationP95 | — | — | — | — |
| mount-flat-500-none | arrivalP95 | — | — | — | — |
| mount-flat-500-none | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-none | firstPainted | 38.60000002384186 | 38.19999998807907 | 1.0262123166409773 | 0.9999998807907104 |
| mount-flat-500-none | eagerPainted | 54.94999998807907 | 55.049999952316284 | 1.0182481740908362 | 0.9999999403953552 |
| mount-flat-500-none | callDuration | — | — | — | — |
| mount-flat-500-none | nextPainted | — | — | — | — |
| mount-flat-500-none | resolutionTime | — | — | — | — |
| mount-flat-500-none | postPaintBusy | 0 | 0 | 1 | 0 |
| mount-flat-500-none | flooredLongestFrame | — | — | — | — |
| mount-flat-500-none | longestFrame | 0 | 0 | 1 | 0 |
| mount-flat-500-none | longFrameCount | 0 | 0 | 1 | 0 |
| mount-flat-500-none | flooredMountLongestFrame | — | — | 1 | 0 |
| mount-nested-d5-f4-none | handlerP95 | — | — | — | — |
| mount-nested-d5-f4-none | eventProcessingP95 | — | — | — | — |
| mount-nested-d5-f4-none | durationP95 | — | — | — | — |
| mount-nested-d5-f4-none | arrivalP95 | — | — | — | — |
| mount-nested-d5-f4-none | undelivered | 0 | 0 | 1 | 0 |
| mount-nested-d5-f4-none | firstPainted | 68 | 67.40000003576279 | 1.0270270266603843 | 1.899999976158142 |
| mount-nested-d5-f4-none | eagerPainted | 93.40000003576279 | 93.44999998807907 | 1.0253505929129278 | 2.349999964237213 |
| mount-nested-d5-f4-none | callDuration | — | — | — | — |
| mount-nested-d5-f4-none | nextPainted | — | — | — | — |
| mount-nested-d5-f4-none | resolutionTime | — | — | — | — |
| mount-nested-d5-f4-none | postPaintBusy | 0 | 0 | 1 | 0 |
| mount-nested-d5-f4-none | flooredLongestFrame | — | — | — | — |
| mount-nested-d5-f4-none | longestFrame | 81.50000005960464 | 80.99999994039536 | 1.0235439897773912 | 1.899999976158142 |
| mount-nested-d5-f4-none | longFrameCount | 1 | 1 | 1 | 0 |
| mount-nested-d5-f4-none | flooredMountLongestFrame | — | — | 1.0235439897773912 | 1.899999976158142 |
| stream-flat-2000-validate | handlerP95 | — | — | — | — |
| stream-flat-2000-validate | eventProcessingP95 | — | — | — | — |
| stream-flat-2000-validate | durationP95 | — | — | — | — |
| stream-flat-2000-validate | arrivalP95 | — | — | — | — |
| stream-flat-2000-validate | undelivered | 0 | 0 | 1 | 0 |
| stream-flat-2000-validate | firstPainted | 89.79999995231628 | 91.69999998807907 | 1.0490523979807795 | 4.400000095367432 |
| stream-flat-2000-validate | eagerPainted | 238.5 | 239.8499999642372 | 1.017723102584607 | 4.199999988079071 |
| stream-flat-2000-validate | callDuration | — | — | — | — |
| stream-flat-2000-validate | nextPainted | — | — | — | — |
| stream-flat-2000-validate | resolutionTime | — | — | — | — |
| stream-flat-2000-validate | postPaintBusy | 230.44999992847443 | 230.1499999165535 | 1.0226572807520147 | 5.149999916553497 |
| stream-flat-2000-validate | flooredLongestFrame | — | — | — | — |
| stream-flat-2000-validate | longestFrame | 0 | 0 | 1 | 0 |
| stream-flat-2000-validate | longFrameCount | 0 | 0 | 1 | 0 |
| mount-array-1000-none | handlerP95 | — | — | — | — |
| mount-array-1000-none | eventProcessingP95 | — | — | — | — |
| mount-array-1000-none | durationP95 | — | — | — | — |
| mount-array-1000-none | arrivalP95 | — | — | — | — |
| mount-array-1000-none | undelivered | 0 | 0 | 1 | 0 |
| mount-array-1000-none | firstPainted | 135.64999997615814 | 137.50000005960464 | 1.03067257927415 | 4.149999976158142 |
| mount-array-1000-none | eagerPainted | 207.14999997615814 | 209 | 1.0273838626143401 | 5.599999904632568 |
| mount-array-1000-none | callDuration | — | — | — | — |
| mount-array-1000-none | nextPainted | — | — | — | — |
| mount-array-1000-none | resolutionTime | — | — | — | — |
| mount-array-1000-none | postPaintBusy | 0 | 0 | 1 | 0 |
| mount-array-1000-none | flooredLongestFrame | — | — | — | — |
| mount-array-1000-none | longestFrame | 177.0999999642372 | 180.05000007152557 | 1.0273504277579806 | 4.800000071525574 |
| mount-array-1000-none | longFrameCount | 1 | 1 | 1 | 0 |
| mount-array-1000-none | flooredMountLongestFrame | — | — | 1.0273504277579806 | 4.800000071525574 |
| mount-array-1000-validate | handlerP95 | — | — | — | — |
| mount-array-1000-validate | eventProcessingP95 | — | — | — | — |
| mount-array-1000-validate | durationP95 | — | — | — | — |
| mount-array-1000-validate | arrivalP95 | — | — | — | — |
| mount-array-1000-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-array-1000-validate | firstPainted | 137.55000001192093 | 137.50000005960464 | 1.0152616280776017 | 2.100000023841858 |
| mount-array-1000-validate | eagerPainted | 223 | 222.44999998807907 | 1.0076576578724492 | 1.7000000476837158 |
| mount-array-1000-validate | callDuration | — | — | — | — |
| mount-array-1000-validate | nextPainted | — | — | — | — |
| mount-array-1000-validate | resolutionTime | — | — | — | — |
| mount-array-1000-validate | postPaintBusy | 11.5 | 11.600000023841858 | 1.0174672530909992 | 0.20000004768371582 |
| mount-array-1000-validate | flooredLongestFrame | — | — | — | — |
| mount-array-1000-validate | longestFrame | 178.74999994039536 | 178.80000001192093 | 1.0137024611204535 | 2.450000047683716 |
| mount-array-1000-validate | longFrameCount | 1 | 1 | 1 | 0 |
| mount-array-1000-validate | flooredMountLongestFrame | — | — | 1.0137024611204535 | 2.450000047683716 |
| mount-flat-500-onrequest | handlerP95 | — | — | — | — |
| mount-flat-500-onrequest | eventProcessingP95 | — | — | — | — |
| mount-flat-500-onrequest | durationP95 | — | — | — | — |
| mount-flat-500-onrequest | arrivalP95 | — | — | — | — |
| mount-flat-500-onrequest | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-onrequest | firstPainted | 38.65000003576279 | 38.5 | 1.0248691096433387 | 0.949999988079071 |
| mount-flat-500-onrequest | eagerPainted | 86.75 | 86.5 | 1.011600928083872 | 1 |
| mount-flat-500-onrequest | callDuration | — | — | — | — |
| mount-flat-500-onrequest | nextPainted | — | — | — | — |
| mount-flat-500-onrequest | resolutionTime | — | — | — | — |
| mount-flat-500-onrequest | postPaintBusy | 30.400000035762787 | 30.149999916553497 | 1.0066006596699797 | 0.19999998807907104 |
| mount-flat-500-onrequest | flooredLongestFrame | — | — | — | — |
| mount-flat-500-onrequest | longestFrame | 0 | 0 | 1 | 0 |
| mount-flat-500-onrequest | longFrameCount | 0 | 0 | 1 | 0 |
| mount-flat-500-onrequest | flooredMountLongestFrame | — | — | 1 | 0 |
| mount-flat-500-always | handlerP95 | — | — | — | — |
| mount-flat-500-always | eventProcessingP95 | — | — | — | — |
| mount-flat-500-always | durationP95 | — | — | — | — |
| mount-flat-500-always | arrivalP95 | — | — | — | — |
| mount-flat-500-always | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-always | firstPainted | 38.15000003576279 | 37.75 | 1.0251989402648305 | 0.9500000476837158 |
| mount-flat-500-always | eagerPainted | 87.75 | 88.35000002384186 | 1.019119351525776 | 1.6500000953674316 |
| mount-flat-500-always | callDuration | — | — | — | — |
| mount-flat-500-always | nextPainted | — | — | — | — |
| mount-flat-500-always | resolutionTime | — | — | — | — |
| mount-flat-500-always | postPaintBusy | 32.249999940395355 | 32.15000003576279 | 1.0172955960107233 | 0.5499999523162842 |
| mount-flat-500-always | flooredLongestFrame | — | — | — | — |
| mount-flat-500-always | longestFrame | 0 | 0 | 1 | 0 |
| mount-flat-500-always | longFrameCount | 0 | 0 | 1 | 0 |
| mount-flat-500-always | flooredMountLongestFrame | — | — | 1 | 0 |
| reset-flat-500-same | handlerP95 | — | — | — | — |
| reset-flat-500-same | eventProcessingP95 | — | — | — | — |
| reset-flat-500-same | durationP95 | — | — | — | — |
| reset-flat-500-same | arrivalP95 | — | — | — | — |
| reset-flat-500-same | undelivered | 0 | 0 | 1 | 0 |
| reset-flat-500-same | firstPainted | 38.44999998807907 | 38 | 1.0336927207437212 | 1.2499999403953552 |
| reset-flat-500-same | eagerPainted | 88.5 | 88.19999998807907 | 1.0177244140774815 | 1.5499998927116394 |
| reset-flat-500-same | callDuration | 4.650000035762787 | 5.174999982118607 | 1.1797752840593296 | 0.800000011920929 |
| reset-flat-500-same | nextPainted | 25.14999994635582 | 25.624999970197678 | 1.041501979189903 | 1.0500000715255737 |
| reset-flat-500-same | resolutionTime | — | — | — | — |
| reset-flat-500-same | postPaintBusy | 0 | 0 | 1 | 0 |
| reset-flat-500-same | flooredLongestFrame | 50 | 50 | 1 | 0 |
| reset-flat-500-same | longestFrame | 0 | 0 | 1 | 0 |
| reset-flat-500-same | longFrameCount | 0 | 0 | 1 | 0 |
| reset-flat-500-replace | handlerP95 | — | — | — | — |
| reset-flat-500-replace | eventProcessingP95 | — | — | — | — |
| reset-flat-500-replace | durationP95 | — | — | — | — |
| reset-flat-500-replace | arrivalP95 | — | — | — | — |
| reset-flat-500-replace | undelivered | 0 | 0 | 1 | 0 |
| reset-flat-500-replace | firstPainted | 38.5 | 37.94999998807907 | 1.0119521925091282 | 0.4500000476837158 |
| reset-flat-500-replace | eagerPainted | 89.10000002384186 | 88.00000005960464 | 1.0113378677988063 | 0.9999999403953552 |
| reset-flat-500-replace | callDuration | 3.4249999821186066 | 3.2499999701976776 | 0.9849623935475615 | -0.050000011920928955 |
| reset-flat-500-replace | nextPainted | 48.22500002384186 | 47.42500001192093 | 1.001048219529755 | 0.05000007152557373 |
| reset-flat-500-replace | resolutionTime | — | — | — | — |
| reset-flat-500-replace | postPaintBusy | 16.125000029802322 | 15.924999982118607 | 1.0079617834455359 | 0.12500005960464478 |
| reset-flat-500-replace | flooredLongestFrame | 50 | 50 | 1 | 0 |
| reset-flat-500-replace | longestFrame | 0 | 0 | 1 | 0 |
| reset-flat-500-replace | longFrameCount | 0 | 0 | 1 | 0 |
| rebuild-flat-500 | handlerP95 | — | — | — | — |
| rebuild-flat-500 | eventProcessingP95 | — | — | — | — |
| rebuild-flat-500 | durationP95 | — | — | — | — |
| rebuild-flat-500 | arrivalP95 | — | — | — | — |
| rebuild-flat-500 | undelivered | 0 | 0 | 1 | 0 |
| rebuild-flat-500 | firstPainted | 38.40000003576279 | 38.84999996423721 | 1.0256081930490069 | 0.9999999403953552 |
| rebuild-flat-500 | eagerPainted | 88.20000004768372 | 89.04999995231628 | 1.0186651580812 | 1.649999976158142 |
| rebuild-flat-500 | callDuration | 3.425000011920929 | 3.399999976158142 | 1.029411780689827 | 0.1000000536441803 |
| rebuild-flat-500 | nextPainted | 32.775000005960464 | 32.10000002384186 | 1.0228658518330114 | 0.7499999403953552 |
| rebuild-flat-500 | resolutionTime | — | — | — | — |
| rebuild-flat-500 | postPaintBusy | 0.10000002384185791 | 0.10000002384185791 | 1 | 0 |
| rebuild-flat-500 | flooredLongestFrame | 50 | 50 | 1 | 0 |
| rebuild-flat-500 | longestFrame | 0 | 0 | 1 | 0 |
| rebuild-flat-500 | longFrameCount | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | handlerP95 | — | — | — | — |
| validate-flat-500-settled | eventProcessingP95 | — | — | — | — |
| validate-flat-500-settled | durationP95 | — | — | — | — |
| validate-flat-500-settled | arrivalP95 | — | — | — | — |
| validate-flat-500-settled | undelivered | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | firstPainted | 38.75 | 38.85000002384186 | 1.0445026158730988 | 1.6999999284744263 |
| validate-flat-500-settled | eagerPainted | 89.05000001192093 | 88.65000003576279 | 1.0205949658170703 | 1.800000011920929 |
| validate-flat-500-settled | callDuration | 0.09999996423721313 | 0.07499998807907104 | 1.5 | 0.025000035762786865 |
| validate-flat-500-settled | nextPainted | 11.099999994039536 | 11.375000029802322 | 1.0605381231362256 | 0.6500000357627869 |
| validate-flat-500-settled | resolutionTime | 0.10000002384185791 | 0.10000002384185791 | 1 | 0 |
| validate-flat-500-settled | postPaintBusy | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | flooredLongestFrame | 50 | 50 | 1 | 0 |
| validate-flat-500-settled | longestFrame | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | longFrameCount | 0 | 0 | 1 | 0 |

| 항목 | 내용 |
| --- | --- |
| 구분 | 입력·프레임 관측 |

| 행 | 레인 | keys | duration p95 | arrival p95 | undelivered | longFrameCount |
| --- | --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | B | 200 | 16 | 11.199999928474426 | 0 | 0 |
| type-flat-500-validate-nonburst | F | 200 | 16 | 10.399999976158142 | 0 | 0 |
| type-flat-500-validate-burst | B | 200 | 16 | 15.200000047683716 | 190 | 0 |
| type-flat-500-validate-burst | F | 200 | 16 | 15 | 188 | 0 |
| type-array-1000-validate-nonburst | B | 200 | 24 | 15.5 | 0 | 0 |
| type-array-1000-validate-nonburst | F | 200 | 24 | 15.700000047683716 | 0 | 0 |
| type-array-1000-validate-burst | B | 200 | 32 | 13.700000047683716 | 168 | 0 |
| type-array-1000-validate-burst | F | 200 | 32 | 14.700000047683716 | 160 | 0 |
| type-nested-d5-f4-validate-nonburst | B | 200 | 24 | 16.300000071525574 | 0 | 0 |
| type-nested-d5-f4-validate-nonburst | F | 200 | 24 | 16.299999952316284 | 0 | 0 |
| type-nested-d5-f4-validate-burst | B | 200 | 24 | 17.399999976158142 | 188 | 0 |
| type-nested-d5-f4-validate-burst | F | 200 | 16 | 18.299999952316284 | 182 | 0 |
| type-flat-2000-validate-nonburst | B | 200 | 24 | 16.799999952316284 | 0 | 0 |
| type-flat-2000-validate-nonburst | F | 200 | 24 | 16 | 0 | 0 |
| type-flat-2000-validate-burst | B | 200 | 24 | 15 | 172 | 0 |
| type-flat-2000-validate-burst | F | 200 | 32 | 11.399999976158142 | 174 | 0 |
| mount-flat-500-validate | B | 0 | — | — | 0 | 2 |
| mount-flat-500-validate | F | 0 | — | — | 0 | 0 |
| mount-nested-d5-f4-validate | B | 0 | — | — | 0 | 20 |
| mount-nested-d5-f4-validate | F | 0 | — | — | 0 | 20 |
| mount-if-flat-500-validate | B | 0 | — | — | 0 | 10 |
| mount-if-flat-500-validate | F | 0 | — | — | 0 | 10 |
| first-key-flat-500-validate | B | 10 | 3.600000023841858 | 7.099999904632568 | 0 | 4 |
| first-key-flat-500-validate | F | 10 | 3.8000000715255737 | 6.5 | 0 | 2 |
| first-key-flat-2000-validate | B | 10 | 16 | 10.799999952316284 | 0 | 20 |
| first-key-flat-2000-validate | F | 10 | 16 | 11.200000047683716 | 0 | 20 |
| mount-flat-500-none | B | 0 | — | — | 0 | 2 |
| mount-flat-500-none | F | 0 | — | — | 0 | 2 |
| mount-nested-d5-f4-none | B | 0 | — | — | 0 | 10 |
| mount-nested-d5-f4-none | F | 0 | — | — | 0 | 10 |
| stream-flat-2000-validate | B | 0 | — | — | 0 | 0 |
| stream-flat-2000-validate | F | 0 | — | — | 0 | 0 |
| mount-array-1000-none | B | 0 | — | — | 0 | 10 |
| mount-array-1000-none | F | 0 | — | — | 0 | 10 |
| mount-array-1000-validate | B | 0 | — | — | 0 | 10 |
| mount-array-1000-validate | F | 0 | — | — | 0 | 10 |
| mount-flat-500-onrequest | B | 0 | — | — | 0 | 1 |
| mount-flat-500-onrequest | F | 0 | — | — | 0 | 2 |
| mount-flat-500-always | B | 0 | — | — | 0 | 1 |
| mount-flat-500-always | F | 0 | — | — | 0 | 1 |
| reset-flat-500-same | B | 0 | — | — | 0 | 0 |
| reset-flat-500-same | F | 0 | — | — | 0 | 1 |
| reset-flat-500-replace | B | 0 | — | — | 0 | 8 |
| reset-flat-500-replace | F | 0 | — | — | 0 | 6 |
| rebuild-flat-500 | B | 0 | — | — | 0 | 2 |
| rebuild-flat-500 | F | 0 | — | — | 0 | 2 |
| validate-flat-500-settled | B | 0 | — | — | 0 | 0 |
| validate-flat-500-settled | F | 0 | — | — | 0 | 0 |

| 항목 | 내용 |
| --- | --- |
| 구분 | validator 작업 수 |

| 행 | 레인 | units | compileMean | validateMean | setupCompileMean | setupValidateMean | lateCompileMean | lateValidateMean | unattributed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 13 | 0 |
| type-flat-500-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 13 | 0 |
| type-flat-500-validate-burst | B | 10 | 1 | 2.9 | 0 | 0 | 0 | 0 | 0 |
| type-flat-500-validate-burst | F | 10 | 1 | 2.8 | 0 | 0 | 0 | 0 | 0 |
| type-array-1000-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 14.8 | 0 |
| type-array-1000-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 14.6 | 0 |
| type-array-1000-validate-burst | B | 10 | 1 | 6.4 | 0 | 0 | 0 | 0 | 0 |
| type-array-1000-validate-burst | F | 10 | 1 | 6.8 | 0 | 0 | 0 | 0 | 0 |
| type-nested-d5-f4-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 14 | 0 |
| type-nested-d5-f4-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 14 | 0 |
| type-nested-d5-f4-validate-burst | B | 10 | 1 | 3.7 | 0 | 0 | 0 | 0 | 0 |
| type-nested-d5-f4-validate-burst | F | 10 | 1 | 3.9 | 0 | 0 | 0 | 0 | 0 |
| type-flat-2000-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 14.7 | 0 |
| type-flat-2000-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 14.9 | 0 |
| type-flat-2000-validate-burst | B | 10 | 1 | 6.4 | 0 | 0 | 0 | 0 | 0 |
| type-flat-2000-validate-burst | F | 10 | 1 | 5.9 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-validate | B | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-validate | F | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-nested-d5-f4-validate | B | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-nested-d5-f4-validate | F | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-if-flat-500-validate | B | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-if-flat-500-validate | F | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| first-key-flat-500-validate | B | 10 | 1 | 2 | 0 | 0 | 0 | 0 | 0 |
| first-key-flat-500-validate | F | 10 | 1 | 2 | 0 | 0 | 0 | 0 | 0 |
| first-key-flat-2000-validate | B | 10 | 1 | 2 | 0 | 0 | 0 | 0 | 0 |
| first-key-flat-2000-validate | F | 10 | 1 | 2 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-none | B | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-none | F | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| mount-nested-d5-f4-none | B | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| mount-nested-d5-f4-none | F | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| stream-flat-2000-validate | B | 10 | 1 | 7 | 0 | 0 | 0 | 0 | 0 |
| stream-flat-2000-validate | F | 10 | 1 | 7 | 0 | 0 | 0 | 0 | 0 |
| mount-array-1000-none | B | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| mount-array-1000-none | F | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| mount-array-1000-validate | B | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-array-1000-validate | F | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-onrequest | B | 10 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-onrequest | F | 10 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-always | B | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| mount-flat-500-always | F | 10 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| reset-flat-500-same | B | 100 | 0 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |
| reset-flat-500-same | F | 100 | 0 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |
| reset-flat-500-replace | B | 100 | 1 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |
| reset-flat-500-replace | F | 100 | 1 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |
| rebuild-flat-500 | B | 100 | 0 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |
| rebuild-flat-500 | F | 100 | 0 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |
| validate-flat-500-settled | B | 100 | 0 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |
| validate-flat-500-settled | F | 100 | 0 | 1 | 0.1 | 0.1 | 0 | 0 | 0 |

| 차단 검사 행 | 저장된 판정 |
| --- | --- |
| mount-flat-500-validate | PASS |
| mount-nested-d5-f4-validate | PASS |
| mount-if-flat-500-validate | PASS |
| mount-flat-500-none | PASS |
| mount-nested-d5-f4-none | PASS |
| mount-array-1000-none | PASS |
| mount-array-1000-validate | PASS |
| mount-flat-500-onrequest | PASS |
| mount-flat-500-always | PASS |
| first-key-flat-500-validate | PASS |
| first-key-flat-2000-validate | PASS |
| reset-flat-500-same | PASS |
| reset-flat-500-replace | PASS |
| rebuild-flat-500 | PASS |
| validate-flat-500-settled | PASS |

| 항목 | 내용 |
| --- | --- |
| 기록 | 등록된 15개 행 모두 F와 B의 validator 작업이 같습니다. 등록 창과 같은 결과입니다. |

| 항목 | 내용 |
| --- | --- |
| 구분 | 첫 작업 관측 |

| 행 | 통계 | B 저장 값 | F 저장 값 |
| --- | --- | --- | --- |
| reset-flat-500-same | handlerP95 | — | — |
| reset-flat-500-same | eventProcessingP95 | — | — |
| reset-flat-500-same | durationP95 | — | — |
| reset-flat-500-same | arrivalP95 | — | — |
| reset-flat-500-same | undelivered | 0 | 0 |
| reset-flat-500-same | firstPainted | 38.44999998807907 | 38 |
| reset-flat-500-same | eagerPainted | 88.5 | 88.19999998807907 |
| reset-flat-500-same | callDuration | 12.100000023841858 | 12.800000011920929 |
| reset-flat-500-same | nextPainted | 35.94999998807907 | 36.30000001192093 |
| reset-flat-500-same | resolutionTime | — | — |
| reset-flat-500-same | postPaintBusy | 0 | 0 |
| reset-flat-500-same | flooredLongestFrame | 50 | 50 |
| reset-flat-500-same | longestFrame | 0 | 0 |
| reset-flat-500-same | longFrameCount | 0 | 0 |
| reset-flat-500-replace | handlerP95 | — | — |
| reset-flat-500-replace | eventProcessingP95 | — | — |
| reset-flat-500-replace | durationP95 | — | — |
| reset-flat-500-replace | arrivalP95 | — | — |
| reset-flat-500-replace | undelivered | 0 | 0 |
| reset-flat-500-replace | firstPainted | 38.5 | 37.94999998807907 |
| reset-flat-500-replace | eagerPainted | 89.10000002384186 | 88.00000005960464 |
| reset-flat-500-replace | callDuration | 5.599999904632568 | 5.600000023841858 |
| reset-flat-500-replace | nextPainted | 54.94999998807907 | 55.69999998807907 |
| reset-flat-500-replace | resolutionTime | — | — |
| reset-flat-500-replace | postPaintBusy | 15.399999976158142 | 15.899999976158142 |
| reset-flat-500-replace | flooredLongestFrame | 50 | 50 |
| reset-flat-500-replace | longestFrame | 0 | 0 |
| reset-flat-500-replace | longFrameCount | 0 | 0 |
| rebuild-flat-500 | handlerP95 | — | — |
| rebuild-flat-500 | eventProcessingP95 | — | — |
| rebuild-flat-500 | durationP95 | — | — |
| rebuild-flat-500 | arrivalP95 | — | — |
| rebuild-flat-500 | undelivered | 0 | 0 |
| rebuild-flat-500 | firstPainted | 38.40000003576279 | 38.84999996423721 |
| rebuild-flat-500 | eagerPainted | 88.20000004768372 | 89.04999995231628 |
| rebuild-flat-500 | callDuration | 5.750000059604645 | 5.399999976158142 |
| rebuild-flat-500 | nextPainted | 39.90000003576279 | 38.94999998807907 |
| rebuild-flat-500 | resolutionTime | — | — |
| rebuild-flat-500 | postPaintBusy | 0.15000003576278687 | 0.10000002384185791 |
| rebuild-flat-500 | flooredLongestFrame | 50 | 50 |
| rebuild-flat-500 | longestFrame | 0 | 0 |
| rebuild-flat-500 | longFrameCount | 0 | 0 |
| validate-flat-500-settled | handlerP95 | — | — |
| validate-flat-500-settled | eventProcessingP95 | — | — |
| validate-flat-500-settled | durationP95 | — | — |
| validate-flat-500-settled | arrivalP95 | — | — |
| validate-flat-500-settled | undelivered | 0 | 0 |
| validate-flat-500-settled | firstPainted | 38.75 | 38.85000002384186 |
| validate-flat-500-settled | eagerPainted | 89.05000001192093 | 88.65000003576279 |
| validate-flat-500-settled | callDuration | 0.09999996423721313 | 0 |
| validate-flat-500-settled | nextPainted | 11.549999952316284 | 11.600000023841858 |
| validate-flat-500-settled | resolutionTime | 0.10000002384185791 | 0.10000002384185791 |
| validate-flat-500-settled | postPaintBusy | 0 | 0 |
| validate-flat-500-settled | flooredLongestFrame | 50 | 50 |
| validate-flat-500-settled | longestFrame | 0 | 0 |
| validate-flat-500-settled | longFrameCount | 0 | 0 |

| 항목 | 내용 |
| --- | --- |
| 구분 | 유지 표본의 레인 위치 |

| 행 | 레인 | 첫 위치 | 둘째 위치 |
| --- | --- | --- | --- |
| type-flat-500-validate-nonburst | B | 5 | 5 |
| type-flat-500-validate-nonburst | F | 5 | 5 |
| type-flat-500-validate-burst | B | 5 | 5 |
| type-flat-500-validate-burst | F | 5 | 5 |
| type-array-1000-validate-nonburst | B | 5 | 5 |
| type-array-1000-validate-nonburst | F | 5 | 5 |
| type-array-1000-validate-burst | B | 5 | 5 |
| type-array-1000-validate-burst | F | 5 | 5 |
| type-nested-d5-f4-validate-nonburst | B | 5 | 5 |
| type-nested-d5-f4-validate-nonburst | F | 5 | 5 |
| type-nested-d5-f4-validate-burst | B | 5 | 5 |
| type-nested-d5-f4-validate-burst | F | 5 | 5 |
| type-flat-2000-validate-nonburst | B | 5 | 5 |
| type-flat-2000-validate-nonburst | F | 5 | 5 |
| type-flat-2000-validate-burst | B | 5 | 5 |
| type-flat-2000-validate-burst | F | 5 | 5 |
| mount-flat-500-validate | B | 5 | 5 |
| mount-flat-500-validate | F | 5 | 5 |
| mount-nested-d5-f4-validate | B | 5 | 5 |
| mount-nested-d5-f4-validate | F | 5 | 5 |
| mount-if-flat-500-validate | B | 5 | 5 |
| mount-if-flat-500-validate | F | 5 | 5 |
| first-key-flat-500-validate | B | 5 | 5 |
| first-key-flat-500-validate | F | 5 | 5 |
| first-key-flat-2000-validate | B | 5 | 5 |
| first-key-flat-2000-validate | F | 5 | 5 |
| mount-flat-500-none | B | 5 | 5 |
| mount-flat-500-none | F | 5 | 5 |
| mount-nested-d5-f4-none | B | 5 | 5 |
| mount-nested-d5-f4-none | F | 5 | 5 |
| stream-flat-2000-validate | B | 5 | 5 |
| stream-flat-2000-validate | F | 5 | 5 |
| mount-array-1000-none | B | 5 | 5 |
| mount-array-1000-none | F | 5 | 5 |
| mount-array-1000-validate | B | 5 | 5 |
| mount-array-1000-validate | F | 5 | 5 |
| mount-flat-500-onrequest | B | 5 | 5 |
| mount-flat-500-onrequest | F | 5 | 5 |
| mount-flat-500-always | B | 5 | 5 |
| mount-flat-500-always | F | 5 | 5 |
| reset-flat-500-same | B | 5 | 5 |
| reset-flat-500-same | F | 5 | 5 |
| reset-flat-500-replace | B | 5 | 5 |
| reset-flat-500-replace | F | 5 | 5 |
| rebuild-flat-500 | B | 5 | 5 |
| rebuild-flat-500 | F | 5 | 5 |
| validate-flat-500-settled | B | 5 | 5 |
| validate-flat-500-settled | F | 5 | 5 |

| 항목 | 내용 |
| --- | --- |
| 구분 | isDivergent 절대 시간 |

| 실행 페이지 | skip 페이지 | 첫 읽기 median ms | 첫 읽기 p95 ms | 반복 median ms | 반복 p95 ms |
| --- | --- | --- | --- | --- | --- |
| 10 | 0 | 0.3500000238418579 | 0.3999999761581421 | 0 | 0 |

| 항목 | 내용 |
| --- | --- |
| 기록 | 첫 읽기는 중앙값 0.35ms(p95 0.4ms), 반복 읽기는 0ms입니다. 등록 창의 0.3ms, 0ms와 같은 수준입니다. |

| 항목 | 내용 |
| --- | --- |
| 구분 | 100회 편집 뒤 heap |

| 레인 | usedSize bytes median | totalSize bytes median |
| --- | --- | --- |
| B | 31938926 | 32768000 |
| F | 31980880 | 33292288 |

| usedSize F/B 상한 | usedSize F − B 상한 bytes |
| --- | --- |
| 1.0013874558858413 | 44312 |

| 항목 | 내용 |
| --- | --- |
| 기록 | usedSize 중앙값은 F가 B보다 41,954 bytes 큽니다. 차이 상한은 44,312 bytes이고, 등록 창의 43,546 bytes(상한 44,350 bytes)와 같은 규모입니다. |

| 항목 | 내용 |
| --- | --- |
| 구분 | 보고 전용 원시 관측 |

| 행 | 레인 | index | edits | firstMs | repeatedMs | usedSize | totalSize | embedderHeapUsedSize | backingStorageSize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| is-divergent-flat-2000 | F | 0 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 1 | 1 | 0.2999999523162842 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 2 | 1 | 0.30000007152557373 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 3 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 4 | 1 | 0.2999999523162842 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 5 | 1 | 0.2999999523162842 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 6 | 1 | 0.2999999523162842 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 7 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 8 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 9 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| heap-flat-2000-100-edits | B | 0 | 100 | — | — | 31937592 | 33292288 | 12458608 | 1926017 |
| heap-flat-2000-100-edits | F | 0 | 100 | — | — | 31983384 | 32768000 | 12624424 | 1927939 |
| heap-flat-2000-100-edits | F | 1 | 100 | — | — | 31981904 | 32768000 | 12694152 | 1927941 |
| heap-flat-2000-100-edits | B | 1 | 100 | — | — | 31939252 | 32768000 | 12660536 | 1926017 |
| heap-flat-2000-100-edits | B | 2 | 100 | — | — | 31936772 | 32768000 | 12571992 | 1926017 |
| heap-flat-2000-100-edits | F | 2 | 100 | — | — | 31980092 | 33554432 | 12662120 | 1927941 |
| heap-flat-2000-100-edits | F | 3 | 100 | — | — | 31982972 | 33292288 | 12660536 | 1927939 |
| heap-flat-2000-100-edits | B | 3 | 100 | — | — | 31938612 | 32768000 | 12660360 | 1926017 |
| heap-flat-2000-100-edits | B | 4 | 100 | — | — | 31936320 | 32768000 | 12662120 | 1926017 |
| heap-flat-2000-100-edits | F | 4 | 100 | — | — | 31980628 | 33292288 | 12571992 | 1927941 |
| heap-flat-2000-100-edits | F | 5 | 100 | — | — | 31981132 | 33292288 | 12662120 | 1927939 |
| heap-flat-2000-100-edits | B | 5 | 100 | — | — | 31936232 | 33816576 | 12789832 | 1926015 |
| heap-flat-2000-100-edits | B | 6 | 100 | — | — | 31939440 | 33030144 | 12833664 | 1926017 |
| heap-flat-2000-100-edits | F | 6 | 100 | — | — | 31982724 | 33554432 | 12623136 | 1927941 |
| heap-flat-2000-100-edits | F | 7 | 100 | — | — | 31979328 | 33292288 | 12458744 | 1927939 |
| heap-flat-2000-100-edits | B | 7 | 100 | — | — | 31939240 | 32768000 | 12660536 | 1926017 |
| heap-flat-2000-100-edits | B | 8 | 100 | — | — | 31939316 | 32768000 | 12660536 | 1926015 |
| heap-flat-2000-100-edits | F | 8 | 100 | — | — | 31980548 | 33554432 | 12830744 | 1927937 |
| heap-flat-2000-100-edits | F | 9 | 100 | — | — | 31980300 | 33554432 | 12830744 | 1927941 |
| heap-flat-2000-100-edits | B | 9 | 100 | — | — | 31939540 | 33030144 | 12660360 | 1926015 |

| 항목 | 내용 |
| --- | --- |
| 구분 | 진단 목록 |

| 항목 | 내용 |
| --- | --- |
| 기록 | [] |

| 항목 | 내용 |
| --- | --- |
| 기록 | 진단 구간(비율 상한 1.05–1.10)에 든 행이 없습니다. |

| 항목 | 내용 |
| --- | --- |
| 구분 | 재현 |

| 항목 | 내용 |
| --- | --- |
| 기록 | 생성 번들에는 기계 로컬 소스 주석이 포함되어 있어 커밋하지 않았으며, sha256은 inputs.json에 기록했고 재현에는 해당 해시와 일치하도록 다시 빌드한 번들이 필요합니다. |

| 항목 | 내용 |
| --- | --- |
| 기록 | 원시 숫자·입력·빌드 기록·판정은 raw/browser/diagnostic-2에 있습니다. 고정 번들을 일시 복원한 상태에서 checker를 실행하고 곧바로 제거합니다. |

| 항목 | 내용 |
| --- | --- |
| 기록 | 23개 행의 주 지표 점 비율 F/B는 중앙값 0.996입니다. 범위는 0.75–1.167이고, 끝 값들은 1ms 미만의 절대 차이입니다. 이 단계에서 시간 감소나 증가가 없다는 등록 창의 관측이 반복됐습니다. |

| 대상 행 | 통계 정의 |
| --- | --- |
| type-array-1000-validate-nonburst | 페이지 순서는 index 0..9입니다. |
| 페이지 duration p95 | 페이지별 start ≤ startTime ≤ end 및 interactionId ≠ 0인 이벤트를 interactionId별 최대 duration으로 묶은 뒤 nearest-rank p95입니다. |
| C2 행 값 | 페이지별 duration p95 10개의 nearest-rank p95이며, n=10에서는 최대값입니다. |
| pooled interaction duration p95 | 각 페이지에서 interactionId로 묶은 duration을 페이지 경계를 유지한 채 이어 붙인 값의 nearest-rank p95이며 C2 판정 입력과 별도입니다. |
| C2 허용량 ms | 8 |

| 창 | 레인 | 페이지별 duration p95 ms (index 0..9) | C2 행 값 ms | pooled interaction duration p95 ms | pooled interactions | longFrameCount |
| --- | --- | --- | --- | --- | --- | --- |
| 등록 창 | B | 32, 32, 16, 16, 32, 24, 24, 24, 24, 24 | 32 | 24 | 67 | 0 |
| 등록 창 | F | 16, 48, 24, 24, 16, 24, 16, 24, 24, 24 | 48 | 24 | 92 | 0 |
| 진단 창 2 | B | 24, 24, 16, 16, 24, 24, 24, 16, 16, 16 | 24 | 24 | 57 | 0 |
| 진단 창 2 | F | 16, 24, 16, 24, 24, 16, 16, 24, 24, 16 | 24 | 24 | 56 | 0 |

| 항목 | 내용 |
| --- | --- |
| C2 분포 해석 | 진단 창에서는 두 레인의 페이지별 p95가 모두 16–24ms이고, C2 행 값은 B 24ms, F 24ms입니다. pooled interaction p95는 두 창, 두 레인 모두 24ms입니다. 등록 창의 F 48ms는 F-1 한 페이지에서만 나왔고, 진단 창에서는 그런 페이지가 B와 F 어디에도 없었습니다. |
| 최종 진단 판정 | 진단 창은 등록 창의 C2 FAIL이 한 페이지의 외부 표시 지연 때문이라는 코디네이터 판단과 맞습니다. 다만 등록 판정은 FAIL로 남습니다. 수용 여부는 Vincent가 PR #518을 병합할 때 결정합니다. 제품 코드에 대한 후속 조치는 없습니다. |

| 시작 파일 | 시각 | approved 저장 값 | samples |
| --- | --- | --- | --- |
| start-2026-11-02T05-38-24-624Z.json | 2026-11-02T05:38:24.624Z | True | 0 |

| 항목 | 내용 |
| --- | --- |
| 시작 기록 검토 | 조용함 검사는 첫 시도(05:38:24Z)에 통과했습니다. 거절은 없었고, 창은 한 번 실행했습니다. |
