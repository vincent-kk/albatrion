A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-20-installer-force | @slats/agents-assets-sync | installer-force | 16 skills plus one orphan and one local edit | repaired | 2.009 | 2.051 | 1.001 / 0.999 | over |
| p2c-21-isEmpty-foreign-map | @winglet/common-utils | isEmpty | 300000 independent foreign Maps | plain | 1.005 | 1.004 | 1.002 / 0.998 | pass |
| p2c-22-schema-known-noncanonical | @winglet/json-schema | resolve | known embedded ID and 20 noncanonical resource keys | plain | 1.921 | 1.911 | 1.007 / 1.003 | over |
| p2c-23-schema-first-embedded | @winglet/json-schema | resolve | first embedded lookup across 20 registered documents | repaired | 11.121 | 11.029 | 1.004 / 0.998 | over |
| p2c-24-schema-key-collision | @winglet/json-schema | resolve | embedded ID colliding with registered document | repaired | 2.333 | 2.336 | 0.998 / 0.999 | over |
