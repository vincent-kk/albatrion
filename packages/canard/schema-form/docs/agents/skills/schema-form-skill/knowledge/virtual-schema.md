# Virtual Schema

`virtual` groups sibling fields into one synthetic field with a single `FormTypeInput`, without changing the stored data shape. Canonical case: a date-range picker over separate `startDate`/`endDate` properties.

```typescript
{
  type: 'object',
  properties: {
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  virtual: {                       // sibling of `properties`, NOT inside it
    period: {
      fields: ['startDate', 'endDate'],
      FormTypeInput: DateRangeInput,  // optional
      computed: { /* … */ },          // optional
    },
  },
}
```

## Value Contract

- The virtual field's value is a **tuple ordered by `fields`**: `[startDateValue, endDateValue]`.
- `onChange(['2025-01-01', '2025-01-31'])` scatters the tuple back into the individual fields.
- The underlying fields remain individually addressable (`/startDate`) and are what actually gets stored — `virtual` changes presentation, not data shape. `node.enhancedValue` on the root includes virtual fields when you need the grouped view.

## required Cascade

`required: ['period']` (naming the virtual field) makes **every field it contains** required. Grouped error display for the tuple: `useChildNodeErrors` (`validation-and-state.md`).

## Node Access

- Inside the virtual `FormTypeInput`, reach constituent nodes via `node.children[i].node` (ordered like `fields`).
- From outside: `formRef.current?.findNode('/period')`, narrowed with the exported `isVirtualNode()` guard.
