A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 02ad85bf9825edb24e854c0f4774e4b7e443c222 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-04-equals-deep | @winglet/common-utils | equals | two independent 128-deep chains | plain | 2.047 | 2.075 | 0.996 / 1.000 | over |
| p1-05-isEmpty-general | @winglet/common-utils | isEmpty | 12 mixed values in order | plain | 0.999 | 0.998 | 0.999 / 0.999 | pass |
| p1-12-clone-builtins | @winglet/common-utils | clone | array and built-in values | plain | 1.166 | 1.172 | 1.006 / 1.005 | over |
| p1-13-cloneLite-deep | @winglet/common-utils | cloneLite | 300-deep child chain | plain | 1.268 | 1.273 | 1.001 / 1.002 | over |
| p1-14-clone-deep | @winglet/common-utils | clone | 300-deep next chain | plain | 1.169 | 1.176 | 0.988 / 0.997 | over |
| p1-20-isEmpty-local-map | @winglet/common-utils | isEmpty | nonempty local map | plain | 1.000 | 1.000 | 1.000 / 0.999 | pass |
