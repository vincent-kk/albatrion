---
"@canard/schema-form": major
---

Breaking change: a FieldNode reports nullability as `isNullable` instead of `nullable`, like the other state flags of the node, which this release renames with the same `is` prefix (`isRequired`, `isReadOnly` and the rest are listed in the entry on error visibility and node flags). The `SCHEMA_FORM_WARNING.MISFIT` warning record delivered to `onError` follows it with `details.expected.isNullable` instead of `details.expected.nullable`. Field input props are unchanged: `FieldInputProps.nullable` keeps its name beside `disabled` and `readOnly`.

Before:

```ts
const allowsNull = node.nullable;
const expectedNull = record.details.expected.nullable;
```

After:

```ts
const allowsNull = node.isNullable;
const expectedNull = record.details.expected.isNullable;
```
