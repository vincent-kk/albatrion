# JSONPointer Details

The syntax-by-context support matrix lives in SKILL.md (single source). This file covers navigation and escaping mechanics beyond the matrix.

## node.find() / findAll()

```typescript
rootNode.find('/user/name'); // absolute
currentNode.find('../sibling'); // parent-relative
currentNode.find('..'); // parent itself
formRef.current?.findNodes('/items/*'); // wildcard needs the PLURAL form
```

- Singular `find()` does not accept `*`; use `findAll()` on a node or `findNodes()` on the `FormHandle`.
- `find()` with no argument returns the node itself; `find('/')` returns the root.
- `find('@')` — the bare token, nothing after it — returns the form's **context node** (the `context` prop's node representation). `@.path` expressions are still computed-only.

## Escaping

`~` → `~0`, `/` → `~1` (RFC 6901) — applies everywhere a pointer names a literal key, including `formTypeInputMap` keys:

```typescript
// property name: 'object/Node'
formTypeInputMap: { '/object~1Node': SpecialInput }
// property name: 'tilde~here'
rootNode.find('/tilde~0here');
```

## Where Extended Syntax Does NOT Work

- `Form.Render` / `Form.Input` `path` props: standard RFC 6901 only (`imperative-and-layout.md`).
- `getAttachedFilesMap()` keys: standard paths only.
- Expressions cannot use `*`; `formTypeInputMap` cannot use `..`/`.`/`@` (see the SKILL.md matrix).
