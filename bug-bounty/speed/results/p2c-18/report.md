A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-18-installer-new | @slats/agents-assets-sync | installer-new | 16 skill files | plain | 2.023 | 1.947 | 1.030 / 1.008 | void |
| p2c-19-installer-unchanged | @slats/agents-assets-sync | installer-unchanged | 16 skill files | plain | 2.222 | 2.183 | 1.009 / 1.003 | over |
| p2c-20-installer-force | @slats/agents-assets-sync | installer-force | 16 skills plus one orphan and one local edit | repaired | 2.756 | 2.606 | 1.042 / 1.004 | void |
| p2c-21-isEmpty-foreign-map | @winglet/common-utils | isEmpty | 300000 independent foreign Maps | plain | 1.002 | 0.999 | 0.998 / 1.000 | pass |
