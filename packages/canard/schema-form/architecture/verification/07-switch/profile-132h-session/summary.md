# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 3148.365초이며 확인 측정은 0.000초이고 보고 계산은 0.066초입니다.
프로세스 준비 시간의 합은 81.180초이며 예열은 1022.256초, 강제 GC는 148.593초, 표본은 1980.954초, digest는 144.337초입니다.
시계 밖 minor GC는 16.547초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 128개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다. 축소 비표시 행은 줄인 검출력에서 관측되지 않음으로 해석합니다.
실행 전 추정은 3559.667초이며 확인 여유는 1200.000초이고 합계는 4759.667초입니다. 예산은 7099.939초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 3148.341초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-replace-200 | 903.408 |
| array-push-remove-100 | 895.303 |
| array-push-100 | 731.229 |
| flat-500 | 194.588 |
| flat-50 | 113.579 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-push-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.03567073170731707 / 0.03145325203252033 | null / null |
| array-push-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.007707959377512452 | null / null | null / null |
| array-push-100/off/mount-active-nogc | full | 24 | null | 기록 | 0.010895465464273002 | null / null | 0.7922284780088376 / 0.7803954963674187 |
| array-push-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.004208000000289758 | null / null | null / null |
| array-push-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.011896000000888307 | null / null | 3.169458499999564 / 3.0950625000004948 |
| array-push-100/off/profiler-mount | full | 24 | null | 기록 | -0.00270500000760876 | null / null | null / null |
| array-push-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.01587650001874863 | null / null | 0.5843944999978703 / 0.5702235000017026 |
| array-push-100/off/profiler-update | full | 24 | null | 기록 | 1.9134124999045525 | null / null | null / null |
| array-push-100/off/profiler-update-nogc | full | 24 | null | 기록 | 2.012934999965182 | 0.03567073170731707 / 0.03145325203252033 | null / null |
| array-push-100/off/update-active | full | 24 | null | 관측되지 않음 | 7.845387279987335 | null / null | null / null |
| array-push-100/off/update-active-nogc | full | 24 | null | 기록 | 8.211839735507965 | 0.03567073170731707 / 0.03145325203252033 | null / null |
| array-push-100/off/update-wall | full | 24 | null | 관측되지 않음 | 7.8454400000014175 | null / null | null / null |
| array-push-100/off/update-wall-nogc | full | 24 | null | 기록 | 8.212334499990902 | 0.03567073170731707 / 0.03145325203252033 | null / null |
| array-push-remove-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-remove-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.025182926829268294 / 0.023617886178861788 | null / null |
| array-push-remove-100/off/mount-active | full | 24 | null | 관측되지 않음 | 0.006229045392046828 | null / null | null / null |
| array-push-remove-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.01670803290198819 | null / null | 0.7349160138292063 / 0.7435840007710794 |
| array-push-remove-100/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0013129999988450436 | null / null | null / null |
| array-push-remove-100/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0066260000012334785 | null / null | 3.161292000000685 / 3.158625000000029 |
| array-push-remove-100/off/profiler-mount | full | 24 | null | 기록 | 0.006432999996377475 | null / null | null / null |
| array-push-remove-100/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.00627149999854737 | null / null | 0.5462970000007772 / 0.5535850000032951 |
| array-push-remove-100/off/profiler-update | full | 24 | null | 기록 | 3.722468499976003 | null / null | null / null |
| array-push-remove-100/off/profiler-update-nogc | full | 24 | null | 기록 | 3.9583510000511524 | 0.025182926829268294 / 0.023617886178861788 | null / null |
| array-push-remove-100/off/update-active | full | 24 | null | 관측되지 않음 | 14.684515953063965 | null / null | null / null |
| array-push-remove-100/off/update-active-nogc | full | 24 | null | 기록 | 14.08402395248413 | 0.025182926829268294 / 0.023617886178861788 | null / null |
| array-push-remove-100/off/update-wall | full | 24 | null | 관측되지 않음 | 14.685739500000636 | null / null | null / null |
| array-push-remove-100/off/update-wall-nogc | full | 24 | null | 기록 | 14.083893500017439 | 0.025182926829268294 / 0.023617886178861788 | null / null |
| array-replace-200/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-replace-200/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 1 / 1 | null / null |
| array-replace-200/off/mount-active | full | 24 | null | 관측되지 않음 | 0.0010619578915793682 | null / null | null / null |
| array-replace-200/off/mount-active-nogc | full | 24 | null | 기록 | 0.0019169887391399243 | null / null | 0.9134785052801817 / 0.9120630153138336 |
| array-replace-200/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0027915000005123147 | null / null | null / null |
| array-replace-200/off/mount-wall-nogc | full | 24 | null | 기록 | 0.0045419999996738625 | null / null | 3.1906245000000126 / 3.1840000000001965 |
| array-replace-200/off/profiler-mount | full | 24 | null | 기록 | -0.0043165000074623094 | null / null | null / null |
| array-replace-200/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.0029550000099334284 | null / null | 0.6574414999831788 / 0.6560419999987062 |
| array-replace-200/off/profiler-update | full | 24 | null | 기록 | -0.09229150005239717 | null / null | null / null |
| array-replace-200/off/profiler-update-nogc | full | 24 | null | 기록 | 0.1762940000526214 | 1 / 1 | null / null |
| array-replace-200/off/update-active | full | 24 | null | 관측되지 않음 | 0.12870797514915466 | null / null | null / null |
| array-replace-200/off/update-active-nogc | full | 24 | null | 기록 | 0.22966650128364563 | 1 / 1 | null / null |
| array-replace-200/off/update-wall | full | 24 | null | 관측되지 않음 | 0.12860349999982645 | null / null | null / null |
| array-replace-200/off/update-wall-nogc | full | 24 | null | 기록 | 0.22941650000029767 | 1 / 1 | null / null |
| computed-visible-derived/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| computed-visible-derived/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.003048780487804878 / 0.0020325203252032522 | 3 / 3 |
| computed-visible-derived/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.006520967758177676 | null / null | null / null |
| computed-visible-derived/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.0036880441990660984 | null / null | 1.0856255008068274 / 1.0857499720687542 |
| computed-visible-derived/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.023874499999976706 | null / null | null / null |
| computed-visible-derived/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.00824950000003355 | null / null | 3.485145500000044 / 3.488187499999981 |
| computed-visible-derived/off/profiler-mount | reduced | 8 | null | 기록 | 0.0042284999997264094 | null / null | null / null |
| computed-visible-derived/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.002484999998841886 | null / null | 0.8636429999997972 / 0.8625400000006493 |
| computed-visible-derived/off/profiler-update | reduced | 8 | null | 기록 | -0.00586999999990212 | null / null | null / null |
| computed-visible-derived/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.003933499997970102 | 0.003048780487804878 / 0.0020325203252032522 | 0.389603999999963 / 0.383831499999701 |
| computed-visible-derived/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.03200152516365051 | null / null | null / null |
| computed-visible-derived/off/update-active-nogc | reduced | 8 | null | 기록 | 0.004584014415740967 | 0.003048780487804878 / 0.0020325203252032522 | 1.070041000843048 / 1.0601870119571686 |
| computed-visible-derived/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.03193649999997206 | null / null | null / null |
| computed-visible-derived/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.004416000000219356 | 0.003048780487804878 / 0.0020325203252032522 | 1.0685839999998734 / 1.0584794999999758 |
| flat-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.04897850295253647 | null / null | null / null |
| flat-100/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.004040494937953554 | null / null | 9.530792015918678 / 9.535290988079396 |
| flat-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.05199950000002218 | null / null | null / null |
| flat-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.011291499999970256 | null / null | 11.906000000000176 / 11.911417000000256 |
| flat-100/off/profiler-mount | reduced | 8 | null | 기록 | 0.04473649999101781 | null / null | null / null |
| flat-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.011421999994126963 | null / null | 8.229434499993658 / 8.235683000008976 |
| flat-100/off/profiler-update | reduced | 8 | null | 기록 | -0.0023644999990892757 | null / null | null / null |
| flat-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.001448999990543598 | 0 / 0 | 0.593376999996508 / 0.5944020000040382 |
| flat-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.014124512672424316 | null / null | null / null |
| flat-100/off/update-active-nogc | reduced | 8 | null | 기록 | 0.006956994533538818 | 0 / 0 | 2.056145489215851 / 2.0461654663085938 |
| flat-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.014583500000071581 | null / null | null / null |
| flat-100/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.007250999999996566 | 0 / 0 | 2.0529374999996435 / 2.042542499999172 |
| flat-50/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-50/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0003048780487804878 / 0.0001016260162601626 | 10 / 10 |
| flat-50/off/mount-active | full | 24 | null | 관측되지 않음 | 0.018625031654380564 | null / null | null / null |
| flat-50/off/mount-active-nogc | full | 24 | null | 기록 | 0.046228964090232694 | null / null | 5.084417003007843 / 5.06431152140226 |
| flat-50/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.028521000000068852 | null / null | null / null |
| flat-50/off/mount-wall-nogc | full | 24 | null | 기록 | 0.025270500000146967 | null / null | 7.474395499999673 / 7.46020800000008 |
| flat-50/off/profiler-mount | full | 24 | null | 기록 | 0.035219499998959236 | null / null | null / null |
| flat-50/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.022115500002882982 | null / null | 4.389007999999535 / 4.374266499994974 |
| flat-50/off/profiler-update | full | 24 | null | 기록 | 0.0010010000038391809 | null / null | null / null |
| flat-50/off/profiler-update-nogc | full | 24 | null | 기록 | 0.00165800000524996 | 0.0003048780487804878 / 0.0001016260162601626 | 0.5340400000050067 / 0.5322280000054889 |
| flat-50/off/update-active | full | 24 | null | 관측되지 않음 | 0.00020498037338256836 | null / null | null / null |
| flat-50/off/update-active-nogc | full | 24 | null | 기록 | 0.004166364669799805 | 0.0003048780487804878 / 0.0001016260162601626 | 1.8393750190734863 / 1.8326671123504639 |
| flat-50/off/update-wall | full | 24 | null | 관측되지 않음 | -0.00031450000017230195 | null / null | null / null |
| flat-50/off/update-wall-nogc | full | 24 | null | 기록 | 0.004102999999304302 | 0.0003048780487804878 / 0.0001016260162601626 | 1.8358729999999923 / 1.8291660000004413 |
| flat-500/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-500/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.2809155174047646 | null / null | null / null |
| flat-500/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.00020797085926460568 | null / null | null / null |
| flat-500/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.34158400000023903 | null / null | null / null |
| flat-500/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.03545800000119925 | null / null | null / null |
| flat-500/off/profiler-mount | reduced | 8 | null | 기록 | -0.04386499999895932 | null / null | null / null |
| flat-500/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.029732999961197493 | null / null | null / null |
| flat-500/off/profiler-update | reduced | 8 | null | 기록 | -0.0060929999897325615 | null / null | null / null |
| flat-500/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.017581999987669406 | 0 / 0 | 1.0126880000225356 / 1.0175790000721463 |
| flat-500/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.010333001613616943 | null / null | null / null |
| flat-500/off/update-active-nogc | reduced | 8 | null | 기록 | -0.005354493856430054 | 0 / 0 | 3.4844586551189423 / 3.4968959987163544 |
| flat-500/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.007520999997950639 | null / null | null / null |
| flat-500/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.005606500004432746 | 0 / 0 | 3.4793335000022125 / 3.4929160000010597 |
| nested-d3-f4/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| nested-d3-f4/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| nested-d3-f4/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.058979005483706715 | null / null | null / null |
| nested-d3-f4/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.022333436067810908 | null / null | 8.045625021274645 / 8.012916009242872 |
| nested-d3-f4/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0683755000002293 | null / null | null / null |
| nested-d3-f4/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.021624499999916225 | null / null | 10.388042000000041 / 10.396541999999954 |
| nested-d3-f4/off/profiler-mount | reduced | 8 | null | 기록 | -0.043878000002223416 | null / null | null / null |
| nested-d3-f4/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.02384499999311629 | null / null | 6.837133999994421 / 6.82514200000287 |
| nested-d3-f4/off/profiler-update | reduced | 8 | null | 기록 | 0.005586999999650288 | null / null | null / null |
| nested-d3-f4/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.007203000006711591 | 0 / 0 | 0.7221069999968677 / 0.7232079999955658 |
| nested-d3-f4/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0002503395080566406 | null / null | null / null |
| nested-d3-f4/off/update-active-nogc | reduced | 8 | null | 기록 | -0.01962745189666748 | 0 / 0 | 2.2046024799346924 / 2.211020529270172 |
| nested-d3-f4/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0007280000002083398 | null / null | null / null |
| nested-d3-f4/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.019604499999559266 | 0 / 0 | 2.2006660000004103 / 2.2076255000001765 |
| oneOf-10/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-10/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.001524390243902439 / 0 | 2 / 2 |
| oneOf-10/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.015666028793333453 | null / null | null / null |
| oneOf-10/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.03570903818319948 | null / null | 1.5626260023841496 / 1.5325004966259712 |
| oneOf-10/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0023535000000265427 | null / null | null / null |
| oneOf-10/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.03977100000008704 | null / null | 4.00324999999998 / 3.970083000000045 |
| oneOf-10/off/profiler-mount | reduced | 8 | null | 기록 | -0.016057500000783875 | null / null | null / null |
| oneOf-10/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.02199999999982083 | null / null | 1.30863499999964 / 1.28887050000003 |
| oneOf-10/off/profiler-update | reduced | 8 | null | 기록 | 0.0170800000000213 | null / null | null / null |
| oneOf-10/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.013787000000206717 | 0.001524390243902439 / 0 | 0.8094720000015059 / 0.7941224999999577 |
| oneOf-10/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.04750049114227295 | null / null | null / null |
| oneOf-10/off/update-active-nogc | reduced | 8 | null | 기록 | 0.023500025272369385 | 0.001524390243902439 / 0 | 1.9333750009536743 / 1.893686980009079 |
| oneOf-10/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.04475050000007741 | null / null | null / null |
| oneOf-10/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.023582999999916865 | 0.001524390243902439 / 0 | 1.9302500000001146 / 1.8917500000000018 |
| oneOf-20/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-20/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0020325203252032522 / 0.001524390243902439 | 2 / 2 |
| oneOf-20/off/mount-active | full | 24 | null | 관측되지 않음 | 0.00029250748255549297 | null / null | null / null |
| oneOf-20/off/mount-active-nogc | full | 24 | null | 기록 | -0.008833497524278755 | null / null | 1.9629164812203044 / 1.9735620104349891 |
| oneOf-20/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0005004999998732274 | null / null | null / null |
| oneOf-20/off/mount-wall-nogc | full | 24 | null | 기록 | -0.007604000000014821 | null / null | 4.374937500000101 / 4.375332999999955 |
| oneOf-20/off/profiler-mount | full | 24 | null | 기록 | -0.0048050000006583105 | null / null | null / null |
| oneOf-20/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0007924999999886495 | null / null | 1.6976495000008072 / 1.7034840000004579 |
| oneOf-20/off/profiler-update | full | 24 | null | 기록 | -0.011207000000240441 | null / null | null / null |
| oneOf-20/off/profiler-update-nogc | full | 24 | null | 기록 | -0.002898500000128479 | 0.0020325203252032522 / 0.001524390243902439 | 0.817023500001369 / 0.8184180000009746 |
| oneOf-20/off/update-active | full | 24 | null | 관측되지 않음 | -0.022666484117507935 | null / null | null / null |
| oneOf-20/off/update-active-nogc | full | 24 | null | 기록 | -0.003021031618118286 | 0.0020325203252032522 / 0.001524390243902439 | 2.134833514690399 / 2.1250839829444885 |
| oneOf-20/off/update-wall | full | 24 | null | 관측되지 않음 | -0.024499999999989086 | null / null | null / null |
| oneOf-20/off/update-wall-nogc | full | 24 | null | 기록 | -0.0030414999998811254 | 0.0020325203252032522 / 0.001524390243902439 | 2.132624999999848 / 2.1233330000000024 |
| oneOf-5/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-5/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.001524390243902439 / 0 | 2 / 2 |
| oneOf-5/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.03279146957393664 | null / null | null / null |
| oneOf-5/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.023437023492817843 | null / null | 1.3725010029718305 / 1.3633959952316559 |
| oneOf-5/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.022082999999952335 | null / null | null / null |
| oneOf-5/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.0041044999999257925 | null / null | 3.795749999999998 / 3.796124999999961 |
| oneOf-5/off/profiler-mount | reduced | 8 | null | 기록 | 0.040435499998807245 | null / null | null / null |
| oneOf-5/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.013694499999928667 | null / null | 1.1300740000010592 / 1.1258210000004283 |
| oneOf-5/off/profiler-update | reduced | 8 | null | 기록 | 0.018470500000148604 | null / null | null / null |
| oneOf-5/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.0046270000019603685 | 0.001524390243902439 / 0 | 0.8098650000001726 / 0.8082705000011856 |
| oneOf-5/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.039709001779556274 | null / null | null / null |
| oneOf-5/off/update-active-nogc | reduced | 8 | null | 기록 | 0.0273745059967041 | 0.001524390243902439 / 0 | 1.8462089896202087 / 1.8311664760112762 |
| oneOf-5/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.04050000000000864 | null / null | null / null |
| oneOf-5/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.027062000000114494 | 0.001524390243902439 / 0 | 1.8450419999999212 / 1.8293125000000146 |
| sample-0/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-0/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| sample-0/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.02158503581810578 | null / null | null / null |
| sample-0/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.012915005611375818 | null / null | 0.9620849712066502 / 0.9459159742507381 |
| sample-0/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.021770500000002357 | null / null | null / null |
| sample-0/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.024458499999923333 | null / null | 3.3934169999999995 / 3.366916000000174 |
| sample-0/off/profiler-mount | reduced | 8 | null | 기록 | 0.0037239999998064377 | null / null | null / null |
| sample-0/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.013495500000260563 | null / null | 0.6995780000008835 / 0.6890370000014627 |
| sample-0/off/profiler-update | reduced | 8 | null | 기록 | 0.00010150000036901474 | null / null | null / null |
| sample-0/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.0013765000008447714 | 0 / 0 | 0.12387300000034429 / 0.12053849999983868 |
| sample-0/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.010437041521072388 | null / null | null / null |
| sample-0/off/update-active-nogc | reduced | 8 | null | 기록 | 0.006041049957275391 | 0 / 0 | 0.3704580068588257 / 0.36250001192092896 |
| sample-0/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.010437500000023192 | null / null | null / null |
| sample-0/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.006104500000049029 | 0 / 0 | 0.3679584999999861 / 0.36083350000001246 |
| sample-1/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-1/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.006097560975609756 / 0.006097560975609756 | 1 / 1 |
| sample-1/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0031259909038681144 | null / null | null / null |
| sample-1/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.0320204568462259 | null / null | 1.641416972820366 / 1.638499474966011 |
| sample-1/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.022625500000060583 | null / null | null / null |
| sample-1/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.03437499999984084 | null / null | 4.034040999999888 / 4.037771000000021 |
| sample-1/off/profiler-mount | reduced | 8 | null | 기록 | 0.0096965000009277 | null / null | null / null |
| sample-1/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.03951850000203194 | null / null | 1.3076949999995122 / 1.307081000002313 |
| sample-1/off/profiler-update | reduced | 8 | null | 기록 | 0.0033965000001785484 | null / null | null / null |
| sample-1/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.008599999999546526 | 0.006097560975609756 / 0.006097560975609756 | 0.12006250000092678 / 0.11585599999989427 |
| sample-1/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.01156201958656311 | null / null | null / null |
| sample-1/off/update-active-nogc | reduced | 8 | null | 기록 | 0.012667030096054077 | 0.006097560975609756 / 0.006097560975609756 | 0.36106249690055847 / 0.3580835163593292 |
| sample-1/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.01293799999990597 | null / null | null / null |
| sample-1/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.012895499999899585 | 0.006097560975609756 / 0.006097560975609756 | 0.3597709999999097 / 0.3565210000000434 |
