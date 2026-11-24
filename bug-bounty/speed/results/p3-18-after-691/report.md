A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B fc7b6ce8c84926d7f1a7494179f2fa1f78445140 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-22-schema-known-noncanonical | @winglet/json-schema | resolve | known embedded ID and 20 noncanonical resource keys | plain | 2.001 | 2.003 | 0.995 / 0.991 | over |
| p2c-23-schema-first-embedded | @winglet/json-schema | resolve | first embedded lookup across 20 registered documents | repaired | 11.734 | 11.670 | 0.989 / 0.991 | over |
| p2c-24-schema-key-collision | @winglet/json-schema | resolve | embedded ID colliding with registered document | repaired | 2.316 | 2.335 | 1.011 / 1.016 | over |
| p3-18-schema-alternate-lookup | @winglet/json-schema | resolve | one registration spelled in upper case among 21 resources | repaired | 5.026 | 5.038 | 1.006 / 1.008 | over |
