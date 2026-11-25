# 범용 벤치마크 비교

`@canard/schema-form`에 딸린 범용 벤치마크(`yarn workspace @canard/schema-form bench`, 9개 파일 58개 항목)를 기준 `1c77ced57`과 개선을 모두 병합한 후보 `53099d518`에서 돌린 결과입니다. 행별 정밀 판정은 [RESULTS-FINAL.md](RESULTS-FINAL.md)가 맡고, 이 표는 일반적인 사용 경로가 전체적으로 어떤지를 봅니다.

## 요약

| 항목                | 값                 |
| ------------------- | ------------------ |
| 비율의 가운데값     | 1.000              |
| 비율의 기하 평균    | 0.993              |
| 1.05 이하           | 58개 중 56개       |
| 1.05 초과 1.35 이하 | 2개 (1.066, 1.060) |
| 1.35 초과           | 0개                |
| 0.95 미만 (빨라짐)  | 5개                |

느려진 쪽은 화면을 실제로 그리는 `fieldLifecycle.bench.ts`에 모여 있으며 평균 약 3%입니다. 필드마다 입력과 레이블의 식별자를 계산하는 수정과 방향이 같습니다.

## 측정 방법

- 두 트리에서 `vitest bench --outputJson`을 후보, 기준, 후보, 기준 순서로 한 번씩 번갈아 실행했습니다. Node v24.20.0, Apple M1 Max입니다.
- 비율은 후보 두 번의 가운데값(median) 중 작은 값을 기준 두 번의 가운데값 중 작은 값으로 나눈 것입니다.
- 원자료는 `results/general-bench/`의 `A1.json`, `A2.json`(기준)과 `B1.json`, `B2.json`(후보)입니다.
- `fieldLifecycle.bench.ts`는 두 트리 모두 현재 저장소의 파일로 실행했습니다. 식별자가 경로와 같다고 가정한 원래 파일은 후보에서 끝까지 실행되지 않습니다.

## 읽는 법

이 벤치마크는 실행마다 흔들림이 큽니다. 같은 트리를 두 번 잰 값끼리도 3~7% 차이가 나는 항목이 있고, vitest가 보고하는 상대 오차가 50%를 넘는 항목도 있습니다. 대조와 무효 규칙이 없으므로 5% 안쪽의 차이는 같다고 읽습니다.

## 항목별 값

### `branch-strategy-init.bench.ts`

| 벤치마크                                                                                     | 기준      | 현재      | 비율  |
| -------------------------------------------------------------------------------------------- | --------- | --------- | ----- |
| blueprint/load: branch initialization through core > oneOf 2 branches × 3 children           | 221.92 µs | 221.21 µs | 0.997 |
| blueprint/load: branch initialization through core > oneOf 5 branches × 3 children           | 297.50 µs | 297.50 µs | 1.000 |
| blueprint/load: branch initialization through core > oneOf 2 branches × 10 children          | 406.98 µs | 408.85 µs | 1.005 |
| blueprint/load: branch initialization through core > oneOf 10 branches × 10 children (heavy) | 1.19 ms   | 1.18 ms   | 0.994 |
| blueprint/load: branch initialization through core > nested oneOf depth 3                    | 981.17 µs | 988.90 µs | 1.008 |
| blueprint/load: branch initialization through core > nested oneOf depth 5                    | 4.79 ms   | 4.73 ms   | 0.988 |

### `compute-recalculate.bench.ts`

| 벤치마크                                                         | 기준     | 현재     | 비율  |
| ---------------------------------------------------------------- | -------- | -------- | ----- |
| settle: controls through public core > visible only (1 dep)      | 7.83 µs  | 7.58 µs  | 0.968 |
| settle: controls through public core > visible + active (2 deps) | 19.25 µs | 18.67 µs | 0.970 |
| settle: controls through public core > derived simple (2 deps)   | 22.96 µs | 22.42 µs | 0.976 |
| settle: controls through public core > derived heavy (7 deps)    | 25.83 µs | 25.33 µs | 0.981 |
| settle: controls through public core > watch 5 deps              | 7.92 µs  | 8.12 µs  | 1.026 |
| settle: controls through public core > oneOfIndex 3 branches     | 73.58 µs | 72.21 µs | 0.981 |

### `event-cascade.bench.ts`

| 벤치마크                                                                                                          | 기준    | 현재    | 비율  |
| ----------------------------------------------------------------------------------------------------------------- | ------- | ------- | ----- |
| dispatch: public writes (legacy macrotask drain retained) > flat batch: 10 setValue on distinct fields + 1 drain  | 1.63 ms | 1.69 ms | 1.039 |
| dispatch: public writes (legacy macrotask drain retained) > derived chain (a→sum→twice→label): 1 setValue + drain | 1.85 ms | 1.76 ms | 0.952 |
| dispatch: public writes (legacy macrotask drain retained) > oneOf branch switch (a↔b): 1 setValue + drain        | 1.58 ms | 1.57 ms | 0.995 |

### `find-node.bench.ts`

| 벤치마크                                                     | 기준    | 현재    | 비율  |
| ------------------------------------------------------------ | ------- | ------- | ----- |
| navigation: find through core > depth 3 (4 segments)         | 542 ns  | 542 ns  | 1.000 |
| navigation: find through core > depth 7 (8 segments)         | 1000 ns | 1000 ns | 1.000 |
| navigation: find through core > depth 12 (13 segments)       | 1.58 µs | 1.54 µs | 0.974 |
| navigation: find through core > wide fanout 10 → last child  | 167 ns  | 167 ns  | 1.000 |
| navigation: find through core > wide fanout 50 → last child  | 167 ns  | 167 ns  | 1.000 |
| navigation: find through core > wide fanout 50 → first child | 167 ns  | 167 ns  | 1.000 |

### `nodeFromJSONSchema.bench.ts`

| 벤치마크                                                                    | 기준      | 현재      | 비율  |
| --------------------------------------------------------------------------- | --------- | --------- | ----- |
| load: nodeFromJSONSchema through core > flat (5 props, terminal only)       | 30.08 µs  | 30.83 µs  | 1.025 |
| load: nodeFromJSONSchema through core > nested (2 sub-objects, 7 terminals) | 50.21 µs  | 52.04 µs  | 1.037 |
| load: nodeFromJSONSchema through core > oneOf (single branch active)        | 180.52 µs | 183.21 µs | 1.015 |
| load: nodeFromJSONSchema through core > computed (visible + derived deps)   | 108.38 µs | 112.46 µs | 1.038 |

### `object-pending-read.bench.ts`

| 벤치마크                                                                                    | 기준      | 현재      | 비율  |
| ------------------------------------------------------------------------------------------- | --------- | --------- | ----- |
| settle: object read after child write > 1000 × (child write + 1 parent value read) + drain  | 5.49 ms   | 5.38 ms   | 0.981 |
| settle: object read after child write > 1000 × (child write + 3 parent value reads) + drain | 5.79 ms   | 5.28 ms   | 0.912 |
| settle: object read after child write > 1000 × child write, no read + drain                 | 5.74 ms   | 5.01 ms   | 0.873 |
| settle: object read after child write > 1000 × same-value write at depth 2 + drain          | 5.32 ms   | 5.34 ms   | 1.003 |
| settle: object read after child write > 1000 × same-value write at depth 8 + drain          | 10.37 ms  | 10.24 ms  | 0.987 |
| settle: object read after child write > 1000 × same-value write at depth 16 + drain         | 18.90 ms  | 18.81 ms  | 0.995 |
| settle: object read after child write > create a 50-field form                              | 236.42 µs | 233.77 µs | 0.989 |

### `render-delay.bench.ts`

| 벤치마크                                                                               | 기준      | 현재      | 비율  |
| -------------------------------------------------------------------------------------- | --------- | --------- | ----- |
| load/render-delay: small (5 terminals) > [mount] nodeFromJSONSchema (validation off)   | 30.17 µs  | 30.29 µs  | 1.004 |
| load/render-delay: small (5 terminals) > [mount] nodeFromJSONSchema (validation on)    | 30.08 µs  | 29.83 µs  | 0.992 |
| load/render-delay: small (5 terminals) > [guard] clone(schema)                         | 2.00 µs   | 1.96 µs   | 0.979 |
| load/render-delay: small (5 terminals) > [guard] clone(defaultValue)                   | 417 ns    | 375 ns    | 0.899 |
| load/render-delay: medium (25 terminals) > [mount] nodeFromJSONSchema (validation off) | 152.79 µs | 151.67 µs | 0.993 |
| load/render-delay: medium (25 terminals) > [mount] nodeFromJSONSchema (validation on)  | 151.54 µs | 152.13 µs | 1.004 |
| load/render-delay: medium (25 terminals) > [guard] clone(schema)                       | 10.79 µs  | 10.87 µs  | 1.008 |
| load/render-delay: medium (25 terminals) > [guard] clone(defaultValue)                 | 2.29 µs   | 2.04 µs   | 0.891 |
| load/render-delay: large (150 terminals) > [mount] nodeFromJSONSchema (validation off) | 853.54 µs | 853.67 µs | 1.000 |
| load/render-delay: large (150 terminals) > [mount] nodeFromJSONSchema (validation on)  | 832.60 µs | 829.46 µs | 0.996 |
| load/render-delay: large (150 terminals) > [guard] clone(schema)                       | 60.63 µs  | 58.63 µs  | 0.967 |
| load/render-delay: large (150 terminals) > [guard] clone(defaultValue)                 | 9.21 µs   | 7.75 µs   | 0.842 |

### `fieldLifecycle.bench.ts`

| 벤치마크                                                                    | 기준      | 현재      | 비율  |
| --------------------------------------------------------------------------- | --------- | --------- | ----- |
| fieldLifecycle > mount 1000 inputs                                          | 169.28 ms | 175.01 ms | 1.034 |
| fieldLifecycle > mount 1000 items virtualized                               | 63.00 ms  | 63.28 ms  | 1.005 |
| fieldLifecycle > input write                                                | 639.73 µs | 664.13 µs | 1.038 |
| fieldLifecycle > replace visible errors on 1000 fields                      | 129.71 ms | 126.67 ms | 0.977 |
| fieldLifecycle > replace hidden errors on 1000 fields                       | 117.72 ms | 120.42 ms | 1.023 |
| fieldLifecycle > parent re-render with inline formatError on 1000 fields    | 37.79 ms  | 39.62 ms  | 1.049 |
| fieldLifecycle > revealErrors on 1000 fields                                | 58.52 ms  | 60.88 ms  | 1.040 |
| fieldLifecycle > remove first of 300 object items with labeled child fields | 93.74 ms  | 99.91 ms  | 1.066 |
| fieldLifecycle > natural reveal of 100 placeholders                         | 13.89 ms  | 14.72 ms  | 1.060 |
| fieldLifecycle > natural reveal of 3 nested gates                           | 1.15 ms   | 1.20 ms   | 1.047 |
| fieldLifecycle > focus reveal of 3 nested gates                             | 1.09 ms   | 1.11 ms   | 1.018 |

### `findRevealPath.bench.ts`

| 벤치마크                             | 기준      | 현재      | 비율  |
| ------------------------------------ | --------- | --------- | ----- |
| findRevealPath > 1000 placeholders   | 8.21 µs   | 8.25 µs   | 1.005 |
| findRevealPath > 10000 placeholders  | 74.13 µs  | 74.29 µs  | 1.002 |
| findRevealPath > 100000 placeholders | 742.48 µs | 743.67 µs | 1.002 |
