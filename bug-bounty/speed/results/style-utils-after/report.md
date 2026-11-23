A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B a8c022263236c61473cd89465f0a65c595e85fdd · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.314 | 1.244 | 1.041 / 0.963 | void |
| p1-08-flat-combinator | @winglet/style-utils | compressCss | flat combinator rule | plain | 0.348 | 0.353 | 1.014 / 1.002 | pass |
| p1-09-inject-add | @winglet/style-utils | inject | active document scope | plain | 1.058 | 1.063 | 1.017 / 0.983 | over |
| p1-10-plain-multiple | @winglet/style-utils | compressCss | 200 flat rules | plain | 0.841 | 0.840 | 1.000 / 0.999 | pass |
