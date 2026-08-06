# Troubleshooting

Symptom → cause → fix, grouped by subsystem.

## Plugins

**UI renders wrong or plain** — plugins registered in the wrong order or too late. Register UI plugin first, then validator, both before the first `<Form>` render (`plugin-system.md`).

## formTypeInputMap

A `/items/**/name` entry never matches — the double-star wildcard is not a thing. `*` matches exactly ONE segment (array indexes and dynamic object keys alike):

```typescript
formTypeInputMap: {
  '/items/*/name': ItemNameInput,   // ✅
  '/items/**/name': ItemNameInput,  // ❌ never matches
}
```

## Computed Expressions

**`&active` / `&visible` not reacting** — the most common cause is path syntax: `/toggle` is an absolute path from the root; a sibling is `../toggle`.

**Expression over a collection not updating** — dependencies that aren't plain path reads need an explicit watch: `{ active: '../items.length > 0', watch: '../items' }`.

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

## Arrays

**`push()` does nothing** — `maxItems` reached. The push is silently ignored and the returned promise resolves with the unchanged length. Escape hatch: `push(data, true)` bypasses `maxItems` (`arrays-and-scale.md`).

**Large array is slow** — keep primitives on the terminal strategy, batch mutations through one `setValue`, and consider the `virtualization` prop (`arrays-and-scale.md`).

## TypeScript

**`getValue()` returns `any`** — the schema literal needs `as const`; then type `useRef<FormHandle<typeof schema>>`. Passing a concrete `defaultValue` additionally requires injecting the `Value` generic (`imperative-and-layout.md`).

## Tests

- Register the validator plugin once in the test setup file, before any render — not per test.
- `formRef.current` is `null` on first render — `await waitFor(() => expect(formRef.current).not.toBeNull())` before driving it.
- Value/computed propagation is batched in microtasks: flush one (e.g. `await Promise.resolve()` / testing-library `waitFor`) between `setValue()` and assertions — a synchronous read sees stale state (`event-system.md`).
