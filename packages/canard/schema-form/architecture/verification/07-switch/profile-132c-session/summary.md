# 131 react 측정 세션 결과입니다.

세션 종류는 aa이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 5287.422초이며 확인 측정은 0.000초이고 보고 계산은 0.014초입니다.
프로세스 준비 시간의 합은 46.276초이며 예열은 1721.042초, 강제 GC는 151.571초, 표본은 3462.564초, digest는 727.458초입니다.
시계 밖 minor GC는 14.683초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 16개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 AA_PASS입니다. 축소 비표시 행은 줄인 검출력에서 관측되지 않음으로 해석합니다.
실행 전 추정은 5318.798초이며 확인 여유는 1329.700초이고 합계는 6648.498초입니다. 예산은 7099.990초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 5287.406초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-500 | 2474.593 |
| array-1000 | 1681.781 |
| array-replace-200 | 925.401 |
| flat-50 | 113.995 |
| oneOf-20 | 84.234 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

| A/A 집합입니다. | 0 제외/판정 행입니다. | 99% 이항 범위입니다. | 범위 안입니다. |
| --- | ---: | --- | --- |
| reduced | 0/4 | 0~1 | true |
| full | 0/0 | 0~0 | true |
| total | 0/4 | 0~1 | true |
세 범위가 모두 안에 있고 유한한 구간이 있을 때만 A/A를 통과하며 결과는 true입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-1000/off/commits-mount | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-mount-nogc | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-update | reduced | 8 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-update-nogc | reduced | 8 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-1000/off/mount-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.04439550557799521 | null / null | null / null |
| array-1000/off/mount-active-nogc | reduced | 8 | null | 기록 | -0.6794579690977116 | null / null | null / null |
| array-1000/off/mount-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.5270834999937506 | null / null | null / null |
| array-1000/off/mount-wall-nogc | reduced | 8 | null | 기록 | -0.679062499992142 | null / null | null / null |
| array-1000/off/profiler-mount | reduced | 8 | null | 기록 | 1.1969030002983345 | null / null | null / null |
| array-1000/off/profiler-mount-nogc | reduced | 8 | null | 기록 | 0.48779900002409704 | null / null | null / null |
| array-1000/off/profiler-update | reduced | 8 | null | 기록 | -0.004496500245295465 | null / null | null / null |
| array-1000/off/profiler-update-nogc | reduced | 8 | null | 기록 | 0.002218500114395283 | 0 / 0 | 0.557681999860506 / 0.5420054999922286 |
| array-1000/off/update-active | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.02937445044517517 | null / null | null / null |
| array-1000/off/update-active-nogc | reduced | 8 | null | 기록 | 0.02539554238319397 | 0 / 0 | 1.3565624952316284 / 1.3337295055389404 |
| array-1000/off/update-wall | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 | 0.029187500000261934 | null / null | null / null |
| array-1000/off/update-wall-nogc | reduced | 8 | null | 기록 | 0.026353999994171318 | 0 / 0 | 1.353103999994346 / 1.3301040000005742 |
| array-500/off/mount-wall-nogc | full | 24 | null | 기록 | -2.2106449999955657 | null / null | null / null |
| array-replace-200/off/profiler-mount | full | 24 | null | 기록 | 0.0009814999993977835 | null / null | null / null |
| flat-50/off/profiler-update-nogc | full | 24 | null | 기록 | -0.0055899999986195326 | 0 / 0.0001016260162601626 | 0.5333595000076912 / 0.5397399999983463 |
| oneOf-20/off/profiler-mount-nogc | full | 24 | null | 기록 | -0.010208500001454013 | null / null | 1.683615999997528 / 1.6994175000011182 |
| oneOf-20/off/profiler-update-nogc | full | 24 | null | 기록 | -0.005413500000145177 | 0.001524390243902439 / 0.003048780487804878 | 0.8119549999976243 / 0.8161635000004708 |
