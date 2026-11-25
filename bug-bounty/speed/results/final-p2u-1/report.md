A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2u-01-antd5-timeRangePanel | @canard/schema-form-antd5-plugin | time range panel | bounded time range, start input opened | repaired | 0.967 | 0.965 | 0.996 / 1.001 | pass |
| p2u-02-antd5-coreFormMount | @canard/schema-form-antd5-plugin | core form mount | name and count leaves | plain | 1.020 | 1.002 | 1.012 / 0.996 | pass |
| p2u-03-antd5-coreEqualArray | @canard/schema-form-antd5-plugin | equal array write | two-item array written with equal content | plain | 0.955 | 0.967 | 1.004 / 1.001 | pass |
| p2u-04-antd5-sliderMount | @canard/schema-form-antd5-plugin | slider mount | integer slider with one thumb | repaired | 1.005 | 1.002 | 0.997 / 1.001 | pass |
| p2u-05-antd5-uriMount | @canard/schema-form-antd5-plugin | uri mount | one-colon scheme address | repaired | 1.001 | 0.996 | 1.000 / 0.999 | pass |
| p2u-06-antd5-multiEnumMount | @canard/schema-form-antd5-plugin | multi enum mount | two options and an unknown object | repaired | 1.039 | 1.044 | 0.999 / 1.001 | over |
