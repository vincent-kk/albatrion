A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-02-rest-changed | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 1.651 | 1.708 | 0.997 / 1.009 | over |
| p1-03-rest-equal | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 2.050 | 2.037 | 1.005 / 1.017 | over |
| p1-05-isEmpty-general | @winglet/common-utils | isEmpty | 12 mixed values in order | plain | 0.998 | 0.998 | 1.000 / 1.001 | pass |
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.495 | 1.947 | 1.000 / 1.112 | void |
| p1-09-inject-add | @winglet/style-utils | inject | active document scope | plain | 1.418 | 1.814 | 0.880 / 0.988 | void |
| p1-11-checkboxChangePlain | @canard/schema-form-antd5-plugin | checkbox change | two string options | plain |  |  |  /  | void (B: check failed) |
| p1-17-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled array input | plain | 1.084 | 1.087 | 0.994 / 0.999 | over |
| p1-19-context-update | @canard/schema-form | Form context update | nested context change | plain | 1.067 | 1.071 | 0.988 / 0.997 | over |
