A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-07-mount-100 | @canard/schema-form | client mount | 100 string fields and unrelated default keys | plain | 1.025 | 1.023 | 1.005 / 1.000 | pass |
| p2e-08-aliased-mount | @canard/schema-form | aliased client mount | two references to a derived object | repaired | 1.151 | 1.150 | 1.010 / 1.003 | over |
| p2e-09-reset-refused-sequential-8 | @canard/schema-form | sequential refused reset | seven sibling writes and a detached box reset | plain | 1.007 | 1.002 | 0.998 / 0.992 | pass |
| p2e-10-plain-merge-shallow | @canard/schema-form | shallow merge | alternating two-key objects | plain | 0.997 | 0.996 | 0.997 / 0.996 | pass |
| p2e-11-whole-array-client-write | @canard/schema-form | whole array external write | uncontrolled two-item whole-array input | repaired | 1.330 | 1.335 | 0.999 / 0.997 | over |
| p2e-12-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled two-item whole-array input | plain | 1.039 | 1.043 | 1.000 / 1.002 | over |
