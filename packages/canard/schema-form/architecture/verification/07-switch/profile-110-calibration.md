# 110 — 95C-01 보정 검증 (가) 수정

HEAD `61e97d3664b03010339f793d5f44741345894c96`. 편집자 Q109 (a), `e8f9cf393:packages/canard/schema-form/architecture/reviews/round-107-closing.md`에 따라 측정 도구와 방법 문단을 수정했습니다.

같은 호출의 표본별 차 `medianᵢ[(endᵢ−kC)−(microᵢ−kM)]`로 (가)를 계산합니다. 기존 `median(end−kC)−median(micro−kM)`의 주변 중앙값 비가산 항을 제거했습니다. k는 BF의 interactionCount, 다른 작업은 1입니다. C/M과 잡음 폭, seeded bootstrap 99% 오차, 구 엔진 (나)의 선택, 공식 배율과 동률 규칙은 유지했습니다. 새 통계량은 pooled 303개와 각 회차 101개에 모두 적용합니다.

## 기존 공식 원시 표본 재계산

108 공식 83행 전체와 109의 flat-100·array-100 갱신 6행을 다시 계산했습니다. 구 통계량·잡음·회차 결과·배율이 저장된 기존 요약과 1e−12 ms 이내로 일치함을 단언했습니다. 수치 차이는 89/89행에서 달라졌으나 아래의 변경 행은 pooled/회차별 통과 여부 또는 공식 판정이 바뀐 행입니다. (나)의 구 값 선택과 배율은 모든 행에서 같습니다. 전체 회차별 반올림 전 수치는 summary JSON에 있습니다.

- 108 flat-100/off/update-first: pooled (가) 미통과→통과, 차이 9.917→3.291 µs / 잡음 8.793 µs. 세 회차는 모두 통과 유지. 공식 보류→미달(1.795699×).
- 108 array-100/off/update 및 update-first: 2회차만 미통과→통과(새 차이 5.416 µs / 잡음 14.083 µs). pooled와 1·3회차는 미통과 유지, 공식 보류 유지. 두 행의 101개 표본은 interactionCount=1로 동일합니다.
- 109의 6행은 pooled/회차별 (가)와 공식 판정의 변경이 없습니다. 최신 공식 83행에서 해당 6행을 109 자료로 대체하면 변경 행은 0개입니다. 이는 108 flat-100 첫 갱신의 통계량 수정 효과를 생략한다는 뜻이 아닙니다.

### 최신 공식 83행 — 각 행의 최신 원시 자료

| 원시 출처 / 행 | 구 (가) 차이 µs | 새 (가) 차이 µs | 잡음 µs | pooled 구→새 | 회차 1·2·3 구→새 | 공식 판정 구→새 | 배율 |
| --- | ---: | ---: | ---: | --- | --- | --- | ---: |
| profile-108-ratios / sample-0/off/mount | 2.167 | 1.625 | 7.709 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.401153× |
| profile-108-ratios / sample-0/off/update | 1.083 | 0.666 | 6.167 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.583789× |
| profile-108-ratios / sample-0/off/update-first | 1.083 | 0.666 | 6.167 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.583789× |
| profile-108-ratios / sample-0/off/update-later | 0.458 | 0.208 | 5.542 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.613193× |
| profile-108-ratios / sample-1/off/mount | 3.916 | 1.833 | 13.792 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.405189× |
| profile-108-ratios / sample-1/off/update | 1.249 | 0.833 | 7.126 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.522406× |
| profile-108-ratios / sample-1/off/update-first | 1.249 | 0.833 | 7.126 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.522406× |
| profile-108-ratios / sample-1/off/update-later | 1.125 | 0.374 | 7.417 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.745763× |
| profile-108-ratios / sample-2/off/mount | 3.500 | 2.458 | 12.082 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 2.124700× |
| profile-108-ratios / sample-2/off/update | 1.208 | 0.999 | 6.500 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.347303× |
| profile-108-ratios / sample-2/off/update-first | 1.208 | 0.999 | 6.500 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.347303× |
| profile-108-ratios / sample-2/off/update-later | 0.457 | 0.208 | 5.249 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.191879× |
| profile-108-ratios / sample-3/off/mount | 11.750 | 8.000 | 16.209 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 1.688564× |
| profile-108-ratios / sample-3/off/update | 2.958 | 1.666 | 7.834 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.907716× |
| profile-108-ratios / sample-3/off/update-first | 2.958 | 1.666 | 7.834 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.907716× |
| profile-108-ratios / sample-3/off/update-later | 0.875 | 0.250 | 6.042 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.386608× |
| profile-108-ratios / flat-50/off/mount | 2.499 | 2.125 | 12.958 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.291165× |
| profile-108-ratios / flat-50/off/update | 1.163 | -0.962 | 62.662 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 1.658526× |
| profile-108-ratios / flat-50/off/update-first | 0.708 | 0.375 | 6.541 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 2.978880× |
| profile-108-ratios / flat-50/off/update-later | -0.459 | -0.834 | 5.460 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.255208× |
| profile-108-ratios / flat-100/off/mount | 3.999 | 4.167 | 20.666 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.194452× |
| profile-109-update / flat-100/off/update | 25.834 | 24.418 | 70.117 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.101088× |
| profile-109-update / flat-100/off/update-first | 8.583 | 2.458 | 10.707 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 1.795699× |
| profile-109-update / flat-100/off/update-later | -0.250 | -0.833 | 6.333 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.891287× |
| profile-108-ratios / flat-500/off/mount | 18.584 | 11.167 | 29.585 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.112987× |
| profile-108-ratios / flat-500/off/update | -0.753 | 1.163 | 56.669 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.088690× |
| profile-108-ratios / flat-500/off/update-first | 3.666 | 1.833 | 7.749 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.276941× |
| profile-108-ratios / flat-500/off/update-later | -0.250 | -0.709 | 5.334 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.064807× |
| profile-108-ratios / nested-d3-f4/off/mount | 4.791 | 4.166 | 14.791 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 1.630490× |
| profile-108-ratios / nested-d3-f4/off/update | 24.250 | 18.454 | 59.839 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.307885× |
| profile-108-ratios / nested-d3-f4/off/update-first | 7.542 | 3.166 | 8.874 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 7.170037× |
| profile-108-ratios / nested-d3-f4/off/update-later | -0.376 | -0.750 | 5.501 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 3.582303× |
| profile-108-ratios / nested-d5-f4/off/mount | 16.124 | 13.583 | 104.709 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 1.897987× |
| profile-108-ratios / nested-d5-f4/off/update | -3.503 | -3.004 | 56.748 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.579635× |
| profile-108-ratios / nested-d5-f4/off/update-first | 1.582 | 1.000 | 8.958 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 6.262340× |
| profile-108-ratios / nested-d5-f4/off/update-later | -0.583 | -0.667 | 5.167 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 3.871168× |
| profile-108-ratios / array-100/off/mount | 5.334 | 5.291 | 36.376 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.495769× |
| profile-109-update / array-100/off/update | 17.833 | 17.250 | 12.000 | 미통과→미통과 | 미통과/통과/미통과→미통과/통과/미통과 | 보류((가) 미통과)→보류((가) 미통과) | 3.126454× |
| profile-109-update / array-100/off/update-first | 17.833 | 17.250 | 12.000 | 미통과→미통과 | 미통과/통과/미통과→미통과/통과/미통과 | 보류((가) 미통과)→보류((가) 미통과) | 3.126454× |
| profile-109-update / array-100/off/update-later | 5.625 | 4.417 | 37.500 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.448509× |
| profile-108-ratios / array-500/off/mount | 15.292 | 11.583 | 24.167 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.410517× |
| profile-108-ratios / array-500/off/update | 4.124 | 3.041 | 7.500 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.382922× |
| profile-108-ratios / array-500/off/update-first | 4.124 | 3.041 | 7.500 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.382922× |
| profile-108-ratios / array-500/off/update-later | 1.333 | 0.624 | 6.584 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.269099× |
| profile-108-ratios / array-1000/off/mount | 25.708 | 14.666 | 82.083 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.450323× |
| profile-108-ratios / array-1000/off/update | 3.583 | 3.333 | 8.334 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.851096× |
| profile-108-ratios / array-1000/off/update-first | 3.583 | 3.333 | 8.334 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.851096× |
| profile-108-ratios / array-1000/off/update-later | 1.666 | 1.208 | 6.542 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.762800× |
| profile-108-ratios / computed-visible-derived/off/mount | 8.624 | 6.792 | 21.457 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 3.357213× |
| profile-108-ratios / computed-visible-derived/off/update | 7.332 | 5.000 | 31.499 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 8.885572× |
| profile-108-ratios / computed-visible-derived/off/update-first | 3.375 | 1.750 | 8.209 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 7.086106× |
| profile-108-ratios / computed-visible-derived/off/update-later | 1.125 | 0.208 | 8.666 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 7.139875× |
| profile-108-ratios / oneOf-20/off/mount | 20.166 | 13.166 | 41.167 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.705280× |
| profile-108-ratios / oneOf-20/off/update | 4.749 | 5.291 | 50.873 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 19.332246× |
| profile-108-ratios / oneOf-20/off/update-first | 3.750 | 3.500 | 32.041 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 20.796179× |
| profile-108-ratios / oneOf-20/off/update-later | 0.876 | 0.541 | 9.791 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 15.945963× |
| profile-108-ratios / oneOf-5/off/update | 4.958 | 4.374 | 32.875 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 13.073920× |
| profile-108-ratios / oneOf-5/off/update-first | 3.625 | 2.916 | 18.625 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 13.928889× |
| profile-108-ratios / oneOf-5/off/update-later | 1.333 | 0.499 | 8.542 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 10.719317× |
| profile-108-ratios / oneOf-5/on/update | 6.877 | 5.001 | 48.376 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 9.326108× |
| profile-108-ratios / oneOf-5/on/update-first | 4.043 | 2.751 | 26.583 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 9.709455× |
| profile-108-ratios / oneOf-5/on/update-later | 1.501 | 0.876 | 10.833 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 8.240155× |
| profile-108-ratios / oneOf-10/off/update | 4.167 | 4.125 | 27.750 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 14.713717× |
| profile-108-ratios / oneOf-10/off/update-first | 3.374 | 1.958 | 16.625 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 15.823118× |
| profile-108-ratios / oneOf-10/off/update-later | 0.958 | 0.500 | 9.126 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 11.978477× |
| profile-108-ratios / oneOf-10/on/update | 8.584 | 5.586 | 61.459 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 10.988114× |
| profile-108-ratios / oneOf-10/on/update-first | 4.043 | 3.001 | 28.917 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 11.635360× |
| profile-108-ratios / oneOf-10/on/update-later | 1.668 | 1.126 | 15.459 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 9.640308× |
| profile-108-ratios / oneOf-20/on/update | 5.751 | 5.002 | 49.751 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 14.890889× |
| profile-108-ratios / oneOf-20/on/update-first | 3.583 | 2.751 | 26.584 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 15.688990× |
| profile-108-ratios / oneOf-20/on/update-later | 1.292 | 0.876 | 15.918 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 13.659333× |
| profile-108-ratios / oneOf-40/off/update | 5.958 | 6.249 | 64.252 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 21.739583× |
| profile-108-ratios / oneOf-40/off/update-first | 3.458 | 4.583 | 42.123 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 24.447416× |
| profile-108-ratios / oneOf-40/off/update-later | 1.875 | 0.750 | 57.667 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 21.369010× |
| profile-108-ratios / oneOf-40/on/update | 4.960 | 5.669 | 35.251 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 21.248631× |
| profile-108-ratios / oneOf-40/on/update-first | 3.584 | 3.209 | 28.291 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 22.341378× |
| profile-108-ratios / oneOf-40/on/update-later | 2.001 | 1.209 | 14.042 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 18.400702× |
| profile-108-ratios / if-then/off/update | 2.041 | 1.665 | 13.876 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 6.314167× |
| profile-108-ratios / if-then/off/update-first | 1.708 | 1.167 | 7.000 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 5.775947× |
| profile-108-ratios / if-then/off/update-later | 1.250 | 0.500 | 6.417 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 6.916359× |
| profile-108-ratios / if-then/on/update | 3.252 | 1.877 | 19.250 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 7.248474× |
| profile-108-ratios / if-then/on/update-first | 1.834 | 1.334 | 11.375 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 6.977554× |
| profile-108-ratios / if-then/on/update-later | 0.251 | -0.499 | 8.001 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 7.550013× |

### 대체된 108의 여섯 갱신 행도 포함한 비교

| 원시 출처 / 행 | 구 (가) 차이 µs | 새 (가) 차이 µs | 잡음 µs | pooled 구→새 | 회차 1·2·3 구→새 | 공식 판정 구→새 | 배율 |
| --- | ---: | ---: | ---: | --- | --- | --- | ---: |
| profile-108-ratios / flat-100/off/update | 21.831 | 21.872 | 53.080 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 1.064804× |
| profile-108-ratios / flat-100/off/update-first | 9.917 | 3.291 | 8.793 | 미통과→통과 | 통과/통과/통과→통과/통과/통과 | 보류((가) 미통과)→미달 | 1.795733× |
| profile-108-ratios / flat-100/off/update-later | -0.251 | -0.792 | 5.833 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 충족→충족 | 0.796796× |
| profile-108-ratios / array-100/off/update | 21.999 | 25.792 | 9.752 | 미통과→미통과 | 미통과/미통과/미통과→미통과/통과/미통과 | 보류((가) 미통과)→보류((가) 미통과) | 3.415509× |
| profile-108-ratios / array-100/off/update-first | 21.999 | 25.792 | 9.752 | 미통과→미통과 | 미통과/미통과/미통과→미통과/통과/미통과 | 보류((가) 미통과)→보류((가) 미통과) | 3.415509× |
| profile-108-ratios / array-100/off/update-later | 7.458 | 5.833 | 26.833 | 통과→통과 | 통과/통과/통과→통과/통과/통과 | 미달→미달 | 4.750000× |

## HEAD 공식 설계 재측정

Node v26.10.0, V8 14.6.202.34-node.35, Apple M1 Max. 2026-10-06T23:58:33.862Z–2026-10-06T23:59:52.638Z. development 빌드, fresh process 12개를 순차 실행했습니다. fixture마다 세 회차는 old→new / new→old / old→new, 예열 20·101표본, 판마다 pooled 303개입니다. 강제 GC·schema clone·check anchor는 clock 밖이며, 공식 측정 후에만 scheduler 진단을 설치했습니다. 외부 구독자 0·onChange noop, 엔진 내부 계측 없음, 음수 clipping 없음입니다.

같은 세션 OFF 빈 호출 2424개: C=17.167 µs, M=2.958 µs, C−M=14.209 µs, empty tail 잔차 p95=3.667 µs. 두 fixture·두 판에 동일 보정을 적용했습니다.

| 행 | 새/구 median ms | 배율 | 회차 1 / 2 / 3 배율 | 수정 (가) 차이/잡음 µs | pooled / 모든 회차 | 공식 판정 / 수용 표시 |
| --- | --- | ---: | --- | --- | --- | --- |
| array-100/off/update | 0.093958 / 0.030625 | 3.068016× | 2.619138 / 3.163481 / 3.310534 | 25.833 / 9.541 | 미통과 / 미통과 | 보류((가) 미통과) / 소유자 수용(104라운드) |
| array-100/off/update-first | 0.093958 / 0.030625 | 3.068016× | 2.619138 / 3.163481 / 3.310534 | 25.833 / 9.541 | 미통과 / 미통과 | 보류((가) 미통과) / 소유자 수용(104라운드) |
| flat-100/off/update-first | 0.060542 / 0.034999 | 1.729821× | 1.859675 / 1.708585 / 1.650188 | 3.625 / 7.834 | 통과 / 통과 | 미달 / 비수용 행 — 1.5× 판정 |

| 행 / 회차 | 수정 (가) 차이 µs | 잡음 µs | 판정 |
| --- | ---: | ---: | --- |
| array-100/off/update / 1 | 4.791 | 14.834 | 통과 |
| array-100/off/update / 2 | 26.624 | 13.542 | 미통과 |
| array-100/off/update / 3 | 29.291 | 11.042 | 미통과 |
| array-100/off/update-first / 1 | 4.791 | 14.834 | 통과 |
| array-100/off/update-first / 2 | 26.624 | 13.542 | 미통과 |
| array-100/off/update-first / 3 | 29.291 | 11.042 | 미통과 |
| flat-100/off/update-first / 1 | 3.791 | 13.457 | 통과 |
| flat-100/off/update-first / 2 | 3.750 | 11.334 | 통과 |
| flat-100/off/update-first / 3 | 3.416 | 13.333 | 통과 |

array-100 BF와 첫 갱신은 같은 표본이며, 통계량을 고쳐도 호출 위치에 따른 실제 tail 잔차는 남습니다. (가)가 미통과이므로 수치 배율을 공식 통과·미달로 승격하지 않고 보류합니다. 두 행의 **소유자 수용(104라운드)** 표시는 유지합니다. flat-100 첫 갱신은 비수용 행이며 (가) pooled와 세 회차가 통과했으므로 **1.729821×, 1.5× 미달**입니다. 성능 개선이나 신규 수용 처분은 수행하지 않았습니다.

## 도구·실행 검증과 재현

공유 함수는 `tools/endpointDifference95c01.mjs`입니다. canonical worker는 보정 전 same-call tail 중앙값을 기록하고 reporter는 보정 후 표본별 차를 사용합니다. HEAD/warmup 인자는 정식 worker의 source override 없이 실행 환경만 지정하며 기존 역사 재현용 기본값을 보존합니다. 회귀 검사는 주변 중앙값 차가 99인데 표본별 차의 중앙값은 1인 예제와 상수 보정·길이 불일치를 검사합니다. 수정 전 새 함수 부재로 실패했고 수정 후 통과했습니다.

12개 worker와 각 esbuild 서비스가 code=0·signal=null로 자연 종료했습니다. scheduler의 sentinel pending=0, 이후 추가 예약/실행=0, 새 엔진 예약=0 및 old/new 결과 digest 동일, worker timeline 무겹침과 순서 교대를 단언했습니다. 최대 worker 5037 ms, 기존 자료 reporter 24291 ms, 새 자료 reporter 1599 ms입니다. 강제 종료·상주 프로세스·병렬 측정·8분 초과 명령은 없습니다. 원시 측정은 반복·폐기하지 않았으며 stdout 전송 잘림 후 reporter만 두 차례 재실행했습니다.

산출물은 이 보고서·summary와 `profile-110-calibration/`의 JSON/mjs입니다. 디렉터리 내 최대 파일 199280 bytes로 모두 5 MB 이하입니다. 번들과 map은 write:false로 메모리에만 존재하고 TMPDIR는 요청하신 저장소 밖 bundles입니다. compile cache는 비활성화했습니다. 설치·git 쓰기·제품 src 변경·추가 제품 test/build는 없습니다. 모든 raw 파일과 도구 해시는 summary JSON에 있습니다.

```sh
TMPDIR='/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles' NODE_DISABLE_COMPILE_CACHE=1 GIT_OPTIONAL_LOCKS=0 yarn exec /opt/homebrew/Cellar/node/26.10.0_2/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-110-calibration/measure.mjs array-100 off 1 old
```

fixture마다 같은 prefix로 r1 old/new, r2 new/old, r3 old/new를 한 worker씩 실행합니다. stdout은 native 파일 도구로 official-<fixture>-off-r<run>-<version>.json에 저장합니다. `stats.mjs --historical`, `stats.mjs --fresh`의 JSON도 같은 방식으로 보존합니다. `report.mjs --summary`와 `--markdown`은 최종 산출물을 출력하고 `report.mjs --check`는 저장된 최종 파일을 검사합니다. `check.mjs`는 통계량 회귀 probe입니다.

