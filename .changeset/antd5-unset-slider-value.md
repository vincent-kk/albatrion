---
"@canard/schema-form-antd5-plugin": patch
---

Unset sliders announce `Not set` and hide placeholder thumbs until focus or the first committed selection. The first selection at the minimum is stored even when the library skips its ordinary change callback; mounting leaves the form value untouched.
