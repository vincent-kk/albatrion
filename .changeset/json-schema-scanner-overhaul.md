---
"@winglet/json-schema": major
---

Breaking change: `JSONSchemaScanner`, `JSONSchemaScannerAsync` and `resolveReference` now resolve references through a resolver object, read the JSON Schema dialect of each resource, visit boolean schemas and the children of references they keep, keep sibling keywords beside inlined references, and reject `mutate` results that change identifiers. Each section below names one change and how to migrate.

### Construct a resolver object instead of supplying a callback

Use `createReferenceResolver` for identifiers, anchors, relative references and host-safe copies. A custom provider implements `ReferenceResolver` with `root`, optional `child`, `dialect` and tagged `resolve` results; a missing target returns `{ status: 'skipped', reason: 'unresolved' }`.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const schema = {
  definitions: { Text: { type: "string" } },
  properties: { name: { $ref: "#/definitions/Text" } },
};
const targets: Record<string, object> = {
  "#/definitions/Text": schema.definitions.Text,
};
const output = new JSONSchemaScanner({
  options: { resolveReference: (ref) => targets[ref] },
})
  .scan(schema)
  .getValue();
```

After:

```typescript
import {
  createReferenceResolver,
  JSONSchemaScanner,
} from "@winglet/json-schema";
const schema = {
  definitions: { Text: { type: "string" } },
  properties: { name: { $ref: "#/definitions/Text" } },
};
const output = new JSONSchemaScanner({
  options: { resolveReference: createReferenceResolver(schema) },
})
  .scan(schema)
  .getValue();
```

### Remove copy and callback-cache options

`cloneResolvedSchema` and `cacheResolvedReference` are removed. Inlined target occurrences are isolated copies. The built-in resolver caches documents and host-specific target preparation; reusing it avoids repeating that preparation without treating a written reference string as a context-free key.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const scanner = new JSONSchemaScanner({
  options: {
    resolveReference: () => ({ type: "string" }),
    cloneResolvedSchema: true,
    cacheResolvedReference: true,
  },
});
scanner.scan({ $ref: "#/Text" }).getValue();
```

After:

```typescript
import {
  createReferenceResolver,
  JSONSchemaScanner,
} from "@winglet/json-schema";
const schema = { $defs: { Text: { type: "string" } }, $ref: "#/$defs/Text" };
const resolver = createReferenceResolver(schema);
const scanner = new JSONSchemaScanner({
  options: { resolveReference: resolver },
});
scanner.scan(schema).getValue();
```

### Expect the wider default vocabulary

`EXTENDED_KEYWORDS` is removed. `DEFAULT_KEYWORDS` now also holds `patternProperties`, `dependentSchemas`, `propertyNames`, `contains`, `additionalItems`, `unevaluatedProperties`, `unevaluatedItems`, `contentSchema` and schema-valued `dependencies`, so a scanner with default options visits those positions too. The new `keywords` option replaces the whole vocabulary; `additionalKeywords` still appends to it, and the last duplicate still wins.

Before:

```typescript
import { EXTENDED_KEYWORDS, JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  options: { additionalKeywords: [...EXTENDED_KEYWORDS] },
}).scan({ contains: { type: "string" } });
```

After:

```typescript
import { DEFAULT_KEYWORDS, JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner().scan({ contains: { type: "string" } });

// To visit only the keywords of the former default vocabulary:
const former = [
  "$defs",
  "definitions",
  "additionalProperties",
  "not",
  "if",
  "then",
  "else",
  "allOf",
  "anyOf",
  "oneOf",
  "prefixItems",
  "items",
  "properties",
];
new JSONSchemaScanner({
  options: {
    keywords: DEFAULT_KEYWORDS.filter((descriptor) =>
      former.includes(descriptor.keyword),
    ),
  },
}).scan({ contains: { type: "string" } });
```

### Name the dialect of documents without `$schema`

Each resource is read in the dialect its `$schema` declares, and a document without a recognized `$schema` is read as 2020-12 unless `defaultDialect` names another dialect. A position that does not belong to that dialect, and everything below it, is visited with `entry.inert: true`: callbacks still run there, but a `mutate` replacement is not written to the output and a reference is not resolved. Under the 2020-12 default this includes array-form `items` and `additionalItems`, so name the dialect of a draft-04, draft-06 or draft-07 document that has no `$schema`. With a resolver, also pass `defaultDialect` to `createReferenceResolver`, whose dialect takes precedence over the scanner option.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const output = new JSONSchemaScanner({
  options: {
    mutate: (entry) =>
      entry.path === "#/items/0" ? { type: "number" } : undefined,
  },
})
  .scan({ type: "array", items: [{ type: "string" }] })
  .getValue();
// { type: 'array', items: [{ type: 'number' }] }
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const output = new JSONSchemaScanner({
  options: {
    defaultDialect: "draft-07",
    mutate: (entry) =>
      entry.path === "#/items/0" ? { type: "number" } : undefined,
  },
})
  .scan({ type: "array", items: [{ type: "string" }] })
  .getValue();
// { type: 'array', items: [{ type: 'number' }] }
// Without defaultDialect, '#/items/0' is inert and the output keeps { type: 'string' }.
```

### Narrow entries and results before reading object fields

`SchemaEntry.schema` is `Schema | boolean` and `readonly`. Boolean leaves now reach `filter`, `mutate` and visitors, `scan` accepts a boolean root, and `getValue()` and `resolveReference` can return a boolean. `SchemaEntry.keyword` is a `string` and `SchemaEntry.variant` is `string | number`, so comparing `keyword` no longer narrows `variant`. Narrow before reading object fields, and return a replacement from `mutate` instead of assigning `entry.schema`.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  visitor: {
    enter: (entry) => {
      console.log(entry.schema.type);
      if (entry.keyword === "properties") console.log(entry.variant.length);
    },
  },
}).scan({ properties: { denied: false, name: { type: "string" } } });
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  visitor: {
    enter: (entry) => {
      if (typeof entry.schema === "boolean") return;
      console.log(entry.schema.type);
      if (entry.keyword === "properties" && typeof entry.variant === "string")
        console.log(entry.variant.length);
    },
  },
}).scan({ properties: { denied: false, name: { type: "string" } } });
```

### Read reference outcomes at exit

`entry.references` replaces `hasReference`, `referencePath`, `referenceResolved` and `referenceSkipped`. It reports each processed keyword and chain step, including canonical identity and a preservation reason. Reference processing happens after enter, so exit is the place to audit final outcomes.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  visitor: {
    exit(entry) {
      console.log(
        entry.hasReference,
        entry.referencePath,
        entry.referenceResolved,
        entry.referenceSkipped,
      );
    },
  },
}).scan({ $ref: "#/missing" });
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  visitor: {
    exit(entry) {
      for (const outcome of entry.references ?? []) {
        console.log(
          outcome.keyword,
          outcome.reference,
          outcome.uri,
          outcome.resolved,
          outcome.skipped,
        );
      }
    },
  },
}).scan({ $ref: "#/missing" });
```

### Expect visits below references that stay in place

A node whose `$ref` is not inlined, because no resolver is configured, the target is missing, the node sits under `$defs` or `definitions`, or the reference closes a cycle, now has its children visited; before, the scan stopped at that node. In draft-04, draft-06 and draft-07 those children are inert, except `definitions` and `$defs`.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const paths: string[] = [];
new JSONSchemaScanner({
  visitor: {
    enter: (entry) => {
      paths.push(entry.path);
    },
  },
}).scan({ $ref: "#/$defs/A", properties: { name: { type: "string" } } });
console.assert(!paths.includes("#/properties/name"));
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const paths: string[] = [];
new JSONSchemaScanner({
  visitor: {
    enter: (entry) => {
      paths.push(entry.path);
    },
  },
}).scan({ $ref: "#/$defs/A", properties: { name: { type: "string" } } });
console.assert(paths.includes("#/properties/name"));
```

### Expect sibling keywords beside inlined references

In 2019-09 and 2020-12, including documents read with the 2020-12 default, a `$ref` with sibling keywords is no longer replaced by its target: the siblings stay and the target is appended to `allOf`. A non-array `allOf` keeps the reference in place with `skipped: 'invalid'`, and a `$ref` without siblings is still replaced by its target. In draft-04, draft-06 and draft-07, string, number and null siblings are still dropped and `$schema`, `definitions` and `$defs` stay beside `allOf`; any other boolean, object or array sibling keeps the reference in place with `skipped: 'relocation'`. `resolveReference` follows the same rules.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const schema = {
  $defs: { Text: { type: "string" } },
  properties: { name: { $ref: "#/$defs/Text", title: "Name" } },
};
new JSONSchemaScanner({
  options: { resolveReference: () => schema.$defs.Text },
})
  .scan(schema)
  .getValue();
// properties.name is { type: 'string' }
```

After:

```typescript
import {
  createReferenceResolver,
  JSONSchemaScanner,
} from "@winglet/json-schema";
const schema = {
  $defs: { Text: { type: "string" } },
  properties: { name: { $ref: "#/$defs/Text", title: "Name" } },
};
new JSONSchemaScanner({
  options: { resolveReference: createReferenceResolver(schema) },
})
  .scan(schema)
  .getValue();
// properties.name is { title: 'Name', allOf: [{ type: 'string' }] }
```

### Move result reads and same-instance scans outside the running scan

Calling `scan` or `getValue` on a running instance now throws `JSONSchemaScanError` with `code: 'scan-in-progress'`, including while async callbacks are pending. Use a separate instance for independent nested work, and read the outer result after completion.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
let nested = false;
const scanner = new JSONSchemaScanner({
  visitor: {
    enter() {
      if (!nested) {
        nested = true;
        scanner.scan({ type: "number" });
      }
      scanner.getValue();
    },
  },
});
scanner.scan({ type: "string" });
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const nested = new JSONSchemaScanner();
const scanner = new JSONSchemaScanner({
  visitor: {
    enter() {
      nested.scan({ type: "number" });
    },
  },
});
scanner.scan({ type: "string" });
const output = scanner.getValue();
```

### Keep identifiers unchanged in `mutate`

A `mutate` result that adds, removes or changes the node's `$id`, `id`, `$schema`, `$anchor`, `$dynamicAnchor` or `$recursiveAnchor` now throws `JSONSchemaScanError` with `code: 'identifier-mutation'`; before, any result was accepted. Change identifiers before scanning, and name the dialect when you remove `$schema`.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "string",
};
new JSONSchemaScanner({
  options: {
    mutate: (entry) => {
      if (entry.path !== "#") return undefined;
      const { $schema, ...rest } = entry.schema;
      return rest;
    },
  },
})
  .scan(schema)
  .getValue();
// { type: 'string' }
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const { $schema, ...rest } = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "string",
};
new JSONSchemaScanner({ options: { defaultDialect: "draft-07" } })
  .scan(rest)
  .getValue();
// { type: 'string' }
```

### Falsy `mutate` results persist across reads

`mutate` may return a boolean schema. Every result other than `undefined`, including `false`, replaces the node on every `getValue()` call; before, a falsy replacement of the root was returned by the first `getValue()` call only, and later calls returned the input. Return `undefined` to leave a node unchanged.

### Reference and dialect behavior

`$id` (`id` in draft-04) identifies resources, `$anchor` names static fragments, and `$dynamicAnchor`/`$recursiveAnchor` express scope that may require preservation. Identifiers and anchors resolve to canonical locations; reference chains are followed until completion or a configured limit, and an active ancestor cycle remains a reference without blocking reuse in siblings. References under `$defs` and `definitions` are still not inlined. Targets at or below inert positions, unsafe dialect or resource moves and dynamic scope also remain in place. Read `entry.references` rather than assuming an output contains no references.

Without a resolver, a subschema with a recognized `$schema` switches to that dialect when the identifier keyword of that dialect (`id` for draft-04, `$id` from draft-06) holds a string and, under a draft-04, draft-06 or draft-07 parent, no string `$ref` sits beside it. The built-in resolver also declines an identifier with a non-empty fragment (in 2019-09 and 2020-12, or in older drafts when it names the enclosing document) and one that does not resolve as a URI reference, so below such an identifier `entry.inert` can differ between a scan with and without the resolver.

Use resolver `dialects` for custom metaschema aliases. `createReferenceResolverAsync` supplies documents only through an explicit `load` hook; the package never performs automatic network or filesystem access. Registered and loaded resources, pending requests and missing results can be reused by a resolver.

`unresolvedReference: 'throw'` rejects missing targets. `limits.referenceChain` and `limits.inlinedNodes` bound expansion. The exported `Dialect` and `ReferenceSkipReason` tables list the supported dialects and the reasons a reference stays in place; their values are plain strings, so literals such as `'2020-12'` and `'relocation'` are accepted too. Scanning errors are `JSONSchemaScanError`, whose `code` is one of the values of the exported `JSONSchemaScanErrorCode` table (for example `JSONSchemaScanErrorCode.SchemaCycle`) and distinguishes duplicate identifiers, invalid resolver results, identifier-changing mutations, reference budgets, physical cycles in the schema object graph and running-instance access. A schema object graph that contains itself now throws `schema-cycle` once the scan passes depth 256, instead of being traversed until `maxDepth`, if set, stops it. Iterative traversal and copying support deep plain JSON containers; custom prototypes, callbacks and loaders keep their own depth behavior.
