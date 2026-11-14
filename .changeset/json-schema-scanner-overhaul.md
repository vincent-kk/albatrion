---
"@winglet/json-schema": minor
---

This is a breaking change to schema traversal, reference resolution, and scanner lifecycle behavior.

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

### Use the wider default vocabulary and inspect inertness

`EXTENDED_KEYWORDS` is removed. The default vocabulary includes the extended applicators and schema-valued `dependencies`. Positions from other supported dialects are still visited with `entry.inert`; skip semantic transformations there. `keywords` replaces the complete vocabulary, while `additionalKeywords` appends and the last duplicate wins.

Before:

```typescript
import {
  DEFAULT_KEYWORDS,
  EXTENDED_KEYWORDS,
  JSONSchemaScanner,
} from "@winglet/json-schema";
new JSONSchemaScanner({
  options: { keywords: [...DEFAULT_KEYWORDS, ...EXTENDED_KEYWORDS] },
}).scan({ contains: { type: "string" } });
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  options: { defaultDialect: "2020-12" },
  visitor: {
    enter(entry) {
      if (entry.inert) return;
      console.log(entry.path);
    },
  },
}).scan({ contains: { type: "string" } });
```

### Handle boolean nodes before reading object fields

`SchemaEntry.schema` is `Schema | boolean`. Boolean leaves now reach filters, transformations and visitors, so code that assumes every entry has object fields must narrow first.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  visitor: {
    enter: (entry) => {
      console.log(entry.schema.type);
    },
  },
}).scan({ properties: { denied: false } });
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
new JSONSchemaScanner({
  visitor: {
    enter(entry) {
      if (typeof entry.schema === "boolean") {
        console.log(entry.schema);
        return;
      }
      console.log(entry.schema.type);
    },
  },
}).scan({ properties: { denied: false } });
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

### Treat arrays as containers, not schema nodes

Array-valued children are skipped as schemas. A schema-list keyword still visits its schema elements; it does not visit the array itself. Adjust analysis counts that included malformed array-valued schema positions.

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
}).scan({ not: [] });
console.assert(paths.includes("#/not"));
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
}).scan({ not: [] });
console.assert(!paths.includes("#/not"));
```

### Move result reads and same-instance scans outside the running scan

Calling `scan` or `getValue` on a running instance now throws `JSONSchemaScanError` with `code: 'scan-in-progress'`, including while async callbacks are pending. Use a separate instance for independent nested work, and read the outer result after completion. A failed scan clears its state.

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

### Keep falsy replacements across result reads

Every non-undefined `mutate` result is a replacement, including false. Subsequent `getValue()` calls retain that falsy result instead of reverting to the input. JavaScript callbacks returning other falsy non-undefined values also record replacements; return undefined when the node should stay unchanged. `entry.schema` is readonly to callers: return a replacement instead of changing the input.

Before:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const scanner = new JSONSchemaScanner({
  options: { mutate: () => false },
}).scan({ type: "string" });
console.assert(scanner.getValue() === false);
console.assert(typeof scanner.getValue() === "object");
```

After:

```typescript
import { JSONSchemaScanner } from "@winglet/json-schema";
const scanner = new JSONSchemaScanner({
  options: { mutate: () => false },
}).scan({ type: "string" });
console.assert(scanner.getValue() === false);
console.assert(scanner.getValue() === false);
const unchanged = new JSONSchemaScanner({
  options: { mutate: () => undefined },
})
  .scan({ type: "string" })
  .getValue();
console.assert(typeof unchanged === "object");
```

### Preserve references whose meaning cannot be fixed statically

`$id` (and draft-04 `id`) identifies resources, `$anchor` names static fragments, and `$dynamicAnchor`/`$recursiveAnchor` express scope that may require preservation. Identifiers and anchors resolve to canonical locations; chains continue until completion or a configured limit, and an active ancestor cycle remains a reference without blocking reuse in siblings. Definitions remain address containers. In 2019-09 and 2020-12, sibling keywords keep applying and target branches append to `allOf`.

In draft-07 and below, only string, number and null siblings are discarded; `$schema`, `definitions` and `$defs` are retained. Any other boolean, object or array sibling preserves the reference as `'relocation'`. This avoids deleting addressable locations or activating ignored sibling evaluation. Targets at/below inert positions, unsafe dialect/resource moves and dynamic scope also remain in place. Read `entry.references` rather than assuming an output contains no references.

Use `defaultDialect` for documents without a recognized declaration, and resolver `dialects` for custom metaschema aliases. `createReferenceResolverAsync` supplies documents only through an explicit `load` hook; the package never performs automatic network or filesystem access. Registered and loaded resources, pending requests and missing results can be reused by a resolver.

`unresolvedReference: 'throw'` rejects missing targets. `limits.referenceChain` and `limits.inlinedNodes` bound expansion. The supported dialects and the reasons a reference stays in place are exported as the `Dialect` and `ReferenceSkipReason` tables; their entries are the same strings as before, so literals keep working. `JSONSchemaScanError.code` is typed as a union of the entries in the exported `JSONSchemaScanErrorCode` table (for example `JSONSchemaScanErrorCode.SchemaCycle`), and distinguishes duplicate identifiers, invalid resolver results, identifier-changing mutations, reference budgets, physical cycles and running-instance access. Iterative traversal and copying support deep plain JSON containers; custom prototypes, callbacks and loaders keep their own depth behavior.
