---
"@canard/schema-form-antd5-plugin": patch
---

The time range input's `presentation.FieldInputProps.minimum` and `maximum` now limit the selectable hours and minutes instead of disabling every calendar day, which had made the input unusable. Limits are read as times of day in the viewer's time zone, and a `minimum` later than `maximum` allows the window that wraps past midnight.
