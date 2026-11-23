A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B c674ad3865afeda3f134ac5f8560a049298e955e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.286 | 1.223 | 0.997 / 1.004 | over |
| p1-08-flat-combinator | @winglet/style-utils | compressCss | flat combinator rule | plain | 0.356 | 0.354 | 1.002 / 1.000 | pass |
| p1-10-plain-multiple | @winglet/style-utils | compressCss | 200 flat rules | plain | 0.839 | 0.839 | 1.000 / 1.000 | pass |
