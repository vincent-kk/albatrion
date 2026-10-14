# 131 react 측정 세션 결과입니다.

세션 종류는 confirm이며 실행 상태는 passed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 4770.393초이며 확인 측정은 4770.202초이고 보고 계산은 0.021초입니다.
프로세스 준비 시간의 합은 10.538초이며 예열은 1553.268초, 강제 GC는 94.194초, 표본은 3166.344초, digest는 783.451초입니다.
시계 밖 minor GC는 5.093초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 0개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 REJECT입니다.
실행 전 추정은 5000.012초이며 확인 여유는 0.000초이고 합계는 5000.012초입니다. 예산은 7099.852초이며 적합 여부는 true입니다.
모든 fixture의 비용 표본이 없어 전체 세션 시간을 추정할 수 없습니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |
| array-1000 | 0.000 |

구간 방법은 order-statistic median interval: largest k with P(Binom(n, 1/2) <= k-1) <= 0.005; [sorted[k-1], sorted[n-k]]; exact coverage >= 0.99; unbounded for n < 8입니다.
상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |
| array-1000/off/commits-mount | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-mount-nogc | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-update | full | 24 | null | 기록 | 0 | null / null | null / null |
| array-1000/off/commits-update-nogc | full | 24 | null | 기록 | 0 | 0 / 0 | 1 / 1 |
| array-1000/off/mount-active | full | 24 | null | 관측되지 않음 | 10.087020514067262 | null / null | null / null |
| array-1000/off/mount-active-nogc | full | 24 | null | 기록 | 30.41214553880127 | null / null | null / null |
| array-1000/off/mount-wall | full | 24 | null | 관측되지 않음 | 10.315749999994296 | null / null | null / null |
| array-1000/off/mount-wall-nogc | full | 24 | null | 기록 | 29.61085450000246 | null / null | null / null |
| array-1000/off/profiler-mount | full | 24 | null | 기록 | 4.848698998870532 | null / null | null / null |
| array-1000/off/profiler-mount-nogc | full | 24 | null | 기록 | 20.548778503340145 | null / null | null / null |
| array-1000/off/profiler-update | full | 24 | null | 기록 | -0.007677499983401503 | null / null | null / null |
| array-1000/off/profiler-update-nogc | full | 24 | null | 기록 | 0.016704499939805828 | 0 / 0 | 0.5456244999804767 / 0.5231805001894827 |
| array-1000/off/update-active | full | 24 | 24 | 확인됨 | -0.14331254363059998 | null / null | null / null |
| array-1000/off/update-active-nogc | full | 24 | null | 기록 | 0.014000028371810913 | 0 / 0 | 1.3221249878406525 / 1.3062289655208588 |
| array-1000/off/update-wall | full | 24 | 24 | 확인됨 | -0.13972949999879347 | null / null | null / null |
| array-1000/off/update-wall-nogc | full | 24 | null | 기록 | 0.014292500003648456 | 0 / 0 | 1.3190000000031432 / 1.3023954999953276 |
