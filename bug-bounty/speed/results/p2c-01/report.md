A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-01-checkboxChange | @canard/schema-form-antd5-plugin | checkbox change | two options and unknown initial value | repaired | 0.761 | 0.743 | 0.998 / 1.009 | pass |
| p2c-02-branchError | @canard/schema-form-antd5-plugin | branch error validation | array minItems error | repaired | 1.997 | 1.992 | 0.998 / 1.001 | over |
| p2c-03-coreExternalArray | @canard/schema-form-antd5-plugin | external array child write | three options and a one-item array | repaired | 7.727 | 7.210 | 1.020 / 0.997 | void |
| p2c-04-multiEnumMount | @canard/schema-form-antd6-plugin | multi enum mount | two options and an unknown object | repaired | 1.043 | 1.057 | 1.003 / 1.005 | over |
