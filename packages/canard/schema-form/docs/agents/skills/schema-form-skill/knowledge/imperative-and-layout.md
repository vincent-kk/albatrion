# Imperative Control and Custom Layout

Driving a form from outside the schema: the `FormHandle` ref and the `Form.Input`/`Form.Label`/`Form.Error`/`Form.Render` layout primitives. Full method/prop shapes live in `dist/*.d.ts` — this file covers what the types do not say.

## FormHandle

```typescript
const formRef = useRef<FormHandle<typeof schema, Value>>(null);
```

- Declare the schema with `as const` or type inference degrades to `any` (`troubleshooting.md`).
- **Supply the second generic (`Value`) whenever you also pass a concrete `defaultValue`**: a literal `defaultValue` makes the inferred `Value` narrow with required keys, which then mismatches `FormHandle`'s default `Value` (inferred with all-optional keys). Injecting the same `Value` into both `Form` and `FormHandle` keeps them aligned.
- The ref is `null` on the first render — `await waitFor(...)` in tests before using it.

Semantics the signatures hide:

- `getErrors()` returns the current error list without validating; `validate()` re-runs validation and resolves with the errors.
- `setValue(valueOrUpdater, option?)` accepts a functional updater and a `SetValueOption`: object partial update → `SetValueOption.Merge`; full replacement → `Overwrite` (default). The wrong option drops sibling fields or double-applies (consumer rules `onchange-semantics`).
- `getAttachedFilesMap()` returns a `Map<string, File[]>` keyed by the input's **standard RFC 6901 path** (`node.path`) — extended pointer syntax never appears in keys.
- `findNode(path)` / `findNodes(path)` — singular vs plural; `*` wildcards require the plural form.
- `focus(path)` / `select(path)` reach fields even while deferred by virtualization (they force-mount).
- Submit flows: prefer `useFormSubmit(formRef)` over hand-rolling `validate()` + submit (consumer rules `submit-via-hook`).

## Layout Surfaces

Inside `<Form>`, path-scoped primitives take over layout while the plugin still renders each field:

```tsx
<Form jsonSchema={schema}>
  <div className="row">
    <Form.Label path="/name" />
    <Form.Input path="/name" />
    <Form.Error path="/name" />
  </div>
</Form>
```

`Form.Render` is the render-prop variant for one fully custom field:

```tsx
<Form.Render path="/password">
  {({ Input, errorMessage }) => (
    <div className="password-box">
      <Input />
      {errorMessage}
    </div>
  )}
</Form.Render>
```

The render function receives `FormTypeRendererProps` (`node`, `value`, `errors`, `errorVisible`, `Input`, `ChildNodeComponents`, …) — enumerate them from `dist/*.d.ts`.

## Gotchas

- **Partial custom layout double-renders.** Using `Form.Input`/`Form.Render` for a path does NOT remove that field from schema-driven auto-rendering. A custom layout is all-or-nothing: render every field explicitly, or none.
- **Paths here are standard RFC 6901 only.** `Form.Render`/`Form.Input` `path` props do not accept the extended syntax (`..`, `.`, `*`, `@`). Array items are addressed with literal indexes: `/items/0/name`.
- Rendering the same path twice renders the field twice — there is no dedup.
