A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-15-r3-batch-array | @canard/schema-form | batched array push and pop | root number array with two items | repaired | 0.493 | 0.498 | 1.001 / 0.999 | pass |
| p3-16-validate-writeback-errors | @canard/schema-form | node validate with a rewriting validator that reports errors | string root whose validator rewrites its value and alternates its issues | repaired | 1.550 | 1.526 | 0.990 / 0.990 | over |
| p3-18-schema-alternate-lookup | @winglet/json-schema | resolve | one registration spelled in upper case among 21 resources | repaired | 5.666 | 5.606 | 0.994 / 0.996 | over |
| p3-19-ajv6-bound-first-id-resource-invalid | @canard/schema-form-ajv6-plugin | first failing validation | identified local resource with a not-required rule, first failure of a fresh compile | repaired | 8.272 | 7.826 | 1.010 / 1.005 | over |
