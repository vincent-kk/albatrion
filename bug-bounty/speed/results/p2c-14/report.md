A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v26.13.1 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-14-media | @winglet/style-utils | inject | 200 compressed media groups | repaired | 5.175 | 5.111 | 0.999 / 1.002 | over |
| p2c-15-escapes | @winglet/style-utils | inject | 200 compressed rules with escaped space and quote | repaired | 8.959 | 8.934 | 0.999 / 0.999 | over |
| p2c-16-pseudo | @winglet/style-utils | inject | 200 compressed functional-pseudo-class rules | repaired | 11.434 | 9.311 | 0.997 / 1.007 | over |
| p2c-17-mixed | @winglet/style-utils | inject | six 200-rule sheets, compressed and scoped | repaired | 3.394 | 3.462 | 0.998 / 1.001 | over |
