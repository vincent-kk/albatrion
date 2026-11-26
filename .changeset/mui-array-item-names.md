---
"@canard/schema-form-mui-plugin": patch
---

Controls inside array items now have the item's index as their accessible name in the default field renderer, and a nested array's group has the array's name, while nothing visible changes. Array items hide their own captions, so in 0.x assistive technology announced their controls, and the group of every nested array, without a name.
