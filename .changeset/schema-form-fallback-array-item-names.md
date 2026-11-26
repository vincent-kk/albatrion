---
"@canard/schema-form": patch
---

Controls inside array items rendered by the default field renderer now have the item's index as their accessible name, and nothing visible changes. The default renderer shows no label for an array item, so in 0.x the built-in inputs inside array items had no accessible name.
