A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-01-ab-reset-pending | @canard/schema-form | batch reset pending | eight sibling writes and object reset | repaired | 0.984 | 0.978 | 0.999 / 0.998 | pass |
| p2e-02-virtual-merge-one | @canard/schema-form | virtual merge | one virtual member and disjoint sibling write | repaired | 1.039 | 1.045 | 1.002 / 1.002 | over |
| p2e-03-ab-derive-disjoint | @canard/schema-form | disjoint derived writes | one source and two derived siblings | plain | 1.048 | 1.034 | 1.033 / 1.002 | void |
| p2e-04-virtual-write | @canard/schema-form | virtual write | two active virtual members | plain | 1.050 | 1.053 | 0.998 / 1.002 | over |
