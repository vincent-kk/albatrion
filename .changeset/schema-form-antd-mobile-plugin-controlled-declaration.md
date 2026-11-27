---
"@canard/schema-form-antd-mobile-plugin": minor
---

The plugin's checkbox, switch and stepper inputs, which draw from `value`, now declare `controlled: true`. With a `@canard/schema-form` release that reads the declaration they are no longer remounted when their value is written from outside (`setValue`, reset, `derived`, `injectTo`); they keep their DOM and focus and show the new value. With an earlier core release the declaration is ignored and nothing changes.
