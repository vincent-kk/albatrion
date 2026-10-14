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
  controls: { injectTo: (value) => ({ '../nickname': value }) },
},

// derived: always computed
totalPrice: {
  type: 'number',
  controls: { derived: '(../price ?? 0) * (../quantity ?? 1)' },
},
```

## Handler Contract

The handler returns a map of **JSONPointer path → value**; relative (`../target`) and absolute (`/root/target`) paths can mix in one result. It is a plain function — branch inside it, return different maps, inject objects/arrays as values.

```typescript
source: {
  type: 'string',
  controls: {
    injectTo: (value) => value.length > 5
      ? { '../longTarget': value }
      : { '../shortTarget': value, '/audit/lastShort': value },
  },
},
```

## Cycles

A cycle is not detected. Each settlement re-runs rules until no source value changes, up to 25 rounds; a cycle that converges (the same value comes back) stops on its own, while one that keeps producing new values exceeds the budget: the caller's write is kept, every automatic write from that settlement is reverted, `diagnostics` becomes `degraded` with `exceededBudget: 'derive'`, and the write throws. Design chains as DAGs.
