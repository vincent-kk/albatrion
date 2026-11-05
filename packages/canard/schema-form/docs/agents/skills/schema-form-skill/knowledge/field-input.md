# FieldInput Selection

How the engine decides which input component renders a field, and the contract a custom input must honor. The props interface (`FieldInputProps`) is fully typed — enumerate it from `dist/*.d.ts`; the resolution priority list lives in SKILL.md.

## Definition Matching (`test`)

A `FieldInputDefinition` matches via `test`: either a partial-match object or a predicate over `FieldInputHint`:

```typescript
const definitions: FieldInputDefinition[] = [
  { test: { type: 'string', format: 'password' }, Component: PasswordInput },
  {
    test: (hint) => hint.type === 'string' && !!hint.jsonSchema.enum,
    Component: SelectInput,
  },
];
```

`FieldInputHint` carries `type`, `format`, `path`, `nullable`, `jsonSchema`, and `inputType` — a **custom discriminator you place under the schema node's `presentation`** (`{ type: 'string', presentation: { inputType: 'markdown' } }`) precisely to target it from `test`. Without knowing `inputType` exists, schema-targeted custom inputs devolve into brittle path matching.

## Path Matching (`fieldInputMap`)

```typescript
fieldInputMap: {
  '/items/*/name': ItemNameInput,
  '/metadata/*': MetadataValueInput,
}
```

- `*` matches exactly ONE segment — and matches **any key**, not just array indexes (`/items/abc/name` matches too). A key containing `**` is not supported: the form throws `Invalid key pattern in FieldInputMap` when it mounts, so list each depth with `*`.
- Escape literal `/` in a property name as `~1`, `~` as `~0` — inside map keys as well (`jsonpointer.md`).

## Custom Input Contract

- Use either `value` for a controlled input or `defaultValue` for an uncontrolled input; mixing them gives React two competing value owners.
- Call `onChange` with the right `SetValueOption` for objects (`Merge` vs `Overwrite`).
- A custom input on a non-terminal object/array **must render `ChildFields`** — otherwise its children silently vanish:

```tsx
const ObjectLayout: FC<FieldInputProps<Record<string, any>>> = ({
  ChildFields,
}) => (
  <div className="grid">
    {ChildFields.map((Child, i) => (
      <Child key={i} />
    ))}
  </div>
);
```

Register this input through `fieldInputMap` or a field input definition that matches the object schema. A `presentation.FieldInput` on an object schema makes the object terminal, and `ChildFields` is then empty.

## Keep configuration stable for a mounted form

Define input definitions, input maps and renderer components outside render, or memoize their intended initial configuration.
Form captures `fieldInputDefinitions` and `fieldInputMap` at mount and normalizes that captured configuration.
Its renderer components and `formatError` are also captured at mount; replacing these prop references does not re-resolve the inputs or rebuild the node tree.
`Form.Field`, `Form.Render` and `Form.Input` capture their component props at mount the same way: `FieldInput`, `FieldRenderer` and `Wrapper` on `Form.Field`; `children`, `FieldInput` and `Wrapper` on `Form.Render`; `FieldInput` on `Form.Input`. Their other props are read on every render. A `Form.Render` children function or a `FieldRenderer` keeps the closure it had at mount, so component state it closes over stays at its mount value: read changing values from the `context` prop it receives (Form's `context`) or through a hook inside it, or give the element a new `key` to replace the component.
FormProvider likewise captures its definitions and renderers. A fresh definition array can make React render the Form again, but is not a supported way to install a different input selection.
Remount the owner of a captured configuration to replace it: Form for local configuration, or FormProvider and its forms for shared defaults. Account for the new trees and interaction state.
Do not mutate the captured objects in place: an initial-configuration contract is not a reactive mutation channel.

`context` has a different role: it is live application data and is compared by content before propagation.
An equal fresh plain object retains the snapshot; changed content propagates to the current tree and can affect controls and validation freshness without rebuilding it.
Keep callbacks and identity-sensitive values inside context stable when they have not changed, so new identities do not create artificial context changes.
This recommendation avoids unnecessary renders/comparisons and unintended semantic updates; it is not a claim that every new prop reference destroys state.
