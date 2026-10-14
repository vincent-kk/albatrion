# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 3453.654초이며 확인 측정은 0.000초이고 보고 계산은 0.047초입니다.
프로세스 준비 시간의 합은 52.146초이며 예열은 1135.104초, 강제 GC는 117.815초, 표본은 2208.524초, digest는 218.131초입니다.
시계 밖 minor GC는 16.538초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 4021.117초이며 확인 여유는 1200.000초이고 합계는 5221.117초입니다. 예산은 7099.940초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 3453.633초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-replace-200 | 874.641 |
| array-push-remove-100 | 829.654 |
| array-push-100 | 685.683 |
| flat-500 | 570.794 |
| array-100 | 485.030 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.11520847516840149 | null / null | null / null |
| array-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.0002289849794578913 | null / null | null / null |
| array-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.08602000000018961 | null / null | null / null |
| array-100/off/mount-wall-nogc | full | 24 | null | 기록 | -0.03679199999987759 | null / null | null / null |
| array-100/off/profiler-mount | full | 24 | null | 기록 | -0.09385550003435128 | null / null | null / null |
| array-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.07448299983434481 | null / null | null / null |
| array-100/off/profiler-update | full | 24 | null | 기록 | -0.0016715000051590323 | null / null | null / null |
| array-100/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0008110000003398454 | 0 / 0 | 0.17434800000955875 / 0.17526950000183206 |
| array-100/off/update-active | full | 24 | null | 관측되지 않음 | -0.0027924776077270508 | null / null | null / null |
| array-100/off/update-active-nogc | full | 24 | null | 기록 | -0.0006460249423980713 | 0 / 0 | 0.5675830245018005 / 0.5693334937095642 |
| array-100/off/update-wall | full | 24 | null | 관측되지 않음 | -0.0027289999998174608 | null / null | null / null |
| array-100/off/update-wall-nogc | full | 24 | null | 기록 | -0.0014165000002321904 | 0 / 0 | 0.5651454999992893 / 0.5668749999995271 |
| array-push-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.031473577235772356 / 0.0315650406504065 | null / null |
| array-push-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.00037598274275296717 | null / null | null / null |
| array-push-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.00043646132053254405 | null / null | 0.7451874939843037 / 0.746708017642959 |
| array-push-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.0001250000004802132 | null / null | null / null |
| array-push-100/off/mount-wall-nogc | full | 24 | null | 기록 | -0.004728499998236657 | null / null | 3.251228999999512 / 3.25616699999955 |
| array-push-100/off/profiler-mount | full | 24 | null | 기록 | -0.0030199999996511906 | null / null | null / null |
| array-push-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.0012039999946864555 | null / null | 0.5413740000030884 / 0.5402480000120704 |
| array-push-100/off/profiler-update | full | 24 | null | 기록 | -0.12948199999618737 | null / null | null / null |
| array-push-100/off/profiler-update-nogc | full | 24 | null | 기록 | -0.026738000154182373 | 0.031473577235772356 / 0.0315650406504065 | null / null |
| array-push-100/off/update-active | full | 24 | null | 관측되지 않음 | -0.27425476908683777 | null / null | null / null |
| array-push-100/off/update-active-nogc | full | 24 | null | 기록 | 0.09765022993087769 | 0.031473577235772356 / 0.0315650406504065 | null / null |
| array-push-100/off/update-wall | full | 24 | null | 관측되지 않음 | -0.277726500008157 | null / null | null / null |
| array-push-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.10031249999246938 | 0.031473577235772356 / 0.0315650406504065 | null / null |
| array-push-remove-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-remove-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.022403455284552846 / 0.022291666666666668 | null / null |
| array-push-remove-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.007687039045549682 | null / null | null / null |
| array-push-remove-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.00608447579179483 | null / null | 0.7319160003298748 / 0.7377499932135834 |
| array-push-remove-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.010333499999887863 | null / null | null / null |
| array-push-remove-100/off/mount-wall-nogc | full | 24 | null | 기록 | -0.005333000000064203 | null / null | 3.2362084999995204 / 3.2442920000012236 |
| array-push-remove-100/off/profiler-mount | full | 24 | null | 기록 | -0.005831000000853237 | null / null | null / null |
| array-push-remove-100/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.000919999989491771 | null / null | 0.5440419999913502 / 0.548664000003555 |
| array-push-remove-100/off/profiler-update | full | 24 | null | 기록 | -0.362908500012054 | null / null | null / null |
| array-push-remove-100/off/profiler-update-nogc | full | 24 | null | 기록 | -0.220845499537063 | 0.022403455284552846 / 0.022291666666666668 | null / null |
| array-push-remove-100/off/update-active | full | 24 | null | 관측되지 않음 | -0.4127265214920044 | null / null | null / null |
| array-push-remove-100/off/update-active-nogc | full | 24 | null | 기록 | -0.5618119239807129 | 0.022403455284552846 / 0.022291666666666668 | null / null |
| array-push-remove-100/off/update-wall | full | 24 | null | 관측되지 않음 | -0.40381299999580733 | null / null | null / null |
| array-push-remove-100/off/update-wall-nogc | full | 24 | null | 기록 | -0.5664730000153213 | 0.022403455284552846 / 0.022291666666666668 | null / null |
| array-replace-200/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-replace-200/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 1 / 1 | null / null |
| array-replace-200/off/mount-active | full | 24 | null | 관측되지 않음 | -0.00014502435533358948 | null / null | null / null |
| array-replace-200/off/mount-active-nogc | full | 24 | null | 기록 | -0.004854521936067613 | null / null | 0.8847080087289214 / 0.8893119825952454 |
| array-replace-200/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.00897949999989578 | null / null | null / null |
| array-replace-200/off/mount-wall-nogc | full | 24 | null | 기록 | -0.000020500001483014785 | null / null | 3.3779585000002044 / 3.3758125000013024 |
| array-replace-200/off/profiler-mount | full | 24 | null | 기록 | -0.00012849999984609894 | null / null | null / null |
| array-replace-200/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.004147000005104928 | null / null | 0.6387469999981477 / 0.6409795000008671 |
| array-replace-200/off/profiler-update | full | 24 | null | 기록 | -0.2990389999690706 | null / null | null / null |
| array-replace-200/off/profiler-update-nogc | full | 24 | null | 기록 | 0.07749650015284715 | 1 / 1 | null / null |
| array-replace-200/off/update-active | full | 24 | null | 관측되지 않음 | -0.1357710361480713 | null / null | null / null |
| array-replace-200/off/update-active-nogc | full | 24 | null | 기록 | 0.08452105522155762 | 1 / 1 | null / null |
| array-replace-200/off/update-wall | full | 24 | null | 관측되지 않음 | -0.1355835000008483 | null / null | null / null |
| array-replace-200/off/update-wall-nogc | full | 24 | null | 기록 | 0.08335349999924802 | 1 / 1 | null / null |
| flat-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-500/off/mount-active | full | 24 | null | 관측되지 않음 | 0.0861459973775709 | null / null | null / null |
| flat-500/off/mount-active-nogc | full | 24 | null | 기록 | 0.11043699422225473 | null / null | null / null |
| flat-500/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.019519999999602078 | null / null | null / null |
| flat-500/off/mount-wall-nogc | full | 24 | null | 기록 | 0.03614599999946222 | null / null | null / null |
| flat-500/off/profiler-mount | full | 24 | null | 기록 | 0.011737999932620369 | null / null | null / null |
| flat-500/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.08517549984117068 | null / null | null / null |
| flat-500/off/profiler-update | full | 24 | null | 기록 | 0.0029249999711282726 | null / null | null / null |
| flat-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0022325000309137977 | 0 / 0 | 0.9857069999707164 / 0.9831424999329101 |
| flat-500/off/update-active | full | 24 | null | 관측되지 않음 | -0.012833386659622192 | null / null | null / null |
| flat-500/off/update-active-nogc | full | 24 | null | 기록 | -0.003164440393447876 | 0 / 0 | 3.36043643951416 / 3.362415999174118 |
| flat-500/off/update-wall | full | 24 | null | 관측되지 않음 | -0.014687500000491127 | null / null | null / null |
| flat-500/off/update-wall-nogc | full | 24 | null | 기록 | -0.0027915000000575674 | 0 / 0 | 3.355835000001207 / 3.3581455000012284 |
