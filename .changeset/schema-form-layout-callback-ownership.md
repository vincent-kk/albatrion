---
"@canard/schema-form": major
---

Breaking change: `Form.Input`, `Form.Render` and `Form.Field` (0.16 `Form.Group`) no longer accept `onChange` or `onFileAttach`. In 0.16 these props replaced the library's change and attachment handlers, which skipped the library's value storage, interaction tracking and attachment registration; they are now typed `never` and the field ignores them.

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
