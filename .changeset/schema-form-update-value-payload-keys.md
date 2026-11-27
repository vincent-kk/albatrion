---
"@canard/schema-form": major
---

Breaking change: an `UpdateValue` event now carries `{ previous, current }` in `event.payload`, and `event.options` no longer carries `previous`, `current`, `settled` or `inject`. In 0.16.1, `event.payload[NodeEventType.UpdateValue]` was the new value itself and `event.options[NodeEventType.UpdateValue]` held the previous and current values. For a node that owns child nodes (`isBranchNode(node)` is true), `previous` and `current` are each `{ value, outputValue }`, the same names as the node's `value` and `outputValue` getters; for every other node they are the plain values. The payload is typed `unknown`, so narrow it before reading.

Before:

```ts
node.subscribe(({ type, payload, options }) => {
  if (!(type & NodeEventType.UpdateValue)) return;
  const current = payload?.[NodeEventType.UpdateValue];
  const previous = options?.[NodeEventType.UpdateValue]?.previous;
  render(previous, current);
});
```

After, for a node with child nodes:

```ts
type Values = { value: unknown; outputValue: unknown };
node.subscribe(({ type, payload }) => {
  if (!(type & FieldNodeEventType.UpdateValue)) return;
  const { previous, current } = payload?.[FieldNodeEventType.UpdateValue] as {
    previous?: Values;
    current: Values;
  };
  render(previous?.value, current.value);
});
```
