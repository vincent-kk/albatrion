---
"@canard/schema-form": major
---

Breaking change: the array node methods `push`, `pop`, `update`, `remove` and `clear` return their results synchronously instead of promises, `push` no longer takes the `unlimited` argument and is no longer refused at `maxItems`, and an array no longer creates items up to `minItems`.

`push` returns the new length, `pop`, `update` and `remove` return their item value directly, and `clear` returns nothing. Code that calls `.then` on a result must use the value directly; `await` keeps working.

In 0.x `push` silently ignored an item beyond `maxItems` unless its second argument was `true`, an array with child nodes also ignored an item at a position that `items: false` closes, and an array loaded or reset without `defaultValue` or `default` was filled up to `minItems` with items holding the item schema's `default`, or empty items when it had none. Now `push` appends beyond `maxItems` and under `items: false`, validation reports both limits, and the form never fills an array to `minItems`, at construction, on reset or when a branch becomes active again. The built-in array input now draws empty slots up to `minItems` that write nothing until the user fills one, and it still hides its add button at `maxItems`; a custom input that must enforce a limit reads it from `node.jsonSchema` and disables its own controls.

Before:

```ts
arrayNode.push(item, true).then((length) => focusRow(length - 1));
```

After:

```ts
const length = arrayNode.push(item);
focusRow(length - 1);
```
