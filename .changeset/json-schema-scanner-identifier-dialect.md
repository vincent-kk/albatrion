---
"@winglet/json-schema": major
---

Breaking change: `JSONSchemaScanner` and `JSONSchemaScannerAsync` without `resolveReference` now choose the identifier keyword of a subschema with a recognized `$schema` from that declared dialect: `id` for draft-04, `$id` for draft-06 and later. A string in that keyword switches the subschema to its declared dialect. Before, they read `$id`, and `id` only when the enclosing dialect was draft-04, which is not the keyword `createReferenceResolver` reads. As before, under a draft-04, draft-06 or draft-07 parent a subschema with a string `$ref` does not switch.

Without a resolver the scanner still switches on any string identifier, while the built-in resolver does not enter a resource for an identifier with a non-empty fragment (in 2019-09 and 2020-12, or in older drafts when it names the enclosing document) or for one that cannot be resolved as a URI reference. For such identifiers `inert` can still differ between the two scans; the specification lists this limit.

Two cases change:

- `{ $schema: "…/draft-04/schema#", id: "a.json" }` under a draft-06 or later parent now switches to draft-04, so draft-06+ positions such as `contains` below it become `inert`.
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
