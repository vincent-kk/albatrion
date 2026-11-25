A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-01-schema-first-miss | @winglet/json-schema | resolve | first miss with 20 resources | plain | 8.429 | 8.514 | 0.982 / 0.992 | over |
| p1-02-rest-changed | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 1.525 | 1.661 | 1.008 / 1.004 | over |
| p1-03-rest-equal | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 2.011 | 1.946 | 0.990 / 0.997 | over |
| p1-04-equals-deep | @winglet/common-utils | equals | two independent 128-deep chains | plain | 1.469 | 1.487 | 1.000 / 1.001 | over |
| p1-05-isEmpty-general | @winglet/common-utils | isEmpty | 12 mixed values in order | plain | 0.997 | 0.996 | 0.999 / 0.998 | pass |
| p1-06-getValue-tokens | @winglet/json | getValue | three pointer tokens | plain | 1.282 | 1.287 | 1.000 / 1.000 | over |
