---
"@canard/schema-form": minor
---

`Form` accepts an `onError` callback that receives one record for each failure or warning the form observes. A record carries `level` (`'error'` or `'warning'`), `code` (a `FormErrorCode` or `FormWarningCode` value), `message`, `origin` (`'load'`, `'write'`, `'validate'`, `'submit'` or `'render'`) and, when known, the affected `path` and `schemaPath`, `details` and the thrown `error`. 0.16 had no such callback.

```tsx
<Form
  jsonSchema={jsonSchema}
  onError={(record) => {
    if (record.level === 'error') reportToMonitoring(record.code, record);
  }}
/>
```

The callback is a diagnostics channel, not a list of field errors: read `onValidate` or `getErrors()` on the form handle for invalid input. `validate()` and `submit()` still reject with their failure, and a failure that has no caller to reject, such as one in automatic validation or in a listener, is also passed to `globalThis.reportError`.
