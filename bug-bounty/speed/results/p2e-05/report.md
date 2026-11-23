A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-05-virtual-reset | @canard/schema-form | virtual reset | two absent virtual members | repaired | 1.059 | 1.069 | 0.992 / 1.002 | over |
| p2e-06-virtual-absent-undefined | @canard/schema-form | virtual merge with absent member | object and explicit undefined inactive member | repaired | 1.034 | 1.050 | 0.998 / 1.001 | over |
| p2e-07-mount-100 | @canard/schema-form | client mount | 100 string fields and unrelated default keys | plain | 0.951 | 1.003 | 1.013 / 1.010 | pass |
| p2e-08-aliased-mount | @canard/schema-form | aliased client mount | two references to a derived object | repaired | 1.166 | 1.226 | 0.986 / 1.006 | over |
