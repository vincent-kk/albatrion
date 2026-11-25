# 최종 측정 결과 (110행)

기준 `1c77ced57`, 후보는 `1.0.0/optimize` `53099d518`(PR #683~#696의 개선을 모두 담은 트리)입니다. 모든 행을 24라운드로 쟀고, Node v24.20.0, Apple M1 Max입니다. 비율은 후보 ÷ 기준이고 `min / p10` 순서입니다. `antd-mobile` 행의 기준은 `antd-mobile` 5.43.0을 넣은 기준 트리입니다. `출처`는 `results/` 아래 디렉터리이며 그 안의 `run.json`이 원자료입니다.

한도는 연산 한 번의 기준 시간으로 정합니다. 1 ms 이상이면 1.05, 1 µs~1 ms면 1.35, 1 µs 미만이면 3배입니다. 화면 플러그인(`antd5`, `antd6`, `mui`, `antd-mobile`)과 `@slats/agents-assets-sync`는 1.5입니다. `min`과 `p10`이 모두 한도 아래여야 통과입니다.

| 묶음 | 행 | 통과 | 수용 | 결정 대기 |
| --- | --- | --- | --- | --- |
| 우선순위 1 | 24 | 22 | 2 | 0 |
| 우선순위 2 잘라낸 행 | 24 | 6 | 18 | 0 |
| 우선순위 2 엔진 행 | 18 | 16 | 2 | 0 |
| 우선순위 2 화면 플러그인 행 | 25 | 23 | 2 | 0 |
| 우선순위 3 | 19 | 11 | 7 | 1 |
| 합계 | 110 | 78 | 31 | 1 |

- **수용**은 한도를 넘지만 Vincent가 수정 비용 또는 현재 값으로 받아들인 행이며, 판정 칸의 기록에 근거(진단 빌드와 그 일을 빼면 실패하는 테스트)가 있습니다.
- **결정 대기**는 `p3-14` 하나입니다. 이번 값은 1.352 / 1.349이고 직전 24라운드 값은 1.336 / 1.340(`results/schema-form-p3-final`)으로, 한도 1.35의 양쪽에 걸칩니다. 여분은 [schema-form 우선순위 3 기록](issues/schema-form-p3-fix-cost.md)이 비제어 입력의 재마운트로 귀속한 것과 같습니다.
- **대조 무효**는 기준을 두 번 잰 값의 비가 0.98~1.02를 벗어난 행입니다. `p1-07`과 `p3-19`는 네 번 재도 벗어났고, 가장 가까운 실행을 적었습니다. `p1-07`은 한도 3배 안이고 `p3-19`는 수용된 행입니다.
- `p3-11`과 `p3-17`은 기준 트리에서 유효한 입력이 되지 못해 후보끼리 쟀고, 비율은 측정 잡음만 나타냅니다.
- `p2e-16`~`p2e-18`은 한 실행에 읽기를 여러 번 담은 행이라 기준 시간을 읽기 한 번으로 적었습니다([근거](issues/schema-form-p2-fix-cost.md)).
- `p2c-20`(2.01)은 수용 당시 범위(1.6~1.95)보다 조금 높게 나왔습니다. 그 뒤 이 패키지의 코드는 바뀌지 않았고, 파일 시스템을 쓰는 행이라 기준 시간이 날마다 달라집니다.

## 우선순위 1 (24행)

| 행 | 패키지 | 기준 시간 | min / p10 | 대조 | 한도 | 판정 | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| p1-01-schema-first-miss | @winglet/json-schema | 1.08 µs | 8.429 / 8.514 | 0.982 / 0.992 | 1.35 | 수용 ([기록](issues/json-schema-first-miss-fix-cost.md)) | final-p1-1 |
| p1-02-rest-changed | @winglet/react-utils | 103 ns | 1.525 / 1.661 | 1.008 / 1.004 | 3배 | 통과 | final-p1-1 |
| p1-03-rest-equal | @winglet/react-utils | 92 ns | 2.011 / 1.946 | 0.990 / 0.997 | 3배 | 통과 | final-p1-1 |
| p1-04-equals-deep | @winglet/common-utils | 6.83 µs | 1.469 / 1.487 | 1.000 / 1.001 | 1.35 | 수용 ([기록](issues/common-utils-deep-traversal-fix-cost.md)) | final-p1-1 |
| p1-05-isEmpty-general | @winglet/common-utils | 12 ns | 0.997 / 0.996 | 0.999 / 0.998 | 3배 | 통과 | final-p1-1 |
| p1-06-getValue-tokens | @winglet/json | 50 ns | 1.282 / 1.287 | 1.000 / 1.000 | 3배 | 통과 | final-p1-1 |
| p1-07-document-fresh-add | @winglet/style-utils | 347 ns | 1.294 / 1.290 | 1.003 / 1.028 | 3배 | 통과, 대조 무효 | final-p1-2-rerun3 |
| p1-08-flat-combinator | @winglet/style-utils | 559 ns | 0.384 / 0.383 | 0.999 / 0.999 | 3배 | 통과 | final-p1-2 |
| p1-09-inject-add | @winglet/style-utils | 191 ns | 1.048 / 1.071 | 0.996 / 0.998 | 3배 | 통과 | final-p1-2 |
| p1-10-plain-multiple | @winglet/style-utils | 12.98 µs | 0.859 / 0.859 | 1.000 / 1.000 | 1.35 | 통과 | final-p1-2 |
| p1-11-checkboxChangePlain | @canard/schema-form-antd5-plugin | 276.30 µs | 1.046 / 1.014 | 1.020 / 0.993 | 1.5 | 통과 | final-p1-2-rerun1 |
| p1-12-clone-builtins | @winglet/common-utils | 366 ns | 1.168 / 1.170 | 0.996 / 1.002 | 3배 | 통과 | final-p1-2 |
| p1-13-cloneLite-deep | @winglet/common-utils | 14.28 µs | 1.156 / 1.156 | 0.997 / 0.998 | 1.35 | 통과 | final-p1-3 |
| p1-14-clone-deep | @winglet/common-utils | 40.87 µs | 0.983 / 0.985 | 1.001 / 1.002 | 1.35 | 통과 | final-p1-3 |
| p1-15-getValue-array | @winglet/json | 85 ns | 1.083 / 1.084 | 1.000 / 1.001 | 3배 | 통과 | final-p1-3 |
| p1-16-mount-plain | @canard/schema-form | 43.15 µs | 0.992 / 0.998 | 0.994 / 1.001 | 1.35 | 통과 | final-p1-3 |
| p1-17-whole-array-client-own-write | @canard/schema-form | 54.50 µs | 1.039 / 1.044 | 1.010 / 1.002 | 1.35 | 통과 | final-p1-3 |
| p1-18-getValue-fragment-plain | @winglet/json | 84 ns | 0.988 / 0.992 | 0.999 / 1.000 | 3배 | 통과 | final-p1-3 |
| p1-19-context-update | @canard/schema-form | 31.23 µs | 1.062 / 1.063 | 1.005 / 1.005 | 1.35 | 통과 | final-p1-4 |
| p1-20-isEmpty-local-map | @winglet/common-utils | 1.9 ns | 1.000 / 1.000 | 1.000 / 1.000 | 3배 | 통과 | final-p1-4 |
| p1-21-engine-mount-plain | @canard/schema-form | 257.17 µs | 0.971 / 0.977 | 0.988 / 0.992 | 1.35 | 통과 | final-p1-4 |
| p1-22-stringSwitchMount | @canard/schema-form-mui-plugin | 391.82 µs | 1.009 / 1.004 | 1.007 / 1.000 | 1.5 | 통과 | final-p1-4 |
| p1-23-patch-array-test-mutable | @winglet/json | 53 ns | 0.967 / 0.967 | 0.999 / 0.999 | 3배 | 통과 | final-p1-4 |
| p1-24-react-bridges | @canard/schema-form | 25.62 µs | 1.047 / 1.054 | 1.006 / 0.997 | 1.35 | 통과 | final-p1-4-rerun1 |

## 우선순위 2: 잘라낸 행 (24행)

| 행 | 패키지 | 기준 시간 | min / p10 | 대조 | 한도 | 판정 | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| p2c-01-checkboxChange | @canard/schema-form-antd5-plugin | 237.76 µs | 0.768 / 0.753 | 0.983 / 0.996 | 1.5 | 통과 | final-p2c-1 |
| p2c-02-branchError | @canard/schema-form-antd5-plugin | 123.73 µs | 1.977 / 1.903 | 1.000 / 0.996 | 1.5 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2c-1 |
| p2c-03-coreExternalArray | @canard/schema-form-antd5-plugin | 143.93 µs | 7.697 / 7.683 | 0.998 / 1.000 | 1.5 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2c-1 |
| p2c-04-multiEnumMount | @canard/schema-form-antd6-plugin | 4.20 ms | 1.038 / 1.030 | 1.002 / 0.999 | 1.5 | 통과 | final-p2c-1 |
| p2c-05-sliderChange | @canard/schema-form-antd-mobile-plugin | 87.62 µs | 1.094 / 1.090 | 1.008 / 1.001 | 1.5 | 통과 | final-am-1 |
| p2c-06-checkboxChange | @canard/schema-form-mui-plugin | 266.11 µs | 1.014 / 1.008 | 0.988 / 0.999 | 1.5 | 통과 | final-p2c-1 |
| p2c-07-branchError | @canard/schema-form-mui-plugin | 57.21 µs | 1.440 / 1.447 | 0.990 / 0.998 | 1.5 | 통과 | final-p2c-1 |
| p2c-08-context-error-cause | @canard/schema-form | 7.98 µs | 5.919 / 5.891 | 1.002 / 0.998 | 1.35 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2c-2 |
| p2c-09-mount-100 | @canard/schema-form | 1.04 ms | 1.060 / 1.061 | 0.998 / 0.995 | 1.05 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2c-2 |
| p2c-10-whole-array-client-write | @canard/schema-form | 31.26 µs | 1.344 / 1.352 | 0.997 / 1.005 | 1.35 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2c-2 |
| p2c-11-anchor-slider6-gate | @canard/schema-form | 2.67 ms | 3.396 / 3.416 | 0.994 / 0.998 | 1.05 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2c-2 |
| p2c-12-lists | @winglet/style-utils | 11.12 µs | 3.229 / 3.218 | 1.002 / 1.000 | 1.35 | 수용 ([기록](issues/style-utils-p2-fix-cost.md)) | final-p2c-2 |
| p2c-13-opaque | @winglet/style-utils | 12.09 µs | 3.333 / 3.251 | 0.998 / 1.001 | 1.35 | 수용 ([기록](issues/style-utils-p2-fix-cost.md)) | final-p2c-2 |
| p2c-14-media | @winglet/style-utils | 31.64 µs | 2.232 / 2.221 | 0.999 / 1.001 | 1.35 | 수용 ([기록](issues/style-utils-p2-fix-cost.md)) | final-p2c-3 |
| p2c-15-escapes | @winglet/style-utils | 11.73 µs | 2.616 / 2.613 | 0.998 / 0.997 | 1.35 | 수용 ([기록](issues/style-utils-p2-fix-cost.md)) | final-p2c-3 |
| p2c-16-pseudo | @winglet/style-utils | 12.07 µs | 2.586 / 2.589 | 0.997 / 1.001 | 1.35 | 수용 ([기록](issues/style-utils-p2-fix-cost.md)) | final-p2c-3 |
| p2c-17-mixed | @winglet/style-utils | 708.98 µs | 3.068 / 3.076 | 0.999 / 1.000 | 1.35 | 수용 ([기록](issues/style-utils-p2-fix-cost.md)) | final-p2c-3 |
| p2c-18-installer-new | @slats/agents-assets-sync | 3.73 ms | 1.752 / 1.743 | 0.994 / 1.000 | 1.5 | 수용 ([기록](issues/assets-sync-installer-overage.md)) | final-p2c-3 |
| p2c-19-installer-unchanged | @slats/agents-assets-sync | 2.98 ms | 1.681 / 1.675 | 1.006 / 1.001 | 1.5 | 수용 ([기록](issues/assets-sync-installer-overage.md)) | final-p2c-3 |
| p2c-20-installer-force | @slats/agents-assets-sync | 3.14 ms | 2.009 / 2.051 | 1.001 / 0.999 | 1.5 | 수용 ([기록](issues/assets-sync-installer-overage.md)) | final-p2c-4 |
| p2c-21-isEmpty-foreign-map | @winglet/common-utils | 5.16 ms | 1.005 / 1.004 | 1.002 / 0.998 | 1.05 | 통과 | final-p2c-4 |
| p2c-22-schema-known-noncanonical | @winglet/json-schema | 4.14 µs | 1.921 / 1.911 | 1.007 / 1.003 | 1.35 | 수용 ([기록](issues/json-schema-registration-fix-cost.md)) | final-p2c-4 |
| p2c-23-schema-first-embedded | @winglet/json-schema | 1.08 µs | 11.121 / 11.029 | 1.004 / 0.998 | 1.35 | 수용 ([기록](issues/json-schema-registration-fix-cost.md)) | final-p2c-4 |
| p2c-24-schema-key-collision | @winglet/json-schema | 3.77 µs | 2.333 / 2.336 | 0.998 / 0.999 | 1.35 | 수용 ([기록](issues/json-schema-registration-fix-cost.md)) | final-p2c-4 |

## 우선순위 2: 엔진 행 (18행)

| 행 | 패키지 | 기준 시간 | min / p10 | 대조 | 한도 | 판정 | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| p2e-01-ab-reset-pending | @canard/schema-form | 25.43 µs | 0.988 / 1.006 | 1.005 / 0.999 | 1.35 | 통과 | final-p2e-1 |
| p2e-02-virtual-merge-one | @canard/schema-form | 16.39 µs | 1.032 / 1.043 | 0.999 / 1.009 | 1.35 | 통과 | final-p2e-1 |
| p2e-03-ab-derive-disjoint | @canard/schema-form | 9.90 µs | 1.056 / 1.053 | 0.988 / 0.998 | 1.35 | 통과 | final-p2e-1 |
| p2e-04-virtual-write | @canard/schema-form | 4.96 µs | 1.061 / 1.061 | 0.995 / 0.993 | 1.35 | 통과 | final-p2e-1 |
| p2e-05-virtual-reset | @canard/schema-form | 4.64 µs | 1.055 / 1.085 | 0.983 / 0.998 | 1.35 | 통과 | final-p2e-1 |
| p2e-06-virtual-absent-undefined | @canard/schema-form | 17.25 µs | 1.039 / 1.045 | 1.005 / 0.999 | 1.35 | 통과 | final-p2e-1 |
| p2e-07-mount-100 | @canard/schema-form | 6.53 ms | 1.025 / 1.023 | 1.005 / 1.000 | 1.05 | 통과 | final-p2e-2 |
| p2e-08-aliased-mount | @canard/schema-form | 88.07 µs | 1.151 / 1.150 | 1.010 / 1.003 | 1.35 | 통과 | final-p2e-2 |
| p2e-09-reset-refused-sequential-8 | @canard/schema-form | 117.71 µs | 1.007 / 1.002 | 0.998 / 0.992 | 1.35 | 통과 | final-p2e-2 |
| p2e-10-plain-merge-shallow | @canard/schema-form | 3.89 µs | 0.997 / 0.996 | 0.997 / 0.996 | 1.35 | 통과 | final-p2e-2 |
| p2e-11-whole-array-client-write | @canard/schema-form | 31.66 µs | 1.330 / 1.335 | 0.999 / 0.997 | 1.35 | 통과 | final-p2e-2 |
| p2e-12-whole-array-client-own-write | @canard/schema-form | 33.31 µs | 1.039 / 1.043 | 1.000 / 1.002 | 1.35 | 통과 | final-p2e-2 |
| p2e-13-whole-array-client-mixed-batch | @canard/schema-form | 37.82 µs | 1.308 / 1.312 | 0.996 / 1.000 | 1.35 | 통과 | final-p2e-3 |
| p2e-14-whole-array-client-composition | @canard/schema-form | 72.22 µs | 1.435 / 1.465 | 0.999 / 1.000 | 1.35 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2e-3 |
| p2e-15-batch-structural | @canard/schema-form | 10.29 µs | 1.826 / 1.862 | 1.008 / 1.004 | 1.35 | 수용 ([기록](issues/schema-form-p2-fix-cost.md)) | final-p2e-3 |
| p2e-16-virtual-getters | @canard/schema-form | 34 ns (읽기 한 번) | 1.330 / 1.342 | 0.990 / 1.004 | 3배 | 통과 | final-p2e-3 |
| p2e-17-virtual-getter-divergence | @canard/schema-form | 95 ns (읽기 한 번) | 2.182 / 2.192 | 0.989 / 1.003 | 3배 | 통과 | final-p2e-3 |
| p2e-18-virtual-getter-inactive | @canard/schema-form | 3.3 ns (읽기 한 번) | 2.854 / 2.957 | 1.002 / 1.007 | 3배 | 통과 | final-p2e-3 |

## 우선순위 2: 화면 플러그인 행 (25행)

| 행 | 패키지 | 기준 시간 | min / p10 | 대조 | 한도 | 판정 | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| p2u-01-antd5-timeRangePanel | @canard/schema-form-antd5-plugin | 20.57 ms | 0.967 / 0.965 | 0.996 / 1.001 | 1.5 | 통과 | final-p2u-1 |
| p2u-02-antd5-coreFormMount | @canard/schema-form-antd5-plugin | 7.85 ms | 1.020 / 1.002 | 1.012 / 0.996 | 1.5 | 통과 | final-p2u-1 |
| p2u-03-antd5-coreEqualArray | @canard/schema-form-antd5-plugin | 2.00 µs | 0.955 / 0.967 | 1.004 / 1.001 | 1.5 | 통과 | final-p2u-1 |
| p2u-04-antd5-sliderMount | @canard/schema-form-antd5-plugin | 4.72 ms | 1.005 / 1.002 | 0.997 / 1.001 | 1.5 | 통과 | final-p2u-1 |
| p2u-05-antd5-uriMount | @canard/schema-form-antd5-plugin | 8.87 ms | 1.001 / 0.996 | 1.000 / 0.999 | 1.5 | 통과 | final-p2u-1 |
| p2u-06-antd5-multiEnumMount | @canard/schema-form-antd5-plugin | 4.86 ms | 1.039 / 1.044 | 0.999 / 1.001 | 1.5 | 통과 | final-p2u-1 |
| p2u-07-antd5-coreOwnArray | @canard/schema-form-antd5-plugin | 237.16 µs | 1.069 / 1.097 | 1.011 / 1.004 | 1.5 | 통과 | final-p2u-2 |
| p2u-08-antd5-timeRangeMount | @canard/schema-form-antd5-plugin | 5.34 ms | 0.987 / 0.990 | 1.002 / 1.003 | 1.5 | 통과 | final-p2u-2 |
| p2u-09-antd5-timeRangePanelPlain | @canard/schema-form-antd5-plugin | 19.59 ms | 1.000 / 0.989 | 1.000 / 0.999 | 1.5 | 통과 | final-p2u-2 |
| p2u-10-antd6-sliderMount | @canard/schema-form-antd6-plugin | 5.20 ms | 1.000 / 0.996 | 1.001 / 0.999 | 1.5 | 통과 | final-p2u-2 |
| p2u-11-antd6-uriMount | @canard/schema-form-antd6-plugin | 8.07 ms | 1.027 / 1.034 | 1.000 / 1.000 | 1.5 | 통과 | final-p2u-2 |
| p2u-12-antd6-checkboxChange | @canard/schema-form-antd6-plugin | 288.81 µs | 0.714 / 0.704 | 1.008 / 1.009 | 1.5 | 통과 | final-p2u-2 |
| p2u-13-antd6-branchError | @canard/schema-form-antd6-plugin | 113.44 µs | 2.352 / 2.153 | 0.997 / 0.999 | 1.5 | 수용 ([기록](RESULTS-P2-UI.md#결정)) | final-p2u-3 |
| p2u-14-antd6-timeRangeMount | @canard/schema-form-antd6-plugin | 6.24 ms | 0.987 / 0.988 | 0.998 / 0.998 | 1.5 | 통과 | final-p2u-3 |
| p2u-15-antd6-timeRangePanel | @canard/schema-form-antd6-plugin | 16.21 ms | 0.974 / 0.960 | 0.991 / 1.001 | 1.5 | 통과 | final-p2u-3 |
| p2u-16-am-sliderMount | @canard/schema-form-antd-mobile-plugin | 289.78 µs | 0.968 / 0.989 | 0.994 / 1.002 | 1.5 | 통과 | final-am-1 |
| p2u-17-am-radioMount | @canard/schema-form-antd-mobile-plugin | 279.97 µs | 0.987 / 0.988 | 1.005 / 1.003 | 1.5 | 통과 | final-am-1 |
| p2u-18-am-rangeSliderChange | @canard/schema-form-antd-mobile-plugin | 117.39 µs | 1.162 / 1.174 | 1.007 / 1.007 | 1.5 | 통과 | final-am-1 |
| p2u-19-am-checkboxChange | @canard/schema-form-antd-mobile-plugin | 107.05 µs | 1.017 / 1.059 | 1.001 / 0.998 | 1.5 | 통과 | final-am-1 |
| p2u-20-am-branchError | @canard/schema-form-antd-mobile-plugin | 30.94 µs | 1.567 / 1.569 | 1.002 / 1.001 | 1.5 | 수용 ([기록](RESULTS-P2-UI.md#결정)) | final-am-1 |
| p2u-21-mui-datePickerMount | @canard/schema-form-mui-plugin | 1.67 ms | 1.030 / 1.032 | 0.999 / 1.000 | 1.5 | 통과 | final-p2u-3 |
| p2u-22-mui-uriMount | @canard/schema-form-mui-plugin | 903.51 µs | 1.018 / 1.025 | 0.997 / 1.000 | 1.5 | 통과 | final-p2u-3 |
| p2u-23-mui-datePickerPanel | @canard/schema-form-mui-plugin | 13.95 ms | 1.006 / 1.003 | 1.007 / 1.002 | 1.5 | 통과 | final-p2u-3 |
| p2u-24-mui-sliderMount | @canard/schema-form-mui-plugin | 452.56 µs | 1.001 / 0.997 | 0.990 / 0.998 | 1.5 | 통과 | final-p2u-4 |
| p2u-25-mui-sliderChange | @canard/schema-form-mui-plugin | 268.79 µs | 1.020 / 1.042 | 0.989 / 1.004 | 1.5 | 통과 | final-p2u-4 |

## 우선순위 3 (19행)

| 행 | 패키지 | 기준 시간 | min / p10 | 대조 | 한도 | 판정 | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| p3-01-ajv7-root-id-compile | ajv7-plugin | 1.47 ms | 1.060 / 1.080 | 1.000 / 0.998 | 1.05 | 수용 ([기록](issues/ajv-p3-fix-cost.md)) | final-p3-1 |
| p3-02-ajv7-bind-compile | ajv7-plugin | 1.46 ms | 1.076 / 1.084 | 0.995 / 1.005 | 1.05 | 수용 ([기록](issues/ajv-p3-fix-cost.md)) | final-p3-1 |
| p3-03-ajv7-factory-compile | ajv7-plugin | 1.45 ms | 1.081 / 1.083 | 1.002 / 1.001 | 1.05 | 수용 ([기록](issues/ajv-p3-fix-cost.md)) | final-p3-1 |
| p3-04-ajv7-factory-fresh | ajv7-plugin | 1.46 ms | 1.089 / 1.090 | 1.003 / 0.998 | 1.05 | 수용 ([기록](issues/ajv-p3-fix-cost.md)) | final-p3-1 |
| p3-05-ajv8-factory-fresh | ajv8-plugin | 1.53 ms | 1.031 / 1.019 | 1.012 / 1.000 | 1.05 | 통과 | final-p3-1 |
| p3-06-anchor-ssr-initial-errors | schema-form | 10.27 µs | 1.237 / 1.196 | 1.014 / 1.003 | 1.35 | 통과 | final-p3-1 |
| p3-07-overlap-array-32-4 | schema-form | 107.60 µs | 1.180 / 1.180 | 1.003 / 1.001 | 1.35 | 통과 | final-p3-2 |
| p3-08-json-getValue-fragment | @winglet/json | 52 ns | 2.635 / 2.634 | 1.002 / 1.000 | 3배 | 통과 | final-p3-2 |
| p3-09-ab-derive-overlap | schema-form | 16.46 µs | 1.186 / 1.195 | 1.000 / 1.003 | 1.35 | 통과 | final-p3-2 |
| p3-10-reset-refused-8 | schema-form | 111.85 µs | 1.218 / 1.234 | 0.999 / 1.002 | 1.35 | 통과 | final-p3-2 |
| p3-11-expr-return-regexp | schema-form | 66.14 µs | 1.010 / 1.001 | 1.005 / 0.998 | 1.35 | 비교 불가 (후보끼리) | final-p3-4 |
| p3-12-validate-writeback | schema-form | 1.56 µs | 1.217 / 1.239 | 0.994 / 1.003 | 1.35 | 통과 | final-p3-2 |
| p3-13-engine-validate-writeback | schema-form | 1.46 µs | 1.234 / 1.228 | 0.992 / 1.000 | 1.35 | 통과 | final-p3-2 |
| p3-14-r2-client-array-external | schema-form | 31.63 µs | 1.352 / 1.349 | 1.002 / 1.004 | 1.35 | 결정 대기 | final-p3-3 |
| p3-15-r3-batch-array | schema-form | 26.23 µs | 0.497 / 0.502 | 1.006 / 1.003 | 1.35 | 통과 | final-p3-3 |
| p3-16-validate-writeback-errors | schema-form | 3.37 µs | 1.552 / 1.519 | 0.997 / 0.996 | 1.35 | 수용 ([기록](issues/schema-form-p3-fix-cost.md)) | final-p3-3 |
| p3-17-r2-async-relay-content | schema-form | 3.34 µs | 1.012 / 1.003 | 1.000 / 1.000 | 1.35 | 비교 불가 (후보끼리) | final-p3-4-rerun1 |
| p3-18-schema-alternate-lookup | @winglet/json-schema | 1.04 µs | 4.201 / 4.155 | 0.993 / 1.001 | 1.35 | 수용 ([기록](issues/json-schema-p3-fix-cost.md)) | final-p3-3 |
| p3-19-ajv6-bound-first-id-resource-invalid | ajv6-plugin | 521 ns | 7.553 / 7.270 | 0.975 / 0.983 | 3배 | 수용 ([기록](issues/ajv-p3-fix-cost.md)), 대조 무효 | final-p3-3-rerun2 |
