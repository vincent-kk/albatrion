---
"@canard/schema-form-antd-mobile-plugin": patch
---

Controls inside array items now have the item's index as their accessible name in the default field renderer, and nothing visible changes. Steppers, checkboxes, switches, sliders, radio groups, checkbox groups and nested lists in an array item referenced a title element that was never rendered, so assistive technology announced them without a name.
