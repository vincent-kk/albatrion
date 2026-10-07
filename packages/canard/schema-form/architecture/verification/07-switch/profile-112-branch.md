# 112라운드 — sentinel 정정과 고정 분기 전환 귀속

2026-10-07. HEAD `bef81f4d747d028b05082d594138148520e4d992`, v26.10.0, V8 14.6.202.34-node.35, Apple M1 Max. 범위는 109C-01의 측정기 정정과 귀속입니다. 편집자 결정은 `git show origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-109-closing.md`로 읽었습니다. 현재 HEAD에는 그 파일이 없으므로 읽은 ref를 명시합니다. 제품 구현은 바꾸지 않았습니다. 설치·git 쓰기는 하지 않았으며 보고서와 측정 도구만 이 worktree 안에서 다뤘습니다.

sentinel을 (가)에서 제외하면 111 원자료의 104개 고유 행이 pooled와 세 회차에서 모두 통과합니다. 수치가 바뀌는 행은 103개이며, 통과 여부가 바뀌는 행은 array-100 OFF BF·첫 갱신 둘입니다. 배열 100/500/1000을 같은 공식 설계로 다시 실행한 12행도 모두 통과합니다. 원래 성능 배율·소유자 수용은 그대로이며 분기 91 기준 ①의 미달은 해소된 것이 아닙니다.

무관 분기의 방문에는 계약이 요구하는 식 평가와 반복 장부가 섞여 있습니다. 첫 전환의 실제 식 평가 16회/분기, 복귀와 이후의 8회/분기는 현행 계수 계약 그대로입니다. 추가 분기에서는 BF 경로 해석 33회·자식 후보 18회·투영 읽기 24회, 이후 11회·6회·8회가 반복됩니다. 실제 꺼진 payload 노드의 계산·생성·배달·검증은 0회입니다.

## 1. 110라운드 측정기 sentinel 정정

공식 측정기는 64 Promise 체크포인트 뒤 microtask 시계를 읽고 FIFO setImmediate sentinel을 기다립니다. 측정기 자신의 대기를 (가)의 엔진 작업으로 읽지 않도록 같은 microtask clock을 세 번째 열 `preSentinelCalibrationMs`로 보존했습니다. 엔진 예약·실행·sentinel 뒤 후속 작업이 0회라는 별도 경계 검증이 성립할 때에만 이 끝점을 사용합니다. (가)는 독립된 두 clock의 등가 검사가 아니라 이 독립 진단을 전제로 측정기 전용 꼬리를 제외한 검사입니다. 엔진 macrotask가 있는 행에는 이 복원이 성립하지 않으며 재측정이 필요합니다.

`medianᵢ[(sentinelᵢ−kC)−(microᵢ−kM)]`에서 `[(sentinelᵢ−preSentinelᵢ)−k(C−M)]`를 표본별로 정확히 제외하므로 남는 값은 `medianᵢ[(preSentinelᵢ−kM)−(microᵢ−kM)]`입니다. 두 열의 시점이 같아 0µs가 되는 것은 이 방법의 정의입니다. 0이라는 숫자 자체로 별도의 엔진 무작업 증거를 만들지 않았습니다. 원래 두 열·공식 median/p99·배율의 C/M·보수적 잡음과 seeded bootstrap·(나)·동률·OFF 1-pass/ON 2-pass FIFO는 유지했습니다.

변경은 [측정기](tools/measure-verdict-95c01.mjs)의 calibrationEnd 및 원시 열, [reporter](tools/report-verdict-95c01.mjs)의 (가) 끝점뿐입니다. 방법 문단은 [공식 검증 설명](verdict-95c01.md#검증-가나) 옆에 있습니다. reporter가 만드는 문서에도 정정 문단이 유지됩니다.

### 배열 fresh 재검증

array-100/500/1000 OFF를 각 fresh 세 회차 old→new / new→old / old→new, 예열 20·101표본·명시 GC·check anchor·외부 구독 0·onChange noop로 실행했습니다. 새 엔진/공식 표본에 계측은 없습니다. scheduler wrapper는 공식 표본 뒤에만 설치했습니다. old/new의 결과 digest가 같고 새 엔진 예약 및 후속 작업은 0회입니다. 빈 제어 표본 3636개, C=17.375µs, M=3.042µs, C−M=14.333µs입니다.

| 배열 | 작업 | 112 (가) 차이 / 잡음 µs | pooled·r1/r2/r3 | 111 배율·성능 판정 | 수용 |
| --- | --- | --- | --- | --- | --- |
| array-100 | 마운트 | 0.000 / 34.250 | 통과 · 통/통/통 | 0.510× · 충족 | — |
| array-100 | BF 갱신 | 0.000 / 9.750 | 통과 · 통/통/통 | 3.080× · 미달 | 소유자 수용(104라운드) |
| array-100 | 첫 갱신 | 0.000 / 9.750 | 통과 · 통/통/통 | 3.080× · 미달 | 소유자 수용(104라운드) |
| array-100 | 이후 갱신 | 0.000 / 29.460 | 통과 · 통/통/통 | 4.107× · 미달 | 소유자 수용(104라운드) |
| array-500 | 마운트 | 0.000 / 27.293 | 통과 · 통/통/통 | 0.427× · 충족 | — |
| array-500 | BF 갱신 | 0.000 / 7.375 | 통과 · 통/통/통 | 1.323× · 충족 | 소유자 수용(104라운드) |
| array-500 | 첫 갱신 | 0.000 / 7.375 | 통과 · 통/통/통 | 1.323× · 충족 | 소유자 수용(104라운드) |
| array-500 | 이후 갱신 | 0.000 / 6.000 | 통과 · 통/통/통 | 1.237× · 충족 | 소유자 수용(104라운드) |
| array-1000 | 마운트 | 0.000 / 77.125 | 통과 · 통/통/통 | 0.476× · 충족 | — |
| array-1000 | BF 갱신 | 0.000 / 8.001 | 통과 · 통/통/통 | 0.809× · 충족 | — |
| array-1000 | 첫 갱신 | 0.000 / 8.001 | 통과 · 통/통/통 | 0.809× · 충족 | — |
| array-1000 | 이후 갱신 | 0.000 / 6.168 | 통과 · 통/통/통 | 0.726× · 충족 | — |

111 표의 array-100 BF·첫 갱신의 `보류((가) 미통과)`를 **미달**로 바꿨습니다. 3.080×라는 성능 비율이 1.5×를 넘으므로 미달이며 **소유자 수용(104라운드)**은 유지합니다. array-500 BF·첫 1.323×와 array-1000 BF·첫 0.809×는 충족입니다. 이후 갱신은 각각 4.107× 미달·수용, 1.237× 충족·수용, 0.726× 충족입니다. 112의 fresh 잡음과 111의 당시 잡음은 다른 표본이므로 분리해 적었습니다.

종단간 확인 행은 array-100/off/update입니다. 수정한 canonical 측정기의 여섯 worker 원자료를 canonical reporter의 실제 validation loop에 넣어 `CANONICAL_ROW_END_TO_END_OK`를 얻었습니다. (가) pooled·세 회차 통과, 공식 새 값의 source=sentinel, old/new digest 일치, 모든 worker/esbuild 종료 0을 확인했습니다. 138개 전체 세션 전제는 한 행 확인에서 제외했으며 계산식을 별도로 베끼지 않았습니다. sentinel을 의도적으로 지연하는 [회귀 확인](profile-112-branch/check-sentinel.mjs)은 정정 전 세 번째 열 부재로 실패하고 정정 뒤 `SENTINEL_PLACEMENT_OK`입니다.

### 111 원자료 전체 재계산과 변경 행

104개 고유 측정 행 × 3회차 모두 새 엔진 scheduled, pendingAtSentinel, tailScheduled/tailExecuted가 0회임을 먼저 단언했습니다. 그래서 세 번째 열이 없는 111 raw에도 microtask clock에서 같은 pre-sentinel 끝점을 정확히 복원할 수 있습니다. **재측정이 필요한 111 행은 없습니다.** 108개 표시 행 중 네 개는 일반 표와 고정 축 표가 공유하는 마운트입니다. raw JSON은 고치지 않았고 [111 최종 표](profile-111-final.md)의 (가) 열만 이 복원 결과로 정정했습니다.

0회 근거는 p99 요약만이 아닙니다. 101개 진단의 p99는 최대값이 아니어서 요약 수치만으로 이상치 한 건을 배제할 수 없습니다. 그러나 원 도구의 observeBoundary는 각 진단 호출에서 scheduled=0, pendingAtSentinel=0, tailScheduled+tailExecuted=0을 직접 단언한 뒤에만 기록을 저장합니다. 111의 모든 worker 도구 SHA가 `956d8674d4d81fe52d3165cf30d94cc27d32a03c7afa3550729e6f4363f87473`인 원본과 같고 모든 worker가 자연 종료 0임을 대조했습니다. fresh 배열도 같은 per-observation 단언을 유지한 현재 도구의 SHA와 종료 0을 대조했습니다. 공식 표본에는 wrapper를 넣지 않으며 동일 fixture의 뒤 진단이 전제임은 그대로입니다. 원 111 HEAD와 현재 HEAD 사이 제품 src diff도 없습니다.

다음은 모든 104행입니다. 103행의 pooled 수치가 바뀌었고 배열 이외에서는 91행이 바뀌었습니다. `sample-3/off/update-later`는 원래부터 0µs여서 수치가 바뀌지 않습니다. 통과 판정은 array-100 BF·첫 둘만 바뀌며 다른 102행은 통과를 유지합니다. 회차별 전후 차이·기존 잡음·통과 결과는 summary의 `part1.recalculatedRows`에 있습니다.

| 픽스처 | 검증 | 작업 | 111 (가) µs → 정정 | 111 잡음 µs | 결과 변경 |
| --- | --- | --- | --- | --- | --- |
| sample-0 | off | 마운트 | 1.542 → 0.000 | 8.041 | 수치 변경·통과 유지 |
| sample-0 | off | BF 갱신 | 0.626 → 0.000 | 5.917 | 수치 변경·통과 유지 |
| sample-0 | off | 첫 갱신 | 0.626 → 0.000 | 5.917 | 수치 변경·통과 유지 |
| sample-0 | off | 이후 갱신 | 0.167 → 0.000 | 4.624 | 수치 변경·통과 유지 |
| sample-1 | off | 마운트 | 1.709 → 0.000 | 12.417 | 수치 변경·통과 유지 |
| sample-1 | off | BF 갱신 | 0.834 → 0.000 | 6.874 | 수치 변경·통과 유지 |
| sample-1 | off | 첫 갱신 | 0.834 → 0.000 | 6.874 | 수치 변경·통과 유지 |
| sample-1 | off | 이후 갱신 | 0.250 → 0.000 | 5.375 | 수치 변경·통과 유지 |
| sample-2 | off | 마운트 | 2.292 → 0.000 | 11.751 | 수치 변경·통과 유지 |
| sample-2 | off | BF 갱신 | 0.959 → 0.000 | 5.166 | 수치 변경·통과 유지 |
| sample-2 | off | 첫 갱신 | 0.959 → 0.000 | 5.166 | 수치 변경·통과 유지 |
| sample-2 | off | 이후 갱신 | 0.375 → 0.000 | 4.876 | 수치 변경·통과 유지 |
| sample-3 | off | 마운트 | 8.959 → 0.000 | 16.084 | 수치 변경·통과 유지 |
| sample-3 | off | BF 갱신 | 1.084 → 0.000 | 6.500 | 수치 변경·통과 유지 |
| sample-3 | off | 첫 갱신 | 1.084 → 0.000 | 6.500 | 수치 변경·통과 유지 |
| sample-3 | off | 이후 갱신 | 0.000 → 0.000 | 5.749 | 0 유지·통과 유지 |
| flat-50 | off | 마운트 | 2.542 → 0.000 | 12.123 | 수치 변경·통과 유지 |
| flat-50 | off | BF 갱신 | -0.996 → 0.000 | 59.081 | 수치 변경·통과 유지 |
| flat-50 | off | 첫 갱신 | 0.709 → 0.000 | 6.083 | 수치 변경·통과 유지 |
| flat-50 | off | 이후 갱신 | -0.708 → 0.000 | 4.626 | 수치 변경·통과 유지 |
| flat-100 | off | 마운트 | 4.625 → 0.000 | 18.250 | 수치 변경·통과 유지 |
| flat-100 | off | BF 갱신 | 14.255 → 0.000 | 47.200 | 수치 변경·통과 유지 |
| flat-100 | off | 첫 갱신 | 3.584 → 0.000 | 8.500 | 수치 변경·통과 유지 |
| flat-100 | off | 이후 갱신 | -0.792 → 0.000 | 5.165 | 수치 변경·통과 유지 |
| flat-500 | off | 마운트 | 11.625 → 0.000 | 25.625 | 수치 변경·통과 유지 |
| flat-500 | off | BF 갱신 | 0.130 → 0.000 | 45.411 | 수치 변경·통과 유지 |
| flat-500 | off | 첫 갱신 | 2.083 → 0.000 | 7.708 | 수치 변경·통과 유지 |
| flat-500 | off | 이후 갱신 | -0.749 → 0.000 | 4.749 | 수치 변경·통과 유지 |
| nested-d3-f4 | off | 마운트 | 3.625 → 0.000 | 13.459 | 수치 변경·통과 유지 |
| nested-d3-f4 | off | BF 갱신 | 20.754 → 0.000 | 47.287 | 수치 변경·통과 유지 |
| nested-d3-f4 | off | 첫 갱신 | 3.667 → 0.000 | 8.710 | 수치 변경·통과 유지 |
| nested-d3-f4 | off | 이후 갱신 | -0.667 → 0.000 | 4.708 | 수치 변경·통과 유지 |
| nested-d5-f4 | off | 마운트 | 12.917 → 0.000 | 103.665 | 수치 변경·통과 유지 |
| nested-d5-f4 | off | BF 갱신 | -3.079 → 0.000 | 48.958 | 수치 변경·통과 유지 |
| nested-d5-f4 | off | 첫 갱신 | 0.958 → 0.000 | 9.124 | 수치 변경·통과 유지 |
| nested-d5-f4 | off | 이후 갱신 | -0.667 → 0.000 | 4.290 | 수치 변경·통과 유지 |
| array-100 | off | 마운트 | 5.834 → 0.000 | 26.083 | 수치 변경·통과 유지 |
| array-100 | off | BF 갱신 | 12.667 → 0.000 | 8.541 | 보류 → 통과 |
| array-100 | off | 첫 갱신 | 12.667 → 0.000 | 8.541 | 보류 → 통과 |
| array-100 | off | 이후 갱신 | 4.125 → 0.000 | 33.958 | 수치 변경·통과 유지 |
| array-500 | off | 마운트 | 11.209 → 0.000 | 25.249 | 수치 변경·통과 유지 |
| array-500 | off | BF 갱신 | 3.251 → 0.000 | 7.542 | 수치 변경·통과 유지 |
| array-500 | off | 첫 갱신 | 3.251 → 0.000 | 7.542 | 수치 변경·통과 유지 |
| array-500 | off | 이후 갱신 | 0.625 → 0.000 | 6.084 | 수치 변경·통과 유지 |
| array-1000 | off | 마운트 | 14.167 → 0.000 | 73.541 | 수치 변경·통과 유지 |
| array-1000 | off | BF 갱신 | 3.208 → 0.000 | 7.915 | 수치 변경·통과 유지 |
| array-1000 | off | 첫 갱신 | 3.208 → 0.000 | 7.915 | 수치 변경·통과 유지 |
| array-1000 | off | 이후 갱신 | 1.875 → 0.000 | 6.500 | 수치 변경·통과 유지 |
| computed-visible-derived | off | 마운트 | 6.625 → 0.000 | 27.875 | 수치 변경·통과 유지 |
| computed-visible-derived | off | BF 갱신 | 4.543 → 0.000 | 28.043 | 수치 변경·통과 유지 |
| computed-visible-derived | off | 첫 갱신 | 1.709 → 0.000 | 7.666 | 수치 변경·통과 유지 |
| computed-visible-derived | off | 이후 갱신 | 0.167 → 0.000 | 8.209 | 수치 변경·통과 유지 |
| oneOf-5 | off | 마운트 | 11.250 → 0.000 | 16.041 | 수치 변경·통과 유지 |
| oneOf-5 | off | BF 갱신 | 3.334 → 0.000 | 36.123 | 수치 변경·통과 유지 |
| oneOf-5 | off | 첫 갱신 | 1.875 → 0.000 | 29.624 | 수치 변경·통과 유지 |
| oneOf-5 | off | 이후 갱신 | 0.583 → 0.000 | 9.082 | 수치 변경·통과 유지 |
| oneOf-5 | off | 고정 축 BF | 1.376 → 0.000 | 20.458 | 수치 변경·통과 유지 |
| oneOf-5 | off | 고정 축 첫 | 0.709 → 0.000 | 9.459 | 수치 변경·통과 유지 |
| oneOf-5 | off | 고정 축 이후 | 0.417 → 0.000 | 7.750 | 수치 변경·통과 유지 |
| oneOf-5 | on | 마운트 | 14.541 → 0.000 | 124.959 | 수치 변경·통과 유지 |
| oneOf-5 | on | BF 갱신 | 5.457 → 0.000 | 30.915 | 수치 변경·통과 유지 |
| oneOf-5 | on | 첫 갱신 | 2.875 → 0.000 | 15.832 | 수치 변경·통과 유지 |
| oneOf-5 | on | 이후 갱신 | 0.958 → 0.000 | 12.459 | 수치 변경·통과 유지 |
| oneOf-10 | off | 마운트 | 11.500 → 0.000 | 20.541 | 수치 변경·통과 유지 |
| oneOf-10 | off | BF 갱신 | 4.001 → 0.000 | 31.540 | 수치 변경·통과 유지 |
| oneOf-10 | off | 첫 갱신 | 1.917 → 0.000 | 12.250 | 수치 변경·통과 유지 |
| oneOf-10 | off | 이후 갱신 | 0.459 → 0.000 | 8.458 | 수치 변경·통과 유지 |
| oneOf-10 | off | 고정 축 BF | 1.209 → 0.000 | 19.748 | 수치 변경·통과 유지 |
| oneOf-10 | off | 고정 축 첫 | 0.583 → 0.000 | 11.165 | 수치 변경·통과 유지 |
| oneOf-10 | off | 고정 축 이후 | 0.417 → 0.000 | 7.666 | 수치 변경·통과 유지 |
| oneOf-10 | on | 마운트 | 14.499 → 0.000 | 59.876 | 수치 변경·통과 유지 |
| oneOf-10 | on | BF 갱신 | 5.167 → 0.000 | 40.292 | 수치 변경·통과 유지 |
| oneOf-10 | on | 첫 갱신 | 2.916 → 0.000 | 23.667 | 수치 변경·통과 유지 |
| oneOf-10 | on | 이후 갱신 | 1.208 → 0.000 | 15.458 | 수치 변경·통과 유지 |
| oneOf-20 | off | 마운트 | 12.750 → 0.000 | 39.667 | 수치 변경·통과 유지 |
| oneOf-20 | off | BF 갱신 | 4.584 → 0.000 | 45.208 | 수치 변경·통과 유지 |
| oneOf-20 | off | 첫 갱신 | 3.042 → 0.000 | 25.667 | 수치 변경·통과 유지 |
| oneOf-20 | off | 이후 갱신 | 0.458 → 0.000 | 10.249 | 수치 변경·통과 유지 |
| oneOf-20 | off | 고정 축 BF | 1.501 → 0.000 | 25.122 | 수치 변경·통과 유지 |
| oneOf-20 | off | 고정 축 첫 | 0.750 → 0.000 | 16.208 | 수치 변경·통과 유지 |
| oneOf-20 | off | 고정 축 이후 | 0.375 → 0.000 | 10.207 | 수치 변경·통과 유지 |
| oneOf-20 | on | 마운트 | 13.750 → 0.000 | 218.499 | 수치 변경·통과 유지 |
| oneOf-20 | on | BF 갱신 | 4.666 → 0.000 | 33.208 | 수치 변경·통과 유지 |
| oneOf-20 | on | 첫 갱신 | 2.666 → 0.000 | 18.291 | 수치 변경·통과 유지 |
| oneOf-20 | on | 이후 갱신 | 0.917 → 0.000 | 14.624 | 수치 변경·통과 유지 |
| oneOf-40 | off | 마운트 | 13.917 → 0.000 | 54.541 | 수치 변경·통과 유지 |
| oneOf-40 | off | BF 갱신 | 5.709 → 0.000 | 44.624 | 수치 변경·통과 유지 |
| oneOf-40 | off | 첫 갱신 | 3.750 → 0.000 | 31.291 | 수치 변경·통과 유지 |
| oneOf-40 | off | 이후 갱신 | 0.709 → 0.000 | 12.750 | 수치 변경·통과 유지 |
| oneOf-40 | off | 고정 축 BF | 2.875 → 0.000 | 38.167 | 수치 변경·통과 유지 |
| oneOf-40 | off | 고정 축 첫 | 1.250 → 0.000 | 24.833 | 수치 변경·통과 유지 |
| oneOf-40 | off | 고정 축 이후 | 0.542 → 0.000 | 11.750 | 수치 변경·통과 유지 |
| oneOf-40 | on | 마운트 | 17.083 → 0.000 | 131.458 | 수치 변경·통과 유지 |
| oneOf-40 | on | BF 갱신 | 6.624 → 0.000 | 41.957 | 수치 변경·통과 유지 |
| oneOf-40 | on | 첫 갱신 | 3.499 → 0.000 | 22.041 | 수치 변경·통과 유지 |
| oneOf-40 | on | 이후 갱신 | 1.375 → 0.000 | 16.667 | 수치 변경·통과 유지 |
| if-then | off | 마운트 | 4.167 → 0.000 | 17.124 | 수치 변경·통과 유지 |
| if-then | off | BF 갱신 | 1.460 → 0.000 | 12.208 | 수치 변경·통과 유지 |
| if-then | off | 첫 갱신 | 1.084 → 0.000 | 5.459 | 수치 변경·통과 유지 |
| if-then | off | 이후 갱신 | 0.334 → 0.000 | 5.750 | 수치 변경·통과 유지 |
| if-then | on | 마운트 | 12.875 → 0.000 | 57.376 | 수치 변경·통과 유지 |
| if-then | on | BF 갱신 | 3.417 → 0.000 | 22.292 | 수치 변경·통과 유지 |
| if-then | on | 첫 갱신 | 2.250 → 0.000 | 12.708 | 수치 변경·통과 유지 |
| if-then | on | 이후 갱신 | 0.083 → 0.000 | 8.793 | 수치 변경·통과 유지 |

## 2. 계수 — 각 무관 분기의 방문

방문 계수에는 TypeScript AST로 함수 진입과 loop/callback 및 실제 `expression.evaluate` 호출 자리에 정수 카운터만 넣었습니다. clock/span은 없습니다. 변환 복사본 498파일과 bundle/map은 지정한 저장소 밖 scratch에만 있습니다. 분기는 `/oneOf/i` schemaPath 또는 `payload_i_*`에서 얻으며 중첩 호출은 그 문맥을 상속합니다. 따라서 root getter나 공통 `/kind` 읽기가 특정 분기를 평가하는 동안 발생하면 그 분기의 문맥 비용으로 셉니다. 공유 root 함수의 진입을 모든 분기에 나눠 곱하지 않으며 내부 후보 loop 방문을 따로 셉니다.

B=5/10/20/40에서 건드리는 분기는 0과 4, 무관 분기는 3/8/18/38개입니다. 표의 P는 target=4 앞인 분기 1·2·3, Q는 4 뒤의 분기 5..B−1입니다(B=5에는 Q가 없습니다). 모든 크기의 같은 위치 그룹에서 수치가 같음을 단언했습니다. 각 칸은 **첫 kind_0→kind_4 / 복귀 kind_4→kind_0 / 이후 kind_0→kind_4**의 횟수입니다. Q의 BF=첫+복귀는 크기를 키울 때 추가되는 분기의 방문 수이며 선형 기울기와 연결할 수 있습니다.

계수도 추가 예열 20 뒤 101회 연속 전환을 확인했고 CPU 파동과 같이 51회 정방향·50회 역방향의 두 동일 패턴으로 압축됩니다. 전체 branch별 카운터와 전환 번호는 summary의 `part2.visitCounts`, 원본은 `counts-oneOf-*.json`에 있습니다.

| 방문 자리 | P 첫/복귀/이후 | Q 첫/복귀/이후 | Q BF/이후 | 판별 그룹 |
| --- | --- | --- | --- | --- |
| `@winglet/common-utils/lib:external:hasOwnProperty` | 46/26/23 | 52/26/26 | 78/26 | V20 |
| `src/core/settle/utils/gates/getGateRegistry.ts:222:getGateRegistry` | 16/8/8 | 16/8/8 | 24/8 | V04 |
| `src/core/settle/utils/gates/getGateRegistry.ts:50:register` | 16/8/8 | 16/8/8 | 24/8 | V04 |
| `src/core/SchemaNode/SchemaNode.ts:154:path` | 72/45/36 | 90/45/45 | 135/45 | V19 |
| `src/core/SchemaNode/SchemaNode.ts:160:raw` | 32/19/16 | 38/19/19 | 57/19 | V19 |
| `src/core/settle/utils/write/DirtyPathSet.ts:45:add` | 12/6/6 | 12/6/6 | 18/6 | V13 |
| `src/core/settle/utils/paths/bindTemplatePath.ts:7:bindTemplatePath` | 6/6/3 | 12/6/6 | 18/6 | V05 |
| `src/core/settle/utils/write/getDependencyIndex.ts:84:loop` | 6/3/3 | 6/3/3 | 9/3 | V13 |
| `src/core/settle/utils/write/registerRecalculation.ts:20:loop` | 6/3/3 | 6/3/3 | 9/3 | V13 |
| `src/core/settle/utils/write/registerRecalculation.ts:27:loop` | 6/3/3 | 6/3/3 | 9/3 | V13 |
| `src/core/settle/utils/write/registerRecalculation.ts:44:loop` | 6/3/3 | 6/3/3 | 9/3 | V13 |
| `src/core/settle/utils/gates/getGateRegistry.ts:113:mayChangeAt` | 6/3/3 | 6/3/3 | 9/3 | V14 |
| `src/core/settle/utils/gates/getGateRegistry.ts:121:mayChangeOwnDeclarationAt` | 6/3/3 | 6/3/3 | 9/3 | V14 |
| `src/core/settle/utils/compute/computeNode.ts:84:loop` | 6/3/3 | 6/3/3 | 9/3 | V10 |
| `src/core/settle/utils/compute/computeNode.ts:86:loop` | 6/3/3 | 6/3/3 | 9/3 | V10 |
| `src/core/settle/utils/compute/computeNode.ts:88:loop` | 6/3/3 | 6/3/3 | 9/3 | V10 |
| `src/core/settle/utils/compute/computeNode.ts:98:loop` | 2/1/1 | 2/1/1 | 3/1 | V10 |
| `src/core/settle/utils/compute/computeNode.ts:100:loop` | 2/1/1 | 2/1/1 | 3/1 | V10 |
| `src/core/settle/utils/gates/getGateRegistry.ts:108:callback` | 7/4/4 | 7/4/4 | 11/4 | V14 |
| `src/core/settle/utils/compute/primeHost.ts:26:loop` | 6/3/3 | 6/3/3 | 9/3 | V11 |
| `src/core/settle/utils/compute/primeHost.ts:27:callback` | 6/3/3 | 6/3/3 | 9/3 | V11 |
| `@winglet/json/pointer:external:escapeSegment` | 24/12/12 | 24/12/12 | 36/12 | V20 |
| `@winglet/json/pointer:external:unescapeSegment` | 18/12/9 | 24/12/12 | 36/12 | V20 |
| `src/core/settle/utils/compute/dirtyChildren.ts:18:loop` | 18/9/9 | 18/9/9 | 27/9 | V15 |
| `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:135:loop` | 27/12/12 | 27/12/12 | 39/12 | V16 |
| `src/core/settle/utils/gates/getGateBudgetCap.ts:73:callback` | 6/3/3 | 6/3/3 | 9/3 | V12 |
| `src/core/settle/utils/compute/selectNodeSchema.ts:21:callback` | 4/2/2 | 4/2/2 | 6/2 | V09 |
| `src/core/settle/utils/compute/selectNodeSchema.ts:22:callback` | 4/2/2 | 4/2/2 | 6/2 | V09 |
| `src/core/settle/utils/gates/evaluateGate.ts:26:evaluateGate` | 16/8/8 | 16/8/8 | 24/8 | V02 |
| `src/core/settle/utils/gates/getGateRegistry.ts:83:locate` | 16/8/8 | 16/8/8 | 24/8 | V04 |
| `src/core/settle/utils/gates/getGateExpression.ts:13:getGateExpression` | 16/11/8 | 22/11/11 | 33/11 | V05 |
| `src/core/settle/utils/paths/resolveDependencyPath.ts:7:resolveDependencyPath` | 16/11/8 | 22/11/11 | 33/11 | V05 |
| `src/core/settle/utils/gates/evaluateGate.ts:112:loop` | 16/8/8 | 16/8/8 | 24/8 | V03 |
| `src/core/settle/utils/gates/readProjectedValue.ts:25:readProjectedValue` | 16/8/8 | 16/8/8 | 24/8 | V03 |
| `src/core/settle/utils/gates/readProjectedValue.ts:13:projectedEmission` | 32/16/16 | 32/16/16 | 48/16 | V03 |
| `src/core/settle/utils/gates/readProjectedValue.ts:34:loop` | 16/8/8 | 16/8/8 | 24/8 | V03 |
| `src/core/settle/utils/compute/flushPendingOutput.ts:12:flushPendingOutput` | 16/8/8 | 16/8/8 | 24/8 | V08 |
| `src/core/settle/utils/gates/evaluateGate.ts:117:expression.evaluate` | 16/8/8 | 16/8/8 | 24/8 | V01 |
| `src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:24:callback` | 4/2/2 | 4/2/2 | 6/2 | V09 |
| `src/core/settle/utils/compute/selectChildren.ts:146:loop` | 12/6/6 | 12/6/6 | 18/6 | V11 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts:30:flushPendingGateReads` | 12/6/6 | 12/6/6 | 18/6 | V06 |
| `src/core/settle/utils/compute/selectChildren.ts:156:loop` | 12/6/6 | 12/6/6 | 18/6 | V11 |
| `src/core/settle/utils/compute/selectChildren.ts:160:loop` | 12/6/6 | 12/6/6 | 18/6 | V11 |
| `src/core/settle/utils/gates/bindGateHostPath.ts:12:bindGateHostPath` | 0/3/0 | 6/3/3 | 9/3 | V07 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts:101:loop` | 0/3/0 | 6/3/3 | 9/3 | V07 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts:89:flushGate` | 0/3/0 | 6/3/3 | 9/3 | V07 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts:97:loop` | 0/3/0 | 6/3/3 | 9/3 | V07 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts:74:flushRead` | 0/3/0 | 6/3/3 | 9/3 | V07 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts:77:loop` | 0/3/0 | 6/3/3 | 9/3 | V07 |
| `src/core/settle/utils/controls/getControlLayers.ts:66:loop` | 3/3/3 | 3/3/3 | 6/3 | V17 |
| `src/core/settle/utils/controls/getControlLayers.ts:80:loop` | 12/9/9 | 12/9/9 | 21/9 | V17 |
| `src/core/settle/utils/latent/getLatentOrder.ts:20:callback` | 0/9/0 | 0/0/0 | 0/0 | V18 |

`registerRecalculation:20/27/44`의 6/3/3은 함수 호출 수가 아닌 내부 선언/경로 후보 방문입니다. `getGateRegistry.register`의 16/8/8은 이미 등록된 root의 fast return이고 무관 분기에 새 watchPaths/resolveGateOccurrence 등록은 0회입니다. `getLatentOrder`는 target 앞 세 분기에서만 복귀 시 9회씩 확인하므로 B를 늘릴 때의 기울기에 넣지 않습니다. 경로 해석의 Q 22/11/11과 P 16/11/8 차이는 게이트 거절 이전의 후보 읽기 공표 처리입니다.

무관 분기에 `SchemaNodeRecord` 생성, `computeNode`의 실제 꺼진 자식 진입, `writeSchemaNode`, 배달과 validation, `resolveRelativeTokens`, `watchPaths`, `resolveGateOccurrence`, `readsChanged`는 각각 0회입니다. `find(/kind)`와 root의 표시·커밋·배달 및 0/4 교체 작업은 고정 폭에서 실행됩니다. CPU 배달 그룹에 작은 기울기가 보이더라도 이를 꺼진 분기를 배달한 횟수로 해석하지 않습니다.

## 3. 계측 없는 CPU profile과 선형 분해

크기당 fresh process 9개, 총 36개에서 변환하지 않은 제품 소스를 bundle했습니다. 엔진 clock·카운터·span 및 no-inline 강제 옵션은 없습니다. Node inspector의 표본 간격은 50µs입니다. 각 프로세스의 예열은 20개의 root에서 고정 전환 세 번이며, 그 뒤 101개 root를 마운트해 clock 밖에 둡니다. 첫 전환 101개를 연속으로, 같은 root들의 복귀 101개를 연속으로 프로파일합니다. 이후에는 root 하나에서 20전환을 더 예열한 뒤 101전환을 연속 왕복합니다. GC·결과 검사·bundle·마운트는 각 파동 밖입니다. 모든 파동에서 kind와 세 활성 payload의 결과를 확인했습니다.

이것은 111의 각 표본 사이 GC/await/FIFO가 있는 공식 종단 측정과 조건이 다른, 정상 상태의 연속 CPU 관측입니다. 첫/복귀와 이후 세 파동은 같은 크기의 한 fresh 프로세스에서 순서대로 실행됩니다. BF는 **같은 실행의 첫+복귀 산술합**, 평균은 9개 실행의 산술평균이며 주변 중앙값의 합이 아닙니다.

| B / 무관 분기 | 111 BF / 첫 / 이후 µs | CPU 첫 / 복귀 µs | CPU BF / 이후 µs |
| --- | --- | --- | --- |
| 5 / 3 | 478.835 / 283.167 / 175.875 | 272.811 / 227.883 | 500.694 / 180.092 |
| 10 / 8 | 648.417 / 401.501 / 229.084 | 428.438 / 291.092 | 719.530 / 264.756 |
| 20 / 18 | 986.835 / 628.167 / 342.918 | 616.464 / 418.110 | 1034.574 / 361.554 |
| 40 / 38 | 1651.335 / 1072.875 / 558.709 | 1021.330 / 578.625 | 1599.955 / 510.749 |

회귀는 x=무관 분기 수 3/8/18/38, y=파동 µs/전환의 OLS입니다. 36개 fresh 실행을 동일 가중치로 넣습니다. 각 함수의 self와 self+children 및 배타적 그룹별 기울기·절편·R²·크기별 평균을 보존했습니다.

| 시간 축 | CPU 기울기 µs/분기 | CPU 절편 µs | R² | 111 원 중앙값 기울기 |
| --- | --- | --- | --- | --- |
| 첫 | 20.833202 | 235.805 | 0.990083 | 22.507301 |
| 복귀 | 9.931076 | 212.582 | 0.973069 | 별도 원행 없음 |
| BF=첫+복귀 | 30.764278 | 448.387 | 0.990528 | 33.484219 |
| 이후 | 9.060841 | 177.519 | 0.972923 | 10.961318 |

**직접 측정한 합은 BF 30.764278, 이후 9.060841µs/분기**이며 원 111의 33.484219/10.961318과 동일하지 않습니다. 두 조건 차이를 임의의 특정 함수 비용으로 단정하지 않았습니다. 원 수치의 구성도 요구되어 각 크기·실행의 CPU 배타 비중에 그 크기의 111 중앙값을 곱하고 다시 OLS한 열을 별도로 적었습니다: `추정_f(B)=CPU_self_f(B)/CPU_total(B) × 111_total(B)`. 이 **111 비중 환산 추정**은 원 세션 내부 함수를 직접 잰 값이 아니며 같은 CPU 비중이 유지된다는 가정을 둡니다. 그 합이 33.484219/10.961318이 되는 것은 분할의 대수적 성질이며 독립 검증 결과가 아닙니다.

### 함수별 self와 children

아래는 BF self 기울기 상위 12개입니다. S는 self, I는 self+children입니다. I에는 호출한 다른 함수가 들어 있으므로 I를 더하면 중복됩니다. 모든 262개 함수/V8 frame/경계 잔차의 크기별 S/I 시간과 첫·복귀·BF·이후 회귀는 [전체 함수 CSV](profile-112-branch/cpu-functions.csv)와 summary의 `part2.cpuFits.*.functions`에 있습니다. 0회/0표본인 함수는 시간 0으로 남기며 0표본이 무호출의 증거는 아닙니다.

| 함수 | BF S/I 기울기 | 이후 S/I 기울기 | 111 S 비중 환산 BF/이후 | 추가 분기 방문 BF/이후 |
| --- | --- | --- | --- | --- |
| `src/core/settle/utils/paths/resolveDependencyPath.ts:7:resolveDependencyPath` | 4.919/4.919 | 1.451/1.451 | 5.185/1.649 | 33/11 |
| `src/core/settle/utils/compute/selectChildren.ts:82:selectChildren` | 4.772/18.999 | 1.621/6.073 | 5.072/1.868 | 후보 18/6; 공유 진입 별도 |
| `src/core/settle/utils/gates/readProjectedValue.ts:25:readProjectedValue` | 3.339/4.304 | 1.039/1.377 | 3.522/1.181 | 24/8 |
| `src/core/settle/utils/compute/computeNode.ts:22:computeNode` | 2.277/26.841 | 0.262/8.111 | 2.466/0.366 | 공유 진입; 선언 후보 9/3 |
| `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6:hasOwnProperty` | 1.403/1.403 | 0.549/0.549 | 1.488/0.623 | 78/26 |
| `src/core/settle/utils/gates/evaluateGate.ts:26:evaluateGate` | 1.348/10.994 | 0.460/3.507 | 1.431/0.520 | 24/8 |
| `src/core/settle/utils/gates/flushPendingGateReads.ts:74:flushRead` | 1.245/1.706 | 0.443/0.604 | 1.305/0.496 | 9/3 |
| `src/core/settle/utils/write/registerRecalculation.ts:12:registerRecalculation` | 1.093/2.577 | 0.286/0.808 | 1.173/0.341 | 후보 9/3; 공유 진입 별도 |
| `src/core/settle/utils/gates/getGateExpression.ts:13:getGateExpression` | 0.979/0.979 | 0.279/0.279 | 1.030/0.316 | 33/11 |
| `(V8):0:(program)` | 0.799/0.799 | 0.249/0.249 | 0.873/0.303 | V8 frame; 분기 호출 아님 |
| `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18:assembleObject` | 0.726/0.723 | 0.132/0.120 | 0.790/0.176 | 후보 39/12 |
| `src/core/settle/utils/gates/getGateRegistry.ts:83:locate` | 0.695/0.902 | 0.256/0.302 | 0.734/0.287 | 24/8 |

경로 해석의 self 4.919/1.451, 자식 선택의 self 4.772/1.621, 투영 읽기의 self 3.339/1.039µs/분기가 큰 항목입니다. evaluateGate I에는 경로·투영·registry 등이 이미 들어 있습니다. 이를 순수 Boolean 비교식의 비용으로 읽지 않습니다. 조각과 후보는 고정 깊이·필드 세 개인 한 무관 분기에서 각각 상수 횟수의 일을 하지만 그것이 모든 무관 분기에 반복되어 전체는 O(B)입니다.

### 중복 없이 합산되는 이름 있는 비용 그룹

각 CPU 표본은 leaf에서 거슬러 올라가 가장 가까운 이름 있는 함수 그룹 하나에만 배정합니다. 예를 들어 evaluateGate 아래의 경로 해석은 경로 그룹이고 식 드라이버 그룹에 다시 더하지 않습니다. @winglet primitive·anonymous helper는 가장 가까운 소유 함수의 그룹에 포함되며 주인이 없으면 V8/기타 잔차로 보존합니다. GC, harness, 미포착 경계도 숨기지 않았습니다.

| 배타 소유 함수 그룹 | CPU BF | CPU 이후 | 111 BF 비중 환산 추정 | 111 이후 비중 환산 추정 |
| --- | --- | --- | --- | --- |
| 자식 선택 | 6.001953 | 2.008135 | 6.428561 | 2.343210 |
| 경로 해석 | 5.646293 | 1.568466 | 5.944901 | 1.781149 |
| 게이트 읽기·등록 | 4.376102 | 1.463965 | 4.662645 | 1.670019 |
| 투영 읽기 | 4.193966 | 1.348381 | 4.436331 | 1.534286 |
| 게이트 식 평가·조회 | 2.494338 | 0.790438 | 2.635345 | 0.892379 |
| 계산 몸통 | 2.304922 | 0.304864 | 2.512751 | 0.423530 |
| 재계산 표시 | 2.170251 | 0.682786 | 2.323609 | 0.806311 |
| 출력·후보 장부 | 1.516049 | 0.494766 | 1.715195 | 0.647782 |
| 조각·유효 선언 열거 | 0.834804 | 0.315226 | 0.991931 | 0.406285 |
| 기타 함수·런타임 | 0.713015 | 0.138344 | 0.872584 | 0.247994 |
| GC | 0.426508 | -0.042837 | 0.489679 | -0.013264 |
| 배달 | 0.071639 | 0.008655 | 0.156510 | 0.059586 |
| 제어 계층 | 0.066024 | 0.074695 | 0.097832 | 0.097673 |
| 표본 경계 | 0.000524 | -0.002434 | 0.000909 | -0.002069 |
| 커밋·전이 | -0.052109 | -0.092610 | 0.215436 | 0.066448 |
| 합계 | 30.764278 | 9.060841 | 33.484219 | 10.961318 |

합계는 표본 단위 self 합과 파동 시간, 모든 함수의 self 기울기 합과 total 기울기, 모든 배타 그룹 기울기 합과 total 기울기를 각각 1e−8µs/분기 이내에서 단언했습니다. 음의 작은 회귀 기울기는 잡음·상수항의 회귀 결과로 그대로 보존하며 음의 실제 실행시간이나 최적화 효과라고 해석하지 않습니다. V8 timeDeltas에 −1µs가 세 건(oneOf-10 r2 첫, oneOf-10 r7 복귀, oneOf-40 r3 복귀) 있어 원자료를 보존하고 단조 high-water mark로 각 겹치는 1µs를 한 번만 귀속했습니다. 파동 경계 밖 Profiler.start/stop은 제외했습니다.

## 4. 각 방문의 필요성과 고침 범위

필요한 것은 결과·평가 순서/계수·실제 최신 입력·예외/공표 위치·키/선언/배달 순서·참조입니다. 아래의 “상수 작업”은 같은 무관 분기에서 같은 사실을 반복 확인하는 이 픽스처의 비평가 장부입니다. 생략의 동등성 증명이 필요하며, 모든 입력에서 제거해도 된다는 결론을 내리지 않습니다. 구현 방법이나 수정안은 제안하지 않습니다.

| 그룹 | 방문 판별 | 결과에 필요한가 / 상수 작업인가 | 고침 범위 | 계약 |
| --- | --- | --- | --- | --- |
| V01 실제 식 호출 | 평가 자체가 필요 | 꺼진 분기의 비교식도 현재 kind를 입력받아 false를 다시 결정합니다. 이 픽스처의 식 한 번은 의존 1개·비교 1개의 O(1) 평가입니다. 무관 분기의 식 호출을 없애는 것은 현재 16·B/8·B 계수 계약을 바꿉니다. | 정착 설계 변경 | C01·C02·C03·C04 |
| V02 평가 드라이버 | 필수 평가와 상수 장부가 함께 있음 | 실제 식·catch·gateThrowVersion은 필요합니다. 매 호출의 같은 registry/식 메타데이터 확인은 평가 결과 자체가 아니며 그 중복 횟수는 결과 계약이 요구하지 않습니다. | 식 집합·횟수·순서 변경은 정착 설계; 같은 평가를 보존하는 장부 중복은 코드 수준 | C01·C02·C03·C04 |
| V03 의존 값과 투영 읽기 | 현재 입력 읽기가 필요; 반복 공표 확인은 상수 작업 | 꺼진 분기의 게이트도 살아 있는 공통 /kind를 읽습니다. 따라서 이 숫자는 꺼진 payload의 값을 읽은 횟수가 아닙니다. 의존 순서와 평가 자리의 최신 투영은 필요합니다. projectedEmission의 같은 호스트 공표 확인이 실제 값을 바꾸지 않는 경우에만 그 반복 확인은 결과와 무관합니다. | 실제 읽기·가시성·순서 변경은 정착 설계; 동일 읽기와 예외를 보존하는 중복 확인은 코드 수준 | C03·C06·C07 |
| V04 기존 게이트 registry 조회 | 같은 기존 등록 확인의 상수 작업 | 등록된 루트의 register 조기 반환과 locate입니다. 무관 분기에 watchPaths/resolveGateOccurrence 신규 등록은 0회입니다. 기존 동일 발생을 확인하는 반복은 평가 자체가 아니며 동일 참조·순서가 보존되면 생략해도 이 픽스처의 결과는 같습니다. | 코드 수준; 실제 읽기 등록 집합·발생 식별을 바꾸면 정착 설계 | C04·C19 |
| V05 식 메타데이터와 정적 경로 해석 | 해석 결과는 필요; 같은 경로의 반복 해석은 상수 작업 | 분기마다 다른 schemaPath에서 같은 /kind에 이르는 정적 의존을 해석합니다. 경로 깊이는 고정입니다. 첫 세 무관 분기와 target 뒤의 분기에서 횟수가 다른 것은 후보 읽기 공표가 거절 게이트 앞에 오는 위치 때문입니다. 같은 절대 경로·오류·실제 projected read를 보존하는 반복 해석만 결과와 무관합니다. | 코드 수준; 읽기 경로·오류 위치·실제 입력을 바꾸면 정착 설계 | C03·C12·C16 |
| V06 후보별 읽기 공표 진입 | 이 픽스처에서는 동일 읽기 공표 여부의 상수 확인 | 게이트 거절을 알기 전에 자식 후보마다 진입합니다. 반환값은 새 분기 결과가 아니라 해당 호스트의 읽기를 평가 자리에 맞추는 장부입니다. 빈 대기·같은 공표 상태인 진입의 중복만 결과와 무관하며 일반적인 공표 자체는 필요합니다. | 코드 수준; 공표 순서·가시성을 바꾸면 정착 설계 | C06·C07·C08 |
| V07 후보 읽기 bind·공표 처리 | 일반적인 평가 자리 동기화는 필요; 거절 후보의 같은 장부는 상수 작업 | 꺼진 후보에서도 호스트·식·읽기 경로를 묶고 이미 결정된 공통 입력의 공표 상태를 확인합니다. 이 방문은 식 평가 횟수와 별개입니다. 여기에서 꺼진 실제 자식 생성·배달은 없습니다. 동일 공표와 reader 예외 조건을 증명한 중복 방문만 결과를 바꾸지 않습니다. | 코드 수준; 무공표 reader 허용이나 pending/changed/gateThrow 변경은 정착 설계 | C06·C07·C03 |
| V08 빈 출력 대기 확인 | 대기 상태 확인의 상수 작업 | 게이트 입력을 읽으며 공통 host를 공표하는 경계입니다. 이 측정에서 반복되는 빈 대기 확인은 새 값을 만드는 일이 아닙니다. 실제 대기 출력이 있으면 공표는 필요합니다. | 코드 수준; 실제 공표 가시성 변경은 정착 설계 | C06·C07 |
| V09 조각과 유효 선언 열거 | 선택 결과는 필요; false 조각의 반복 장부는 상수 작업 | blueprint 생성 시 collectDeclarations 재분석이 아니라 기존 runtime 조각·선언의 순회입니다. 같은 바퀴의 평가 결과에 맞는 유효 스키마는 필요합니다. 모든 식 평가를 유지하면서 이미 거절된 조각의 비평가 메타데이터 확인을 반복하는 횟수 자체는 계약 결과가 아닙니다. | 코드 수준; 조각 평가를 줄이거나 다른 oneOf 결과를 합치면 정착 설계 | C01·C04·C05·C18 |
| V10 호스트 선언 수집 | 계산 대상·게이트 순서는 필요; 같은 후보 수집의 반복은 상수 작업 | 분기별 세 선언과 해당 조각을 다시 수집합니다. root computeNode 진입은 공유 비용이므로 진입 횟수를 분기마다 곱하지 않습니다. 후보의 동일 순서·게이트 계수·고정 출발점을 보존하는 중복 수집만 결과와 무관합니다. | 코드 수준; 호스트 바퀴의 출발점·전순서·평가 계수 변경은 정착 설계 | C04·C08·C13 |
| V11 자식 후보와 게이트 배열 순회 | 활성 선택은 필요; 거절 후보의 반복 배열 접근은 상수 작업 | 각 꺼진 분기의 세 필드를 host 바퀴 네 번/두 번에서 봅니다. 선언/게이트 배열 접근은 실제 식 호출과 별도입니다. 거절 결과 자체와 첫 거절 순서·활성 자식 참조는 필요하고 비평가 장부의 반복 횟수는 요구되지 않습니다. | 코드 수준; 이 순회에 들어 있는 실제 평가 생략·순서 변경은 정착 설계 | C04·C05·C08·C19 |
| V12 바퀴 예산 확인 | 상한은 필요; 동일 정적 상한 확인은 상수 작업 | 고정 청사진의 선언에 게이트가 있는지 확인합니다. 이 확인은 식의 Boolean 평가가 아닙니다. 예산 값이 완전히 같다는 증명 아래 반복 확인은 결과와 무관합니다. | 코드 수준; 예산 식 자체를 바꾸면 정착 설계 | C13·C04 |
| V13 재계산 owner·경로 표시 | root 재계산은 필요; 현재 형상 밖 후보 장부는 상수 작업 | 각 분기의 세 선언 owner를 반복 확인·표시하지만 해당 payload의 실제 노드 계산은 0회입니다. registerRecalculation 함수 진입은 root 공유 비용이고 표의 6/3/3은 내부 후보 방문입니다. 이 고정 픽스처의 빈 후보 중복만 결과와 무관하며 존재하지 않는 감시 경로를 일반적으로 없애도 된다는 뜻은 아닙니다. | 코드 수준의 동등 장부; 실제 owner/게이트 재계산 집합·조상 복구 의미 변경은 정착 설계 | C11·C12·C04 |
| V14 게이트 영향·이전 선택 장부 | 변경 판정 결과는 필요; 같은 후보 조회는 상수 작업 | 무관 분기의 게이트가 같은 쓰기에 영향받는지와 호스트의 선택 장부를 확인합니다. readsChanged는 각 무관 분기에서 0회입니다. 이것을 전부 새 읽기 등록이나 실제 식 평가라고 세지 않습니다. | 코드 수준; 게이트를 재평가할지의 집합·순서를 바꾸면 정착 설계 | C04·C11 |
| V15 형상 밖 dirty 자식 확인 | 없음 판정의 반복 상수 작업 | 분기 payload 이름은 dirty 경로에 있지만 현재 자식 집합에 없어 실제 자식 계산을 하지 않습니다. 이 픽스처의 같은 없음 확인만 결과와 무관합니다. 일반적으로 absent watched path를 삭제할 근거는 아닙니다. | 코드 수준; dirty descendant 순서·감시 의미 변경은 정착 설계 | C11·C16 |
| V16 출력 키 후보 membership | 현재 자식의 합성은 필요; 무관 키의 없음 확인은 상수 작업 | 각 꺼진 분기 이름을 순서 있는 후보 장부에서 검사하지만 출력에 그 이름을 쓰지 않습니다. 이 결과 0 기여를 재확인하는 반복은 키 순서·현재 자식 참조가 같으면 결과와 무관합니다. | 코드 수준; 선언 키 순서나 같은 값의 참조 계약 변경은 설계 변경 | C09·C10 |
| V17 제어 계층 후보 순회 | 활성 제어 결과·순서는 필요; 무관 선언 확인은 상수 작업 | 같은 비활성 선언에서 제어 기여가 없는지 반복 확인합니다. 이 순회는 별도 사용자 검증이 아닙니다. 활성 계층·선언 전순서가 같으면 무관 선언의 반복 비평가 확인은 결과와 무관합니다. | 코드 수준; 제어 평가·선언 순서 변경은 정착 설계 | C05·C08 |
| V18 잠복 순서 검색 | 키 순서 결정은 필요; 고정 접두 검색의 상수 작업 | 복귀할 target=4 앞의 분기 1·2·3에서만 9회씩 확인하며 target 뒤 무관 분기는 0회입니다. 크기를 10→20→40으로 늘려도 늘지 않으므로 약 33/11µs의 분기 축 기울기 원인이 아닙니다. | 코드 수준; 잠복/선언 순서를 바꾸면 설계 변경 | C05·C09·C19 |
| V19 공유 host getter | 현재 입력·경로는 필요; 반복 getter는 상수 작업 | 분기 문맥 안에서 읽힌 공유 root host의 getter입니다. 존재하지 않는 payload 노드를 읽은 것이 아닙니다. 같은 시점의 같은 값을 되돌리는 반복 접근만 결과와 무관합니다. | 코드 수준; 공개 읽기 시점이나 투영 가시성 변경은 정착 설계 | C03·C06·C16 |
| V20 키 존재·pointer primitive | 키·경로 의미는 필요; 같은 인수의 반복 primitive는 상수 작업 | 고정 길이 이름의 hasOwnProperty, escapeSegment, unescapeSegment입니다. 이 fixture에서 호출 한 번의 길이는 B에 따라 늘지 않습니다. 동일 키 존재와 canonical pointer를 보존하는 중복 처리만 결과와 무관합니다. | 코드 수준; 특수 키·경로 해석·열거 순서 변경은 계약 변경 | C09·C16 |

무관 분기에 실제 SchemaNode/record 생성·계산, 배달, 검증, 새 게이트 읽기 등록은 0회입니다. root 및 실제 교체되는 kind_0/kind_4 노드의 고정 폭 작업과 구분합니다. 공유 함수의 root 진입을 각 무관 분기의 진입으로 재분배하지 않습니다. 근거는 C10·C14·C15·C16·C17입니다. 해당 무관 분기 방문이 없으므로 분기 기울기를 없앨 수정 대상이 아님입니다. OFF validation은 requestSchemaNodeValidation의 mode 조건에서 예약 전에 돌아갑니다. 동기 gate와 예약 validation을 같은 비용으로 묶지 않았습니다.

### 인용 계약 문장

- **C01** [architecture/design/01-schema-to-blueprint.md](../../../architecture/design/01-schema-to-blueprint.md) `:177`: “재계산 목록이 닿은 노드에 걸린 게이트를 전부 다시 평가한다(BLUEPRINT-007).”

- **C02** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:134`: “B=5/10/20/40에서 active 식 평가 횟수를 계수합니다. kind_0에서 kind_4로 가는 첫 전환은 16·B회, 이후 세 전환은 각 8·B회입니다.”

- **C03** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:11`: “게이트 식의 의존 값은 기존 의존 배열 순서대로 매 평가마다 classic loop에서 읽습니다. 경로 해석·실제 projected read·식 호출과 catch·gateThrowVersion·오류 발생 위치는 같습니다.”

- **C04** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:49`: “게이트의 평가 순서·횟수·고정 출발점은 바꾸지 않습니다(SETTLE-017·020·044·050, 82C-01).”

- **C05** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:30`: “게이트는 첫 거절에서 멈추며 선언/깊이/배달 순서와 같은 값의 참조는 유지합니다.”

- **C06** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:128`: “무공표 독립 reader는 노드가 이미 소비되었거나 공표 대기이면 던지고, 읽지 않는 undefined raw 호스트는 제외함을 단언합니다.”

- **C07** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:130`: “마운트와 갱신의 모든 active gate 평가 직후 독립 reader의 값이 평가 결과와 같고, changedNodes·pendingOutputs·gateThrowVersion이 변하지 않으며 위반이 0임을 단언합니다.”

- **C08** [src/core/behaviors/objectBehavior/DETAIL.md](../../../src/core/behaviors/objectBehavior/DETAIL.md) `:15`: “declareChildren은 청사진이 선언한 자식 목록(정적·게이트 선언 모두)을 돌려주고 생성하지 않습니다. 게이트로 활성 자식을 거르는 일은 settle의 호스트 바퀴가 합니다(NODE-006, LANDING-062).”

- **C09** [src/core/behaviors/objectBehavior/DETAIL.md](../../../src/core/behaviors/objectBehavior/DETAIL.md) `:16`: “branch의 키 순서는 유효 스키마 options.propertyKeys → 각 이름의 첫 선언 전순서 → extras 삽입 순서입니다.”

- **C10** [src/core/behaviors/objectBehavior/DETAIL.md](../../../src/core/behaviors/objectBehavior/DETAIL.md) `:24`: “현재 형상의 자식만 합성하고 빈 host의 local은 {}이며 선언·extras 키의 결정적 순서가 유지됩니다(VALUE-034, SETTLE-042).”

- **C11** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:40`: “존재하지 않는 감시 경로가 남아 조상이 먼저 소비될 수 있어 등록의 조상 복구 루프는 유지합니다. 게이트가 있는 계산과 일반 DirtyPathSet 사용은 임의 add/delete 뒤 첫 살아 있는 descendant 순서를 보존하는 기존 색인을 씁니다(SETTLE-017·047, 82C-01).”

- **C12** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:45`: “재계산 조상 확장은 호출당 방문 집합으로 중복을 차단하여 유일 경로·조상 수만큼만 확장하고 O(유일 경로 수)의 임시 메모리를 씁니다. 경로 문자열 해석과 dirty descendant 색인의 O(총 경로 segment 수) 비용은 별도입니다(SETTLE-017, BLUEPRINT-030, 82C-01).”

- **C13** [src/core/settle/INTENT.md](../../../src/core/settle/INTENT.md) `:23`: “호스트 바퀴의 시작점·전순서 또는 예산 식을 바꿀 때”

- **C14** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:19`: “S2의 커밋 방문자는 변경·진입·상태·경로·감시·대기 사건 후보를 합친 집합의 각 노드에서 종류 불일치와 Refresh, 전역 상태 증감, 배달 차이, 비트별 개정을 한 번 처리합니다.”

- **C15** [src/core/record/DETAIL.md](../../../src/core/record/DETAIL.md) `:19`: “커밋은 변경 종류만 최종 값과 비교하여 같은 기준으로 돌아온 A→B→A를 제외하고 비트 개정과 payload를 확정한 뒤 기준 칸·변경 마스크를 비웁니다.”

- **C16** [src/core/navigation/DETAIL.md](../../../src/core/navigation/DETAIL.md) `:11`: “경로의 각 마디는 현재 형상에 있는 자식 집합을 이름으로 따라갑니다. 형상 밖 노드와 터미널 아래 경로는 find가 null, findNodes가 빈 결과를 돌려줍니다.”

- **C17** [src/core/validation/DETAIL.md](../../../src/core/validation/DETAIL.md) `:19`: “readSchemaNodeGuard(runtime, gate)는 settle이 쓰는 동기 가드 읽기입니다. requestSchemaNodeValidation(root, deliver: (issues, commit) => void)는 실행을 예약하고, readSchemaNodeErrors(node): readonly ValidationIssue[]는 라우팅된 오류를 읽습니다.”

- **C18** [src/core/blueprint/DETAIL.md](../../../src/core/blueprint/DETAIL.md) `:23`: “oneOf의 서로 다른 선택 결과를 합치지 않습니다. 선택은 O(선언 수) 필터와 기존 정렬, O(선택 선언 수) 임시 배열 하나입니다.”

- **C19** [src/core/settle/DETAIL.md](../../../src/core/settle/DETAIL.md) `:37`: “정적 자식 선택은 빈 pending exit·latent 저장소를 조회하기 위한 경로 직렬화를 하지 않습니다. 이미 같은 선언 ID 참조를 선택했으면 재등록하지 않으며 모든 노드 생성·생김 기록·원본 분배는 유지합니다.”

위의 코드 수준 표시는 같은 결과·평가 계수·출발점·읽기/예외 위치·선언/배달/키 순서·참조를 보존하는 중복 작업에만 해당합니다. 그 동등성은 계수와 프로파일만으로 입증되지 않습니다. 구현 방법이나 수정안을 제안하지 않으며 G26 및 91 기준 ①의 미달 판정은 열어 둡니다. 실제 게이트 평가를 없애거나 집합/순서/호스트 바퀴를 바꾸는 것은 현재 정착 설계의 변경입니다. 고침 범위와 수행 단계는 109C-01대로 소유자가 판단합니다.

## 5. 원자료·재현·범위 검증

채택된 원자료는 배열 18 worker, CPU 36 worker, 최종 계수 4 worker로 총 58개입니다. 모두 종료 0·signal null이며 최대 worker 8937.000ms, 시작·종료 시각을 정렬한 겹침 검사는 통과했습니다. CPU/계수에서 읽은 제품 소스 498개의 SHA-256을 현재 HEAD 소스와 대조했고 src diff는 0입니다. [감사 기록](profile-112-branch/audit.json)에 실행별 시각·종료와 파일 제한 근거를 보존합니다. 모든 원시 및 도구 파일은 5,000,000바이트 이하입니다. bundle/map/변환 소스/cache는 저장소 안에 만들지 않았습니다.

계수 최초 빌드는 빈 함수의 AST 삽입 충돌로 실패하여 버렸고 정정 뒤 다시 실행했습니다. 실제 식 호출 hook을 추가한 최종 계수 및 CPU와 왕복 방향을 맞춘 최종 계수만 채택했습니다. 후처리에서 report-row 확인 종료 응답을 받기 전에 analyze를 시작해 두 계산이 잠깐 겹친 실수가 있었습니다. 두 결과를 버리고 종료를 확인한 뒤 순차 재실행했습니다. 측정 worker는 겹치지 않았습니다. CPU 원자료는 이 후처리보다 먼저 수집됐습니다.

측정 구간과 최종 계수 구간은 audit의 UTC 시각에 있습니다. 재현 명령은 기존 설치 Node v26.10.0과 esbuild/typescript만 사용합니다. 다음 명령은 한 줄씩 종료를 확인하고 실행하며 각 worker는 자체 420초 제한과 종료 직전 active resources 검사를 둡니다. 생성 결과는 외부 scratch에만 쓰므로 원자료를 바꾸지 않고 별도로 비교할 수 있습니다.

```sh
/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/measure-verdict-95c01.mjs array-100 off 1 new --head=bef81f4d747d028b05082d594138148520e4d992 --warmup=20
/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/branch-worker.mjs counts 5 1
/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/branch-worker.mjs cpu 5 1
/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/check-sentinel.mjs
/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/check-report-row.mjs
/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/analyze.mjs
/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/render-report.mjs
```

위 예시는 크기 5·회차 1입니다. 실제 CPU는 크기 5/10/20/40 × 회차 1..9를 순차 실행했습니다. 공식 array 명령은 timing-only JSON 및 메타데이터를 stdout으로 내보내는 기존 도구이며 native 도구로 `profile-112-branch/`의 정해진 파일에 보존했습니다. 기본 stdout을 shell 변수로 재해석하거나 추가 설치하지 않습니다. 전체 monorepo test/build는 제품 코드를 바꾸지 않은 이 측정 작업의 검증 범위에 포함하지 않았습니다.
