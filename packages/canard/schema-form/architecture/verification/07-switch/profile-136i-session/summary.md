# 131 react 측정 세션 결과입니다.

세션 종류는 aa이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 4564.344초이며 확인 측정은 0.000초이고 보고 계산은 0.069초입니다.
프로세스 준비 시간의 합은 86.640초이며 예열은 1478.245초, 강제 GC는 186.237초, 표본은 2929.831초, digest는 486.058초입니다.
시계 밖 minor GC는 23.621초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 208개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 AA_PASS입니다. 축소 비표시 행은 줄인 검출력에서 관측되지 않음으로 해석합니다.
실행 전 추정은 5007.710초이며 확인 여유는 1251.927초이고 합계는 6259.637초입니다. 예산은 7099.990초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 4564.330초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2354.570 |
| array-replace-200 | 873.229 |
| array-push-remove-100 | 279.559 |
| array-push-100 | 230.888 |
| flat-500 | 190.141 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

| A/A 집합입니다. | 0 제외/판정 행입니다. | 99% 이항 범위입니다. | 범위 안입니다. |
| --- | ---: | --- | --- |
| reduced | 0/52 | 0~3 | true |
| full | 0/16 | 0~2 | true |
| total | 0/68 | 0~3 | true |
세 범위가 모두 안에 있고 유한한 구간이 있을 때만 A/A를 통과하며 결과는 true입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.1409379699227884 | null / null | null / null |
| array-100/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.20456350964695957 | null / null | null / null |
| array-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.06829149999998663 | null / null | null / null |
| array-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.08339499999920008 | null / null | null / null |
| array-100/off/profiler-mount | reduced | 8 | null | 기록 | -0.11693499997636536 | null / null | null / null |
| array-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.1255344998326109 | null / null | null / null |
| array-100/off/profiler-update | reduced | 8 | null | 기록 | -0.0011769999962325528 | null / null | null / null |
| array-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.00044450000359574915 | 0 / 0 | 0.17379500000060943 / 0.17525399999203728 |
| array-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.005041003227233887 | null / null | null / null |
| array-100/off/update-active-nogc | reduced | 8 | null | 기록 | -0.003125011920928955 | 0 / 0 | 0.5649374723434448 / 0.5694369971752167 |
| array-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.005249999999932697 | null / null | null / null |
| array-100/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.002854499999557447 | 0 / 0 | 0.5623955000000933 / 0.5665835000004336 |
| array-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-500/off/mount-active | full | 24 | null | 관측되지 않음 | 0.5592705392837161 | null / null | null / null |
| array-500/off/mount-active-nogc | full | 24 | null | 기록 | -0.039584495818417054 | null / null | null / null |
| array-500/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.2925630000008823 | null / null | null / null |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | 0.2556040000017674 | null / null | null / null |
| array-500/off/profiler-mount | full | 24 | null | 기록 | 0.23610450013347872 | null / null | null / null |
| array-500/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.019476999554171925 | null / null | null / null |
| array-500/off/profiler-update | full | 24 | null | 기록 | -0.0023499999988416675 | null / null | null / null |
| array-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.00257799992323271 | 0 / 0 | 0.3285285000165459 / 0.32699949997549993 |
| array-500/off/update-active | full | 24 | null | 관측되지 않음 | -0.0027295053005218506 | null / null | null / null |
| array-500/off/update-active-nogc | full | 24 | null | 기록 | 0.005729466676712036 | 0 / 0 | 0.9184370338916779 / 0.9138330221176147 |
| array-500/off/update-wall | full | 24 | null | 관측되지 않음 | -0.0038954999999987194 | null / null | null / null |
| array-500/off/update-wall-nogc | full | 24 | null | 기록 | 0.00539599999319762 | 0 / 0 | 0.9158544999991136 / 0.9109585000005609 |
| array-push-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.03149390243902439 / 0.03155487804878049 | null / null |
| array-push-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.01164499370906924 | null / null | null / null |
| array-push-100/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.006437469629418047 | null / null | 0.7521874982394365 / 0.7532714888866394 |
| array-push-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.010979000000133965 | null / null | null / null |
| array-push-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.002563000000009197 | null / null | 3.2622294999991936 / 3.259020999999848 |
| array-push-100/off/profiler-mount | reduced | 8 | null | 기록 | -0.011353999997481878 | null / null | null / null |
| array-push-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.00047699999686301453 | null / null | 0.5457185000032041 / 0.5446880000044985 |
| array-push-100/off/profiler-update | reduced | 8 | null | 기록 | -0.7723550001849162 | null / null | null / null |
| array-push-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.388617999960843 | 0.03149390243902439 / 0.03155487804878049 | null / null |
| array-push-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -3.0200822353363037 | null / null | null / null |
| array-push-100/off/update-active-nogc | reduced | 8 | null | 기록 | -0.37282973527908325 | 0.03149390243902439 / 0.03155487804878049 | null / null |
| array-push-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -3.0175275000017336 | null / null | null / null |
| array-push-100/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.3731430000043474 | 0.03149390243902439 / 0.03155487804878049 | null / null |
| array-push-remove-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-remove-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.022286585365853658 / 0.022271341463414633 | null / null |
| array-push-remove-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.007957520301943077 | null / null | null / null |
| array-push-remove-100/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.004416493469761917 | null / null | 0.7398739696654957 / 0.7470009942790057 |
| array-push-remove-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.008229000000483211 | null / null | null / null |
| array-push-remove-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.004166500000792439 | null / null | 3.2491660000014235 / 3.256208000000697 |
| array-push-remove-100/off/profiler-mount | reduced | 8 | null | 기록 | 0.017272000012781064 | null / null | null / null |
| array-push-remove-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.0017774999832909089 | null / null | 0.5512499999822467 / 0.5532049999965238 |
| array-push-remove-100/off/profiler-update | reduced | 8 | null | 기록 | 0.13832550004008226 | null / null | null / null |
| array-push-remove-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.06592350008941139 | 0.022286585365853658 / 0.022271341463414633 | null / null |
| array-push-remove-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.44776687026023865 | null / null | null / null |
| array-push-remove-100/off/update-active-nogc | reduced | 8 | null | 기록 | 0.27335917949676514 | 0.022286585365853658 / 0.022271341463414633 | null / null |
| array-push-remove-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.44962050001140597 | null / null | null / null |
| array-push-remove-100/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.27278800000294723 | 0.022286585365853658 / 0.022271341463414633 | null / null |
| array-replace-200/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-replace-200/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 1 / 1 | null / null |
| array-replace-200/off/mount-active | full | 24 | null | 관측되지 않음 | -0.0006884697763780423 | null / null | null / null |
| array-replace-200/off/mount-active-nogc | full | 24 | null | 기록 | -0.0022714975784765556 | null / null | 0.8887705077213468 / 0.8892090479766921 |
| array-replace-200/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0010839999995368998 | null / null | null / null |
| array-replace-200/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0014170000004014582 | null / null | 3.377541499999097 / 3.3764999999984866 |
| array-replace-200/off/profiler-mount | full | 24 | null | 기록 | -0.0024820000007821363 | null / null | null / null |
| array-replace-200/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.0036060000038560247 | null / null | 0.6416930000004868 / 0.6408660000051896 |
| array-replace-200/off/profiler-update | full | 24 | null | 기록 | -0.3176500000749911 | null / null | null / null |
| array-replace-200/off/profiler-update-nogc | full | 24 | null | 기록 | -0.23631150003166113 | 1 / 1 | null / null |
| array-replace-200/off/update-active | full | 24 | null | 관측되지 않음 | -0.29264554381370544 | null / null | null / null |
| array-replace-200/off/update-active-nogc | full | 24 | null | 기록 | -0.31477147340774536 | 1 / 1 | null / null |
| array-replace-200/off/update-wall | full | 24 | null | 관측되지 않음 | -0.29310399999940273 | null / null | null / null |
| array-replace-200/off/update-wall-nogc | full | 24 | null | 기록 | -0.31487550000110787 | 1 / 1 | null / null |
| computed-visible-derived/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| computed-visible-derived/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.00508130081300813 / 0.0040650406504065045 | 3 / 3 |
| computed-visible-derived/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.01208297610281761 | null / null | null / null |
| computed-visible-derived/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.03710447239870973 | null / null | 1.0800410100137015 / 1.116355536680203 |
| computed-visible-derived/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.00943799999993189 | null / null | null / null |
| computed-visible-derived/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.03956200000004628 | null / null | 3.581625000000031 / 3.614520999999968 |
| computed-visible-derived/off/profiler-mount | reduced | 8 | null | 기록 | -0.001717499999699612 | null / null | null / null |
| computed-visible-derived/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.02687949999938155 | null / null | 0.8669579999998405 / 0.8919559999987996 |
| computed-visible-derived/off/profiler-update | reduced | 8 | null | 기록 | 0.00011849999975765968 | null / null | null / null |
| computed-visible-derived/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.008769500000198605 | 0.00508130081300813 / 0.0040650406504065045 | 0.384448999997403 / 0.39526900000032583 |
| computed-visible-derived/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.010958999395370483 | null / null | null / null |
| computed-visible-derived/off/update-active-nogc | reduced | 8 | null | 기록 | -0.02812555432319641 | 0.00508130081300813 / 0.0040650406504065045 | 1.051958978176117 / 1.0822710394859314 |
| computed-visible-derived/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.011271000000192544 | null / null | null / null |
| computed-visible-derived/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.028103500000042914 | 0.00508130081300813 / 0.0040650406504065045 | 1.0495829999999842 / 1.0806450000001178 |
| flat-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.11020745783616803 | null / null | null / null |
| flat-100/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.028749522503176195 | null / null | 9.39599999123402 / 9.395542033855236 |
| flat-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.11845800000008921 | null / null | null / null |
| flat-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.03731300000004012 | null / null | 11.870417000000089 / 11.876042000000325 |
| flat-100/off/profiler-mount | reduced | 8 | null | 기록 | -0.11386849999746573 | null / null | null / null |
| flat-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.01970900000196707 | null / null | 8.152001000008113 / 8.134535999987747 |
| flat-100/off/profiler-update | reduced | 8 | null | 기록 | 0.012365000000158943 | null / null | null / null |
| flat-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.006233499995460079 | 0 / 0 | 0.5769055000016579 / 0.5773644999999306 |
| flat-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.013666480779647827 | null / null | null / null |
| flat-100/off/update-active-nogc | reduced | 8 | null | 기록 | -0.010521411895751953 | 0 / 0 | 1.9584179818630219 / 1.9827510118484497 |
| flat-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.011207499999500214 | null / null | null / null |
| flat-100/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.01016950000007455 | 0 / 0 | 1.9542094999999335 / 1.9795619999995324 |
| flat-50/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-50/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0001016260162601626 / 0.0002032520325203252 | 10 / 10 |
| flat-50/off/mount-active | full | 24 | null | 관측되지 않음 | -0.032104016450830386 | null / null | null / null |
| flat-50/off/mount-active-nogc | full | 24 | null | 기록 | -0.01695804023722758 | null / null | 4.959291045005784 / 4.966624044051969 |
| flat-50/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.0024784999999383217 | null / null | null / null |
| flat-50/off/mount-wall-nogc | full | 24 | null | 기록 | -0.017875500000172906 | null / null | 7.464958000000024 / 7.466084000000137 |
| flat-50/off/profiler-mount | full | 24 | null | 기록 | -0.038477999999031454 | null / null | null / null |
| flat-50/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.012701499999479893 | null / null | 4.296923999996579 / 4.30303499999809 |
| flat-50/off/profiler-update | full | 24 | null | 기록 | -0.008258000001148957 | null / null | null / null |
| flat-50/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0018749999901501724 | 0.0001016260162601626 / 0.0002032520325203252 | 0.5203139999985069 / 0.5208035000005111 |
| flat-50/off/update-active | full | 24 | null | 관측되지 않음 | -0.021915972232818604 | null / null | null / null |
| flat-50/off/update-active-nogc | full | 24 | null | 기록 | -0.001314014196395874 | 0.0001016260162601626 / 0.0002032520325203252 | 1.77333402633667 / 1.7741869688034058 |
| flat-50/off/update-wall | full | 24 | null | 관측되지 않음 | -0.021125500000266584 | null / null | null / null |
| flat-50/off/update-wall-nogc | full | 24 | null | 기록 | -0.0022685000005822076 | 0.0001016260162601626 / 0.0002032520325203252 | 1.7700430000002143 / 1.7708120000002054 |
| flat-500/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-500/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.37833400095382785 | null / null | null / null |
| flat-500/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.3533539851614478 | null / null | null / null |
| flat-500/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.5507289999995919 | null / null | null / null |
| flat-500/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.511416499999541 | null / null | null / null |
| flat-500/off/profiler-mount | reduced | 8 | null | 기록 | 0.39655299996411486 | null / null | null / null |
| flat-500/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.3212004999877536 | null / null | null / null |
| flat-500/off/profiler-update | reduced | 8 | null | 기록 | -0.0016000000232452294 | null / null | null / null |
| flat-500/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.004563000007692608 | 0 / 0 | 0.9904845000673959 / 0.9791114999752608 |
| flat-500/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.013500124216079712 | null / null | null / null |
| flat-500/off/update-active-nogc | reduced | 8 | null | 기록 | 0.022042930126190186 | 0 / 0 | 3.3638959527015686 / 3.335750490427017 |
| flat-500/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.013458499998932894 | null / null | null / null |
| flat-500/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.022478999999293592 | 0 / 0 | 3.3595204999974158 / 3.3314159999990807 |
| nested-d3-f4/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| nested-d3-f4/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| nested-d3-f4/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.10843800983042229 | null / null | null / null |
| nested-d3-f4/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.057895968052207536 | null / null | 7.875812011388916 / 7.838187978450833 |
| nested-d3-f4/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.14908349999996062 | null / null | null / null |
| nested-d3-f4/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.03260500000033062 | null / null | 10.372583500000019 / 10.322395500000312 |
| nested-d3-f4/off/profiler-mount | reduced | 8 | null | 기록 | -0.07908099999519891 | null / null | null / null |
| nested-d3-f4/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.06690300000809657 | null / null | 6.715829499992196 / 6.687680000002047 |
| nested-d3-f4/off/profiler-update | reduced | 8 | null | 기록 | -0.0013930000005757393 | null / null | null / null |
| nested-d3-f4/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.00857499999438005 | 0 / 0 | 0.7007834999949409 / 0.6947750000003907 |
| nested-d3-f4/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0037918388843536377 | null / null | null / null |
| nested-d3-f4/off/update-active-nogc | reduced | 8 | null | 기록 | 0.009686470031738281 | 0 / 0 | 2.1031253933906555 / 2.103144496679306 |
| nested-d3-f4/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.003583500000445383 | null / null | null / null |
| nested-d3-f4/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.009937999999692693 | 0 / 0 | 2.0993960000005245 / 2.0981660000004467 |
| oneOf-10/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-10/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 2 / 2 |
| oneOf-10/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.032790979091657846 | null / null | null / null |
| oneOf-10/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.008104473829348535 | null / null | 1.5064170209807344 / 1.5129585076846865 |
| oneOf-10/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.03950049999991734 | null / null | null / null |
| oneOf-10/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.014541500000063934 | null / null | 4.0130410000001575 / 4.022833499999933 |
| oneOf-10/off/profiler-mount | reduced | 8 | null | 기록 | -0.030690499999650456 | null / null | null / null |
| oneOf-10/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.0002380000000812288 | null / null | 1.2697029999992537 / 1.2721079999994345 |
| oneOf-10/off/profiler-update | reduced | 8 | null | 기록 | -0.0010849999994206883 | null / null | null / null |
| oneOf-10/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.004323500001987668 | 0 / 0 | 0.7826805000000832 / 0.7903374999990547 |
| oneOf-10/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0048749446868896484 | null / null | null / null |
| oneOf-10/off/update-active-nogc | reduced | 8 | null | 기록 | -0.011478513479232788 | 0 / 0 | 1.8621040284633636 / 1.8787085115909576 |
| oneOf-10/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.00589600000006385 | null / null | null / null |
| oneOf-10/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.01243850000025759 | 0 / 0 | 1.8602084999999988 / 1.8774164999999812 |
| oneOf-20/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-20/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.003048780487804878 / 0.003556910569105691 | 2 / 2 |
| oneOf-20/off/mount-active | full | 24 | null | 관측되지 않음 | 0.00231247705653459 | null / null | null / null |
| oneOf-20/off/mount-active-nogc | full | 24 | null | 기록 | -0.0016449792021830945 | null / null | 1.9290414508857907 / 1.9301249984588367 |
| oneOf-20/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.004478999999889766 | null / null | null / null |
| oneOf-20/off/mount-wall-nogc | full | 24 | null | 기록 | 0.0006464999999025167 | null / null | 4.432125000000042 / 4.426582999999937 |
| oneOf-20/off/profiler-mount | full | 24 | null | 기록 | 0.0025609999999005595 | null / null | null / null |
| oneOf-20/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.004021500000931155 | null / null | 1.6757544999994707 / 1.6727869999988343 |
| oneOf-20/off/profiler-update | full | 24 | null | 기록 | 0.0031429999999090796 | null / null | null / null |
| oneOf-20/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0003680000007761919 | 0.003048780487804878 / 0.003556910569105691 | 0.7988820000007308 / 0.799498999998832 |
| oneOf-20/off/update-active | full | 24 | null | 관측되지 않음 | -0.008666545152664185 | null / null | null / null |
| oneOf-20/off/update-active-nogc | full | 24 | null | 기록 | 0.01758396625518799 | 0.003048780487804878 / 0.003556910569105691 | 2.076437473297119 / 2.0713340044021606 |
| oneOf-20/off/update-wall | full | 24 | null | 관측되지 않음 | -0.007124000000089836 | null / null | null / null |
| oneOf-20/off/update-wall-nogc | full | 24 | null | 기록 | 0.01725000000021737 | 0.003048780487804878 / 0.003556910569105691 | 2.0732079999999087 / 2.0696660000000975 |
| oneOf-5/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-5/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.001524390243902439 / 0.001524390243902439 | 2 / 2 |
| oneOf-5/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0012290196780782026 | null / null | null / null |
| oneOf-5/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.005707977552390275 | null / null | 1.340916997726481 / 1.3342920052451746 |
| oneOf-5/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.005083500000068852 | null / null | null / null |
| oneOf-5/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.006311999999866202 | null / null | 3.8427080000001297 / 3.8341669999999795 |
| oneOf-5/off/profiler-mount | reduced | 8 | null | 기록 | -0.004393999999479092 | null / null | null / null |
| oneOf-5/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.0031730000030165684 | null / null | 1.101549000001114 / 1.1028350000012779 |
| oneOf-5/off/profiler-update | reduced | 8 | null | 기록 | -0.009497000000862954 | null / null | null / null |
| oneOf-5/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.006558999998560466 | 0.001524390243902439 / 0.001524390243902439 | 0.7971180000013192 / 0.788443999999572 |
| oneOf-5/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0070005059242248535 | null / null | null / null |
| oneOf-5/off/update-active-nogc | reduced | 8 | null | 기록 | 0.023749977350234985 | 0.001524390243902439 / 0.001524390243902439 | 1.810416042804718 / 1.7893329858779907 |
| oneOf-5/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.006166500000119868 | null / null | null / null |
| oneOf-5/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.023541999999906693 | 0.001524390243902439 / 0.001524390243902439 | 1.8079170000000886 / 1.7873329999999896 |
| sample-0/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-0/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| sample-0/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.002812509683622011 | null / null | null / null |
| sample-0/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.009146006052105804 | null / null | 1.0146040042915274 / 1.0173954699593537 |
| sample-0/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0014385000000061154 | null / null | null / null |
| sample-0/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.01235450000012861 | null / null | 3.515937500000007 / 3.516854500000022 |
| sample-0/off/profiler-mount | reduced | 8 | null | 기록 | -0.007251000000167096 | null / null | null / null |
| sample-0/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.0033500000010917574 | null / null | 0.738478500000042 / 0.743356500000175 |
| sample-0/off/profiler-update | reduced | 8 | null | 기록 | -0.0006654999997977029 | null / null | null / null |
| sample-0/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.0008929999997917548 | 0 / 0 | 0.13052199999958702 / 0.1306474999994407 |
| sample-0/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0009160041809082031 | null / null | null / null |
| sample-0/off/update-active-nogc | reduced | 8 | null | 기록 | -0.001582503318786621 | 0 / 0 | 0.38658297061920166 / 0.3875829875469208 |
| sample-0/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00039550000002464003 | null / null | null / null |
| sample-0/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.0006044999998948697 | 0 / 0 | 0.3846874999999841 / 0.3856664999999566 |
| sample-1/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-1/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.012195121951219513 / 0.01524390243902439 | 1 / 1 |
| sample-1/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.02531251850513172 | null / null | null / null |
| sample-1/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.14379149614904918 | null / null | 1.6176249702892278 / 1.685125972728713 |
| sample-1/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.04520849999997267 | null / null | null / null |
| sample-1/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.14937499999984993 | null / null | 4.1092290000000276 / 4.189250000000129 |
| sample-1/off/profiler-mount | reduced | 8 | null | 기록 | -0.012079499998264964 | null / null | null / null |
| sample-1/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.11763149999694633 | null / null | 1.2966730000000553 / 1.3524704999992991 |
| sample-1/off/profiler-update | reduced | 8 | null | 기록 | -0.0030809999996108672 | null / null | null / null |
| sample-1/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.010316499999248663 | 0.012195121951219513 / 0.01524390243902439 | 0.11406350000004295 / 0.1208299999996143 |
| sample-1/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.009916484355926514 | null / null | null / null |
| sample-1/off/update-active-nogc | reduced | 8 | null | 기록 | -0.02010396122932434 | 0.012195121951219513 / 0.01524390243902439 | 0.3495415151119232 / 0.3632500171661377 |
| sample-1/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.010687499999960437 | null / null | null / null |
| sample-1/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.02002099999992879 | 0.012195121951219513 / 0.01524390243902439 | 0.3478335000000925 / 0.3615830000001097 |
| sample-2/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-2/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.003048780487804878 / 0.003048780487804878 | 1 / 1 |
| sample-2/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00583401821138807 | null / null | null / null |
| sample-2/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.08885298173333922 | null / null | 1.5413334868870265 / 1.4315829846306087 |
| sample-2/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.01927100000000337 | null / null | null / null |
| sample-2/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.0803965000000062 | null / null | 4.037937499999998 / 3.9303749999999127 |
| sample-2/off/profiler-mount | reduced | 8 | null | 기록 | 0.005576000000559134 | null / null | null / null |
| sample-2/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.07879049999860399 | null / null | 1.2468305000018063 / 1.1521330000009584 |
| sample-2/off/profiler-update | reduced | 8 | null | 기록 | -0.00043499999998175554 | null / null | null / null |
| sample-2/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.0038950000000568252 | 0.003048780487804878 / 0.003048780487804878 | 0.1320820000000822 / 0.12816899999961606 |
| sample-2/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.005708515644073486 | null / null | null / null |
| sample-2/off/update-active-nogc | reduced | 8 | null | 기록 | 0.019354015588760376 | 0.003048780487804878 / 0.003048780487804878 | 0.3784579634666443 / 0.36254197359085083 |
| sample-2/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0066664999999943575 | null / null | null / null |
| sample-2/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.019437000000039006 | 0.003048780487804878 / 0.003048780487804878 | 0.3767920000000231 / 0.361084000000119 |
| sample-3/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-3/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0.003048780487804878 | 1 / 1 |
| sample-3/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.08123001685527242 | null / null | null / null |
| sample-3/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.020811457470017558 | null / null | 5.346063032003258 / 5.329855002531076 |
| sample-3/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.057916499999919324 | null / null | null / null |
| sample-3/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.014271000000121603 | null / null | 7.84797900000035 / 7.822749499999986 |
| sample-3/off/profiler-mount | reduced | 8 | null | 기록 | 0.10498999999856551 | null / null | null / null |
| sample-3/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.016508499996120918 | null / null | 4.588790499998481 / 4.568601499999886 |
| sample-3/off/profiler-update | reduced | 8 | null | 기록 | -0.005537000001083925 | null / null | null / null |
| sample-3/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.0013785000006691916 | 0 / 0.003048780487804878 | 0.12172849999979007 / 0.1230850000006285 |
| sample-3/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.01531246304512024 | null / null | null / null |
| sample-3/off/update-active-nogc | reduced | 8 | null | 기록 | -0.004478961229324341 | 0 / 0.003048780487804878 | 0.3806455135345459 / 0.3848339915275574 |
| sample-3/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.01435449999996763 | null / null | null / null |
| sample-3/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.004104500000039479 | 0 / 0.003048780487804878 | 0.3773750000001428 / 0.3822500000001128 |
