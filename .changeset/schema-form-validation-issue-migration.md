---
"@canard/schema-form": minor
---

Breaking change: the root `JSONSchemaError` validation-issue type is replaced by `ValidationIssue`. It describes an issue returned by a validator, not a thrown schema exception. Update type imports and construct issues with a `dataPath` and optional `keyword`, `message`, and validator-specific `source` diagnostics.

Before:

```ts
import type { JSONSchemaError } from '@canard/schema-form';
const readPath = (issue: JSONSchemaError) => issue.dataPath;
```

After:

```ts
import type { ValidationIssue } from '@canard/schema-form';
const readPath = (issue: ValidationIssue) => issue.dataPath;
```

Use `isJSONSchemaError` to recognize thrown schema errors; that guard does not turn a validation issue into an exception.
