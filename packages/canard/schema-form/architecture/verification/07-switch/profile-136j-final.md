# 136j — 최종 core 측정표와 분기 축 재측정

엔진 **codex**, tier **high**. HEAD `069a1d272de2365865ca5ca0c8210d0d2edd8a14`. Node **v26.11.1**, V8 **14.6.202.34-node.37**, Apple M1 Max. 비교 공개판은 canonical worker가 tag에서 구성한 **0.16.0**입니다. 전체 측정·후처리 wall time은 **11.435분**이며 UTC 2026-10-11T03:31:51.733Z–2026-10-11T03:43:17.816Z입니다. core worker 구간 2026-10-11T03:31:52.176Z–2026-10-11T03:42:09.998Z(10.297분), 분기 worker 구간 2026-10-11T03:42:09.999Z–2026-10-11T03:42:36.466Z(0.441분)입니다.

**canonical 상태는 `validation-a-failed`입니다.** (가)가 3개 고유 행에서 성립하지 않아 전체 표의 공식 판정을 확정하지 않습니다. 108행의 시간·배율은 측정값이며 해당 행은 보류로 표시했습니다. 산출물은 `profile-136j-final/`에 있습니다.

R134 134C-01(3)에 따라 분기 축 마감을 최종 표 세션에 합쳤습니다. React는 측정하지 않았습니다. 111은 Node v26.10.0 / V8 14.6.202.34-node.35, 이번은 v26.11.1 / 14.6.202.34-node.37입니다. 구·신 판은 이번 세션에서 동일한 Node로 짝 비교했으며, 역사 기울기와의 차이에는 런타임 판과 세션 환경 차이가 포함될 수 있습니다. v26.10.0 설치나 yarn exec는 수행하지 않았고 직접 Node 실행으로 완료했습니다.

## 공식 core 방법과 판정

현재 HEAD의 [canonical worker](tools/measure-verdict-95c01.mjs)를 `--head=069a1d272de2365865ca5ca0c8210d0d2edd8a14 --warmup=20`만 지정하여 그대로 실행했습니다. fixture별 fresh old→new / new→old / old→new, 각 101개 표본, 판마다 pooled 303개입니다. core worker 138개, 분기 CPU 36개와 계수 4개, 총 178개가 순차 자연 종료했으며 code 0·signal null입니다. GC, schema clone, check anchor는 clock 밖입니다. ON 2-pass/OFF 1-pass FIFO, 공식 표본 뒤 scheduler 진단, 값 digest와 이후 예약·실행 0회 확인을 유지했습니다.

108개 표시 행은 마운트/BF 46개, 첫/이후 46개, 분기 수 축 16개이며 중복을 합치면 104개입니다. [canonical reporter](tools/report-verdict-95c01.mjs)의 nearest-rank 중앙값/p99, seeded bootstrap, (가)/(나), 회차별 대체, 배율·동률 규칙을 S 어댑터로 재사용했습니다. 입력 경로·HEAD·예열 표기·전송만 바꿨고 통계 계산은 변경하지 않았습니다. 목표는 85C-01·86C-01의 분기 없는 폼과 식 전용 폼 mount/update **≤1.5×**입니다. 목표선 양쪽에 회차가 있으면 canonical 규칙대로 동률·충족이며, pooled 배율 초과 목록과 성능 미달 목록을 구분합니다. oneOf/if-then에는 1.5× 목표를 적용하지 않습니다.

현재 canonical의 (가)는 같은 호출의 종단에서 **독립적으로 직전 측정한 빈 호출 대기 꼬리**를 빼고 microtask와 비교합니다. 이 잔차를 0으로 강제하지 않았습니다. 112의 pre-sentinel 강제 0 검증을 그대로 재사용하지 않고 현재 pairedEmptyTailMs 열을 확인하는 S probe로 바꿨습니다. (가) 101/104개 고유 행 통과, 실패 3개입니다. (나) 합 대체는 19개입니다. 보정·bootstrap 구간·회차별 배율·실제 (가) 잔차는 `core-summary.json.gz`에 보존합니다.

이 세션은 111 종단 설계만 수행했으므로 ABBA 독립 짝 차이는 측정하지 않았습니다. 아래의 “(가) 차이 / 잡음”은 canonical의 독립 직전 빈 호출로 보정한 잔차와 보수적 잡음이며, G26의 ABBA 변경 판정 통계량과 구분합니다. A/A 사용, 첫 ABBA 블록, 독립 확인 블록과 검출력은 이 최종 표 세션에 해당하지 않으며 해당 열을 다른 통계량으로 채우지 않았습니다. 111 당시 소유자 수용은 역사적 표시로 독립 열에 유지하며 이번 성능 충족 판정을 대신하지 않습니다.

## 마운트와 BF — 46행

| 폼 | 검증 | 작업 | HEAD / 0.16.0 중앙값 µs | 배율 | (가) pooled · 회차 | (가) 차이 / 잡음 µs | 목표 | 성능 판정 | 소유자 수용 |
| --- | --- | --- | ---: | ---: | --- | ---: | --- | --- | --- |
| sample-0 | off | 마운트 | 104.959 / 77.500 | 1.354× | 통과 · 통/통/통 | 1.084 / 4.251 | ≤1.5× | 충족 | — |
| sample-0 | off | BF 갱신 | 63.833 / 13.667 | 4.671× | 통과 · 통/통/통 | 0.292 / 3.667 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-1 | off | 마운트 | 144.542 / 104.583 | 1.382× | 통과 · 통/통/통 | 1.250 / 8.916 | ≤1.5× | 충족 | — |
| sample-1 | off | BF 갱신 | 70.042 / 14.041 | 4.988× | 통과 · 통/통/통 | 0.332 / 4.375 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-2 | off | 마운트 | 227.416 / 108.667 | 2.093× | 통과 · 통/통/통 | 1.667 / 8.540 | ≤1.5× | 미달 | 소유자 수용(108라운드), 원인: 청사진 분석의 첫 비용 |
| sample-2 | off | BF 갱신 | 71.375 / 15.208 | 4.693× | 통과 · 통/통/통 | 0.333 / 3.540 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-3 | off | 마운트 | 540.125 / 315.209 | 1.714× | 통과 · 통/통/통 | 7.792 / 11.207 | ≤1.5× | 미달 | 소유자 수용(108라운드), 원인: 청사진 분석의 첫 비용 |
| sample-3 | off | BF 갱신 | 76.625 / 18.000 | 4.257× | 통과 · 통/통/통 | 0.124 / 4.458 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| flat-50 | off | 마운트 | 270.250 / 208.290 | 1.297× | 통과 · 통/통/통 | 1.875 / 11.751 | ≤1.5× | 충족 | — |
| flat-50 | off | BF 갱신 | 181.041 / 130.875 | 1.383× | 통과 · 통/통/통 | 8.293 / 30.994 | ≤1.5× | 충족 | 소유자 수용(104라운드), 같은 원인 |
| flat-100 | off | 마운트 | 451.542 / 371.204 | 1.216× | 통과 · 통/통/통 | 4.542 / 13.666 | ≤1.5× | 충족 | — |
| flat-100 | off | BF 갱신 | 209.832 / 260.543 | 0.805× | 통과 · 통/통/통 | 6.917 / 26.794 | ≤1.5× | 충족 | — |
| flat-500 | off | 마운트 | 1853.250 / 1684.538 | 1.100× | 통과 · 통/통/통 | 10.084 / 30.084 | ≤1.5× | 충족 | — |
| flat-500 | off | BF 갱신 | 189.335 / 2193.249 | 0.086× | 통과 · 통/통/통 | 5.957 / 24.790 | ≤1.5× | 충족 | — |
| nested-d3-f4 | off | 마운트 | 428.083 / 256.372 | 1.670× | 통과 · 통/통/통 | 4.333 / 16.166 | ≤1.5× | 미달 | 소유자 수용(108라운드), 원인: 청사진 분석의 첫 비용 |
| nested-d3-f4 | off | BF 갱신 | 281.915 / 71.166 | 3.961× | 통과 · 통/통/통 | 8.291 / 31.370 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| nested-d5-f4 | off | 마운트 | 5902.958 / 3020.415 | 1.954× | 통과 · 통/통/통 | 10.874 / 92.540 | ≤1.5× | 미달 | 소유자 수용(108라운드), 원인: 청사진 분석의 첫 비용 |
| nested-d5-f4 | off | BF 갱신 | 342.793 / 87.916 | 3.899× | 통과 · 통/통/통 | 8.084 / 27.913 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| array-100 | off | 마운트 | 481.416 / 945.958 | 0.509× | 통과 · 통/통/통 | 5.250 / 22.624 | ≤1.5× | 충족 | — |
| array-100 | off | BF 갱신 | 91.667 / 29.792 | 3.077× | 통과 · 통/통/실 | -6.000 / 6.625 | ≤1.5× | 보류((가) 미통과; 미달) | 소유자 수용(104라운드) |
| array-500 | off | 마운트 | 1703.917 / 3997.786 | 0.426× | 통과 · 통/통/통 | 9.999 / 26.708 | ≤1.5× | 충족 | — |
| array-500 | off | BF 갱신 | 85.958 / 71.834 | 1.197× | 통과 · 통/통/통 | -0.332 / 4.875 | ≤1.5× | 충족 | 소유자 수용(104라운드) |
| array-1000 | off | 마운트 | 3838.292 / 8320.529 | 0.461× | 통과 · 통/통/통 | 14.584 / 115.999 | ≤1.5× | 충족 | — |
| array-1000 | off | BF 갱신 | 95.375 / 112.000 | 0.852× | 통과 · 통/통/통 | -1.542 / 5.292 | ≤1.5× | 충족 | — |
| computed-visible-derived | off | 마운트 | 447.375 / 128.750 | 3.475× | 통과 · 통/통/통 | 6.166 / 20.623 | ≤1.5× | 미달 | 소유자 수용(108라운드), 원인: 청사진 분석의 첫 비용 |
| computed-visible-derived | off | BF 갱신 | 231.584 / 28.917 | 8.009× | 통과 · 통/통/통 | 3.751 / 24.746 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| oneOf-5 | off | 마운트 | 762.166 / 169.458 | 4.498× | 실패 · 통/통/통 | 25.876 / 21.500 | 91 기준 | 보류((가) 미통과; 91라운드 기준별 판단) | — |
| oneOf-5 | off | BF 갱신 | 620.166 / 50.625 | 12.250× | 통과 · 통/통/통 | 0.833 / 47.082 | 91 기준 | 기준 ① 미달 | — |
| oneOf-5 | on | 마운트 | 8686.042 / 8446.250 | 1.028× | 통과 · 통/통/통 | 14.292 / 87.665 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-5 | on | BF 갱신 | 655.541 / 75.500 | 8.683× | 통과 · 통/통/통 | 3.792 / 33.246 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-10 | off | 마운트 | 1035.708 / 211.834 | 4.889× | 통과 · 통/통/통 | 12.250 / 17.749 | 91 기준 | 91 기준 종합 보류 | — |
| oneOf-10 | off | BF 갱신 | 661.875 / 51.376 | 12.883× | 통과 · 통/통/통 | 1.957 / 21.666 | 91 기준 | 기준 ① 미달 | — |
| oneOf-10 | on | 마운트 | 9746.542 / 8795.292 | 1.108× | 통과 · 통/통/통 | 14.750 / 151.748 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-10 | on | BF 갱신 | 784.708 / 89.625 | 8.755× | 통과 · 통/통/통 | 3.959 / 36.872 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-20 | off | 마운트 | 1565.375 / 288.415 | 5.428× | 통과 · 통/통/통 | 12.541 / 23.667 | 91 기준 | 91 기준 종합 보류 | — |
| oneOf-20 | off | BF 갱신 | 869.749 / 59.583 | 14.597× | 통과 · 통/통/통 | 1.874 / 23.751 | 91 기준 | 기준 ① 미달 | — |
| oneOf-20 | on | 마운트 | 11912.583 / 10495.208 | 1.135× | 통과 · 통/통/통 | 12.875 / 101.166 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-20 | on | BF 갱신 | 969.084 / 77.457 | 12.511× | 통과 · 통/통/통 | 3.666 / 23.748 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-40 | off | 마운트 | 2585.250 / 449.206 | 5.755× | 통과 · 통/통/통 | 13.292 / 67.251 | 91 기준 | 91 기준 종합 보류 | — |
| oneOf-40 | off | BF 갱신 | 1302.917 / 84.583 | 15.404× | 통과 · 통/통/통 | 2.126 / 69.124 | 91 기준 | 기준 ① 미달 | — |
| oneOf-40 | on | 마운트 | 16948.750 / 14623.833 | 1.159× | 통과 · 통/통/통 | 15.958 / 170.624 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-40 | on | BF 갱신 | 1502.541 / 82.208 | 18.277× | 통과 · 통/통/통 | 5.083 / 42.830 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| if-then | off | 마운트 | 338.583 / 82.250 | 4.117× | 통과 · 통/통/통 | 3.751 / 12.916 | 91 기준 | 91 기준 종합 보류 | — |
| if-then | off | BF 갱신 | 110.291 / 19.668 | 5.608× | 통과 · 통/통/통 | 0.958 / 10.209 | 91 기준 | 91 기준 종합 보류 | — |
| if-then | on | 마운트 | 7980.959 / 7425.500 | 1.075× | 통과 · 통/통/통 | 12.751 / 137.873 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| if-then | on | BF 갱신 | 219.208 / 31.916 | 6.868× | 통과 · 통/통/통 | 1.583 / 16.539 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |

## 첫 갱신과 이후 갱신 — 46행

| 폼 | 검증 | 작업 | HEAD / 0.16.0 중앙값 µs | 배율 | (가) pooled · 회차 | (가) 차이 / 잡음 µs | 목표 | 성능 판정 | 소유자 수용 |
| --- | --- | --- | ---: | ---: | --- | ---: | --- | --- | --- |
| sample-0 | off | 첫 갱신 | 63.833 / 13.667 | 4.671× | 통과 · 통/통/통 | 0.292 / 3.667 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-0 | off | 이후 갱신 | 30.167 / 8.167 | 3.694× | 통과 · 통/통/통 | 0.374 / 2.333 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-1 | off | 첫 갱신 | 70.042 / 14.041 | 4.988× | 통과 · 통/통/통 | 0.332 / 4.375 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-1 | off | 이후 갱신 | 34.375 / 8.541 | 4.025× | 통과 · 통/통/통 | 0.208 / 3.291 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-2 | off | 첫 갱신 | 71.375 / 15.208 | 4.693× | 통과 · 통/통/통 | 0.333 / 3.540 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-2 | off | 이후 갱신 | 32.459 / 9.209 | 3.525× | 통과 · 통/통/통 | 0.041 / 2.625 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-3 | off | 첫 갱신 | 76.625 / 18.000 | 4.257× | 통과 · 통/통/통 | 0.124 / 4.458 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| sample-3 | off | 이후 갱신 | 32.167 / 8.875 | 3.624× | 통과 · 통/통/통 | 0.083 / 3.207 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| flat-50 | off | 첫 갱신 | 51.875 / 19.042 | 2.724× | 통과 · 통/통/통 | 0.084 / 3.833 | ≤1.5× | 미달 | 소유자 수용(110라운드), 원인: 첫 갱신의 1회 비용 |
| flat-50 | off | 이후 갱신 | 14.083 / 11.625 | 1.211× | 통과 · 통/통/통 | 0.083 / 2.166 | ≤1.5× | 충족 | — |
| flat-100 | off | 첫 갱신 | 67.792 / 37.167 | 1.824× | 통과 · 통/통/통 | -0.416 / 7.792 | ≤1.5× | 미달 | 소유자 수용(110라운드), 원인: 첫 갱신의 1회 비용 |
| flat-100 | off | 이후 갱신 | 14.542 / 18.875 | 0.770× | 통과 · 통/통/통 | 0.082 / 1.958 | ≤1.5× | 충족 | — |
| flat-500 | off | 첫 갱신 | 60.958 / 236.125 | 0.258× | 통과 · 통/통/통 | -0.459 / 4.915 | ≤1.5× | 충족 | — |
| flat-500 | off | 이후 갱신 | 14.750 / 211.292 | 0.070× | 통과 · 통/통/통 | -0.001 / 2.250 | ≤1.5× | 충족 | — |
| nested-d3-f4 | off | 첫 갱신 | 73.625 / 10.125 | 7.272× | 통과 · 통/통/통 | 0.208 / 7.457 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| nested-d3-f4 | off | 이후 갱신 | 21.125 / 7.375 | 2.864× | 통과 · 통/통/통 | 0.084 / 2.374 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| nested-d5-f4 | off | 첫 갱신 | 85.792 / 13.917 | 6.165× | 통과 · 통/통/통 | -0.417 / 5.709 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| nested-d5-f4 | off | 이후 갱신 | 27.667 / 7.916 | 3.495× | 통과 · 통/통/통 | -0.041 / 2.499 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| array-100 | off | 첫 갱신 | 91.667 / 29.792 | 3.077× | 통과 · 통/통/실 | -6.000 / 6.625 | ≤1.5× | 보류((가) 미통과; 미달) | 소유자 수용(104라운드) |
| array-100 | off | 이후 갱신 | 34.625 / 14.625 | 2.368× | 통과 · 통/통/통 | -0.042 / 3.583 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| array-500 | off | 첫 갱신 | 85.958 / 71.834 | 1.197× | 통과 · 통/통/통 | -0.332 / 4.875 | ≤1.5× | 충족 | 소유자 수용(104라운드) |
| array-500 | off | 이후 갱신 | 36.542 / 30.542 | 1.196× | 통과 · 통/통/통 | -0.166 / 3.457 | ≤1.5× | 충족 | 소유자 수용(104라운드) |
| array-1000 | off | 첫 갱신 | 95.375 / 112.000 | 0.852× | 통과 · 통/통/통 | -1.542 / 5.292 | ≤1.5× | 충족 | — |
| array-1000 | off | 이후 갱신 | 41.333 / 53.750 | 0.769× | 통과 · 통/통/통 | -0.751 / 3.292 | ≤1.5× | 충족 | — |
| computed-visible-derived | off | 첫 갱신 | 98.208 / 14.250 | 6.892× | 통과 · 통/통/통 | 1.208 / 6.333 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| computed-visible-derived | off | 이후 갱신 | 66.541 / 10.459 | 6.362× | 통과 · 통/통/통 | 0.541 / 6.293 | ≤1.5× | 미달 | 소유자 수용(104라운드) |
| oneOf-5 | off | 첫 갱신 | 416.625 / 29.166 | 14.285× | 통과 · 통/통/통 | -1.083 / 66.208 | 91 기준 | 기준 ① 미달 | — |
| oneOf-5 | off | 이후 갱신 | 166.208 / 17.041 | 9.753× | 통과 · 통/통/통 | 0.999 / 5.207 | 91 기준 | 기준 ① 미달 | — |
| oneOf-5 | on | 첫 갱신 | 405.500 / 44.335 | 9.146× | 통과 · 통/통/통 | 1.792 / 16.375 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-5 | on | 이후 갱신 | 201.291 / 27.457 | 7.331× | 통과 · 통/통/통 | 1.625 / 10.793 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-10 | off | 첫 갱신 | 423.291 / 31.875 | 13.280× | 통과 · 통/통/통 | 0.916 / 15.168 | 91 기준 | 기준 ① 미달 | — |
| oneOf-10 | off | 이후 갱신 | 195.416 / 20.208 | 9.670× | 통과 · 통/통/통 | 0.875 / 6.457 | 91 기준 | 기준 ① 미달 | — |
| oneOf-10 | on | 첫 갱신 | 492.666 / 51.042 | 9.652× | 통과 · 통/통/통 | 1.791 / 26.417 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-10 | on | 이후 갱신 | 238.167 / 31.125 | 7.652× | 통과 · 통/통/통 | 1.625 / 9.167 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-20 | off | 첫 갱신 | 564.625 / 33.917 | 16.647× | 통과 · 통/통/통 | 0.875 / 19.124 | 91 기준 | 기준 ① 미달 | — |
| oneOf-20 | off | 이후 갱신 | 256.916 / 23.583 | 10.894× | 통과 · 통/통/통 | 0.875 / 8.000 | 91 기준 | 기준 ① 미달 | — |
| oneOf-20 | on | 첫 갱신 | 618.084 / 45.581 | 13.560× | 통과 · 통/통/통 | 1.834 / 16.832 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-20 | on | 이후 갱신 | 305.833 / 31.750 | 9.633× | 통과 · 통/통/통 | 1.625 / 9.707 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-40 | off | 첫 갱신 | 856.625 / 44.959 | 19.053× | 통과 · 통/통/통 | 1.041 / 51.916 | 91 기준 | 기준 ① 미달 | — |
| oneOf-40 | off | 이후 갱신 | 385.667 / 25.791 | 14.954× | 통과 · 통/통/통 | 1.000 / 17.333 | 91 기준 | 기준 ① 미달 | — |
| oneOf-40 | on | 첫 갱신 | 961.250 / 48.084 | 19.991× | 통과 · 통/통/통 | 2.376 / 18.374 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| oneOf-40 | on | 이후 갱신 | 459.584 / 34.541 | 13.305× | 통과 · 통/통/통 | 1.708 / 12.873 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| if-then | off | 첫 갱신 | 66.208 / 12.791 | 5.176× | 통과 · 통/통/통 | 0.208 / 3.792 | 91 기준 | 91 기준 종합 보류 | — |
| if-then | off | 이후 갱신 | 37.375 / 6.750 | 5.537× | 통과 · 통/통/통 | 0.209 / 3.583 | 91 기준 | 91 기준 종합 보류 | — |
| if-then | on | 첫 갱신 | 137.000 / 20.709 | 6.615× | 통과 · 통/통/통 | 0.833 / 8.499 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |
| if-then | on | 이후 갱신 | 64.458 / 11.333 | 5.688× | 통과 · 통/통/통 | 0.624 / 5.625 | 91 기준 | 검증 ON 기록 전용; 종합 보류 | — |

## 고정 두 분기 전환 축 — 16행

| 폼 | 검증 | 작업 | HEAD / 0.16.0 중앙값 µs | 배율 | (가) pooled · 회차 | (가) 차이 / 잡음 µs | 목표 | 성능 판정 | 소유자 수용 |
| --- | --- | --- | ---: | ---: | --- | ---: | --- | --- | --- |
| oneOf-5 | off | 마운트 | 762.166 / 169.458 | 4.498× | 실패 · 통/통/통 | 25.876 / 21.500 | 91 기준 | 보류((가) 미통과; 91라운드 기준별 판단) | — |
| oneOf-5 | off | BF 갱신 | 414.750 / 35.792 | 11.588× | 통과 · 통/통/통 | 2.959 / 12.833 | 91 기준 | 기준 ① 미달 | — |
| oneOf-5 | off | 첫 갱신 | 249.708 / 17.458 | 14.303× | 통과 · 통/통/통 | 1.833 / 5.957 | 91 기준 | 기준 ① 미달 | — |
| oneOf-5 | off | 이후 갱신 | 157.625 / 16.584 | 9.505× | 통과 · 통/통/통 | 1.000 / 4.792 | 91 기준 | 기준 ① 미달 | — |
| oneOf-10 | off | 마운트 | 1035.708 / 211.834 | 4.889× | 통과 · 통/통/통 | 12.250 / 17.749 | 91 기준 | 91 기준 종합 보류 | — |
| oneOf-10 | off | BF 갱신 | 515.792 / 46.499 | 11.093× | 통과 · 통/통/통 | 2.792 / 11.583 | 91 기준 | 기준 ① 미달 | — |
| oneOf-10 | off | 첫 갱신 | 319.625 / 23.500 | 13.601× | 통과 · 통/통/통 | 1.750 / 7.749 | 91 기준 | 기준 ① 미달 | — |
| oneOf-10 | off | 이후 갱신 | 185.209 / 18.541 | 9.989× | 통과 · 통/통/통 | 1.000 / 5.457 | 91 기준 | 기준 ① 미달 | — |
| oneOf-20 | off | 마운트 | 1565.375 / 288.415 | 5.428× | 통과 · 통/통/통 | 12.541 / 23.667 | 91 기준 | 91 기준 종합 보류 | — |
| oneOf-20 | off | BF 갱신 | 711.209 / 56.875 | 12.505× | 통과 · 통/통/통 | 2.875 / 14.626 | 91 기준 | 기준 ① 미달 | — |
| oneOf-20 | off | 첫 갱신 | 454.750 / 29.750 | 15.286× | 통과 · 통/통/통 | 1.792 / 10.250 | 91 기준 | 기준 ① 미달 | — |
| oneOf-20 | off | 이후 갱신 | 247.708 / 21.875 | 11.324× | 통과 · 통/통/통 | 0.917 / 7.542 | 91 기준 | 기준 ① 미달 | — |
| oneOf-40 | off | 마운트 | 2585.250 / 449.206 | 5.755× | 통과 · 통/통/통 | 13.292 / 67.251 | 91 기준 | 91 기준 종합 보류 | — |
| oneOf-40 | off | BF 갱신 | 1135.458 / 57.708 | 19.676× | 통과 · 통/통/통 | 3.084 / 43.249 | 91 기준 | 기준 ① 미달 | — |
| oneOf-40 | off | 첫 갱신 | 742.833 / 30.167 | 24.624× | 통과 · 통/통/통 | 1.916 / 28.915 | 91 기준 | 기준 ① 미달 | — |
| oneOf-40 | off | 이후 갱신 | 380.458 / 23.459 | 16.218× | 통과 · 통/통/통 | 1.042 / 16.957 | 91 기준 | 기준 ① 미달 | — |

### (가) 보류 근거

- `array-100/off/update`: pooled -6.000 / 6.625µs; 회차별 차이 / 잡음 r1 -3.167 / 10.000 (통과), r2 -3.126 / 13.832 (통과), r3 -11.333 / 10.167 (실패).
- `oneOf-5/off/mount`: pooled 25.876 / 21.500µs; 회차별 차이 / 잡음 r1 29.875 / 43.041 (통과), r2 17.833 / 37.500 (통과), r3 20.959 / 41.000 (통과).
- `array-100/off/update-first`: pooled -6.000 / 6.625µs; 회차별 차이 / 잡음 r1 -3.167 / 10.000 (통과), r2 -3.126 / 13.832 (통과), r3 -11.333 / 10.167 (실패).

[137C-01, round-137-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-137-closing.md:5)에 따라 136k 세션이 끝난 뒤 `array-100/off`와 `oneOf-5/off`를 같은 절차로 각각 한 번 더 측정하고 첫 측정과 재측정을 모두 보존하며, 통과할 때까지 반복하지 않고 재측정도 실패하면 해당 행은 보류로 남깁니다.

#### 137C-01 재측정

**이 결과는 같은 절차로 전체 코어 138 worker를 다시 잰 세션 137r에서 세 행만 가져온 것입니다.** 이 세션의 다른 행으로 위 136j 공식 표를 바꾸지 않습니다. 두 표 가운데 유리한 쪽을 행마다 고르지도 않습니다. 136j의 기록에 다른 세션의 기록을 끼우는 방식은 reporter의 기록 시간 순서 단언과 세션 전체 보정 풀 때문에 성립하지 않아, 원장 관리자의 승인을 받아 전체 코어 재측정으로 바꿨습니다.

- `array-100/off/update`: HEAD / 0.16.0 98.001 / 31.625 µs, 3.099×. pooled -3.126 / 6.290µs; 회차별 차이 / 잡음 r1 -3.333 / 12.456 (통과), r2 -4.750 / 9.124 (통과), r3 -2.125 / 9.915 (통과).
- `array-100/off/update-first`: 위와 같은 표본이며 같은 값입니다(98.001 / 31.625 µs, 3.099×, pooled -3.126 / 6.290µs, 세 회차 통과).
- `oneOf-5/off/mount`: HEAD / 0.16.0 777.709 / 173.001 µs, 4.495×. pooled 12.875 / 11.748µs; 회차별 차이 / 잡음 r1 12.875 / 21.498 (통과), r2 11.917 / 15.290 (통과), r3 14.292 / 21.206 (통과).

| 행 | 136j (가) | 137r (가) | 137C-01 결과 |
| --- | --- | --- | --- |
| array-100/off/update | pooled 통과, r3 실패 | pooled·세 회차 통과 | (가)가 성립합니다. 성능 판정은 3.099× > 1.5×로 **미달**이며, 136j 표와 같이 104라운드의 기존 소유자 수용 행입니다. |
| array-100/off/update-first | pooled 통과, r3 실패 | pooled·세 회차 통과 | (가)가 성립합니다. 성능 판정은 **미달**이며 104라운드의 기존 소유자 수용 행입니다. |
| oneOf-5/off/mount | pooled 실패(25.876 / 21.500) | pooled 실패(12.875 / 11.748) | **보류로 남깁니다.** 91라운드 기준별 판단 행이며 배율 4.495×는 기록만 합니다. |

137C-01에 따라 재측정은 한 번만 하며, 통과할 때까지 반복하지 않습니다. 재측정에서도 (가)가 성립하지 않는 행은 보류로 남깁니다.

**보정 비교(참고 표기).** 이 세션의 OFF 빈 호출 보정은 end 15.541 µs, microtask 2.542 µs, wait 12.999 µs, wait 잡음(p95 절대 편차) 1.291 µs이며 호출 21,816회입니다. 136j는 각각 15.500, 2.542, 12.958, 1.209 µs, 21,816회입니다. wait의 차이 0.041 µs는 136j 잡음 폭 1.209 µs 안입니다. 보정 풀이 이 세션 자체의 것이므로 이 비교는 보류 기준으로 쓰지 않았습니다.

**나머지 행.** 137r 전체에서 (가)가 성립하지 않은 행은 `oneOf-5/off/mount` 하나이고, 136j에서 통과했다가 137r에서 실패한 행은 없습니다. 성능 판정 범주가 136j와 달라진 행은 `flat-50/off/update`(충족 → 동률·충족) 하나이며, 판정에 쓰지 않습니다.

**실행.** HEAD `875e0e770a402292bfb06c0fe78810e700364524`(제품 src 트리 `80c23cc2d0e389cc5e925b434a2d7a228d8532f0`, 136j의 069a1d272와 같음), Node v26.11.1 / V8 14.6.202.34-node.37, UTC 2026-10-11T06:00:40.629Z–06:14:40.309Z, wall 13.995분(core worker 구간 13.290분)입니다. 138 worker가 순차로 자연 종료했고 code 0·signal null입니다. 136j driver를 복사해 출력 경로·HEAD·분기 축과 보고서 게시 단계 제거만 바꿨습니다. reporter 복사본은 입력 경로와 HEAD만 바꿨으며, 통계 영역(`const controls =`부터 `const summary =`까지)이 [canonical reporter](tools/report-verdict-95c01.mjs)와 바이트 동일함을 실행 전에 확인했습니다. 이 재측정은 codex의 세 차례 시도가 측정 전에 멈춘 뒤 주 세션(Claude)이 직접 실행했습니다. 원시 자료는 저장소 밖 `S/session-137r/raw/`에 두었습니다. [SHA-256 목록](profile-136j-final/remeasure-137r/raw-sha256.txt), [세 행·보정 요약](profile-136j-final/remeasure-137r/summary.json), [driver diff](profile-136j-final/remeasure-137r/driver-adapter.diff), [reporter diff](profile-136j-final/remeasure-137r/reporter-adapter.diff), [행 검사 diff](profile-136j-final/remeasure-137r/check-report-row-adapter.diff)가 근거입니다.


## 목표 초과 행

반올림 전 pooled 배율 >1.5×인 목표 적용 행은 **31개**이고 canonical 성능 미달은 **31개**입니다. 이 중 **기존 소유자 수용 31행**(104라운드 24행, 108라운드 5행, 110라운드 2행), **새로 목표를 넘은 행 0행**입니다. fixture·검증 OFF·작업이 일치하는 111의 수용 열과 소유자 답을 함께 확인했습니다. 수용은 성능 목표 충족으로의 재분류나 (가) 보류 해제를 뜻하지 않습니다.

[82C-01, round-82-closing.md:9](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-82-closing.md:9)와 [83C-01, round-83-closing.md:9](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-83-closing.md:9)는 상수 배 행을 소유자 묶음으로 올리는 기준입니다. 이 일반 기준만으로 개별 행을 수용 처리하지 않고, 아래 TEST-027 소유자 수용의 정확한 범위를 적용했습니다. 소유자 답과 종결 문서는 주 작업 디렉터리의 원장 파일을 인용합니다.

- `sample-0/off/update`: 4.671×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:73](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:73), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-1/off/update`: 4.988×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:75](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:75), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-2/off/mount`: 2.093×, 미달. **기존 수용(108라운드, TEST-027)** — [profile-111-final.md:76](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:76), [round-108-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-108-owner-answers.md:7).

- `sample-2/off/update`: 4.693×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:77](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:77), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-3/off/mount`: 1.714×, 미달. **기존 수용(108라운드, TEST-027)** — [profile-111-final.md:78](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:78), [round-108-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-108-owner-answers.md:7).

- `sample-3/off/update`: 4.257×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:79](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:79), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `nested-d3-f4/off/mount`: 1.670×, 미달. **기존 수용(108라운드, TEST-027)** — [profile-111-final.md:86](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:86), [round-108-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-108-owner-answers.md:7).

- `nested-d3-f4/off/update`: 3.961×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:87](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:87), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `nested-d5-f4/off/mount`: 1.954×, 미달. **기존 수용(108라운드, TEST-027)** — [profile-111-final.md:88](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:88), [round-108-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-108-owner-answers.md:7).

- `nested-d5-f4/off/update`: 3.899×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:89](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:89), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `array-100/off/update`: 3.077×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:91](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:91), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `computed-visible-derived/off/mount`: 3.475×, 미달. **기존 수용(108라운드, TEST-027)** — [profile-111-final.md:96](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:96), [round-108-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-108-owner-answers.md:7).

- `computed-visible-derived/off/update`: 8.009×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:97](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:97), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-0/off/update-first`: 4.671×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:123](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:123), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-0/off/update-later`: 3.694×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:124](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:124), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-1/off/update-first`: 4.988×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:125](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:125), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-1/off/update-later`: 4.025×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:126](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:126), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-2/off/update-first`: 4.693×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:127](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:127), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-2/off/update-later`: 3.525×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:128](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:128), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-3/off/update-first`: 4.257×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:129](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:129), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `sample-3/off/update-later`: 3.624×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:130](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:130), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `flat-50/off/update-first`: 2.724×, 미달. **기존 수용(110라운드, TEST-027)** — [profile-111-final.md:131](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:131), [round-110-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-110-owner-answers.md:7).

- `flat-100/off/update-first`: 1.824×, 미달. **기존 수용(110라운드, TEST-027)** — [profile-111-final.md:133](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:133), [round-110-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-110-owner-answers.md:7).

- `nested-d3-f4/off/update-first`: 7.272×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:137](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:137), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `nested-d3-f4/off/update-later`: 2.864×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:138](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:138), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `nested-d5-f4/off/update-first`: 6.165×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:139](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:139), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `nested-d5-f4/off/update-later`: 3.495×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:140](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:140), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `array-100/off/update-first`: 3.077×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:141](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:141), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `array-100/off/update-later`: 2.368×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:142](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:142), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `computed-visible-derived/off/update-first`: 6.892×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:147](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:147), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).

- `computed-visible-derived/off/update-later`: 6.362×, 미달. **기존 수용(104라운드, TEST-027)** — [profile-111-final.md:148](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-111-final.md:148), [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7).


### 새로 목표를 넘은 행 — 소유자 질의 목록

**0행: 없음.** 137C-01의 신규 목표 초과 행 질의 목록에 추가할 행은 없습니다.

### 수용 이유의 범위 — 절대 차이

137C-01에 따라 31행마다 위 표의 중앙값으로 HEAD − 0.16.0의 절대 차이를 계산하고, 해당 수용 라운드가 든 이유의 범위 안인지 표시합니다. 측정은 새로 하지 않았습니다. 104라운드의 이유는 "절대값 0.06 ms 안팎"이며, 이 표는 0.060 ms 이하를 범위 안, 0.060 ms 초과 0.090 ms 이하를 경계(“안팎”으로 읽을 여지), 0.090 ms 초과를 범위 밖으로 셉니다. 108라운드의 이유는 청사진 분석의 첫 비용이며 답이 nested-d5 마운트의 새 판 5.9 ms를 직접 들었으므로, 마운트 행은 그 원인과 크기가 같은지로 봅니다. 110라운드의 이유는 "절대 차이는 0.07–0.1 ms"입니다.

| 행 | HEAD / 0.16.0 µs | 절대 차이 ms | 수용 라운드 | 수용 이유의 범위 |
| --- | ---: | ---: | --- | --- |
| sample-0/off/update | 63.833 / 13.667 | 0.050 | 104 | 안 |
| sample-1/off/update | 70.042 / 14.041 | 0.056 | 104 | 안 |
| sample-2/off/mount | 227.416 / 108.667 | 0.119 | 108 | 안(청사진 첫 비용) |
| sample-2/off/update | 71.375 / 15.208 | 0.056 | 104 | 안 |
| sample-3/off/mount | 540.125 / 315.209 | 0.225 | 108 | 안(청사진 첫 비용) |
| sample-3/off/update | 76.625 / 18.000 | 0.059 | 104 | 안 |
| nested-d3-f4/off/mount | 428.083 / 256.372 | 0.172 | 108 | 안(청사진 첫 비용) |
| nested-d3-f4/off/update | 281.915 / 71.166 | 0.211 | 104 | **밖** |
| nested-d5-f4/off/mount | 5902.958 / 3020.415 | 2.883 | 108 | 안(답이 든 5.9 ms와 같음) |
| nested-d5-f4/off/update | 342.793 / 87.916 | 0.255 | 104 | **밖** |
| array-100/off/update | 91.667 / 29.792 | 0.062 | 104 | 경계 |
| computed-visible-derived/off/mount | 447.375 / 128.750 | 0.319 | 108 | 안(청사진 첫 비용) |
| computed-visible-derived/off/update | 231.584 / 28.917 | 0.203 | 104 | **밖** |
| sample-0/off/update-first | 63.833 / 13.667 | 0.050 | 104 | 안 |
| sample-0/off/update-later | 30.167 / 8.167 | 0.022 | 104 | 안 |
| sample-1/off/update-first | 70.042 / 14.041 | 0.056 | 104 | 안 |
| sample-1/off/update-later | 34.375 / 8.541 | 0.026 | 104 | 안 |
| sample-2/off/update-first | 71.375 / 15.208 | 0.056 | 104 | 안 |
| sample-2/off/update-later | 32.459 / 9.209 | 0.023 | 104 | 안 |
| sample-3/off/update-first | 76.625 / 18.000 | 0.059 | 104 | 안 |
| sample-3/off/update-later | 32.167 / 8.875 | 0.023 | 104 | 안 |
| flat-50/off/update-first | 51.875 / 19.042 | 0.033 | 110 | 안(답의 0.07–0.1 ms보다 작음) |
| flat-100/off/update-first | 67.792 / 37.167 | 0.031 | 110 | 안(답의 0.07–0.1 ms보다 작음) |
| nested-d3-f4/off/update-first | 73.625 / 10.125 | 0.064 | 104 | 경계 |
| nested-d3-f4/off/update-later | 21.125 / 7.375 | 0.014 | 104 | 안 |
| nested-d5-f4/off/update-first | 85.792 / 13.917 | 0.072 | 104 | 경계 |
| nested-d5-f4/off/update-later | 27.667 / 7.916 | 0.020 | 104 | 안 |
| array-100/off/update-first | 91.667 / 29.792 | 0.062 | 104 | 경계 |
| array-100/off/update-later | 34.625 / 14.625 | 0.020 | 104 | 안 |
| computed-visible-derived/off/update-first | 98.208 / 14.250 | 0.084 | 104 | 경계 |
| computed-visible-derived/off/update-later | 66.541 / 10.459 | 0.056 | 104 | 안 |

수용 이유의 범위 밖은 **3행**입니다. nested-d3-f4/off/update(BF, 0.211 ms), nested-d5-f4/off/update(BF, 0.255 ms), computed-visible-derived/off/update(BF, 0.203 ms)입니다. 경계는 5행이며, 0.062–0.084 ms입니다. 같은 세 BF 행은 [111](profile-111-final.md)에서도 0.217 ms(:87), 0.247 ms(:89), 0.195 ms(:97)였고 104라운드 수용으로 표시되어 있었습니다. 그러므로 이 차이는 07의 이후 변경에서 새로 생긴 것이 아닙니다. 104라운드 이유의 예시(작은 폼의 값 하나 쓰기, 0.06 ms 안팎)가 이 세 BF 행의 크기를 덮지 않는다는 범위의 문제입니다. array-100/off의 두 행은 137C-01 재측정 대상이며, 위 값은 첫 측정입니다.

## 분기 CPU 기울기 — G26 열 정의

112 CPU 절차를 동일하게 재실행했습니다. oneOf OFF 5/10/20/40, 고정 kind_0→kind_4→kind_0이며 각 크기 fresh 9개 실행입니다. 예열 20개 root의 세 전환 뒤 101 root를 clock 밖에서 만들고 첫·복귀 101개를 각각 연속 프로파일했습니다. 이후는 한 root에서 추가 예열 20전환 뒤 101회 왕복했습니다. inspector 간격 50µs, GC·bundle·마운트·결과 검사는 파동 밖입니다. 시간은 (endUs−startUs)/101, BF는 같은 실행의 첫+복귀 산술합입니다. 무관 분기 3/8/18/38에 36개 실행을 동일 가중치로 넣어 **절편을 포함한 최소제곱 직선**을 구했습니다. x를 전체 분기 5/10/20/40으로 옮겨도 기울기는 같고 절편만 달라집니다.

변경 전 CPU 기울기와 기준 HEAD는 이미 기록된 [112 보고서](profile-112-branch.md)의 **3행, 235–244행**과 `profile-112-branch-summary.json`에서 읽었습니다. 오래된 커밋을 재측정하지 않았습니다. 이 CPU 기울기는 FIFO/await가 있는 공식 종단 중앙값 기울기와 조건이 다르므로 섞지 않습니다.

| 분기 축 | 기준 커밋 | 최종 커밋 | 변경 전 기울기(µs/분기) | 변경 후 기울기(µs/분기) | 감소율 | 기준 ① 판정 | if-then 확인 회귀 | Node·V8 | 출처 세션 |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |
| BF | bef81f4d747d028b05082d594138148520e4d992 | 069a1d272de2365865ca5ca0c8210d0d2edd8a14 | 30.764278 | 17.165550 | 44.203% | 미달 | 최종 세션 독립 확인 미실시; 역사 변경 2/1c 0행 | v26.11.1 / 14.6.202.34-node.37 | 112:3,235–244 → 136j |
| 첫 갱신 | bef81f4d747d028b05082d594138148520e4d992 | 069a1d272de2365865ca5ca0c8210d0d2edd8a14 | 20.833202 | 11.678290 | 43.944% | 미달 | 최종 세션 독립 확인 미실시; 역사 변경 2/1c 0행 | v26.11.1 / 14.6.202.34-node.37 | 112:3,235–244 → 136j |
| 이후 갱신 | bef81f4d747d028b05082d594138148520e4d992 | 069a1d272de2365865ca5ca0c8210d0d2edd8a14 | 9.060841 | 5.001117 | 44.805% | 미달 | 최종 세션 독립 확인 미실시; 역사 변경 2/1c 0행 | v26.11.1 / 14.6.202.34-node.37 | 112:3,235–244 → 136j |
| 전체 분기 / 무관 분기 | CPU BF µs | CPU 첫 갱신 µs | CPU 이후 갱신 µs |
| --- | ---: | ---: | ---: |
| 5 / 3 | 381.573 | 229.409 | 131.266 |
| 10 / 8 | 549.934 | 326.539 | 192.725 |
| 20 / 18 | 677.276 | 417.625 | 231.339 |
| 40 / 38 | 1014.103 | 653.333 | 319.842 |

CPU OLS의 절편·R²·36개 점과 함수별 self 및 self+children, 배타 그룹 분해는 `branch-analysis.json.gz`에 있습니다. inclusive 값은 중복을 포함하므로 더하지 않았고, 함수 self 기울기 합과 그룹 합이 전체 기울기와 1e−8µs/분기 이내로 일치함을 단언했습니다.

## 공식 종단 축의 보조 비교

아래는 현재 core 표의 보정 pooled 중앙값에서 계산한 별도 기울기입니다. 이전 같은 종단 축의 변경 전 값과 기준 리비전은 [129b](profile-129b-session.md)의 **21행, 56–62행**과 `profile-129b-session/slopes.json`에서 읽었습니다. 기준 리비전은 `439fda3219ec6b42efbef4d7fa0f02a40111453f`입니다. Node 판과 canonical 시계 세부가 다른 세션 사이 기술 비교이며 CPU 전후 감소율을 대신하지 않습니다.

| 종단 축 | 129b 변경 전 기울기 µs/분기 | 최종 표 기울기 µs/분기 |
| --- | ---: | ---: |
| bf | 49.432857 | 20.593393 |
| first | 32.585470 | 14.084779 |
| later | 16.097218 | 6.408967 |

## 기준 ①과 실제 작업 계수

기준 ① 판정은 **미달**입니다. 실제 CPU 전환 비용의 분기 수 의존성을 크기별 평균·기울기·작업 계수로 확인했습니다. 필요한 조건 평가와 남는 장부를 구분하며, 기울기 감소만으로 독립성을 입증하지 않습니다. 기울기 감소 자체를 “조건식 외 비용이 분기 수와 무관하다”는 증거로 바꾸지 않았습니다. 조건 평가와 반복 장부는 별도로 읽었습니다.

무관 분기별 방문은 112의 TypeScript AST 함수·loop/callback·실제 expression.evaluate 계수를 사용했습니다. clock/span 없이 S 변환 복사본만 계측했으며 CPU worker는 원소스를 그대로 bundle했습니다. 101회 연속 왕복의 방향별 패턴과 모든 branch별 원계수는 gzip raw에 보존합니다. 다음은 B=40에서 추가 분기 Q=5..39에 남는 자리입니다.

40개 전체 분기(무관 분기 38개)의 기존 CPU 측정 총시간은 다음과 같습니다. 프레임 예산 16.67ms = 16,670µs에 대한 몫을 함께 적었습니다. BF는 첫 전환과 복귀의 합이며, 다음 총시간과 함수 self 시간은 공식 core 표의 중앙값과 별개인 112 방식 CPU 프로파일 9회 평균입니다.

| 총시간 축 | B=40 총시간 (µs) | 16.67ms 프레임 예산의 몫 |
| --- | ---: | ---: |
| BF | 1014.103 | 0.060834 프레임 (6.083%) |
| 첫 전환 | 653.333 | 0.039192 프레임 (3.919%) |
| 이후 갱신 | 319.842 | 0.019187 프레임 (1.919%) |

남은 자리의 절대시간은 [branch-analysis.json.gz](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-136j-final/branch-analysis.json.gz)의 `cpuFits.{first,second,later}.functions[].self.points`에서 무관 분기 수 38인 9개 관측을 산술 평균했습니다. 첫 / 복귀 / 이후는 각각 first / second / later입니다. 아래 self 시간은 B=40 전체 작업 중 해당 함수에 귀속된 시간이므로 활성 분기·루트 등의 호출도 포함하며, Q 분기당 방문 횟수나 무관 분기 38개만의 시간으로 해석하지 않습니다. inclusive 시간이나 기울기×분기 수로 대체하지 않았습니다. callback은 동일 소스 파일·행의 `(anonymous)` CPU 식별값에 대응시켰고, 외부 함수 두 자리는 각각 `packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6:hasOwnProperty`, `packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6:escapeSegment`에 대응합니다. 함수 안의 loop와 `expression.evaluate` 호출 자리에는 별도 self 귀속이 없으므로 나누어 추정하지 않았으며, `unescapeSegment`도 해당 함수의 self 식별값이 없어 귀속 불가로 표시했습니다. 0.000µs는 그 축의 self 표본 가중치가 0이라는 뜻이며 실행 비용이 없다는 증거는 아닙니다.

| 방문 자리 | Q 분기당 첫 / 복귀 / 이후 | B=40 첫 self (µs) | B=40 복귀 self (µs) | B=40 이후 self (µs) | 시간 귀속 |
| --- | --- | ---: | ---: | ---: | --- |
| `@winglet/common-utils/lib:external:hasOwnProperty` | 49 / 23 / 23 | 21.488 | 12.013 | 11.077 | 동일 이름의 외부 함수 self |
| `src/core/settle/utils/gates/getGateRegistry.ts:261:getGateRegistry` | 32 / 16 / 16 | 11.881 | 5.919 | 4.776 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/getGateRegistry.ts:79:register` | 16 / 8 / 8 | 7.493 | 3.922 | 4.968 | 동일 파일·행·이름의 함수 self |
| `src/core/SchemaNode/SchemaNode.ts:154:path` | 60 / 30 / 30 | 0.856 | 0.174 | 0.253 | 동일 파일·행·이름의 함수 self |
| `src/core/SchemaNode/SchemaNode.ts:160:raw` | 32 / 16 / 16 | 0.516 | 0.173 | 0.174 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/write/DirtyPathSet.ts:45:add` | 12 / 6 / 6 | 12.289 | 8.933 | 7.774 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/paths/bindTemplatePath.ts:7:bindTemplatePath` | 6 / 3 / 3 | 3.380 | 1.993 | 2.680 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/write/getDependencyIndex.ts:84:loop` | 6 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/write/registerRecalculation.ts:20:loop` | 6 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/write/registerRecalculation.ts:27:loop` | 6 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/write/registerRecalculation.ts:44:loop` | 6 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/gates/getGateRegistry.ts:142:mayChangeAt` | 6 / 3 / 3 | 5.575 | 2.416 | 1.535 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/getGateRegistry.ts:150:mayChangeOwnDeclarationAt` | 6 / 3 / 3 | 2.758 | 1.537 | 2.625 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/compute/computeNode.ts:84:loop` | 6 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/compute/computeNode.ts:86:loop` | 6 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/compute/computeNode.ts:88:loop` | 6 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/compute/computeNode.ts:98:loop` | 2 / 1 / 1 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/compute/computeNode.ts:100:loop` | 2 / 1 / 1 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/gates/getGateRegistry.ts:137:callback` | 7 / 4 / 4 | 0.864 | 1.139 | 0.510 | 동일 파일·행의 익명 함수 self |
| `src/core/settle/utils/compute/primeHost.ts:34:loop` | 3 / 0 / 0 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/compute/primeHost.ts:36:callback` | 3 / 0 / 0 | 0.364 | 0.000 | 0.000 | 동일 파일·행의 익명 함수 self |
| `@winglet/json/pointer:external:escapeSegment` | 12 / 6 / 6 | 8.352 | 2.587 | 3.560 | 동일 이름의 외부 함수 self |
| `@winglet/json/pointer:external:unescapeSegment` | 18 / 9 / 9 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 해당 외부 함수의 self 식별값 없음 |
| `src/core/settle/utils/compute/dirtyChildren.ts:18:loop` | 18 / 9 / 9 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:135:loop` | 27 / 12 / 12 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/gates/getGateBudgetCap.ts:73:callback` | 6 / 3 / 3 | 0.524 | 0.592 | 0.087 | 동일 파일·행의 익명 함수 self |
| `src/core/settle/utils/compute/selectNodeSchema.ts:21:callback` | 4 / 2 / 2 | 6.914 | 3.240 | 3.351 | 동일 파일·행의 익명 함수 self |
| `src/core/settle/utils/compute/selectNodeSchema.ts:22:callback` | 4 / 2 / 2 | 3.023 | 1.215 | 1.110 | 동일 파일·행의 익명 함수 self |
| `src/core/settle/utils/gates/evaluateGate.ts:24:evaluateGate` | 16 / 8 / 8 | 33.825 | 16.410 | 15.389 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/getGateRegistry.ts:112:locate` | 16 / 8 / 8 | 15.925 | 8.179 | 6.916 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/getGateExpression.ts:13:getGateExpression` | 19 / 8 / 8 | 17.798 | 6.175 | 7.009 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/evaluateGate.ts:119:loop` | 16 / 8 / 8 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/gates/readProjectedValue.ts:26:readProjectedValue` | 16 / 8 / 8 | 8.755 | 4.571 | 3.815 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/readProjectedValue.ts:14:projectedEmission` | 32 / 16 / 16 | 9.272 | 5.458 | 4.220 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/getGateRegistry.ts:63:pathSegments` | 16 / 8 / 8 | 2.455 | 0.954 | 0.945 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/readProjectedValue.ts:36:loop` | 16 / 8 / 8 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/compute/flushPendingOutput.ts:12:flushPendingOutput` | 16 / 8 / 8 | 3.572 | 1.458 | 2.636 | 동일 파일·행·이름의 함수 self |
| `src/core/settle/utils/gates/evaluateGate.ts:124:expression.evaluate` | 16 / 8 / 8 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 호출 자리별 self 미분리 |
| `src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:24:callback` | 4 / 2 / 2 | 1.129 | 1.190 | 0.691 | 동일 파일·행의 익명 함수 self |
| `src/core/settle/utils/compute/selectChildren/utils/getDirectChildSelectionPlan.ts:59:loop` | 3 / 0 / 0 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/compute/selectChildren.ts:157:loop` | 12 / 6 / 6 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/controls/getControlLayers.ts:66:loop` | 3 / 3 / 3 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |
| `src/core/settle/utils/controls/getControlLayers.ts:80:loop` | 12 / 9 / 9 | 귀속 불가 | 귀속 불가 | 귀속 불가 | 귀속 불가: 함수 내 loop별 self 미분리 |

0회 자리와 P/Q 전체 원자료도 `branch/counts-oneOf-*.json.gz`에 있습니다. 실제 식 평가를 계약상 필요한 작업으로 구분했으며 node/record 생성·compute/delivery/validation 부재를 나머지 장부 부재로 해석하지 않았습니다.

## if-then 확인

if-then core 표시 행은 8개입니다. 각 행의 0.16.0·HEAD 중앙값과 배율은 위 표에 포함되어 있습니다. 이 폼에는 분기 없는 폼의 1.5× 목표를 적용하지 않았습니다. **이번 최종 표의 절차에는 독립 확인 측정이 없어 확인 회귀의 신규 판정은 미실시**입니다.

이미 채택한 변경 2/1c의 확인된 회귀는 각각 0행이며 [129b:3](profile-129b-session.md), [129c:3](profile-129c-session.md)의 기록과 session-evidence.json을 재확인했습니다. 최종 core 동작이 1c 이후 그대로라는 범위와 G27의 바이트 동일성 [g27-fixes.md:72–81](g27-fixes.md)을 함께 읽었습니다. 따라서 이번 표에서 **확인된 if-then 변경 회귀가 새로 입증된 행은 없습니다**. 0.16.0보다 큰 배율만으로 이 독립 확인 판정을 만들어내지 않았습니다.

## 실행 감사와 재현

정확한 138 core 명령·36 CPU 명령·4 계수 명령·검사 및 후처리 명령은 `command-list.txt`에 있습니다. 실행 전 작성한 계획은 /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136j-plan.md이며 예상 머신 시간 35분으로 110분 이내였습니다. 드라이버는 /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136j/driver.mjs이고 단일 백그라운드 실행, 별도 50초 poll로 진행했습니다. 사전 소스 읽기 명령의 괄호 구문 오류와 zsh의 자동 nice 실패는 측정 전에 수정했습니다. 최초 background launch 두 번은 progress 파일이나 측정 표본을 만들기 전에 도구 셸과 함께 끝났으며, 셸에서 background PID를 wait하여 유지한 실행 하나만 채택했습니다. context-mode의 S 경로 파일 전용 조회 제한은 추가 권한이나 설정 변경 없이 권한 범위 안의 파일 조회로 처리했습니다. 검증용 값 추출 명령의 괄호 오류 한 번은 측정 후 수정했으며 표본에 영향을 주지 않았습니다. 측정 표본 폐기·재실행은 없습니다.

모든 core/branch worker와 esbuild 서비스가 자연 종료했습니다. 겹침 검사, 시작·끝 HEAD와 index 해시, Node 실행 파일 해시, 제품 source tree, canonical 및 참조 도구 해시는 `audit.json`에 있습니다. 제품 편집·설치·Git 쓰기는 수행하지 않았습니다. 전체 monorepo 시험/build는 이 측정의 범위에 포함하지 않았습니다.

원시 core timings 138개, CPU 36개와 계수 4개는 gzip으로 저장했습니다. bundle/map/변환 source/cache는 S에만 있으며 저장소 산출물에 포함하지 않았습니다. 각 산출물은 5,000,000바이트 미만이고 SHA-256 목록은 `artifact-index.json`입니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `439fda3219ec`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
