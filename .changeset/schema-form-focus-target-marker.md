---
"@canard/schema-form": minor
"@canard/schema-form-antd5-plugin": patch
"@canard/schema-form-antd6-plugin": patch
"@canard/schema-form-mui-plugin": patch
---

The optional `focusRef` prop lets custom inputs choose the control that `focus(path)` and deferred focus call. Pass it to the control's React ref or connect a public imperative handle with a `focus()` method. A DOM anchor must be a connected element in the same document as the input container. When an empty array slot is filled, automatic focus looks for an anchor on the new item's input within that row.

Without an eligible anchor, focus falls back to the first marked element or native input, textarea, select, or button in DOM order within its scope. Custom inputs can use `data-focus-target` on an already focusable element, such as a focusable switch. The marker does not make an element focusable or implement keyboard interaction. Mounted-target detection treats `aria-disabled="true"` as disabled, alongside native disabled controls. Text selection still targets the first input or textarea.

Destructure `focusRef` before spreading the remaining props onto a DOM element or another widget. The name is reserved, so child, layout and schema presentation overrides cannot set it.

With the Ant Design 5 or 6 plugin, `focus(path)` reaches the editable slider thumb. With the MUI plugin, it reaches the visible enum selector, the URI address input, or the editable sections of a date, month, or time picker. Install `@canard/schema-form` 1.0.0 or later within the 1.x release line with these plugin versions.
