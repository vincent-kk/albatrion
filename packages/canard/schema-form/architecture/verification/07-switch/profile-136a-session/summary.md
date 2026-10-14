# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 4000.468초이며 확인 측정은 0.000초이고 보고 계산은 0.105초입니다.
프로세스 준비 시간의 합은 145.905초이며 예열은 1269.739초, 강제 GC는 265.137초, 표본은 2506.156초, digest는 511.545초입니다.
시계 밖 minor GC는 35.081초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 3697.821초이며 확인 여유는 1200.000초이고 합계는 4897.821초입니다. 예산은 7099.926초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 4000.409초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2786.757 |
| flat-100 | 192.180 |
| nested-d3-f4 | 174.472 |
| flat-50 | 135.051 |
| sample-3 | 123.819 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-500/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-500/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-500/off/mount-active | full | 24 | null | 관측되지 않음 | 5.9081465206490975 | null / null | null / null |
| array-500/off/mount-active-nogc | full | 24 | null | 기록 | 7.953604479018395 | null / null | null / null |
| array-500/off/mount-wall | full | 24 | null | 관측되지 않음 | 7.411457500000324 | null / null | null / null |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | 8.837145000001328 | null / null | null / null |
| array-500/off/profiler-mount | full | 24 | null | 기록 | 3.839117499893291 | null / null | null / null |
| array-500/off/profiler-mount-nogc | full | 24 | null | 기록 | 5.361454999612761 | null / null | null / null |
| array-500/off/profiler-update | full | 24 | null | 기록 | 0.010227499980828725 | null / null | null / null |
| array-500/off/profiler-update-nogc | full | 24 | null | 기록 | 0.006679999976768158 | 0 / 0 | 0.4087869999129907 / 0.39699650001784903 |
| array-500/off/update-active | full | 24 | null | 관측되지 않음 | 2.932687520980835 | null / null | null / null |
| array-500/off/update-active-nogc | full | 24 | null | 기록 | 0.035166531801223755 | 0 / 0 | 1.1708539724349976 / 1.1397500038146973 |
| array-500/off/update-wall | full | 24 | null | 관측되지 않음 | 2.931542000000263 | null / null | null / null |
| array-500/off/update-wall-nogc | full | 24 | null | 기록 | 0.03702100000373321 | 0 / 0 | 1.1660210000009101 / 1.134249999999156 |
| computed-visible-derived/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| computed-visible-derived/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| computed-visible-derived/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0020325203252032522 / 0.0027100271002710027 | 3 / 3 |
| computed-visible-derived/off/mount-active | full | 24 | null | 관측되지 않음 | 0.009374501668958146 | null / null | null / null |
| computed-visible-derived/off/mount-active-nogc | full | 24 | null | 기록 | 0.015916482412364985 | null / null | 1.4033329746171148 / 1.3983549658698848 |
| computed-visible-derived/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.014708499999926516 | null / null | null / null |
| computed-visible-derived/off/mount-wall-nogc | full | 24 | null | 기록 | 0.019290999999952874 | null / null | 3.646792000000005 / 3.6142289999999093 |
| computed-visible-derived/off/profiler-mount | full | 24 | null | 기록 | 0.0008345000004510439 | null / null | null / null |
| computed-visible-derived/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.007025499997666884 | null / null | 1.0745069999998123 / 1.0672064999989743 |
| computed-visible-derived/off/profiler-update | full | 24 | null | 기록 | 0.018431500000701817 | null / null | null / null |
| computed-visible-derived/off/profiler-update-nogc | full | 24 | null | 기록 | 0.022911500000986962 | 0.0020325203252032522 / 0.0027100271002710027 | 0.5418089999990343 / 0.5327464999987797 |
| computed-visible-derived/off/update-active | full | 24 | null | 관측되지 않음 | 0.08439597487449646 | null / null | null / null |
| computed-visible-derived/off/update-active-nogc | full | 24 | null | 기록 | 0.033124953508377075 | 0.0020325203252032522 / 0.0027100271002710027 | 1.516873985528946 / 1.5100834369659424 |
| computed-visible-derived/off/update-wall | full | 24 | null | 관측되지 않음 | 0.08404050000007146 | null / null | null / null |
| computed-visible-derived/off/update-wall-nogc | full | 24 | null | 기록 | 0.03299900000013167 | 0.0020325203252032522 / 0.0027100271002710027 | 1.5149585000002617 / 1.5079374999999118 |
| flat-100/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-100/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-100/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0001016260162601626 / 0 | 10 / 10 |
| flat-100/off/mount-active | full | 24 | null | 관측되지 않음 | 0.2637925588529697 | null / null | null / null |
| flat-100/off/mount-active-nogc | full | 24 | null | 기록 | 0.3586890133515226 | null / null | 10.907585029857728 / 10.487541992132265 |
| flat-100/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.19516650000002755 | null / null | null / null |
| flat-100/off/mount-wall-nogc | full | 24 | null | 기록 | 0.3367079999998168 | null / null | 13.080540999999812 / 12.626562499999864 |
| flat-100/off/profiler-mount | full | 24 | null | 기록 | 0.11981000000764652 | null / null | null / null |
| flat-100/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.20168900000862777 | null / null | 8.91327300000421 / 8.74976300000526 |
| flat-100/off/profiler-update | full | 24 | null | 기록 | 0.006799500000852277 | null / null | null / null |
| flat-100/off/profiler-update-nogc | full | 24 | null | 기록 | 0.033908500005281894 | 0.0001016260162601626 / 0 | 0.928207999994811 / 0.8599019999965094 |
| flat-100/off/update-active | full | 24 | null | 관측되지 않음 | -0.018189847469329834 | null / null | null / null |
| flat-100/off/update-active-nogc | full | 24 | null | 기록 | 0.08035549521446228 | 0.0001016260162601626 / 0 | 3.0539590716362 / 2.8677919507026672 |
| flat-100/off/update-wall | full | 24 | null | 관측되지 않음 | -0.016352499999811698 | null / null | null / null |
| flat-100/off/update-wall-nogc | full | 24 | null | 기록 | 0.07454099999858954 | 0.0001016260162601626 / 0 | 3.0465830000007372 / 2.862268999999287 |
| flat-50/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| flat-50/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| flat-50/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0001016260162601626 / 0.0001016260162601626 | 10 / 10 |
| flat-50/off/mount-active | full | 24 | null | 관측되지 않음 | 0.015854023475526446 | null / null | null / null |
| flat-50/off/mount-active-nogc | full | 24 | null | 기록 | 0.10643697025295751 | null / null | 5.756499981439674 / 5.689291463045265 |
| flat-50/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0037495000000262735 | null / null | null / null |
| flat-50/off/mount-wall-nogc | full | 24 | null | 기록 | 0.12031249999972715 | null / null | 7.970187499999838 / 7.8892709999997805 |
| flat-50/off/profiler-mount | full | 24 | null | 기록 | 0.043339500009665244 | null / null | null / null |
| flat-50/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.05850400001509115 | null / null | 4.817018500005815 / 4.773381499996276 |
| flat-50/off/profiler-update | full | 24 | null | 기록 | 0.02682849999825976 | null / null | null / null |
| flat-50/off/profiler-update-nogc | full | 24 | null | 기록 | 0.02732849999551945 | 0.0001016260162601626 / 0.0001016260162601626 | 0.802283000011812 / 0.7531590000007782 |
| flat-50/off/update-active | full | 24 | null | 관측되지 않음 | 0.06118899583816528 | null / null | null / null |
| flat-50/off/update-active-nogc | full | 24 | null | 기록 | 0.11839652061462402 | 0.0001016260162601626 / 0.0001016260162601626 | 2.7112908363342285 / 2.5782068967819214 |
| flat-50/off/update-wall | full | 24 | null | 관측되지 않음 | 0.06135449999993625 | null / null | null / null |
| flat-50/off/update-wall-nogc | full | 24 | null | 기록 | 0.11848100000042905 | 0.0001016260162601626 / 0.0001016260162601626 | 2.7068740000004254 / 2.5731270000014774 |
| nested-d3-f4/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| nested-d3-f4/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| nested-d3-f4/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0002032520325203252 / 0.0003048780487804878 | 10 / 10 |
| nested-d3-f4/off/mount-active | full | 24 | null | 관측되지 않음 | 0.02129150205416863 | null / null | null / null |
| nested-d3-f4/off/mount-active-nogc | full | 24 | null | 기록 | 0.12718797091315537 | null / null | 8.832374529270055 / 8.73360400643719 |
| nested-d3-f4/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.05083299999984092 | null / null | null / null |
| nested-d3-f4/off/mount-wall-nogc | full | 24 | null | 기록 | 0.08681299999989278 | null / null | 11.037645999999995 / 10.893499999999904 |
| nested-d3-f4/off/profiler-mount | full | 24 | null | 기록 | 0.033823499994809936 | null / null | null / null |
| nested-d3-f4/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.01708849999999984 | null / null | 7.302254000004723 / 7.247041499991383 |
| nested-d3-f4/off/profiler-update | full | 24 | null | 기록 | 0.0008825000003298555 | null / null | null / null |
| nested-d3-f4/off/profiler-update-nogc | full | 24 | null | 기록 | 0.003615000005765978 | 0.0002032520325203252 / 0.0003048780487804878 | 0.9961139999966235 / 0.9867320000043946 |
| nested-d3-f4/off/update-active | full | 24 | null | 관측되지 않음 | 0.03004094958305359 | null / null | null / null |
| nested-d3-f4/off/update-active-nogc | full | 24 | null | 기록 | 0.024499893188476562 | 0.0002032520325203252 / 0.0003048780487804878 | 3.099353462457657 / 3.02300101518631 |
| nested-d3-f4/off/update-wall | full | 24 | null | 관측되지 않음 | 0.0300825000003897 | null / null | null / null |
| nested-d3-f4/off/update-wall-nogc | full | 24 | null | 기록 | 0.02527149999991707 | 0.0002032520325203252 / 0.0003048780487804878 | 3.0924369999997907 / 3.015834000000723 |
| oneOf-10/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-10/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-10/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0.001524390243902439 | 2 / 2 |
| oneOf-10/off/mount-active | full | 24 | null | 관측되지 않음 | 0.039333504199902336 | null / null | null / null |
| oneOf-10/off/mount-active-nogc | full | 24 | null | 기록 | -0.014729026079294272 | null / null | 1.926145535139085 / 1.9217919969557897 |
| oneOf-10/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.042854499999975815 | null / null | null / null |
| oneOf-10/off/mount-wall-nogc | full | 24 | null | 기록 | -0.006208499999843298 | null / null | 4.166978999999969 / 4.1570829999998296 |
| oneOf-10/off/profiler-mount | full | 24 | null | 기록 | 0.06085550000074136 | null / null | null / null |
| oneOf-10/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.004692000000090957 | null / null | 1.5595164999987219 / 1.5583339999986947 |
| oneOf-10/off/profiler-update | full | 24 | null | 기록 | 0.03887099999928978 | null / null | null / null |
| oneOf-10/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0020094999998718777 | 0 / 0.001524390243902439 | 1.0245359999991024 / 1.010489999999436 |
| oneOf-10/off/update-active | full | 24 | null | 관측되지 않음 | 0.061479538679122925 | null / null | null / null |
| oneOf-10/off/update-active-nogc | full | 24 | null | 기록 | 0.01897907257080078 | 0 / 0.001524390243902439 | 2.5727919936180115 / 2.5247920155525208 |
| oneOf-10/off/update-wall | full | 24 | null | 관측되지 않음 | 0.05839500000013231 | null / null | null / null |
| oneOf-10/off/update-wall-nogc | full | 24 | null | 기록 | 0.024603499999898304 | 0 / 0.001524390243902439 | 2.568749499999967 / 2.5201660000000174 |
| oneOf-20/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-20/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-20/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.003048780487804878 / 0.003556910569105691 | 2 / 2 |
| oneOf-20/off/mount-active | full | 24 | null | 관측되지 않음 | 0.01841699517632378 | null / null | null / null |
| oneOf-20/off/mount-active-nogc | full | 24 | null | 기록 | -0.0023535245019274953 | null / null | 2.3716249790190886 / 2.3443754907569883 |
| oneOf-20/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.024958500000025197 | null / null | null / null |
| oneOf-20/off/mount-wall-nogc | full | 24 | null | 기록 | -0.0036039999999957217 | null / null | 4.612166000000116 / 4.588666500000045 |
| oneOf-20/off/profiler-mount | full | 24 | null | 기록 | -0.021274000001199056 | null / null | null / null |
| oneOf-20/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.005046000001016182 | null / null | 1.9868189999997412 / 1.9808929999999236 |
| oneOf-20/off/profiler-update | full | 24 | null | 기록 | -0.010468500000683889 | null / null | null / null |
| oneOf-20/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0013780000008409843 | 0.003048780487804878 / 0.003556910569105691 | 1.0120239999972682 / 1.015547000000197 |
| oneOf-20/off/update-active | full | 24 | null | 관측되지 않음 | 0.018833011388778687 | null / null | null / null |
| oneOf-20/off/update-active-nogc | full | 24 | null | 기록 | 0.0008545219898223877 | 0.003048780487804878 / 0.003556910569105691 | 2.7286874651908875 / 2.7506250143051147 |
| oneOf-20/off/update-wall | full | 24 | null | 관측되지 않음 | 0.02077049999996916 | null / null | null / null |
| oneOf-20/off/update-wall-nogc | full | 24 | null | 기록 | 0.0011875000001282388 | 0.003048780487804878 / 0.003556910569105691 | 2.725166500000114 / 2.7466669999998885 |
| oneOf-5/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| oneOf-5/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| oneOf-5/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0005081300813008131 / 0.001524390243902439 | 2 / 2 |
| oneOf-5/off/mount-active | full | 24 | null | 관측되지 않음 | -0.029353484172787603 | null / null | null / null |
| oneOf-5/off/mount-active-nogc | full | 24 | null | 기록 | 0.029791009115342604 | null / null | 1.7343964867038721 / 1.7268115059605407 |
| oneOf-5/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.014146000000096137 | null / null | null / null |
| oneOf-5/off/mount-wall-nogc | full | 24 | null | 기록 | 0.02110450000009223 | null / null | 3.9745410000000447 / 3.9658130000000256 |
| oneOf-5/off/profiler-mount | full | 24 | null | 기록 | -0.035917499999868596 | null / null | null / null |
| oneOf-5/off/profiler-mount-nogc | full | 24 | null | 기록 | 0.010454999999524262 | null / null | 1.3773029999997561 / 1.3611999999993714 |
| oneOf-5/off/profiler-update | full | 24 | null | 기록 | 0.017348500000252898 | null / null | null / null |
| oneOf-5/off/profiler-update-nogc | full | 24 | null | 기록 | 0.010750000001280569 | 0.0005081300813008131 / 0.001524390243902439 | 1.0160440000006474 / 1.0216709999992872 |
| oneOf-5/off/update-active | full | 24 | null | 관측되지 않음 | 0.03831198811533909 | null / null | null / null |
| oneOf-5/off/update-active-nogc | full | 24 | null | 기록 | -0.023875415325164795 | 0.0005081300813008131 / 0.001524390243902439 | 2.418876051902771 / 2.472833037376404 |
| oneOf-5/off/update-wall | full | 24 | null | 관측되지 않음 | 0.03943749999990587 | null / null | null / null |
| oneOf-5/off/update-wall-nogc | full | 24 | null | 기록 | -0.023686999999881664 | 0.0005081300813008131 / 0.001524390243902439 | 2.416332999999895 / 2.4679590000000644 |
| sample-0/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-0/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-0/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0010162601626016261 / 0.0010162601626016261 | 1 / 1 |
| sample-0/off/mount-active | full | 24 | null | 관측되지 않음 | 0.035520519733424294 | null / null | null / null |
| sample-0/off/mount-active-nogc | full | 24 | null | 기록 | -0.019562976066652027 | null / null | 1.0899579828338801 / 1.1119169569016094 |
| sample-0/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.0391664999999648 | null / null | null / null |
| sample-0/off/mount-wall-nogc | full | 24 | null | 기록 | -0.03377049999994597 | null / null | 3.332540999999992 / 3.3575000000000728 |
| sample-0/off/profiler-mount | full | 24 | null | 기록 | 0.0005450000003861533 | null / null | null / null |
| sample-0/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.02017600000033326 | null / null | 0.7665789999982735 / 0.7729990000032103 |
| sample-0/off/profiler-update | full | 24 | null | 기록 | 0.0013964999997142513 | null / null | null / null |
| sample-0/off/profiler-update-nogc | full | 24 | null | 기록 | -0.004234000001133609 | 0.0010162601626016261 / 0.0010162601626016261 | 0.1611269999978049 / 0.16391699999917364 |
| sample-0/off/update-active | full | 24 | null | 관측되지 않음 | 0.001624971628189087 | null / null | null / null |
| sample-0/off/update-active-nogc | full | 24 | null | 기록 | -0.010291486978530884 | 0.0010162601626016261 / 0.0010162601626016261 | 0.5037909746170044 / 0.5013339519500732 |
| sample-0/off/update-wall | full | 24 | null | 관측되지 않음 | 0.0024165000000380132 | null / null | null / null |
| sample-0/off/update-wall-nogc | full | 24 | null | 기록 | -0.010874999999941792 | 0.0010162601626016261 / 0.0010162601626016261 | 0.5014579999999569 / 0.49908400000003894 |
| sample-1/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-1/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-1/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.006097560975609756 / 0.003048780487804878 | 1 / 1 |
| sample-1/off/mount-active | full | 24 | null | 관측되지 않음 | 0.03491649436955413 | null / null | null / null |
| sample-1/off/mount-active-nogc | full | 24 | null | 기록 | -0.03466501129724975 | null / null | 1.882333988941241 / 1.912583011921015 |
| sample-1/off/mount-wall | full | 24 | null | 관측되지 않음 | 0.054166500000008 | null / null | null / null |
| sample-1/off/mount-wall-nogc | full | 24 | null | 기록 | -0.022499999999922693 | null / null | 4.122895500000027 / 4.146333000000141 |
| sample-1/off/profiler-mount | full | 24 | null | 기록 | 0.018850000000156797 | null / null | null / null |
| sample-1/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.03556250000178807 | null / null | 1.4552474999991318 / 1.477829000001293 |
| sample-1/off/profiler-update | full | 24 | null | 기록 | 0.005558499999722244 | null / null | null / null |
| sample-1/off/profiler-update-nogc | full | 24 | null | 기록 | 0.0018415000004097237 | 0.006097560975609756 / 0.003048780487804878 | 0.1677274999999554 / 0.16400799999928495 |
| sample-1/off/update-active | full | 24 | null | 관측되지 않음 | 0.001333475112915039 | null / null | null / null |
| sample-1/off/update-active-nogc | full | 24 | null | 기록 | 0.009208500385284424 | 0.006097560975609756 / 0.003048780487804878 | 0.5231040120124817 / 0.515125036239624 |
| sample-1/off/update-wall | full | 24 | null | 관측되지 않음 | 0.001188000000070133 | null / null | null / null |
| sample-1/off/update-wall-nogc | full | 24 | null | 기록 | 0.010146500000132619 | 0.006097560975609756 / 0.003048780487804878 | 0.5209794999999531 / 0.5130830000000515 |
| sample-2/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-2/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-2/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.003048780487804878 / 0.00508130081300813 | 1 / 1 |
| sample-2/off/mount-active | full | 24 | null | 관측되지 않음 | -0.0074995139198392735 | null / null | null / null |
| sample-2/off/mount-active-nogc | full | 24 | null | 기록 | 0.008043010215658342 | null / null | 1.7051670076293703 / 1.709791995231626 |
| sample-2/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.019730000000038217 | null / null | null / null |
| sample-2/off/mount-wall-nogc | full | 24 | null | 기록 | 0.01606349999997292 | null / null | 3.9482285000000275 / 3.9533329999999296 |
| sample-2/off/profiler-mount | full | 24 | null | 기록 | -0.005812000000673834 | null / null | null / null |
| sample-2/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.009471000001212815 | null / null | 1.3168034999996507 / 1.330462000000125 |
| sample-2/off/profiler-update | full | 24 | null | 기록 | 0.0010260000001380831 | null / null | null / null |
| sample-2/off/profiler-update-nogc | full | 24 | null | 기록 | -0.004322499999716456 | 0.003048780487804878 / 0.00508130081300813 | 0.1736240000007001 / 0.1753389999994397 |
| sample-2/off/update-active | full | 24 | null | 관측되지 않음 | 0.008166998624801636 | null / null | null / null |
| sample-2/off/update-active-nogc | full | 24 | null | 기록 | 0.0005420148372650146 | 0.003048780487804878 / 0.00508130081300813 | 0.5164999961853027 / 0.5272080302238464 |
| sample-2/off/update-wall | full | 24 | null | 관측되지 않음 | 0.009290999999961969 | null / null | null / null |
| sample-2/off/update-wall-nogc | full | 24 | null | 기록 | 0.0004794999999830907 | 0.003048780487804878 / 0.00508130081300813 | 0.5139170000002196 / 0.5249589999998534 |
| sample-3/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | 2 / 2 |
| sample-3/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| sample-3/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0.0010162601626016261 / 0.0020325203252032522 | 1 / 1 |
| sample-3/off/mount-active | full | 24 | null | 관측되지 않음 | -0.10756247738657976 | null / null | null / null |
| sample-3/off/mount-active-nogc | full | 24 | null | 기록 | 0.031874507188945245 | null / null | 6.283166488794336 / 6.233729486501602 |
| sample-3/off/mount-wall | full | 24 | null | 관측되지 않음 | -0.09239550000006602 | null / null | null / null |
| sample-3/off/mount-wall-nogc | full | 24 | null | 기록 | 0.02158350000001974 | null / null | 8.466958499999919 / 8.434207999999899 |
| sample-3/off/profiler-mount | full | 24 | null | 기록 | -0.10390400000056843 | null / null | null / null |
| sample-3/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.006447499988780692 | null / null | 5.220219000001293 / 5.22436849999508 |
| sample-3/off/profiler-update | full | 24 | null | 기록 | 0.005873499999324849 | null / null | null / null |
| sample-3/off/profiler-update-nogc | full | 24 | null | 기록 | 0.005777500000931468 | 0.0010162601626016261 / 0.0020325203252032522 | 0.1762500000008913 / 0.17328900000029535 |
| sample-3/off/update-active | full | 24 | null | 관측되지 않음 | 0.00404202938079834 | null / null | null / null |
| sample-3/off/update-active-nogc | full | 24 | null | 기록 | 0.006062030792236328 | 0.0010162601626016261 / 0.0020325203252032522 | 0.586667001247406 / 0.5766250193119049 |
| sample-3/off/update-wall | full | 24 | null | 관측되지 않음 | 0.002645499999914591 | null / null | null / null |
| sample-3/off/update-wall-nogc | full | 24 | null | 기록 | 0.006583500000033382 | 0.0010162601626016261 / 0.0020325203252032522 | 0.5827080000003662 / 0.5738545000001523 |
