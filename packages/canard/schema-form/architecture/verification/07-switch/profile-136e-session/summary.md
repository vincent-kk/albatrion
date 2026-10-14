# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 3381.312초이며 확인 측정은 0.000초이고 보고 계산은 0.095초입니다.
프로세스 준비 시간의 합은 124.220초이며 예열은 1072.042초, 강제 GC는 214.506초, 표본은 2118.483초, digest는 399.031초입니다.
시계 밖 minor GC는 28.939초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 3697.821초이며 확인 여유는 1200.000초이고 합계는 4897.821초입니다. 예산은 7099.933초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 3381.282초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2365.256 |
| flat-100 | 158.405 |
| nested-d3-f4 | 144.879 |
| flat-50 | 111.288 |
| sample-3 | 105.055 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-500/off/mount-active | full | 24 | null | 관측되지 않음 | 1.33693696942737 | null / null | null / null |
| array-500/off/mount-active-nogc | full | 24 | null | 기록 | 0.7976249659477617 | null / null | null / null |
| array-500/off/mount-wall | full | 24 | null | 관측되지 않음 | 1.7318755000005694 | null / null | null / null |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | 1.3134790000040084 | null / null | null / null |
| array-500/off/profiler-mount | full | 24 | null | 기록 | 0.8885274999902322 | null / null | null / null |
| array-500/off/profiler-mount-nogc | full | 24 | null | 기록 | 1.7316309995003394 | null / null | null / null |
| array-500/off/profiler-update | full | 24 | null | 기록 | -0.007589500000904081 | null / null | null / null |
| array-500/off/profiler-update-nogc | full | 24 | null | 기록 | -0.004059999970195349 | 0 / 0 | 0.32521849998738617 / 0.3287339999915275 |
| array-500/off/update-active | full | 24 | null | 관측되지 않음 | 0.044645488262176514 | null / null | null / null |
| array-500/off/update-active-nogc | full | 24 | null | 기록 | 0.004167497158050537 | 0 / 0 | 0.9222494959831238 / 0.9199579656124115 |
| array-500/off/update-wall | full | 24 | null | 관측되지 않음 | 0.044771000000764616 | null / null | null / null |
| array-500/off/update-wall-nogc | full | 24 | null | 기록 | 0.004145999999309424 | 0 / 0 | 0.9197500000009313 / 0.9171249999999418 |
| computed-visible-derived/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| computed-visible-derived/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.004403794037940379 / 0.0033875338753387536 | 3 / 3 |
| computed-visible-derived/off/mount-active | full | 24 | null | 관측되지 않음 | 0.008083480100651741 | null / null | null / null |
| computed-visible-derived/off/mount-active-nogc | full | 24 | null | 기록 | 0.0011040124892360836 | null / null | 1.0902284763965895 / 1.0976659631004395 |
| computed-visible-derived/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.010604499999999462 | null / null | null / null |
| computed-visible-derived/off/mount-wall-nogc | full | 24 | null | 기록 | 0.009041499999966618 | null / null | 3.587792000000036 / 3.5970839999999953 |
| computed-visible-derived/off/profiler-mount | full | 24 | null | 기록 | 0.004778499999815722 | null / null | null / null |
| computed-visible-derived/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0008509999997841078 | null / null | 0.8646449999993138 / 0.8788819999970201 |
| computed-visible-derived/off/profiler-update | full | 24 | null | 기록 | -0.00022750000016458216 | null / null | null / null |
| computed-visible-derived/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0011854999985416725 | 0.004403794037940379 / 0.0033875338753387536 | 0.38770699999940916 / 0.38431700000001 |
| computed-visible-derived/off/update-active | full | 24 | null | 관측되지 않음 | 0.007480502128601074 | null / null | null / null |
| computed-visible-derived/off/update-active-nogc | full | 24 | null | 기록 | 0.0029990971088409424 | 0.004403794037940379 / 0.0033875338753387536 | 1.0675829648971558 / 1.0574584603309631 |
| computed-visible-derived/off/update-wall | full | 24 | null | 관측되지 않음 | 0.006145500000002357 | null / null | null / null |
| computed-visible-derived/off/update-wall-nogc | full | 24 | null | 기록 | 0.0029590000000325745 | 0.004403794037940379 / 0.0033875338753387536 | 1.0645829999998568 / 1.0557709999998224 |
| flat-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| flat-100/off/mount-active | full | 24 | null | 관측되지 않음 | -0.04770853310401435 | null / null | null / null |
| flat-100/off/mount-active-nogc | full | 24 | null | 기록 | 0.03158350232911289 | null / null | 9.403125021787673 / 9.390126012508063 |
| flat-100/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.03200000000003911 | null / null | null / null |
| flat-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.022208000000091488 | null / null | 11.891521000000239 / 11.876625000000331 |
| flat-100/off/profiler-mount | full | 24 | null | 기록 | -0.050590499997781535 | null / null | null / null |
| flat-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.004924500008883115 | null / null | 8.121922000005725 / 8.129467000000204 |
| flat-100/off/profiler-update | full | 24 | null | 기록 | -0.00007949999803713581 | null / null | null / null |
| flat-100/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0004284999931769562 | 0 / 0 | 0.5768449999957284 / 0.580351499993867 |
| flat-100/off/update-active | full | 24 | null | 관측되지 않음 | 0.010313451290130615 | null / null | null / null |
| flat-100/off/update-active-nogc | full | 24 | null | 기록 | 0.009690076112747192 | 0 / 0 | 1.9850385189056396 / 1.9814800024032593 |
| flat-100/off/update-wall | full | 24 | null | 관측되지 않음 | 0.010541500000158521 | null / null | null / null |
| flat-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.009459000000333617 | 0 / 0 | 1.9815000000012333 / 1.9775629999994635 |
| flat-50/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-50/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0004065040650406504 / 0 | 10 / 10 |
| flat-50/off/mount-active | full | 24 | null | 관측되지 않음 | 0.0326455032825379 | null / null | null / null |
| flat-50/off/mount-active-nogc | full | 24 | null | 기록 | 0.030416979972756053 | null / null | 5.015749993618101 / 4.953311526409266 |
| flat-50/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.05447900000001482 | null / null | null / null |
| flat-50/off/mount-wall-nogc | full | 24 | null | 기록 | 0.031104500000196822 | null / null | 7.516125000000102 / 7.450020499999823 |
| flat-50/off/profiler-mount | full | 24 | null | 기록 | 0.03375199999908318 | null / null | null / null |
| flat-50/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.03578549999497227 | null / null | 4.339418999991267 / 4.292981000002101 |
| flat-50/off/profiler-update | full | 24 | null | 기록 | 0.0005125000000134605 | null / null | null / null |
| flat-50/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0015530000018770806 | 0.0004065040650406504 / 0 | 0.5216064999974606 / 0.5184389999974428 |
| flat-50/off/update-active | full | 24 | null | 관측되지 않음 | 0.017978042364120483 | null / null | null / null |
| flat-50/off/update-active-nogc | full | 24 | null | 기록 | 0.01560404896736145 | 0.0004065040650406504 / 0 | 1.7909375131130219 / 1.771104097366333 |
| flat-50/off/update-wall | full | 24 | null | 관측되지 않음 | 0.01931450000017776 | null / null | null / null |
| flat-50/off/update-wall-nogc | full | 24 | null | 기록 | 0.01643649999994068 | 0.0004065040650406504 / 0 | 1.7874775000004774 / 1.767687000000251 |
| nested-d3-f4/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| nested-d3-f4/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 10 / 10 |
| nested-d3-f4/off/mount-active | full | 24 | null | 관측되지 않음 | -0.036708501577436436 | null / null | null / null |
| nested-d3-f4/off/mount-active-nogc | full | 24 | null | 기록 | 0.1139795324249917 | null / null | 7.942667964530983 / 7.854916021640747 |
| nested-d3-f4/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.035186999999950785 | null / null | null / null |
| nested-d3-f4/off/mount-wall-nogc | full | 24 | null | 기록 | 0.11685499999998683 | null / null | 10.436625000000276 / 10.337208000000373 |
| nested-d3-f4/off/profiler-mount | full | 24 | null | 기록 | -0.026336999996033228 | null / null | null / null |
| nested-d3-f4/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.07118900001205475 | null / null | 6.76813600000105 / 6.698193999995965 |
| nested-d3-f4/off/profiler-update | full | 24 | null | 기록 | -0.010880999996743412 | null / null | null / null |
| nested-d3-f4/off/profiler-update-nogc | full | 24 | null | 기록 | 0.01131699999200464 | 0 / 0 | 0.7066364999955113 / 0.697155000004841 |
| nested-d3-f4/off/update-active | full | 24 | null | 관측되지 않음 | 0.011853516101837158 | null / null | null / null |
| nested-d3-f4/off/update-active-nogc | full | 24 | null | 기록 | 0.04129338264465332 | 0 / 0 | 2.1485000252723694 / 2.1075000166893005 |
| nested-d3-f4/off/update-wall | full | 24 | null | 관측되지 않음 | 0.013376500000049418 | null / null | null / null |
| nested-d3-f4/off/update-wall-nogc | full | 24 | null | 기록 | 0.04203700000016397 | 0 / 0 | 2.1446654999997463 / 2.1036039999992227 |
| oneOf-10/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-10/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.001524390243902439 / 0.002540650406504065 | 2 / 2 |
| oneOf-10/off/mount-active | full | 24 | null | 관측되지 않음 | 0.012958529655463735 | null / null | null / null |
| oneOf-10/off/mount-active-nogc | full | 24 | null | 기록 | -0.008707999431578628 | null / null | 1.5278329939117157 / 1.5258330206870596 |
| oneOf-10/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.025207999999963704 | null / null | null / null |
| oneOf-10/off/mount-wall-nogc | full | 24 | null | 기록 | -0.005750000000148248 | null / null | 4.0284999999998945 / 4.030874999999924 |
| oneOf-10/off/profiler-mount | full | 24 | null | 기록 | -0.0009715000005030561 | null / null | null / null |
| oneOf-10/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.009892500001797089 | null / null | 1.278923000001214 / 1.2826639999996132 |
| oneOf-10/off/profiler-update | full | 24 | null | 기록 | 0.004062499999804459 | null / null | null / null |
| oneOf-10/off/profiler-update-nogc | full | 24 | null | 기록 | -0.005731000000309905 | 0.001524390243902439 / 0.002540650406504065 | 0.7922180000007302 / 0.7963299999987612 |
| oneOf-10/off/update-active | full | 24 | null | 관측되지 않음 | 0.025666505098342896 | null / null | null / null |
| oneOf-10/off/update-active-nogc | full | 24 | null | 기록 | 0.0007290542125701904 | 0.001524390243902439 / 0.002540650406504065 | 1.8893330097198486 / 1.8874159455299377 |
| oneOf-10/off/update-wall | full | 24 | null | 관측되지 않음 | 0.025480500000014672 | null / null | null / null |
| oneOf-10/off/update-wall-nogc | full | 24 | null | 기록 | 0.0006249999998999556 | 0.001524390243902439 / 0.002540650406504065 | 1.887625000000071 / 1.8854590000000826 |
| oneOf-20/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-20/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0040650406504065045 / 0.001524390243902439 | 2 / 2 |
| oneOf-20/off/mount-active | full | 24 | null | 관측되지 않음 | -0.005437038623881563 | null / null | null / null |
| oneOf-20/off/mount-active-nogc | full | 24 | null | 기록 | -0.007292501962751885 | null / null | 1.9359585143050708 / 1.9348345142688004 |
| oneOf-20/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0017080000000078144 | null / null | null / null |
| oneOf-20/off/mount-wall-nogc | full | 24 | null | 기록 | -0.018062499999814463 | null / null | 4.435375000000022 / 4.438062500000001 |
| oneOf-20/off/profiler-mount | full | 24 | null | 기록 | -0.018366000000185068 | null / null | null / null |
| oneOf-20/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.011357999998381274 | null / null | 1.6732504999996536 / 1.6795420000022432 |
| oneOf-20/off/profiler-update | full | 24 | null | 기록 | 0.006633999998598483 | null / null | null / null |
| oneOf-20/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0012489999995750622 | 0.0040650406504065045 / 0.001524390243902439 | 0.8008405000020957 / 0.8003639999997176 |
| oneOf-20/off/update-active | full | 24 | null | 관측되지 않음 | 0.01995748281478882 | null / null | null / null |
| oneOf-20/off/update-active-nogc | full | 24 | null | 기록 | 0.008146524429321289 | 0.0040650406504065045 / 0.001524390243902439 | 2.0850415229797363 / 2.0797500014305115 |
| oneOf-20/off/update-wall | full | 24 | null | 관측되지 않음 | 0.0209160000001134 | null / null | null / null |
| oneOf-20/off/update-wall-nogc | full | 24 | null | 기록 | 0.008061999999881664 | 0.0040650406504065045 / 0.001524390243902439 | 2.083854500000143 / 2.078125999999884 |
| oneOf-5/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-5/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.002540650406504065 / 0.0020325203252032522 | 2 / 2 |
| oneOf-5/off/mount-active | full | 24 | null | 관측되지 않음 | 0.0061879551964239 | null / null | null / null |
| oneOf-5/off/mount-active-nogc | full | 24 | null | 기록 | -0.018625486612450004 | null / null | 1.3460419802664774 / 1.3502920209808735 |
| oneOf-5/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0018749999999272404 | null / null | null / null |
| oneOf-5/off/mount-wall-nogc | full | 24 | null | 기록 | -0.008041499999990265 | null / null | 3.8504159999999956 / 3.854042000000163 |
| oneOf-5/off/profiler-mount | full | 24 | null | 기록 | -0.010055499998088635 | null / null | null / null |
| oneOf-5/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.015082000001712004 | null / null | 1.1056610000007367 / 1.1137549999975818 |
| oneOf-5/off/profiler-update | full | 24 | null | 기록 | -0.013054000001432087 | null / null | null / null |
| oneOf-5/off/profiler-update-nogc | full | 24 | null | 기록 | -0.005530999999336927 | 0.002540650406504065 / 0.0020325203252032522 | 0.7952550000009069 / 0.80172849999974 |
| oneOf-5/off/update-active | full | 24 | null | 관측되지 않음 | -0.007769972085952759 | null / null | null / null |
| oneOf-5/off/update-active-nogc | full | 24 | null | 기록 | -0.007603466510772705 | 0.002540650406504065 / 0.0020325203252032522 | 1.809499979019165 / 1.8211464881896973 |
| oneOf-5/off/update-wall | full | 24 | null | 관측되지 않음 | -0.007750500000042848 | null / null | null / null |
| oneOf-5/off/update-wall-nogc | full | 24 | null | 기록 | -0.007541000000060194 | 0.002540650406504065 / 0.0020325203252032522 | 1.8079580000000988 / 1.8189799999998968 |
| sample-0/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-0/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| sample-0/off/mount-active | full | 24 | null | 관측되지 않음 | 0.00535399651522539 | null / null | null / null |
| sample-0/off/mount-active-nogc | full | 24 | null | 기록 | -0.002876019184100187 | null / null | 0.9764574837321902 / 0.9853340396880412 |
| sample-0/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0012915000000361943 | null / null | null / null |
| sample-0/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0051050000000714135 | null / null | 3.4791454999999587 / 3.47787500000004 |
| sample-0/off/profiler-mount | full | 24 | null | 기록 | 0.008120499999904496 | null / null | null / null |
| sample-0/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.0068639999998367784 | null / null | 0.7146669999995083 / 0.7160839999990003 |
| sample-0/off/profiler-update | full | 24 | null | 기록 | -0.00041850000036447454 | null / null | null / null |
| sample-0/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0016990000003147543 | 0 / 0 | 0.12464650000003985 / 0.1271879999999328 |
| sample-0/off/update-active | full | 24 | null | 관측되지 않음 | -0.00012549757957458496 | null / null | null / null |
| sample-0/off/update-active-nogc | full | 24 | null | 기록 | -0.003582984209060669 | 0 / 0 | 0.3720204830169678 / 0.3752085268497467 |
| sample-0/off/update-wall | full | 24 | null | 관측되지 않음 | 0.0008745000000089931 | null / null | null / null |
| sample-0/off/update-wall-nogc | full | 24 | null | 기록 | -0.0034164999999006795 | 0 / 0 | 0.3703955000000292 / 0.3734999999999786 |
| sample-1/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-1/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.006097560975609756 / 0.009146341463414634 | 1 / 1 |
| sample-1/off/mount-active | full | 24 | null | 관측되지 않음 | 0.019417530187610055 | null / null | null / null |
| sample-1/off/mount-active-nogc | full | 24 | null | 기록 | -0.07224943890952318 | null / null | 1.6122499766349847 / 1.6688749754982268 |
| sample-1/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.020749999999964075 | null / null | null / null |
| sample-1/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0657495000000381 | null / null | 4.105833000000075 / 4.167500000000018 |
| sample-1/off/profiler-mount | full | 24 | null | 기록 | 0.010359999999423053 | null / null | null / null |
| sample-1/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.04936150000196449 | null / null | 1.2895770000031916 / 1.3385619999995697 |
| sample-1/off/profiler-update | full | 24 | null | 기록 | -0.003460000000131913 | null / null | null / null |
| sample-1/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0024164999989579883 | 0.006097560975609756 / 0.009146341463414634 | 0.11604399999930592 / 0.12012099999856218 |
| sample-1/off/update-active | full | 24 | null | 관측되지 않음 | -0.007937520742416382 | null / null | null / null |
| sample-1/off/update-active-nogc | full | 24 | null | 기록 | -0.006083965301513672 | 0.006097560975609756 / 0.009146341463414634 | 0.35197898745536804 / 0.3616659641265869 |
| sample-1/off/update-wall | full | 24 | null | 관측되지 않음 | -0.007499499999937598 | null / null | null / null |
| sample-1/off/update-wall-nogc | full | 24 | null | 기록 | -0.006125000000110958 | 0.006097560975609756 / 0.009146341463414634 | 0.3503130000000283 / 0.3601250000001528 |
| sample-2/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-2/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0020325203252032522 / 0.0010162601626016261 | 1 / 1 |
| sample-2/off/mount-active | full | 24 | null | 관측되지 않음 | 0.006668034332250272 | null / null | null / null |
| sample-2/off/mount-active-nogc | full | 24 | null | 기록 | 0.03564598965641608 | null / null | 1.4995829876022526 / 1.4799995210723864 |
| sample-2/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.00991700000002993 | null / null | null / null |
| sample-2/off/mount-wall-nogc | full | 24 | null | 기록 | 0.03868800000009287 | null / null | 3.998500000000149 / 3.957749999999919 |
| sample-2/off/profiler-mount | full | 24 | null | 기록 | 0.01372900000063737 | null / null | null / null |
| sample-2/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.032375500001307955 | null / null | 1.1980520000004162 / 1.1875204999994367 |
| sample-2/off/profiler-update | full | 24 | null | 기록 | -0.00004100000029438888 | null / null | null / null |
| sample-2/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0034330000007685157 | 0.0020325203252032522 / 0.0010162601626016261 | 0.12945649999983289 / 0.12753900000120666 |
| sample-2/off/update-active | full | 24 | null | 관측되지 않음 | -0.00941699743270874 | null / null | null / null |
| sample-2/off/update-active-nogc | full | 24 | null | 기록 | 0.0027499794960021973 | 0.0020325203252032522 / 0.0010162601626016261 | 0.37070900201797485 / 0.36629098653793335 |
| sample-2/off/update-wall | full | 24 | null | 관측되지 않음 | -0.009791500000005726 | null / null | null / null |
| sample-2/off/update-wall-nogc | full | 24 | null | 기록 | 0.0026454999999714346 | 0.0020325203252032522 / 0.0010162601626016261 | 0.36906249999992724 / 0.3642499999998563 |
| sample-3/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-3/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0010162601626016261 / 0 | 1 / 1 |
| sample-3/off/mount-active | full | 24 | null | 관측되지 않음 | -0.0010189666023165955 | null / null | null / null |
| sample-3/off/mount-active-nogc | full | 24 | null | 기록 | -0.01270900044062273 | null / null | 5.392042016029336 / 5.3803340144519325 |
| sample-3/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.003791999999862128 | null / null | null / null |
| sample-3/off/mount-wall-nogc | full | 24 | null | 기록 | -0.007333000000016909 | null / null | 7.872875000000022 / 7.873937500000125 |
| sample-3/off/profiler-mount | full | 24 | null | 기록 | -0.0091550000010443 | null / null | null / null |
| sample-3/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.004086500000653359 | null / null | 4.609740500000953 / 4.608439500000259 |
| sample-3/off/profiler-update | full | 24 | null | 기록 | 0.0016479999999887696 | null / null | null / null |
| sample-3/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0016459999998232888 | 0.0010162601626016261 / 0 | 0.1245380000023033 / 0.12535700000034922 |
| sample-3/off/update-active | full | 24 | null | 관측되지 않음 | 0.004187554121017456 | null / null | null / null |
| sample-3/off/update-active-nogc | full | 24 | null | 기록 | -0.0006245076656341553 | 0.0010162601626016261 / 0 | 0.38962501287460327 / 0.3904370367527008 |
| sample-3/off/update-wall | full | 24 | null | 관측되지 않음 | 0.004208499999947435 | null / null | null / null |
| sample-3/off/update-wall-nogc | full | 24 | null | 기록 | -0.0002915000000029977 | 0.0010162601626016261 / 0 | 0.3869159999999283 / 0.38802099999998063 |
