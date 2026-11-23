A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 238950897ded3d71b4323094274368eab495f063 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-01-ab-reset-pending | @canard/schema-form | batch reset pending | eight sibling writes and object reset | repaired | 0.991 | 1.005 | 1.000 / 0.995 | pass |
| p2e-02-virtual-merge-one | @canard/schema-form | virtual merge | one virtual member and disjoint sibling write | repaired | 1.032 | 1.035 | 1.000 / 1.003 | over |
| p2e-03-ab-derive-disjoint | @canard/schema-form | disjoint derived writes | one source and two derived siblings | plain | 1.059 | 1.061 | 1.010 / 1.009 | over |
| p2e-04-virtual-write | @canard/schema-form | virtual write | two active virtual members | plain | 1.060 | 1.066 | 1.002 / 0.997 | over |
| p2e-05-virtual-reset | @canard/schema-form | virtual reset | two absent virtual members | repaired | 1.072 | 1.095 | 1.010 / 1.003 | over |
| p2e-06-virtual-absent-undefined | @canard/schema-form | virtual merge with absent member | object and explicit undefined inactive member | repaired | 1.036 | 1.038 | 0.998 / 0.993 | over |
| p2e-07-mount-100 | @canard/schema-form | client mount | 100 string fields and unrelated default keys | plain | 1.028 | 1.021 | 1.005 / 1.002 | pass |
| p2e-08-aliased-mount | @canard/schema-form | aliased client mount | two references to a derived object | repaired | 1.115 | 1.134 | 0.997 / 0.999 | over |
| p2e-09-reset-refused-sequential-8 | @canard/schema-form | sequential refused reset | seven sibling writes and a detached box reset | plain | 1.047 | 1.003 | 0.994 / 0.997 | over |
| p2e-10-plain-merge-shallow | @canard/schema-form | shallow merge | alternating two-key objects | plain | 1.005 | 0.992 | 0.997 / 1.010 | pass |
| p2e-11-whole-array-client-write | @canard/schema-form | whole array external write | uncontrolled two-item whole-array input | repaired | 1.363 | 1.349 | 1.002 / 0.999 | over |
| p2e-12-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled two-item whole-array input | plain | 1.041 | 1.043 | 1.008 / 1.000 | over |
| p2e-13-whole-array-client-mixed-batch | @canard/schema-form | whole array mixed batch | uncontrolled two-item whole-array input | repaired | 1.308 | 1.312 | 1.007 / 1.005 | over |
| p2e-14-whole-array-client-composition | @canard/schema-form | whole array composition | uncontrolled two-item whole-array input | repaired | 1.454 | 1.448 | 1.010 / 0.997 | over |
| p2e-15-batch-structural | @canard/schema-form | structural batch | push and pop on nested object array | repaired | 1.785 | 1.856 | 0.980 / 0.997 | void |
| p2e-16-virtual-getters | @canard/schema-form | virtual getters | 50000 getter triples over 128 independent nodes | repaired | 1.312 | 1.324 | 0.997 / 1.006 | over |
| p2e-17-virtual-getter-divergence | @canard/schema-form | virtual divergence getter | 150000 reads over 128 independent nodes | repaired | 2.197 | 2.201 | 0.987 / 0.992 | over |
| p2e-18-virtual-getter-inactive | @canard/schema-form | virtual inactive getter | 1200000 reads over 128 independent nodes | repaired | 2.955 | 2.947 | 0.999 / 0.999 | over |
