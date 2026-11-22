A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-01-schema-first-miss | @winglet/json-schema | resolve | first miss with 20 resources | plain | 144.310 | 142.982 | 1.000 / 1.002 | over |
| p1-04-equals-deep | @winglet/common-utils | equals | two independent 128-deep chains | plain | 2.636 | 2.667 | 0.999 / 0.999 | over |
| p1-06-getValue-tokens | @winglet/json | getValue | three pointer tokens | plain | 1.290 | 1.310 | 0.999 / 0.998 | over |
| p1-08-flat-combinator | @winglet/style-utils | compressCss | flat combinator rule | plain | 0.356 | 0.354 | 0.997 / 1.003 | pass |
