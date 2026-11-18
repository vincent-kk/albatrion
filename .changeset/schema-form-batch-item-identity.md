---
"@canard/schema-form": major
---

Breaking change: array methods inside batch and visitSubtree now apply their arrangement immediately and preserve surviving item identities, just like the same methods called sequentially. Reads after an array method see its arrangement; subscriptions, onChange and validation delivery remain grouped at the outer batch boundary. Earlier scalar marks settle before the array method; scalar-only batches retain their deferred behavior. Throwing callbacks keep applied arrangements and commit pending writes, without rollback.

Before, with items ['a', 'b']:

```ts
const item = list.children[0];
list.batch(() => {
  list.insert(0, "new");
  item.setValue("edited");
});
// ['edited', 'a', 'b'] — the captured item still addressed position 0
```

After, the same code edits the captured item at its new position:

```ts
const item = list.children[0];
list.batch(() => {
  list.insert(0, "new");
  item.setValue("edited");
});
// ['new', 'edited', 'b']
```

Errors and interaction flags follow surviving item nodes. Writes through removed item references remain ignored. Intermediate automatic defaults and injections can still differ when a batch skips intermediate scalar settlements.
