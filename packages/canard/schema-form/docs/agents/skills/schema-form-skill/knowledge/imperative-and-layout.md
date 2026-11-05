# Imperative Control and Custom Layout

Driving a form from outside the schema: the `FormHandle` ref and the `Form.Input`/`Form.Label`/`Form.Error`/`Form.Render` layout primitives. Full method/prop shapes live in `dist/*.d.ts` — this file covers what the types do not say.

## FormHandle

```typescript
const formRef = useRef<FormHandle<typeof schema, Value>>(null);
```

- Preserve literal schema types with `as const` when relying on schema inference; a widened schema can lose the information needed to infer a precise output.
- If a concrete `defaultValue` makes Form infer a narrower value type than the ref, supply the same explicit `Value` generic to Form and FormHandle. This keeps optional schema-derived keys and required default-value keys from disagreeing at the ref boundary.
- The ref is `null` on the first render — `await waitFor(...)` in tests before using it.

Semantics the signatures hide:

- `getErrors()` reads the current list without validating; use [validation UX](validation-ux.md) to choose when to request a verdict and handle None or a missing validator.
- Use `SetValueOption.Merge` for a partial object update; the default `Overwrite` is full replacement and drops unspecified sibling values.
- `getAttachedFilesMap()` returns a `Map<string, File[]>` keyed by the input's **standard RFC 6901 path** (`node.path`) — extended pointer syntax never appears in keys.
- `findNode(path)` / `findNodes(path)` — singular vs plural; `*` wildcards require the plural form.
- `focus(path)` / `select(path)` reach fields even while deferred by virtualization (they force-mount).
- Submit flows: prefer `useFormSubmit(formRef)` over separating validation from submission, so the validated snapshot is the value that reaches the submit callback.

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

Read the render function's exact `FieldRendererProps` from the installed declarations; use its resolved Input to retain the form's input selection and write handling.

## Gotchas

- Supplying Form children takes over the root layout; omitted inputs are not automatically filled in. If that layout also renders a branch's default children, avoid adding another Form.Input/Form.Render for the same path.
- **Paths here are standard RFC 6901 only.** `Form.Render`/`Form.Input` `path` props do not accept the extended syntax (`..`, `.`, `*`, `@`). Array items are addressed with literal indexes: `/items/0/name`.
- Rendering the same path twice renders the field twice — there is no dedup.

## Compose one data tree

One Form creates its own root, handle, error reporter and native form boundary.
Rendering another Form inside it creates a separate tree: the inner values are not inserted into the outer value and its validation/reset are not part of the outer operation.
Nested native form elements are invalid HTML and can also confuse submit handling, so nesting Forms is not the composition mechanism for nested data.
Declare nested data in the schema and use Form.Input/Form.Render or branch ChildFields to arrange that same tree.
Use sibling Forms under FormProvider for independent forms sharing default renderers, input definitions, context or validation configuration; a provider does not join their values.

Changing a `jsonSchema` or `defaultValue` prop alone keeps the current tree and values.
Reset reads the latest committed props; an equivalent schema can reuse the tree, while a different schema can replace it.
Use rebuild to discard the schema's cached blueprint analysis and replace this form's tree, and reacquire nodes after a root replacement. It does not independently invalidate the validator's identity cache.
Keep stable schema references to avoid accidental configuration churn and clarify which schema reset will load, not because every new reference discards editing state.
