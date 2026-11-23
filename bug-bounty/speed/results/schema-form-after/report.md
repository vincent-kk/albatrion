A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 447f70026ffcbaf10f4e34d5d10cd3df22e84ca3 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-11-checkboxChangePlain | @canard/schema-form-antd5-plugin | checkbox change | two string options | plain | 1.046 | 1.026 | 1.018 / 0.994 | over |
| p1-16-mount-plain | @canard/schema-form | Form SSR | object with string and number | plain | 1.024 | 1.095 | 0.996 / 0.999 | over |
| p1-17-whole-array-client-own-write | @canard/schema-form | whole array own write | uncontrolled array input | plain | 1.073 | 1.087 | 1.000 / 0.995 | over |
| p1-19-context-update | @canard/schema-form | Form context update | nested context change | plain | 1.076 | 1.071 | 1.005 / 1.001 | over |
| p1-21-engine-mount-plain | @canard/schema-form | Form client mount | object with a string and a number field | plain | 1.021 | 1.019 | 1.009 / 1.004 | pass |
| p1-22-stringSwitchMount | @canard/schema-form-mui-plugin | string switch mount | enum switch with aliases | repaired |  |  |  /  | void (B: Node.js v24.20.0) |
| p1-24-react-bridges | @canard/schema-form | Form.Render SSR | label and input bridge | plain | 0.988 | 1.018 | 1.007 / 1.004 | pass |
