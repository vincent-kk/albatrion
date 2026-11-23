A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-06-checkboxChange | @canard/schema-form-mui-plugin | checkbox change | two options and unknown initial value | repaired | 0.949 | 0.957 | 0.988 / 1.011 | pass |
| p2c-07-branchError | @canard/schema-form-mui-plugin | branch error validation | array minItems error | repaired | 1.401 | 1.402 | 0.992 / 0.999 | over |
| p2c-08-context-error-cause | @canard/schema-form | context Error cause update | same-message errors with distinct non-enumerable causes | repaired | 5.999 | 6.109 | 0.990 / 0.999 | over |
| p2c-09-mount-100 | @canard/schema-form | Form SSR | 100 string fields and default values | plain | 1.009 | 0.974 | 0.944 / 0.998 | void |
