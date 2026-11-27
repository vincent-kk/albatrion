---
"@canard/schema-form": patch
---

`resetSubtree()` inside `node.batch()`, which is new in this release, first settles every earlier write of the batch, as array methods such as `push` do, so a `controls.injectTo` or `controls.derived` rule that an earlier write triggers is applied before the reset and does not overwrite the reset value. Writes inside the reset field are discarded, unless settling the earlier writes makes the reset field inactive: the reset is then refused, as on an inactive field, and the writes inside it are kept and settle with the rest of the batch, so the field keeps the written value as its retained value. A later write of the batch outside the reset field still decides what it covers: a later `setValue` replaces the whole address, and a later Merge replaces only the keys it names.

```ts
root.batch(() => {
  root.find('/source')?.setValue('{"x":"auto"}'); // source injects into /object
  root.find('/object')?.resetSubtree();
});
// /object holds its reset value, as without the batch
```

A virtual group with a constituent address outside the reset scope settles before the reset, even if that constituent is currently inactive. This preserves the effects of rules triggered by the group's active constituents.
