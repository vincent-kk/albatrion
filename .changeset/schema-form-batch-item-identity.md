---
"@canard/schema-form": minor
---

Field nodes gain `batch(fn)` and `visitSubtree(visitor)`, and array nodes gain `insert(index, value)`. `batch` groups synchronous writes so that subscriptions, `onChange` and validation are delivered once, when the outermost batch ends. `visitSubtree` calls `visitor` on the node and then its descendants in preorder, skips a node's descendants when `visitor` returns `false`, and groups the writes made during the walk the same way. `insert` adds one item at a position from 0 to the current length, moves the later items back without replacing their nodes, and returns the new length.

Inside a batch, scalar writes wait for the end of the batch, so ordinary reads see the last committed values until then. Array methods (`push`, `pop`, `update`, `remove`, `insert`, `clear`) apply their arrangement at the call, as they do outside a batch: they return their usual result, later reads see the arranged array, and an item node captured before the call keeps addressing the same item.

```ts
// items: ['a', 'b']
const item = list.children[0];
list.batch(() => {
  list.insert(0, 'new');
  item.setValue('edited');
});
// ['new', 'edited', 'b']
```

Errors and interaction flags follow surviving item nodes, and writes through a removed item node are ignored. When `fn` throws, the outermost batch keeps the arrangements already applied and commits pending writes before rethrowing; nothing is rolled back. A batch merges deliveries but does not make many array method calls cheaper than separate calls; one `setValue` of the final array settles once.
