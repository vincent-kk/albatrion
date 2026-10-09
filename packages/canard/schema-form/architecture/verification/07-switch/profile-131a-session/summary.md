# 131 core 측정 세션 결과입니다.

세션 종류는 aa이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 1018.913초이며 확인 측정은 0.000초이고 보고 계산은 1.912초입니다.
프로세스 준비 시간의 합은 53.130초이며 예열은 300.034초, 강제 GC는 289.082초, 표본은 602.585초, digest는 16.580초입니다.
시계 밖 minor GC는 18.338초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 165개입니다. 계수가 없으면 전체 블록을 사용하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 A/A 기록입니다. 축소 비표시 행은 줄인 검출력에서 관측되지 않음으로 해석합니다.
실행 전 추정은 1021.786초이며 확인 여유는 1200.000초이고 합계는 2221.786초입니다. 예산은 7099.994초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 1018.902초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| oneOf-40 | 121.756 |
| if-then | 104.085 |
| oneOf-20 | 89.116 |
| oneOf-10 | 70.919 |
| oneOf-40 | 67.605 |

행별 기존 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-100/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0050835000000000186 | null / null | null / null |
| array-100/off/mount-nogc | reduced | 8 | null | 기록 | 0.001312500000000022 | null / null | 0.45325 / 0.45787500000000003 |
| array-100/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0025419999999999887 | null / null | null / null |
| array-100/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0025419999999999887 | null / null | null / null |
| array-100/off/update-first-nogc | reduced | 8 | null | 기록 | -0.0011465000000000017 | 0 / 0 | 0.064854 / 0.0661455 |
| array-100/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0003119999999999998 | null / null | null / null |
| array-100/off/update-later-nogc | reduced | 8 | null | 기록 | 0.0009375000000000008 | 0 / 0 | 0.06418750000000001 / 0.063937 |
| array-100/off/update-nogc | reduced | 8 | null | 기록 | -0.0011465000000000017 | 0 / 0 | 0.064854 / 0.0661455 |
| array-1000/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.018749500000000197 | null / null | null / null |
| array-1000/off/mount-nogc | reduced | 8 | null | 기록 | 0.044499999999999984 | null / null | 2.960584 / 2.945167 |
| array-1000/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.003250000000000003 | null / null | null / null |
| array-1000/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.003250000000000003 | null / null | null / null |
| array-1000/off/update-first-nogc | reduced | 8 | null | 기록 | 0.0006255000000000011 | 0 / 0 | 0.0944165 / 0.09356249999999999 |
| array-1000/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0013759999999999953 | null / null | null / null |
| array-1000/off/update-later-nogc | reduced | 8 | null | 기록 | 0.0003119999999999998 | 0 / 0 | 0.0894165 / 0.0877915 |
| array-1000/off/update-nogc | reduced | 8 | null | 기록 | 0.0006255000000000011 | 0 / 0 | 0.0944165 / 0.09356249999999999 |
| array-500/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0051040000000002195 | null / null | null / null |
| array-500/off/mount-nogc | reduced | 8 | null | 기록 | 0.006521999999999917 | null / null | 1.6351455000000001 / 1.627146 |
| array-500/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0009794999999999943 | null / null | null / null |
| array-500/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0009794999999999943 | null / null | null / null |
| array-500/off/update-first-nogc | reduced | 8 | null | 기록 | -0.0007080000000000003 | 0 / 0 | 0.0800205 / 0.0795 |
| array-500/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0005415000000000003 | null / null | null / null |
| array-500/off/update-later-nogc | reduced | 8 | null | 기록 | 0.00045799999999999313 | 0 / 0 | 0.0730835 / 0.073271 |
| array-500/off/update-nogc | reduced | 8 | null | 기록 | -0.0007080000000000003 | 0 / 0 | 0.0800205 / 0.0795 |
| computed-visible-derived/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.007292000000000021 | null / null | null / null |
| computed-visible-derived/off/mount-nogc | reduced | 8 | null | 기록 | 0.0050624999999999976 | null / null | 0.266417 / 0.2618125 |
| computed-visible-derived/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0023334999999999884 | null / null | null / null |
| computed-visible-derived/off/update-first | full | 24 | null | 관측되지 않음 | -0.00026999999999999247 | null / null | null / null |
| computed-visible-derived/off/update-first-nogc | full | 24 | null | 기록 | -0.00016750000000000098 | 0 / 0 | 0.087459 / 0.0871875 |
| computed-visible-derived/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0006040000000000004 | null / null | null / null |
| computed-visible-derived/off/update-later-nogc | reduced | 8 | null | 기록 | -0.0012295000000000014 | 0 / 0 | 0.08160400000000001 / 0.0797705 |
| computed-visible-derived/off/update-nogc | reduced | 8 | null | 기록 | 0.001583000000000001 | 0 / 0 | 0.23120800000000002 / 0.225417 |
| flat-100/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0002294999999999936 | null / null | null / null |
| flat-100/off/mount-nogc | reduced | 8 | null | 기록 | -0.0020210000000000228 | null / null | 0.336917 / 0.3382505 |
| flat-100/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0023334999999999884 | null / null | null / null |
| flat-100/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0006040000000000073 | null / null | null / null |
| flat-100/off/update-first-nogc | reduced | 8 | null | 기록 | -0.00047900000000000026 | 0 / 0 | 0.0370415 / 0.0374165 |
| flat-100/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.00020850000000000035 | null / null | null / null |
| flat-100/off/update-later-nogc | reduced | 8 | null | 기록 | 0.0005005000000000009 | 0 / 0 | 0.034583 / 0.0338955 |
| flat-100/off/update-nogc | reduced | 8 | null | 기록 | -0.0004790000000000072 | 0 / 0 | 0.29002 / 0.288875 |
| flat-50/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.004124500000000003 | null / null | null / null |
| flat-50/off/mount-nogc | reduced | 8 | null | 기록 | 0.0008954999999999935 | null / null | 0.203625 / 0.204125 |
| flat-50/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.003730000000000011 | null / null | null / null |
| flat-50/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0007505000000000012 | null / null | null / null |
| flat-50/off/update-first-nogc | reduced | 8 | null | 기록 | -0.00018699999999999967 | 0 / 0 | 0.036833 / 0.0373545 |
| flat-50/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00010399999999999993 | null / null | null / null |
| flat-50/off/update-later-nogc | reduced | 8 | null | 기록 | -0.00004099999999999937 | 0.003048780487804878 / 0.003048780487804878 | 0.034208 / 0.034333 |
| flat-50/off/update-nogc | reduced | 8 | null | 기록 | 0.0021899999999999975 | 0.0003048780487804878 / 0 | 0.285292 / 0.2825625 |
| flat-500/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.002167499999999878 | null / null | null / null |
| flat-500/off/mount-nogc | reduced | 8 | null | 기록 | -0.01883299999999999 | null / null | 1.342666 / 1.3607915 |
| flat-500/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.00010350000000000636 | null / null | null / null |
| flat-500/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.002312500000000009 | null / null | null / null |
| flat-500/off/update-first-nogc | reduced | 8 | null | 기록 | -0.0021465000000000026 | 0 / 0 | 0.045875 / 0.0472295 |
| flat-500/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.00006250000000000006 | null / null | null / null |
| flat-500/off/update-later-nogc | reduced | 8 | null | 기록 | -0.0001250000000000001 | 0 / 0 | 0.036729 / 0.036458 |
| flat-500/off/update-nogc | reduced | 8 | null | 기록 | -0.0033334999999999892 | 0 / 0 | 0.312187 / 0.31172999999999995 |
| if-then/off/mount | full | 24 | null | 관측되지 않음 | -0.00043749999999997957 | null / null | null / null |
| if-then/off/mount-nogc | full | 24 | null | 기록 | 0.0014794999999999947 | null / null | 0.2078125 / 0.2055205 |
| if-then/off/update | full | 24 | null | 관측되지 않음 | -0.0005204999999999932 | null / null | null / null |
| if-then/off/update-first | full | 24 | null | 관측되지 않음 | -0.0006255000000000011 | null / null | null / null |
| if-then/off/update-first-nogc | full | 24 | null | 기록 | -0.0011050000000000018 | 0 / 0 | 0.0704585 / 0.071459 |
| if-then/off/update-later | full | 24 | null | 관측되지 않음 | 0.00004149999999999987 | null / null | null / null |
| if-then/off/update-later-nogc | full | 24 | null | 기록 | -0.00006199999999999956 | 0 / 0 | 0.062 / 0.0617915 |
| if-then/off/update-nogc | full | 24 | null | 기록 | -0.0012910000000000005 | 0 / 0 | 0.1389375 / 0.139917 |
| if-then/on/mount | full | 24 | null | 관측되지 않음 | -0.0010419999999999874 | null / null | null / null |
| if-then/on/mount-nogc | full | 24 | null | 기록 | 0.007020999999999944 | null / null | 4.256833 / 4.251958 |
| if-then/on/update | full | 24 | null | 관측되지 않음 | 0.0011460000000000081 | null / null | null / null |
| if-then/on/update-first | full | 24 | null | 관측되지 않음 | 0.0007915000000000144 | null / null | null / null |
| if-then/on/update-first-nogc | full | 24 | null | 기록 | -0.0003545000000000076 | 0 / 0 | 0.134292 / 0.134708 |
| if-then/on/update-later | full | 24 | null | 관측되지 않음 | 0.0012295000000000014 | null / null | null / null |
| if-then/on/update-later-nogc | full | 24 | null | 기록 | -0.0018754999999999952 | 0 / 0 | 0.099875 / 0.1021665 |
| if-then/on/update-nogc | full | 24 | null | 기록 | -0.0019790000000000085 | 0 / 0 | 0.2440835 / 0.245938 |
| nested-d3-f4/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0030415000000000303 | null / null | null / null |
| nested-d3-f4/off/mount-nogc | reduced | 8 | null | 기록 | -0.0012500000000000011 | null / null | 0.31583300000000003 / 0.3155 |
| nested-d3-f4/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0002275000000000471 | null / null | null / null |
| nested-d3-f4/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00008299999999999974 | null / null | null / null |
| nested-d3-f4/off/update-first-nogc | reduced | 8 | null | 기록 | 0.0006045000000000009 | 0 / 0 | 0.0443335 / 0.043875 |
| nested-d3-f4/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00018699999999999967 | null / null | null / null |
| nested-d3-f4/off/update-later-nogc | reduced | 8 | null | 기록 | 0.0015835000000000016 | 0 / 0 | 0.03925 / 0.0380205 |
| nested-d3-f4/off/update-nogc | reduced | 8 | null | 기록 | 0.0004800000000000082 | 0.0006097560975609756 / 0.0006097560975609756 | 0.339875 / 0.34212549999999997 |
| nested-d5-f4/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.040541499999999786 | null / null | null / null |
| nested-d5-f4/off/mount-nogc | reduced | 8 | null | 기록 | 0.006604000000000054 | null / null | 3.672084 / 3.637562 |
| nested-d5-f4/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.002665999999999946 | null / null | null / null |
| nested-d5-f4/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0004169999999999868 | null / null | null / null |
| nested-d5-f4/off/update-first-nogc | reduced | 8 | null | 기록 | 0.0004375000000000004 | 0 / 0 | 0.0752085 / 0.075104 |
| nested-d5-f4/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0001454999999999998 | null / null | null / null |
| nested-d5-f4/off/update-later-nogc | reduced | 8 | null | 기록 | 0.0009790000000000007 | 0 / 0 | 0.046979 / 0.0461875 |
| nested-d5-f4/off/update-nogc | reduced | 8 | null | 기록 | -0.0017500000000000016 | 0 / 0 | 0.44508349999999997 / 0.441814 |
| oneOf-10/off/axis-first | full | 24 | null | 관측되지 않음 | 0.0003334999999999866 | null / null | null / null |
| oneOf-10/off/axis-first-nogc | full | 24 | null | 기록 | -0.00002049999999997887 | 0.0020325203252032522 / 0 | 0.25306249999999997 / 0.2530835 |
| oneOf-10/off/axis-later | full | 24 | null | 관측되지 않음 | 0.0009170000000000011 | null / null | null / null |
| oneOf-10/off/axis-later-nogc | full | 24 | null | 기록 | -0.0010215000000000085 | 0.0020325203252032522 / 0.0010162601626016261 | 0.18964599999999998 / 0.191208 |
| oneOf-10/off/axis-update | full | 24 | null | 관측되지 않음 | -0.000021500000000007624 | null / null | null / null |
| oneOf-10/off/axis-update-nogc | full | 24 | null | 기록 | 0.0007289999999999797 | 0.0010162601626016261 / 0 | 0.44175 / 0.442875 |
| oneOf-10/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.002874999999999961 | null / null | null / null |
| oneOf-10/off/mount-nogc | reduced | 8 | null | 기록 | 0.0003954999999999931 | null / null | 0.5981460000000001 / 0.6039165 |
| oneOf-10/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0030010000000000314 | null / null | null / null |
| oneOf-10/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.001375499999999974 | null / null | null / null |
| oneOf-10/off/update-first-nogc | reduced | 8 | null | 기록 | -0.002520499999999981 | 0 / 0 | 0.28047900000000003 / 0.28247900000000004 |
| oneOf-10/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0006665000000000143 | null / null | null / null |
| oneOf-10/off/update-later-nogc | reduced | 8 | null | 기록 | 0.0008125000000000077 | 0 / 0 | 0.1893125 / 0.188458 |
| oneOf-10/off/update-nogc | reduced | 8 | null | 기록 | -0.00187499999999996 | 0 / 0 | 0.4790835 / 0.48014599999999996 |
| oneOf-10/on/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.048811999999999856 | null / null | null / null |
| oneOf-10/on/mount-nogc | reduced | 8 | null | 기록 | 0.05910449999999967 | null / null | 5.54375 / 5.500624999999999 |
| oneOf-10/on/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.002187500000000009 | null / null | null / null |
| oneOf-10/on/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0001255000000000006 | null / null | null / null |
| oneOf-10/on/update-first-nogc | reduced | 8 | null | 기록 | -0.0006250000000000144 | 0 / 0 | 0.4376875 / 0.43674999999999997 |
| oneOf-10/on/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0011464999999999947 | null / null | null / null |
| oneOf-10/on/update-later-nogc | reduced | 8 | null | 기록 | 0.0014585000000000015 | 0.012195121951219513 / 0.01524390243902439 | 0.271458 / 0.269792 |
| oneOf-10/on/update-nogc | reduced | 8 | null | 기록 | -0.005916500000000047 | 0.004573170731707317 / 0.004573170731707317 | 0.718417 / 0.717084 |
| oneOf-20/off/axis-first | full | 24 | null | 관측되지 않음 | 0.0018750000000000155 | null / null | null / null |
| oneOf-20/off/axis-first-nogc | full | 24 | null | 기록 | 0.0013334999999999875 | 0.0020325203252032522 / 0.0020325203252032522 | 0.37577099999999997 / 0.37558349999999996 |
| oneOf-20/off/axis-later | full | 24 | null | 관측되지 않음 | 0.001374499999999973 | null / null | null / null |
| oneOf-20/off/axis-later-nogc | full | 24 | null | 기록 | -0.0006665000000000143 | 0.0020325203252032522 / 0 | 0.2582085 / 0.25827100000000003 |
| oneOf-20/off/axis-update | full | 24 | null | 관측되지 않음 | 0.00535450000000004 | null / null | null / null |
| oneOf-20/off/axis-update-nogc | full | 24 | null | 기록 | -0.00312450000000003 | 0.0010162601626016261 / 0.001524390243902439 | 0.6245210000000001 / 0.627 |
| oneOf-20/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0018545000000000922 | null / null | null / null |
| oneOf-20/off/mount-nogc | reduced | 8 | null | 기록 | 0.008770999999999973 | null / null | 1.024583 / 1.013208 |
| oneOf-20/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00431349999999997 | null / null | null / null |
| oneOf-20/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.003875499999999976 | null / null | null / null |
| oneOf-20/off/update-first-nogc | reduced | 8 | null | 기록 | 0.0021459999999999813 | 0 / 0 | 0.40275 / 0.406729 |
| oneOf-20/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0007705000000000073 | null / null | null / null |
| oneOf-20/off/update-later-nogc | reduced | 8 | null | 기록 | -0.0029794999999999683 | 0.006097560975609756 / 0.003048780487804878 | 0.255 / 0.255459 |
| oneOf-20/off/update-nogc | reduced | 8 | null | 기록 | -0.009041999999999994 | 0.001524390243902439 / 0 | 0.663708 / 0.6722295 |
| oneOf-20/on/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0327295000000003 | null / null | null / null |
| oneOf-20/on/mount-nogc | reduced | 8 | null | 기록 | 0.017103999999999786 | null / null | 6.865562499999999 / 6.81975 |
| oneOf-20/on/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.003270500000000065 | null / null | null / null |
| oneOf-20/on/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.004666499999999907 | null / null | null / null |
| oneOf-20/on/update-first-nogc | reduced | 8 | null | 기록 | 0.004521499999999956 | 0 / 0 | 0.575708 / 0.5735414999999999 |
| oneOf-20/on/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0028539999999999677 | null / null | null / null |
| oneOf-20/on/update-later-nogc | reduced | 8 | null | 기록 | 0.005103000000000024 | 0 / 0 | 0.3366665 / 0.33347950000000004 |
| oneOf-20/on/update-nogc | reduced | 8 | null | 기록 | 0.0016665000000000152 | 0 / 0 | 0.935917 / 0.926583 |
| oneOf-40/off/axis-first | full | 24 | null | 관측되지 않음 | -0.007916499999999993 | null / null | null / null |
| oneOf-40/off/axis-first-nogc | full | 24 | null | 기록 | -0.011874499999999955 | 0.0010162601626016261 / 0.0020325203252032522 | 0.558583 / 0.5689995 |
| oneOf-40/off/axis-later | full | 24 | null | 관측되지 않음 | -0.0034175000000000733 | null / null | null / null |
| oneOf-40/off/axis-later-nogc | full | 24 | null | 기록 | -0.0019790000000000085 | 0 / 0 | 0.351812 / 0.3546455 |
| oneOf-40/off/axis-update | full | 24 | null | 관측되지 않음 | -0.010020000000000029 | null / null | null / null |
| oneOf-40/off/axis-update-nogc | full | 24 | null | 기록 | -0.015875500000000042 | 0.0005081300813008131 / 0.0010162601626016261 | 0.906209 / 0.9197295000000001 |
| oneOf-40/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0027919999999999057 | null / null | null / null |
| oneOf-40/off/mount-nogc | reduced | 8 | null | 기록 | -0.0248545 | null / null | 1.661959 / 1.681292 |
| oneOf-40/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.01939650000000015 | null / null | null / null |
| oneOf-40/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0013745000000000562 | null / null | null / null |
| oneOf-40/off/update-first-nogc | reduced | 8 | null | 기록 | -0.01085449999999999 | 0 / 0 | 0.584937 / 0.6009795 |
| oneOf-40/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0006045000000000078 | null / null | null / null |
| oneOf-40/off/update-later-nogc | reduced | 8 | null | 기록 | -0.0025624999999999953 | 0 / 0 | 0.3500835 / 0.3602915 |
| oneOf-40/off/update-nogc | reduced | 8 | null | 기록 | -0.02724999999999994 | 0 / 0 | 0.939667 / 0.9669369999999999 |
| oneOf-40/on/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.06481199999999987 | null / null | null / null |
| oneOf-40/on/mount-nogc | reduced | 8 | null | 기록 | 0.38072950000000017 | null / null | 10.4637085 / 10.2032085 |
| oneOf-40/on/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.003458999999999879 | null / null | null / null |
| oneOf-40/on/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.005145500000000025 | null / null | null / null |
| oneOf-40/on/update-first-nogc | reduced | 8 | null | 기록 | 0.004542000000000046 | 0.006097560975609756 / 0 | 0.8223335 / 0.8211875 |
| oneOf-40/on/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0034795000000000242 | null / null | null / null |
| oneOf-40/on/update-later-nogc | reduced | 8 | null | 기록 | 0.0027085000000000026 | 0.006097560975609756 / 0.006097560975609756 | 0.4655 / 0.468333 |
| oneOf-40/on/update-nogc | reduced | 8 | null | 기록 | 0.01041700000000001 | 0.003048780487804878 / 0 | 1.3284794999999998 / 1.324563 |
| oneOf-5/off/axis-first | full | 24 | null | 관측되지 않음 | -0.0014374999999999805 | null / null | null / null |
| oneOf-5/off/axis-first-nogc | full | 24 | null | 기록 | -0.0008330000000000004 | 0 / 0 | 0.1992915 / 0.19979200000000003 |
| oneOf-5/off/axis-later | full | 24 | null | 관측되지 않음 | -0.000958500000000001 | null / null | null / null |
| oneOf-5/off/axis-later-nogc | full | 24 | null | 기록 | -0.0027085000000000026 | 0 / 0 | 0.1605205 / 0.162875 |
| oneOf-5/off/axis-update | full | 24 | null | 관측되지 않음 | -0.0013334999999999875 | null / null | null / null |
| oneOf-5/off/axis-update-nogc | full | 24 | null | 기록 | -0.001291500000000001 | 0 / 0 | 0.356208 / 0.356478 |
| oneOf-5/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.010479500000000086 | null / null | null / null |
| oneOf-5/off/mount-nogc | reduced | 8 | null | 기록 | -0.0037709999999999966 | null / null | 0.408375 / 0.40841649999999996 |
| oneOf-5/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.015415999999999985 | null / null | null / null |
| oneOf-5/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.00989599999999996 | null / null | null / null |
| oneOf-5/off/update-first-nogc | reduced | 8 | null | 기록 | -0.0005834999999999868 | 0 / 0 | 0.21837499999999999 / 0.21983350000000002 |
| oneOf-5/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0005835000000000007 | null / null | null / null |
| oneOf-5/off/update-later-nogc | reduced | 8 | null | 기록 | 0.000020500000000006624 | 0 / 0 | 0.1570625 / 0.159125 |
| oneOf-5/off/update-nogc | reduced | 8 | null | 기록 | -0.0009159999999999724 | 0 / 0 | 0.38004150000000003 / 0.3836875 |
| oneOf-5/on/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.09456250000000033 | null / null | null / null |
| oneOf-5/on/mount-nogc | reduced | 8 | null | 기록 | 0.15712499999999974 | null / null | 4.830375 / 4.661417 |
| oneOf-5/on/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.009229000000000043 | null / null | null / null |
| oneOf-5/on/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00520799999999999 | null / null | null / null |
| oneOf-5/on/update-first-nogc | reduced | 8 | null | 기록 | 0.0019375000000000087 | 0.009146341463414634 / 0.01524390243902439 | 0.381667 / 0.377083 |
| oneOf-5/on/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0013334999999999875 | null / null | null / null |
| oneOf-5/on/update-later-nogc | reduced | 8 | null | 기록 | -0.0007290000000000074 | 0 / 0 | 0.23483300000000001 / 0.2367505 |
| oneOf-5/on/update-nogc | reduced | 8 | null | 기록 | 0.004374499999999948 | 0.004573170731707317 / 0.007621951219512195 | 0.631791 / 0.623083 |
| sample-0/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.000999999999999987 | null / null | null / null |
| sample-0/off/mount-nogc | reduced | 8 | null | 기록 | 0.0010409999999999933 | null / null | 0.071062 / 0.069833 |
| sample-0/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.000895999999999994 | null / null | null / null |
| sample-0/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.000895999999999994 | null / null | null / null |
| sample-0/off/update-first-nogc | reduced | 8 | null | 기록 | 0.0008545000000000011 | 0 / 0 | 0.04875 / 0.048354 |
| sample-0/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0006449999999999997 | null / null | null / null |
| sample-0/off/update-later-nogc | reduced | 8 | null | 기록 | 0.001062500000000001 | 0 / 0 | 0.048229 / 0.0475625 |
| sample-0/off/update-nogc | reduced | 8 | null | 기록 | 0.0008545000000000011 | 0 / 0 | 0.04875 / 0.048354 |
| sample-1/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.004728999999999983 | null / null | null / null |
| sample-1/off/mount-nogc | reduced | 8 | null | 기록 | -0.00047950000000000076 | null / null | 0.111375 / 0.10993800000000001 |
| sample-1/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.002083500000000002 | null / null | null / null |
| sample-1/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.002083500000000002 | null / null | null / null |
| sample-1/off/update-first-nogc | reduced | 8 | null | 기록 | 0.000999499999999997 | 0 / 0 | 0.0593335 / 0.0577085 |
| sample-1/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | -0.0009795000000000012 | null / null | null / null |
| sample-1/off/update-later-nogc | full | 24 | null | 기록 | -0.0004159999999999997 | 0 / 0 | 0.057313 / 0.057271 |
| sample-1/off/update-nogc | reduced | 8 | null | 기록 | 0.000999499999999997 | 0 / 0 | 0.0593335 / 0.0577085 |
| sample-2/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.00014600000000000724 | null / null | null / null |
| sample-2/off/mount-nogc | reduced | 8 | null | 기록 | -0.00020849999999998647 | null / null | 0.139146 / 0.14027050000000002 |
| sample-2/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.001979499999999995 | null / null | null / null |
| sample-2/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.001979499999999995 | null / null | null / null |
| sample-2/off/update-first-nogc | reduced | 8 | null | 기록 | 0.0008330000000000004 | 0 / 0 | 0.0577085 / 0.0568955 |
| sample-2/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0010205000000000006 | null / null | null / null |
| sample-2/off/update-later-nogc | reduced | 8 | null | 기록 | -0.0006250000000000006 | 0 / 0 | 0.057083 / 0.057229 |
| sample-2/off/update-nogc | reduced | 8 | null | 기록 | 0.0008330000000000004 | 0 / 0 | 0.0577085 / 0.0568955 |
| sample-3/off/mount | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.008124999999999993 | null / null | null / null |
| sample-3/off/mount-nogc | reduced | 8 | null | 기록 | 0.0017920000000000158 | null / null | 0.302833 / 0.29945849999999996 |
| sample-3/off/update | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0009170000000000011 | null / null | null / null |
| sample-3/off/update-first | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0009170000000000011 | null / null | null / null |
| sample-3/off/update-first-nogc | reduced | 8 | null | 기록 | 0.002354499999999999 | 0.01524390243902439 / 0.012195121951219513 | 0.058333 / 0.0575415 |
| sample-3/off/update-later | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.0005625000000000005 | null / null | null / null |
| sample-3/off/update-later-nogc | reduced | 8 | null | 기록 | 0.00004200000000000037 | 0.003048780487804878 / 0.003048780487804878 | 0.05675 / 0.056459 |
| sample-3/off/update-nogc | reduced | 8 | null | 기록 | 0.002354499999999999 | 0.01524390243902439 / 0.012195121951219513 | 0.058333 / 0.0575415 |
