---
"@canard/schema-form": minor
---

Add `controlled` so an input that draws from `value` alone can skip the remount that follows a value it did not write. With `controlled: true` on its `FieldInputDefinition`, or `presentation.controlled: true` on a field, the input keeps its DOM, focus and local state across `setValue`, reset, `refresh(path)`, `derived` and `injectTo`, and receives the new value through its `value` prop; `remount(path)` still replaces it. This removes the mount cost of fields recalculated on every keystroke of another field.

Inputs that do not declare it behave exactly as before. Declare it only for a component that keeps no copy of the value, since a copied draft would survive a reset. When the definition and the schema disagree, `false` wins. `presentation.controlled` is reserved; a non-boolean value fails schema load.

Changing between controlled and uncontrolled modes retires the previous input's value and file callbacks before its cleanup runs, so delayed responses cannot overwrite the current form. Changing an omitted declaration to `false`, or back, preserves the input DOM, retained callbacks and pending blur behavior because both declarations use the same uncontrolled mode.
