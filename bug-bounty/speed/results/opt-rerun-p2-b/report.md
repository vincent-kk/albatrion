A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 238950897ded3d71b4323094274368eab495f063 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-02-virtual-merge-one | @canard/schema-form | virtual merge | one virtual member and disjoint sibling write | repaired | 1.039 | 1.043 | 1.004 / 1.001 | over |
| p2e-03-ab-derive-disjoint | @canard/schema-form | disjoint derived writes | one source and two derived siblings | plain | 1.063 | 1.056 | 0.993 / 1.005 | over |
| p2e-06-virtual-absent-undefined | @canard/schema-form | virtual merge with absent member | object and explicit undefined inactive member | repaired | 1.031 | 1.048 | 1.003 / 1.001 | over |
| p2e-12-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled two-item whole-array input | plain | 1.042 | 1.046 | 0.989 / 1.001 | over |
