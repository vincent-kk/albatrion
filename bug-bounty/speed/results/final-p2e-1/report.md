A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-01-ab-reset-pending | @canard/schema-form | batch reset pending | eight sibling writes and object reset | repaired | 0.988 | 1.006 | 1.005 / 0.999 | pass |
| p2e-02-virtual-merge-one | @canard/schema-form | virtual merge | one virtual member and disjoint sibling write | repaired | 1.032 | 1.043 | 0.999 / 1.009 | over |
| p2e-03-ab-derive-disjoint | @canard/schema-form | disjoint derived writes | one source and two derived siblings | plain | 1.056 | 1.053 | 0.988 / 0.998 | over |
| p2e-04-virtual-write | @canard/schema-form | virtual write | two active virtual members | plain | 1.061 | 1.061 | 0.995 / 0.993 | over |
| p2e-05-virtual-reset | @canard/schema-form | virtual reset | two absent virtual members | repaired | 1.055 | 1.085 | 0.983 / 0.998 | over |
| p2e-06-virtual-absent-undefined | @canard/schema-form | virtual merge with absent member | object and explicit undefined inactive member | repaired | 1.039 | 1.045 | 1.005 / 0.999 | over |
