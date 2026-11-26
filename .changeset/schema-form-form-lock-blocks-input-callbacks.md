---
"@canard/schema-form": major
---

Breaking change: Form `readOnly` and `disabled` now lock every field input, including its callbacks. In 0.16 a field input's `onChange` checked only the field's own locks, `onFileAttach` checked none, and `readOnly={false}` or `disabled={false}` passed to a child field, `Form.Input`, `Form.Render`, `Form.Group` or the schema's `FormTypeInputProps` re-enabled an input inside a locked Form. Now, while the Form or the field is read-only or disabled, `onChange` and `onFileAttach` leave the value and the attached files unchanged, including relays through a hybrid parent's `<Child>` or a renderer's `<Input>`, and a `readOnly` or `disabled` override on a child field, `Form.Input`, `Form.Render` or `Form.Field` can set the input's prop to `true` but not to `false`; an override sets only the prop and does not block `onChange` or `onFileAttach` by itself. `readOnly` and `disabled` inside `presentation.FieldInputProps` (0.16 `FormTypeInputProps`) set the input's prop the way an override does: `true` sets it, `false` cannot turn a lock off, and neither blocks `onChange` or `onFileAttach` by itself; to block writes from the schema, use `readOnly: true`, `controls.readOnly` or `controls.disabled`. Each call reads the lock the Form last committed: a delayed edit or attachment that arrives after locking is rejected, and one that arrives after unlocking, from the same live input, is applied. A child's layout effect that runs in the commit changing the lock already sees the new lock. Concurrent updates that have not committed keep the previous lock, while React 18 legacy roots can commit the new lock together with a Suspense fallback. Imperative writes such as `node.setValue` are not blocked, so use them when a locked Form must still change.

```tsx
// Before: a response that arrived while the Form was disabled was written.
fetchSuggestion().then(onChange);

// After: that onChange is ignored; write through the node to apply it anyway.
fetchSuggestion().then((value) => node.setValue(value));
```
