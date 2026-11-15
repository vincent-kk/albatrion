---
"@canard/schema-form": minor
---

Breaking change: the array option `omitTrailing` is renamed to `omitTrailingEmpty`, and it now trims every trailing empty item instead of only `undefined`.

```ts
// Before
{ type: 'array', items: { type: 'string' }, options: { omitTrailing: true } }

// After
{ type: 'array', items: { type: 'string' }, options: { omitTrailingEmpty: true } }
```

Schema options accept unknown keys without an error or warning, so a schema that still says `omitTrailing` silently stops trimming. Search your schemas for `omitTrailing` and rename it.

The option now removes the trailing run of `null`, `undefined`, `''`, `[]` and `{}` items from the array's output, using the same rule whether the array renders one input per item or one input for the whole array. A trailing `null` is removed even when the item schema accepts null, so leave the option off for arrays where a trailing `null` carries meaning. The check looks only at each item's output value: a whole-array input keeps an item such as `{ name: '' }`, while with one input per item a row whose fields are all omitted (for example `name: ''` under the default `omitEmpty`) outputs `{}` and is removed. Values such as `Date` that are not plain objects always stay. Leading and middle items are never removed, and the rendered rows are unchanged.
