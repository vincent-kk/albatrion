# 131 react 측정 세션 결과입니다.

세션 종류는 verdict이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 4967.334초이며 확인 측정은 0.000초이고 보고 계산은 0.016초입니다.
프로세스 준비 시간의 합은 10.606초이며 예열은 1617.185초, 강제 GC는 95.337초, 표본은 3298.097초, digest는 818.463초입니다.
시계 밖 minor GC는 4.308초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 ADOPT입니다.
실행 전 추정은 5000.012초이며 확인 여유는 1250.003초이고 합계는 6250.015초입니다. 예산은 7099.965초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 4967.313초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-1000 | 4963.538 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-1000/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-1000/off/mount-active | full | 24 | null | 관측되지 않음 | 3.929020500569095 | null / null | null / null |
| array-1000/off/mount-active-nogc | full | 24 | null | 기록 | 1.9982290237021516 | null / null | null / null |
| array-1000/off/mount-wall | full | 24 | null | 관측되지 않음 | 3.0170825000004697 | null / null | null / null |
| array-1000/off/mount-wall-nogc | full | 24 | null | 기록 | 1.8931875000125729 | null / null | null / null |
| array-1000/off/profiler-mount | full | 24 | null | 기록 | -0.03492049999840674 | null / null | null / null |
| array-1000/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.3411794998028199 | null / null | null / null |
| array-1000/off/profiler-update | full | 24 | null | 기록 | 0.00794550009413797 | null / null | null / null |
| array-1000/off/profiler-update-nogc | full | 24 | null | 기록 | 0.001081500253349077 | 0 / 0 | 0.5422909999979311 / 0.5419785001140554 |
| array-1000/off/update-active | full | 24 | null | 관측되지 않음 | 0.07041651010513306 | null / null | null / null |
| array-1000/off/update-active-nogc | full | 24 | null | 기록 | -0.009978502988815308 | 0 / 0 | 1.3294165134429932 / 1.324999988079071 |
| array-1000/off/update-wall | full | 24 | null | 관측되지 않음 | 0.07116750000204775 | null / null | null / null |
| array-1000/off/update-wall-nogc | full | 24 | null | 기록 | -0.00470849999692291 | 0 / 0 | 1.325583000005281 / 1.3212710000007064 |
