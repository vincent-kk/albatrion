---
"@canard/schema-form-mui-plugin": patch
---

Controls with custom labels include the visible label in their accessible names. Sliders switched to read-only show the same value as sliders mounted read-only. Empty React labels fall back to the field title, hidden fields prefer the authored accessible name, and separately rendered captions combine with the default or a custom label renderer. Accessible names follow the captions currently mounted and update when their text changes.

Fields retain an accessible name when a visible label has not mounted or is removed. The current visible label takes precedence over the schema’s spoken fallback. Changing a Select variant preserves its name on the replacement control.
