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

## Skip Remounts for a Controlled Input (`controlled`)

A value the input did not write itself (`setValue`, reset, `refresh(path)`, `derived`, `injectTo`, array operations) remounts the input, which hands it a new `defaultValue`. That is correct for any component, and costs a mount each time. A component that draws from `value` on every render does not need the remount; declare `controlled: true` and it keeps its DOM, focus and local state and receives the new value through `value`.

```tsx
const valueReading: FieldInputDefinition[] = [
  { test: { format: 'legacy' }, Component: DefaultValueInput },
  { test: { format: 'live' }, Component: ValueInput, controlled: true },
];
```

- Declare it as an optimization where it pays: a field recalculated by `derived` or `injectTo` on every keystroke of another field, or a widget that is expensive to mount.
- Declare it only when the component keeps no copy of the value. A draft copied into state or a ref would survive a reset, and a callback the input issued before a caller write is still accepted. `formRef.current?.remount(path)` still replaces the input.
- Leave it out for a component that reads `defaultValue`; nothing else is required of it.
- A schema declares the same thing per field with `presentation.controlled`; that is the only place to declare it for an inline `presentation.FieldInput`, a `fieldInputMap` component, or a `FieldInput` passed to `Form.Input`, `Form.Field` or `Form.Render`. `false` on either side wins, so a schema can switch a controlled definition back to remounting for one field.
- A direct input write preserves the emitting input. For a parent override, use the [hybrid parent contract](#hybrid-parents-write-child-values-through-the-parent).

## Custom Input Contract

- Read either `value` or `defaultValue`, never both; mixing them gives React two competing value owners.
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

## Hybrid parents: write child values through the parent

A hybrid branch renders `ChildFields` and overrides each child's `onChange` to write the parent value. Use a functional parent update so two children emitting during one event or batch preserve both values; spreading the parent's rendered `value` can overwrite an earlier edit from that same event. Pass this schema to `Form`:

```tsx
const HybridObject = ({
  ChildFields,
  onChange,
}: FieldInputProps<Record<string, unknown>>) => (
  <>
    {ChildFields.map((Child) => (
      <Child
        key={Child.key}
        onChange={(input) =>
          onChange((prev) => ({ ...prev, [Child.field]: input }))
        }
      />
    ))}
  </>
);

/** Keep the inline object input nonterminal so it can render its children. */
const hybridSchema: JSONSchema = {
  type: 'object',
  options: { terminal: false },
  presentation: { FieldInput: HybridObject },
  properties: {
    first: { type: 'string' },
    last: { type: 'string' },
  },
};
```

The overridden child callback receives the **evaluated value**, never the updater function the child may emit. Store `input` directly. The parent is still free to call its own `onChange` with an updater, as above. Keep `options.terminal: false` when an object or array uses `presentation.FieldInput`, so it has children to render.

A synchronous parent commit preserves the emitting child's DOM, focus and local draft when its final value is exactly what it emitted. Primitive values compare by value; objects and arrays must keep the same reference. Sibling callbacks use the current parent callback. Other changed children still receive their own updates.

For an input without a controlled declaration, these limits apply:

- **The parent transforms the value, or a `derived`/`injectTo` rule changes it:** the final value differs, so the child remounts to display it. Use an input that draws from `value` and declare `controlled: true` on its definition, or `presentation.controlled: true` on its schema ([controlled inputs](#skip-remounts-for-a-controlled-input-controlled)). The declaration alone does not make a `defaultValue` input controlled.
- **The callback writes later, for example after a debounce:** that later write remounts the child. Commit the input value synchronously and debounce a separate side effect, or use a value-driven controlled input when delayed display is intentional.
- **The parent copies an emitted object or array:** a new reference can remount the child even when its contents are equal. Preserve the emitted reference when no transformation is needed; otherwise use a controlled input.
- **The parent rejects the input by making no write:** the node keeps its previous value, but the undeclared input's typed draft stays on screen. Rejection alone does not restore the displayed value; explicitly refresh it if that is the desired behavior.

Changing only `value` or `required` on a `Child` is not an independent update channel. The rendered value and required state follow the node; a parent-only change is not delivered separately from the node's value. Write values through `onChange` and express required state through the schema or `controls.required`.

## Keep configuration stable for a mounted form

Use immutable definitions and maps, replacing their references when configuration changes. Form and FormProvider apply renderer, formatter and input-definition changes after mount; Form also applies input-map changes. Keep references stable when unchanged to avoid repeated normalization and selection.
Input selection preserves node values, interaction and external errors. The same selected raw component reuses its boundary adapter across map, definition and inline sources. Its DOM survives only while its owning ancestors also stay unchanged. Replacing a parent input recreates descendant DOM and uncommitted drafts, even when child components are unchanged; values, interaction state and errors remain in the nodes. An unrelated map key therefore remounts nothing. A renderer replacement rebuilds the UI subtree that renderer owns, while a formatter change reformats current errors without remounting healthy input DOM. A renderer replacement replaces its error boundary; a formatter replacement retries only a failed boundary. Callbacks retained from replaced or unmounted inputs cannot write values or files, including after A → B → A selection.
An invalid live map reports `FormTypeInputMap` with origin `load` once and retains the last valid map and tree. Replacing it with a valid map also recovers an initial load fallback without remounting.

`Form.Field`, `Form.Render` and `Form.Input` retain their own component props at mount: `FieldInput`, `FieldRenderer` and `Wrapper` on `Form.Field`; `children`, `FieldInput` and `Wrapper` on `Form.Render`; `FieldInput` on `Form.Input`. Read changing data through the received context or a hook inside those components, or replace that element's key when its local component configuration must change.

`context` has a different role: it is live application data and is compared by content before propagation.
An equal fresh plain object retains the snapshot; changed content propagates to the current tree and can affect controls and validation freshness without rebuilding it.
Keep callbacks and identity-sensitive values inside context stable when they have not changed, so new identities do not create artificial context changes.
This recommendation avoids unnecessary renders/comparisons and unintended semantic updates; it is not a claim that every new prop reference destroys state.
