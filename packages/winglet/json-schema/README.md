# @winglet/json-schema

English · [한국어](docs/ko/SPECIFICATION.md)

Walk and transform schemas, and inline references whose meaning can be preserved. Type guards inspect a schema’s `type`; use a data validator to validate instances.

## Install

```sh
yarn add @winglet/json-schema
```

## Start inlining references

Use `resolveReference` for a synchronous whole-document transformation. This example preserves the input and copies a boolean target. References that require preservation can remain in the result.

<!-- example: quick -->

```typescript
import { resolveReference } from '@winglet/json-schema';

const schema = {
  $defs: { Allowed: false },
  properties: { value: { $ref: '#/$defs/Allowed' } },
};
const output = resolveReference(schema);
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.properties.value === false);
console.assert(schema.properties.value.$ref === '#/$defs/Allowed');
```

## Choose the workflow

- Use `JSONSchemaScanner` with `createReferenceResolver` when you need visitors, filtering or transformation. Without a resolver, scanning does not inline references.
- Use `JSONSchemaScannerAsync` with `createReferenceResolverAsync` when callbacks or document supply must be awaited. The caller’s `load` function supplies documents; the package performs no automatic network or filesystem access.
- Schema guards also have the `@winglet/json-schema/filter` subpath; synchronous and asynchronous scanners have `/scanner` and `/async-scanner`. `Dialect`, `DEFAULT_KEYWORDS` and the keyword descriptor types have `/keyword`, which loads no scanner code. Import resolver factories from the package root.

## Read the behavior and limits

The [specification](docs/en/SPECIFICATION.md) explains callback timing, output ownership, dialects and `inert`, custom resolvers, preservation reasons, errors and the scope of depth safety. Installed declarations are the authority for exact signatures.

Handle boolean nodes before reading object fields, and inspect reference outcomes in `entry.references` during `exit`. Without recorded transformations, `getValue()` returns the original, so its result is not always an owned copy.

## Agent guidance

Packaged usage guidance starts at the [skill](docs/agents/skills/json-schema-skill/SKILL.md).

## License

MIT.
