A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-14-media | @winglet/style-utils | inject | 200 compressed media groups | repaired | 2.232 | 2.221 | 0.999 / 1.001 | over |
| p2c-15-escapes | @winglet/style-utils | inject | 200 compressed rules with escaped space and quote | repaired | 2.616 | 2.613 | 0.998 / 0.997 | over |
| p2c-16-pseudo | @winglet/style-utils | inject | 200 compressed functional-pseudo-class rules | repaired | 2.586 | 2.589 | 0.997 / 1.001 | over |
| p2c-17-mixed | @winglet/style-utils | inject | six 200-rule sheets, compressed and scoped | repaired | 3.068 | 3.076 | 0.999 / 1.000 | over |
| p2c-18-installer-new | @slats/agents-assets-sync | installer-new | 16 skill files | plain | 1.752 | 1.743 | 0.994 / 1.000 | over |
| p2c-19-installer-unchanged | @slats/agents-assets-sync | installer-unchanged | 16 skill files | plain | 1.681 | 1.675 | 1.006 / 1.001 | over |
