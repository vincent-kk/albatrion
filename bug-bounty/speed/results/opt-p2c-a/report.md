A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 238950897ded3d71b4323094274368eab495f063 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p2c-01-checkboxChange | @canard/schema-form-antd5-plugin | checkbox change | two options and unknown initial value | repaired | 0.751 | 0.753 | 0.995 / 1.004 | pass |
| p2c-02-branchError | @canard/schema-form-antd5-plugin | branch error validation | array minItems error | repaired | 1.754 | 1.800 | 0.990 / 1.000 | over |
| p2c-03-coreExternalArray | @canard/schema-form-antd5-plugin | external array child write | three options and a one-item array | repaired | 7.588 | 7.664 | 0.997 / 0.999 | over |
| p2c-04-multiEnumMount | @canard/schema-form-antd6-plugin | multi enum mount | two options and an unknown object | repaired | 1.028 | 1.038 | 0.998 / 0.999 | over |
| p2c-05-sliderChange | undefined | undefined | undefined | undefined |  |  |  /  | void (A1: Node.js v24.20.0) |
| p2c-06-checkboxChange | @canard/schema-form-mui-plugin | checkbox change | two options and unknown initial value | repaired | 1.016 | 1.004 | 1.000 / 0.991 | pass |
| p2c-07-branchError | @canard/schema-form-mui-plugin | branch error validation | array minItems error | repaired | 1.411 | 1.396 | 0.986 / 0.979 | void |
| p2c-08-context-error-cause | @canard/schema-form | context Error cause update | same-message errors with distinct non-enumerable causes | repaired | 5.978 | 5.997 | 1.001 / 1.007 | over |
| p2c-09-mount-100 | @canard/schema-form | Form SSR | 100 string fields and default values | plain | 1.072 | 1.065 | 1.014 / 1.009 | over |
| p2c-10-whole-array-client-write | @canard/schema-form | whole array root write | uncontrolled one-item array input | repaired | 1.377 | 1.365 | 1.009 / 1.003 | over |
| p2c-11-anchor-slider6-gate | @canard/schema-form | slider gate and focus | conditional Ant 6 slider | repaired | 3.404 | 3.426 | 0.987 / 0.997 | over |
| p2c-12-lists | @winglet/style-utils | inject | 200 compressed selector-list rules | repaired | 7.136 | 7.116 | 0.998 / 1.000 | over |
| p2c-13-opaque | @winglet/style-utils | inject | 200 compressed rules with quoted and functional selectors | repaired | 12.314 | 11.984 | 1.003 / 0.999 | over |
| p2c-14-media | @winglet/style-utils | inject | 200 compressed media groups | repaired | 4.415 | 4.416 | 1.000 / 1.000 | over |
| p2c-15-escapes | @winglet/style-utils | inject | 200 compressed rules with escaped space and quote | repaired | 7.164 | 7.157 | 0.999 / 0.999 | over |
| p2c-16-pseudo | @winglet/style-utils | inject | 200 compressed functional-pseudo-class rules | repaired | 9.484 | 9.470 | 0.999 / 0.999 | over |
| p2c-17-mixed | @winglet/style-utils | inject | six 200-rule sheets, compressed and scoped | repaired | 3.104 | 3.117 | 1.003 / 1.000 | over |
| p2c-18-installer-new | @slats/agents-assets-sync | installer-new | 16 skill files | plain | 1.750 | 1.749 | 0.991 / 1.001 | over |
| p2c-19-installer-unchanged | @slats/agents-assets-sync | installer-unchanged | 16 skill files | plain | 1.683 | 1.683 | 0.999 / 1.001 | over |
