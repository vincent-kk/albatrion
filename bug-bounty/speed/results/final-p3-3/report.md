A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-14-r2-client-array-external | @canard/schema-form | external array write | uncontrolled one-item array input rewritten from outside | repaired | 1.352 | 1.349 | 1.002 / 1.004 | over |
| p3-15-r3-batch-array | @canard/schema-form | batched array push and pop | root number array with two items | repaired | 0.497 | 0.502 | 1.006 / 1.003 | pass |
| p3-16-validate-writeback-errors | @canard/schema-form | node validate with a rewriting validator that reports errors | string root whose validator rewrites its value and alternates its issues | repaired | 1.552 | 1.519 | 0.997 / 0.996 | over |
| p3-18-schema-alternate-lookup | @winglet/json-schema | resolve | one registration spelled in upper case among 21 resources | repaired | 4.201 | 4.155 | 0.993 / 1.001 | over |
| p3-19-ajv6-bound-first-id-resource-invalid | @canard/schema-form-ajv6-plugin | first failing validation | identified local resource with a not-required rule, first failure of a fresh compile | repaired | 8.188 | 7.569 | 1.061 / 1.022 | void |
