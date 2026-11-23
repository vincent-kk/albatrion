A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 238950897ded3d71b4323094274368eab495f063 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-03-rest-equal | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 2.028 | 2.001 | 0.999 / 1.012 | over |
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.089 | 1.214 | 0.933 / 0.994 | void |
| p1-11-checkboxChangePlain | @canard/schema-form-antd5-plugin | checkbox change | two string options | plain | 1.049 | 1.031 | 1.008 / 1.003 | over |
| p1-24-react-bridges | @canard/schema-form | Form.Render SSR | label and input bridge | plain | 1.046 | 1.100 | 1.014 / 0.994 | over |
