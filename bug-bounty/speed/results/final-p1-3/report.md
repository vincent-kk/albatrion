A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-13-cloneLite-deep | @winglet/common-utils | cloneLite | 300-deep child chain | plain | 1.156 | 1.156 | 0.997 / 0.998 | over |
| p1-14-clone-deep | @winglet/common-utils | clone | 300-deep next chain | plain | 0.983 | 0.985 | 1.001 / 1.002 | pass |
| p1-15-getValue-array | @winglet/json | getValue | array pointer | plain | 1.083 | 1.084 | 1.000 / 1.001 | over |
| p1-16-mount-plain | @canard/schema-form | Form SSR | object with string and number | plain | 0.992 | 0.998 | 0.994 / 1.001 | pass |
| p1-17-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled array input | plain | 1.039 | 1.044 | 1.010 / 1.002 | over |
| p1-18-getValue-fragment-plain | @winglet/json | getValue | unencoded fragment pointer | plain | 0.988 | 0.992 | 0.999 / 1.000 | pass |
