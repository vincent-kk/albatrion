A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-01-checkboxChange | @canard/schema-form-antd5-plugin | checkbox change | two options and unknown initial value | repaired | 0.768 | 0.753 | 0.983 / 0.996 | pass |
| p2c-02-branchError | @canard/schema-form-antd5-plugin | branch error validation | array minItems error | repaired | 1.977 | 1.903 | 1.000 / 0.996 | over |
| p2c-03-coreExternalArray | @canard/schema-form-antd5-plugin | external array child write | three options and a one-item array | repaired | 7.697 | 7.683 | 0.998 / 1.000 | over |
| p2c-04-multiEnumMount | @canard/schema-form-antd6-plugin | multi enum mount | two options and an unknown object | repaired | 1.038 | 1.030 | 1.002 / 0.999 | over |
| p2c-06-checkboxChange | @canard/schema-form-mui-plugin | checkbox change | two options and unknown initial value | repaired | 1.014 | 1.008 | 0.988 / 0.999 | pass |
| p2c-07-branchError | @canard/schema-form-mui-plugin | branch error validation | array minItems error | repaired | 1.440 | 1.447 | 0.990 / 0.998 | over |
