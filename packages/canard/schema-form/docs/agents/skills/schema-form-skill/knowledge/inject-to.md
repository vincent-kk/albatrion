# injectTo

`injectTo` propagates a source field's value to other fields **once per change**; the targets stay user-editable afterward. Its sibling `derived` is continuous and overwrites edits — picking between them is a value-ownership decision:

|                   | `injectTo`                    | `derived`                             |
| ----------------- | ----------------------------- | ------------------------------------- |
| Direction         | Source → targets              | Dependencies → this field             |
| After propagation | Target freely editable        | Recalculated — user edits overwritten |
| Sync              | One-time per source change    | Continuous                            |
| Use for           | Initial copy, default seeding | Always-computed values                |

```typescript
// injectTo: copy once, then independent
name: {
  type: 'string',
  injectTo: (value) => ({ '../nickname': value }),
},

// derived: always computed
totalPrice: { type: 'number', '&derived': '(../price ?? 0) * (../quantity ?? 1)' },
```

## Handler Contract

The handler returns a map of **JSONPointer path → value**; relative (`../target`) and absolute (`/root/target`) paths can mix in one result. It is a plain function — branch inside it, return different maps, inject objects/arrays as values.

```typescript
source: {
  type: 'string',
  injectTo: (value) => value.length > 5
    ? { '../longTarget': value }
    : { '../shortTarget': value, '/audit/lastShort': value },
},
```

## Cycles

Injection chains are traced per change; a hop that would close a cycle (`A → B → … → A`) is **blocked silently** — earlier hops in the chain still apply, and nothing throws. Design chains as DAGs; the blocking is a safety net, not a feature to lean on.
