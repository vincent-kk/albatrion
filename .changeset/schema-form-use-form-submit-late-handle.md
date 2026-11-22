---
"@canard/schema-form": patch
---

`useFormSubmit(ref).pending` now follows a Form that mounts after the hook, or that remounts with a new `key` or after error recovery. Before, `pending` stayed `undefined` or `false` while a submission ran, so a submit button relying on it could be clicked twice. The hook re-checks the handle each time the component that calls it commits.
