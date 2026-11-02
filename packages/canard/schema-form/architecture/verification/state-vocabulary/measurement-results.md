# 상태 어휘 단계 측정 결과

## 고정 입력

| 항목 | 값 |
| --- | --- |
| B | 212967e0f1d2a044d40b9c090420b6b54a33d078 |
| F | 736ee7ed1aa97422aa6f7128d85fbbd4c6b64682 |
| 사전 등록 커밋 | d18dc9a5b1d585437075c01b1d8091ae903a1a23 |
| 규칙 버전 | state-vocabulary-v1 |
| 규칙 sha256 | db2a3baac3942b8372936a7a24fa57296bcdfbe29871a74e46d0e3d4cf568f0e |

| 관측 메타데이터 | 저장된 값 |
| --- | --- |
| startedAt | 2026-11-02T04:25:27.796Z |
| endedAt | 2026-11-02T04:57:49.102Z |
| toolCommit | d18dc9a5b1d585437075c01b1d8091ae903a1a23 |
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

## checker 판정 데이터

| 게이트 | 저장된 판정 |
| --- | --- |
| SV-1 | FAIL |
| SV-2 | PASS |
| C1 | PASS |
| C2 | FAIL |
| C3 | PASS |
| C4 | PASS |
| C5 | PASS |
| C6 | PASS |

사전 등록 판정은 **SV-1 FAIL, SV-2 PASS**입니다. SV-1은 C1–C6이 모두 통과해야 하며, 이 창에서는 C2 하나가 FAIL입니다. C2는 typing 8행마다 F의 event duration p95가 B + 8ms 이하이고, 긴 프레임 수가 B + 1 이하일 것을 요구합니다. 이 행 값은 모든 이벤트를 합친 p95가 아닙니다. 페이지마다 p95를 구한 뒤 10페이지에서 nearest-rank p95를 취하므로, 10페이지에서는 페이지 p95의 최댓값이 됩니다. type-array-1000-validate-nonburst에서 F 48ms가 B 32ms + 8ms를 넘었습니다. 나머지 일곱 typing 행과 C1·C3·C4·C5·C6은 통과했습니다. 규칙과 판정은 바꾸지 않았고, 창을 다시 돌려 판정을 대체하지 않았습니다. 원인 검토는 맨 아래 결론 절에 있으며, 수용 여부는 Vincent가 병합할 때 결정합니다.

## F/B 통계와 상한

숫자는 checker JSON의 원문 숫자 토큰을 그대로 옮겼습니다. —는 해당 저장 필드가 없음을 뜻합니다. processing·processingTail의 B/F 값은 각 행 handler.p95이며, 다른 값은 metrics에서 옮깁니다.

| 행 | 통계 | B 저장 값 | F 저장 값 | F/B 상한 | F − B 상한 |
| --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | handlerP95 | 2.099999964237213 | 2 | 1.277777766739881 | 0.5000000596046448 |
| type-flat-500-validate-nonburst | eventProcessingP95 | 4.600000023841858 | 5.100000023841858 | — | — |
| type-flat-500-validate-nonburst | durationP95 | 16 | 16 | 1 | 0 |
| type-flat-500-validate-nonburst | arrivalP95 | 8.899999976158142 | 8.450000047683716 | 1.0462427788283584 | 0.40000003576278687 |
| type-flat-500-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-flat-500-validate-nonburst | firstPainted | 38.60000002384186 | 38.700000047683716 | 1.0449141343991608 | 1.699999988079071 |
| type-flat-500-validate-nonburst | eagerPainted | 94.40000003576279 | 96.14999997615814 | 1.051031486723754 | 4.699999928474426 |
| type-flat-500-validate-nonburst | callDuration | — | — | — | — |
| type-flat-500-validate-nonburst | nextPainted | — | — | — | — |
| type-flat-500-validate-nonburst | resolutionTime | — | — | — | — |
| type-flat-500-validate-nonburst | postPaintBusy | 38.299999952316284 | 38.200000047683716 | 1.032697552295142 | 1.2000001668930054 |
| type-flat-500-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-flat-500-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-500-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-500-validate-nonburst | processing | 2.799999952316284 | 2.799999952316284 | 1.2173913088547936 | 0.32499998807907104 |
| type-flat-500-validate-nonburst | processingTail | 2.799999952316284 | 2.799999952316284 | 1.2173913088547936 | 0.5 |
| type-flat-500-validate-burst | handlerP95 | 0.8500000238418579 | 0.8999999761581421 | 1.2222222810910088 | 0.20000004768371582 |
| type-flat-500-validate-burst | eventProcessingP95 | 2.850000023841858 | 2.700000047683716 | — | — |
| type-flat-500-validate-burst | durationP95 | 16 | 16 | 1 | 0 |
| type-flat-500-validate-burst | arrivalP95 | 11.300000011920929 | 12.199999928474426 | — | — |
| type-flat-500-validate-burst | undelivered | 18 | 18 | 1.0555555555555556 | 1 |
| type-flat-500-validate-burst | firstPainted | 42.85000002384186 | 42.55000001192093 | 1.0391705080326639 | 1.7000000476837158 |
| type-flat-500-validate-burst | eagerPainted | 101.30000001192093 | 103.30000007152557 | 1.045105566655786 | 4.599999904632568 |
| type-flat-500-validate-burst | callDuration | — | — | — | — |
| type-flat-500-validate-burst | nextPainted | — | — | — | — |
| type-flat-500-validate-burst | resolutionTime | — | — | — | — |
| type-flat-500-validate-burst | postPaintBusy | 38.800000071525574 | 39.60000002384186 | 1.0512820496753514 | 1.9999999403953552 |
| type-flat-500-validate-burst | flooredLongestFrame | — | — | — | — |
| type-flat-500-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-500-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-500-validate-burst | processing | 1.5 | 1.5 | 1.6666667108182565 | 0.07500004768371582 |
| type-flat-500-validate-burst | processingTail | 1.5 | 1.5 | 1.6666667108182565 | 0.6000000238418579 |
| type-array-1000-validate-nonburst | handlerP95 | 1.2500000596046448 | 1.25 | 1.124999925494197 | 0.1499999761581421 |
| type-array-1000-validate-nonburst | eventProcessingP95 | 5.050000011920929 | 4.800000011920929 | 1.0208333131546778 | 0.09999990463256836 |
| type-array-1000-validate-nonburst | durationP95 | 24 | 24 | 1 | 0 |
| type-array-1000-validate-nonburst | arrivalP95 | 14.899999976158142 | 14.949999988079071 | 1.1449275311615457 | 2.0499998927116394 |
| type-array-1000-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-array-1000-validate-nonburst | firstPainted | 144.85000002384186 | 140.24999994039536 | 0.9975247523072607 | -0.3500000238418579 |
| type-array-1000-validate-nonburst | eagerPainted | 238.64999997615814 | 235.29999995231628 | 1.011415525115285 | 2.75 |
| type-array-1000-validate-nonburst | callDuration | — | — | — | — |
| type-array-1000-validate-nonburst | nextPainted | — | — | — | — |
| type-array-1000-validate-nonburst | resolutionTime | — | — | — | — |
| type-array-1000-validate-nonburst | postPaintBusy | 39.59999990463257 | 65.00000005960464 | 4.520833342474092 | 50.700000166893005 |
| type-array-1000-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-array-1000-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-array-1000-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-array-1000-validate-nonburst | processing | 2.299999952316284 | 2.1999999284744263 | 1.0666666825612385 | 0.02499997615814209 |
| type-array-1000-validate-nonburst | processingTail | 2.299999952316284 | 2.1999999284744263 | 1.0666666825612385 | 0.10000002384185791 |
| type-array-1000-validate-burst | handlerP95 | 1 | 1.050000011920929 | 1.100000023841858 | 0.10000002384185791 |
| type-array-1000-validate-burst | eventProcessingP95 | 4.699999988079071 | 4.899999976158142 | 1.5820895267451733 | 1.9499999284744263 |
| type-array-1000-validate-burst | durationP95 | 32 | 32 | 1 | 0 |
| type-array-1000-validate-burst | arrivalP95 | 12.399999976158142 | 12.950000047683716 | — | — |
| type-array-1000-validate-burst | undelivered | 18 | 17 | 1.125 | 2 |
| type-array-1000-validate-burst | firstPainted | 140.79999995231628 | 140.94999998807907 | 1.0238179880868092 | 3.350000023841858 |
| type-array-1000-validate-burst | eagerPainted | 236.05000001192093 | 232.19999998807907 | 1.014388489359252 | 3.400000035762787 |
| type-array-1000-validate-burst | callDuration | — | — | — | — |
| type-array-1000-validate-burst | nextPainted | — | — | — | — |
| type-array-1000-validate-burst | resolutionTime | — | — | — | — |
| type-array-1000-validate-burst | postPaintBusy | 14.300000011920929 | 14.300000071525574 | 4.549295820643141 | 50.5 |
| type-array-1000-validate-burst | flooredLongestFrame | — | — | — | — |
| type-array-1000-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-array-1000-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-array-1000-validate-burst | processing | 1.2000000476837158 | 1.2000000476837158 | 1.0000001083720909 | 0.07499995827674866 |
| type-array-1000-validate-burst | processingTail | 1.2000000476837158 | 1.2000000476837158 | 1.0000001083720909 | 1.1920928955078125e-7 |
| type-nested-d5-f4-validate-nonburst | handlerP95 | 2.099999964237213 | 1.5000000596046448 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | eventProcessingP95 | 4.799999952316284 | 4.300000071525574 | — | — |
| type-nested-d5-f4-validate-nonburst | durationP95 | 16 | 16 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | arrivalP95 | 12.100000023841858 | 11.499999940395355 | 1.0082644549120272 | 0.09999990463256836 |
| type-nested-d5-f4-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | firstPainted | 70.44999992847443 | 68.39999997615814 | 0.9785407725248694 | -1.5 |
| type-nested-d5-f4-validate-nonburst | eagerPainted | 173.00000005960464 | 170.8499999642372 | 1.0064782090940472 | 1.0999999046325684 |
| type-nested-d5-f4-validate-nonburst | callDuration | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | nextPainted | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | resolutionTime | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | postPaintBusy | 169.45000004768372 | 168.2499998807907 | 1.010447760474897 | 1.75 |
| type-nested-d5-f4-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-nested-d5-f4-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-nonburst | processing | 2.899999976158142 | 1.9000000953674316 | 0.8260870151123174 | 0.04999995231628418 |
| type-nested-d5-f4-validate-nonburst | processingTail | 2.899999976158142 | 1.9000000953674316 | 0.8260870151123174 | -0.39999985694885254 |
| type-nested-d5-f4-validate-burst | handlerP95 | 1 | 1.100000023841858 | 1.2499999403953552 | 0.24999994039535522 |
| type-nested-d5-f4-validate-burst | eventProcessingP95 | 3.5 | 3.5 | 1.8113207122786443 | 2.049999952316284 |
| type-nested-d5-f4-validate-burst | durationP95 | 16 | 16 | 1 | 0 |
| type-nested-d5-f4-validate-burst | arrivalP95 | 16.44999998807907 | 16.700000047683716 | — | — |
| type-nested-d5-f4-validate-burst | undelivered | 18 | 18 | 1 | 0 |
| type-nested-d5-f4-validate-burst | firstPainted | 70.04999995231628 | 69.75 | 1.0279001464830095 | 1.899999976158142 |
| type-nested-d5-f4-validate-burst | eagerPainted | 169.05000001192093 | 170.39999997615814 | 1.0204869361530413 | 3.450000047683716 |
| type-nested-d5-f4-validate-burst | callDuration | — | — | — | — |
| type-nested-d5-f4-validate-burst | nextPainted | — | — | — | — |
| type-nested-d5-f4-validate-burst | resolutionTime | — | — | — | — |
| type-nested-d5-f4-validate-burst | postPaintBusy | 165.40000009536743 | 167.1000000834465 | 1.0380633362657343 | 6.249999821186066 |
| type-nested-d5-f4-validate-burst | flooredLongestFrame | — | — | — | — |
| type-nested-d5-f4-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-nested-d5-f4-validate-burst | processing | 2.399999976158142 | 1.5 | 1.2500000745058104 | 0 |
| type-nested-d5-f4-validate-burst | processingTail | 2.399999976158142 | 1.5 | 1.2500000745058104 | 0.30000007152557373 |
| type-flat-2000-validate-nonburst | handlerP95 | 2.349999964237213 | 2.150000035762787 | 1.1111111405455043 | 0.24999994039535522 |
| type-flat-2000-validate-nonburst | eventProcessingP95 | 5.75 | 5.700000047683716 | 1.017857147038591 | 0.10000002384185791 |
| type-flat-2000-validate-nonburst | durationP95 | 24 | 16 | 1.25 | 4 |
| type-flat-2000-validate-nonburst | arrivalP95 | 12.650000035762787 | 12.149999976158142 | 1.0553359672806406 | 0.699999988079071 |
| type-flat-2000-validate-nonburst | undelivered | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-nonburst | firstPainted | 94.15000003576279 | 91.64999997615814 | 1.0352811471444474 | 3.200000047683716 |
| type-flat-2000-validate-nonburst | eagerPainted | 241.45000004768372 | 238.05000001192093 | 0.9962825279798864 | -0.8999999761581421 |
| type-flat-2000-validate-nonburst | callDuration | — | — | — | — |
| type-flat-2000-validate-nonburst | nextPainted | — | — | — | — |
| type-flat-2000-validate-nonburst | resolutionTime | — | — | — | — |
| type-flat-2000-validate-nonburst | postPaintBusy | 228.14999997615814 | 229.14999997615814 | 1.0164437623319622 | 3.7500001788139343 |
| type-flat-2000-validate-nonburst | flooredLongestFrame | — | — | — | — |
| type-flat-2000-validate-nonburst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-nonburst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-nonburst | processing | 3 | 2.600000023841858 | 0.9629629973030884 | 5.960464477539063e-8 |
| type-flat-2000-validate-nonburst | processingTail | 3 | 2.600000023841858 | 0.9629629973030884 | -0.09999990463256836 |
| type-flat-2000-validate-burst | handlerP95 | 1.399999976158142 | 1.350000023841858 | 1 | 0 |
| type-flat-2000-validate-burst | eventProcessingP95 | 5.449999988079071 | 2.9000000953674316 | 1.3176470644333784 | 1.2000000476837158 |
| type-flat-2000-validate-burst | durationP95 | 16 | 16 | 1.25 | 4 |
| type-flat-2000-validate-burst | arrivalP95 | 10.700000047683716 | 10.599999964237213 | — | — |
| type-flat-2000-validate-burst | undelivered | 18 | 16 | 1 | 0 |
| type-flat-2000-validate-burst | firstPainted | 94.10000002384186 | 92.94999998807907 | 1.0226659473759552 | 2.099999964237213 |
| type-flat-2000-validate-burst | eagerPainted | 241.30000001192093 | 242.45000004768372 | 1.0221063608422145 | 5.300000011920929 |
| type-flat-2000-validate-burst | callDuration | — | — | — | — |
| type-flat-2000-validate-burst | nextPainted | — | — | — | — |
| type-flat-2000-validate-burst | resolutionTime | — | — | — | — |
| type-flat-2000-validate-burst | postPaintBusy | 232.4999998807907 | 233.64999997615814 | 1.0303365803332227 | 6.950000166893005 |
| type-flat-2000-validate-burst | flooredLongestFrame | — | — | — | — |
| type-flat-2000-validate-burst | longestFrame | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-burst | longFrameCount | 0 | 0 | 1 | 0 |
| type-flat-2000-validate-burst | processing | 1.5 | 1.5 | 1.0714284984432971 | 0.02499997615814209 |
| type-flat-2000-validate-burst | processingTail | 1.5 | 1.5 | 1.0714284984432971 | 0.09999990463256836 |
| mount-flat-500-validate | handlerP95 | — | — | — | — |
| mount-flat-500-validate | eventProcessingP95 | — | — | — | — |
| mount-flat-500-validate | durationP95 | — | — | — | — |
| mount-flat-500-validate | arrivalP95 | — | — | — | — |
| mount-flat-500-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-validate | firstPainted | 38.39999997615814 | 38.69999998807907 | 1.0339425606565034 | 1.3000000715255737 |
| mount-flat-500-validate | eagerPainted | 88.70000004768372 | 90.35000002384186 | 1.0313033579880895 | 2.75 |
| mount-flat-500-validate | callDuration | — | — | — | — |
| mount-flat-500-validate | nextPainted | — | — | — | — |
| mount-flat-500-validate | resolutionTime | — | — | — | — |
| mount-flat-500-validate | postPaintBusy | 32.500000059604645 | 32.1000000834465 | 1.0348101273105037 | 1.100000023841858 |
| mount-flat-500-validate | flooredLongestFrame | — | — | — | — |
| mount-flat-500-validate | longestFrame | 0 | 0 | +Infinity | 25.05000001192093 |
| mount-flat-500-validate | longFrameCount | 0 | 0 | +Infinity | 0.5 |
| mount-flat-500-validate | flooredMountLongestFrame | — | — | 1.0020000004768372 | 0.10000002384185791 |
| mount-nested-d5-f4-validate | handlerP95 | — | — | — | — |
| mount-nested-d5-f4-validate | eventProcessingP95 | — | — | — | — |
| mount-nested-d5-f4-validate | durationP95 | — | — | — | — |
| mount-nested-d5-f4-validate | arrivalP95 | — | — | — | — |
| mount-nested-d5-f4-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-nested-d5-f4-validate | firstPainted | 67.25 | 68.14999997615814 | 1.0371493544610009 | 2.449999988079071 |
| mount-nested-d5-f4-validate | eagerPainted | 168.49999994039536 | 168.85000002384186 | 1.0191216013669728 | 3.199999988079071 |
| mount-nested-d5-f4-validate | callDuration | — | — | — | — |
| mount-nested-d5-f4-validate | nextPainted | — | — | — | — |
| mount-nested-d5-f4-validate | resolutionTime | — | — | — | — |
| mount-nested-d5-f4-validate | postPaintBusy | 156.39999997615814 | 157 | 1.018393030172039 | 2.850000023841858 |
| mount-nested-d5-f4-validate | flooredLongestFrame | — | — | — | — |
| mount-nested-d5-f4-validate | longestFrame | 85.09999996423721 | 83.69999998807907 | 1.0048076920183762 | 0.40000003576278687 |
| mount-nested-d5-f4-validate | longFrameCount | 2 | 2 | 1 | 0 |
| mount-nested-d5-f4-validate | flooredMountLongestFrame | — | — | 1.0048076920183762 | 0.40000003576278687 |
| mount-if-flat-500-validate | handlerP95 | — | — | — | — |
| mount-if-flat-500-validate | eventProcessingP95 | — | — | — | — |
| mount-if-flat-500-validate | durationP95 | — | — | — | — |
| mount-if-flat-500-validate | arrivalP95 | — | — | — | — |
| mount-if-flat-500-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-if-flat-500-validate | firstPainted | 106.19999998807907 | 105.95000004768372 | 1.0170616114874023 | 1.8000000715255737 |
| mount-if-flat-500-validate | eagerPainted | 123.10000002384186 | 124.34999996423721 | 1.022672064391225 | 2.799999952316284 |
| mount-if-flat-500-validate | callDuration | — | — | — | — |
| mount-if-flat-500-validate | nextPainted | — | — | — | — |
| mount-if-flat-500-validate | resolutionTime | — | — | — | — |
| mount-if-flat-500-validate | postPaintBusy | 2 | 2 | 1.0769230957332214 | 0.15000003576278687 |
| mount-if-flat-500-validate | flooredLongestFrame | — | — | — | — |
| mount-if-flat-500-validate | longestFrame | 115.89999997615814 | 116.84999996423721 | 1.031858406763161 | 3.599999964237213 |
| mount-if-flat-500-validate | longFrameCount | 1 | 1 | 1 | 0 |
| mount-if-flat-500-validate | flooredMountLongestFrame | — | — | 1.031858406763161 | 3.599999964237213 |
| first-key-flat-500-validate | handlerP95 | 3.4000000953674316 | 3.450000047683716 | 1.029411771924438 | 0.10000002384185791 |
| first-key-flat-500-validate | eventProcessingP95 | — | 4.100000023841858 | — | — |
| first-key-flat-500-validate | durationP95 | 3.4000000953674316 | 3.450000047683716 | 1.0606060759314058 | 0.20000004768371582 |
| first-key-flat-500-validate | arrivalP95 | 6.200000047683716 | 6.400000095367432 | 1.0743801737570973 | 0.44999998807907104 |
| first-key-flat-500-validate | undelivered | 0 | 0 | 1 | 0 |
| first-key-flat-500-validate | firstPainted | 38.14999997615814 | 38 | 1.0286458339720008 | 1.100000023841858 |
| first-key-flat-500-validate | eagerPainted | 97.99999994039536 | 98.89999997615814 | 1.0236869214456508 | 2.3000000715255737 |
| first-key-flat-500-validate | callDuration | — | — | — | — |
| first-key-flat-500-validate | nextPainted | — | — | — | — |
| first-key-flat-500-validate | resolutionTime | — | — | — | — |
| first-key-flat-500-validate | postPaintBusy | 36.14999997615814 | 36.65000003576279 | 1.033707866485395 | 1.2000000476837158 |
| first-key-flat-500-validate | flooredLongestFrame | — | — | — | — |
| first-key-flat-500-validate | longestFrame | 0 | 0 | 1 | 0 |
| first-key-flat-500-validate | longFrameCount | 0 | 0 | 1 | 0 |
| first-key-flat-500-validate | processing | 3.600000023841858 | 3.799999952316284 | 1.0571428367069788 | 0.10000002384185791 |
| first-key-flat-2000-validate | handlerP95 | 4.050000011920929 | 4.100000023841858 | 1.0499999970197678 | 0.19999998807907104 |
| first-key-flat-2000-validate | eventProcessingP95 | 5.900000035762787 | 5.699999928474426 | — | — |
| first-key-flat-2000-validate | durationP95 | 4.100000023841858 | 4.100000023841858 | 2.5125000029802322 | 6.050000011920929 |
| first-key-flat-2000-validate | arrivalP95 | 10.199999988079071 | 10.099999964237213 | 1.0499999940395355 | 0.5 |
| first-key-flat-2000-validate | undelivered | 0 | 0 | 1 | 0 |
| first-key-flat-2000-validate | firstPainted | 90.75000005960464 | 88.64999997615814 | 1.008998875947583 | 0.8000000715255737 |
| first-key-flat-2000-validate | eagerPainted | 243.4000000357628 | 234.80000007152557 | 0.9895746455384665 | -2.4999998807907104 |
| first-key-flat-2000-validate | callDuration | — | — | — | — |
| first-key-flat-2000-validate | nextPainted | — | — | — | — |
| first-key-flat-2000-validate | resolutionTime | — | — | — | — |
| first-key-flat-2000-validate | postPaintBusy | 236.19999992847443 | 223.05000007152557 | 0.9764705893535973 | -5.549999952316284 |
| first-key-flat-2000-validate | flooredLongestFrame | — | — | — | — |
| first-key-flat-2000-validate | longestFrame | 129.30000007152557 | 121.44999998807907 | 0.9712918663084397 | -3.650000035762787 |
| first-key-flat-2000-validate | longFrameCount | 2 | 2 | 1 | 0 |
| first-key-flat-2000-validate | processing | 4.600000023841858 | 4.299999952316284 | 1.0487804700759535 | 0.19999998807907104 |
| mount-flat-500-none | handlerP95 | — | — | — | — |
| mount-flat-500-none | eventProcessingP95 | — | — | — | — |
| mount-flat-500-none | durationP95 | — | — | — | — |
| mount-flat-500-none | arrivalP95 | — | — | — | — |
| mount-flat-500-none | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-none | firstPainted | 39.950000047683716 | 38.75 | 1.0052356017838084 | 0.19999998807907104 |
| mount-flat-500-none | eagerPainted | 56.65000003576279 | 55.700000047683716 | 1.0035398217429101 | 0.19999992847442627 |
| mount-flat-500-none | callDuration | — | — | — | — |
| mount-flat-500-none | nextPainted | — | — | — | — |
| mount-flat-500-none | resolutionTime | — | — | — | — |
| mount-flat-500-none | postPaintBusy | 0 | 0 | 1 | 0 |
| mount-flat-500-none | flooredLongestFrame | — | — | — | — |
| mount-flat-500-none | longestFrame | 25.100000023841858 | 0 | 1 | 0 |
| mount-flat-500-none | longFrameCount | 0.5 | 0 | 1 | 0 |
| mount-flat-500-none | flooredMountLongestFrame | — | — | 1 | 0 |
| mount-nested-d5-f4-none | handlerP95 | — | — | — | — |
| mount-nested-d5-f4-none | eventProcessingP95 | — | — | — | — |
| mount-nested-d5-f4-none | durationP95 | — | — | — | — |
| mount-nested-d5-f4-none | arrivalP95 | — | — | — | — |
| mount-nested-d5-f4-none | undelivered | 0 | 0 | 1 | 0 |
| mount-nested-d5-f4-none | firstPainted | 67.8500000834465 | 69.05000001192093 | 1.0484581481449042 | 3.2999998927116394 |
| mount-nested-d5-f4-none | eagerPainted | 92.99999994039536 | 94.20000004768372 | 1.0300751887689985 | 2.800000011920929 |
| mount-nested-d5-f4-none | callDuration | — | — | — | — |
| mount-nested-d5-f4-none | nextPainted | — | — | — | — |
| mount-nested-d5-f4-none | resolutionTime | — | — | — | — |
| mount-nested-d5-f4-none | postPaintBusy | 0 | 0 | 1 | 0 |
| mount-nested-d5-f4-none | flooredLongestFrame | — | — | — | — |
| mount-nested-d5-f4-none | longestFrame | 81.5 | 82.5 | 1.0281517749358204 | 2.300000011920929 |
| mount-nested-d5-f4-none | longFrameCount | 1 | 1 | 1 | 0 |
| mount-nested-d5-f4-none | flooredMountLongestFrame | — | — | 1.0281517749358204 | 2.300000011920929 |
| stream-flat-2000-validate | handlerP95 | — | — | — | — |
| stream-flat-2000-validate | eventProcessingP95 | — | — | — | — |
| stream-flat-2000-validate | durationP95 | — | — | — | — |
| stream-flat-2000-validate | arrivalP95 | — | — | — | — |
| stream-flat-2000-validate | undelivered | 0 | 0 | 1 | 0 |
| stream-flat-2000-validate | firstPainted | 90.35000002384186 | 90.25 | 1.0234636874172274 | 2.100000023841858 |
| stream-flat-2000-validate | eagerPainted | 242.40000009536743 | 241.94999998807907 | 1.022783760889055 | 5.4999998807907104 |
| stream-flat-2000-validate | callDuration | — | — | — | — |
| stream-flat-2000-validate | nextPainted | — | — | — | — |
| stream-flat-2000-validate | resolutionTime | — | — | — | — |
| stream-flat-2000-validate | postPaintBusy | 231.94999992847443 | 234.55000013113022 | 1.0387263339507589 | 9 |
| stream-flat-2000-validate | flooredLongestFrame | — | — | — | — |
| stream-flat-2000-validate | longestFrame | 0 | 0 | 1 | 0 |
| stream-flat-2000-validate | longFrameCount | 0 | 0 | 1 | 0 |
| mount-array-1000-none | handlerP95 | — | — | — | — |
| mount-array-1000-none | eventProcessingP95 | — | — | — | — |
| mount-array-1000-none | durationP95 | — | — | — | — |
| mount-array-1000-none | arrivalP95 | — | — | — | — |
| mount-array-1000-none | undelivered | 0 | 0 | 1 | 0 |
| mount-array-1000-none | firstPainted | 140.80000001192093 | 138.30000001192093 | 1.0059399023319373 | 0.8499999046325684 |
| mount-array-1000-none | eagerPainted | 211.35000002384186 | 208.75000005960464 | 1.010731707255802 | 2.199999988079071 |
| mount-array-1000-none | callDuration | — | — | — | — |
| mount-array-1000-none | nextPainted | — | — | — | — |
| mount-array-1000-none | resolutionTime | — | — | — | — |
| mount-array-1000-none | postPaintBusy | 0 | 0 | 1 | 0 |
| mount-array-1000-none | flooredLongestFrame | — | — | — | — |
| mount-array-1000-none | longestFrame | 182.79999995231628 | 179.70000004768372 | 1.0118243247965617 | 2.1000000834465027 |
| mount-array-1000-none | longFrameCount | 1 | 1 | 1 | 0 |
| mount-array-1000-none | flooredMountLongestFrame | — | — | 1.0118243247965617 | 2.1000000834465027 |
| mount-array-1000-validate | handlerP95 | — | — | — | — |
| mount-array-1000-validate | eventProcessingP95 | — | — | — | — |
| mount-array-1000-validate | durationP95 | — | — | — | — |
| mount-array-1000-validate | arrivalP95 | — | — | — | — |
| mount-array-1000-validate | undelivered | 0 | 0 | 1 | 0 |
| mount-array-1000-validate | firstPainted | 139.8499999642372 | 138.75 | 1.0057595397527925 | 0.8000000715255737 |
| mount-array-1000-validate | eagerPainted | 226.55000001192093 | 225.8499999642372 | 1.008482142750706 | 1.899999976158142 |
| mount-array-1000-validate | callDuration | — | — | — | — |
| mount-array-1000-validate | nextPainted | — | — | — | — |
| mount-array-1000-validate | resolutionTime | — | — | — | — |
| mount-array-1000-validate | postPaintBusy | 11.750000059604645 | 11.550000011920929 | 1.017543863868596 | 0.20000004768371582 |
| mount-array-1000-validate | flooredLongestFrame | — | — | — | — |
| mount-array-1000-validate | longestFrame | 182.89999997615814 | 180.0999999642372 | 1.0027824144722206 | 0.49999988079071045 |
| mount-array-1000-validate | longFrameCount | 1 | 1 | 1 | 0 |
| mount-array-1000-validate | flooredMountLongestFrame | — | — | 1.0027824144722206 | 0.49999988079071045 |
| mount-flat-500-onrequest | handlerP95 | — | — | — | — |
| mount-flat-500-onrequest | eventProcessingP95 | — | — | — | — |
| mount-flat-500-onrequest | durationP95 | — | — | — | — |
| mount-flat-500-onrequest | arrivalP95 | — | — | — | — |
| mount-flat-500-onrequest | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-onrequest | firstPainted | 39.14999997615814 | 39.64999997615814 | 1.0332480806016262 | 1.2999999523162842 |
| mount-flat-500-onrequest | eagerPainted | 87.5 | 87.05000001192093 | 1.0376282776570356 | 3.2500000596046448 |
| mount-flat-500-onrequest | callDuration | — | — | — | — |
| mount-flat-500-onrequest | nextPainted | — | — | — | — |
| mount-flat-500-onrequest | resolutionTime | — | — | — | — |
| mount-flat-500-onrequest | postPaintBusy | 30.500000059604645 | 30.600000023841858 | 1.0165562913645871 | 0.5 |
| mount-flat-500-onrequest | flooredLongestFrame | — | — | — | — |
| mount-flat-500-onrequest | longestFrame | 0 | 0 | +Infinity | 25.80000001192093 |
| mount-flat-500-onrequest | longFrameCount | 0 | 0 | +Infinity | 0.5 |
| mount-flat-500-onrequest | flooredMountLongestFrame | — | — | 1.0020000004768372 | 0.10000002384185791 |
| mount-flat-500-always | handlerP95 | — | — | — | — |
| mount-flat-500-always | eventProcessingP95 | — | — | — | — |
| mount-flat-500-always | durationP95 | — | — | — | — |
| mount-flat-500-always | arrivalP95 | — | — | — | — |
| mount-flat-500-always | undelivered | 0 | 0 | 1 | 0 |
| mount-flat-500-always | firstPainted | 40.749999940395355 | 40.05000001192093 | 1.0383631729150031 | 1.5000000596046448 |
| mount-flat-500-always | eagerPainted | 91.14999997615814 | 90.84999996423721 | 1.0267260589826483 | 2.399999976158142 |
| mount-flat-500-always | callDuration | — | — | — | — |
| mount-flat-500-always | nextPainted | — | — | — | — |
| mount-flat-500-always | resolutionTime | — | — | — | — |
| mount-flat-500-always | postPaintBusy | 32.89999997615814 | 32.799999952316284 | 1.0243161116141433 | 0.7999998331069946 |
| mount-flat-500-always | flooredLongestFrame | — | — | — | — |
| mount-flat-500-always | longestFrame | 0 | 0 | +Infinity | 25.299999952316284 |
| mount-flat-500-always | longFrameCount | 0 | 0 | +Infinity | 0.5 |
| mount-flat-500-always | flooredMountLongestFrame | — | — | 1.0059999990463258 | 0.2999999523162842 |
| reset-flat-500-same | handlerP95 | — | — | — | — |
| reset-flat-500-same | eventProcessingP95 | — | — | — | — |
| reset-flat-500-same | durationP95 | — | — | — | — |
| reset-flat-500-same | arrivalP95 | — | — | — | — |
| reset-flat-500-same | undelivered | 0 | 0 | 1 | 0 |
| reset-flat-500-same | firstPainted | 38.40000003576279 | 38.299999952316284 | 1.018666664759318 | 0.6999999284744263 |
| reset-flat-500-same | eagerPainted | 89.15000003576279 | 89.30000001192093 | 1.005646528061817 | 0.5000000596046448 |
| reset-flat-500-same | callDuration | 4.675000011920929 | 4.449999988079071 | 1.010869574372169 | 0.04999998211860657 |
| reset-flat-500-same | nextPainted | 26.124999970197678 | 25.07499998807907 | 0.9799043071327027 | -0.5249999761581421 |
| reset-flat-500-same | resolutionTime | — | — | — | — |
| reset-flat-500-same | postPaintBusy | 0 | 0 | +Infinity | 0.02499997615814209 |
| reset-flat-500-same | flooredLongestFrame | 50 | 50 | 1 | 0 |
| reset-flat-500-same | longestFrame | 0 | 0 | 1 | 0 |
| reset-flat-500-same | longFrameCount | 0 | 0 | 1 | 0 |
| reset-flat-500-replace | handlerP95 | — | — | — | — |
| reset-flat-500-replace | eventProcessingP95 | — | — | — | — |
| reset-flat-500-replace | durationP95 | — | — | — | — |
| reset-flat-500-replace | arrivalP95 | — | — | — | — |
| reset-flat-500-replace | undelivered | 0 | 0 | 1 | 0 |
| reset-flat-500-replace | firstPainted | 38.15000003576279 | 39.60000002384186 | 1.049934296335424 | 1.899999976158142 |
| reset-flat-500-replace | eagerPainted | 88.99999994039536 | 89.55000001192093 | 1.0147058831660203 | 1.3000000715255737 |
| reset-flat-500-replace | callDuration | 3.375 | 3.3999999463558197 | 1.0681818161293166 | 0.22499999403953552 |
| reset-flat-500-replace | nextPainted | 47.80000001192093 | 48.375 | 1.026150627608541 | 1.25 |
| reset-flat-500-replace | resolutionTime | — | — | — | — |
| reset-flat-500-replace | postPaintBusy | 15.950000047683716 | 16.17500001192093 | 1.0316455772606499 | 0.5000001192092896 |
| reset-flat-500-replace | flooredLongestFrame | 50 | 50 | 1 | 0 |
| reset-flat-500-replace | longestFrame | 0 | 0 | 1 | 0 |
| reset-flat-500-replace | longFrameCount | 0 | 0 | 1 | 0 |
| rebuild-flat-500 | handlerP95 | — | — | — | — |
| rebuild-flat-500 | eventProcessingP95 | — | — | — | — |
| rebuild-flat-500 | durationP95 | — | — | — | — |
| rebuild-flat-500 | arrivalP95 | — | — | — | — |
| rebuild-flat-500 | undelivered | 0 | 0 | 1 | 0 |
| rebuild-flat-500 | firstPainted | 39.19999998807907 | 38.700000047683716 | 1.021992237121903 | 0.8499999642372131 |
| rebuild-flat-500 | eagerPainted | 91.09999996423721 | 88.35000002384186 | 0.9899777285452557 | -0.8999999761581421 |
| rebuild-flat-500 | callDuration | 3.5499999821186066 | 3.424999952316284 | 1.014285717691694 | 0.050000011920928955 |
| rebuild-flat-500 | nextPainted | 32.599999994039536 | 32.94999998807907 | 1.0429447863809436 | 1.4000000357627869 |
| rebuild-flat-500 | resolutionTime | — | — | — | — |
| rebuild-flat-500 | postPaintBusy | 0.10000002384185791 | 0.10000002384185791 | 1.000000596046661 | 5.960464477539063e-8 |
| rebuild-flat-500 | flooredLongestFrame | 50 | 50 | 1 | 0 |
| rebuild-flat-500 | longestFrame | 0 | 0 | 1 | 0 |
| rebuild-flat-500 | longFrameCount | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | handlerP95 | — | — | — | — |
| validate-flat-500-settled | eventProcessingP95 | — | — | — | — |
| validate-flat-500-settled | durationP95 | — | — | — | — |
| validate-flat-500-settled | arrivalP95 | — | — | — | — |
| validate-flat-500-settled | undelivered | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | firstPainted | 37.80000001192093 | 38.44999998807907 | 1.0628272277450572 | 2.4000000953674316 |
| validate-flat-500-settled | eagerPainted | 88.64999997615814 | 89.69999992847443 | 1.0228050157320785 | 2 |
| validate-flat-500-settled | callDuration | 0.07499998807907104 | 0.10000002384185791 | 2.0000023841880648 | 0.05000007152557373 |
| validate-flat-500-settled | nextPainted | 10.775000005960464 | 11.950000017881393 | 1.177570093718249 | 1.8750000596046448 |
| validate-flat-500-settled | resolutionTime | 0.125 | 0.10000002384185791 | 1 | 0 |
| validate-flat-500-settled | postPaintBusy | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | flooredLongestFrame | 50 | 50 | 1 | 0 |
| validate-flat-500-settled | longestFrame | 0 | 0 | 1 | 0 |
| validate-flat-500-settled | longFrameCount | 0 | 0 | 1 | 0 |

## 입력·프레임 관측

| 행 | 레인 | keys | duration p95 | arrival p95 | undelivered | longFrameCount |
| --- | --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | B | 200 | 16 | 10.200000047683716 | 0 | 0 |
| type-flat-500-validate-nonburst | F | 200 | 24 | 11.5 | 0 | 0 |
| type-flat-500-validate-burst | B | 200 | 16 | 13.899999976158142 | 184 | 0 |
| type-flat-500-validate-burst | F | 200 | 16 | 14.900000095367432 | 186 | 0 |
| type-array-1000-validate-nonburst | B | 200 | 32 | 25.100000023841858 | 0 | 0 |
| type-array-1000-validate-nonburst | F | 200 | 48 | 21.699999928474426 | 0 | 0 |
| type-array-1000-validate-burst | B | 200 | 32 | 13.800000071525574 | 174 | 0 |
| type-array-1000-validate-burst | F | 200 | 32 | 14.5 | 168 | 0 |
| type-nested-d5-f4-validate-nonburst | B | 200 | 16 | 16.09999990463257 | 0 | 0 |
| type-nested-d5-f4-validate-nonburst | F | 200 | 16 | 14.799999952316284 | 0 | 0 |
| type-nested-d5-f4-validate-burst | B | 200 | 24 | 17.600000023841858 | 178 | 0 |
| type-nested-d5-f4-validate-burst | F | 200 | 24 | 19.40000009536743 | 182 | 0 |
| type-flat-2000-validate-nonburst | B | 200 | 24 | 16.700000047683716 | 0 | 0 |
| type-flat-2000-validate-nonburst | F | 200 | 24 | 15.899999976158142 | 0 | 0 |
| type-flat-2000-validate-burst | B | 200 | 24 | 14.5 | 174 | 0 |
| type-flat-2000-validate-burst | F | 200 | 24 | 16.700000047683716 | 162 | 0 |
| mount-flat-500-validate | B | 0 | — | — | 0 | 3 |
| mount-flat-500-validate | F | 0 | — | — | 0 | 3 |
| mount-nested-d5-f4-validate | B | 0 | — | — | 0 | 20 |
| mount-nested-d5-f4-validate | F | 0 | — | — | 0 | 20 |
| mount-if-flat-500-validate | B | 0 | — | — | 0 | 10 |
| mount-if-flat-500-validate | F | 0 | — | — | 0 | 10 |
| first-key-flat-500-validate | B | 10 | 3.600000023841858 | 9.300000071525574 | 0 | 2 |
| first-key-flat-500-validate | F | 10 | 16 | 11.899999976158142 | 0 | 2 |
| first-key-flat-2000-validate | B | 10 | 16 | 11.699999928474426 | 0 | 20 |
| first-key-flat-2000-validate | F | 10 | 16 | 11.299999952316284 | 0 | 20 |
| mount-flat-500-none | B | 0 | — | — | 0 | 5 |
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
| mount-flat-500-onrequest | F | 0 | — | — | 0 | 3 |
| mount-flat-500-always | B | 0 | — | — | 0 | 4 |
| mount-flat-500-always | F | 0 | — | — | 0 | 3 |
| reset-flat-500-same | B | 0 | — | — | 0 | 0 |
| reset-flat-500-same | F | 0 | — | — | 0 | 0 |
| reset-flat-500-replace | B | 0 | — | — | 0 | 4 |
| reset-flat-500-replace | F | 0 | — | — | 0 | 6 |
| rebuild-flat-500 | B | 0 | — | — | 0 | 3 |
| rebuild-flat-500 | F | 0 | — | — | 0 | 1 |
| validate-flat-500-settled | B | 0 | — | — | 0 | 0 |
| validate-flat-500-settled | F | 0 | — | — | 0 | 0 |

## validator 작업 수

| 행 | 레인 | units | compileMean | validateMean | setupCompileMean | setupValidateMean | lateCompileMean | lateValidateMean | unattributed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 13 | 0 |
| type-flat-500-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 13 | 0 |
| type-flat-500-validate-burst | B | 10 | 1 | 3.2 | 0 | 0 | 0 | 0 | 0 |
| type-flat-500-validate-burst | F | 10 | 1 | 2.8 | 0 | 0 | 0 | 0 | 0 |
| type-array-1000-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 14.8 | 0 |
| type-array-1000-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 14.9 | 0 |
| type-array-1000-validate-burst | B | 10 | 1 | 5.8 | 0 | 0 | 0 | 0 | 0 |
| type-array-1000-validate-burst | F | 10 | 1 | 6.6 | 0 | 0 | 0 | 0 | 0 |
| type-nested-d5-f4-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 14 | 0 |
| type-nested-d5-f4-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 14 | 0 |
| type-nested-d5-f4-validate-burst | B | 10 | 1 | 4 | 0 | 0 | 0 | 0 | 0 |
| type-nested-d5-f4-validate-burst | F | 10 | 1 | 4 | 0 | 0 | 0 | 0 | 0 |
| type-flat-2000-validate-nonburst | B | 10 | 1 | 21 | 0 | 0 | 0 | 14.8 | 0 |
| type-flat-2000-validate-nonburst | F | 10 | 1 | 21 | 0 | 0 | 0 | 14.9 | 0 |
| type-flat-2000-validate-burst | B | 10 | 1 | 5.9 | 0 | 0 | 0 | 0 | 0 |
| type-flat-2000-validate-burst | F | 10 | 1 | 6.6 | 0 | 0 | 0 | 0 | 0 |
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

등록된 15개 행 모두 F와 B의 validator 작업이 같습니다. compile과 validate의 횟수와 순서가 일치하므로, 이름 변경과 새 getter는 검증 호출을 늘리지 않았습니다.

## 첫 작업 관측

| 행 | 통계 | B 저장 값 | F 저장 값 |
| --- | --- | --- | --- |
| reset-flat-500-same | handlerP95 | — | — |
| reset-flat-500-same | eventProcessingP95 | — | — |
| reset-flat-500-same | durationP95 | — | — |
| reset-flat-500-same | arrivalP95 | — | — |
| reset-flat-500-same | undelivered | 0 | 0 |
| reset-flat-500-same | firstPainted | 38.40000003576279 | 38.299999952316284 |
| reset-flat-500-same | eagerPainted | 89.15000003576279 | 89.30000001192093 |
| reset-flat-500-same | callDuration | 12.899999976158142 | 12 |
| reset-flat-500-same | nextPainted | 36.84999996423721 | 35.15000003576279 |
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
| reset-flat-500-replace | firstPainted | 38.15000003576279 | 39.60000002384186 |
| reset-flat-500-replace | eagerPainted | 88.99999994039536 | 89.55000001192093 |
| reset-flat-500-replace | callDuration | 5.549999952316284 | 5.649999976158142 |
| reset-flat-500-replace | nextPainted | 54.94999998807907 | 56.250000059604645 |
| reset-flat-500-replace | resolutionTime | — | — |
| reset-flat-500-replace | postPaintBusy | 15.400000035762787 | 15.800000011920929 |
| reset-flat-500-replace | flooredLongestFrame | 50 | 50 |
| reset-flat-500-replace | longestFrame | 0 | 0 |
| reset-flat-500-replace | longFrameCount | 0 | 0 |
| rebuild-flat-500 | handlerP95 | — | — |
| rebuild-flat-500 | eventProcessingP95 | — | — |
| rebuild-flat-500 | durationP95 | — | — |
| rebuild-flat-500 | arrivalP95 | — | — |
| rebuild-flat-500 | undelivered | 0 | 0 |
| rebuild-flat-500 | firstPainted | 39.19999998807907 | 38.700000047683716 |
| rebuild-flat-500 | eagerPainted | 91.09999996423721 | 88.35000002384186 |
| rebuild-flat-500 | callDuration | 5.400000035762787 | 5.449999988079071 |
| rebuild-flat-500 | nextPainted | 39.14999997615814 | 39.39999997615814 |
| rebuild-flat-500 | resolutionTime | — | — |
| rebuild-flat-500 | postPaintBusy | 0.10000002384185791 | 0.10000002384185791 |
| rebuild-flat-500 | flooredLongestFrame | 50 | 50 |
| rebuild-flat-500 | longestFrame | 0 | 0 |
| rebuild-flat-500 | longFrameCount | 0 | 0 |
| validate-flat-500-settled | handlerP95 | — | — |
| validate-flat-500-settled | eventProcessingP95 | — | — |
| validate-flat-500-settled | durationP95 | — | — |
| validate-flat-500-settled | arrivalP95 | — | — |
| validate-flat-500-settled | undelivered | 0 | 0 |
| validate-flat-500-settled | firstPainted | 37.80000001192093 | 38.44999998807907 |
| validate-flat-500-settled | eagerPainted | 88.64999997615814 | 89.69999992847443 |
| validate-flat-500-settled | callDuration | 0.050000011920928955 | 0.10000002384185791 |
| validate-flat-500-settled | nextPainted | 9.75 | 10.300000071525574 |
| validate-flat-500-settled | resolutionTime | 0.10000002384185791 | 0.10000002384185791 |
| validate-flat-500-settled | postPaintBusy | 0 | 0 |
| validate-flat-500-settled | flooredLongestFrame | 50 | 50 |
| validate-flat-500-settled | longestFrame | 0 | 0 |
| validate-flat-500-settled | longFrameCount | 0 | 0 |

## 유지 표본의 레인 위치

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

## isDivergent 절대 시간

| 실행 페이지 | skip 페이지 | 첫 읽기 median ms | 첫 읽기 p95 ms | 반복 median ms | 반복 p95 ms |
| --- | --- | --- | --- | --- | --- |
| 10 | 0 | 0.30000007152557373 | 0.40000009536743164 | 0 | 0 |

flat 2,000-field 폼에서 leaf 하나를 바꾼 뒤 루트 `isDivergent`를 읽었습니다. 첫 읽기는 10페이지 중앙값 0.3ms(p95 0.4ms)였고, 바로 이어 읽은 반복 읽기는 0ms였습니다. 첫 읽기는 바뀐 경로만 비교하고 반복 읽기는 memo로 끝난다는 단위 시험의 횟수 계약과 맞습니다. 보고 전용 행이라 판정하지 않습니다.

## 100회 편집 뒤 heap

| 레인 | usedSize bytes median | totalSize bytes median |
| --- | --- | --- |
| B | 31937484 | 33292288 |
| F | 31981030 | 33292288 |

| usedSize F/B 상한 | usedSize F − B 상한 bytes |
| --- | --- |
| 1.001388679708462 | 44350 |

100회 편집 뒤 usedSize 중앙값은 F가 B보다 43,546 bytes(0.14%) 큽니다. F/B 상한은 1.00139이고 차이 상한은 44,350 bytes입니다. 원인 후보는 두 가지입니다. 하나는 노드마다 생성자에서 초기화하는 divergence memo 필드 다섯 개이고, 다른 하나는 baseline이 붙잡고 있는 load 시점의 root emit 하나입니다. 두 원인을 따로 나누어 재지는 않았습니다. baseline은 load 시점의 참조 하나만 붙잡으므로 편집 횟수에 따라 늘지 않습니다. 보고 전용 행이라 판정하지 않습니다.

## 보고 전용 원시 관측

| 행 | 레인 | index | edits | firstMs | repeatedMs | usedSize | totalSize | embedderHeapUsedSize | backingStorageSize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| is-divergent-flat-2000 | F | 0 | 1 | 0.2999999523162842 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 1 | 1 | 0.30000007152557373 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 2 | 1 | 0.2999999523162842 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 3 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 4 | 1 | 0.30000007152557373 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 5 | 1 | 0.40000009536743164 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 6 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 7 | 1 | 0.30000007152557373 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 8 | 1 | 0.2999999523162842 | 0 | — | — | — | — |
| is-divergent-flat-2000 | F | 9 | 1 | 0.3999999761581421 | 0 | — | — | — | — |
| heap-flat-2000-100-edits | B | 0 | 100 | — | — | 31938048 | 33292288 | 12662120 | 1926012 |
| heap-flat-2000-100-edits | F | 0 | 100 | — | — | 31980596 | 33030144 | 12571992 | 1927938 |
| heap-flat-2000-100-edits | F | 1 | 100 | — | — | 31983012 | 33292288 | 12661384 | 1927938 |
| heap-flat-2000-100-edits | B | 1 | 100 | — | — | 31936820 | 33816576 | 12852600 | 1926012 |
| heap-flat-2000-100-edits | B | 2 | 100 | — | — | 31937344 | 33554432 | 12662120 | 1926014 |
| heap-flat-2000-100-edits | F | 2 | 100 | — | — | 31980916 | 33816576 | 12662120 | 1927936 |
| heap-flat-2000-100-edits | F | 3 | 100 | — | — | 31981096 | 33292288 | 12571992 | 1927938 |
| heap-flat-2000-100-edits | B | 3 | 100 | — | — | 31937368 | 33030144 | 12458744 | 1926014 |
| heap-flat-2000-100-edits | B | 4 | 100 | — | — | 31936484 | 33292288 | 12634944 | 1926014 |
| heap-flat-2000-100-edits | F | 4 | 100 | — | — | 31981660 | 33292288 | 12833664 | 1927938 |
| heap-flat-2000-100-edits | F | 5 | 100 | — | — | 31978748 | 33816576 | 12458608 | 1927938 |
| heap-flat-2000-100-edits | B | 5 | 100 | — | — | 31937600 | 33030144 | 12662120 | 1926014 |
| heap-flat-2000-100-edits | B | 6 | 100 | — | — | 31939604 | 32768000 | 12630192 | 1926014 |
| heap-flat-2000-100-edits | F | 6 | 100 | — | — | 31979752 | 33816576 | 12623136 | 1927938 |
| heap-flat-2000-100-edits | F | 7 | 100 | — | — | 31980964 | 33292288 | 12571992 | 1927938 |
| heap-flat-2000-100-edits | B | 7 | 100 | — | — | 31938804 | 33816576 | 12852600 | 1926014 |
| heap-flat-2000-100-edits | B | 8 | 100 | — | — | 31937940 | 33554432 | 12688952 | 1926014 |
| heap-flat-2000-100-edits | F | 8 | 100 | — | — | 31982076 | 32768000 | 12640056 | 1927936 |
| heap-flat-2000-100-edits | F | 9 | 100 | — | — | 31981160 | 33554432 | 12656752 | 1927938 |
| heap-flat-2000-100-edits | B | 9 | 100 | — | — | 31936800 | 33030144 | 12458608 | 1926014 |

## 진단 목록

| id | metric | bound | reason |
| --- | --- | --- | --- |
| type-array-1000-validate-nonburst | processing | 1.0666666825612385 | ratio-in-diagnosis-band |
| type-flat-2000-validate-burst | processing | 1.0714284984432971 | ratio-in-diagnosis-band |
| reset-flat-500-replace | callDuration | 1.0681818161293166 | ratio-in-diagnosis-band |

세 행은 비율 상한이 1.05–1.10 진단 구간에 있지만, 절대 차이 상한은 작습니다.

- type-array-1000-validate-nonburst의 processing은 0.025ms이고, tail은 0.1ms입니다.
- type-flat-2000-validate-burst의 processing은 0.025ms이고, tail은 0.1ms입니다.
- reset-flat-500-replace의 callDuration은 0.225ms입니다. 중앙값은 B 3.375ms, F 3.4ms입니다.

profile은 실행하지 않았고 조치도 하지 않습니다. 이 단계는 쓰기 경로에 작업을 더하지 않으며, 엔진 비용 시험이 쓰기 중 divergence reader 호출 0회를 고정합니다.

type-array-1000-validate-nonburst의 postPaintBusy 중앙값은 B 39.6ms, F 65.0ms로 차이가 납니다. 이 지표는 typing 행에서 마운트 직후의 값을 씁니다. 페이지 값이 약 14ms와 약 65ms 두 갈래로 나뉘고, 두 갈래가 양쪽 레인에 고루 나타납니다. B는 14ms 안팎이 다섯, 64.4–114.8ms가 다섯이고, F는 14ms 안팎이 넷, 65ms 안팎이 여섯입니다. 같은 폼의 마운트 전용 행 mount-array-1000-validate는 B와 F 모두 11.3–12.6ms입니다.

## 재현

생성 번들에는 기계 로컬 소스 주석이 포함되어 있어 커밋하지 않았으며, sha256은 inputs.json에 기록했고 재현에는 해당 해시와 일치하도록 다시 빌드한 번들이 필요합니다.

원시 숫자·입력·빌드 기록·판정은 raw/browser/main에 있습니다. 고정 번들을 일시 복원한 상태에서 checker를 실행하고 곧바로 제거합니다.

**창 기록.**

정식 시작 전 조용함 검사가 두 번 거절됐습니다.

- 04:01Z에는 mediaanalysisd가 101.9%였습니다.
- 04:14Z에는 같은 프로세스가 86%였습니다.

두 번 모두 0표본이었고, 창은 열리지 않았습니다.

사전 등록 문서는 거절을 0표본 기록으로 보존하고, 시작된 창의 재시작만 막습니다. 그래서 코디네이터가 같은 root에서의 재시도를 허가했고, 세 번째 시도(04:25Z)가 통과했습니다. 실행 절차의 시작 가능 검사에는 이전 거절 파일이 없어야 한다는 조건이 있는데, 이 재시도에 한해 면제했습니다. 이 조건은 사전 등록 문서보다 엄격합니다. 정식 창은 한 번 실행했고, 다시 돌리지 않았습니다.

**C2 FAIL 검토.**

실패를 만든 것은 F의 한 페이지(type-array-1000-validate-nonburst-F-1)입니다.

- 그 페이지에서는 같은 순간(약 529ms)에 이벤트 다섯 개가 모두 48ms를 기록했습니다. 각 이벤트의 처리 시간은 0–5.3ms였습니다. 그러니 지연은 처리에서 생긴 것이 아니며, 다음 화면 표시까지 기다린 시간에서 생겼습니다.
- 그 페이지 동안 외부 CPU는 WindowServer 48%, mds_stores 30%였습니다.

다른 행과 페이지는 B와 같은 범위입니다.

- 나머지 F 페이지 아홉 개의 페이지 최댓값은 16–24ms로, B 페이지 열 개의 16–32ms 안에 있습니다.
- 모든 페이지의 interaction을 합친 p95는 B와 F 모두 24ms입니다. F-1 하나를 빼면 F의 행 값은 24ms가 되어 기준 40ms 안에 듭니다.
- 페이지별 p95의 중앙값은 B와 F 모두 24ms이고, 그 비율의 bootstrap 상한은 1.0입니다.
- 같은 폼의 burst 행은 B와 F 모두 32ms입니다.
- 처리 p95는 F 5.6ms, B 7.1ms입니다.

이 단계의 변경은 이름 변경과 읽기 전용 getter뿐이고, typing 쓰기 경로에는 작업을 더하지 않습니다. 그래서 코디네이터는 이 C2 FAIL을, 외부에서 생긴 표시 지연 한 번이 페이지 p95의 최댓값을 쓰는 행 집계에 그대로 반영된 결과로 판단합니다. 판정은 등록된 대로 FAIL로 남깁니다. 판정을 바꾸지 않는 별도 진단 창은 요청이 있을 때만 실행합니다.
