# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 5707.865초이며 확인 측정은 2491.669초이고 보고 계산은 0.079초입니다.
프로세스 준비 시간의 합은 54.713초이며 예열은 1854.423초, 강제 GC는 175.367초, 표본은 3734.309초, digest는 824.461초입니다.
시계 밖 minor GC는 25.180초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 REJECT입니다.
실행 전 추정은 3204.244초이며 확인 여유는 1200.000초이고 합계는 4404.244초입니다. 예산은 7099.942초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 3216.167초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2515.961 |
| array-100 | 520.131 |
| sample-3 | 110.026 |
| sample-2 | 63.084 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.40062503236958946 | null / null | null / null |
| array-100/off/mount-active-nogc | full | 24 | null | 기록 | 0.13156202211757773 | null / null | null / null |
| array-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.21862499999997453 | null / null | null / null |
| array-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.18233300000065356 | null / null | null / null |
| array-100/off/profiler-mount | full | 24 | null | 기록 | -0.21598200000062207 | null / null | null / null |
| array-100/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.03586049988598461 | null / null | null / null |
| array-100/off/profiler-update | full | 24 | null | 기록 | 0.001553999998350264 | null / null | null / null |
| array-100/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0017024999933710205 | 0 / 0 | 0.20307799999955023 / 0.20052250000298955 |
| array-100/off/update-active | full | 24 | null | 관측되지 않음 | 0.009063005447387695 | null / null | null / null |
| array-100/off/update-active-nogc | full | 24 | null | 기록 | 0.002521008253097534 | 0 / 0 | 0.6504999995231628 / 0.6457079946994781 |
| array-100/off/update-wall | full | 24 | null | 관측되지 않음 | 0.008207999999740423 | null / null | null / null |
| array-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.002666499999577354 | 0 / 0 | 0.6476669999997284 / 0.6428540000001703 |
| array-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-500/off/mount-active | full | 24 | null | 관측되지 않음 | -0.9330215201753163 | null / null | null / null |
| array-500/off/mount-active-nogc | full | 24 | null | 기록 | 0.14481301564228488 | null / null | null / null |
| array-500/off/mount-wall | full | 24 | null | 관측되지 않음 | -1.067541500000516 | null / null | null / null |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | -0.2972710000030929 | null / null | null / null |
| array-500/off/profiler-mount | full | 24 | null | 기록 | -0.3217444998972496 | null / null | null / null |
| array-500/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.06661750031707925 | null / null | null / null |
| array-500/off/profiler-update | full | 24 | null | 기록 | -0.00687099997230689 | null / null | null / null |
| array-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0069775000447407365 | 0 / 0 | 0.3516589999453572 / 0.34825499995349674 |
| array-500/off/update-active | full | 24 | 24 | 확인됨 | -0.05052149295806885 | null / null | null / null |
| array-500/off/update-active-nogc | full | 24 | null | 기록 | 0.009395480155944824 | 0 / 0 | 1.0010210275650024 / 1.0082294940948486 |
| array-500/off/update-wall | full | 24 | 24 | 확인됨 | -0.04841699999906268 | null / null | null / null |
| array-500/off/update-wall-nogc | full | 24 | null | 기록 | 0.009750000001076842 | 0 / 0 | 0.9977085000027728 / 1.0048539999988861 |
| sample-2/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-2/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0040650406504065045 / 0.007113821138211382 | 1 / 1 |
| sample-2/off/mount-active | full | 24 | null | 관측되지 않음 | 0.03839598850062487 | null / null | null / null |
| sample-2/off/mount-active-nogc | full | 24 | null | 기록 | -0.0066870128192704215 | null / null | 1.504438017551422 / 1.4922499855117621 |
| sample-2/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.04166699999996126 | null / null | null / null |
| sample-2/off/mount-wall-nogc | full | 24 | null | 기록 | -0.037958000000116954 | null / null | 3.761229000000071 / 3.751499999999851 |
| sample-2/off/profiler-mount | full | 24 | null | 기록 | 0.02039249999995718 | null / null | null / null |
| sample-2/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.004698499996379724 | null / null | 1.1952465000011898 / 1.1877929999996013 |
| sample-2/off/profiler-update | full | 24 | null | 기록 | 0.00009750000020858351 | null / null | null / null |
| sample-2/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0031815000010055883 | 0.0040650406504065045 / 0.007113821138211382 | 0.1318700000001627 / 0.13196299999935945 |
| sample-2/off/update-active | full | 24 | null | 관측되지 않음 | 0.003353983163833618 | null / null | null / null |
| sample-2/off/update-active-nogc | full | 24 | null | 기록 | -0.011145442724227905 | 0.0040650406504065045 / 0.007113821138211382 | 0.37687501311302185 / 0.38120800256729126 |
| sample-2/off/update-wall | full | 24 | null | 관측되지 않음 | 0.003624999999942702 | null / null | null / null |
| sample-2/off/update-wall-nogc | full | 24 | null | 기록 | -0.011395499999935055 | 0.0040650406504065045 / 0.007113821138211382 | 0.3753960000000234 / 0.3797079999999369 |
| sample-3/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-3/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| sample-3/off/mount-active | full | 24 | null | 관측되지 않음 | -0.07929203480912861 | null / null | null / null |
| sample-3/off/mount-active-nogc | full | 24 | null | 기록 | -0.01345798831744105 | null / null | 5.593083538532255 / 5.65804152083399 |
| sample-3/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.06152099999997063 | null / null | null / null |
| sample-3/off/mount-wall-nogc | full | 24 | null | 기록 | -0.010937500000068212 | null / null | 7.835187999999903 / 7.900396000000001 |
| sample-3/off/profiler-mount | full | 24 | null | 기록 | -0.0240319999966232 | null / null | null / null |
| sample-3/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.02837399999725676 | null / null | 4.7636205000001155 / 4.822412999997596 |
| sample-3/off/profiler-update | full | 24 | null | 기록 | -0.0010000000006016307 | null / null | null / null |
| sample-3/off/profiler-update-nogc | full | 24 | null | 기록 | -0.00018549999992956145 | 0 / 0 | 0.1349605000007159 / 0.1357499999993479 |
| sample-3/off/update-active | full | 24 | null | 관측되지 않음 | 0.0034379959106445312 | null / null | null / null |
| sample-3/off/update-active-nogc | full | 24 | null | 기록 | -0.008166462182998657 | 0 / 0 | 0.4310210049152374 / 0.43681249022483826 |
| sample-3/off/update-wall | full | 24 | null | 관측되지 않음 | 0.0026044999997907325 | null / null | null / null |
| sample-3/off/update-wall-nogc | full | 24 | null | 기록 | -0.006750000000124601 | 0 / 0 | 0.42889599999989514 / 0.4341875000000073 |
