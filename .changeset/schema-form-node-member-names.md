---
"@canard/schema-form": major
---

Breaking change: a FieldNode reports nullability as `isNullable` instead of `nullable`, matching `isRequired`, `isReadOnly` and the other state flags on the node. The `SCHEMA_FORM_WARNING.MISFIT` warning record delivered to `onError` follows it with `details.expected.isNullable` instead of `details.expected.nullable`. Field input props are unchanged: `FieldInputProps.nullable` keeps its name beside `disabled` and `readOnly`.

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
