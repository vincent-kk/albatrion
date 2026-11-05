# Imperative Control and Custom Layout

Driving a form from outside the schema: the `FormHandle` ref and the `Form.Input`/`Form.Label`/`Form.Error`/`Form.Render` layout primitives. Full method/prop shapes live in `dist/*.d.ts` — this file covers what the types do not say.

## FormHandle

```typescript
const formRef = useRef<FormHandle<typeof schema, Value>>(null);
```

- Preserve literal schema types with `as const` when relying on schema inference; a widened schema can lose the information needed to infer a precise output.
- If a concrete `defaultValue` makes Form infer a narrower value type than the ref, supply the same explicit `Value` generic to Form and FormHandle. This keeps optional schema-derived keys and required default-value keys from disagreeing at the ref boundary.
- The ref is `null` on the first render — `await waitFor(...)` in tests before using it.

`FormHandle.node` is undefined while the handle's root is unavailable. Passing `formRef.current?.node` to either observation hook is accepted, but assigning a ref does not render its consumer. A later render must pass the node before observation attaches; supply that render with a React state update, including one made from a callback ref. Ref assignment alone never starts observation. Re-read the node and render again after root replacement, since a handle follows the new root without rendering its consumer. See [observation and absent nodes](event-system.md#observation-and-absent-nodes) for cleanup and catch-up.

Semantics the signatures hide:

- `getErrors()` reads the current list without validating; use [validation UX](validation-ux.md) to choose when to request a verdict and handle None or a missing validator.
- Use `SetValueOption.Merge` for a partial object update; the default `Overwrite` is full replacement and drops unspecified sibling values.
- `getAttachedFilesMap()` returns a `Map<string, File[]>` keyed by the input's **canonical node path** (`node.path`) — query operators are not used as attachment addresses.
- `findNode(path)` returns the first match, including for a wildcard; `findNodes(path)` returns all matches.
- `focus(path)` / `select(path)` reach fields even while deferred by virtualization (they force-mount).
- Submit flows: prefer `useFormSubmit(formRef)` over separating validation from submission, so the validated snapshot is the value that reaches the submit callback.

Form `unsetOnInactive` and `disableAutomaticWrites` changes apply at commit to the next engine entry. They do not erase already-retained inactive values or replay automatic writes. Node exit policy and call-local automatic-write flags keep their precedence. A reentrant entry in an open outer chain uses that chain's settings. Child layout calls before the Form settings commit use the last committed settings. For live validation-mode transitions, see [validation UX](validation-ux.md).

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

Its `children` function is captured at mount like the other component props; see [Keep configuration stable for a mounted form](field-input.md#keep-configuration-stable-for-a-mounted-form).

Read the render function's exact `FieldRendererProps` from the installed declarations; use its resolved Input to retain the form's input selection and write handling.

## Gotchas

- Supplying Form children takes over the root layout; omitted inputs are not automatically filled in. If that layout also renders a branch's default children, avoid adding another Form.Input/Form.Render for the same path.
- `Form.Render`/`Form.Input` paths use the same extended query as `node.find`, including relative steps and wildcards; a wildcard renders the first matching node. `@` remains a controls-expression token and resolves no node. Use literal indexes such as `/items/0/name` for a particular array item.
- Rendering the same path twice renders the field twice — there is no dedup.

## Compose one data tree

One Form creates its own root, handle, error reporter and native form boundary.
Rendering another Form inside it creates a separate tree: the inner values are not inserted into the outer value and its validation/reset are not part of the outer operation.
Nested native form elements are invalid HTML and can also confuse submit handling, so nesting Forms is not the composition mechanism for nested data.
Declare nested data in the schema and use Form.Input/Form.Render or branch ChildFields to arrange that same tree.
Use sibling Forms under FormProvider for independent forms sharing default renderers, input definitions, context or validation configuration; a provider does not join their values.

Changing `jsonSchema` or `defaultValue` alone preserves the current tree and edits. Reset reads the latest committed props; an equivalent schema can reuse the tree, while a different schema can replace it. Function children receive the schema of their current tree, including before reset applies a new schema prop.
`rebuild()` builds a new tree from the current schema; re-read nodes from the handle afterwards. It reloads the committed `defaultValue`, so edits made before it are discarded; supplying a new validator does the same. It does not recompile validation for the same schema object and validator; a cached compile failure and its one retry are described in [validation failures](validation-failures.md).
Keep stable schema references to avoid unnecessary equivalence checks and clarify which schema reset will load; prop replacement alone does not discard editing state.
