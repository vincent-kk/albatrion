---
"@canard/schema-form": major
---

Breaking change: a `null` entry in an array whose items are non-nullable scalars is now an emptied item instead of being converted to a value, so `getValue()` keeps the `null` and validation reports it. In 0.16.1 a loaded `null` at such a position became `''` for a string item, `NaN` for a number item and `false` for a boolean item, and an item emptied in the form appeared as `undefined` inside the array's value.

Now, whether the `null` is loaded through `defaultValue` or `reset` or written by `setValue`, an array method such as `push(null)`, `derived` or `injectTo`, the item's `node.value` and its field input's `value` prop are `undefined` (`item.setValue(null)` reads back `undefined`), `getValue()` holds `null` at that position, and a registered validator reports a `type` error there, unless `omitTrailingEmpty` removes the position from the end of the array. The item is not a misfit: `node.isMisfit` is false and no `SCHEMA_FORM_WARNING.MISFIT` warning is reported. An item emptied in the form also appears as `null` in `getValue()`, so saving the output and loading it again gives the same empty item. A given `null` does not take the item schema's `default`, nor the `default` of the array or its parent; an `undefined` entry and `push()` without a value still take the item default, and when a condition removes the array and brings it back, an emptied item takes its default again. Items whose schema is a union of several non-null types follow the same rule. Items that accept `null` (`type: ['string', 'null']` or `nullable: true`) and `type: 'null'` items keep `null` as a value; object and array items and arrays with `terminal: true` are outside this rule.

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
