# Expressions

One expression language drives every dynamic schema behavior. The same syntax — JavaScript-like expressions over JSONPointer references — is applied through different schema keys: `computed.{watch, active, visible, readOnly, disabled, pristine, derived, if}`. Each key has a shorthand alias that lives directly on the schema node: `&watch`, `&active`, `&visible`, `&readOnly`, `&disabled`, `&pristine`, `&derived`, `&if` (all eight — the alias set mirrors the `computed` keys exactly).

```typescript
conditionalField: {
  type: 'string',
  computed: { visible: '../toggle === true' },
}
// identical:
conditionalField: {
  type: 'string',
  '&visible': '../toggle === true',
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

- `watch` declares explicit dependencies: `'&watch': '../items'` or an array. Needed when the expression's dependencies are not plain path reads (e.g. `../items.length > 0`).
- `derived` continuously computes the field's value from its dependencies and **overwrites user edits**. For one-time propagation that stays editable, use `injectTo` instead (`inject-to.md`).
- Keep expressions to boolean/arithmetic/comparison. For list reductions, watch the source and compute inside the component:

```typescript
total: { type: 'number', '&watch': '../items' },
// FormTypeInput receives watchValues[0] and computes with useMemo
```

## pristine

`pristine` does not change values — it resets interaction state (`dirty`, `touched`). It keeps firing for as long as the expression stays `true`, so drive it with a toggle-style condition rather than a constant.

## Evaluation Timing

Expressions are evaluated on the `UpdateComputedProperties` event, in a **microtask after** the value change. A synchronous read immediately after `setValue()` sees stale computed state. Exception: calling `setValue()` directly on a parent object/array node updates its computed properties synchronously (see `event-system.md`).

## Context (`@`)

The `context` prop injects external data; expressions reference it with `@`.

```tsx
<Form
  jsonSchema={schema}
  context={{ userRole: 'admin', permissions: { canEdit: true } }}
/>
```

```typescript
computed: {
  visible: '@.userRole === "admin"',
  readOnly: '(@).permissions?.canEdit !== true',
}
```

- Direct access is `@.field`. For optional chaining, wrap in parentheses: `(@).a?.b` — the parenthesized form is required and cannot be guessed.
- When `context` changes, dependent computed properties recompute automatically — no `watch` declaration needed.
- `@` path expressions work only inside computed expressions — not in `node.find()` paths and not in `formTypeInputMap` keys. (`node.find('@')` — the bare token — returns the context node itself; see `jsonpointer.md`.)

## Conditional Branches: oneOf / anyOf / allOf

Branch membership is driven by `&if` (alias of `computed.if`) placed **on the branch object**, not on a property. Inside a branch, `./x` resolves against the object that owns the branch.

```typescript
const schema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'], default: 'A' },
  },
  oneOf: [
    { '&if': "./type === 'A'", properties: { fieldA: { type: 'string' } } },
    { '&if': "./type === 'B'", properties: { fieldB: { type: 'number' } } },
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

Standard JSON Schema `if`/`then`/`else` is supported with a narrower meaning than branches: it drives **conditional validation**, not field addition/removal. The `if.properties` conditions (matched by `const`/`enum` values) decide which `then.required` / `else.required` lists apply — fields listed there become conditionally required. It never mutates branch values; use `oneOf`/`anyOf` for that.

## Circular References

Do not create derivation cycles (`a` derived from `b`, `b` derived from `a`). For `injectTo` cycles, the engine detects and blocks the closing hop (`inject-to.md`); `derived` cycles are the schema author's responsibility.
