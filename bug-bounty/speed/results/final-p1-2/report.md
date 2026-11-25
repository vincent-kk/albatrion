A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.444 | 1.287 | 1.103 / 1.034 | void |
| p1-08-flat-combinator | @winglet/style-utils | compressCss | flat combinator rule | plain | 0.384 | 0.383 | 0.999 / 0.999 | pass |
| p1-09-inject-add | @winglet/style-utils | inject | active document scope | plain | 1.048 | 1.071 | 0.996 / 0.998 | over |
| p1-10-plain-multiple | @winglet/style-utils | compressCss | 200 flat rules | plain | 0.859 | 0.859 | 1.000 / 1.000 | pass |
| p1-11-checkboxChangePlain | @canard/schema-form-antd5-plugin | checkbox change | two string options | plain | 1.007 | 1.011 | 0.972 / 0.993 | void |
| p1-12-clone-builtins | @winglet/common-utils | clone | array and built-in values | plain | 1.168 | 1.170 | 0.996 / 1.002 | over |
