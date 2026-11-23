A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-22-schema-known-noncanonical | @winglet/json-schema | resolve | known embedded ID and 20 noncanonical resource keys | plain | 18.140 | 18.435 | 0.997 / 0.994 | over |
| p2c-23-schema-first-embedded | @winglet/json-schema | resolve | first embedded lookup across 20 registered documents | repaired | 111.616 | 108.848 | 0.997 / 1.000 | over |
| p2c-24-schema-key-collision | @winglet/json-schema | resolve | embedded ID colliding with registered document | repaired | 1.673 | 1.634 | 1.018 / 1.005 | over |
