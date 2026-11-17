---
"@winglet/json-schema": minor
---

Add the `@winglet/json-schema/keyword` subpath, which exports `Dialect`, `DEFAULT_KEYWORDS`, `KeywordDescriptor` and `KeywordKind` without loading the scanners or the resolver. Code that only needs the schema declarations, such as a custom vocabulary built from the defaults, can import them from this subpath instead of the package root or `/scanner`.

```ts
import { DEFAULT_KEYWORDS, Dialect } from "@winglet/json-schema/keyword";
import type { KeywordDescriptor } from "@winglet/json-schema/keyword";

const keywords: KeywordDescriptor[] = [
  ...DEFAULT_KEYWORDS,
  { keyword: "x-schema", kind: "schema", dialects: [Dialect.Draft202012] },
];
```

The package root, `/scanner` and `/async-scanner` keep their exports, and every declaration they share with `/keyword` is the same object.
