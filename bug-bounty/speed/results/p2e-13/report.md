A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-13-whole-array-client-mixed-batch | @canard/schema-form | whole array mixed batch | uncontrolled two-item whole-array input | repaired | 1.347 | 1.360 | 0.993 / 0.999 | over |
| p2e-14-whole-array-client-composition | @canard/schema-form | whole array composition | uncontrolled two-item whole-array input | repaired | 1.453 | 1.466 | 0.991 / 1.003 | over |
| p2e-15-batch-structural | @canard/schema-form | structural batch | push and pop on nested object array | repaired | 1.831 | 1.857 | 1.015 / 1.016 | over |
| p2e-16-virtual-getters | @canard/schema-form | virtual getters | 50000 getter triples over 128 independent nodes | repaired | 1.348 | 1.321 | 1.012 / 0.998 | over |
