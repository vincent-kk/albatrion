# JSONPointer Details

The syntax-by-context support matrix lives in SKILL.md (single source). This file covers navigation and escaping mechanics beyond the matrix.

## node.find() / findNodes()

```typescript
rootNode.find('/user/name'); // absolute
currentNode.find('../sibling'); // parent-relative
currentNode.find('..'); // parent itself
formRef.current?.findNodes('/items/*'); // all wildcard matches need the plural form
```

- Singular `find()` returns the first wildcard match; use `findNodes()` on the node or `FormHandle` for all matches.
- `find()` with no argument or an empty string returns the node itself. `find('#')` returns the root; `find('/')` and `find('#/')` address the root's empty-name child.
- `@` is a controls-expression context token, not a queryable node: `find('@')` returns null and `findNodes('@')` returns an empty array. Use `@.path` in controls expressions to read form context.

## Missing references and narrowing

Missing single lookups and absent tree relations use null; plural lookups return an empty array. Optional lifecycle references, such as `FormHandle.node` while unavailable, use undefined. Kind and strategy guards reject both null and undefined and narrow a real node before operations. Do not cast a possibly missing lookup to a required node and then mutate it. A null JSON value or `NullNode` does not mean the node reference is absent.

## Escaping

`~` → `~0`, `/` → `~1` (RFC 6901) — applies everywhere a pointer names a literal key, including `fieldInputMap` keys:

```typescript
// property name: 'object/Node'
const fieldInputMap = { '/object~1Node': SpecialInput };
// property name: 'tilde~here'
rootNode.find('/tilde~0here');
```

## Queries, expressions, and stored paths

- `Form.Render` / `Form.Input` `path` props use the same extended query as `node.find`, including relative steps and first-match wildcards; see [imperative layout](imperative-and-layout.md#gotchas).
- `getAttachedFilesMap()` keys are canonical node paths, not wildcard or relative queries.
- Expressions cannot use `*`; `fieldInputMap` cannot use `..`/`.`/`@` (see the SKILL.md matrix).
