A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-09-reset-refused-sequential-8 | @canard/schema-form | sequential refused reset | seven sibling writes and a detached box reset | plain | 1.012 | 0.969 | 1.016 / 0.990 | pass |
| p2e-10-plain-merge-shallow | @canard/schema-form | shallow merge | alternating two-key objects | plain | 0.980 | 0.976 | 0.991 / 0.994 | pass |
| p2e-11-whole-array-client-write | @canard/schema-form | whole array external write | uncontrolled two-item whole-array input | repaired | 1.397 | 1.410 | 1.002 / 1.001 | over |
| p2e-12-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled two-item whole-array input | plain | 1.097 | 1.095 | 1.000 / 1.006 | over |
