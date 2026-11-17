---
"@winglet/json": patch
---

Correct the shipped specification and agent documents to match the library's behavior. `convertJSONPointerToPath` is documented as returning a dot and bracket data path string that keeps `~0` and `~1` escapes, not an array of unescaped tokens; `compilePointer` returns the tokens. `getValue` is documented as returning `undefined` for a missing location, reading inherited members through ordinary keys (`'/toString'`, an array's `'/length'`), and throwing only `INVALID_INPUT` or `INVALID_POINTER_TYPE`; `PROPERTY_NOT_FOUND` and `INVALID_POINTER` are not codes the library throws. Error handling examples identify errors by `name` and `specific`, because the error classes are not exported. No runtime behavior changes.
