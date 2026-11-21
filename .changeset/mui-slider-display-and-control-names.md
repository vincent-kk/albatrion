---
"@canard/schema-form-mui-plugin": patch
---

Controls with custom labels include the visible label in their accessible names. Sliders switched to read-only show the same value as sliders mounted read-only. Empty React labels fall back to the field title, hidden fields prefer the authored accessible name, and separately rendered captions combine with the default or a custom label renderer. Accessible names follow the captions currently mounted and update when their text changes.

Fields retain an accessible name when a meaningful label has not mounted or is removed. Decorative-only labels and labels hidden with HTML or ARIA attributes use the schema’s spoken fallback. Labels hidden only with CSS retain their text as the name. Consumer-owned ARIA values are preserved. Changing a Select variant preserves its name on the replacement control.
