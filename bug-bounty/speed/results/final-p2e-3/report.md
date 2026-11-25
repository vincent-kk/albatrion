A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2e-13-whole-array-client-mixed-batch | @canard/schema-form | whole array mixed batch | uncontrolled two-item whole-array input | repaired | 1.308 | 1.312 | 0.996 / 1.000 | over |
| p2e-14-whole-array-client-composition | @canard/schema-form | whole array composition | uncontrolled two-item whole-array input | repaired | 1.435 | 1.465 | 0.999 / 1.000 | over |
| p2e-15-batch-structural | @canard/schema-form | structural batch | push and pop on nested object array | repaired | 1.826 | 1.862 | 1.008 / 1.004 | over |
| p2e-16-virtual-getters | @canard/schema-form | virtual getters | 50000 getter triples over 128 independent nodes | repaired | 1.330 | 1.342 | 0.990 / 1.004 | over |
| p2e-17-virtual-getter-divergence | @canard/schema-form | virtual divergence getter | 150000 reads over 128 independent nodes | repaired | 2.182 | 2.192 | 0.989 / 1.003 | over |
| p2e-18-virtual-getter-inactive | @canard/schema-form | virtual inactive getter | 1200000 reads over 128 independent nodes | repaired | 2.854 | 2.957 | 1.002 / 1.007 | over |
