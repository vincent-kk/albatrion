# FormTypeInput Selection

How the engine decides which input component renders a field, and the contract a custom input must honor. The props interface (`FormTypeInputProps`) is fully typed — enumerate it from `dist/*.d.ts`; the resolution priority list lives in SKILL.md.

## Definition Matching (`test`)

A `FormTypeInputDefinition` matches via `test`: either a partial-match object or a predicate over `FormTypeInputHint`:

```typescript
const definitions: FormTypeInputDefinition[] = [
  { test: { type: 'string', format: 'password' }, Component: PasswordInput },
  {
    test: (hint) => hint.type === 'string' && !!hint.jsonSchema.enum,
    Component: SelectInput,
  },
];
```

`FormTypeInputHint` carries `type`, `format`, `path`, `nullable`, `jsonSchema`, and `formType` — a **custom discriminator you place on the schema node** (`{ type: 'string', formType: 'markdown' }`) precisely to target it from `test`. Without knowing `formType` exists, schema-targeted custom inputs devolve into brittle path matching.

## Path Matching (`formTypeInputMap`)

```typescript
formTypeInputMap: {
  '/items/*/name': ItemNameInput,
  '/metadata/*': MetadataValueInput,
}
```

- `*` matches exactly ONE segment — and matches **any key**, not just array indexes (`/items/abc/name` matches too). `**` does not exist.
- Escape literal `/` in a property name as `~1`, `~` as `~0` — inside map keys as well (`jsonpointer.md`).

## Custom Input Contract

- `value` (controlled) XOR `defaultValue` (uncontrolled) — never both (consumer rules `form-type-input-contract`).
- Call `onChange` with the right `SetValueOption` for objects (`Merge` vs `Overwrite`).
- A custom input on a non-terminal object/array **must render `ChildNodeComponents`** — otherwise its children silently vanish:

```tsx
const ObjectLayout: FC<FormTypeInputProps<Record<string, any>>> = ({
  ChildNodeComponents,
}) => (
  <div className="grid">
    {ChildNodeComponents.map((Child, i) => (
      <Child key={i} />
    ))}
  </div>
);
```
