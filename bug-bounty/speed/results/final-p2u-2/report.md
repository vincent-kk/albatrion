A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2u-07-antd5-coreOwnArray | @canard/schema-form-antd5-plugin | own array write | uncontrolled whole-array input, same-length edit | plain | 1.069 | 1.097 | 1.011 / 1.004 | over |
| p2u-08-antd5-timeRangeMount | @canard/schema-form-antd5-plugin | time range mount | lower-case Z start time | repaired | 0.987 | 0.990 | 1.002 / 1.003 | pass |
| p2u-09-antd5-timeRangePanelPlain | @canard/schema-form-antd5-plugin | time range panel | unbounded time range, start input opened | repaired | 1.000 | 0.989 | 1.000 / 0.999 | pass |
| p2u-10-antd6-sliderMount | @canard/schema-form-antd6-plugin | slider mount | integer slider with one thumb | repaired | 1.000 | 0.996 | 1.001 / 0.999 | pass |
| p2u-11-antd6-uriMount | @canard/schema-form-antd6-plugin | uri mount | one-colon scheme address | repaired | 1.027 | 1.034 | 1.000 / 1.000 | over |
| p2u-12-antd6-checkboxChange | @canard/schema-form-antd6-plugin | checkbox change | two options and unknown initial value | repaired | 0.714 | 0.704 | 1.008 / 1.009 | pass |
