---
"@canard/schema-form": patch
---

Conditions written on an array item now apply to that item. An item schema's own `if`/`then`/`else` and its discriminator-selected `oneOf`/`anyOf` branches decide the schema of each item separately, from that item's own value, so `node.jsonSchema` of an item with `kind: 'b'` carries branch `b` while its neighbour with `kind: 'a'` carries branch `a`.

- Items of recursive schemas, of nested arrays and at `prefixItems` tuple positions keep the schema of their own branch after writes and `push`, as they do when the same value is loaded.
- Declarations that an item gives its children, through `if`/`then` or through a fragment with `controls.active`, reach only the children at the depth they name.
- When an item's branch changes, its `node.jsonSchema` follows and the item receives `FieldNodeEventType.UpdateJsonSchema`.
- When a condition turns off, the declarations it gave to fields several levels below it are removed as well.
- A `controls.active` expression that throws while a write turns a condition above it is reported with `FormErrorCode.ExpressionThrew`, instead of the form silently keeping the schema it had before.
- An item whose own branch declares a type that conflicts with the item's node kind is reported with `FormErrorCode.SharedNodeConflict`, and the same report appears whether the item reaches that state at load, through a write or after a later unrelated `push`.
- `FieldNodeEventType.UpdateJsonSchema` is not delivered when a node's new schema has the same content as its previous one, including when only the declarations that produced it differ. `node.jsonSchema` can then return a new object with equal content, so compare schema content rather than object identity when you cache by it.
