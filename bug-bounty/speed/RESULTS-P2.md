# 우선순위 2 재측정 결과 (잘라낸 행과 엔진 행)

개선을 모두 병합한 뒤의 최종 값과 판정은 [RESULTS-FINAL.md](RESULTS-FINAL.md)에 있습니다. 이 문서는 그 전 단계의 측정 기록입니다.

기준 `1c77ced57`, 후보 `d78e45c6b`(개선 병합 전)입니다. 행마다 유효한 실행 중 라운드가 가장 많은 것을 골랐고, `출처`는 `results/` 아래 디렉터리입니다. 판정에는 [작은 절대 시간 허용 폭](README.md#이번-측정의-결정)을 적용했습니다. 개선이 병합된 뒤의 값은 후보 트리를 다시 만들어 재야 합니다.

| 행                                    | 패키지                           | 입력 종류 | 기준 시간 | min 비율 | p10 비율 | 대조 (min / p10) | 판정             | 출처                                           |
| ------------------------------------- | -------------------------------- | --------- | --------- | -------- | -------- | ---------------- | ---------------- | ---------------------------------------------- |
| p2c-01-checkboxChange                 | @canard/schema-form-antd5-plugin | repaired  | 245.30 µs | 0.761    | 0.743    | 0.998 / 1.009    | pass             | p2c-01 (24)                                    |
| p2c-02-branchError                    | @canard/schema-form-antd5-plugin | repaired  | 132.00 µs | 1.997    | 1.992    | 0.998 / 1.001    | over             | p2c-01 (24)                                    |
| p2c-03-coreExternalArray              | @canard/schema-form-antd5-plugin | repaired  | 136.90 µs | 7.706    | 7.232    | 1.012 / 1.000    | over             | p2c-03-coreExternalArray-rerun (24)            |
| p2c-04-multiEnumMount                 | @canard/schema-form-antd6-plugin | repaired  | 4.00 ms   | 1.043    | 1.057    | 1.003 / 1.005    | over             | p2c-01 (24)                                    |
| p2c-06-checkboxChange                 | @canard/schema-form-mui-plugin   | repaired  | 283.72 µs | 0.949    | 0.957    | 0.988 / 1.011    | pass             | p2c-06 (24)                                    |
| p2c-07-branchError                    | @canard/schema-form-mui-plugin   | repaired  | 64.16 µs  | 1.401    | 1.402    | 0.992 / 0.999    | over             | p2c-06 (24)                                    |
| p2c-08-context-error-cause            | @canard/schema-form              | repaired  | 7.62 µs   | 5.999    | 6.109    | 0.990 / 0.999    | over             | p2c-06 (24)                                    |
| p2c-09-mount-100                      | @canard/schema-form              | plain     | 1.03 ms   | 1.084    | 1.093    | 0.997 / 1.003    | over             | p2c-09-mount-100-rerun (24)                    |
| p2c-10-whole-array-client-write       | @canard/schema-form              | repaired  | 30.33 µs  | 1.396    | 1.397    | 1.009 / 1.001    | over             | p2c-10 (24)                                    |
| p2c-11-anchor-slider6-gate            | @canard/schema-form              | repaired  | 2.54 ms   | 3.554    | 3.584    | 1.002 / 1.002    | over             | p2c-10 (24)                                    |
| p2c-12-lists                          | @winglet/style-utils             | repaired  | 8.60 µs   | 8.868    | 8.781    | 1.001 / 1.000    | over             | p2c-10 (24)                                    |
| p2c-13-opaque                         | @winglet/style-utils             | repaired  | 9.66 µs   | 14.682   | 14.493   | 1.000 / 1.000    | over             | p2c-10 (24)                                    |
| p2c-14-media                          | @winglet/style-utils             | repaired  | 25.71 µs  | 5.175    | 5.111    | 0.999 / 1.002    | over             | p2c-14 (24)                                    |
| p2c-15-escapes                        | @winglet/style-utils             | repaired  | 8.98 µs   | 8.959    | 8.934    | 0.999 / 0.999    | over             | p2c-14 (24)                                    |
| p2c-16-pseudo                         | @winglet/style-utils             | repaired  | 9.59 µs   | 11.434   | 9.311    | 0.997 / 1.007    | over             | p2c-14 (24)                                    |
| p2c-17-mixed                          | @winglet/style-utils             | repaired  | 634.42 µs | 3.394    | 3.462    | 0.998 / 1.001    | over             | p2c-14 (24)                                    |
| p2c-18-installer-new                  | @slats/agents-assets-sync        | plain     | 3.16 ms   | 2.030    | 1.938    | 1.017 / 0.999    | over             | p2c-18-installer-new-rerun (24)                |
| p2c-19-installer-unchanged            | @slats/agents-assets-sync        | plain     | 2.05 ms   | 2.222    | 2.183    | 1.009 / 1.003    | over             | p2c-18 (24)                                    |
| p2c-20-installer-force                | @slats/agents-assets-sync        | repaired  | 2.18 ms   | 2.640    | 2.626    | 0.994 / 0.993    | over             | p2c-20-installer-force-rerun (24)              |
| p2c-21-isEmpty-foreign-map            | @winglet/common-utils            | plain     | 5.52 ms   | 1.002    | 0.999    | 0.998 / 1.000    | pass             | p2c-18 (24)                                    |
| p2c-22-schema-known-noncanonical      | @winglet/json-schema             | plain     | 4.30 µs   | 32.820   | 32.809   | 0.987 / 0.991    | over             | json-schema-before (24)                        |
| p2c-23-schema-first-embedded          | @winglet/json-schema             | repaired  | 1.09 µs   | 149.341  | 149.106  | 1.003 / 1.002    | over             | json-schema-before (24)                        |
| p2c-24-schema-key-collision           | @winglet/json-schema             | repaired  | 3.57 µs   | 1.673    | 1.634    | 1.018 / 1.005    | over             | p2c-22 (24)                                    |
| p2e-01-ab-reset-pending               | @canard/schema-form              | repaired  | 25.49 µs  | 0.999    | 1.000    | 1.000 / 0.999    | pass             | p2e-01-ab-reset-pending-rerun (24)             |
| p2e-02-virtual-merge-one              | @canard/schema-form              | repaired  | 15.82 µs  | 1.059    | 1.041    | 1.007 / 1.000    | over             | p2e-02-virtual-merge-one-rerun (24)            |
| p2e-03-ab-derive-disjoint             | @canard/schema-form              | plain     | 10.06 µs  | 1.021    | 1.033    | 0.991 / 0.997    | over             | p2e-03-ab-derive-disjoint-rerun (24)           |
| p2e-04-virtual-write                  | @canard/schema-form              | plain     | 4.87 µs   | 1.042    | 1.033    | 1.009 / 0.990    | pass (허용 1.10) | p2e-04-virtual-write-rerun (24)                |
| p2e-05-virtual-reset                  | @canard/schema-form              | repaired  | 4.57 µs   | 1.066    | 1.069    | 1.004 / 1.002    | pass (허용 1.10) | p2e-05-virtual-reset-rerun (24)                |
| p2e-06-virtual-absent-undefined       | @canard/schema-form              | repaired  | 17.40 µs  | 1.016    | 1.035    | 1.000 / 0.996    | over             | p2e-06-virtual-absent-undefined-rerun (24)     |
| p2e-07-mount-100                      | @canard/schema-form              | plain     | 7.47 ms   | 0.959    | 1.001    | 1.010 / 0.998    | pass             | p2e-07-mount-100-rerun (24)                    |
| p2e-08-aliased-mount                  | @canard/schema-form              | repaired  | 89.07 µs  | 1.166    | 1.226    | 0.986 / 1.006    | over             | p2e-05 (12)                                    |
| p2e-09-reset-refused-sequential-8     | @canard/schema-form              | plain     | 116.63 µs | 1.027    | 1.007    | 1.014 / 1.004    | pass             | p2e-09-reset-refused-sequential-8-rerun (24)   |
| p2e-10-plain-merge-shallow            | @canard/schema-form              | plain     | 3.79 µs   | 0.996    | 0.986    | 0.997 / 0.998    | pass             | p2e-10-plain-merge-shallow-rerun (24)          |
| p2e-11-whole-array-client-write       | @canard/schema-form              | repaired  | 30.87 µs  | 1.397    | 1.410    | 1.002 / 1.001    | over             | p2e-09 (12)                                    |
| p2e-12-whole-array-client-own-write   | @canard/schema-form              | plain     | 32.26 µs  | 1.113    | 1.095    | 1.018 / 1.000    | over             | p2e-12-whole-array-client-own-write-rerun (24) |
| p2e-13-whole-array-client-mixed-batch | @canard/schema-form              | repaired  | 36.81 µs  | 1.347    | 1.360    | 0.993 / 0.999    | over             | p2e-13 (12)                                    |
| p2e-14-whole-array-client-composition | @canard/schema-form              | repaired  | 72.61 µs  | 1.453    | 1.466    | 0.991 / 1.003    | over             | p2e-13 (12)                                    |
| p2e-15-batch-structural               | @canard/schema-form              | repaired  | 10.30 µs  | 1.831    | 1.857    | 1.015 / 1.016    | over             | p2e-13 (12)                                    |
| p2e-16-virtual-getters                | @canard/schema-form              | repaired  | 4.26 ms   | 1.348    | 1.321    | 1.012 / 0.998    | over             | p2e-13 (12)                                    |
| p2e-17-virtual-getter-divergence      | @canard/schema-form              | repaired  | 4.21 ms   | 2.436    | 2.430    | 1.001 / 1.008    | over             | p2e-17 (12)                                    |
| p2e-18-virtual-getter-inactive        | @canard/schema-form              | repaired  | 2.99 ms   | 3.344    | 3.503    | 0.998 / 0.994    | over             | p2e-17 (12)                                    |
