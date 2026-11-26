---
"@canard/schema-form": patch
---

Controls inside array items rendered by the default field renderer now have the item's index as their accessible name, and nothing visible changes. The default renderer omits the label of an array item, so a radio group in an array item referenced a title element that was never rendered, and the built-in text, number, checkbox, select, date and union inputs had no name.
