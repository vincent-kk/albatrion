A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2u-09-antd5-timeRangePanelPlain | @canard/schema-form-antd5-plugin | time range panel | unbounded time range, start input opened | repaired | 0.981 | 0.989 | 0.994 / 0.999 | pass |
| p2u-10-antd6-sliderMount | @canard/schema-form-antd6-plugin | slider mount | integer slider with one thumb | repaired | 0.999 | 0.991 | 0.998 / 0.991 | pass |
| p2u-11-antd6-uriMount | @canard/schema-form-antd6-plugin | uri mount | one-colon scheme address | repaired | 1.037 | 1.033 | 1.004 / 1.001 | over |
| p2u-12-antd6-checkboxChange | @canard/schema-form-antd6-plugin | checkbox change | two options and unknown initial value | repaired | 0.710 | 0.697 | 1.011 / 1.008 | pass |
