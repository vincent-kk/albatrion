# Arrays and Scale

`ArrayNode` mutation semantics, the terminal/branch strategy choice, tuples, and the levers for very large forms.

## ArrayNode Mutations

Obtain the node via `formRef.current?.findNode('/items') as ArrayNode`, or receive it as `node` inside a `FormTypeInput`. Methods: `push`, `pop`, `update`, `remove`, `clear` (shapes in `dist/*.d.ts`). Behavior the signatures do not show:

- `push(data?, unlimited?)` returns `Promise<number>` resolving to the array **length after the push** — not the new item's index. When `maxItems` is reached the push is **silently ignored** and the promise resolves with the unchanged length (no error). Pass `unlimited: true` to bypass `maxItems`.
- `clear()` respects `minItems`: with `minItems: 2`, two items remain after clearing.
- `remove(index)` removes one item by index.

## Array Output Filters (omitTrailing / omitEmpty)

`options.omitTrailing: true` (opt-in) trims **trailing** consecutive `undefined` items from the array's outgoing value; `options.omitEmpty` (on by default) turns an empty array into `undefined` on the parent path. Filter order: `omitTrailing → omitEmpty`.

Where the filters apply — and where they never do:

| Surface                                                                   | Value                             |
| ------------------------------------------------------------------------- | --------------------------------- |
| Parent propagation, root validation, `getValue()` / `submit` / `onChange` | filtered (`node.normalizedValue`) |
| `node.value`, `node.children`, rendered inputs                            | raw — every item node stays       |

Rules of thumb:

- Leading/middle `undefined` are never removed — indices must stay aligned with error `dataPath`s and validation params.
- Primary use case: pre-expose empty inputs (`minItems`) without polluting the submitted/validated value. Validation sees the trimmed value, so `minItems` counts only the filled prefix.
- A Reset-flagged clear (form reset, oneOf/anyOf branch reactivation) refills `minItems` empty items; a plain `setValue(undefined)` clears every item.
- In a custom array `FormTypeInput`, derive row count from `node.children` (or `ChildNodeComponents`), never from `value.length` — the emitted value is shorter than the rendered rows by design.
- `injectTo` handlers receive the **raw** source value, not the filtered one; mirror targets therefore hold the untrimmed copy.

## Terminal vs Branch Strategy

Item type picks the strategy automatically; `terminal` is a schema key (not in standard JSON Schema) that overrides it.

| Strategy | Applies when                            | Trade-off                                                 |
| -------- | --------------------------------------- | --------------------------------------------------------- |
| Terminal | Primitive items (string/number/boolean) | Values only, no per-item node tree — fast, memory-light   |
| Branch   | Object/array items                      | Per-item node tree — per-item state, validation, computed |

```typescript
{ type: 'array', terminal: false, items: { type: 'string' } }
// primitives forced onto Branch — use when each item needs its own state tracking
```

`terminal: true` on an object/array schema is a different contract (the FormTypeInput owns the whole subtree value) — see the consumer rules.

## Tuples

```typescript
{
  type: 'array',
  prefixItems: [
    { type: 'number', title: 'X' },
    { type: 'number', title: 'Y' },
  ],
  items: false,   // closes the tuple; omit or set a schema to allow a rest type
}
// [number, number] — with items: { type: 'string' } instead: [number, number, ...string[]]
```

## Bulk Mutation

Per-item `push()` in a loop fires an event per call. For N items, set the value once:

```typescript
// ❌ 100 events
for (let i = 0; i < 100; i++) await arrayNode.push(createItem(i));

// ✅ one event
formRef.current?.setValue((prev) => ({
  ...prev,
  items: Array.from({ length: 100 }, (_, i) => createItem(i)),
}));
```

## Rendering Items in a Custom Input

A custom array `FormTypeInput` renders children through `ChildNodeComponents` — omitting it makes items disappear:

```tsx
const ArrayInput: FC<FormTypeInputProps<any[]>> = ({
  node,
  ChildNodeComponents,
}) => (
  <div>
    <button onClick={() => (node as ArrayNode).push()}>Add</button>
    {ChildNodeComponents.map((Child, i) => (
      <div key={i}>
        <Child />
        <button onClick={() => (node as ArrayNode).remove(i)}>Remove</button>
      </div>
    ))}
  </div>
);
```

## Render-Level Virtualization (built-in)

For forms with hundreds of fields the dominant cost is the initial React mount — the node tree itself is cheap. The `virtualization` prop on `<Form>` defers mounting of off-screen fields as lightweight placeholders; they mount when approaching the viewport, during idle time, or on focus/select.

```tsx
<Form jsonSchema={largeSchema} virtualization />
// or with options:
<Form
  jsonSchema={largeSchema}
  virtualization={{
    threshold: 30,       // gate a branch only when it has >= 30 children
    eagerCount: 20,      // mount the leading 20 fields immediately
    rootMargin: '100%',  // IntersectionObserver margin — px or % only
    backfill: VirtualizationBackfill.Idle,  // or .None: reveal only on scroll/commands
    estimateHeight: 40,  // placeholder height px, or (node) => number
    Placeholder: FieldSkeleton,             // optional visual fill
  }}
/>
```

Contract — each point matters:

- **The node tree is always fully built.** `getValue()`, `setValue()`, validation, and submit behave identically whether a field is mounted or deferred.
- **Defer-once**: a mounted field never returns to a placeholder.
- **CSR only**: requires `IntersectionObserver`. Never enable in SSR/hydration apps — the server renders everything while the client gates, causing hydration mismatch. Without `IntersectionObserver` it silently disables (dev warning).
- Placeholders carry `[data-path]` and a `[data-deferred]` marker — style via CSS attribute selector or the `Placeholder` component (`{ node, height }`). Space reservation always belongs to `estimateHeight`; `Placeholder` only fills visuals.
- Benefit scales with form size; small forms gain nothing (hence opt-in).

For a single huge array field (not a huge form), window it manually with a list-virtualization library inside a custom FormTypeInput, iterating `ChildNodeComponents`.

## Expression Cost at Scale

Heavy computed expressions run on every dependency tick. Move reductions out of expressions: watch the source array and compute inside the component (`expressions.md` § watch and derived), and keep `watch` lists down to the paths the expression actually reads.
