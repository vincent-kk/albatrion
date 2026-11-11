---
"@canard/schema-form-antd-mobile-plugin": patch
---

Boolean and string switch inputs can now receive focus and be toggled with Space or Enter using the same values as a click. Holding an activation key toggles only once per press, Space does not scroll the page, and disabled switches cannot receive focus by click or Tab and ignore activation keys.

`formRef.current.focus(path)` now reaches boolean and string switches through their `data-focus-target` marker when used with a `@canard/schema-form` version that recognizes `data-focus-target`.
