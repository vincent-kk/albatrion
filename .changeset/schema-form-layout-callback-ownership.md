---
"@canard/schema-form": minor
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
