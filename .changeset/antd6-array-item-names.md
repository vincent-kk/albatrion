---
"@canard/schema-form-antd6-plugin": patch
---

Controls inside array items that hold a single value, such as text inputs, number inputs, checkboxes, sliders and radio groups, now have the item's index as their accessible name in the default field renderer, and nothing visible changes. In 0.x an array item showed no label, so assistive technology announced these controls without a name. Array items that are themselves arrays or objects keep their visible index legend.
