---
"@canard/schema-form-mui-plugin": patch
---

Controls inside array items now have the item's index as their accessible name in the default field renderer, and a nested array's group has the array's name, while nothing visible changes. Array items hide their own captions, so their controls, and the group of every nested array, referenced a title element that was never rendered and assistive technology announced them without a name.
