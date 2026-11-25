---
"@canard/schema-form": patch
---

A throwing controls expression reached at mount, by a `context` change, or by a reset the Form runs on commit (after a `validatorFactory` change, or after props change in the same update as `reset()`) is now reported through `onError` and `reportError` and leaves the form mounted and degraded; 0.16 replaced the form with its error fallback at mount and on a `context` change. The `errors` prop given at mount is applied even when the mount reports such a failure and leaves the form degraded.
