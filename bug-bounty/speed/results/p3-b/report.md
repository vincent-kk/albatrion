A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-10-reset-refused-8 | @canard/schema-form | refused reset in a batch | seven sibling writes, a merge that deactivates the box and a subtree reset | repaired | 1.229 | 1.231 | 1.010 / 1.006 | over |
| p3-12-validate-writeback | @canard/schema-form | validate with a same-value write | string root whose validator rewrites its own value | repaired | 1.170 | 1.224 | 0.954 / 1.007 | void |
| p3-13-engine-validate-writeback | @canard/schema-form | node validate with a same-value write | string root whose validator rewrites its own value | repaired | 1.223 | 1.224 | 1.003 / 1.008 | over |
| p3-14-r2-client-array-external | @canard/schema-form | external array write | uncontrolled one-item array input rewritten from outside | repaired | 1.338 | 1.344 | 0.998 / 1.003 | over |
