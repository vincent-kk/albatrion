A 1c77ced57dcb325d5ebb24d6c884bda0904e0388+antd-mobile-5.43.0 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-05-sliderChange | @canard/schema-form-antd-mobile-plugin | slider change | integer slider, track click at 70% | plain | 1.094 | 1.090 | 1.008 / 1.001 | over |
| p2u-16-am-sliderMount | @canard/schema-form-antd-mobile-plugin | slider mount | integer slider with one thumb | repaired | 0.968 | 0.989 | 0.994 / 1.002 | pass |
| p2u-17-am-radioMount | @canard/schema-form-antd-mobile-plugin | radio mount | two-option radio group | repaired | 0.987 | 0.988 | 1.005 / 1.003 | pass |
| p2u-18-am-rangeSliderChange | @canard/schema-form-antd-mobile-plugin | range slider change | two-thumb slider, track click at 70% | repaired | 1.162 | 1.174 | 1.007 / 1.007 | over |
| p2u-19-am-checkboxChange | @canard/schema-form-antd-mobile-plugin | checkbox change | two options and unknown initial value | repaired | 1.017 | 1.059 | 1.001 / 0.998 | over |
| p2u-20-am-branchError | @canard/schema-form-antd-mobile-plugin | branch error validation | array minItems error | repaired | 1.567 | 1.569 | 1.002 / 1.001 | over |
