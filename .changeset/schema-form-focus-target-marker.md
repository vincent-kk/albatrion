---
"@canard/schema-form": minor
---

Custom inputs can mark their focusable element with `data-focus-target` so `focus(path)` and array-row focus reach non-native widgets such as a focusable switch. The first marked element or native input, textarea, select, or button in DOM order wins; existing unmarked inputs keep their target. The marker does not make an element focusable or implement keyboard interaction.

Mounted-target detection treats `aria-disabled="true"` as disabled, alongside native disabled controls. Text selection still targets the first input or textarea.

A custom input can instead pass the optional `focusRef` prop to the control's React ref or to a public imperative handle with a `focus()` method. While it is connected, `focus(path)`, deferred focus and array-row focus call it. Otherwise the marker rule above applies. Destructure `focusRef` before spreading the remaining props onto a DOM element or another widget. The name is reserved, so child, layout and schema presentation overrides cannot set it.
