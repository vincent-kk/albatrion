---
"@canard/schema-form": major
---

Breaking change: the `UpdateValue` event payload of a node that owns child nodes (a virtual node, or an object or array node whose schema does not set `options.terminal`) names the entries of `previous` and `current` `value` and `outputValue` instead of `local` and `emit`, the same names as the node's `value` and `outputValue` getters. Every other node's payload still carries the plain values.

Before:

```ts
const { current } = event.payload[FieldNodeEventType.UpdateValue];
render(current.local, current.emit);
```

After:

```ts
const { current } = event.payload[FieldNodeEventType.UpdateValue];
render(current.value, current.outputValue);
```
