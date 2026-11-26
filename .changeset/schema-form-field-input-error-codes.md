---
"@canard/schema-form": minor
---

A `fieldInputMap` pattern that fails to compile is now reported to the new `onError` prop, as a record whose `code` is `FormErrorCode.FieldInputMap` (`'SCHEMA_FORM_ERROR.FIELD_INPUT_MAP'`) and whose `origin` is `'load'`, and to the environment's global error reporting. In 0.x the form's internal error boundary caught this failure, logged it to the console with the code `SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP` and showed a fallback message in place of the form, so application code could not receive it.

The new `FormErrorCode` export lists every error code the package raises, so a handler compares codes without string literals:

```tsx
import { Form, FormErrorCode } from '@canard/schema-form';

<Form
  jsonSchema={jsonSchema}
  fieldInputMap={inputMap}
  onError={(record) => {
    if (record.code === FormErrorCode.FieldInputMap) reportInvalidInputMap(record);
  }}
/>;
```
