---
"@canard/schema-form": patch
---

When the initial data activates two branches that give one property different types (for example two `allOf` entries gated by `controls.active`), the Form now renders its fields in a degraded state and reports `FormErrorCode.SharedNodeConflict` to `onError` once with `origin: 'load'`, instead of showing only the "Unable to load form." fallback. In 0.16 two branches could not declare one property with different types at all: the schema failed to build, the Form's error boundary replaced the form with "An unexpected error has occurred", and the ref stayed `null`.

The mount now behaves like a `reset()` that meets the same conflict: `formRef.current.node.diagnostics` is `degraded` with cause `sharedConflict`, the `errors` prop is applied, and `submit()` rejects with `FormErrorCode.SubmitWhileDegraded` while the conflict stands, so conflicting data is never submitted. Writes alone do not clear the degraded state: pass a corrected `defaultValue` or `jsonSchema` and call `formRef.current.reset()`. A schema whose declarations conflict regardless of the data still fails to build and shows the load fallback.
