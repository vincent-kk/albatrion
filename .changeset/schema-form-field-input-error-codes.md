---
"@canard/schema-form": minor
---

Breaking change: the input-map compilation error code is `SCHEMA_FORM_ERROR.FIELD_INPUT_MAP`, available as `FormErrorCode.FieldInputMap`. Update comparisons with the thrown error's code.

Before:

```ts
if (error.code === 'SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP') {
  reportInvalidInputMap(error);
}
```

After:

```ts
import { FormErrorCode } from '@canard/schema-form';

if (error.code === FormErrorCode.FieldInputMap) {
  reportInvalidInputMap(error);
}
```
