A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B unknown · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-01-schema-first-miss | @winglet/json-schema | resolve | first miss with 20 resources | plain | 9.761 | 9.756 | 0.988 / 0.984 | over |
| p2c-22-schema-known-noncanonical | @winglet/json-schema | resolve | known embedded ID and 20 noncanonical resource keys | plain | 4.744 | 4.670 | 1.009 / 0.992 | over |
| p2c-23-schema-first-embedded | @winglet/json-schema | resolve | first embedded lookup across 20 registered documents | repaired | 14.282 | 14.047 | 1.007 / 1.000 | over |
| p2c-24-schema-key-collision | @winglet/json-schema | resolve | embedded ID colliding with registered document | repaired | 2.389 | 2.375 | 1.000 / 0.994 | over |
