# 131 react 측정 세션 결과입니다.

세션 종류는 aa이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 4877.790초이며 확인 측정은 0.000초이고 보고 계산은 0.068초입니다.
프로세스 준비 시간의 합은 90.016초이며 예열은 1581.597초, 강제 GC는 200.005초, 표본은 3132.448초, digest는 524.220초입니다.
시계 밖 minor GC는 25.137초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 208개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 AA_PASS입니다. 축소 비표시 행은 줄인 검출력에서 관측되지 않음으로 해석합니다.
실행 전 추정은 5007.710초이며 확인 여유는 1251.927초이고 합계는 6259.637초입니다. 예산은 7099.989초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 4877.766초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2473.838 |
| array-replace-200 | 922.119 |
| array-push-remove-100 | 332.316 |
| array-push-100 | 267.786 |
| flat-500 | 207.868 |

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
| array-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.809312977973832 | null / null | null / null |
| array-100/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.0893330218787014 | null / null | null / null |
| array-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.6968120000001363 | null / null | null / null |
| array-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.05666700000074343 | null / null | null / null |
| array-100/off/profiler-mount | reduced | 8 | null | 기록 | -0.417672000031871 | null / null | null / null |
| array-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.001348500150925247 | null / null | null / null |
| array-100/off/profiler-update | reduced | 8 | null | 기록 | 0.002320499998631931 | null / null | null / null |
| array-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.0012064999928043108 | 0 / 0 | 0.21356000001287612 / 0.21137450000151148 |
| array-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.011561959981918335 | null / null | null / null |
| array-100/off/update-active-nogc | reduced | 8 | null | 기록 | 0.007146507501602173 | 0 / 0 | 0.6818124949932098 / 0.6810414791107178 |
| array-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.011500000000069122 | null / null | null / null |
| array-100/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.007124999999632564 | 0 / 0 | 0.6786039999997229 / 0.6773955000007845 |
| array-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-500/off/mount-active | full | 24 | null | 관측되지 않음 | 0.2988539661437244 | null / null | null / null |
| array-500/off/mount-active-nogc | full | 24 | null | 기록 | -0.03370747866574675 | null / null | null / null |
| array-500/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.2796669999970618 | null / null | null / null |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | 0.3229795000042941 | null / null | null / null |
| array-500/off/profiler-mount | full | 24 | null | 기록 | 0.08708400001341943 | null / null | null / null |
| array-500/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0294334999343846 | null / null | null / null |
| array-500/off/profiler-update | full | 24 | null | 기록 | -0.0013765000194325694 | null / null | null / null |
| array-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0008539999944332521 | 0 / 0 | 0.34035499996025464 / 0.3385164999817789 |
| array-500/off/update-active | full | 24 | null | 관측되지 않음 | -0.004812479019165039 | null / null | null / null |
| array-500/off/update-active-nogc | full | 24 | null | 기록 | -0.0017499923706054688 | 0 / 0 | 0.9636875092983246 / 0.9588539898395538 |
| array-500/off/update-wall | full | 24 | null | 관측되지 않음 | -0.0058330000028945506 | null / null | null / null |
| array-500/off/update-wall-nogc | full | 24 | null | 기록 | -0.0014585000062652398 | 0 / 0 | 0.9607085000025108 / 0.9554375000006985 |
| array-push-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.03576219512195122 / 0.03573170731707317 | null / null |
| array-push-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0010419945165267563 | null / null | null / null |
| array-push-100/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.008311982980558241 | null / null | 0.8505209988989009 / 0.8539374752053845 |
| array-push-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.003937500000120053 | null / null | null / null |
| array-push-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.004896500001450477 | null / null | 3.216750000000502 / 3.2481455000006463 |
| array-push-100/off/profiler-mount | reduced | 8 | null | 기록 | -0.002578499998890038 | null / null | null / null |
| array-push-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.007249500004036236 | null / null | 0.6282940000064627 / 0.6345230000042648 |
| array-push-100/off/profiler-update | reduced | 8 | null | 기록 | -0.11472150007557502 | null / null | null / null |
| array-push-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.14085849975799647 | 0.03576219512195122 / 0.03573170731707317 | null / null |
| array-push-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.28770771622657776 | null / null | null / null |
| array-push-100/off/update-active-nogc | reduced | 8 | null | 기록 | -0.2216695249080658 | 0.03576219512195122 / 0.03573170731707317 | null / null |
| array-push-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.29020700000000943 | null / null | null / null |
| array-push-100/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.21852200000466837 | 0.03576219512195122 / 0.03573170731707317 | null / null |
| array-push-remove-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-remove-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.025152439024390245 / 0.025121951219512197 | null / null |
| array-push-remove-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0049380500317965925 | null / null | null / null |
| array-push-remove-100/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.003271008968113165 | null / null | 0.7764580000002752 / 0.7682069939837675 |
| array-push-remove-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.013186999999561522 | null / null | null / null |
| array-push-remove-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.0071250000000873115 | null / null | 3.2014169999965816 / 3.187832999999955 |
| array-push-remove-100/off/profiler-mount | reduced | 8 | null | 기록 | 0.001494000003731344 | null / null | null / null |
| array-push-remove-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.0060699999985445174 | null / null | 0.5736590000014985 / 0.5656630000012228 |
| array-push-remove-100/off/profiler-update | reduced | 8 | null | 기록 | -0.07561850003730797 | null / null | null / null |
| array-push-remove-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.32030049982950004 | 0.025152439024390245 / 0.025121951219512197 | null / null |
| array-push-remove-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.17210647463798523 | null / null | null / null |
| array-push-remove-100/off/update-active-nogc | reduced | 8 | null | 기록 | 0.9530019760131836 | 0.025152439024390245 / 0.025121951219512197 | null / null |
| array-push-remove-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.17050399999970978 | null / null | null / null |
| array-push-remove-100/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.9620235000011235 | 0.025152439024390245 / 0.025121951219512197 | null / null |
| array-replace-200/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-replace-200/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 1 / 1 | null / null |
| array-replace-200/off/mount-active | full | 24 | null | 관측되지 않음 | -0.004125001999000233 | null / null | null / null |
| array-replace-200/off/mount-active-nogc | full | 24 | null | 기록 | 0.002791984831674199 | null / null | 0.9208544817884103 / 0.9198964876941318 |
| array-replace-200/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.004708499999196647 | null / null | null / null |
| array-replace-200/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0003954999992856756 | null / null | 3.382208499999251 / 3.387708000001112 |
| array-replace-200/off/profiler-mount | full | 24 | null | 기록 | -0.0032029999988480995 | null / null | null / null |
| array-replace-200/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.0015405000049213413 | null / null | 0.6628284999987955 / 0.6609620000099312 |
| array-replace-200/off/profiler-update | full | 24 | null | 기록 | -0.11797650011885707 | null / null | null / null |
| array-replace-200/off/profiler-update-nogc | full | 24 | null | 기록 | 0.015115499959392764 | 1 / 1 | null / null |
| array-replace-200/off/update-active | full | 24 | null | 관측되지 않음 | -0.11150050163269043 | null / null | null / null |
| array-replace-200/off/update-active-nogc | full | 24 | null | 기록 | 0.08462551236152649 | 1 / 1 | null / null |
| array-replace-200/off/update-wall | full | 24 | null | 관측되지 않음 | -0.1114995000007184 | null / null | null / null |
| array-replace-200/off/update-wall-nogc | full | 24 | null | 기록 | 0.0846045000007507 | 1 / 1 | null / null |
| computed-visible-derived/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| computed-visible-derived/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.0020325203252032522 / 0.0020325203252032522 | 3 / 3 |
| computed-visible-derived/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.002792479917474111 | null / null | null / null |
| computed-visible-derived/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.0027284821186412955 | null / null | 1.1419380220813196 / 1.1420420129662716 |
| computed-visible-derived/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.014916499999969801 | null / null | null / null |
| computed-visible-derived/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.004479499999888503 | null / null | 3.5180625000001555 / 3.539103999999952 |
| computed-visible-derived/off/profiler-mount | reduced | 8 | null | 기록 | 0.0038590000003182467 | null / null | null / null |
| computed-visible-derived/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.008561500001405875 | null / null | 0.8989594999999326 / 0.9067544999992379 |
| computed-visible-derived/off/profiler-update | reduced | 8 | null | 기록 | -0.002849000000196611 | null / null | null / null |
| computed-visible-derived/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.006893000000104621 | 0.0020325203252032522 / 0.0020325203252032522 | 0.40831149999917216 / 0.4093014999996285 |
| computed-visible-derived/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.047103554010391235 | null / null | null / null |
| computed-visible-derived/off/update-active-nogc | reduced | 8 | null | 기록 | 0.013958454132080078 | 0.0020325203252032522 / 0.0020325203252032522 | 1.1182505190372467 / 1.1236045062541962 |
| computed-visible-derived/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.046812500000100954 | null / null | null / null |
| computed-visible-derived/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.012667000000078588 | 0.0020325203252032522 / 0.0020325203252032522 | 1.1166045000002214 / 1.1195205000000215 |
| flat-100/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-100/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-100/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.019792507299484896 | null / null | null / null |
| flat-100/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.05337549442492673 | null / null | 9.756416998752684 / 9.797916041374265 |
| flat-100/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.051083000000062384 | null / null | null / null |
| flat-100/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.06583300000056624 | null / null | 12.070791500000269 / 12.160499999999956 |
| flat-100/off/profiler-mount | reduced | 8 | null | 기록 | 0.02389550000015106 | null / null | null / null |
| flat-100/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.022082499992393423 | null / null | 8.325123000001668 / 8.375030000016068 |
| flat-100/off/profiler-update | reduced | 8 | null | 기록 | 0.010849500003814683 | null / null | null / null |
| flat-100/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.004853000000139218 | 0 / 0 | 0.6415795000068556 / 0.6500650000018595 |
| flat-100/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.004958897829055786 | null / null | null / null |
| flat-100/off/update-active-nogc | reduced | 8 | null | 기록 | -0.050771504640579224 | 0 / 0 | 2.214647054672241 / 2.2279154658317566 |
| flat-100/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0033729999998968196 | null / null | null / null |
| flat-100/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.04956399999878158 | 0 / 0 | 2.2112094999999954 / 2.224208499999804 |
| flat-50/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-50/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0.0001016260162601626 | 10 / 10 |
| flat-50/off/mount-active | full | 24 | null | 관측되지 않음 | 0.009957960018198264 | null / null | null / null |
| flat-50/off/mount-active-nogc | full | 24 | null | 기록 | -0.009061508949230301 | null / null | 5.095499973590904 / 5.0870830345154445 |
| flat-50/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.028374999999925876 | null / null | null / null |
| flat-50/off/mount-wall-nogc | full | 24 | null | 기록 | -0.01658350000025166 | null / null | 7.554104499999994 / 7.555499999999938 |
| flat-50/off/profiler-mount | full | 24 | null | 기록 | 0.02946300000201063 | null / null | null / null |
| flat-50/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.00784599999974489 | null / null | 4.402932499997519 / 4.394743999999491 |
| flat-50/off/profiler-update | full | 24 | null | 기록 | 0.01024000000217029 | null / null | null / null |
| flat-50/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0024875000037809514 | 0 / 0.0001016260162601626 | 0.5332229999992251 / 0.5314110000040273 |
| flat-50/off/update-active | full | 24 | null | 관측되지 않음 | 0.011480510234832764 | null / null | null / null |
| flat-50/off/update-active-nogc | full | 24 | null | 기록 | 0.008082538843154907 | 0 / 0.0001016260162601626 | 1.8348535001277924 / 1.8326669931411743 |
| flat-50/off/update-wall | full | 24 | null | 관측되지 않음 | 0.011544500000240987 | null / null | null / null |
| flat-50/off/update-wall-nogc | full | 24 | null | 기록 | 0.008039499999313193 | 0 / 0.0001016260162601626 | 1.8310415000001967 / 1.828832999999804 |
| flat-500/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-500/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.5578970038336593 | null / null | null / null |
| flat-500/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.10608352507097152 | null / null | null / null |
| flat-500/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.9654375000000073 | null / null | null / null |
| flat-500/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.06924999999955617 | null / null | null / null |
| flat-500/off/profiler-mount | reduced | 8 | null | 기록 | -0.8069350000091617 | null / null | null / null |
| flat-500/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.1270625001152439 | null / null | null / null |
| flat-500/off/profiler-update | reduced | 8 | null | 기록 | -0.005870499969660159 | null / null | null / null |
| flat-500/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.010891499954595929 | 0 / 0 | 1.0952414999792381 / 1.0796675000146934 |
| flat-500/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.061477482318878174 | null / null | null / null |
| flat-500/off/update-active-nogc | reduced | 8 | null | 기록 | 0.08006247878074646 | 0 / 0 | 3.691501557826996 / 3.6569794714450836 |
| flat-500/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.06068899999945643 | null / null | null / null |
| flat-500/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.08020699999906356 | 0 / 0 | 3.685687500000313 / 3.6523340000003373 |
| nested-d3-f4/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| nested-d3-f4/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| nested-d3-f4/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.06173001536950551 | null / null | null / null |
| nested-d3-f4/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.04291698321912918 | null / null | 8.34839548611626 / 8.21675096089939 |
| nested-d3-f4/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.1368325000000823 | null / null | null / null |
| nested-d3-f4/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.045479000000113956 | null / null | 10.678770500000155 / 10.588083000000097 |
| nested-d3-f4/off/profiler-mount | reduced | 8 | null | 기록 | -0.09056450000264249 | null / null | null / null |
| nested-d3-f4/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.061026000005085734 | null / null | 7.014516499996034 / 6.9688270000201555 |
| nested-d3-f4/off/profiler-update | reduced | 8 | null | 기록 | -0.00007399999776680488 | null / null | null / null |
| nested-d3-f4/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.008813499994403173 | 0 / 0 | 0.7677559999933692 / 0.7515814999974282 |
| nested-d3-f4/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.012997925281524658 | null / null | null / null |
| nested-d3-f4/off/update-active-nogc | reduced | 8 | null | 기록 | 0.04166761040687561 | 0 / 0 | 2.3635415732860565 / 2.3005410730838776 |
| nested-d3-f4/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.012938999999619227 | null / null | null / null |
| nested-d3-f4/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.040999500000452826 | 0 / 0 | 2.359811499999978 / 2.2957089999997606 |
| oneOf-10/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-10/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 2 / 2 |
| oneOf-10/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.005375012453072259 | null / null | null / null |
| oneOf-10/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.018665511535743917 | null / null | 1.6075204801196605 / 1.6253954896926643 |
| oneOf-10/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00050000000004502 | null / null | null / null |
| oneOf-10/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.03508349999992788 | null / null | 3.9950830000000224 / 4.017562500000054 |
| oneOf-10/off/profiler-mount | reduced | 8 | null | 기록 | 0.00018449999998892963 | null / null | null / null |
| oneOf-10/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.018089500000428416 | null / null | 1.33399649999933 / 1.3499969999988934 |
| oneOf-10/off/profiler-update | reduced | 8 | null | 기록 | 0.01900200000005725 | null / null | null / null |
| oneOf-10/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.015016500001479471 | 0 / 0 | 0.8425830000003316 / 0.8525104999994255 |
| oneOf-10/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.06843850016593933 | null / null | null / null |
| oneOf-10/off/update-active-nogc | reduced | 8 | null | 기록 | -0.020250052213668823 | 0 / 0 | 2.016937494277954 / 2.048499971628189 |
| oneOf-10/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.06956150000002026 | null / null | null / null |
| oneOf-10/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.021353999999973894 | 0 / 0 | 2.0149999999999864 / 2.0448125000000346 |
| oneOf-20/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-20/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.003556910569105691 / 0.003048780487804878 | 2 / 2 |
| oneOf-20/off/mount-active | full | 24 | null | 관측되지 않음 | 0.023729524703981042 | null / null | null / null |
| oneOf-20/off/mount-active-nogc | full | 24 | null | 기록 | 0.008750482650611957 | null / null | 1.965416478633756 / 1.9584375045300249 |
| oneOf-20/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.010125500000015109 | null / null | null / null |
| oneOf-20/off/mount-wall-nogc | full | 24 | null | 기록 | 0.008125000000177351 | null / null | 4.43843749999985 / 4.429583500000035 |
| oneOf-20/off/profiler-mount | full | 24 | null | 기록 | 0.010777499999448992 | null / null | null / null |
| oneOf-20/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.002461999999923137 | null / null | 1.6975694999993038 / 1.689466000000266 |
| oneOf-20/off/profiler-update | full | 24 | null | 기록 | -0.0003670000003808127 | null / null | null / null |
| oneOf-20/off/profiler-update-nogc | full | 24 | null | 기록 | -0.005979000000706947 | 0.003556910569105691 / 0.003048780487804878 | 0.8140809999990779 / 0.815717000001996 |
| oneOf-20/off/update-active | full | 24 | null | 관측되지 않음 | -0.0016664564609527588 | null / null | null / null |
| oneOf-20/off/update-active-nogc | full | 24 | null | 기록 | 0.00041750073432922363 | 0.003556910569105691 / 0.003048780487804878 | 2.123749017715454 / 2.11712446808815 |
| oneOf-20/off/update-wall | full | 24 | null | 관측되지 않음 | -0.0016045000002122833 | null / null | null / null |
| oneOf-20/off/update-wall-nogc | full | 24 | null | 기록 | 0.0003330000000687505 | 0.003556910569105691 / 0.003048780487804878 | 2.1219579999999496 / 2.1153960000000325 |
| oneOf-5/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-5/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.003048780487804878 / 0.001524390243902439 | 2 / 2 |
| oneOf-5/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.008269488922110213 | null / null | null / null |
| oneOf-5/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.023520486795462148 | null / null | 1.4352079526825037 / 1.4071450298938544 |
| oneOf-5/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.011229000000014366 | null / null | null / null |
| oneOf-5/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.03585499999996955 | null / null | 3.84575000000018 / 3.8097294999998894 |
| oneOf-5/off/profiler-mount | reduced | 8 | null | 기록 | 0.004025499997851512 | null / null | null / null |
| oneOf-5/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.017924999999763713 | null / null | 1.174664999998413 / 1.1529749999995147 |
| oneOf-5/off/profiler-update | reduced | 8 | null | 기록 | 0.0015064999981291294 | null / null | null / null |
| oneOf-5/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.03175149999867699 | 0.003048780487804878 / 0.001524390243902439 | 0.8530820000022459 / 0.8189269999991211 |
| oneOf-5/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.010812938213348389 | null / null | null / null |
| oneOf-5/off/update-active-nogc | reduced | 8 | null | 기록 | 0.07099950313568115 | 0.003048780487804878 / 0.001524390243902439 | 1.947999507188797 / 1.8768330216407776 |
| oneOf-5/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.010603500000001986 | null / null | null / null |
| oneOf-5/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.07160499999986314 | 0.003048780487804878 / 0.001524390243902439 | 1.946042000000034 / 1.8756249999999 |
| sample-0/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-0/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| sample-0/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.011935997413644373 | null / null | null / null |
| sample-0/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.012541485877932246 | null / null | 0.9153539787807858 / 0.9442920262260941 |
| sample-0/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.006145500000002357 | null / null | null / null |
| sample-0/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.02220849999997654 | null / null | 3.2707090000000107 / 3.3096874999999955 |
| sample-0/off/profiler-mount | reduced | 8 | null | 기록 | -0.0065389999992930825 | null / null | null / null |
| sample-0/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.011959499998283718 | null / null | 0.6647089999993909 / 0.6871494999991228 |
| sample-0/off/profiler-update | reduced | 8 | null | 기록 | -0.0056469999998398634 | null / null | null / null |
| sample-0/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.00029249999948888217 | 0 / 0 | 0.12039600000002793 / 0.12262450000031322 |
| sample-0/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.013833999633789062 | null / null | null / null |
| sample-0/off/update-active-nogc | reduced | 8 | null | 기록 | -0.0019580423831939697 | 0 / 0 | 0.36385399103164673 / 0.3675619661808014 |
| sample-0/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.013874499999928958 | null / null | null / null |
| sample-0/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.001813000000026932 | 0 / 0 | 0.36237449999998717 / 0.365771000000052 |
| sample-1/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-1/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.01524390243902439 / 0.003048780487804878 | 1 / 1 |
| sample-1/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.02879150065987801 | null / null | null / null |
| sample-1/off/mount-active-nogc | reduced | 8 | null | 기록 | 0.03495850652882382 | null / null | 1.6680835190181256 / 1.5934170553131253 |
| sample-1/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.03712499999994634 | null / null | null / null |
| sample-1/off/mount-wall-nogc | reduced | 8 | null | 기록 | 0.027187499999968168 | null / null | 4.022729500000082 / 4.001708000000008 |
| sample-1/off/profiler-mount | reduced | 8 | null | 기록 | 0.026373000001228775 | null / null | null / null |
| sample-1/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.03112549999764269 | null / null | 1.327630000000454 / 1.2765150000000176 |
| sample-1/off/profiler-update | reduced | 8 | null | 기록 | -0.0011514999998780695 | null / null | null / null |
| sample-1/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.004499500000633816 | 0.01524390243902439 / 0.003048780487804878 | 0.12200799999936862 / 0.11929000000009182 |
| sample-1/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.006167024374008179 | null / null | null / null |
| sample-1/off/update-active-nogc | reduced | 8 | null | 기록 | 0.016604483127593994 | 0.01524390243902439 / 0.003048780487804878 | 0.37733298540115356 / 0.3605409860610962 |
| sample-1/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.006000000000028649 | null / null | null / null |
| sample-1/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.01729149999994206 | 0.01524390243902439 / 0.003048780487804878 | 0.37479199999984303 / 0.3584579999999278 |
| sample-2/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-2/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0.003048780487804878 / 0.003048780487804878 | 1 / 1 |
| sample-2/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.011938999872171507 | null / null | null / null |
| sample-2/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.02837451707461014 | null / null | 1.4882089883728895 / 1.5390629774970535 |
| sample-2/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0068124999999668034 | null / null | null / null |
| sample-2/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.0086660000001757 | null / null | 3.8925830000000587 / 3.874166500000001 |
| sample-2/off/profiler-mount | reduced | 8 | null | 기록 | -0.012807499999780703 | null / null | null / null |
| sample-2/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.007015999998884581 | null / null | 1.1795140000022002 / 1.2145795000008093 |
| sample-2/off/profiler-update | reduced | 8 | null | 기록 | 0.0006875000001400622 | null / null | null / null |
| sample-2/off/profiler-update-nogc | reduced | 8 | null | 기록 | -0.006105999999817868 | 0.003048780487804878 / 0.003048780487804878 | 0.13291600000138715 / 0.1374150000010559 |
| sample-2/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.001104503870010376 | null / null | null / null |
| sample-2/off/update-active-nogc | reduced | 8 | null | 기록 | -0.03368750214576721 | 0.003048780487804878 / 0.003048780487804878 | 0.37891697883605957 / 0.397333025932312 |
| sample-2/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0016669999999976426 | null / null | null / null |
| sample-2/off/update-wall-nogc | reduced | 8 | null | 기록 | -0.03325000000006639 | 0.003048780487804878 / 0.003048780487804878 | 0.37704200000007404 / 0.39566599999989194 |
| sample-3/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-3/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| sample-3/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.019812042676790043 | null / null | null / null |
| sample-3/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.05029200839999248 | null / null | 5.636957518211261 / 5.723291002567294 |
| sample-3/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.02072900000024447 | null / null | null / null |
| sample-3/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.09437499999989996 | null / null | 7.982458500000121 / 8.085874999999987 |
| sample-3/off/profiler-mount | reduced | 8 | null | 기록 | 0.03485249999948792 | null / null | null / null |
| sample-3/off/profiler-mount-nogc | reduced | 8 | null | 기록 | -0.06744399999502093 | null / null | 4.80395800000349 / 4.858653499994034 |
| sample-3/off/profiler-update | reduced | 8 | null | 기록 | -0.000453499999593987 | null / null | null / null |
| sample-3/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.0021660000001020308 | 0 / 0 | 0.13910450000093988 / 0.13680599999952392 |
| sample-3/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0065000057220458984 | null / null | null / null |
| sample-3/off/update-active-nogc | reduced | 8 | null | 기록 | 0.0034800171852111816 | 0 / 0 | 0.4475419819355011 / 0.44172897934913635 |
| sample-3/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.006646499999817479 | null / null | null / null |
| sample-3/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.0035830000001624285 | 0 / 0 | 0.4452289999999266 / 0.43885450000016135 |
