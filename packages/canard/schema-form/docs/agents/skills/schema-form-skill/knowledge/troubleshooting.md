# Troubleshooting

Symptom → cause → fix, grouped by subsystem.

## Plugins

**UI renders wrong or plain** — plugins registered in the wrong order or too late. Register UI plugin first, then validator, both before the first `<Form>` render (`plugin-system.md`).

## fieldInputMap

A `/items/**/name` entry never matches — the double-star wildcard is not a thing. `*` matches exactly ONE segment (array indexes and dynamic object keys alike):

```typescript
fieldInputMap: {
  '/items/*/name': ItemNameInput,   // ✅
  '/items/**/name': ItemNameInput,  // ❌ never matches
}
```

## Controls Expressions

**`controls.active` / `controls.visible` not reacting** — the most common cause is path syntax: `/toggle` is an absolute path from the root; a sibling is `../toggle`.

**Expression over a collection never true** — a path followed by a property access must be parenthesized: `controls: { active: '(../items).length > 0' }`. Without the parentheses, `../items.length` is read as a property named `items.length`.

**`derived` yields `NaN`/garbage on partial input** — guard operands: `'(../price ?? 0) * (../quantity ?? 1)'`.

**Conditional field disappears after `setValue` on the parent** — intended behavior, not a bug. A parent-level `setValue()` applies conditional filtering and drops keys whose branch is inactive; a child-level `setValue()` bypasses the filter:

```typescript
objectNode.setValue({ category: 'movie', price: 200 }); // price dropped if its branch is inactive
objectNode.find('./price')?.setValue(999); // bypasses filtering
```

## Errors Not Displayed

Errors exist (`getErrors()` shows them) but the UI is silent:

1. Display policy — set `showError` on `<Form>` (`boolean | ShowError` enum; never a string) or call `formRef.current?.showError(true)`. See `validation-and-state.md`.
2. Custom inputs must render behind `errorVisible` — an input ignoring it never shows anything.

## Composition (oneOf / anyOf)

**A branch `type` seems ignored** — the parent's own `type` decides the node's kind; a branch `type` that differs is not rejected and only the validator applies it. Omit the branch `type` or repeat the parent's.

**`SHARED_NODE_KIND_CONFLICT`** — an ungated branch (no `controls.active`, not selected by `controls.discriminator`) redeclares a parent property with a `type` outside the parent's, or ungated branches disagree on a property's kind. Narrow the branch `type` to the parent's, drop it, or gate the branch.

**`DISCRIMINATOR_MISMATCH` / `EMPTY_ENUM_INTERSECTION`** — discriminator tags differ in kind across branches or overlap (`DISCRIMINATOR_MISMATCH`), or a tag's `const`/`enum` values have nothing in common (`EMPTY_ENUM_INTERSECTION`). Typed tags (`{ type: 'string', const: 'cat' }`) are fine.

**A nullable object fails validation while `null`** (no warning is printed) — branches without `type` all match `null`, and `oneOf` wants exactly one. Add one `{ type: 'null' }` branch and `type: 'object'` on the object branches, or use `anyOf` (`nullable-branch-nodes.md`).

**Warning `NULL_BRANCH_IGNORED_FOR_FORM`** — a `{ type: 'null' }` branch carries a condition or `properties`. The form reads neither; keep the null branch bare.

## Arrays

**Too many items, or too few** — the core neither blocks nor fills: `push()` always appends and `minItems` creates no items. Validation reports both limits; the built-in array input draws empty slots up to `minItems` in the UI only, writing nothing until the user types into one, and hides its add button at `maxItems`. A custom input that must enforce a range disables its own add/remove controls from `node.jsonSchema` and `node.children.length` (`arrays-and-scale.md`).

**Large array is slow** — keep primitives on the terminal strategy, batch mutations through one `setValue`, and consider the `virtualization` prop (`arrays-and-scale.md`).

## TypeScript

**`getValue()` returns `any`** — the schema literal needs `as const`; then type `useRef<FormHandle<typeof schema>>`. Passing a concrete `defaultValue` additionally requires injecting the `Value` generic (`imperative-and-layout.md`).

## Tests

- Register the validator plugin once in the test setup file, before any render — not per test.
- `formRef.current` is `null` on first render — `await waitFor(() => expect(formRef.current).not.toBeNull())` before driving it.
- Values and controls state settle synchronously inside `setValue()`; validation results arrive after a microtask and the DOM after React re-renders, so use testing-library `waitFor` before asserting on errors or rendered output (`event-system.md`).
