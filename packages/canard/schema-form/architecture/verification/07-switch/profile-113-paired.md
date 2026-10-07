# 짝 빈 호출로 독립된 종단 시계 검증

## 112라운드 짝 sentinel 꼬리

HEAD `1130bd2f9ff104401cb41bd28c03ab37ffd93d1c`. 111C-01의 결정에 따라 표본 자체의 microtask 값을 종단 끝점으로 쓰던 형태를 제거했습니다. 공식 설계의 표시 108행(104개 고유 행)을 모두 다시 측정했습니다. 기존 원자료에는 독립된 짝 빈 꼬리가 없어 재계산만으로 복원할 수 없습니다.

각 실제 호출 바로 앞의 별도 빈 호출에서 같은 64 Promise checkpoint와 OFF 1-pass/ON 2-pass FIFO sentinel을 실행하고, 엔진 작업 없이 얻은 종단−microtask 꼬리를 세 번째 원시 열 `pairedEmptyTailMs`에 저장합니다. (가)의 종단 보정은 `(endᵢ−kC)−[pairedEmptyTailᵢ−k(C−M)]`, microtask 보정은 `microᵢ−kM`이며, 두 독립된 값의 표본별 차이를 먼저 구한 중앙값을 pooled와 각 회차에서 비교합니다. BF는 실제 쓰기별 짝 꼬리를 합하고 고정 분기 축의 왕복은 k=2입니다. 기존 빈 대기 p95·bootstrap 1000회와 seed·C/M 불확실성·하한 1µs를 유지했습니다. 공식 성능의 공통 C/M·(나)·배율·동률 규칙은 그대로이며 이번 표본으로 기존 성능 판정이나 수용 표시를 갱신하지 않았습니다.

각 fixture/validation/version/run은 fresh worker입니다. old→new / new→old / old→new 세 회차, 예열 20회·101표본·판마다 pooled 303개, 강제 GC·schema clone·GC 뒤 check anchor는 clock 밖입니다. 공식 worker 138개를 순차 실행했고 worker/esbuild 모두 code 0·signal null로 자연 종료했습니다. 최장 worker는 8.694초입니다. 시간 수집 후에만 scheduler 경계를 감싸며, 모든 진단 호출에서 새 엔진 예약·실행·두 끝점 사이 pending·후속 예약/실행이 0회입니다. 수치 검사와 이 경계 검사가 모두 성립해야 통과합니다.

### 배열 12행

**10/12행 통과**입니다. array-100 OFF BF·첫 갱신은 pooled −2.625/6.125µs로 잡음 안이지만 2회차의 −14.542/8.625µs가 범위를 넘어 실패했습니다. 두 행은 같은 실제 첫 쓰기 표본을 공유합니다. 표본을 교체하거나 재측정하여 통과시키지 않았습니다. 마운트·이후 갱신 및 나머지 배열 8행은 pooled와 세 회차 및 경계가 모두 통과합니다. 기존 array-100 BF·첫의 3.080× 미달과 소유자 수용(104라운드)을 포함한 판정·수용 표시는 유지합니다.

| 행 | pooled 차이 / 잡음 µs | 회차 1 / 2 / 3 차이·잡음 µs | 경계 | (가) | 기존 배율·판정·수용 |
| --- | ---: | --- | --- | --- | --- |
| array-100/off/mount | 5.917 / 15.833 | 5.125/32.000 통 · 4.458/61.456 통 · 7.250/18.416 통 | 0회 통과 | 통과 | 0.510× · 충족 · — |
| array-100/off/update | -2.625 / 6.125 | -3.126/9.251 통 · -14.542/8.625 실 · -0.292/8.290 통 | 0회 통과 | 실패 | 3.080× · 미달 · 소유자 수용(104라운드) |
| array-100/off/update-first | -2.625 / 6.125 | -3.126/9.251 통 · -14.542/8.625 실 · -0.292/8.290 통 | 0회 통과 | 실패 | 3.080× · 미달 · 소유자 수용(104라운드) |
| array-100/off/update-later | 0.000 / 4.207 | 0.041/5.666 통 · -0.083/7.456 통 · 0.083/6.042 통 | 0회 통과 | 통과 | 4.107× · 미달 · 소유자 수용(104라운드) |
| array-500/off/mount | 9.709 / 23.625 | 9.334/37.583 통 · 9.417/51.375 통 · 10.251/37.374 통 | 0회 통과 | 통과 | 0.427× · 충족 · — |
| array-500/off/update | -1.043 / 5.291 | -0.375/8.792 통 · -1.542/7.374 통 · -1.083/7.123 통 | 0회 통과 | 통과 | 1.323× · 충족 · 소유자 수용(104라운드) |
| array-500/off/update-first | -1.043 / 5.291 | -0.375/8.792 통 · -1.542/7.374 통 · -1.083/7.123 통 | 0회 통과 | 통과 | 1.323× · 충족 · 소유자 수용(104라운드) |
| array-500/off/update-later | -0.126 / 3.415 | -0.166/3.665 통 · -0.249/5.958 통 · 0.000/6.332 통 | 0회 통과 | 통과 | 1.237× · 충족 · 소유자 수용(104라운드) |
| array-1000/off/mount | 11.375 / 84.624 | 11.167/134.125 통 · 10.958/127.416 통 · 12.750/106.540 통 | 0회 통과 | 통과 | 0.476× · 충족 · — |
| array-1000/off/update | -1.417 / 5.457 | -2.000/7.625 통 · -1.291/7.791 통 · -1.458/7.583 통 | 0회 통과 | 통과 | 0.809× · 충족 · — |
| array-1000/off/update-first | -1.417 / 5.457 | -2.000/7.625 통 · -1.291/7.791 통 · -1.458/7.583 통 | 0회 통과 | 통과 | 0.809× · 충족 · — |
| array-1000/off/update-later | -0.459 / 3.750 | -0.334/4.832 통 · -0.542/5.290 통 · -0.459/4.543 통 | 0회 통과 | 통과 | 0.726× · 충족 · — |

### 그 밖의 (가)가 바뀐 모든 행

기각된 정정의 0µs/통과를 비교 기준으로 하면 수치가 바뀌는 행은 103개입니다. 배열 이외 92개 행을 아래에 전부 나열했습니다. 배열 이외 통과 여부가 바뀐 행은 없습니다. 전체 통과 여부 변경은 array-100/off/update와 array-100/off/update-first의 통과→실패 두 행뿐입니다. 수치가 그대로인 고유 행은 array-100/off/update-later입니다. 최초 111의 수치·통과 여부도 summary JSON의 각 행에 별도로 기록했습니다. 축 마운트 네 표시 행은 일반 마운트와 같은 관측을 공유합니다.

| 행 | 기각된 정정 차이 → 짝 보정 차이 µs | 새 잡음 µs | 통과 여부 |
| --- | ---: | ---: | --- |
| sample-0/off/mount | 0.000 → 1.083 | 5.084 | 통 → 통 |
| sample-0/off/update | 0.000 → 0.334 | 3.832 | 통 → 통 |
| sample-0/off/update-first | 0.000 → 0.334 | 3.832 | 통 → 통 |
| sample-0/off/update-later | 0.000 → 0.334 | 3.000 | 통 → 통 |
| sample-1/off/mount | 0.000 → 1.209 | 7.707 | 통 → 통 |
| sample-1/off/update | 0.000 → 0.458 | 4.458 | 통 → 통 |
| sample-1/off/update-first | 0.000 → 0.458 | 4.458 | 통 → 통 |
| sample-1/off/update-later | 0.000 → 0.250 | 3.541 | 통 → 통 |
| sample-2/off/mount | 0.000 → 1.958 | 10.040 | 통 → 통 |
| sample-2/off/update | 0.000 → 0.375 | 3.625 | 통 → 통 |
| sample-2/off/update-first | 0.000 → 0.375 | 3.625 | 통 → 통 |
| sample-2/off/update-later | 0.000 → 0.208 | 2.874 | 통 → 통 |
| sample-3/off/mount | 0.000 → 7.417 | 10.332 | 통 → 통 |
| sample-3/off/update | 0.000 → 0.167 | 4.248 | 통 → 통 |
| sample-3/off/update-first | 0.000 → 0.167 | 4.248 | 통 → 통 |
| sample-3/off/update-later | 0.000 → 0.166 | 3.124 | 통 → 통 |
| flat-50/off/mount | 0.000 → 2.416 | 11.375 | 통 → 통 |
| flat-50/off/update | 0.000 → 7.289 | 31.949 | 통 → 통 |
| flat-50/off/update-first | 0.000 → 0.084 | 4.415 | 통 → 통 |
| flat-50/off/update-later | 0.000 → 0.125 | 2.125 | 통 → 통 |
| flat-100/off/mount | 0.000 → 5.000 | 17.041 | 통 → 통 |
| flat-100/off/update | 0.000 → 5.542 | 29.200 | 통 → 통 |
| flat-100/off/update-first | 0.000 → -1.084 | 9.917 | 통 → 통 |
| flat-100/off/update-later | 0.000 → 0.084 | 2.415 | 통 → 통 |
| flat-500/off/mount | 0.000 → 8.834 | 24.207 | 통 → 통 |
| flat-500/off/update | 0.000 → 5.500 | 28.865 | 통 → 통 |
| flat-500/off/update-first | 0.000 → -0.416 | 4.625 | 통 → 통 |
| flat-500/off/update-later | 0.000 → 0.042 | 2.248 | 통 → 통 |
| nested-d3-f4/off/mount | 0.000 → 3.708 | 12.709 | 통 → 통 |
| nested-d3-f4/off/update | 0.000 → 7.792 | 27.370 | 통 → 통 |
| nested-d3-f4/off/update-first | 0.000 → -0.042 | 5.957 | 통 → 통 |
| nested-d3-f4/off/update-later | 0.000 → 0.125 | 2.583 | 통 → 통 |
| nested-d5-f4/off/mount | 0.000 → 7.501 | 96.666 | 통 → 통 |
| nested-d5-f4/off/update | 0.000 → 6.083 | 29.703 | 통 → 통 |
| nested-d5-f4/off/update-first | 0.000 → -0.458 | 5.333 | 통 → 통 |
| nested-d5-f4/off/update-later | 0.000 → -0.001 | 2.499 | 통 → 통 |
| computed-visible-derived/off/mount | 0.000 → 6.083 | 21.873 | 통 → 통 |
| computed-visible-derived/off/update | 0.000 → 3.500 | 26.583 | 통 → 통 |
| computed-visible-derived/off/update-first | 0.000 → 1.041 | 6.999 | 통 → 통 |
| computed-visible-derived/off/update-later | 0.000 → 0.457 | 7.457 | 통 → 통 |
| oneOf-5/off/mount | 0.000 → 10.959 | 15.332 | 통 → 통 |
| oneOf-5/off/update | 0.000 → 1.875 | 18.916 | 통 → 통 |
| oneOf-5/off/update-first | 0.000 → 0.876 | 16.541 | 통 → 통 |
| oneOf-5/off/update-later | 0.000 → 0.958 | 6.166 | 통 → 통 |
| oneOf-5/off/axis-update | 0.000 → 2.917 | 11.585 | 통 → 통 |
| oneOf-5/off/axis-first | 0.000 → 1.750 | 9.040 | 통 → 통 |
| oneOf-5/off/axis-later | 0.000 → 1.001 | 4.958 | 통 → 통 |
| oneOf-5/on/mount | 0.000 → 12.750 | 62.709 | 통 → 통 |
| oneOf-5/on/update | 0.000 → 3.958 | 23.084 | 통 → 통 |
| oneOf-5/on/update-first | 0.000 → 1.958 | 14.084 | 통 → 통 |
| oneOf-5/on/update-later | 0.000 → 1.583 | 9.375 | 통 → 통 |
| oneOf-10/off/mount | 0.000 → 11.292 | 31.958 | 통 → 통 |
| oneOf-10/off/update | 0.000 → 1.918 | 40.210 | 통 → 통 |
| oneOf-10/off/update-first | 0.000 → 0.875 | 27.499 | 통 → 통 |
| oneOf-10/off/update-later | 0.000 → 0.917 | 8.791 | 통 → 통 |
| oneOf-10/off/axis-update | 0.000 → 3.000 | 20.456 | 통 → 통 |
| oneOf-10/off/axis-first | 0.000 → 1.791 | 11.957 | 통 → 통 |
| oneOf-10/off/axis-later | 0.000 → 1.000 | 5.249 | 통 → 통 |
| oneOf-10/on/mount | 0.000 → 14.291 | 80.291 | 통 → 통 |
| oneOf-10/on/update | 0.000 → 4.417 | 50.708 | 통 → 통 |
| oneOf-10/on/update-first | 0.000 → 2.083 | 34.581 | 통 → 통 |
| oneOf-10/on/update-later | 0.000 → 1.708 | 11.833 | 통 → 통 |
| oneOf-20/off/mount | 0.000 → 11.958 | 46.249 | 통 → 통 |
| oneOf-20/off/update | 0.000 → 1.709 | 57.789 | 통 → 통 |
| oneOf-20/off/update-first | 0.000 → 0.708 | 37.499 | 통 → 통 |
| oneOf-20/off/update-later | 0.000 → 0.959 | 9.126 | 통 → 통 |
| oneOf-20/off/axis-update | 0.000 → 3.250 | 20.832 | 통 → 통 |
| oneOf-20/off/axis-first | 0.000 → 1.917 | 16.082 | 통 → 통 |
| oneOf-20/off/axis-later | 0.000 → 1.084 | 11.250 | 통 → 통 |
| oneOf-20/on/mount | 0.000 → 12.334 | 111.499 | 통 → 통 |
| oneOf-20/on/update | 0.000 → 3.959 | 27.749 | 통 → 통 |
| oneOf-20/on/update-first | 0.000 → 2.041 | 15.124 | 통 → 통 |
| oneOf-20/on/update-later | 0.000 → 1.708 | 12.916 | 통 → 통 |
| oneOf-40/off/mount | 0.000 → 11.959 | 50.208 | 통 → 통 |
| oneOf-40/off/update | 0.000 → 2.333 | 40.415 | 통 → 통 |
| oneOf-40/off/update-first | 0.000 → 1.125 | 35.000 | 통 → 통 |
| oneOf-40/off/update-later | 0.000 → 1.083 | 12.208 | 통 → 통 |
| oneOf-40/off/axis-update | 0.000 → 3.500 | 36.540 | 통 → 통 |
| oneOf-40/off/axis-first | 0.000 → 2.250 | 25.333 | 통 → 통 |
| oneOf-40/off/axis-later | 0.000 → 1.166 | 12.749 | 통 → 통 |
| oneOf-40/on/mount | 0.000 → 13.958 | 358.790 | 통 → 통 |
| oneOf-40/on/update | 0.000 → 4.584 | 77.626 | 통 → 통 |
| oneOf-40/on/update-first | 0.000 → 2.333 | 48.124 | 통 → 통 |
| oneOf-40/on/update-later | 0.000 → 1.833 | 24.501 | 통 → 통 |
| if-then/off/mount | 0.000 → 4.125 | 16.415 | 통 → 통 |
| if-then/off/update | 0.000 → 1.083 | 9.916 | 통 → 통 |
| if-then/off/update-first | 0.000 → 0.250 | 4.624 | 통 → 통 |
| if-then/off/update-later | 0.000 → 0.333 | 3.707 | 통 → 통 |
| if-then/on/mount | 0.000 → 11.668 | 52.458 | 통 → 통 |
| if-then/on/update | 0.000 → 1.542 | 17.832 | 통 → 통 |
| if-then/on/update-first | 0.000 → 0.750 | 9.375 | 통 → 통 |
| if-then/on/update-later | 0.000 → 0.583 | 6.750 | 통 → 통 |

### 정본 도구의 한 행 종단 검증

`array-500/off/update`에서 정본 reporter의 보정·bootstrap·validation 루프를 실행하여 `CANONICAL_ROW_END_TO_END_OK`를 확인했습니다. pooled 차이/잡음은 −1.043/5.291µs이며 세 회차와 독립 경계가 모두 통과합니다. old/new 최종 값 digest, 101표본, 20회 예열, 자연 종료, 공식 성능 source=sentinel도 함께 확인했습니다.

짝 빈 호출이 없던 원 도구에서는 `check-paired-sentinel.mjs`가 기대 sentinel 2회 대신 1회로 실패했습니다. 수정 후 1-pass·2-pass 짝 보정 회귀 검사와 중첩 FIFO self-check가 통과했습니다.

### 5ms 엔진 setImmediate 고장 주입

저장소 밖 scratch 복사본의 실제 `write()` 경로에서 새 엔진의 `scheduleMacrotaskSafe`로 5ms busy callback을 예약했습니다. 짝 빈 호출에는 예약하지 않았습니다. 별도 array-100 old/new fresh 6개 worker를 같은 세 회차·예열 20·101표본·순차·clock 밖 GC로 실행했습니다. scratch의 진단 단언만 주입 작업의 정상 실행을 허용했으며 공식 도구의 zero-macrotask 조건은 그대로입니다.

BF/첫 갱신의 pooled 차이 5004.708µs는 잡음 7.372µs를 넘어 수치 검사 (가)가 실패했습니다. 회차별 차이/잡음은 5005.750/10.541µs · 5001.333/13.040µs · 5005.750/9.624µs이고 전부 실패입니다. 경계도 호출당 엔진 예약·실행 1회로 별도로 실패했습니다. 이후 갱신도 수치·경계 모두 실패합니다. 마운트에는 주입하지 않아 수치·경계가 통과합니다. `INJECTED_CHECK_A_FAILED`이며 이 표본은 공식 결과에 넣지 않았습니다.

### 재현·파일·범위 감사

- [요약 JSON](profile-113-paired/summary.json), [공식 manifest](profile-113-paired/manifest.json), [주입 요약](profile-113-paired/injected-summary.json), [주입 manifest](profile-113-paired/injected-manifest.json).
- `yarn node packages/canard/schema-form/architecture/verification/07-switch/profile-113-paired/analyze-paired.mjs`는 저장된 원자료로 정본 계산을 재현합니다. `--injected --manifest=packages/canard/schema-form/architecture/verification/07-switch/profile-113-paired/injected-manifest.json`은 5ms 실패를 다시 확인합니다.
- 번들은 메모리에서만 구성하며 source map은 쓰지 않았습니다. Node compile cache와 주입 복사본은 지정된 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/profile-113-paired`에만 있습니다. 원자료·기록·요약 파일은 각각 5MB 이내입니다.
- 제품 소스·설치·git 쓰기는 수행하지 않았습니다. releaseSources 전송 비교의 객체 키 순서 오류로 미저장·미사용된 worker 한 개를 감사 기록에 명시했습니다. 키 정렬 후 같은 worker를 재실행했고 다른 표본은 교체하지 않았습니다.
