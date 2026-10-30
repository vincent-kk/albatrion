# Arrays and Scale

`ArrayNode` mutation semantics, the terminal/branch strategy choice, tuples, and the levers for very large forms.

## ArrayNode Mutations

Obtain the node via `formRef.current?.findNode('/items') as ArrayNode`, or receive it as `node` inside a `FieldInput`. Methods: `push`, `pop`, `update`, `remove`, `insert`, `clear` (shapes in `dist/*.d.ts`). Behavior the signatures do not show:

- `push(value?)` returns the array **length after the push** (a number, synchronously), not the new item's index. It is never refused: `maxItems` and `items: false` do not stop it, and validation reports the violation.
- `clear()` removes **every** item whatever `minItems` says, like `remove`/`pop`/`setValue([])`. `minItems` is a validation constraint only: the core never fills to it, at construction, on reset or on branch reactivation. To stop users going below the minimum, disable the remove control in the `FieldInput` (the built-in array input always shows it). The built-in array input also draws empty slots up to `minItems` in the UI only; a slot writes its position when the user types into it. On a nullable array that is `null`, `clear()` does nothing (`nullable-branch-nodes.md`).
- `remove(index)` removes one item by index.
- `insert(index, value?)` inserts one item at an integer index in [0, length] and returns the new length; items from `index` on keep their nodes and keys and move back one position, `index === length` is exactly `push`, and a negative, fractional or larger index does nothing and returns the current length. On a host holding a non-array value, `insert(0, x)` behaves like `push(x)` and any other index does nothing.

## Array Output Filters (omitTrailing / omitEmpty)

`options.omitTrailing: true` (opt-in) trims **trailing** consecutive `undefined` items from the array's outgoing value; `options.omitEmpty` (on by default) turns an empty array into `undefined` on the parent path. Filter order: `omitTrailing → omitEmpty`.

Where the filters apply — and where they never do:

| Surface                                                                   | Value                         |
| ------------------------------------------------------------------------- | ----------------------------- |
| Parent propagation, root validation, `getValue()` / `submit` / `onChange` | filtered (`node.outputValue`) |
| `node.value`, `node.children`, rendered inputs                            | raw — every item node stays   |

Rules of thumb:

- Leading/middle `undefined` are never removed — indices must stay aligned with error `dataPath`s and validation params.
- Primary use case: let users add rows and leave the trailing ones empty without polluting the submitted/validated value. Validation sees the trimmed value, so trailing empty items do not count toward `minItems`.
- A reset restores the loaded value and creates no items for `minItems`; a plain `setValue(undefined)` clears every item.
- In a custom array `FieldInput`, derive row count from `node.children` (or `ChildFields`), never from `value.length` — the emitted value is shorter than the rendered rows by design.
- `injectTo` handlers receive the **raw** source value, not the filtered one; mirror targets therefore hold the untrimmed copy.

## Terminal vs Branch Strategy

An array is a branch by default, whatever its item type. `options.terminal` (not in standard JSON Schema) overrides that; without it, a `presentation.FieldInput` component on the array schema makes it a terminal.

| Strategy | Applies when                                                       | Trade-off                                                 |
| -------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| Branch   | Default, or `options.terminal: false`                              | Per-item node tree — per-item state, validation, controls |
| Terminal | `options.terminal: true`, or a `presentation.FieldInput` component | One input owns the whole array value; no per-item nodes   |

```typescript
{ type: 'array', items: { type: 'string' }, options: { terminal: true } }
// one input owns the whole array — no per-item node tree or per-item state
```

A terminal object or array is a contract: the FieldInput owns the whole subtree value — see the consumer rules.

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
for (let i = 0; i < 100; i++) arrayNode.push(createItem(i));

// ✅ one event
formRef.current?.setValue((prev) => ({
  ...prev,
  items: Array.from({ length: 100 }, (_, i) => createItem(i)),
}));
```

## Rendering Items in a Custom Input

A custom array `FieldInput` renders children through `ChildFields` — omitting it makes items disappear:

```tsx
const ArrayInput: FC<FieldInputProps<any[]>> = ({ node, ChildFields }) => (
  <div>
    <button onClick={() => (node as ArrayNode).push()}>Add</button>
    {ChildFields.map((Child, i) => (
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
- **SSR and hydration**: every field renders on the server and hydrates unchanged. Gating applies to branches and children added after hydration and requires `IntersectionObserver`. Browsers without it render eagerly with a development warning; the server does not warn.
- Placeholders carry `[data-path]` and a `[data-deferred]` marker — style via CSS attribute selector or the `Placeholder` component (`{ node, height }`). Space reservation always belongs to `estimateHeight`; `Placeholder` only fills visuals.
- Benefit scales with form size; small forms gain nothing (hence opt-in).

For a single huge array field (not a huge form), window it manually with a list-virtualization library inside a custom FieldInput, iterating `ChildFields`.

## Input responsiveness at scale

Enable `virtualization` for branches with at least `threshold` children when structural changes interrupt typing. In IR-1, replace-200's longest frame with it off was 62.3 ms in the adopted build (every measured build exceeded 50 ms); with it on, no frame of 50 ms or more was detected. The adopted A lane's same-window mount medians (ms) show the trade-off:

| Form | Off: eager paint / all revealed | On: eager paint / all revealed |
| --- | ---: | ---: |
| flat-500 | 51.750 / 51.750 | 31.600 / 174.250 |
| nested-d5-f4 | 89.250 / 89.250 | 89.700 / 89.700 |
| array-1000 | 201.350 / 201.350 | 59.200 / 473.100 |

Deferred inputs are unavailable to find-in-page, screen readers, and browser autofill until reveal; Focus/Select commands force reveal. This applies while either backfill mode still has placeholders. Every server-rendered field hydrates unchanged and stays revealed across remounts; only branches and children added after hydration are gated. Hydration does not trigger an extra branch-input render; Suspense boundaries inside custom branch inputs preserve their server DOM in React 18 and 19. The default remains off.

- **Validation:** cost grows with schema size. The desktop Chromium flat-2000 IR-2 diagnosis attributed about a quarter of the p95 keystroke cost to validation execution/delivery and its second React commit. The cold, non-burst validation-on minus validation-off input-event dispatch difference was about 1.3 ms median / 2.9 ms p95. For very large forms, use `validationMode={ValidationMode.OnRequest}` and validate on demand or submit.
- **Custom input styling:** in that 2000-input diagnosis, `input { contain: strict; width: 153px; height: 21px; }` cut forced layout per keystroke from 2.5–3.8 ms median to 0.42–0.47 ms median; a plain block wrapper did not help. Give contained inputs an explicit size and check your layout.
- **Consumer state:** for expensive application rendering in `onChange`, wrap your own update, e.g. `onChange={(value) => startTransition(() => setValue(value))}`. Root `onChange` remains synchronous by design. IR-0 E lane event-processing median/p95 was 0.800/5.100 ms plain versus 0.800/4.600 ms with `startTransition`; handler median/p95 stayed 0.400/0.900 ms in both. These fixture results do not promise a speedup for arbitrary consumer work.

## Expression Cost at Scale

Heavy controls expressions run on every dependency tick. Move reductions out of expressions: watch the source array and compute inside the component (`expressions.md` § watch and derived), and keep `watch` lists down to the paths the expression actually reads.
