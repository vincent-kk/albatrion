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

- `*` matches exactly ONE segment — and matches **any key**, not just array indexes (`/items/abc/name` matches too). A key containing `**` is not supported (`troubleshooting.md` describes the symptom), so list each depth with `*`.
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

Register this input through `fieldInputMap` or a field input definition that matches the object schema. A `presentation.FieldInput` on an object schema makes the object terminal unless the schema also sets `options.terminal: false`, and `ChildFields` is then empty.

## Keep configuration stable for a mounted form

Use immutable definitions and maps, replacing their references when configuration changes. Form and FormProvider apply renderer, formatter and input-definition changes after mount; Form also applies input-map changes. Keep references stable when unchanged to avoid repeated normalization and selection.
Input selection preserves node values, interaction and external errors. The same selected raw component retains its boundary adapter and DOM across map, definition and inline sources; only a changed component remounts. An unrelated map key therefore remounts nothing. A renderer replacement rebuilds the UI subtree that renderer owns, while a formatter change only reformats current errors.
An invalid live map reports `FormTypeInputMap` with origin `load` once and retains the last valid map and tree. Replacing it with a valid map also recovers an initial load fallback without remounting.

`Form.Field`, `Form.Render` and `Form.Input` retain their own component props at mount: `FieldInput`, `FieldRenderer` and `Wrapper` on `Form.Field`; `children`, `FieldInput` and `Wrapper` on `Form.Render`; `FieldInput` on `Form.Input`. Read changing data through the received context or a hook inside those components, or replace that element's key when its local component configuration must change.

`context` has a different role: it is live application data and is compared by content before propagation.
An equal fresh plain object retains the snapshot; changed content propagates to the current tree and can affect controls and validation freshness without rebuilding it.
Keep callbacks and identity-sensitive values inside context stable when they have not changed, so new identities do not create artificial context changes.
This recommendation avoids unnecessary renders/comparisons and unintended semantic updates; it is not a claim that every new prop reference destroys state.
