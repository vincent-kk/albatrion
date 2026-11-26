---
"@canard/schema-form-antd5-plugin": patch
---

Controls inside array items that hold a single value, such as text inputs, number inputs, checkboxes, sliders and radio groups, now have the item's index as their accessible name in the default field renderer, and nothing visible changes. They referenced a title element that was never rendered, so assistive technology announced them without a name. Array items that are themselves arrays or objects keep their visible index legend.
