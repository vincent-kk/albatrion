---
"@canard/schema-form": major
---

Breaking change: `Form.Input`, `Form.Render`, and `Form.Field` no longer accept `onChange` or `onFileAttach`. Untyped callers cannot replace the library's value storage, interaction tracking, or attachment registration with these props.

Use the Form callback to observe committed values. To take ownership of a write, relay through a hybrid parent's `<Child onChange>` or a renderer's `<Input onChange>`; their input-write semantics remain intact. File relays likewise belong on Child or renderer Input.

```tsx
// Before: the layout prop replaced the library's change handler.
<Form.Input path="/name" onChange={saveName} />

// After: a renderer explicitly owns the relay and writes the node value.
<Form.Render path="/name">
  {({ Input, node }) => (
    <Input onChange={(value) => { node.setValue(value); saveName(value); }} />
  )}
</Form.Render>
```

Form `readOnly` and `disabled` now also block input callbacks, not only the props they render. In 0.16 a field input's `onChange` checked only the field's own locks and `onFileAttach` checked none. Now, while the Form or the field is read-only or disabled, `onChange` and `onFileAttach` leave the value and the attached files unchanged, including relays through a hybrid parent's `<Child>` or a renderer's `<Input>`. Each call reads the lock the Form last committed: a delayed edit or attachment that arrives after locking is rejected, and one that arrives after unlocking, from the same live input, is applied. A child's layout effect that runs in the commit changing the lock already sees the new lock. Concurrent updates that have not committed keep the previous lock, while React 18 legacy roots can commit the new lock together with a Suspense fallback. Imperative writes such as `node.setValue` are not blocked, so use them when a locked Form must still change.

```tsx
// Before: a response that arrived while the Form was disabled was written.
fetchSuggestion().then(onChange);

// After: that onChange is ignored; write through the node to apply it anyway.
fetchSuggestion().then((value) => node.setValue(value));
```
