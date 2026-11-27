---
"@winglet/json": major
---

Breaking change: a JSON Pointer written as a URI fragment, which starts with `#`, is now percent-decoded once before its tokens are read, as RFC 6901 section 6 requires. This applies to `getValue`, `setValue`, `compilePointer` and the `path` and `from` of `applyPatch` operations. Before, `#/a%20b` addressed the member named `a%20b`; now it addresses `a b`, and `#/a%2520b` addresses `a%20b`. Pointers that start with `/` and pointers given as arrays are not decoded and keep literal `%` characters. A fragment with a malformed escape, such as `#/a%zz`, now throws: `JSONPointerError` with specific `INVALID_POINTER_TYPE` from `getValue`, `setValue` and `compilePointer`, and `JSONPatchError` with specific `PATCH_PATH_INVALID` from `applyPatch`. Before, it addressed the member named `a%zz`.

Before:

```ts
import { getValue } from "@winglet/json";

const document = { "a%20b": 1, "a b": 2 };
getValue(document, "#/a%20b"); // 1
```

After:

```ts
import { getValue } from "@winglet/json";

const document = { "a%20b": 1, "a b": 2 };
getValue(document, "#/a%20b"); // 2
getValue(document, "#/a%2520b"); // 1, '%25' escapes a literal '%'
getValue(document, "/a%20b"); // 1, a slash-prefixed pointer is not decoded
```
