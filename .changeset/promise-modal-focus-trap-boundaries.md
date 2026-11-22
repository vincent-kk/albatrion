---
"@lerx/promise-modal": patch
---

Keep Tab and Shift+Tab inside a focus-trapped modal in three cases where focus used to leave it:

- focus on a radio of an unselected group that is not the group's entry point for that direction, such as the first radio of a leading group when pressing Shift+Tab;
- focus on a `tabindex="-1"` element, such as a dialog heading, before the first control or after the last one;
- an editor marked `contenteditable`, `contenteditable=""`, `contenteditable="plaintext-only"` or with any letter case of these values, which is now a Tab stop like `contenteditable="true"`.
