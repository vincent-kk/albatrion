---
"@winglet/json-schema": major
---

Breaking change: `JSONSchemaScanner` and `JSONSchemaScannerAsync` without `resolveReference` now decide whether a subschema with a recognized `$schema` starts an embedded resource by reading the identifier keyword of that declared dialect: `id` for draft-04, `$id` for draft-06 and later. Before, they read `$id`, and `id` only when the enclosing dialect was draft-04, so the same schema marked different positions `inert` with and without `createReferenceResolver`.

A subschema now switches dialect without a resolver exactly when the built-in resolver treats it as a resource. Two cases change:

- `{ $schema: "…/draft-04/schema#", id: "a.json" }` under a 2020-12 or later parent now switches to draft-04, so draft-06+ positions such as `contains` below it become `inert`.
- `{ $schema: "…/draft/2020-12/schema", id: "a.json" }` (or any draft-06+ declaration with only `id`) under a draft-04 parent no longer switches, so positions such as `prefixItems` below it stay `inert` under draft-04.

Migration: declare the identifier keyword of the dialect the subschema names. A visitor that depended on the old switch needs that keyword change.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  properties: {
    embedded: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      id: "child.json",
      prefixItems: [{ type: "string" }],
    },
  },
};
new JSONSchemaScanner({
  visitor: {
    enter: (entry) => {
      // "#/properties/embedded/prefixItems/0" was visited with inert: false
    },
  },
}).scan(schema);
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  properties: {
    embedded: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "child.json",
      prefixItems: [{ type: "string" }],
    },
  },
};
new JSONSchemaScanner({
  visitor: {
    enter: (entry) => {
      // "#/properties/embedded/prefixItems/0" is visited with inert: false
    },
  },
}).scan(schema);
```
