A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-06-anchor-ssr-initial-errors | @canard/schema-form | server render with initial errors | one string field and one server error | repaired | 1.247 | 1.196 | 0.997 / 1.006 | over |
| p3-07-overlap-array-32-4 | @canard/schema-form | overlapping array writes | one trigger writing a 32-item array and its first four items | repaired | 1.191 | 1.166 | 1.011 / 0.992 | over |
| p3-08-json-getValue-fragment | @winglet/json | getValue | URI fragment with a percent-encoded key | repaired | 4.232 | 4.211 | 0.997 / 1.001 | over |
| p3-09-ab-derive-overlap | @canard/schema-form | derive overlapping targets | one rule writing an object and a field inside it | repaired | 1.192 | 1.192 | 1.001 / 0.998 | over |
