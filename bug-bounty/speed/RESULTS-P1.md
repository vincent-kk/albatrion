# 우선순위 1 재측정 결과

기준 `1c77ced57`, 후보 `d78e45c6b`, Node v24.20.0, Apple M1 Max. 행마다 아래 `출처` 디렉터리의 `results/<출처>/run.json`이 원자료입니다. 같은 행을 여러 번 잰 경우 라운드가 많은 유효한 실행을 골랐습니다. 판정에는 [이번 측정의 결정](README.md#이번-측정의-결정)의 작은 절대 시간 허용 폭을 적용했고, 적용한 행은 판정 옆에 허용 폭을 적었습니다. 기준 시간은 연산 한 번의 최솟값이며, 한 번의 실행에 호출을 여러 번 담은 행은 호출 한 번으로 나눈 값입니다.

| 행                              | 패키지                           | 함수                       | 입력                                    | 입력 종류 | 기준 시간 | min 비율 | p10 비율 | 대조 (min / p10) | 판정                | 출처             |
| ------------------------------- | -------------------------------- | -------------------------- | --------------------------------------- | --------- | --------- | -------- | -------- | ---------------- | ------------------- | ---------------- |
| 01-schema-first-miss            | @winglet/json-schema             | resolve                    | first miss with 20 resources            | plain     | 1.07 µs   | 144.310  | 142.982  | 1.000 / 1.002    | over                | p1-a (24)        |
| 02-rest-changed                 | @winglet/react-utils             | useRestProperties          | 2000 hook calls in one rerender         | plain     | 103 ns    | 1.651    | 1.708    | 0.997 / 1.009    | over                | p1-d (24)        |
| 03-rest-equal                   | @winglet/react-utils             | useRestProperties          | 2000 hook calls in one rerender         | plain     | 91 ns     | 2.050    | 2.037    | 1.005 / 1.017    | over                | p1-d (24)        |
| 04-equals-deep                  | @winglet/common-utils            | equals                     | two independent 128-deep chains         | plain     | 6.85 µs   | 2.636    | 2.667    | 0.999 / 0.999    | over                | p1-a (24)        |
| 05-isEmpty-general              | @winglet/common-utils            | isEmpty                    | 12 mixed values in order                | plain     | 12 ns     | 0.998    | 0.998    | 1.000 / 1.001    | pass                | p1-d (24)        |
| 06-getValue-tokens              | @winglet/json                    | getValue                   | three pointer tokens                    | plain     | 50 ns     | 1.290    | 1.310    | 0.999 / 0.998    | pass (허용 1.35)    | p1-a (24)        |
| 07-document-fresh-add           | @winglet/style-utils             | styleManagerFactory/inject | fresh document scope                    | plain     | 343 ns    | 1.975    | 1.869    | 0.958 / 1.004    | over (대조 범위 밖) | p1-e (24)        |
| 08-flat-combinator              | @winglet/style-utils             | compressCss                | flat combinator rule                    | plain     | 562 ns    | 0.356    | 0.354    | 0.997 / 1.003    | pass                | p1-a (24)        |
| 09-inject-add                   | @winglet/style-utils             | inject                     | active document scope                   | plain     | 194 ns    | 1.665    | 1.688    | 0.979 / 0.992    | over (대조 범위 밖) | p1-e (24)        |
| 10-plain-multiple               | @winglet/style-utils             | compressCss                | 200 flat rules                          | plain     | 12.98 µs  | 0.841    | 0.840    | 1.000 / 1.000    | pass                | p1-b (24)        |
| 11-checkboxChangePlain          | @canard/schema-form-antd5-plugin | checkbox change            | two string options                      | plain     | 291.16 µs | 1.043    | 1.042    | 0.991 / 0.998    | over                | p1-e (24)        |
| 12-clone-builtins               | @winglet/common-utils            | clone                      | array and built-in values               | plain     | 365 ns    | 1.169    | 1.168    | 1.000 / 0.999    | pass (허용 1.35)    | p1-b (24)        |
| 13-cloneLite-deep               | @winglet/common-utils            | cloneLite                  | 300-deep child chain                    | plain     | 14.26 µs  | 1.274    | 1.280    | 1.002 / 1.000    | over                | p1-b (24)        |
| 14-clone-deep                   | @winglet/common-utils            | clone                      | 300-deep next chain                     | plain     | 40.83 µs  | 1.174    | 1.178    | 1.003 / 1.002    | over                | p1-b (24)        |
| 15-getValue-array               | @winglet/json                    | getValue                   | array pointer                           | plain     | 84 ns     | 1.082    | 1.080    | 1.006 / 1.001    | pass (허용 1.35)    | p1-b (24)        |
| 16-mount-plain                  | @canard/schema-form              | Form SSR                   | object with string and number           | plain     | 43.39 µs  | 1.085    | 1.109    | 0.999 / 1.002    | over                | p1-b (24)        |
| 17-whole-array-client-own-write | @canard/schema-form              | whole array own write      | uncontrolled array input                | plain     | 54.91 µs  | 1.084    | 1.087    | 0.994 / 0.999    | over                | p1-d (24)        |
| 18-getValue-fragment-plain      | @winglet/json                    | getValue                   | unencoded fragment pointer              | plain     | 84 ns     | 0.956    | 0.956    | 0.999 / 1.000    | pass                | p1-b (24)        |
| 19-context-update               | @canard/schema-form              | Form context update        | nested context change                   | plain     | 31.17 µs  | 1.067    | 1.071    | 0.988 / 0.997    | over                | p1-d (24)        |
| 20-isEmpty-local-map            | @winglet/common-utils            | isEmpty                    | nonempty local map                      | plain     | 2 ns      | 1.000    | 1.000    | 1.000 / 1.000    | pass                | p1-rerun-20 (48) |
| 21-engine-mount-plain           | @canard/schema-form              | Form client mount          | object with a string and a number field | plain     | 249.79 µs | 0.985    | 0.969    | 1.005 / 1.009    | pass                | p1-c (24)        |
| 22-stringSwitchMount            | @canard/schema-form-mui-plugin   | string switch mount        | enum switch with aliases                | repaired  | 388.29 µs | 1.017    | 1.020    | 1.002 / 1.001    | pass                | p1-rerun-22 (48) |
| 23-patch-array-test-mutable     | @winglet/json                    | applyPatch                 | mutable array test patch                | plain     | 53 ns     | 0.969    | 0.969    | 0.999 / 1.000    | pass                | p1-c (24)        |
| 24-react-bridges                | @canard/schema-form              | Form.Render SSR            | label and input bridge                  | plain     | 25.84 µs  | 1.027    | 1.035    | 0.994 / 1.008    | over                | p1-rerun-24 (48) |

07과 09는 대조군이 범위를 2~4% 벗어났지만 후보와의 차이가 67~97%여서 초과로 분류했습니다. 개선 후 재측정에서 유효한 대조군으로 다시 확인합니다.

## 개선 병합 뒤

후보는 개선 묶음 다섯 개가 병합된 `1.0.0/optimize`의 `c8aa0cfda`이고, 원자료는 `results/final-p1/run.json`(24라운드)입니다. 허용 폭은 위 표와 같은 호출 한 번의 기준 시간으로 정했습니다.

| 행                              | 기준 시간 | 개선 전 (min / p10) | 개선 후 (min / p10) | 대조 (min / p10) | 판정             | 비고                                                               |
| ------------------------------- | --------- | ------------------- | ------------------- | ---------------- | ---------------- | ------------------------------------------------------------------ |
| 01-schema-first-miss            | 1.07 µs   | 144.310 / 142.982   | 9.859 / 9.841       | 1.003 / 1.000    | over             | 수정 비용 ([기록](issues/json-schema-first-miss-fix-cost.md))      |
| 02-rest-changed                 | 103 ns    | 1.651 / 1.708       | 1.529 / 1.700       | 1.003 / 1.002    | over             | 수정 비용 ([기록](issues/use-rest-properties-fix-cost.md))         |
| 03-rest-equal                   | 91 ns     | 2.050 / 2.037       | 2.010 / 1.937       | 1.000 / 0.998    | over             | 수정 비용 ([기록](issues/use-rest-properties-fix-cost.md))         |
| 04-equals-deep                  | 6.85 µs   | 2.636 / 2.667       | 1.464 / 1.471       | 1.001 / 1.003    | over             | 수정 비용 ([기록](issues/common-utils-deep-traversal-fix-cost.md)) |
| 05-isEmpty-general              | 12 ns     | 0.998 / 0.998       | 0.997 / 0.999       | 1.001 / 1.001    | pass             |                                                                    |
| 06-getValue-tokens              | 50 ns     | 1.290 / 1.310       | 1.323 / 1.322       | 0.999 / 1.000    | pass (허용 1.35) |                                                                    |
| 07-document-fresh-add           | 343 ns    | 1.975 / 1.869       | 1.251 / 1.284       | 1.030 / 1.021    | void             | 대조군 이탈, 다른 실행에서 1.286 / 1.223                           |
| 08-flat-combinator              | 562 ns    | 0.356 / 0.354       | 0.356 / 0.354       | 0.999 / 0.999    | pass             |                                                                    |
| 09-inject-add                   | 194 ns    | 1.665 / 1.688       | 1.074 / 1.094       | 1.012 / 1.014    | pass (허용 1.35) |                                                                    |
| 10-plain-multiple               | 12.98 µs  | 0.841 / 0.840       | 0.840 / 0.839       | 1.000 / 1.000    | pass             |                                                                    |
| 11-checkboxChangePlain          | 291.16 µs | 1.043 / 1.042       | 1.031 / 1.019       | 1.015 / 1.005    | over             | 초과 0.001, 코어 비용을 그대로 받는 행                             |
| 12-clone-builtins               | 365 ns    | 1.169 / 1.168       | 1.171 / 1.180       | 1.001 / 1.003    | pass (허용 1.35) |                                                                    |
| 13-cloneLite-deep               | 14.26 µs  | 1.274 / 1.280       | 1.164 / 1.158       | 1.002 / 1.000    | over             | 수정 비용 ([기록](issues/common-utils-deep-traversal-fix-cost.md)) |
| 14-clone-deep                   | 40.83 µs  | 1.174 / 1.178       | 1.063 / 1.067       | 1.006 / 0.997    | over             | 결정 대기 ([기록](issues/clone-deep-generator-option.md))          |
| 15-getValue-array               | 84 ns     | 1.082 / 1.080       | 1.080 / 1.078       | 1.001 / 0.999    | pass (허용 1.35) |                                                                    |
| 16-mount-plain                  | 43.39 µs  | 1.085 / 1.109       | 1.031 / 1.041       | 0.989 / 0.998    | over             | 결정 대기 ([기록](issues/schema-form-remaining-overage.md))        |
| 17-whole-array-client-own-write | 54.91 µs  | 1.084 / 1.087       | 1.054 / 1.047       | 1.008 / 1.004    | over             | 결정 대기 ([기록](issues/schema-form-remaining-overage.md))        |
| 18-getValue-fragment-plain      | 84 ns     | 0.956 / 0.956       | 0.958 / 0.951       | 1.001 / 0.999    | pass             |                                                                    |
| 19-context-update               | 31.17 µs  | 1.067 / 1.071       | 1.052 / 1.060       | 0.999 / 1.002    | over             | 결정 대기 ([기록](issues/schema-form-remaining-overage.md))        |
| 20-isEmpty-local-map            | 2 ns      | 1.000 / 1.000       | 1.000 / 1.000       | 1.000 / 1.000    | pass             |                                                                    |
| 21-engine-mount-plain           | 249.79 µs | 0.985 / 0.969       | 0.976 / 0.947       | 1.000 / 1.002    | pass             |                                                                    |
| 22-stringSwitchMount            | 388.29 µs | 1.017 / 1.020       | 1.011 / 1.005       | 1.002 / 0.999    | pass             |                                                                    |
| 23-patch-array-test-mutable     | 53 ns     | 0.969 / 0.969       | 0.967 / 0.962       | 1.000 / 0.999    | pass             |                                                                    |
| 24-react-bridges                | 25.84 µs  | 1.027 / 1.035       | 1.017 / 1.135       | 0.995 / 0.987    | over             | p10이 실행마다 0.97~1.14로 흔들림                                  |
