---
"@canard/schema-form": patch
---

`resetSubtree()` inside `node.batch()` now settles every earlier write of the batch before it loads, as array methods such as `push` already do. Writes inside the reset field are still discarded, unless settling the earlier writes makes the reset field inactive: the reset is then refused, as on an inactive field, and the writes inside it are kept and settle with the rest of the batch, so the field keeps the written value as its retained value. A later write of the batch outside the reset field still decides what it covers: a later `setValue` replaces the whole address, and a later Merge replaces only the keys it names. Before, an earlier write outside the reset field stayed pending, so a `controls.injectTo` or `controls.derived` rule it triggered was applied after the reset and overwrote the reset value; calling the same methods without a batch kept the reset value.

```ts
root.batch(() => {
  root.find('/source')?.setValue('{"x":"auto"}'); // source injects into /object
  root.find('/object')?.resetSubtree();
});
// now: /object holds its reset value, as without the batch
// before: /object held { x: 'auto' }
```
