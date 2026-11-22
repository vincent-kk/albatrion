A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B d78e45c6b7ad0ce88783d720c19cbde52732acfe · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p1-20-isEmpty-local-map | @winglet/common-utils | isEmpty | nonempty local map | plain | 1.000 | 1.000 | 1.000 / 1.000 | pass |
| p1-21-engine-mount-plain | @canard/schema-form | Form client mount | object with a string and a number field | plain | 0.985 | 0.969 | 1.005 / 1.009 | pass |
| p1-22-stringSwitchMount | @canard/schema-form-mui-plugin | string switch mount | enum switch with aliases | repaired | 1.009 | 1.016 | 0.989 / 1.002 | pass |
| p1-23-patch-array-test-mutable | @winglet/json | applyPatch | mutable array test patch | plain | 0.969 | 0.969 | 0.999 / 1.000 | pass |
| p1-24-react-bridges | @canard/schema-form | Form.Render SSR | label and input bridge | plain | 1.030 | 1.040 | 0.985 / 1.012 | over |
