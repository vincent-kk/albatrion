A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-10-plain-multiple | @winglet/style-utils | compressCss | 200 flat rules | plain | 0.841 | 0.840 | 1.000 / 1.000 | pass |
| p1-12-clone-builtins | @winglet/common-utils | clone | array and built-in values | plain | 1.169 | 1.168 | 1.000 / 0.999 | over |
| p1-13-cloneLite-deep | @winglet/common-utils | cloneLite | 300-deep child chain | plain | 1.274 | 1.280 | 1.002 / 1.000 | over |
| p1-14-clone-deep | @winglet/common-utils | clone | 300-deep next chain | plain | 1.174 | 1.178 | 1.003 / 1.002 | over |
| p1-15-getValue-array | @winglet/json | getValue | array pointer | plain | 1.082 | 1.080 | 1.006 / 1.001 | over |
| p1-16-mount-plain | @canard/schema-form | Form SSR | object with string and number | plain | 1.085 | 1.109 | 0.999 / 1.002 | over |
| p1-18-getValue-fragment-plain | @winglet/json | getValue | unencoded fragment pointer | plain | 0.956 | 0.956 | 0.999 / 1.000 | pass |
