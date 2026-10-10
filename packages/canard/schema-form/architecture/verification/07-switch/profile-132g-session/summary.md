# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 3163.703초이며 확인 측정은 0.000초이고 보고 계산은 0.041초입니다.
프로세스 준비 시간의 합은 43.059초이며 예열은 1027.829초, 강제 GC는 115.750초, 표본은 2052.613초, digest는 439.327초입니다.
시계 밖 minor GC는 17.138초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 3204.244초이며 확인 여유는 1200.000초이고 합계는 4404.244초입니다. 예산은 7099.936초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 3163.669초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2474.616 |
| array-100 | 510.774 |
| sample-3 | 108.549 |
| sample-2 | 62.906 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.15077103161797822 | null / null | null / null |
| array-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.08020800133863304 | null / null | null / null |
| array-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.1564375000000382 | null / null | null / null |
| array-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.17558350000035716 | null / null | null / null |
| array-100/off/profiler-mount | full | 24 | null | 기록 | -0.12072750001766508 | null / null | null / null |
| array-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.1476370000436873 | null / null | null / null |
| array-100/off/profiler-update | full | 24 | null | 기록 | 0.0001484999970671197 | null / null | null / null |
| array-100/off/profiler-update-nogc | full | 24 | null | 기록 | 0.00192049999941446 | 0 / 0 | 0.1945670000059181 / 0.19427099998756603 |
| array-100/off/update-active | full | 24 | null | 관측되지 않음 | 0.00014597177505493164 | null / null | null / null |
| array-100/off/update-active-nogc | full | 24 | null | 기록 | 0.0002505183219909668 | 0 / 0 | 0.6269794702529907 / 0.6298330128192902 |
| array-100/off/update-wall | full | 24 | null | 관측되지 않음 | -0.0007915000001048611 | null / null | null / null |
| array-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.00024999999959618435 | 0 / 0 | 0.6243129999993471 / 0.6267710000001898 |
| array-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-500/off/mount-active | full | 24 | null | 관측되지 않음 | -1.3504375247948701 | null / null | null / null |
| array-500/off/mount-active-nogc | full | 24 | null | 기록 | -0.5665830335237843 | null / null | null / null |
| array-500/off/mount-wall | full | 24 | null | 관측되지 않음 | -1.3416885000006005 | null / null | null / null |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | -0.5427499999968859 | null / null | null / null |
| array-500/off/profiler-mount | full | 24 | null | 기록 | -0.5339299997131093 | null / null | null / null |
| array-500/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.911309499941126 | null / null | null / null |
| array-500/off/profiler-update | full | 24 | null | 기록 | 0.0018095000305038411 | null / null | null / null |
| array-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0025729999688337557 | 0 / 0 | 0.34518850006134016 / 0.3440294999672915 |
| array-500/off/update-active | full | 24 | null | 관측되지 않음 | 0.027124524116516113 | null / null | null / null |
| array-500/off/update-active-nogc | full | 24 | null | 기록 | -0.00031197071075439453 | 0 / 0 | 0.9743750095367432 / 0.9785415232181549 |
| array-500/off/update-wall | full | 24 | null | 관측되지 않음 | 0.026271000001543143 | null / null | null / null |
| array-500/off/update-wall-nogc | full | 24 | null | 기록 | 0.00010400000246590935 | 0 / 0 | 0.9711669999960577 / 0.9752294999998412 |
| sample-2/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-2/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0020325203252032522 / 0.007113821138211382 | 1 / 1 |
| sample-2/off/mount-active | full | 24 | null | 관측되지 않음 | -0.0052080034847250545 | null / null | null / null |
| sample-2/off/mount-active-nogc | full | 24 | null | 기록 | -0.05893695193105941 | null / null | 1.5075205364780686 / 1.543458972930921 |
| sample-2/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.002791500000000724 | null / null | null / null |
| sample-2/off/mount-wall-nogc | full | 24 | null | 기록 | -0.06785449999983939 | null / null | 3.881979499999943 / 3.918999999999869 |
| sample-2/off/profiler-mount | full | 24 | null | 기록 | 0.003935000000012678 | null / null | null / null |
| sample-2/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.058733000001780056 | null / null | 1.20186899999851 / 1.2269360000025245 |
| sample-2/off/profiler-update | full | 24 | null | 기록 | -0.000916000000358963 | null / null | null / null |
| sample-2/off/profiler-update-nogc | full | 24 | null | 기록 | -0.007896999999729815 | 0.0020325203252032522 / 0.007113821138211382 | 0.1308549999995421 / 0.13503699999932905 |
| sample-2/off/update-active | full | 24 | null | 관측되지 않음 | -0.0021245181560516357 | null / null | null / null |
| sample-2/off/update-active-nogc | full | 24 | null | 기록 | -0.018750011920928955 | 0.0020325203252032522 / 0.007113821138211382 | 0.37760400772094727 / 0.3871670365333557 |
| sample-2/off/update-wall | full | 24 | null | 관측되지 않음 | -0.002000499999951444 | null / null | null / null |
| sample-2/off/update-wall-nogc | full | 24 | null | 기록 | -0.018479499999898508 | 0.0020325203252032522 / 0.007113821138211382 | 0.37608349999993607 / 0.38537499999983993 |
| sample-3/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-3/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0010162601626016261 / 0 | 1 / 1 |
| sample-3/off/mount-active | full | 24 | null | 관측되지 않음 | 0.005436970857601864 | null / null | null / null |
| sample-3/off/mount-active-nogc | full | 24 | null | 기록 | 0.031853530004468666 | null / null | 5.548791492462215 / 5.531083988611158 |
| sample-3/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.027417000000014013 | null / null | null / null |
| sample-3/off/mount-wall-nogc | full | 24 | null | 기록 | 0.023896499999978005 | null / null | 7.9278750000000855 / 7.922020499999917 |
| sample-3/off/profiler-mount | full | 24 | null | 기록 | -0.030449999995482813 | null / null | null / null |
| sample-3/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.00014300000395905954 | null / null | 4.738562000001252 / 4.731387000004361 |
| sample-3/off/profiler-update | full | 24 | null | 기록 | -0.0027675000001181616 | null / null | null / null |
| sample-3/off/profiler-update-nogc | full | 24 | null | 기록 | 0.002087500000129694 | 0.0010162601626016261 / 0 | 0.13141500000074302 / 0.12985100000094008 |
| sample-3/off/update-active | full | 24 | null | 관측되지 않음 | -0.02214553952217102 | null / null | null / null |
| sample-3/off/update-active-nogc | full | 24 | null | 기록 | 0.0031249821186065674 | 0.0010162601626016261 / 0 | 0.41850000619888306 / 0.4153749942779541 |
| sample-3/off/update-wall | full | 24 | null | 관측되지 않음 | -0.02218750000002956 | null / null | null / null |
| sample-3/off/update-wall-nogc | full | 24 | null | 기록 | 0.0030209999999897263 | 0.0010162601626016261 / 0 | 0.4152090000000044 / 0.4132705000001806 |
