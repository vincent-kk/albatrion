---
"@canard/schema-form-antd5-plugin": patch
---


Unset sliders honor the default commit timing for Home and End: omitted `presentation.FieldInputProps.lazy` stores on key up, while `lazy: false` stores immediately. Selecting the minimum still stores it.
