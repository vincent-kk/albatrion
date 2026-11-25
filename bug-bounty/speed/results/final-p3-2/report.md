A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-07-overlap-array-32-4 | @canard/schema-form | overlapping array writes | one trigger writing a 32-item array and its first four items | repaired | 1.180 | 1.180 | 1.003 / 1.001 | over |
| p3-08-json-getValue-fragment | @winglet/json | getValue | URI fragment with a percent-encoded key | repaired | 2.635 | 2.634 | 1.002 / 1.000 | over |
| p3-09-ab-derive-overlap | @canard/schema-form | derive overlapping targets | one rule writing an object and a field inside it | repaired | 1.186 | 1.195 | 1.000 / 1.003 | over |
| p3-10-reset-refused-8 | @canard/schema-form | refused reset in a batch | seven sibling writes, a merge that deactivates the box and a subtree reset | repaired | 1.218 | 1.234 | 0.999 / 1.002 | over |
| p3-12-validate-writeback | @canard/schema-form | validate with a same-value write | string root whose validator rewrites its own value | repaired | 1.217 | 1.239 | 0.994 / 1.003 | over |
| p3-13-engine-validate-writeback | @canard/schema-form | node validate with a same-value write | string root whose validator rewrites its own value | repaired | 1.234 | 1.228 | 0.992 / 1.000 | over |
