A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B unknown · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.377 | 1.257 | 0.989 / 1.017 | over |
| p1-09-inject-add | @winglet/style-utils | inject | active document scope | plain | 1.054 | 1.086 | 0.991 / 1.001 | over |
| p2c-13-opaque | @winglet/style-utils | inject | 200 compressed rules with quoted and functional selectors | repaired | 3.289 | 3.251 | 0.998 / 0.998 | over |
| p2c-16-pseudo | @winglet/style-utils | inject | 200 compressed functional-pseudo-class rules | repaired | 2.588 | 2.592 | 1.000 / 1.001 | over |
