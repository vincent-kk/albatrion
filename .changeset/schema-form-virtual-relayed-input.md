---
"@canard/schema-form": patch
---

A whole-value input of a virtual group that passes its own value back through an overridden `onChange` (for example `<Form.Render path="/period">` with `node.setValue(next)`) now stays mounted, as a branch array input already did. Local widget state such as focus or an open picker survives the edit on React 18 and 19; a different tuple written from outside still refreshes the input.
