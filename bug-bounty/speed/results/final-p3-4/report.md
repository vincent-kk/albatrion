A 53099d518a7920c44c6e1de02c5a6e42a269f49e · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-11-expr-return-regexp | @canard/schema-form | mount with a regexp after return | derived expression returning a regexp literal plus a number | repaired | 1.010 | 1.001 | 1.005 / 0.998 | pass |
| p3-17-r2-async-relay-content | @canard/schema-form | relayed own array write | uncontrolled input publishing a same-content array through a relay | repaired | 0.985 | 0.996 | 0.978 / 0.991 | void |
