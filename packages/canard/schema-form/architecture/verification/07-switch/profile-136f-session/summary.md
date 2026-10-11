# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 3460.759초이며 확인 측정은 0.000초이고 보고 계산은 0.046초입니다.
프로세스 준비 시간의 합은 52.093초이며 예열은 1136.789초, 강제 GC는 117.867초, 표본은 2213.803초, digest는 218.278초입니다.
시계 밖 minor GC는 16.574초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 4021.117초이며 확인 여유는 1200.000초이고 합계는 5221.117초입니다. 예산은 7099.933초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 3460.732초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-replace-200 | 879.933 |
| array-push-remove-100 | 829.935 |
| array-push-100 | 685.625 |
| flat-500 | 572.080 |
| array-100 | 485.309 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-100/off/mount-active | full | 24 | null | 관측되지 않음 | 0.29920899490207375 | null / null | null / null |
| array-100/off/mount-active-nogc | full | 24 | null | 기록 | 0.2901024844481981 | null / null | null / null |
| array-100/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.3419995000003837 | null / null | null / null |
| array-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.22752100000025166 | null / null | null / null |
| array-100/off/profiler-mount | full | 24 | null | 기록 | 0.04356499999721564 | null / null | null / null |
| array-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.13939149992029343 | null / null | null / null |
| array-100/off/profiler-update | full | 24 | null | 기록 | -0.0046629999947072065 | null / null | null / null |
| array-100/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0006850000122540223 | 0 / 0 | 0.17438600000377846 / 0.17408650000061243 |
| array-100/off/update-active | full | 24 | null | 관측되지 않음 | -0.006333976984024048 | null / null | null / null |
| array-100/off/update-active-nogc | full | 24 | null | 기록 | 0.004875540733337402 | 0 / 0 | 0.5727089643478394 / 0.5651250183582306 |
| array-100/off/update-wall | full | 24 | null | 관측되지 않음 | -0.006250000000136424 | null / null | null / null |
| array-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.006041500000264932 | 0 / 0 | 0.5697289999998247 / 0.562624500000311 |
| array-push-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.03146341463414634 / 0.03153455284552845 | null / null |
| array-push-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.006208507427118093 | null / null | null / null |
| array-push-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.0032280006034852704 | null / null | 0.7474159635767137 / 0.7483544720125792 |
| array-push-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.010208999999576918 | null / null | null / null |
| array-push-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.0008340000013049576 | null / null | 3.2572499999987485 / 3.254312499999287 |
| array-push-100/off/profiler-mount | full | 24 | null | 기록 | -0.005206499999076186 | null / null | null / null |
| array-push-100/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0006090000179028721 | null / null | 0.5418359999894165 / 0.5423965000027238 |
| array-push-100/off/profiler-update | full | 24 | null | 기록 | -0.08898199992700029 | null / null | null / null |
| array-push-100/off/profiler-update-nogc | full | 24 | null | 기록 | 0.06712049994712288 | 0.03146341463414634 / 0.03153455284552845 | null / null |
| array-push-100/off/update-active | full | 24 | null | 관측되지 않음 | 0.09285220503807068 | null / null | null / null |
| array-push-100/off/update-active-nogc | full | 24 | null | 기록 | 0.07919222116470337 | 0.03146341463414634 / 0.03153455284552845 | null / null |
| array-push-100/off/update-wall | full | 24 | null | 관측되지 않음 | 0.09530800000470663 | null / null | null / null |
| array-push-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.07985000000280706 | 0.03146341463414634 / 0.03153455284552845 | null / null |
| array-push-remove-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-push-remove-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-push-remove-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.023648373983739836 / 0.022113821138211382 | null / null |
| array-push-remove-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.0033949885921629175 | null / null | null / null |
| array-push-remove-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.022751033195163473 | null / null | 0.7244374895099099 / 0.7352929716835206 |
| array-push-remove-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.004395500000100583 | null / null | null / null |
| array-push-remove-100/off/mount-wall-nogc | full | 24 | null | 기록 | -0.00408400000014808 | null / null | 3.231604000000516 / 3.2423329999983252 |
| array-push-remove-100/off/profiler-mount | full | 24 | null | 기록 | -0.0043060000000423315 | null / null | null / null |
| array-push-remove-100/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.004770000010466902 | null / null | 0.5378145000013319 / 0.5470819999736705 |
| array-push-remove-100/off/profiler-update | full | 24 | null | 기록 | -0.0067700000527111115 | null / null | null / null |
| array-push-remove-100/off/profiler-update-nogc | full | 24 | null | 기록 | -0.01424150005550473 | 0.023648373983739836 / 0.022113821138211382 | null / null |
| array-push-remove-100/off/update-active | full | 24 | null | 관측되지 않음 | 0.4162364602088928 | null / null | null / null |
| array-push-remove-100/off/update-active-nogc | full | 24 | null | 기록 | 0.7949422001838684 | 0.023648373983739836 / 0.022113821138211382 | null / null |
| array-push-remove-100/off/update-wall | full | 24 | null | 관측되지 않음 | 0.4028075000001081 | null / null | null / null |
| array-push-remove-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.7944695000160209 | 0.023648373983739836 / 0.022113821138211382 | null / null |
| array-replace-200/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| array-replace-200/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-replace-200/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 1 / 1 | null / null |
| array-replace-200/off/mount-active | full | 24 | null | 관측되지 않음 | 0.0007705112420808291 | null / null | null / null |
| array-replace-200/off/mount-active-nogc | full | 24 | null | 기록 | 0.00545702035742579 | null / null | 0.892645981586611 / 0.8872504899863998 |
| array-replace-200/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0017710000001898152 | null / null | null / null |
| array-replace-200/off/mount-wall-nogc | full | 24 | null | 기록 | 0.00566750000052707 | null / null | 3.3801665000000867 / 3.3774579999999332 |
| array-replace-200/off/profiler-mount | full | 24 | null | 기록 | 0.0020865000137746392 | null / null | null / null |
| array-replace-200/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.0023155000062615727 | null / null | 0.6419555000011314 / 0.639994500001194 |
| array-replace-200/off/profiler-update | full | 24 | null | 기록 | 0.5360734998816952 | null / null | null / null |
| array-replace-200/off/profiler-update-nogc | full | 24 | null | 기록 | 0.9414389998873958 | 1 / 1 | null / null |
| array-replace-200/off/update-active | full | 24 | null | 관측되지 않음 | 0.6157295405864716 | null / null | null / null |
| array-replace-200/off/update-active-nogc | full | 24 | null | 기록 | 1.4283335506916046 | 1 / 1 | null / null |
| array-replace-200/off/update-wall | full | 24 | null | 관측되지 않음 | 0.6154585000003863 | null / null | null / null |
| array-replace-200/off/update-wall-nogc | full | 24 | null | 기록 | 1.4284789999992427 | 1 / 1 | null / null |
| flat-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-500/off/mount-active | full | 24 | null | 관측되지 않음 | 0.2204364911231096 | null / null | null / null |
| flat-500/off/mount-active-nogc | full | 24 | null | 기록 | 0.4338535543047328 | null / null | null / null |
| flat-500/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.1673129999996945 | null / null | null / null |
| flat-500/off/mount-wall-nogc | full | 24 | null | 기록 | 0.5824995000011768 | null / null | null / null |
| flat-500/off/profiler-mount | full | 24 | null | 기록 | 0.17292599994607372 | null / null | null / null |
| flat-500/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.15394799986825092 | null / null | null / null |
| flat-500/off/profiler-update | full | 24 | null | 기록 | 0.008811499999410444 | null / null | null / null |
| flat-500/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0032550000705668936 | 0 / 0 | 0.9816324999865174 / 0.9833895000092525 |
| flat-500/off/update-active | full | 24 | null | 관측되지 않음 | 0.030270367860794067 | null / null | null / null |
| flat-500/off/update-active-nogc | full | 24 | null | 기록 | 0.034457653760910034 | 0 / 0 | 3.3949374854564667 / 3.361355572938919 |
| flat-500/off/update-wall | full | 24 | null | 관측되지 않음 | 0.02966649999962101 | null / null | null / null |
| flat-500/off/update-wall-nogc | full | 24 | null | 기록 | 0.032541999999921245 | 0 / 0 | 3.3916454999989583 / 3.3576680000014676 |
