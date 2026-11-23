A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 238950897ded3d71b4323094274368eab495f063 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-20-installer-force | @slats/agents-assets-sync | installer-force | 16 skills plus one orphan and one local edit | repaired | 2.013 | 2.030 | 0.988 / 1.005 | over |
| p2c-21-isEmpty-foreign-map | @winglet/common-utils | isEmpty | 300000 independent foreign Maps | plain | 1.003 | 1.003 | 1.006 / 1.004 | pass |
| p2c-22-schema-known-noncanonical | @winglet/json-schema | resolve | known embedded ID and 20 noncanonical resource keys | plain | 4.704 | 4.653 | 0.997 / 0.995 | over |
| p2c-23-schema-first-embedded | @winglet/json-schema | resolve | first embedded lookup across 20 registered documents | repaired | 13.922 | 13.908 | 0.995 / 0.993 | over |
| p2c-24-schema-key-collision | @winglet/json-schema | resolve | embedded ID colliding with registered document | repaired | 2.383 | 2.358 | 1.005 / 0.997 | over |
