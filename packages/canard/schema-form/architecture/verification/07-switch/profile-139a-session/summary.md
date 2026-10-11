# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 3372.392초이며 확인 측정은 0.000초이고 보고 계산은 0.096초입니다.
프로세스 준비 시간의 합은 124.264초이며 예열은 1069.240초, 강제 GC는 214.768초, 표본은 2112.795초, digest는 399.332초입니다.
시계 밖 minor GC는 28.833초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 3697.821초이며 확인 여유는 1200.000초이고 합계는 4897.821초입니다. 예산은 7099.939초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 3372.359초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2359.515 |
| flat-100 | 157.914 |
| nested-d3-f4 | 144.187 |
| flat-50 | 110.833 |
| sample-3 | 104.993 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-500/off/mount-active | full | 24 | null | 관측되지 않음 | -0.1595210153154767 | null / null | null / null |
| array-500/off/mount-active-nogc | full | 24 | null | 기록 | 0.25031250694883056 | null / null | null / null |
| array-500/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.720624500001577 | null / null | null / null |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | 0.44827100000475184 | null / null | null / null |
| array-500/off/profiler-mount | full | 24 | null | 기록 | -0.09268149995114072 | null / null | null / null |
| array-500/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.2373959996366466 | null / null | null / null |
| array-500/off/profiler-update | full | 24 | null | 기록 | 0.0005104999809191213 | null / null | null / null |
| array-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.00023150004562921822 | 0 / 0 | 0.32866900003136834 / 0.3296509999927366 |
| array-500/off/update-active | full | 24 | null | 관측되지 않음 | 0.005000501871109009 | null / null | null / null |
| array-500/off/update-active-nogc | full | 24 | null | 기록 | -0.0005624890327453613 | 0 / 0 | 0.9175204932689667 / 0.9183334708213806 |
| array-500/off/update-wall | full | 24 | null | 관측되지 않음 | 0.008645500000056927 | null / null | null / null |
| array-500/off/update-wall-nogc | full | 24 | null | 기록 | -0.0004374999989522621 | 0 / 0 | 0.9148545000025479 / 0.9156455000011192 |
| computed-visible-derived/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| computed-visible-derived/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0040650406504065045 / 0.00508130081300813 | 3 / 3 |
| computed-visible-derived/off/mount-active | full | 24 | null | 관측되지 않음 | -0.01139701236155588 | null / null | null / null |
| computed-visible-derived/off/mount-active-nogc | full | 24 | null | 기록 | -0.007519028316551157 | null / null | 1.0934169782485696 / 1.1022500356522187 |
| computed-visible-derived/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.013437499999952252 | null / null | null / null |
| computed-visible-derived/off/mount-wall-nogc | full | 24 | null | 기록 | 0.0048330000000760265 | null / null | 3.593499999999949 / 3.6022089999999025 |
| computed-visible-derived/off/profiler-mount | full | 24 | null | 기록 | -0.010663999999508178 | null / null | null / null |
| computed-visible-derived/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.006642999999030508 | null / null | 0.8770060000010744 / 0.8819989999992686 |
| computed-visible-derived/off/profiler-update | full | 24 | null | 기록 | -0.012208999999586467 | null / null | null / null |
| computed-visible-derived/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0031699999988177296 | 0.0040650406504065045 / 0.00508130081300813 | 0.3865019999991546 / 0.3879620000002433 |
| computed-visible-derived/off/update-active | full | 24 | null | 관측되지 않음 | -0.04264611005783081 | null / null | null / null |
| computed-visible-derived/off/update-active-nogc | full | 24 | null | 기록 | -0.006271988153457642 | 0.0040650406504065045 / 0.00508130081300813 | 1.0652709901332855 / 1.0639169812202454 |
| computed-visible-derived/off/update-wall | full | 24 | null | 관측되지 않음 | -0.04245800000023792 | null / null | null / null |
| computed-visible-derived/off/update-wall-nogc | full | 24 | null | 기록 | -0.006187000000181797 | 0.0040650406504065045 / 0.00508130081300813 | 1.0636875000000146 / 1.0625 |
| flat-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.0245000064925307 | null / null | null / null |
| flat-100/off/mount-active-nogc | full | 24 | null | 기록 | -0.004999993471301423 | null / null | 9.353373980815832 / 9.378666507629077 |
| flat-100/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.045250000000010004 | null / null | null / null |
| flat-100/off/mount-wall-nogc | full | 24 | null | 기록 | -0.02708400000005895 | null / null | 11.84683300000006 / 11.872812999999724 |
| flat-100/off/profiler-mount | full | 24 | null | 기록 | -0.01662500000156797 | null / null | null / null |
| flat-100/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.03939749999653941 | null / null | 8.10620500001005 / 8.11925700001234 |
| flat-100/off/profiler-update | full | 24 | null | 기록 | -0.005303500005084061 | null / null | null / null |
| flat-100/off/profiler-update-nogc | full | 24 | null | 기록 | -0.003058500004499365 | 0 / 0 | 0.5769174999966253 / 0.5798399999962385 |
| flat-100/off/update-active | full | 24 | null | 관측되지 않음 | -0.006896942853927612 | null / null | null / null |
| flat-100/off/update-active-nogc | full | 24 | null | 기록 | -0.004666507244110107 | 0 / 0 | 1.9722715318202972 / 1.9731254577636719 |
| flat-100/off/update-wall | full | 24 | null | 관측되지 않음 | -0.006292000000030384 | null / null | null / null |
| flat-100/off/update-wall-nogc | full | 24 | null | 기록 | -0.004707499999767606 | 0 / 0 | 1.9678569999998672 / 1.9694375000005948 |
| flat-50/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-50/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0002032520325203252 / 0.0002032520325203252 | 10 / 10 |
| flat-50/off/mount-active | full | 24 | null | 관측되지 않음 | -0.016333024135519736 | null / null | null / null |
| flat-50/off/mount-active-nogc | full | 24 | null | 기록 | -0.007000034149086787 | null / null | 4.960187519605711 / 4.958791011920766 |
| flat-50/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.0012915000000930377 | null / null | null / null |
| flat-50/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0028965000001335284 | null / null | 7.462354499999947 / 7.462167000000136 |
| flat-50/off/profiler-mount | full | 24 | null | 기록 | -0.007249500001591969 | null / null | null / null |
| flat-50/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0006934999967143085 | null / null | 4.295990999994956 / 4.294626000007611 |
| flat-50/off/profiler-update | full | 24 | null | 기록 | 0.005787499999769352 | null / null | null / null |
| flat-50/off/profiler-update-nogc | full | 24 | null | 기록 | -0.001513499994302947 | 0.0002032520325203252 / 0.0002032520325203252 | 0.5223225000004277 / 0.5219470000024558 |
| flat-50/off/update-active | full | 24 | null | 관측되지 않음 | -0.0027073919773101807 | null / null | null / null |
| flat-50/off/update-active-nogc | full | 24 | null | 기록 | -0.0005200505256652832 | 0.0002032520325203252 / 0.0002032520325203252 | 1.7748944759368896 / 1.7754175066947937 |
| flat-50/off/update-wall | full | 24 | null | 관측되지 않음 | -0.0014599999998381463 | null / null | null / null |
| flat-50/off/update-wall-nogc | full | 24 | null | 기록 | -0.0004579999991847217 | 0.0002032520325203252 / 0.0002032520325203252 | 1.7713325000001987 / 1.772083500000008 |
| nested-d3-f4/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| nested-d3-f4/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0001016260162601626 / 0.0001016260162601626 | 10 / 10 |
| nested-d3-f4/off/mount-active | full | 24 | null | 관측되지 않음 | -0.04881249194920656 | null / null | null / null |
| nested-d3-f4/off/mount-active-nogc | full | 24 | null | 기록 | -0.040165998641896294 | null / null | 7.801541027545909 / 7.854291965190896 |
| nested-d3-f4/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.03422899999998208 | null / null | null / null |
| nested-d3-f4/off/mount-wall-nogc | full | 24 | null | 기록 | -0.025333499999987907 | null / null | 10.296249999999873 / 10.348417000000154 |
| nested-d3-f4/off/profiler-mount | full | 24 | null | 기록 | -0.025520499999288404 | null / null | null / null |
| nested-d3-f4/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0233049999958439 | null / null | 6.657010999980685 / 6.708919000004244 |
| nested-d3-f4/off/profiler-update | full | 24 | null | 기록 | -0.0028794999995511716 | null / null | null / null |
| nested-d3-f4/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0007940000052713003 | 0.0001016260162601626 / 0.0001016260162601626 | 0.6962849999895298 / 0.6986350000001949 |
| nested-d3-f4/off/update-active | full | 24 | null | 관측되지 않음 | -0.00031247735023498535 | null / null | null / null |
| nested-d3-f4/off/update-active-nogc | full | 24 | null | 기록 | -0.003063589334487915 | 0.0001016260162601626 / 0.0001016260162601626 | 2.1059190034866333 / 2.1094170212745667 |
| nested-d3-f4/off/update-wall | full | 24 | null | 관측되지 않음 | -0.00026950000005854235 | null / null | null / null |
| nested-d3-f4/off/update-wall-nogc | full | 24 | null | 기록 | -0.0039395000003423775 | 0.0001016260162601626 / 0.0001016260162601626 | 2.1016260000005786 / 2.1045829999993657 |
| oneOf-10/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-10/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.001524390243902439 / 0.001524390243902439 | 2 / 2 |
| oneOf-10/off/mount-active | full | 24 | null | 관측되지 않음 | 0.005415497413650883 | null / null | null / null |
| oneOf-10/off/mount-active-nogc | full | 24 | null | 기록 | 0.005125008399943454 | null / null | 1.5162920166894764 / 1.5146660071526412 |
| oneOf-10/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0028755000000728614 | null / null | null / null |
| oneOf-10/off/mount-wall-nogc | full | 24 | null | 기록 | -0.00529149999999845 | null / null | 4.017499999999927 / 4.019084000000021 |
| oneOf-10/off/profiler-mount | full | 24 | null | 기록 | 0.011228499999560881 | null / null | null / null |
| oneOf-10/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0017055000006394039 | null / null | 1.272084000000632 / 1.2708229999996092 |
| oneOf-10/off/profiler-update | full | 24 | null | 기록 | 0.020930999999507094 | null / null | null / null |
| oneOf-10/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0013409999992290977 | 0.001524390243902439 / 0.001524390243902439 | 0.788650000003372 / 0.7921679999994922 |
| oneOf-10/off/update-active | full | 24 | null | 관측되지 않음 | 0.04387500882148743 | null / null | null / null |
| oneOf-10/off/update-active-nogc | full | 24 | null | 기록 | 0.006249487400054932 | 0.001524390243902439 / 0.001524390243902439 | 1.8723320364952087 / 1.8740419745445251 |
| oneOf-10/off/update-wall | full | 24 | null | 관측되지 않음 | 0.04358350000006794 | null / null | null / null |
| oneOf-10/off/update-wall-nogc | full | 24 | null | 기록 | 0.004541999999901236 | 0.001524390243902439 / 0.001524390243902439 | 1.8704999999999927 / 1.8722090000001117 |
| oneOf-20/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-20/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0010162601626016261 / 0.0020325203252032522 | 2 / 2 |
| oneOf-20/off/mount-active | full | 24 | null | 관측되지 않음 | -0.0015829892157910308 | null / null | null / null |
| oneOf-20/off/mount-active-nogc | full | 24 | null | 기록 | -0.012062039522106716 | null / null | 1.9242289714452454 / 1.9409169895096738 |
| oneOf-20/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.00016599999986510738 | null / null | null / null |
| oneOf-20/off/mount-wall-nogc | full | 24 | null | 기록 | -0.007604000000014821 | null / null | 4.42406300000016 / 4.442832999999837 |
| oneOf-20/off/profiler-mount | full | 24 | null | 기록 | -0.008100999999896885 | null / null | null / null |
| oneOf-20/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.013807000001065717 | null / null | 1.6702954999987014 / 1.6809920000009697 |
| oneOf-20/off/profiler-update | full | 24 | null | 기록 | 0.0064145000001190056 | null / null | null / null |
| oneOf-20/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0017245000011598677 | 0.0010162601626016261 / 0.0020325203252032522 | 0.7987960000007206 / 0.798158500000568 |
| oneOf-20/off/update-active | full | 24 | null | 관측되지 않음 | -0.0184364914894104 | null / null | null / null |
| oneOf-20/off/update-active-nogc | full | 24 | null | 기록 | -0.013687998056411743 | 0.0010162601626016261 / 0.0020325203252032522 | 2.079353988170624 / 2.0705829858779907 |
| oneOf-20/off/update-wall | full | 24 | null | 관측되지 않음 | -0.01843750000006139 | null / null | null / null |
| oneOf-20/off/update-wall-nogc | full | 24 | null | 기록 | -0.014042500000073233 | 0.0010162601626016261 / 0.0020325203252032522 | 2.0782914999999775 / 2.0691044999999804 |
| oneOf-5/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-5/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0020325203252032522 / 0 | 2 / 2 |
| oneOf-5/off/mount-active | full | 24 | null | 관측되지 않음 | 0.0011869861717741514 | null / null | null / null |
| oneOf-5/off/mount-active-nogc | full | 24 | null | 기록 | 0.003665487308524007 | null / null | 1.345874981256543 / 1.3386670042914375 |
| oneOf-5/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.0003124999999499778 | null / null | null / null |
| oneOf-5/off/mount-wall-nogc | full | 24 | null | 기록 | 0.0088749999998754 | null / null | 3.848457999999937 / 3.8405830000001515 |
| oneOf-5/off/profiler-mount | full | 24 | null | 기록 | 0.01471500000013748 | null / null | null / null |
| oneOf-5/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.001698499998724401 | null / null | 1.11005499999942 / 1.1045119999996587 |
| oneOf-5/off/profiler-update | full | 24 | null | 기록 | -0.001522499999396132 | null / null | null / null |
| oneOf-5/off/profiler-update-nogc | full | 24 | null | 기록 | -0.008394499999440086 | 0.0020325203252032522 / 0 | 0.7972905000017363 / 0.8022465000016155 |
| oneOf-5/off/update-active | full | 24 | null | 관측되지 않음 | -0.012375026941299438 | null / null | null / null |
| oneOf-5/off/update-active-nogc | full | 24 | null | 기록 | -0.007728546857833862 | 0.0020325203252032522 / 0 | 1.8080835044384003 / 1.8107705116271973 |
| oneOf-5/off/update-wall | full | 24 | null | 관측되지 않음 | -0.013438500000063414 | null / null | null / null |
| oneOf-5/off/update-wall-nogc | full | 24 | null | 기록 | -0.007854999999949541 | 0.0020325203252032522 / 0 | 1.8059590000000298 / 1.8091875000000073 |
| sample-0/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-0/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| sample-0/off/mount-active | full | 24 | null | 관측되지 않음 | 0.004771022594439955 | null / null | null / null |
| sample-0/off/mount-active-nogc | full | 24 | null | 기록 | 0.006605026134536729 | null / null | 0.8190420386238202 / 0.8293759654845871 |
| sample-0/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.000582999999949152 | null / null | null / null |
| sample-0/off/mount-wall-nogc | full | 24 | null | 기록 | -0.001771000000019285 | null / null | 3.3197289999999953 / 3.3273329999999532 |
| sample-0/off/profiler-mount | full | 24 | null | 기록 | 0.007262000000537228 | null / null | null / null |
| sample-0/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.00431449999933875 | null / null | 0.5940200000006826 / 0.5990040000006047 |
| sample-0/off/profiler-update | full | 24 | null | 기록 | 0.00056499999936932 | null / null | null / null |
| sample-0/off/profiler-update-nogc | full | 24 | null | 기록 | 0.00018599999953039514 | 0 / 0 | 0.10749699999894347 / 0.10799699999984114 |
| sample-0/off/update-active | full | 24 | null | 관측되지 않음 | -0.0011459887027740479 | null / null | null / null |
| sample-0/off/update-active-nogc | full | 24 | null | 기록 | 0.0020630359649658203 | 0 / 0 | 0.3205629885196686 / 0.3227494955062866 |
| sample-0/off/update-wall | full | 24 | null | 관측되지 않음 | -0.0024374999999849933 | null / null | null / null |
| sample-0/off/update-wall-nogc | full | 24 | null | 기록 | 0.0027084999999260617 | 0 / 0 | 0.3188745000001063 / 0.32122900000001664 |
| sample-1/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-1/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.01016260162601626 / 0.008130081300813009 | 1 / 1 |
| sample-1/off/mount-active | full | 24 | null | 관측되지 않음 | 0.004040489160530569 | null / null | null / null |
| sample-1/off/mount-active-nogc | full | 24 | null | 기록 | 0.002354514488274617 | null / null | 1.5877070183029218 / 1.6044580007152263 |
| sample-1/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.01179150000007212 | null / null | null / null |
| sample-1/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0066254999998136554 | null / null | 4.089457999999922 / 4.10129100000006 |
| sample-1/off/profiler-mount | full | 24 | null | 기록 | -0.008041500000558699 | null / null | null / null |
| sample-1/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.013629499999865402 | null / null | 1.2742910000017673 / 1.2854289999984303 |
| sample-1/off/profiler-update | full | 24 | null | 기록 | 0.0014574999996170845 | null / null | null / null |
| sample-1/off/profiler-update-nogc | full | 24 | null | 기록 | 0.001281000000858512 | 0.01016260162601626 / 0.008130081300813009 | 0.11410049999960847 / 0.11427799999967192 |
| sample-1/off/update-active | full | 24 | null | 관측되지 않음 | 0.0016044378280639648 | null / null | null / null |
| sample-1/off/update-active-nogc | full | 24 | null | 기록 | 0.0012919902801513672 | 0.01016260162601626 / 0.008130081300813009 | 0.3442085087299347 / 0.34635451436042786 |
| sample-1/off/update-wall | full | 24 | null | 관측되지 않음 | 0.0017704999999068605 | null / null | null / null |
| sample-1/off/update-wall-nogc | full | 24 | null | 기록 | 0.0013960000001134176 | 0.01016260162601626 / 0.008130081300813009 | 0.34243800000001556 / 0.34456199999999626 |
| sample-2/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-2/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0010162601626016261 / 0 | 1 / 1 |
| sample-2/off/mount-active | full | 24 | null | 관측되지 않음 | 0.009686010196674033 | null / null | null / null |
| sample-2/off/mount-active-nogc | full | 24 | null | 기록 | -0.03608197089386067 | null / null | 1.3545820326080502 / 1.424645991270097 |
| sample-2/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.016207999999949152 | null / null | null / null |
| sample-2/off/mount-wall-nogc | full | 24 | null | 기록 | -0.02975000000003547 | null / null | 3.8563329999999496 / 3.921791999999982 |
| sample-2/off/profiler-mount | full | 24 | null | 기록 | 0.0037180000005037073 | null / null | null / null |
| sample-2/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.029940000000237887 | null / null | 1.0848690000016177 / 1.1396704999988287 |
| sample-2/off/profiler-update | full | 24 | null | 기록 | 0.00035099999988119635 | null / null | null / null |
| sample-2/off/profiler-update-nogc | full | 24 | null | 기록 | -0.00485200000059649 | 0.0010162601626016261 / 0 | 0.11933300000009694 / 0.12441849999891019 |
| sample-2/off/update-active | full | 24 | null | 관측되지 않음 | 0.0012919604778289795 | null / null | null / null |
| sample-2/off/update-active-nogc | full | 24 | null | 기록 | -0.007332473993301392 | 0.0010162601626016261 / 0 | 0.3442090153694153 / 0.35604149103164673 |
| sample-2/off/update-wall | full | 24 | null | 관측되지 않음 | 0.0013125000000400178 | null / null | null / null |
| sample-2/off/update-wall-nogc | full | 24 | null | 기록 | -0.007499499999994441 | 0.0010162601626016261 / 0 | 0.3426670000001195 / 0.354208500000027 |
| sample-3/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-3/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0020325203252032522 / 0.0010162601626016261 | 1 / 1 |
| sample-3/off/mount-active | full | 24 | null | 관측되지 않음 | -0.006520984264341223 | null / null | null / null |
| sample-3/off/mount-active-nogc | full | 24 | null | 기록 | 0.015437529949167583 | null / null | 5.406499487876886 / 5.373895501283641 |
| sample-3/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.01383400000003121 | null / null | null / null |
| sample-3/off/mount-wall-nogc | full | 24 | null | 기록 | 0.025917499999991378 | null / null | 7.896979499999929 / 7.867458499999998 |
| sample-3/off/profiler-mount | full | 24 | null | 기록 | -0.0298244999992221 | null / null | null / null |
| sample-3/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.015590499996392282 | null / null | 4.638674000002311 / 4.602115500001901 |
| sample-3/off/profiler-update | full | 24 | null | 기록 | -0.0008740000015450278 | null / null | null / null |
| sample-3/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0021485000014536126 | 0.0020325203252032522 / 0.0010162601626016261 | 0.1250014999995983 / 0.12312100000031023 |
| sample-3/off/update-active | full | 24 | null | 관측되지 않음 | 0.00006350874900817871 | null / null | null / null |
| sample-3/off/update-active-nogc | full | 24 | null | 기록 | 0.003209024667739868 | 0.0020325203252032522 / 0.0010162601626016261 | 0.38960403203964233 / 0.38520801067352295 |
| sample-3/off/update-wall | full | 24 | null | 관측되지 않음 | 0.00012499999996862243 | null / null | null / null |
| sample-3/off/update-wall-nogc | full | 24 | null | 기록 | 0.0031675000000177533 | 0.0020325203252032522 / 0.0010162601626016261 | 0.38733350000006794 / 0.3830830000001697 |
