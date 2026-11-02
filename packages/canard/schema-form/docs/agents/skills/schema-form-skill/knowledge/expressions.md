# Expressions

One expression language drives every dynamic schema behavior. The same syntax — JavaScript-like expressions over JSONPointer references — is applied through the keys of the schema's `controls` object that take expressions: `active`, `visible`, `readOnly`, `disabled`, `derived`, `unsetValue`, `resetInteraction`, `unsetOnInactive` (boolean or expression). The other keys are not expressions: `default` is a literal, `watch` an array of paths, `fields` an array of `{ targets, controls }`, `injectTo` a function, `discriminator` a property name. The key list is closed and there are no aliases: an unknown key makes the blueprint build throw a schema error recognized by `isJSONSchemaError` (`UNKNOWN_GROUP_KEY`).

```typescript
conditionalField: {
  type: 'string',
  controls: { visible: '../toggle === true' },
}
```

## Path References Inside Expressions

| Reference   | Meaning                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `../field`  | Sibling (relative to the current node's parent)                                                              |
| `./field`   | Child of the current node — and inside a `oneOf`/`anyOf` branch, relative to the object that owns the branch |
| `/abs/path` | Absolute from the form root                                                                                  |
| `@.field`   | External data from the `context` prop                                                                        |

Wildcards (`*`) are NOT valid in expressions. The most common expression bug is `/toggle` where `../toggle` was intended — see `troubleshooting.md`.

## active vs visible

The single most consequential choice in this file:

- `active: false` → the field's **value is removed from form data**.
- `visible: false` → the UI is hidden but the **value is retained**.

| Situation                                                 | Choice    | Reason                                       |
| --------------------------------------------------------- | --------- | -------------------------------------------- |
| Conditional fields (discount rate, payment-method extras) | `active`  | Data must not exist when the condition fails |
| Step-by-step forms                                        | `visible` | Previous step data must survive              |
| Permission-gated fields                                   | `active`  | Data must not exist without permission       |
| Collapsible / preview UI                                  | `visible` | Keep data while hidden                       |

Choosing wrong causes silent data loss (`active` where `visible` was intended) or phantom values in submits (the reverse).

## watch and derived

- `watch` declares extra dependencies as an array of paths: `controls: { watch: ['../items'] }`. Their values reach the input as `watchValues` and join the dependency set of the node's `derived` expression. A path followed by a property access must be parenthesized: `(../items).length > 0`.
- `derived` continuously computes the field's value from its dependencies and **overwrites user edits**. For one-time propagation that stays editable, use `injectTo` instead (`inject-to.md`).
- Keep expressions to boolean/arithmetic/comparison. For list reductions, watch the source and compute inside the component:

```typescript
total: { type: 'number', controls: { watch: ['../items'] } },
// FieldInput receives watchValues[0] and computes with useMemo
```

## resetInteraction

`resetInteraction` does not change values — it resets interaction state (`edited`, `touched`). It fires when the expression turns from `false` to `true`, so drive it with a toggle-style condition rather than a constant.

## Evaluation Timing

Expressions are evaluated synchronously while a write settles, so node state (`isActive`, `isVisible`, `isReadOnly`, `isDisabled`, derived values, `watchValues`) is current as soon as `setValue()` returns, on a parent or a leaf alike. Listeners receive `UpdateControlledProperties` when the outermost write finishes; write-triggered validation runs after the frame that renders the edit (see `event-system.md`).

## Context (`@`)

The `context` prop injects external data; expressions reference it with `@`.

```tsx
<Form
  jsonSchema={schema}
  context={{ userRole: 'admin', permissions: { canEdit: true } }}
/>
```

```typescript
controls: {
  visible: '@.userRole === "admin"',
  readOnly: '(@).permissions?.canEdit !== true',
}
```

- Direct access is `@.field`. For optional chaining, wrap in parentheses: `(@).a?.b` — the parenthesized form is required and cannot be guessed.
- When `context` changes, dependent controls expressions recompute automatically — no `watch` declaration needed.
- `@` path expressions work only inside controls expressions — not in `node.find()` paths and not in `fieldInputMap` keys. (`node.find('@')` — the bare token — returns the context node itself; see `jsonpointer.md`.)

## Conditional Branches: oneOf / anyOf / allOf

Branch membership is driven by a gate: `controls.active` placed **on the branch object**, not on a property, or `controls.discriminator: '<property>'` on the host with `const`/`enum` tags on that property in each branch (compared with `===` and AND-ed with the branch's `controls.active`). Without a gate, every branch is on: all branches' fields are present, and only the validator decides which branch matches. Inside a branch, `./x` resolves against the object that owns the branch.

```typescript
const schema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'], default: 'A' },
  },
  oneOf: [
    {
      controls: { active: "./type === 'A'" },
      properties: { fieldA: { type: 'string' } },
    },
    {
      controls: { active: "./type === 'B'" },
      properties: { fieldB: { type: 'number' } },
    },
  ],
};
// type='A' → { type: 'A', fieldA: … }   (fieldB is dropped)
```

Value retention differs per construct — this is the reason to pick one over another:

| Construct | Branch activation                     | Values of inactive branches                                        |
| --------- | ------------------------------------- | ------------------------------------------------------------------ |
| `oneOf`   | Exactly one branch                    | **Removed** from form data                                         |
| `anyOf`   | Any number of branches, independently | Removed only for inactive branches; active branches coexist        |
| `allOf`   | Always applied, no condition          | Merged — `properties` combined, `required` lists merged as a union |

- Branches nest: a `oneOf` branch may contain its own `oneOf`.
- `allOf` + `anyOf`/`oneOf` compose on the same object (common shape: `allOf` for always-on fields, branches for conditional ones).

## if / then / else

Standard JSON Schema `if`/`then`/`else` gates fragments: the `then` properties belong to the shape only while the `if` guard passes, and the `else` properties only while it fails. The guard is evaluated synchronously through the validator's guard entry point; with no validator selected (no `validatorFactory` on the Form or a FormProvider, and no validator plugin), both `then` and `else` stay off.

## Circular References

Do not create derivation cycles (`a` derived from `b`, `b` derived from `a`). Neither `injectTo` nor `derived` cycles are detected: a cycle that keeps producing new values exceeds the 25-round budget and the write throws (`inject-to.md`).
