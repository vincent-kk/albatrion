# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 4438.899초이며 확인 측정은 0.000초이고 보고 계산은 0.048초입니다.
프로세스 준비 시간의 합은 62.418초이며 예열은 1459.939초, 강제 GC는 145.906초, 표본은 2844.433초, digest는 289.692초입니다.
시계 밖 minor GC는 20.270초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 4021.117초이며 확인 여유는 1200.000초이고 합계는 5221.117초입니다. 예산은 7099.930초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 4438.856초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-push-remove-100 | 1146.322 |
| array-replace-200 | 1040.350 |
| array-push-100 | 948.983 |
| flat-500 | 697.234 |
| array-100 | 596.203 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-100/off/mount-active | full | 24 | null | 관측되지 않음 | 2.037230013919725 | null / null | null / null |
| array-100/off/mount-active-nogc | full | 24 | null | 기록 | 1.2372289712993734 | null / null | null / null |
| array-100/off/mount-wall | full | 24 | null | 관측되지 않음 | 2.0238750000003165 | null / null | null / null |
| array-100/off/mount-wall-nogc | full | 24 | null | 기록 | 1.318875000000844 | null / null | null / null |
| array-100/off/profiler-mount | full | 24 | null | 기록 | 0.13512150000497058 | null / null | null / null |
| array-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.4338110000016968 | null / null | null / null |
| array-100/off/profiler-update | full | 24 | null | 기록 | 0.00738749999754873 | null / null | null / null |
| array-100/off/profiler-update-nogc | full | 24 | null | 기록 | 0.006049000003258698 | 0 / 0 | 0.2434754999985671 / 0.23725349999403988 |
| array-100/off/update-active | full | 24 | null | 관측되지 않음 | 0.02112448215484619 | null / null | null / null |
| array-100/off/update-active-nogc | full | 24 | null | 기록 | 0.012249499559402466 | 0 / 0 | 0.781603991985321 / 0.7716664969921112 |
| array-100/off/update-wall | full | 24 | null | 관측되지 않음 | 0.021187999999710883 | null / null | null / null |
| array-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.013146000000233471 | 0 / 0 | 0.7769374999998035 / 0.7670834999998988 |
| array-push-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.03145325203252033 / 0.03142276422764228 | null / null |
| array-push-100/off/mount-active | full | 24 | null | 관측되지 않음 | 0.04770844569657129 | null / null | null / null |
| array-push-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.004541041335869522 | null / null | 1.0173760406414658 / 1.0109380148378477 |
| array-push-100/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.014917500000592554 | null / null | null / null |
| array-push-100/off/mount-wall-nogc | full | 24 | null | 기록 | -0.008958499999607739 | null / null | 3.2649160000000848 / 3.2630000000008295 |
| array-push-100/off/profiler-mount | full | 24 | null | 기록 | 0.034183999994638725 | null / null | null / null |
| array-push-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.000269999994088721 | null / null | 0.7112870000091789 / 0.7098750000095606 |
| array-push-100/off/profiler-update | full | 24 | null | 기록 | 1.1617150000552101 | null / null | null / null |
| array-push-100/off/profiler-update-nogc | full | 24 | null | 기록 | 0.6068160001941578 | 0.03145325203252033 / 0.03142276422764228 | null / null |
| array-push-100/off/update-active | full | 24 | null | 관측되지 않음 | 3.0841661393642426 | null / null | null / null |
| array-push-100/off/update-active-nogc | full | 24 | null | 기록 | 1.582872062921524 | 0.03145325203252033 / 0.03142276422764228 | null / null |
| array-push-100/off/update-wall | full | 24 | null | 관측되지 않음 | 3.090383499996733 | null / null | null / null |
| array-push-100/off/update-wall-nogc | full | 24 | null | 기록 | 1.5984314999977869 | 0.03145325203252033 / 0.03142276422764228 | null / null |
| array-push-remove-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-remove-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.023638211382113822 / 0.020807926829268294 | null / null |
| array-push-remove-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.01454098430031081 | null / null | null / null |
| array-push-remove-100/off/mount-active-nogc | full | 24 | null | 기록 | 0.034896969298642944 | null / null | 0.9189165028619755 / 0.9004374994310638 |
| array-push-remove-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.0150420000009035 | null / null | null / null |
| array-push-remove-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.01777099999890197 | null / null | 3.172625000000153 / 3.1569795000013983 |
| array-push-remove-100/off/profiler-mount | full | 24 | null | 기록 | -0.010474000010162854 | null / null | null / null |
| array-push-remove-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.012653999994654441 | null / null | 0.6539414999951987 / 0.6421225000012782 |
| array-push-remove-100/off/profiler-update | full | 24 | null | 기록 | 0.9036350000860693 | null / null | null / null |
| array-push-remove-100/off/profiler-update-nogc | full | 24 | null | 기록 | 1.783702999668094 | 0.023638211382113822 / 0.020807926829268294 | null / null |
| array-push-remove-100/off/update-active | full | 24 | null | 관측되지 않음 | 3.2353199422359467 | null / null | null / null |
| array-push-remove-100/off/update-active-nogc | full | 24 | null | 기록 | 5.180514216423035 | 0.023638211382113822 / 0.020807926829268294 | null / null |
| array-push-remove-100/off/update-wall | full | 24 | null | 관측되지 않음 | 3.196834500000932 | null / null | null / null |
| array-push-remove-100/off/update-wall-nogc | full | 24 | null | 기록 | 5.145913000006658 | 0.023638211382113822 / 0.020807926829268294 | null / null |
| array-replace-200/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-replace-200/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 1 / 1 | null / null |
| array-replace-200/off/mount-active | full | 24 | null | 관측되지 않음 | -0.03572947296697748 | null / null | null / null |
| array-replace-200/off/mount-active-nogc | full | 24 | null | 기록 | -0.0318120238780466 | null / null | 1.1104165065826237 / 1.1101254774412155 |
| array-replace-200/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.009000000000924047 | null / null | null / null |
| array-replace-200/off/mount-wall-nogc | full | 24 | null | 기록 | -0.017894999999043648 | null / null | 3.303083000000697 / 3.304979500002446 |
| array-replace-200/off/profiler-mount | full | 24 | null | 기록 | -0.014279999993050296 | null / null | null / null |
| array-replace-200/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.0032265000118059106 | null / null | 0.7570235000112007 / 0.7532765000014479 |
| array-replace-200/off/profiler-update | full | 24 | null | 기록 | 2.2774640001907756 | null / null | null / null |
| array-replace-200/off/profiler-update-nogc | full | 24 | null | 기록 | 1.1620640000301137 | 1 / 1 | null / null |
| array-replace-200/off/update-active | full | 24 | null | 관측되지 않음 | 2.001645505428314 | null / null | null / null |
| array-replace-200/off/update-active-nogc | full | 24 | null | 기록 | 2.9766460061073303 | 1 / 1 | null / null |
| array-replace-200/off/update-wall | full | 24 | null | 관측되지 않음 | 2.002500499999769 | null / null | null / null |
| array-replace-200/off/update-wall-nogc | full | 24 | null | 기록 | 2.9816254999986995 | 1 / 1 | null / null |
| flat-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0.0001016260162601626 | 10 / 10 |
| flat-500/off/mount-active | full | 24 | null | 관측되지 않음 | 1.9795844692991977 | null / null | null / null |
| flat-500/off/mount-active-nogc | full | 24 | null | 기록 | 1.5502090478303217 | null / null | null / null |
| flat-500/off/mount-wall | full | 24 | null | 관측되지 않음 | 1.9758959999994659 | null / null | null / null |
| flat-500/off/mount-wall-nogc | full | 24 | null | 기록 | 1.1945829999986017 | null / null | null / null |
| flat-500/off/profiler-mount | full | 24 | null | 기록 | 0.5844970000350713 | null / null | null / null |
| flat-500/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.29810000009729265 | null / null | null / null |
| flat-500/off/profiler-update | full | 24 | null | 기록 | 0.09165100000791426 | null / null | null / null |
| flat-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.05584600009115093 | 0 / 0.0001016260162601626 | 1.5316970000985748 / 1.482206999882692 |
| flat-500/off/update-active | full | 24 | null | 관측되지 않음 | 0.49935412406921387 | null / null | null / null |
| flat-500/off/update-active-nogc | full | 24 | null | 기록 | 0.21047654747962952 | 0 / 0.0001016260162601626 | 4.840665400028229 / 4.659792125225067 |
| flat-500/off/update-wall | full | 24 | null | 관측되지 않음 | 0.49966749999975946 | null / null | null / null |
| flat-500/off/update-wall-nogc | full | 24 | null | 기록 | 0.2087100000007922 | 0 / 0.0001016260162601626 | 4.832957499998884 / 4.6542500000014115 |
