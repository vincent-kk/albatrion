A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-05-ajv8-factory-fresh | @canard/schema-form-ajv8-plugin | factory compile on a fresh instance | string schema with an id on a fresh instance | repaired | 1.024 | 1.021 | 0.997 / 1.004 | pass |
| p3-12-validate-writeback | @canard/schema-form | validate with a same-value write | string root whose validator rewrites its own value | repaired | 1.198 | 1.224 | 0.999 / 0.997 | over |
| p3-14-r2-client-array-external | @canard/schema-form | external array write | uncontrolled one-item array input rewritten from outside | repaired | 1.336 | 1.337 | 0.994 / 0.997 | over |
