A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-19-context-update | @canard/schema-form | Form context update | nested context change | plain | 1.062 | 1.063 | 1.005 / 1.005 | over |
| p1-20-isEmpty-local-map | @winglet/common-utils | isEmpty | nonempty local map | plain | 1.000 | 1.000 | 1.000 / 1.000 | pass |
| p1-21-engine-mount-plain | @canard/schema-form | Form client mount | object with a string and a number field | plain | 0.971 | 0.977 | 0.988 / 0.992 | pass |
| p1-22-stringSwitchMount | @canard/schema-form-mui-plugin | string switch mount | enum switch with aliases | repaired | 1.009 | 1.004 | 1.007 / 1.000 | pass |
| p1-23-patch-array-test-mutable | @winglet/json | applyPatch | mutable array test patch | plain | 0.967 | 0.967 | 0.999 / 0.999 | pass |
| p1-24-react-bridges | @canard/schema-form | Form.Render SSR | label and input bridge | plain | 1.038 | 1.087 | 1.021 / 0.995 | void |
