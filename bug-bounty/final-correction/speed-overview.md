# Consolidated speed overview: current product vs beta `1c77ced57`

Ratio = current / beta at p10 (min in parentheses where the report gives it). Values above the accepted value are not within. Sources are the latest tables of each report.

## A. Summary per stream and package

| stream | package | rows | within | fix cost | cut | undetermined | worst row (p10 ratio) |
|---|---|---:|---:|---:|---:|---:|---|
| AJV | ajv6 | 22 | 22 | 0 | 0 | 0 | default/boundFirstIdResourceInvalid (1.226) |
| AJV | ajv7 | 16 | 12 | 4 | 0 | 0 | default/r5/factory/fresh (1.231) |
| AJV | ajv8 | 47 | 46 | 1 | 0 | 0 | default/r5/factory/fresh (1.259) |
| UI | antd5 | 13 | 0 | 0 | 4 | 9 | branchError (4.126) |
| UI | antd6 | 7 | 0 | 0 | 1 | 6 | multiEnumMount (1.242) |
| UI | antd-mobile | 7 | 1 | 0 | 1 | 5 | sliderChange (1.037) |
| UI | mui | 8 | 0 | 0 | 3 | 5 | checkboxChange (1.161) |
| Core | schema-form core | 28 | 17 | 3 | 8 | 0 | anchor-slider6-gate (4.084) |
| Engine | schema-form engine | 27 | 0 | 8 | 19 | 0 | virtual-getter-inactive (4.347) |
| Utils | style-utils | 12 | 2 | 0 | 10 | 0 | escapes (4.898) |
| Utils | agents-assets-sync | 4 | 1 | 0 | 3 | 0 | installer-new (1.818) |
| Utils | common-utils | 10 | 4 | 0 | 6 | 0 | isEmpty-foreign-map (4.185) |
| Utils | json | 6 | 1 | 1 | 4 | 0 | getValue-fragment (4.036) |
| Utils | common-utils (cloneLite; assumed) | 2 | 1 | 0 | 1 | 0 | cloneLite-deep (1.103) |
| Utils | json-schema | 7 | 2 | 1 | 4 | 0 | schema-first-miss (5.349) |
| Utils | react-utils | 3 | 0 | 0 | 3 | 0 | rest-changed (4.211) |

Notes on summary:
- AJV: the 80 "within" rows include the AJV 6 `boundFirstIdResourceInvalid` row, which is within its approved ceiling 1.46 (fix cost I05). Five rows are fix cost I24/I29 (above 1.03 but accepted as needed cost). No AJV row is cut or undetermined.
- UI: 35 rows = 1 within, 9 cut, 25 undetermined (invalid A/A control); no row meets all three conditions of rule 0(c) for fix cost. Part 3 of the UI report (C15 re-judgement) was not read.
- Core: the report has no single complete table. Rows = Part 2 rows plus the final-commit within rows plus the sentence-listed within rows; engine-owned rows handed off are in the Engine stream.
- Engine: NO report exists under /tmp/final-engine/. The engine report is /tmp/final-core-engine/impl-report.md (section "Speed rows above the accepted value"). It is a chronological log, not a final table: the Engine rows here are the last log row per row name that compares against beta (diagnostic and factor comparisons excluded). Rows listed there are only those that were above the accepted value at that time; later passes stated in prose (for example virtual-write 1.0148/1.0113, virtual-reset, ab-derive-disjoint 1.0101, aliased-mount C13 A) may supersede them, so treat Engine class values as upper bounds, not final.
- Utils: 44 rows from the final table; package of getValue and cloneLite rows is inferred from the measurement series, not stated.

## B. Full row table

| stream | package | row | input kind | beta p10 | ratio to beta p10 (min) | accepted value | class | finding | reason |
|---|---|---|---|---|---|---|---|---|---|
| AJV | ajv6 | default/rootCompile | unknown | 21.492 µs | 0.875 (min 0.882) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/rootIdCompile | unknown | 29.734 µs | 0.888 (min 0.899) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/bindCompile | unknown | 21.766 µs | 0.883 (min 0.884) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/factoryCompile | unknown | 19.828 µs | 0.966 (min 0.966) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/factoryCached | unknown | 18.665 µs | 0.116 (min 0.117) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/localRefCompile | unknown | 28.672 µs | 0.883 (min 0.906) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/guardCompile | unknown | 87.353 µs | 0.869 (min 0.879) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/guardContextCompile | unknown | 153.225 µs | 0.886 (min 0.901) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/guardValidate | unknown | 0.000 µs | 0.987 (min 1) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/unnamedGood | unknown | 0.117 µs | 0.728 (min 0.723) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/unnamedBad | unknown | 0.732 µs | 0.871 (min 0.872) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/namedGood | unknown | 0.113 µs | 0.359 (min 0.359) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/namedBad | unknown | 0.208 µs | 0.435 (min 0.434) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/namedNot | unknown | 0.328 µs | 0.767 (min 0.773) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/firstNot | unknown | 0.680 µs | 0.643 (min 0.662) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/defaultFirstIdInvalid | unknown | 0.403 µs | 0.873 (min 0.882) | 1.260 | within | — | within accepted value |
| AJV | ajv6 | default/boundFirstIdResourceInvalid | repaired | 0.758 µs | 1.226 (min 1.26) | 1.460 | within | I05 | approved ceiling 1.46 met; local resource and not.required key both used (I05) |
| AJV | ajv6 | default/r5/plain/cached | unknown | 27.891 µs | 0.884 (min 0.891) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/r5/plain/fresh | unknown | 52.078 µs | 0.93 (min 0.914) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/r5/factory/cached | unknown | 26.266 µs | 0.94 (min 0.942) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/r5/factory/fresh | unknown | 50.047 µs | 0.965 (min 0.967) | 1.030 | within | — | within accepted value |
| AJV | ajv6 | default/r5/local/fresh | unknown | 62.484 µs | 0.91 (min 0.917) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/rootCompile | unknown | 79.344 µs | 0.991 (min 0.983) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/rootIdCompile | repaired | 85.406 µs | 1.025 (min 1.064) | 1.030 | fix cost | I24/I29 | needed cost of private app-scope isolation (I24/I29); evidence from scope-only control |
| AJV | ajv7 | default/bindCompile | repaired | 76.172 µs | 1.048 (min 1.047) | 1.030 | fix cost | I24/I29 | needed cost of private app-scope isolation (I24/I29); evidence from scope-only control |
| AJV | ajv7 | default/factoryCompile | repaired | 74.578 µs | 1.082 (min 1.098) | 1.030 | fix cost | I24/I29 | needed cost of private app-scope isolation (I24/I29); evidence from scope-only control |
| AJV | ajv7 | default/factoryCached | unknown | 70.524 µs | 0.033 (min 0.033) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/localRefCompile | unknown | 82.703 µs | 0.991 (min 0.972) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/guardCompile | unknown | 101.375 µs | 0.786 (min 0.793) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/guardContextCompile | unknown | 202.475 µs | 0.862 (min 0.861) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/guardValidate | unknown | 0.005 µs | 0.993 (min 1) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/unnamedGood | unknown | 0.117 µs | 0.369 (min 0.371) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/unnamedBad | unknown | 0.177 µs | 0.515 (min 0.507) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/namedGood | unknown | 0.120 µs | 0.365 (min 0.366) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/namedBad | unknown | 0.177 µs | 0.515 (min 0.502) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/namedNot | unknown | 0.336 µs | 0.745 (min 0.745) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/firstNot | unknown | 34.333 µs | 0.044 (min 0.043) | 1.030 | within | — | within accepted value |
| AJV | ajv7 | default/r5/factory/fresh | repaired | 108.500 µs | 1.231 (min 1.238) | 1.030 | fix cost | I24/I29 | needed cost of private app-scope isolation (I24/I29); evidence from scope-only control |
| AJV | ajv8 | default/rootCompile | unknown | 77.747 µs | 0.99 (min 0.989) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/rootIdCompile | unknown | 94.016 µs | 0.897 (min 0.941) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/bindCompile | unknown | 90.750 µs | 1.005 (min 0.984) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/factoryCompile | unknown | 83.328 µs | 0.988 (min 0.997) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/factoryCached | unknown | 65.268 µs | 0.037 (min 0.037) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/localRefCompile | unknown | 82.703 µs | 0.995 (min 1.011) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/guardCompile | unknown | 106.971 µs | 0.779 (min 0.805) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/guardContextCompile | unknown | 218.250 µs | 0.779 (min 0.756) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/guardValidate | unknown | 0.000 µs | 0.987 (min 1.007) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/unnamedGood | unknown | 0.093 µs | 1 (min 1.009) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/unnamedBad | unknown | 3.757 µs | 0.986 (min 0.991) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/namedGood | unknown | 0.094 µs | 1.014 (min 1.013) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/namedBad | unknown | 3.732 µs | 0.994 (min 0.999) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/namedNot | unknown | 3.942 µs | 1.008 (min 1.012) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/firstNot | unknown | 41.604 µs | 0.188 (min 0.187) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | default/r5/factory/fresh | repaired | 113.813 µs | 1.259 (min 1.272) | 1.030 | fix cost | I24/I29 | needed cost of private app-scope isolation (I24/I29); evidence from scope-only control |
| AJV | ajv8 | default/r5/local/fresh | unknown | 156.047 µs | 0.986 (min 0.982) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/rootCompile | unknown | 112.693 µs | 1.006 (min 1.027) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/rootIdCompile | unknown | 132.266 µs | 0.974 (min 0.985) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/bindCompile | unknown | 117.250 µs | 0.989 (min 1.005) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/factoryCompile | unknown | 116.578 µs | 0.992 (min 0.997) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/factoryCached | unknown | 94.179 µs | 0.03 (min 0.034) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/localRefCompile | unknown | 121.984 µs | 1 (min 0.997) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/guardCompile | unknown | 151.471 µs | 0.802 (min 0.787) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/guardContextCompile | unknown | 266.275 µs | 0.794 (min 0.777) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/guardValidate | unknown | 0.000 µs | 0.957 (min 0.974) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/unnamedGood | unknown | 0.100 µs | 0.996 (min 0.992) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/unnamedBad | unknown | 4.165 µs | 1 (min 0.999) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/namedGood | unknown | 0.095 µs | 0.986 (min 0.985) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/namedBad | unknown | 4.043 µs | 0.998 (min 0.997) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/namedNot | unknown | 4.275 µs | 1.002 (min 1.003) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2019/firstNot | unknown | 43.771 µs | 0.185 (min 0.183) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/rootCompile | unknown | 115.533 µs | 1.007 (min 1.002) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/rootIdCompile | unknown | 127.656 µs | 1.016 (min 1.02) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/bindCompile | unknown | 127.516 µs | 1 (min 0.997) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/factoryCompile | unknown | 122.141 µs | 0.997 (min 0.99) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/factoryCached | unknown | 94.947 µs | 0.031 (min 0.033) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/localRefCompile | unknown | 133.281 µs | 0.997 (min 0.988) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/guardCompile | unknown | 156.824 µs | 0.817 (min 0.828) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/guardContextCompile | unknown | 273.750 µs | 0.793 (min 0.769) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/guardValidate | unknown | 0.000 µs | 0.987 (min 0.993) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/unnamedGood | unknown | 0.095 µs | 0.983 (min 0.984) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/unnamedBad | unknown | 4.115 µs | 0.999 (min 1.003) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/namedGood | unknown | 0.095 µs | 0.998 (min 0.994) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/namedBad | unknown | 4.312 µs | 0.987 (min 0.999) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/namedNot | unknown | 4.033 µs | 1.014 (min 1.017) | 1.030 | within | — | within accepted value |
| AJV | ajv8 | 2020/firstNot | unknown | 44.354 µs | 0.187 (min 0.185) | 1.030 | within | — | within accepted value |
| UI | antd5 | checkboxChange | repaired | 2182.5 µs | 1.161 (min 1.257) | 1.030 | cut | — | Checkbox.Group change with enum token read and external stored-value preservation; current core + beta UI control 0.976 (p10) |
| UI | antd5 | branchError | repaired | 17799 µs | 4.126 (min 4.891) | 1.030 | cut | T22 | FieldRenderer array/branch and bound ErrorMessage render; beta controls ~5x apart (fixed-order artifact), cannot attribute |
| UI | antd5 | checkboxChangePlain | plain | 2440 µs | 1.132 (min 1.152) | 1.030 | cut | — | plain input, so fix-cost condition not met; same core with beta UI is 0.931 |
| UI | antd5 | timeRangePanel | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.060/1.083 outside control range |
| UI | antd5 | coreFormMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 3.240/3.242 outside control range |
| UI | antd5 | coreEqualArray | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.182/1.026 outside control range |
| UI | antd5 | sliderMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.985/1.038 outside control range |
| UI | antd5 | uriMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.044/1.008 outside control range |
| UI | antd5 | multiEnumMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.022/1.018 outside control range |
| UI | antd5 | coreExternalArray | repaired | 4849 µs | 1.189 (min 1.067) | 1.085 | cut | T37 | external array write with row update passes T37; removing only T37 work not isolated; core part 1.033 |
| UI | antd5 | coreOwnArray | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.996/0.968 outside control range |
| UI | antd5 | timeRangeMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.004/0.971 outside control range |
| UI | antd5 | timeRangePanelPlain | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.877/0.741 outside control range |
| UI | antd6 | sliderMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.047/0.979 outside control range |
| UI | antd6 | uriMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.978/1.012 outside control range |
| UI | antd6 | multiEnumMount | unknown | 11934.5 µs | 1.242 (min 1.033) | 1.030 | cut | — | multi Select options and out-of-list value display; same core with beta UI 1.024; excess not shown to be needed |
| UI | antd6 | checkboxChange | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.951/1.000 outside control range |
| UI | antd6 | branchError | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.951/0.989 outside control range |
| UI | antd6 | timeRangeMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.008/0.957 outside control range |
| UI | antd6 | timeRangePanel | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.997/0.972 outside control range |
| UI | antd-mobile | sliderMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.964/1.010 outside control range |
| UI | antd-mobile | rangeSliderMount | unknown | 2661 µs | 0.959 (min 0.996) | 1.030 | within | — | within accepted value |
| UI | antd-mobile | radioMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.924/0.991 outside control range |
| UI | antd-mobile | sliderChange | unknown | 1081.5 µs | 1.037 (min 0.994) | 1.030 | cut | — | scalar Slider change event and form store; same core with beta UI 1.038, so not attributable to the plugin change |
| UI | antd-mobile | rangeSliderChange | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.036/1.023 outside control range |
| UI | antd-mobile | checkboxChange | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.977/0.999 outside control range |
| UI | antd-mobile | branchError | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.973/0.994 outside control range |
| UI | mui | datePickerMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.961/0.989 outside control range |
| UI | mui | uriMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.051/0.997 outside control range |
| UI | mui | stringSwitchMount | plain | 3344.5 µs | 1.034 (min 1.061) | 1.030 | cut | — | plain mount; StringSwitch shows enum state and alias; typography-slot candidate had invalid A/A |
| UI | mui | datePickerPanel | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 1.001/1.037 outside control range |
| UI | mui | sliderMount | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.909/0.988 outside control range |
| UI | mui | sliderChange | unknown | — | — | — | undetermined | — | no valid beta comparison; A/A min/p10 0.949/0.999 outside control range |
| UI | mui | checkboxChange | repaired | 4520.5 µs | 1.161 (min 1.167) | 1.030 | cut | — | Checkbox.Group change; core+beta UI control 1.142 explains the min; plugin share of p10 is within value |
| UI | mui | branchError | repaired | 5529 µs | 1.052 (min 1.08) | 1.030 | cut | T22 | FieldRenderer array/branch and ErrorMessage render; omitting one error part gives 1.002 but the no-error A/A is invalid |
| Core | schema-form core | expr-return-regexp | repaired | 0.1266 µs | 1.224 (min 1.224) | 1.03 | fix cost | C14 | regexp-return scan; control replacing only the regexp end test measured 0.5523 |
| Core | schema-form core | anchor-ssr-initial-errors | repaired | 29.7798 µs | 1.117 (min 1.07) | 1.051 | fix cost | R2.6 | initial-error application; control without it 1.0055 |
| Core | schema-form core | validate-writeback | repaired | 1.6544 µs | 1.114 (min 1.117) | 1.03 | fix cost | R3.12 | needed publication of same-value validation; control without it 0.9736; write entry owned by engine |
| Core | schema-form core | context-error-cause | repaired | 0.1600 µs | 3.313 (min 3.313) | ~2.20 | cut | R5.P4 | Error slot handling costs ~0.30 us; residual 0.063 us remains even without slots |
| Core | schema-form core | context-update | plain | 0.3599 µs | 1.055 (min 1.061) | 1.03 | cut | — | plain value comparison traversal; Error slot not involved |
| Core | schema-form core | mount-plain | plain | 46.49 µs | 1.071 (min 1.086) | 1.03 | cut | — | 135-round valid remeasure; mount load is engine-owned; no candidate kept all earlier rows |
| Core | schema-form core | react-bridges | plain | 48.946 µs | 1.031 (min 1.014) | 1.03 | cut | — | p10 slightly over; plain SSR bridge wiring; FieldProxy candidates slowed other rows |
| Core | schema-form core | mount-100 | unknown | 1178.015 µs | 1.057 (min 1.073) | 1.03 | cut | — | no sharing/subscription/label-id candidate passed all earlier mount rows |
| Core | schema-form core | whole-array-client-write | repaired | 36.4303 µs | 1.335 (min 1.331) | 1.085 | cut | — | external whole-array write re-attaches uncontrolled inputs (UI defect fix); key-pinned control leaves 1.0981 |
| Core | schema-form core | whole-array-client-own-write | plain | 37.6877 µs | 1.071 (min 1.086) | 1.03 | cut | — | own write keeps original input (no re-attach); revision/subscription candidates slowed other rows |
| Core | schema-form core | anchor-slider6-gate | unknown | 1047.8125 µs | 4.084 (min 4.205) | 1.03 | cut | D1 | last core value (D1 pre-applied build vs integration); handed to UI owner; installed Ant Slider ref registration |
| Core | schema-form core | plain-scalar | plain | — | 1.01 (min 1.006) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | plain-same | plain | — | 1.02 (min 1.023) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | plain-whole-shallow | plain | — | 1.008 (min 0.9928) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | ab-batch-plain-2 | plain | — | 0.9768 (min 0.9677) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | ab-batch-plain-8 | plain | — | 0.9276 (min 0.9274) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | ab-batch-plain-32 | plain | — | 0.7885 (min 0.7784) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | d18-incremental-object | unknown | — | 0.9913 (min 0.9925) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | find-nodes-single | unknown | — | 0.9005 (min 0.8949) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | wildcard-5000 | unknown | — | 0.0988 (min 0.098) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | wildcard-20000 | unknown | — | 0.037 (min 0.0371) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | derive-write | unknown | — | 1.013 (min 1.014) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | ab-batch-tuple-2 | unknown | — | 1.002 (min 1.005) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | array-rekey | unknown | — | 0.994 (min 0.9818) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | virtual-reset | unknown | — | 0.9901 (min 0.9938) | 1.03 | within | — | final-commit table (1fa102094 / ba3b3cf37) vs beta; beta time not given |
| Core | schema-form core | plain Error | plain | — | 0.5655 (min 0.5813) | 1.03 | within | — | sentence listing rows within beta |
| Core | schema-form core | root reference | plain | — | 1.016 (min 1.012) | 1.03 | within | R3.15 | sentence listing rows within beta (root reference compile) |
| Core | schema-form core | expressions (plain literal, literal with path, plain division, relative path, derived substitution, derived compile) | plain | — | — | each accepted value | within | C14 | report says each passed its accepted value after C14; no ratios given |
| Engine | schema-form engine | ab-reset-pending | repaired | 23.4183 µs | 1.092 (min 1.102) | 1.12 | cut | — | latest above-value log row (impl-report.md:183), comparison: 2단계 vs beta 재측정; may be superseded by passes in prose |
| Engine | schema-form engine | virtual-merge-one | unknown | 15.4995 µs | 1.036 (min 1.033) | 1.03 | cut | — | latest above-value log row (impl-report.md:191), comparison: 1단계 vs beta 180라운드; may be superseded by passes in prose |
| Engine | schema-form engine | reset-refused-8 | repaired | 114.6218 µs | 1.224 (min 1.236) | 1.03 진단 | fix cost | — | latest above-value log row (impl-report.md:185), comparison: 2단계 vs beta 재측정; may be superseded by passes in prose |
| Engine | schema-form engine | overlap-array-32-4 | repaired | 94.2306 µs | 1.179 (min 1.172) | 역사 비교 1.0358/1.0339 | fix cost | — | latest above-value log row (impl-report.md:179), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | ab-derive-overlap | repaired | 15.4208 µs | 1.204 (min 1.212) | 약 1.21 | fix cost | — | latest above-value log row (impl-report.md:252), comparison: 1단계 재대조 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | ab-derive-disjoint | unknown | 9.4261 µs | 1.039 (min 1.034) | 1.03 | cut | — | latest above-value log row (impl-report.md:255), comparison: 2단계 재대조 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | virtual-write | unknown | 4.2738 µs | 1.029 (min 1.051) | 1.03 | cut | — | latest above-value log row (impl-report.md:250), comparison: 2단계 240회 재대조 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | virtual-reset | unknown | 5.0179 µs | 1.033 (min 1.041) | 1.03 | cut | — | latest above-value log row (impl-report.md:251), comparison: 1단계 재대조 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | virtual-absent-undefined | unknown | 16.7255 µs | 1.04 (min 1.037) | 1.03 | cut | — | latest above-value log row (impl-report.md:184), comparison: 2단계 vs beta 재측정; may be superseded by passes in prose |
| Engine | schema-form engine | mount-plain | plain | 48.1900 µs | 1.048 (min 1.051) | 1.03 | cut | — | latest above-value log row (impl-report.md:248), comparison: 계산 준비 후보 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | mount-100 | unknown | 1176.4300 µs | 1.034 (min 1.035) | 1.03 | cut | — | latest above-value log row (impl-report.md:253), comparison: 2단계 재대조 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | aliased-mount | unknown | 89.5644 µs | 1.114 (min 1.113) | 1.134 | cut | — | latest above-value log row (impl-report.md:254), comparison: 2단계 재대조 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | reset-refused-sequential-8 | repaired | 116.7809 µs | 1.007 (min 1.036) | 1.03 | cut | — | latest above-value log row (impl-report.md:256), comparison: 82c15d746 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | plain-merge-shallow | plain | 3.3653 µs | 1.014 (min 1.041) | 1.03 | cut | — | latest above-value log row (impl-report.md:206), comparison: 2단계 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | whole-array-client-write | repaired | 36.7906 µs | 1.35 (min 1.328) | P05 역사 입력 1.085 | cut | — | latest above-value log row (impl-report.md:208), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | whole-array-client-own-write | repaired | 39.0346 µs | 1.044 (min 1.086) | 1.03 | cut | — | latest above-value log row (impl-report.md:209), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | whole-array-client-mixed-batch | repaired | 44.5514 µs | 1.301 (min 1.279) | 1.03 진단 | cut | — | latest above-value log row (impl-report.md:210), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | whole-array-client-composition | repaired | 84.0700 µs | 1.433 (min 1.411) | 1.03 진단 | cut | — | latest above-value log row (impl-report.md:211), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | batch-structural | unknown | 11.5490 µs | 1.772 (min 1.798) | P08 역사 입력 1.738 | cut | — | latest above-value log row (impl-report.md:212), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | virtual-getters | repaired | 0.0559 µs | 2.16 (min 2.149) | 역사 합산 범위 1.90–2.10 | cut | — | latest above-value log row (impl-report.md:213), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | virtual-getter-divergence | repaired | 0.0198 µs | 3.254 (min 3.251) | 1.03 진단 | cut | — | latest above-value log row (impl-report.md:214), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | virtual-getter-inactive | repaired | 0.0010 µs | 4.347 (min 4.323) | 1.03 진단 | cut | — | latest above-value log row (impl-report.md:215), comparison: 252110dda vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | validate-writeback | repaired | 1.6400 µs | 1.064 (min 1.055) | 1.03 | fix cost | — | latest above-value log row (impl-report.md:234), comparison: 82c15d746 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | r2-client-array-external | repaired | 161.2710 µs | 1.082 (min 1.061) | 1.085 | fix cost | — | latest above-value log row (impl-report.md:238), comparison: 82c15d746 vs beta, production 엔진과 React act; may be superseded by passes in prose |
| Engine | schema-form engine | r3-batch-array | repaired | 4.8113 µs | 1.907 (min 1.903) | 1.738 | fix cost | — | latest above-value log row (impl-report.md:241), comparison: 82c15d746 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | validate-writeback-errors | repaired | 1.6136 µs | 1.483 (min 1.495) | 1.03 | fix cost | — | latest above-value log row (impl-report.md:235), comparison: 82c15d746 vs beta; may be superseded by passes in prose |
| Engine | schema-form engine | r2-async-relay-content | repaired | 0.03910 µs | 1.478 (min 1.474) | 1.468 | fix cost | — | latest above-value log row (impl-report.md:245), comparison: a80fa7e7e와 동일한 중계 후보 vs beta; may be superseded by passes in prose |
| Utils | style-utils | flat | unknown | 69.03 ns | 0.797 (min 0.791) | 1.03 | within | — | within accepted value |
| Utils | style-utils | flat-combinator | plain | 88.69 ns | 1.501 (min 1.494) | 1.03 | cut | — | (Korean source) cut · 단순 규칙 대조. 규칙별 sticky 판독은 섞인 규칙에서 중복 작업을 늘렸습니다. |
| Utils | style-utils | plain-multiple | plain | 13.611 µs | 1.207 (min 1.207) | 1.03 | cut | — | (Korean source) cut · 수리 호출 0회. 구성 요소 절감과 규칙 입구를 비교했습니다. |
| Utils | style-utils | lists | unknown | 13.646 µs | 2.87 (min 2.875) | 1.03 / R1 2.849 | cut | R1-1+2 | (Korean source) cut · R1-1+2 제거 뒤 p10 1.1887. 목록 위치와 출력 비용을 분리했습니다. |
| Utils | style-utils | opaque | unknown | 13.611 µs | 4.709 (min 4.706) | 1.03 / R1 4.567·R4 1.246 | cut | R1-1+2 | (Korean source) cut · R1-1+2 제거 뒤 6.0462. 잘못 분리된 400개 항목이 추가됩니다. |
| Utils | style-utils | media | unknown | 34.764 µs | 2.029 (min 2.023) | 1.03 / R1 1.275 | cut | R1-1+2 | (Korean source) cut · R1-1+2 하위 스코핑 제거 뒤 1.4333. 그룹 외 경계 판독이 남습니다. |
| Utils | style-utils | escapes | unknown | 22.389 µs | 4.898 (min 4.893) | 1.03 / R3 1.0555·R4 1.092 | cut | R3-1+6 | (Korean source) cut · R3-1+6 제거 뒤 4.0357. 다른 공유 구문 작업이 남습니다. |
| Utils | style-utils | pseudo | unknown | 14.965 µs | 4.759 (min 4.755) | 1.03 / R3 1.030·R4 1.149 | cut | R1 | (Korean source) cut · R1 목록 제거 뒤 2.5604. R3 전역 철자는 별도 실제 수리 입력으로 검증했습니다. |
| Utils | style-utils | mixed | unknown | 336.786 µs | 4.411 (min 4.4) | 1.03 / R1 1.080 | cut | R1 | (Korean source) cut · R1 목록만 제거한 p10 3.8679. CSS 준비와 복합 스코핑 비용이 남습니다. |
| Utils | style-utils | document-fresh-add | plain | 91.89 ns | 1.508 (min 1.502) | 1.03 | cut | — | (Korean source) cut · 일반 문서로 수리 호출 0회. 준비 판정 전달은 mixed를 늦췄습니다. |
| Utils | style-utils | inject-add | plain | 116.06 ns | 1.442 (min 1.438) | 1.03 | cut | — | (Korean source) cut · 일반 추가로 수리 호출 0회. 분리 후보는 베타 0.8976이나 mixed는 직전 1.0210입니다. |
| Utils | style-utils | shadow-add | unknown | 631.03 ns | 0.1049 (min 0.106) | 1.03 / R5 1.01–1.07 | within | R5 | within accepted value |
| Utils | agents-assets-sync | installer-new | unknown | 8.340 ms | 1.818 (min 1.798) | 1.03 | cut | — | (Korean source) cut · 원본 읽기 풀을 적용했습니다. 파일 원자 쓰기 제거 뒤 1.3452입니다. |
| Utils | agents-assets-sync | installer-unchanged | unknown | 9.663 ms | 1.136 (min 1.132) | 1.03 | cut | — | (Korean source) cut · 기록 읽기·준비 구간을 재고 부모 검사·병렬 계획을 비교했습니다. |
| Utils | agents-assets-sync | installer-force | unknown | 9.871 ms | 1.601 (min 1.632) | 1.03 / R1 1.053 | cut | R1 | (Korean source) cut · 원본 읽기 풀을 적용했습니다. 파일 원자 쓰기 제거 뒤 1.0812입니다. |
| Utils | agents-assets-sync | installer-codex-unchanged | unknown | 4.971 ms | 0.8845 (min 0.8636) | 1.03 | within | — | within accepted value |
| Utils | common-utils | isEmpty-general | plain | 9.58 ns | 1.709 (min 1.697) | 1.03 | cut | — | (Korean source) cut · 일반 혼합에 태그 제거 비용 귀속 0. 원시값 후보는 혼합과 로컬 Map을 늦췄습니다. |
| Utils | common-utils | isEmpty-foreign-map | repaired | 7.45 ns | 4.185 (min 4.173) | 1.03 | cut | R2-7 | (Korean source) cut · R2-7 외부 태그·native size를 제거하면 오답과 1.2102가 남습니다. |
| Utils | common-utils | isEmpty-local-map | plain | 4.34 ns | 1.049 (min 1.055) | 1.03 | cut | — | (Korean source) cut · 표준 컬렉션. 새 원시값 분기는 로컬 Map에서 직전 1.2727입니다. |
| Utils | common-utils | isEmpty-object | unknown | 12.25 ns | 0.7137 (min 0.7144) | 1.03 | within | — | within accepted value |
| Utils | json | getValue-object | unknown | 85.60 ns | 0.9009 (min 0.9009) | 1.03 | within | — | within accepted value |
| Utils | json | getValue-array | plain | 88.27 ns | 1.075 (min 1.077) | 1.03 | cut | C8 | (Korean source) cut · 유효 배열 입력. C8 자기 키만 제거하면 0.8196이며 숫자 파서는 불변 move에서 회귀했습니다. |
| Utils | json | getValue-tokens | plain | 55.80 ns | 1.527 (min 1.52) | 1.03 | cut | — | (Korean source) cut · 유효 토큰. 자기 키만 제거해도 1.2026이며 토큰 파서 후보는 직전의 다른 행을 늦췄습니다. |
| Utils | json | getValue-fragment-plain | plain | 97.17 ns | 1.063 (min 1.07) | 1.03 | cut | — | (Korean source) cut · 인코딩 없는 입력. percent 처리를 빼도 1.0407입니다. |
| Utils | json | getValue-fragment | repaired | 96.96 ns | 4.036 (min 3.964) | 1.03 | fix cost | R2-6+8 | (Korean source) fix cost · R2-6+8 native decode 1회. 제거하면 실제 값이 사라지고 0.8189입니다. |
| Utils | common-utils | equals-flat | unknown | 165.38 ns | 0.9259 (min 0.9247) | 1.03 | within | — | within accepted value |
| Utils | common-utils | equals-deep | plain | 20.496 µs | 1.718 (min 1.691) | 1.03 | cut | R4 | (Korean source) cut · 순환 없는 입력. R4 쌍 검사 제거판은 0.8940이며 새 쌍 후보는 평면에서 회귀했습니다. |
| Utils | common-utils | clone-builtins | plain | 4.281 µs | 1.119 (min 1.12) | 1.03 / R4 1.044 | cut | R4 | (Korean source) cut · 표준 인스턴스에서 R4 원형 검사 제거 뒤 1.0977. 일반 Map·Set 후보도 회귀했습니다. |
| Utils | common-utils | clone-object | unknown | 416.88 ns | 0.9332 (min 0.9372) | 1.03 | within | — | within accepted value |
| Utils | common-utils | clone-array | unknown | 439.25 ns | 0.9447 (min 0.958) | 1.03 | within | — | within accepted value |
| Utils | common-utils | clone-deep | plain | 71.272 µs | 1.076 (min 1.07) | 1.03 | cut | — | (Korean source) cut · 프레임 generator 재개 98→3회. 300단계 일반 입력과 12,000단계 회귀를 분리했습니다. |
| Utils | common-utils (cloneLite; assumed) | cloneLite-deep | plain | 42.405 µs | 1.103 (min 1.103) | 1.03 | cut | — | (Korean source) cut · leave closure 47개를 없앴습니다. 정상 입력의 잔여를 유지합니다. |
| Utils | common-utils (cloneLite; assumed) | cloneLite-flat | unknown | 183.75 ns | 0.9918 (min 0.9867) | 1.03 | within | — | within accepted value |
| Utils | json | patch-array-test-mutable | plain | 71.36 ns | 1.032 (min 1.031) | 1.03 / R1 1.031–1.051 | cut | R1 | (Korean source) cut · 일반 정수 한 번 비교. 파서 후보의 불변 move 회귀로 교체가 탈락했습니다. |
| Utils | json-schema | schema-known | unknown | 44.303 µs | 1.018 (min 1.024) | 1.03 | within | — | within accepted value |
| Utils | json-schema | schema-known-canonical | unknown | 42.070 µs | 1.023 (min 1.03) | 1.03 | within | — | within accepted value |
| Utils | json-schema | schema-known-noncanonical | unknown | 17.754 µs | 1.762 (min 1.79) | 1.03 / R1 1.220 | cut | R1 | (Korean source) cut · 정규 주소 직접 확인과 등록 대조를 줄였습니다. 다음 후보는 정규 조회에서 회귀했습니다. |
| Utils | json-schema | schema-alternate-lookup | repaired | 13.592 µs | 2.17 (min 2.183) | 1.03 / R1 36.4 | fix cost | R1-1 | (Korean source) fix cost · R1-1 주소 대조 21회와 등록 문서 색인 한 번. 제거 시 미해결, 베타 1.0057입니다. |
| Utils | json-schema | schema-first-miss | plain | 15.169 µs | 5.349 (min 5.352) | 1.03 / R1 49.4 | cut | R1 | (Korean source) cut · 빈 결과가 같은 일반 미스. 실제 내장 ID를 찾으려면 최초 등록 자원을 순회합니다. |
| Utils | json-schema | schema-first-embedded | repaired | 21.337 µs | 4.039 (min 4.059) | 1.03 | cut | R1 | (Korean source) cut · 실제 R1 내장 ID를 고쳤고 루트 포함 21개가 처음 색인됩니다. 제거 뒤 1.4466이 남습니다. |
| Utils | json-schema | schema-key-collision | unknown | 17.606 µs | 2.133 (min 2.121) | 1.03 / R1 1.196·0.980 | cut | R1-1 | (Korean source) cut · R1-1 충돌 거부가 필요합니다. 중복 등록 검사 축소 후보는 다른 조회 행에서 회귀했습니다. |
| Utils | react-utils | rest-stable | unknown | 627.55 ns | 2.279 (min 2.279) | 1.03 / R4 rest 1.25 | cut | R4 | (Korean source) cut · 열거 0회와 commit 등록 1회. R4 게시 제거 뒤 단독 p10 1.1568이 남습니다. |
| Utils | react-utils | rest-equal | plain | 286.76 ns | 1.987 (min 1.996) | 1.03 / R4 rest 1.25 | cut | R4 | (Korean source) cut · R4/R6의 문자열·심볼 판독. 정상 재렌더의 두 후보가 회귀했습니다. |
| Utils | react-utils | rest-changed | plain | 326.55 ns | 4.211 (min 4.228) | 1.03 / R4 rest 1.25 | cut | R4 | (Korean source) cut · 중단 없는 입력. 게시 timing의 필요성은 폐기 렌더와 따로 확인했습니다. |

## C. Plain-input rows above 1.03 (highest first)

| # | stream | package | row | p10 ratio (min) | accepted value | class |
|---:|---|---|---|---|---|---|
| 1 | Utils | json-schema | schema-first-miss | 5.349 (min 5.352) | 1.03 / R1 49.4 | cut |
| 2 | Utils | react-utils | rest-changed | 4.211 (min 4.228) | 1.03 / R4 rest 1.25 | cut |
| 3 | Utils | react-utils | rest-equal | 1.987 (min 1.996) | 1.03 / R4 rest 1.25 | cut |
| 4 | Utils | common-utils | equals-deep | 1.718 (min 1.691) | 1.03 | cut |
| 5 | Utils | common-utils | isEmpty-general | 1.709 (min 1.697) | 1.03 | cut |
| 6 | Utils | json | getValue-tokens | 1.527 (min 1.52) | 1.03 | cut |
| 7 | Utils | style-utils | document-fresh-add | 1.508 (min 1.502) | 1.03 | cut |
| 8 | Utils | style-utils | flat-combinator | 1.501 (min 1.494) | 1.03 | cut |
| 9 | Utils | style-utils | inject-add | 1.442 (min 1.438) | 1.03 | cut |
| 10 | Utils | style-utils | plain-multiple | 1.207 (min 1.207) | 1.03 | cut |
| 11 | UI | antd5 | checkboxChangePlain | 1.132 (min 1.152) | 1.030 | cut |
| 12 | Utils | common-utils | clone-builtins | 1.119 (min 1.12) | 1.03 / R4 1.044 | cut |
| 13 | Utils | common-utils (cloneLite; assumed) | cloneLite-deep | 1.103 (min 1.103) | 1.03 | cut |
| 14 | Utils | common-utils | clone-deep | 1.076 (min 1.07) | 1.03 | cut |
| 15 | Utils | json | getValue-array | 1.075 (min 1.077) | 1.03 | cut |
| 16 | Core | schema-form core | mount-plain | 1.071 (min 1.086) | 1.03 | cut |
| 17 | Core | schema-form core | whole-array-client-own-write | 1.071 (min 1.086) | 1.03 | cut |
| 18 | Utils | json | getValue-fragment-plain | 1.063 (min 1.07) | 1.03 | cut |
| 19 | Core | schema-form core | context-update | 1.055 (min 1.061) | 1.03 | cut |
| 20 | Utils | common-utils | isEmpty-local-map | 1.049 (min 1.055) | 1.03 | cut |
| 21 | Engine | schema-form engine | mount-plain | 1.048 (min 1.051) | 1.03 | cut |
| 22 | UI | mui | stringSwitchMount | 1.034 (min 1.061) | 1.030 | cut |
| 23 | Utils | json | patch-array-test-mutable | 1.032 (min 1.031) | 1.03 / R1 1.031–1.051 | cut |
| 24 | Core | schema-form core | react-bridges | 1.031 (min 1.014) | 1.03 | cut |

Caveat: "plain" is derived from the report wording; rows with unknown kind (for example mount-100, mobile sliderChange, many Engine rows) are excluded even if above 1.03.

## D. isEmpty history (source: /tmp/final-utils/report.md)

Ratios are current build / beta at min / p10. Integration and intermediate columns are from the Part 1 60-round table (report lines 284-304) except where noted; final is the Part 2 final table (line 1046-1049).

| row | beta p10 | integration branch / beta | intermediate build / beta | final / beta (Part 2) | slower than integration? |
|---|---:|---|---|---|---|
| isEmpty-general | 9.58 ns | 0.9949 / 0.9984 | 1.7090 / 1.7187 | 1.6968 / 1.7091 | yes: from ~1.0 to 1.71; unchanged since the intermediate build |
| isEmpty-foreign-map | 7.45 ns | 1.0000 / 0.9982 (integration reads the wrong size, R2 defect) | 4.1075 / 4.1162 | 4.1731 / 4.1846 | yes: from ~1.0 to 4.18; includes the R2-7 fix (removing external tag and native size leaves 1.2102 and a wrong answer) |
| isEmpty-local-map | 4.34 ns | not in the 60-round table; line 279 "previous/beta" 1.0702 / 1.0715 | 1.0601 / 1.0623 (line 279, "fix/beta") | 1.0549 / 1.0487 | no: about 1.05-1.07 throughout (previous-commit column is assumed to equal integration) |
| isEmpty-object | 12.25 ns | not in the 60-round table; line 278 "previous/beta" 0.9166 / 0.9211 | 0.9200 / 0.9230 | 0.7144 / 0.7137 | no: faster |

Conclusion: yes. For the general mixed input and the foreign-realm Map, isEmpty is slower than on the integration branch (integration was about equal to beta at 0.998; now 1.7091 and 4.1846). The slowdown appeared in the intermediate build and did not grow in Part 2. Plain objects are faster than beta (0.7137) and the local Map stays near 1.05 (above 1.03, cut). The report ties the foreign-Map part to the R2-7 correctness fix, but attributes zero of the general-mixed cost to the removed tag work and classifies all but object as cut.
