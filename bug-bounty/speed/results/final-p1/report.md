A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B c8aa0cfda6a4638d73c8cccbd4f4bfa80384a841 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-01-schema-first-miss | @winglet/json-schema | resolve | first miss with 20 resources | plain | 9.859 | 9.841 | 1.003 / 1.000 | over |
| p1-02-rest-changed | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 1.529 | 1.700 | 1.003 / 1.002 | over |
| p1-03-rest-equal | @winglet/react-utils | useRestProperties | 2000 hook calls in one rerender | plain | 2.010 | 1.937 | 1.000 / 0.998 | over |
| p1-04-equals-deep | @winglet/common-utils | equals | two independent 128-deep chains | plain | 1.464 | 1.471 | 1.001 / 1.003 | over |
| p1-05-isEmpty-general | @winglet/common-utils | isEmpty | 12 mixed values in order | plain | 0.997 | 0.999 | 1.001 / 1.001 | pass |
| p1-06-getValue-tokens | @winglet/json | getValue | three pointer tokens | plain | 1.323 | 1.322 | 0.999 / 1.000 | over |
| p1-07-document-fresh-add | @winglet/style-utils | styleManagerFactory/inject | fresh document scope | plain | 1.251 | 1.284 | 1.030 / 1.021 | void |
| p1-08-flat-combinator | @winglet/style-utils | compressCss | flat combinator rule | plain | 0.356 | 0.354 | 0.999 / 0.999 | pass |
| p1-09-inject-add | @winglet/style-utils | inject | active document scope | plain | 1.074 | 1.094 | 1.012 / 1.014 | over |
| p1-10-plain-multiple | @winglet/style-utils | compressCss | 200 flat rules | plain | 0.840 | 0.839 | 1.000 / 1.000 | pass |
| p1-11-checkboxChangePlain | @canard/schema-form-antd5-plugin | checkbox change | two string options | plain | 1.031 | 1.019 | 1.015 / 1.005 | over |
| p1-12-clone-builtins | @winglet/common-utils | clone | array and built-in values | plain | 1.171 | 1.180 | 1.001 / 1.003 | over |
| p1-13-cloneLite-deep | @winglet/common-utils | cloneLite | 300-deep child chain | plain | 1.164 | 1.158 | 1.002 / 1.000 | over |
| p1-14-clone-deep | @winglet/common-utils | clone | 300-deep next chain | plain | 1.063 | 1.067 | 1.006 / 0.997 | over |
| p1-15-getValue-array | @winglet/json | getValue | array pointer | plain | 1.080 | 1.078 | 1.001 / 0.999 | over |
| p1-16-mount-plain | @canard/schema-form | Form SSR | object with string and number | plain | 1.031 | 1.041 | 0.989 / 0.998 | over |
| p1-17-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled array input | plain | 1.054 | 1.047 | 1.008 / 1.004 | over |
| p1-18-getValue-fragment-plain | @winglet/json | getValue | unencoded fragment pointer | plain | 0.958 | 0.951 | 1.001 / 0.999 | pass |
| p1-19-context-update | @canard/schema-form | Form context update | nested context change | plain | 1.052 | 1.060 | 0.999 / 1.002 | over |
| p1-20-isEmpty-local-map | @winglet/common-utils | isEmpty | nonempty local map | plain | 1.000 | 1.000 | 1.000 / 1.000 | pass |
| p1-21-engine-mount-plain | @canard/schema-form | Form client mount | object with a string and a number field | plain | 0.976 | 0.947 | 1.000 / 1.002 | pass |
| p1-22-stringSwitchMount | @canard/schema-form-mui-plugin | string switch mount | enum switch with aliases | repaired | 1.011 | 1.005 | 1.002 / 0.999 | pass |
| p1-23-patch-array-test-mutable | @winglet/json | applyPatch | mutable array test patch | plain | 0.967 | 0.962 | 1.000 / 0.999 | pass |
| p1-24-react-bridges | @canard/schema-form | Form.Render SSR | label and input bridge | plain | 1.017 | 1.135 | 0.995 / 0.987 | over |
