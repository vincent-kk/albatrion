---
"@canard/schema-form-antd-mobile-plugin": patch
---

Controls inside array items now have the item's index as their accessible name in the default field renderer, and nothing visible changes. In 0.x steppers, checkboxes, switches, sliders, radio groups, checkbox groups and nested lists in an array item had no accessible name. The README now describes these hidden titles and states that a text input, password input or text area in an array item still has no accessible name, because Ant Design Mobile forwards no labelling reference to the native element.
