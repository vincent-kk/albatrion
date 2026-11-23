A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 238950897ded3d71b4323094274368eab495f063 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-01-schema-first-miss | @winglet/json-schema | resolve | first miss with 20 resources | plain | 9.835 | 9.922 | 1.001 / 1.001 | over |
| p1-02-rest-changed | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 1.524 | 1.657 | 1.006 / 0.994 | over |
| p1-03-rest-equal | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 2.025 | 2.002 | 1.011 / 1.037 | void |
| p1-04-equals-deep | @winglet/common-utils | equals | two independent 128-deep chains | plain | 2.645 | 2.642 | 1.000 / 0.998 | over |
| p1-05-isEmpty-general | @winglet/common-utils | isEmpty | 12 mixed values in order | plain | 1.001 | 1.001 | 1.003 / 1.000 | pass |
| p1-06-getValue-tokens | @winglet/json | getValue | three pointer tokens | plain | 1.322 | 1.322 | 1.000 / 1.001 | over |
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.367 | 1.237 | 0.996 / 0.988 | over |
| p1-08-flat-combinator | @winglet/style-utils | compressCss | flat combinator rule | plain | 0.358 | 0.355 | 1.005 / 1.000 | pass |
| p1-09-inject-add | @winglet/style-utils | inject | active document scope | plain | 1.079 | 1.091 | 0.997 / 0.997 | over |
| p1-10-plain-multiple | @winglet/style-utils | compressCss | 200 flat rules | plain | 0.840 | 0.840 | 1.000 / 1.000 | pass |
| p1-11-checkboxChangePlain | @canard/schema-form-antd5-plugin | checkbox change | two string options | plain | 1.054 | 1.020 | 1.032 / 1.006 | void |
| p1-12-clone-builtins | @winglet/common-utils | clone | array and built-in values | plain | 1.170 | 1.187 | 0.999 / 1.014 | over |
| p1-13-cloneLite-deep | @winglet/common-utils | cloneLite | 300-deep child chain | plain | 1.282 | 1.278 | 1.005 / 1.002 | over |
| p1-14-clone-deep | @winglet/common-utils | clone | 300-deep next chain | plain | 1.190 | 1.178 | 1.011 / 0.998 | over |
| p1-15-getValue-array | @winglet/json | getValue | array pointer | plain | 1.072 | 1.076 | 1.000 / 1.000 | over |
| p1-16-mount-plain | @canard/schema-form | Form SSR | object with string and number | plain | 1.044 | 1.043 | 1.004 / 1.000 | over |
| p1-17-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled array input | plain | 1.059 | 1.058 | 0.999 / 0.997 | over |
| p1-18-getValue-fragment-plain | @winglet/json | getValue | unencoded fragment pointer | plain | 0.953 | 0.949 | 1.000 / 0.994 | pass |
| p1-19-context-update | @canard/schema-form | Form context update | nested context change | plain | 1.078 | 1.069 | 1.014 / 1.006 | over |
| p1-20-isEmpty-local-map | @winglet/common-utils | isEmpty | nonempty local map | plain | 1.000 | 1.000 | 1.000 / 1.000 | pass |
| p1-21-engine-mount-plain | @canard/schema-form | Form client mount | object with a string and a number field | plain | 0.974 | 0.970 | 0.999 / 0.999 | pass |
| p1-22-stringSwitchMount | @canard/schema-form-mui-plugin | string switch mount | enum switch with aliases | repaired | 1.001 | 1.003 | 0.992 / 0.994 | pass |
| p1-23-patch-array-test-mutable | @winglet/json | applyPatch | mutable array test patch | plain | 0.969 | 0.974 | 1.001 / 0.995 | pass |
| p1-24-react-bridges | @canard/schema-form | Form.Render SSR | label and input bridge | plain | 1.039 | 1.014 | 1.014 / 0.985 | over |
