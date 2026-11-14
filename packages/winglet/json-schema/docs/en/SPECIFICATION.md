# @winglet/json-schema — Behavior specification

[Quick start](../../README.md) · [한국어](../ko/SPECIFICATION.md)

## Scope

Use the scanners for schema analysis and transformation. They do not evaluate data instances. Runtime guards inspect type labels; inferred TypeScript values are partial models, not proof of validation. Examples below are independent programs. The package ships ESM and CommonJS with ES2020 syntax. URI resolution requires the host’s URL implementation.

## Traversal and ownership

A node runs `filter` → `mutate` → `enter` → reference processing → child discovery → `exit`. A false filter prunes the node and descendants without enter/exit. `maxDepth` is inclusive, with root at zero; processing at that boundary still runs. Child occurrence pointers are captured after the parent’s processing, before visiting its first child. Vocabulary order determines keyword order; maps use own-key enumeration order and lists use increasing indexes. Array containers themselves are not schema nodes. Boolean schemas are leaves and reach callbacks, including false.

`path` is an escaped schema pointer rooted at `#`; `dataPath` starts empty and extends for properties and tuple positions. The same entry object reaches enter and exit, so keep a separate snapshot if you need its earlier contents. The engine fills `references` after enter; exit observes completed chain outcomes.

Scanning records transformations without writing to inputs, mutation returns or resolver targets. The first `getValue()` materializes the result and caches it, including false. With no operation it returns the input by identity. With operations, plain JSON containers are copied and repeated object occurrences receive separate copies. `getValue()` is synchronous in both scanners. A failed scan clears state; `getValue()` before a successful scan returns undefined. While a scan is running, the same instance’s `scan` and `getValue` throw `scan-in-progress`; use a different instance for independent work.

<!-- example: walk -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema/scanner';

const paths: string[] = [];
const schema = { properties: { name: { type: 'string' }, denied: false } };
const scanner = new JSONSchemaScanner({
  visitor: {
    enter(entry) {
      if (entry.keyword === 'properties') paths.push(entry.dataPath);
      if (typeof entry.schema === 'boolean') return;
      console.assert(typeof entry.schema === 'object');
    },
  },
});
console.assert(scanner.scan(schema).getValue() === schema);
console.assert(paths.join(',') === '/name,/denied');
```

## Transformations

Return a replacement from `mutate`; do not write through `entry.schema`. Undefined alone means “keep this node”; false is a real replacement. Children are discovered from the replacement. Inert entries still reach callbacks, but their replacements are not recorded in output, so guard with `entry.inert` when you only intend semantic changes.

Mutations cannot add, remove or change the current node’s `$id`, `id`, `$schema`, `$anchor`, `$dynamicAnchor` or `$recursiveAnchor`; this throws `identifier-mutation`. Identifiers introduced deeper in a replacement are not registered. The resolver indexes the document supplied at construction, so perform identifier restructuring before constructing it and keep supplied documents immutable while reusing a resolver.

<!-- example: mutate -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema';

const schema = { properties: { name: { type: 'string' }, denied: false } };
const output = new JSONSchemaScanner({
  options: {
    mutate(entry) {
      if (entry.inert || typeof entry.schema === 'boolean') return;
      if (entry.schema.type === 'string')
        return { ...entry.schema, minLength: 1 };
    },
  },
})
  .scan(schema)
  .getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.properties.name.minLength === 1);
console.assert(!('minLength' in schema.properties.name));
```

## Built-in resolution

`resolveReference(schema, options)` is the synchronous convenience form. Use a scanner and resolver factory when you need callbacks or scan options. The root is indexed at construction; `resources` are documents keyed by absolute retrieval URI and indexed on first lookup. `baseURI` supplies an address for an anonymous root. `$id` creates resource bases; draft-04 also uses `id`. `$anchor` declares static fragments in 2019-09 and 2020-12; draft-06/07 also accept fragment-only `$id` names and draft-04 uses `id`. Anchors and JSON Pointers resolve to canonical locations, so aliases share cycle identity. Pointer fragments are percent-decoded once, then tokens unescape `~1` and `~0`; only own properties are followed.

Targets are prepared for their host resource, with reference strings rewritten when a safe move needs it. This preparation inspects the entire target independently of the public filter and maxDepth. Matching target/host templates are cached by the resolver, then each inline occurrence is copied to avoid output aliases. Definition containers remain addressable.

<!-- example: inline -->

```typescript
import {
  JSONSchemaScanner,
  createReferenceResolver,
} from '@winglet/json-schema';
import type { ReferenceOutcome } from '@winglet/json-schema';

const schema = {
  $id: 'https://schemas.example/root.json',
  properties: { name: { $ref: 'types.json#/$defs/Text' } },
};
const resolver = createReferenceResolver(schema, {
  resources: {
    'https://schemas.example/types.json': {
      $defs: { Text: { type: 'string' } },
    },
  },
});
const outcomes: ReferenceOutcome[] = [];
const scanner = new JSONSchemaScanner({
  options: { resolveReference: resolver },
  visitor: { exit: (entry) => outcomes.push(...(entry.references ?? [])) },
});
const output = scanner.scan(schema).getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.properties.name.type === 'string');
console.assert(outcomes.some((outcome) => outcome.resolved));
console.assert(schema.properties.name.$ref === 'types.json#/$defs/Text');
```

## Asynchronous document supply

The package never fetches documents itself. The synchronous resolver only uses the root and registered resources. The asynchronous resolver calls your `load` only for an unavailable absolute document URI, without its fragment; registered resources take precedence. Supply undefined for a missing document. Pending requests and their completed/missing results are shared per URI by that resolver; loader errors propagate. Create a fresh resolver when the source set changes.

Await `JSONSchemaScannerAsync.scan()` before using synchronous getValue. Its callbacks and resolver resolve operation are awaited sequentially; root/child/dialect remain synchronous. The synchronous scanner does not wait for callback return values; use the async scanner even when an async visitor is assignable to a void-returning callback. A custom resolver returning a Promise to the synchronous scanner is an invalid result. Fetching, retries, authentication and cancellation belong to the caller’s loader.

<!-- example: load -->

```typescript
import {
  JSONSchemaScannerAsync,
  createReferenceResolverAsync,
} from '@winglet/json-schema';
import type { UnknownSchema } from '@winglet/json-schema';

const schema = {
  $id: 'https://schemas.example/root.json',
  properties: { first: { $ref: 'deny.json' }, second: { $ref: 'deny.json' } },
};
const documents: Record<string, UnknownSchema | boolean> = {
  'https://schemas.example/deny.json': false,
};
const requested: string[] = [];
const resolver = createReferenceResolverAsync(schema, {
  load: async (uri) => {
    requested.push(uri);
    return documents[uri];
  },
});
const scanner = new JSONSchemaScannerAsync({
  options: { resolveReference: resolver },
});
await scanner.scan(schema);
const output = scanner.getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(
  output.properties.first === false && output.properties.second === false,
);
console.assert(requested.join(',') === 'https://schemas.example/deny.json');
```

## Custom resolver protocol

Use the published `ReferenceResolver` or `ReferenceResolverAsync` type. `root` establishes the lexical context; optional `child` enters an original lexical child. Return the same context object when unchanged; omitting child keeps the root context throughout. `dialect` reports the effective resource dialect.

Resolve returns a tagged result, never a bare schema or undefined. A resolved result’s uri is canonical identity: aliases for one target must return the same uri so cycle tracking works. Its target must already mean the same thing at the host position. The engine does not re-enter that target’s identifier scope. A custom provider is responsible for relocation and dynamic-scope safety; use the built-in provider when you need those guarantees. In this example the canonical registry targets contain no identifiers or relative references.

<!-- example: custom -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema';
import type { ReferenceResolver, UnknownSchema } from '@winglet/json-schema';

const registry = new Map<string, UnknownSchema | boolean>([
  ['urn:example:Text', { type: 'string' }],
]);
const resolver: ReferenceResolver<void> = {
  root: () => undefined,
  dialect: () => '2020-12',
  resolve(reference) {
    const target = registry.get(reference);
    return target === undefined
      ? { status: 'skipped', reason: 'unresolved' }
      : { status: 'resolved', uri: reference, target };
  },
};
const output = new JSONSchemaScanner({
  options: { resolveReference: resolver },
})
  .scan({ $ref: 'urn:example:Text' })
  .getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.type === 'string');
```

## Dialects and inert positions

The default fallback is 2020-12. The exported Dialect table names the supported dialects (Dialect.Draft04 through Dialect.Draft202012); its entries are the same strings, so either spelling is accepted wherever a dialect is expected. `$ref` is recognized in every supported dialect, `$dynamicRef` only in 2020-12, and `$recursiveRef` only in 2019-09. A recognized root/resource `$schema` selects its dialect; supported HTTP/HTTPS spellings and trailing # are normalized. Resolver `dialects` can map custom metaschema URIs to supported dialects. Unknown declarations inherit the surrounding/fallback dialect. An embedded resource inherits its parent unless it declares a known dialect. With a resolver, configure its fallback too; scanner defaultDialect is the fallback when no provider supplies a dialect.

Traversal uses the union of schema positions from draft-04, draft-06, draft-07, 2019-09 and 2020-12. Without resolution or mutation, changing `$schema` changes inertness rather than the visit paths/order. Positions outside the resource’s dialect and their descendants have inert=true: callbacks still run, but references and output operations are suppressed and identifiers are not indexed. Boolean leaves are inert in draft-04. For example, contains is active from draft-06, prefixItems in 2020-12, and tuple-form items through 2019-09. Modern dialects still recognize definitions and schema-valued dependencies; string-array dependencies are not schemas.

<!-- example: inert -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema';

const inactive: string[] = [];
new JSONSchemaScanner({
  options: { defaultDialect: 'draft-04' },
  visitor: {
    enter: (entry) => {
      if (entry.inert) inactive.push(entry.path);
    },
  },
}).scan({ contains: { type: 'string' }, additionalProperties: false });
console.assert(inactive.includes('#/contains'));
console.assert(inactive.includes('#/additionalProperties'));
```

## Vocabulary selection

The default vocabulary includes composition, conditionals, object/array applicators, definition containers and schema-valued dependencies. `keywords` replaces that entire vocabulary; `additionalKeywords` appends to the selected one. The last duplicate wins in both kind and position. Descriptor dialects control inertness, not discovery. `objectMap` extends dataPath with its key; `schemaMap` does not. Schema lists visit their elements without visiting the container. `DEFAULT_KEYWORDS`, `Dialect`, `KeywordDescriptor` and `KeywordKind` are also exported from `@winglet/json-schema/keyword`, which loads no scanner code.

Use identical vocabulary options for the built-in resolver and scanner so indexing, relocation checks and public traversal agree. The convenience resolveReference function passes its vocabulary to both. Keyword names and map keys are JSON Pointer escaped, including custom names.

<!-- example: keywords -->

```typescript
import {
  JSONSchemaScanner,
  createReferenceResolver,
} from '@winglet/json-schema';
import type { KeywordDescriptor } from '@winglet/json-schema';

const additionalKeywords: KeywordDescriptor[] = [
  { keyword: 'x/schema', kind: 'schema' },
];
const schema = {
  'x/schema': { type: 'string' },
  properties: { value: { $ref: '#/x~1schema' } },
};
const resolver = createReferenceResolver(schema, { additionalKeywords });
const visited: string[] = [];
const output = new JSONSchemaScanner({
  options: { additionalKeywords, resolveReference: resolver },
  visitor: { enter: (entry) => visited.push(entry.path) },
})
  .scan(schema)
  .getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(visited.includes('#/x~1schema'));
console.assert(output.properties.value.type === 'string');
```

## Reference preservation and sibling keywords

Inlinable chains outside definitions are followed to completion. Canonical identities are active only on the ancestor path; independent siblings can use the same target. Audit exit’s entry.references: each outcome carries the written reference and keyword, canonical uri when known, resolved, and skipped when preserved. The exported ReferenceSkipReason table names every skipped value, for example ReferenceSkipReason.Relocation.

| skipped      | Meaning                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `definition` | A reference in a definition container or its descendants during resolver-enabled scanning; definitions remain address stores. |
| `cycle`      | An otherwise inlinable canonical target is already active on the ancestor path.                                               |
| `unresolved` | No resolver is configured, or the address/document is unavailable.                                                            |
| `dynamic`    | The lookup needs a dynamic or recursive anchor rather than static binding.                                                    |
| `relocation` | Moving the target cannot guarantee equivalent meaning and existing addresses.                                                 |
| `invalid`    | The target or composition position cannot be inlined; distinct from a malformed protocol result.                              |

unresolvedReference defaults to keep; throw fails only unresolved outcomes. It does not force other preserved references to disappear. Inert positions do not process references and may have no outcomes.

### Draft-07 and below

Siblings of $ref are ignored for evaluation. Retaining the reference still visits sibling children: definitions and $defs remain ordinary definition positions, while other sibling descendants are inert. Identifiers inside those inert regions are not indexed. A sibling identifier on the $ref node itself is ignored too.

Before inlining, classify the other own keys. Keep $schema, definitions and $defs. Drop other keys only when their values are strings, numbers or null. A boolean, object or array under any other key blocks inlining with relocation, because deleting it can remove an address and retaining it beside allOf can activate ignored evaluation. With KEEP keys only, wrap as `{ ...keptKeys, allOf: [targetCopy] }`; without kept keys, replace the node with the target copy.

<!-- example: relocation -->

```typescript
import {
  JSONSchemaScanner,
  createReferenceResolver,
} from '@winglet/json-schema';

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/Text',
  hidden: false,
  definitions: { Text: { type: 'string' } },
};
const reasons: string[] = [];
const output = new JSONSchemaScanner({
  options: { resolveReference: createReferenceResolver(schema) },
  visitor: {
    exit: (entry) => {
      for (const outcome of entry.references ?? [])
        if (outcome.skipped) reasons.push(outcome.skipped);
    },
  },
})
  .scan(schema)
  .getValue();
console.assert(output === schema);
console.assert(reasons.includes('relocation'));
```

### 2019-09 and later

Siblings remain and apply. A sole reference with no other keys replaces the node; otherwise remove only the inlined keywords and append target branches to the end of existing allOf. A non-array allOf preserves the reference as invalid.

### Built-in relocation boundary

The original reference remains when:

- the target is at/below an inert or unrecognized schema position;
- moving it changes the dialect of the target or a removed resource boundary;
- a rewritten copy contains `$recursiveRef`, or a removed resource defines `$dynamicAnchor`/`$recursiveAnchor` scope;
- reference/identifier occurrences outside recognized schema positions and default/const/enum/examples data cannot be rewritten safely;
- a URI cannot be rewritten, including a cross-resource address to an anonymous document without an identifier or base.

An identifier-free target in the same resource can be copied directly. Other safe moves remove identifier boundaries and rewrite reference URIs from their original bases. Data-keyword values are not rewritten. A `$dynamicRef` whose initial fragment is declared by `$dynamicAnchor` stays dynamic; otherwise it behaves like `$ref`. A `$recursiveRef` targeting `$recursiveAnchor`:true stays dynamic.

Relative document paths cannot be formed against a non-hierarchical base URI. Supply absolute references or a hierarchical baseURI. This example returns an unresolved outcome.

<!-- example: opaque -->

```typescript
import { createReferenceResolver } from '@winglet/json-schema';

const schema = { $ref: 'child.json' };
const resolver = createReferenceResolver(schema, {
  baseURI: 'urn:example:root',
  resources: { 'urn:example:child.json': { type: 'string' } },
});
const context = resolver.root(schema);
const relative = resolver.resolve('child.json', '$ref', context);
const absolute = resolver.resolve('urn:example:child.json', '$ref', context);
console.assert(
  relative.status === 'skipped' && relative.reason === 'unresolved',
);
console.assert(absolute.status === 'resolved');
```

## Limits and errors

limits.referenceChain bounds a replacement chain at one position (default 32); limits.inlinedNodes bounds total inlined schema nodes per scan (default 1,000,000). These are independent of maxDepth and public pruning does not constrain full target preparation.

Use JSONSchemaScanError.code to distinguish failures. The exported JSONSchemaScanErrorCode table names every code; compare against its entries, such as JSONSchemaScanErrorCode.SchemaCycle, rather than typing the string. User callback and loader exceptions propagate unchanged.

| code                      | Meaning                                                                        |
| ------------------------- | ------------------------------------------------------------------------------ |
| `duplicate-identifier`    | Distinct locations declare one identifier.                                     |
| `reference-chain-limit`   | The replacement-chain budget was exceeded.                                     |
| `inlined-node-limit`      | The inlined-node budget was exceeded.                                          |
| `unresolved-reference`    | A reference is unavailable under the throw policy.                             |
| `invalid-resolver-result` | The protocol tag/URI/target is invalid, or a sync resolver returns a thenable. |
| `identifier-mutation`     | A mutation changes the current node’s identifier keywords.                     |
| `schema-cycle`            | Traversal or plain-container copying finds a physical ancestry cycle.          |
| `scan-in-progress`        | The running instance is scanned or read again.                                 |

<!-- example: errors -->

```typescript
import {
  JSONSchemaScanError,
  JSONSchemaScanErrorCode,
  JSONSchemaScanner,
} from '@winglet/json-schema';

const scanner = new JSONSchemaScanner({
  options: { unresolvedReference: 'throw' },
});
let caught = false;
try {
  scanner.scan({ $ref: '#/missing' });
} catch (error) {
  if (!(error instanceof JSONSchemaScanError)) throw error;
  caught = true;
  console.assert(error.code === JSONSchemaScanErrorCode.UnresolvedReference);
}
console.assert(caught && scanner.getValue() === undefined);
```

## Scope of depth safety

Traversal and copying of plain objects/arrays use no call-stack recursion. Repeated aliases are not cycles; physical ancestor cycles are schema-cycle errors. Sparse holes and own **proto** data keys are preserved; symbol keys on plain containers are not copied. Non-plain values delegate to a generic copier, so the guarantee does not extend to class instances, user getters, callbacks or loaders. Memory and explicit reference budgets still apply rather than a fixed schema-depth ceiling. Cycles in data keywords may be discovered only when a copy is needed; an unchanged getValue returns the input without cloning it.

## Schema guards and inference

Guards inspect type. Union guards accept nullable-array and ordinary spellings, and number guards include integer. Nullable-only guards require null in a type array; OpenAPI nullable:true is not their criterion. Comparison functions have a separate policy that normalizes OpenAPI nullable:true. hasNullInType tests array membership, not a pure type:null.

<!-- example: guards -->

```typescript
import {
  hasNullInType,
  isCompatibleSchemaType,
  isIdenticalSchemaType,
  isStringSchema,
} from '@winglet/json-schema/filter';

console.assert(isStringSchema({ type: ['string', 'null'] }));
console.assert(!hasNullInType({ type: 'null' }));
console.assert(
  isIdenticalSchemaType(
    { type: ['string', 'null'] },
    { type: 'string', nullable: true },
  ),
);
console.assert(!isIdenticalSchemaType({ type: 'number' }, { type: 'integer' }));
console.assert(isCompatibleSchemaType({ type: 'number' }, { type: 'integer' }));
```

Preserve literal information with as const. InferValueType models partial values: even required object keys are optional, and objects stay open unless additionalProperties:false. Inferred values stay mutable for readonly schema declarations. Do not treat inference as static validation of composition/reference constraints; use an explicit value type and validation for a required validated shape. InferJSONSchema chooses a schema family from a value type; it does not generate object properties.

<!-- example: types -->

```typescript
import type { InferJSONSchema, InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: { id: { type: 'number' } },
  required: ['id'],
  additionalProperties: false,
} as const;
type Value = InferValueType<typeof schema>;
const partial: Value = {};
partial.id = 1;
const nameSchema: InferJSONSchema<string> = { type: 'string', minLength: 1 };
console.assert(nameSchema.type === 'string');
```

Finite prefixItems produces a mutable tuple with optional positions. items:false closes it, omitted/true items adds an any[] rest, and an items schema types the rest after the prefix. minItems is not used for inference. Widened prefixes and legacy items arrays are outside this finite-tuple inference and unmodeled shapes retain broad fallbacks. Recursive types do not extend TypeScript’s own instantiation limits.

<!-- example: tuple -->

```typescript
import type { InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'array',
  prefixItems: [{ type: 'string' }, { type: 'number' }],
  items: false,
} as const;
type Pair = InferValueType<typeof schema>;
const empty: Pair = [];
const pair: Pair = ['name', 1];
pair[0] = 'changed';
console.assert(empty.length === 0 && pair[0] === 'changed');
```
