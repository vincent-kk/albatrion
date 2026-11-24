A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2u-05-antd5-uriMount | @canard/schema-form-antd5-plugin | uri mount | one-colon scheme address | repaired | 0.994 | 1.001 | 0.994 / 0.999 | pass |
| p2u-06-antd5-multiEnumMount | @canard/schema-form-antd5-plugin | multi enum mount | two options and an unknown object | repaired | 1.045 | 1.040 | 0.999 / 1.003 | over |
| p2u-07-antd5-coreOwnArray | @canard/schema-form-antd5-plugin | own array write | uncontrolled whole-array input, same-length edit | plain | 1.094 | 1.091 | 0.997 / 0.977 | void |
| p2u-08-antd5-timeRangeMount | @canard/schema-form-antd5-plugin | time range mount | lower-case Z start time | repaired | 0.999 | 0.992 | 0.997 / 1.003 | pass |
