---
"@canard/schema-form": major
---

Breaking change: several members of a field node (0.x `SchemaNode`) are renamed or removed. TypeScript reports each removed member; plain JavaScript reads it as `undefined`, and assigning `node.value` is a TypeScript error and throws a `TypeError` in strict-mode code, such as ES modules, because `value` is now read-only.

| 0.x | 1.0.0 |
| --- | --- |
| `node.group` | `node.strategy`, with the same `'branch'` and `'terminal'` values |
| `node.normalizedValue` | `node.outputValue` |
| `node.findAll(pointer)` | `node.findNodes(pointer)` |
| `node.value = next` | `node.setValue(next)` |
| `node.setErrors(errors)`, `node.clearErrors()` | removed. They replaced the validator's errors for that node until the next validation overwrote them. For errors you supply, use `node.setExternalErrors(errors)` and `node.clearExternalErrors()`, which already existed in 0.x and keep the errors until you clear them |
| `node.publish(NodeEventType.RequestFocus)` and the other request events | `node.request(FieldNodeRequestType.Focus)` (also `Select`, `Refresh` and `Remount`), or `focus`, `select`, `refresh` and `remount` on the form handle |
| `node.subnodes` | `node.children`, which lists the child nodes of the current shape |
| array `node.length` | `node.value?.length` (on an array whose `strategy` is `'branch'`, `node.children.length` also counts its items) |
| array `node.minItems`, `node.maxItems` | `node.jsonSchema.minItems`, `node.jsonSchema.maxItems` |
| `node.schemaPath`, `node.key` | removed; identify a node by `node.path` |
| `node.scope`, `node.variant`, `node.oneOfIndex`, `node.anyOfIndices`, `node.initialized` | removed |

Before:

```ts
if (node.group === 'branch') node.findAll(pointer).forEach(visit);
node.value = 'next';
node.publish(NodeEventType.RequestRemount); // as 0.x documented it; TypeScript rejects the public enum here
```

After:

```ts
if (node.strategy === 'branch') node.findNodes(pointer).forEach(visit);
node.setValue('next');
node.request(FieldNodeRequestType.Remount);
```
