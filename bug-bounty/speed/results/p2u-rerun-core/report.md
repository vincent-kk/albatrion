A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2u-07-antd5-coreOwnArray | @canard/schema-form-antd5-plugin | own array write | uncontrolled whole-array input, same-length edit | plain | 1.091 | 1.096 | 1.000 / 0.998 | over |
| p2u-13-antd6-branchError | @canard/schema-form-antd6-plugin | branch error validation | array minItems error | repaired | 2.363 | 2.128 | 0.985 / 1.049 | void |
| p2u-21-mui-datePickerMount | @canard/schema-form-mui-plugin | date picker mount | bounded date, picker closed | repaired | 1.039 | 1.016 | 1.004 / 0.974 | void |
| p2u-22-mui-uriMount | @canard/schema-form-mui-plugin | uri mount | one-colon scheme address | repaired | 1.021 | 1.007 | 1.011 / 0.982 | pass |
