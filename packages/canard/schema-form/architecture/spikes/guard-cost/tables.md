<!-- env {"node":"v24.20.0","v8":"13.6.233.17-node.53","platform":"darwin arm64","ajv":"8.17.1","cfworker":"4.1.1","tinybench":"/Users/Vincent/Workspace/albatrion/node_modules/tinybench/dist/index.cjs"} floor=0.74ns -->

### M1 — one guard call, by shape and host width

| guard shape | host keys | Ajv true | Ajv false | cfworker true | cfworker false |
| --- | --- | --- | --- | --- | --- |
| g1 single const | 10 | 5.2 ns | 19 ns | 325 ns | 393 ns |
| g1 single const | 100 | 14 ns | 29 ns | 1.47 µs | 1.53 µs |
| g1 single const | 1000 | 14 ns | 58 ns | 15.8 µs | 14.5 µs |
| g2 conjunction x3 | 10 | 13 ns | 21 ns | 908 ns | 988 ns |
| g2 conjunction x3 | 100 | 60 ns | 65 ns | 2.10 µs | 2.17 µs |
| g2 conjunction x3 | 1000 | 61 ns | 94 ns | 14.6 µs | 13.7 µs |
| g3 depth-3 hoisted | 10 | 12 ns | 20 ns | 924 ns | 1.02 µs |
| g3 depth-3 hoisted | 100 | 25 ns | 32 ns | 2.11 µs | 2.15 µs |
| g3 depth-3 hoisted | 1000 | 26 ns | 60 ns | 13.6 µs | 14.0 µs |
| g5 not(anyOf x2) | 10 | 27 ns | 19 ns | 1.31 µs | 1.45 µs |
| g5 not(anyOf x2) | 100 | 57 ns | 46 ns | 5.95 µs | 6.11 µs |
| g5 not(anyOf x2) | 1000 | 55 ns | 93 ns | 55.4 µs | 54.0 µs |

### M1b — g4 `contains` over an array (host 100 keys, fresh process)

| array items | Ajv early match | Ajv no match | cfworker early match | cfworker no match |
| --- | --- | --- | --- | --- |
| 100 | 26 ns | 1.81 µs | 43.6 µs | 44.7 µs |
| 1,000 | 31 ns | 18.0 µs | 429.3 µs | 429.5 µs |
| 10,000 | 32 ns | 189.8 µs | 4.46 ms | 4.51 ms |

### M2 — one write, N guards on the root

| mechanism | N=10 | N=50 | N=200 | ns/guard (N=200) |
| --- | --- | --- | --- | --- |
| ajv | 303 ns | 1.60 µs | 7.90 µs | 39.5 |
| cfworker | 7.47 µs | 55.5 µs | 577.6 µs | 2888.1 |
| newFunction (deps prebuilt) | 68 ns | 370 ns | 1.46 µs | 7.3 |
| newFunction (deps re-read) | 124 ns | 775 ns | 3.16 µs | 15.8 |
| O(1) index lookup | 7.8 ns | 8.6 ns | 8.7 ns | O(1) |

### M3 — skip strategies (Ajv guards; Resolve pass only, evaluations · time)

| layout | keystroke | strategy | N=10 | N=50 | N=200 |
| --- | --- | --- | --- | --- | --- |
| all on root | unrelated | s0 | 10 · 191 ns | 50 · 1.06 µs | 200 · 6.93 µs |
| all on root | unrelated | s1 | 10 · 216 ns | 50 · 1.14 µs | 200 · 6.92 µs |
| all on root | unrelated | s2 | 0 · 160 ns | 0 · 1.43 µs | 0 · 7.82 µs |
| all on root | unrelated | s2f (flat arrays) | 0 · 126 ns | 0 · 1.38 µs | 0 · 6.76 µs |
| all on root | unrelated | s2r (reverse index) | 0 · 7.4 ns | 0 · 13 ns | 0 · 13 ns |
| all on root | discriminator | s0 | 10 · 305 ns | 50 · 1.53 µs | 200 · 8.04 µs |
| all on root | discriminator | s1 | 10 · 303 ns | 50 · 1.60 µs | 200 · 8.47 µs |
| all on root | discriminator | s2 | 1 · 186 ns | 1 · 1.50 µs | 1 · 7.43 µs |
| all on root | discriminator | s2f (flat arrays) | 1 · 163 ns | 1 · 1.47 µs | 1 · 6.77 µs |
| all on root | discriminator | s2r (reverse index) | 1 · 35 ns | 1 · 32 ns | 1 · 33 ns |
| per sub-object | unrelated | s0 | 10 · 272 ns | 50 · 1.84 µs | 200 · 9.58 µs |
| per sub-object | unrelated | s1 | 0 · 211 ns | 0 · 1.85 µs | 0 · 10.1 µs |
| per sub-object | unrelated | s2 | 0 · 216 ns | 0 · 1.84 µs | 0 · 9.54 µs |
| per sub-object | unrelated | s2f (flat arrays) | 0 · 127 ns | 0 · 1.26 µs | 0 · 6.50 µs |
| per sub-object | unrelated | s2r (reverse index) | 0 · 14 ns | 0 · 18 ns | 0 · 12 ns |
| per sub-object | discriminator | s0 | 10 · 284 ns | 50 · 1.84 µs | 200 · 8.24 µs |
| per sub-object | discriminator | s1 | 1 · 234 ns | 1 · 1.90 µs | 1 · 9.20 µs |
| per sub-object | discriminator | s2 | 1 · 251 ns | 1 · 1.92 µs | 1 · 11.7 µs |
| per sub-object | discriminator | s2f (flat arrays) | 1 · 168 ns | 1 · 1.39 µs | 1 · 6.30 µs |
| per sub-object | discriminator | s2r (reverse index) | 1 · 62 ns | 1 · 78 ns | 1 · 69 ns |

### M4 — immutable update vs mutation, leaf at depth 3

| path contains | immutable | in-place | ratio |
| --- | --- | --- | --- |
| depth-3 leaf, object 10 keys | 37 ns | 1.6 ns | 23× |
| depth-3 leaf, object 1000 keys | 1.12 µs | 4.9 ns | 229× |
| depth-3 leaf, array 100 items (slice copy) | 45 ns | 6.0 ns | 7× |
| depth-3 leaf, array 10000 items (slice copy) | 2.72 µs | 5.9 ns | 457× |

| 1,000 sequential keystrokes | total | per keystroke |
| --- | --- | --- |
| object 1000 keys | 1.11 ms | 1.11 µs |
| array 10000 items | 2.72 ms | 2.72 µs |

### M5 — picking the active oneOf branch

| branches | match at | scan branches (ajv) | scan branches (cfworker) | discriminator Map.get | discriminator linear === |
| --- | --- | --- | --- | --- | --- |
| K=5 | first (#0) | 16 ns | 1.52 µs | 11 ns | 4.6 ns |
| K=5 | middle (#2) | 66 ns | 2.43 µs | 6.8 ns | 14 ns |
| K=5 | last (#4) | 145 ns | 3.38 µs | 6.9 ns | 21 ns |
| K=20 | first (#0) | 21 ns | 1.49 µs | 6.8 ns | 5.9 ns |
| K=20 | middle (#10) | 236 ns | 5.84 µs | 6.8 ns | 17 ns |
| K=20 | last (#19) | 470 ns | 10.2 µs | 6.8 ns | 53 ns |
| K=50 | first (#0) | 19 ns | 1.49 µs | 8.5 ns | 5.9 ns |
| K=50 | middle (#25) | 602 ns | 12.4 µs | 6.8 ns | 79 ns |
| K=50 | last (#49) | 1.25 µs | 23.1 µs | 6.8 ns | 162 ns |
