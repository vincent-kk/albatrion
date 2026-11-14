# Virtual Schema

`options.virtual` groups sibling fields into one synthetic field with a single `FieldInput`, without changing the stored data shape. Canonical case: a date-range picker over separate `startDate`/`endDate` properties.

```typescript
{
  type: 'object',
  properties: {
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  options: {                       // sibling of `properties`, NOT inside it
    virtual: {
      period: {
        fields: ['startDate', 'endDate'],
        presentation: { FieldInput: DateRangeInput },  // optional
        controls: { /* … */ },          // optional
      },
    },
  },
}
```

## Value Contract

- The virtual field's value is a **tuple ordered by `fields`**: `[startDateValue, endDateValue]`.
- `onChange(['2025-01-01', '2025-01-31'])` scatters the tuple back into the individual fields.
- The underlying fields remain individually addressable (`/startDate`) and are what actually gets stored — `virtual` changes presentation, not data shape. To read the grouped tuple, use `formRef.current?.findNode('/period')`, check the result with `isVirtualNode`, and read that node's `value`; the root `value` and `outputValue` retain the stored shape.

## Require the stored fields

Declare the real names, such as `startDate` and `endDate`, in the object's `required` list. The virtual name is not emitted and the validator copy does not rewrite required; requiring `period` is not a substitute for requiring its stored fields. Group messages through the [section error recipe](error-feedback.md).

## Node Access

- Inside the virtual `FieldInput`, reach constituent nodes via `node.children[i]` (ordered like `fields`).
- From outside: `formRef.current?.findNode('/period')`, narrowed with the exported `isVirtualNode()` guard.

The virtual FieldInput's node and subtree visitors remain required, as do array operations on its constituents and virtualization `Placeholder` / `estimateHeight` callbacks. Their live-update contract follows [arrays and scale](./arrays-and-scale.md#render-level-virtualization-built-in). Narrow missing lookups before using them. The observation hooks' null/undefined support does not make those inputs optional, and a null JSON value, `NullNode`, or nullable schema does not mean the node reference is absent.

## Keep grouping separate from data ownership

Use a virtual field when one widget edits several existing siblings.
Use a real object schema when the submitted data must contain a nested object instead.
The distinction matters to server validation: visual grouping does not add a new property to the submitted value.
Read ordinary Form output for submission, and read the virtual node's `value` only when the application needs the synthetic group.
Do not submit both representations as separate sources of truth.

## Keep constituent errors actionable

An issue addressed to a stored field belongs to that field even when a grouped widget edits it.
The group can show a summary, but should identify which constituent the user must correct.
Use the current child order when pairing tuple positions with nodes; do not infer field names from a formatted label.
Keep interaction and display policy centralized so the grouped widget does not reveal errors merely because it can read them.
The [interaction state recipe](interaction-state.md) explains touch, edit and loaded-value comparisons.

## Verify the group as an editor

Write a tuple through the group and check the ordinary output at both real property names.
Read each constituent directly and check that the grouped view follows it.
Validate the real required fields and check both the raw issue paths and the grouped message.
Check reset through the Form handle to ensure the group displays the loaded constituents instead of a separate React copy.
