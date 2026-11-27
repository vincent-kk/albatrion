---
"@canard/schema-form": major
---

Breaking change: a `null` entry in an array whose items are non-nullable scalars is now an emptied item instead of being converted to a value, so `getValue()` keeps the `null` and validation reports it. In 0.16.1 a loaded `null` at such a position became `''` for a string item, `NaN` for a number item and `false` for a boolean item, and an item emptied in the form appeared as `undefined` inside the array's value.

Now, whether the `null` is loaded through `defaultValue` or `reset` or written by `setValue`, an array method such as `push(null)`, `derived` or `injectTo`, the item's `node.value` and its field input's `value` prop are `undefined` (`item.setValue(null)` reads back `undefined`), `getValue()` holds `null` at that position, and a registered validator reports a `type` error there, unless `omitTrailingEmpty` removes the position from the end of the array. The item is not a misfit: `node.isMisfit` is false and no `SCHEMA_FORM_WARNING.MISFIT` warning is reported. An item emptied in the form also appears as `null` in `getValue()`, so saving the output and loading it again gives the same empty item. A given `null` does not take the item schema's `default`, nor the `default` of the array or its parent; a position created without a value takes the item default: an `undefined` entry that makes a new item, or `push()` without a value. Writing `undefined` to an item that already exists clears it without restoring the default, and writing `undefined` or `null` to an item that is already empty changes neither the value nor the source; `setValue` notifies no subscriber, while a write through the field input still marks it dirty. A `null` that creates an item, through `push(null)`, `insert(index, null)` or a longer array with a `null` entry, is the item's first value: the new item's `node.revision()` reads as it does for an item created by `push('x')` or by loading the same `null`, while an item created by `push()` without a value reads `0` unless its `default` fills it. When a condition hides an emptied item, its array or a parent and shows it again, the item stays empty, as loading the output saved before it was hidden does, unless an exit policy (`unsetOnInactive`, `inactiveValue`) on the item, its array or a parent changes it; an item with `unsetOnInactive` takes its default when it returns. A position that gets no value while it is hidden, from `push()`, `insert`, a longer array or an `undefined` entry, takes the default when it is shown, and a position created while automatic writes are disabled stays empty. A `Merge` write leaves a hidden position as it was only when it omits the array's key and every object it names on the way to the array receives a plain object; an `undefined` entry is given like any other, and a value that is not a plain object, `undefined` included, given to an object holding the array replaces that object together with the array inside it. Items whose schema is a union of several non-null types follow the same rule. Items that accept `null` (`type: ['string', 'null']` or `nullable: true`) and `type: 'null'` items keep `null` as a value; object and array items and arrays with `terminal: true` are outside this rule.

If `null` is a value your data may hold, declare it in the item schema; if you relied on the conversion, replace `null` with the value you want before loading.

Before:

```ts
const schema = {
  type: 'object',
  properties: { flags: { type: 'array', items: { type: 'boolean' } } },
};
// defaultValue: { flags: [true, null] }
// 0.16.1: getValue() → { flags: [true, false] }, valid
```

After:

```ts
// The same schema and defaultValue:
// getValue() → { flags: [true, null] }, `must be boolean` at /flags/1

// Accept null as a value:
const schema = {
  type: 'object',
  properties: {
    flags: { type: 'array', items: { type: ['boolean', 'null'] } },
  },
};
// getValue() → { flags: [true, null] }, valid
```
