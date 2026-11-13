# Scanner decisions

Read the installed package's `docs/en/SPECIFICATION.md` for the complete traversal, preservation, relocation and error policy. These decisions help choose the right public operation without inventing an alternate resolver or tree walker.

## Preserve meaning and ownership

Use the built-in resolver when identifiers, anchors, embedded resources or relative references matter. It indexes addressable schema positions and prepares copies that fit the host. The input document and provider target remain caller-owned; a reference that cannot be moved safely is an intentional result, not permission to merge its keys by hand.

The engine fills `entry.references` after enter, so inspect its final outcomes at exit. A chain can produce several outcomes. A successful inline does not imply that every descendant reference disappears: definitions, active ancestor cycles, dynamic scope, invalid positions and relocation can remain. `unresolvedReference: 'throw'` fails missing references only. It does not override these other preservation reasons.

Filter prunes public visits and maxDepth bounds child discovery; neither limits complete resolver indexing/template preparation. Configure `limits` when expansion needs a finite budget. Identifier-changing mutations fail, and identifiers in newly returned descendants are not registered. Restructure identifiers before constructing a resolver.

## Dialects and custom positions

Inert entries are observable but cannot produce output operations or resolve references. Guard `entry.inert` before semantic transformations. A retained old-dialect reference visits other sibling descendants as inert, while definitions and $defs stay definition address containers. To understand why an old-dialect sibling blocks inlining or a cross-resource target is relocation, read the specification's preservation section instead of weakening the condition.

`keywords` replaces the vocabulary; `additionalKeywords` appends with the last duplicate winning. Give the built-in resolver and scanner matching options so a publicly visited custom position is also indexed and inspected. Only descriptor dialect membership changes inertness; it does not remove the position from traversal.

## Custom provider decision

Use `ReferenceResolver` or `ReferenceResolverAsync` from the root declarations. Return tagged resolved/skipped results. A resolved uri is canonical identity, and its target must already preserve meaning in the host context: the engine does not re-enter the target's resource scope. Normalize aliases to one uri to make ancestor cycle detection meaningful. Root, child and dialect are synchronous; only async resolve may suspend. Omit child only when one fixed root context is sufficient, and return the parent context when a lexical child changes nothing.

This provider is sufficient for a canonical registry whose targets contain no identifiers or relative references:

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

## Document supply decision

The package never fetches documents by itself. Use registered resources for documents already available and an explicit async load hook for other document URIs. Load receives an absolute URI without the fragment, and missing/pending results are cached per resolver. Supply a new resolver for changed sources. Waiting is sequential; preloading registered resources can avoid per-reference round trips. Network access, retry, authentication and cancellation remain in the caller's loader.

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

## Result and failure handling

An undefined mutate result keeps the current node; false is a replacement schema. Array containers are skipped as schema nodes, while boolean leaves reach callbacks. The same entry reaches enter and exit and may expose an updated schema at exit.

Call getValue only after scan completes. Calling scan or getValue on a running instance throws scan-in-progress; use another instance for independent work. A failed scan clears its state. Use JSONSchemaScanError.code for package failures and retain the cause of caller/loader errors. Read the specification before broadening a preservation rule or assuming depth safety for non-plain objects: the iterative guarantee covers ordinary JSON containers, not arbitrary getters and callbacks.
