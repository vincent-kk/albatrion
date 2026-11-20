---
"@canard/schema-form": patch
---

`resetSubtree()` inside `node.batch()` now settles every earlier write of the batch before it loads, as array methods such as `push` already do. Writes inside the reset field are still discarded. Before, an earlier write outside the reset field stayed pending, so a `controls.injectTo` or `controls.derived` rule it triggered was applied after the reset and overwrote the reset value; calling the same methods without a batch kept the reset value.

```ts
root.batch(() => {
  root.find('/source')?.setValue('{"x":"auto"}'); // source injects into /object
  root.find('/object')?.resetSubtree();
});
// now: /object holds its reset value, as without the batch
// before: /object held { x: 'auto' }
```
