---
"@canard/schema-form-antd-mobile-plugin": patch
---

Unset sliders and range sliders no longer announce the minimum as a stored value. They announce `Not set` and hide the placeholder thumbs until focus or the first selection; mounting still leaves the form value untouched.
