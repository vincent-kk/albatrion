# Schema-Form Consumer Rules

These rules apply when authoring application code that imports from `@canard/schema-form`.
They do not apply to plugin authoring (see the `create-canard-plugin` skill) or to work inside the library itself.
Rules are perspective-level. For concrete API shapes, defaults, and edge behavior, invoke the `schema-form-skill` skill; §3 lists the topics that trigger that invocation.

---

## 1. Mental Model

### schema-is-source-of-truth

- The JSON Schema is the contract. The node tree is derived from the schema, and the UI is a projection of the node tree.
- Design the schema first. Do not design a UI and retrofit a schema onto it.

### node-tree-owns-state

- Form state lives in nodes, not in external React state.
- Reads and writes go through `FormHandle`, `useSchemaNode*` hooks, or `onChange` inside a `FormTypeInput`. Mirroring values into a parallel `useState` produces drift.

### public-api-only

- Import only from the `@canard/schema-form` root entry.
- Deep imports (`@canard/schema-form/dist/**`, `/src/**`), access to internal `__method__`/`__field__` members, and direct mutation of `PluginManager` are forbidden.

### skill-for-depth

- This document is perspective-level. Before writing code in an unfamiliar area, invoke the `schema-form-skill` skill and let it surface the concrete references.
- Do not guess API shapes from memory.

---

## 2. Composition Topology

### single-form-root

- One `<Form>` owns one schema subtree. Nested `<Form>` is not a composition mechanism.
- For shared defaults across multiple forms, use `FormProvider`. For nested data, use nested schemas.

### three-render-surfaces

Decide which surface owns each piece of UI before writing it.

| Surface | How it is produced | When to use |
|---|---|---|
| Schema-driven auto-render | `<Form jsonSchema={…} />` | Default. Plugin resolves a `FormTypeInput` per node. |
| Path-scoped slots | `<Form.Input path>`, `<Form.Label path>`, `<Form.Error path>`, `<Form.Render path>` inside `<Form>` | Custom layout that still delegates field rendering to the plugin. |
| Per-field custom input | `FormTypeInput` on the schema, `formTypeInputMap`, or `formTypeInputDefinitions` | A field needs a UI the plugin does not provide. |

Mixing surfaces on the same path (e.g. `<Form.Input path="/x" />` inside a `<Form>` that already auto-renders `/x`) causes duplicate rendering. Pick one.

### terminal-is-a-contract

- On object/array schemas, `terminal: true` means the `FormTypeInput` owns the whole subtree value; `ChildNodeComponents` is not used.
- `terminal: false` or unset means children render via `ChildNodeComponents`.
- Never mix both modes in a single node.

---

## 3. Decision Routing

When the task touches any of these areas, invoke the `schema-form-skill` skill.
The skill owns the concrete API shapes, defaults, and edge behavior; let it choose which of its own knowledge slices to read.
Do not attempt to answer these from memory.

- Form layout with `Form.Render` / `Form.Input` / `Form.Label` / `Form.Error`
- A custom `FormTypeInput` or `FormTypeInputMap` entry
- Dynamic `active` / `visible` / `readOnly` / `disabled` / `derived` / `watch`
- Branching with `oneOf` / `anyOf` / `allOf` / `if-then-else` / `&if`
- Error display policy (`ShowError`, `dirty` / `touched`, messages)
- Validation (AJV plugin, `ValidationMode`, `onValidate`, custom validator)
- Imperative control — submit, reset, focus, `setValue` from outside
- Array manipulation (push, remove, clear, large lists)
- Multi-field virtual widgets (date range, paired fields)
- Path expressions in schema / `formTypeInputMap` / `node.find`
- External data accessed in expressions via `@`
- Copying initial value between fields
- Subscribing to node events
- Slow renders, large forms, batching
- Unexpected value drop, stale error, missing child
- Tests for a form

If the task straddles several items, state the scope to the skill and let it bundle the relevant knowledge.

---

## 4. Invariants

Each rule is a single hard requirement. Violations typically produce silent bugs, not compile errors.

### register-plugin-once

- `registerPlugin(plugin)` MUST run once during app bootstrap, before the first `<Form>` renders. UI plugins register before validator plugins.
- Why: `FormTypeInput` resolution is settled at mount; late or repeated registration causes nondeterministic picks.

### stable-schema-reference

- `jsonSchema` MUST have a stable reference. Prefer a module-level constant declared with `as const satisfies JsonSchema`. When the shape must vary, wrap in `useMemo` with a complete dependency list.
- Why: a new reference rebuilds the node tree and drops in-progress state.

### stable-definitions

- `formTypeInputDefinitions`, `formTypeInputMap`, `context`, and any component passed by prop MUST be defined outside render or memoized.
- Why: new references on each render invalidate internal caches and re-resolve inputs every tick.

### form-type-input-contract

- A custom `FormTypeInput` MUST honor `FormTypeInputProps`:
  - Use `value` (controlled) OR `defaultValue` (uncontrolled), never both.
  - Call `onChange` with the correct `SetValueOption`.
  - Render children via `ChildNodeComponents` whenever the node is not `terminal`.
- Why: violating any of these causes silent value loss or infinite re-render.

### onchange-semantics

- Object partial updates → `SetValueOption.Merge`. Full replacement → `SetValueOption.Overwrite`.
- Arrays → pass the whole new array, or use `node.push` / `node.remove` / `node.clear`.
- Why: the wrong option drops sibling fields or double-applies a mutation.

### jsonpointer-is-context-sensitive

- `formTypeInputMap` supports absolute paths and `*`.
- `computed` expressions support absolute and relative paths plus `@` (context reference).
- `node.find()` supports absolute and relative paths.
- Escape `~` as `~0` and `/` as `~1`.
- Why: a token valid in one context silently fails to match in another.

### conditional-choice

- `oneOf` → mutually exclusive; inactive branch values are dropped.
- `anyOf` → non-exclusive; multiple branches coexist.
- `allOf` → merged schemas always applied.
- `if/then/else` → conditional validation and `required` rules, not branch value mutation.
- Why: the four constructs differ in value retention; misuse produces phantom or lost data.

### active-vs-visible

- `computed.active: false` removes the value from form data.
- `computed.visible: false` hides UI but keeps the value.
- Why: choosing the wrong one causes silent data loss (active used where visible was intended) or phantom state (vice versa).

### no-complex-computed

- Keep `computed` expressions limited to boolean, arithmetic, and comparison. Move list reductions and aggregations into a component reading `watchValues`.
- Why: `computed` is evaluated on every dependency tick; complex expressions become hotspots.

### validation-mode-explicit

- State `validationMode` on `<Form>` explicitly. `ValidationMode.OnChange | ValidationMode.OnRequest` is the typical expectation.
- Why: implicit defaults make the timing of error surfacing ambiguous across versions.

### error-display-via-policy

- Control error visibility through the `showError` prop / `ShowError` enum and the node's `dirty` / `touched` state. Do not sprinkle `errors.length > 0` checks across individual inputs.
- Why: the policy is centralized; reinventing it causes inconsistent UX and duplicated logic.

### form-handle-typed

- `useRef<FormHandle<typeof schema, Value>>(null)` — always supply both generics.
- Why: without them, `getValue` and `setValue` lose type safety and degrade to `unknown`.

### submit-via-hook

- Use `useFormSubmit(formRef)` for submit flows. It bundles validation, pending state, and `ValidationError` propagation.
- Why: hand-rolling `validate()` then `onSubmit` skips the error unification the hook provides.

### subscribe-with-cleanup

- Every `node.subscribe(fn)` call MUST return its unsubscribe from the `useEffect` cleanup.
- Why: each remount without cleanup leaks a listener; cascading remounts become O(n²).

---

## 5. Red Flags

Reject these on sight.

- `jsonSchema` literal created inside a render function → violates `stable-schema-reference`.
- `import` from `@canard/schema-form/dist/**` or any subpath → violates `public-api-only`.
- Mirroring the form value into a parallel `useState` → violates `node-tree-owns-state`.
- `<Form.Input path="/x" />` inside a `<Form>` that already auto-renders `/x` → duplicate render; drop one surface.
- `computed: { visible: 'A', active: 'B' }` on the same field with overlapping conditions → pick one based on value-retention intent.
- A custom `FormTypeInput` that reads `value` and also sets `defaultValue` on the underlying DOM input → pick controlled or uncontrolled, not both.
- Per-input `if (errors.length > 0)` branches → use `showError` / `errorVisible` instead.
- `for` loop calling `arrayNode.push` N times → batch via a single `setValue`.

---

## 6. Extending the Knowledge

- For plugin authoring (UI renderer, validator, `FormTypeInputDefinition` bundle) → invoke the `create-canard-plugin` or `ui-plugin-guidelines` skill. Not covered here.
- For topics outside the `schema-form-skill` skill's coverage → consult `packages/canard/schema-form/docs/QUICK_REFERENCE.md` or `docs/en/SPECIFICATION.md`.
- For package-internal structural rules (FCA) → see `.claude/rules/filid_fca-policy.md`. Scope is disjoint: this document is for consumers.
