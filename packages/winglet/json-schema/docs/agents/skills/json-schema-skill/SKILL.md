---
name: json-schema-skill
description: 'Use @winglet/json-schema for schema traversal, immutable transformations, context-aware reference resolution, dialect-aware analysis, and schema type inference.'
---

# Process JSON schemas through the public API

Use this skill when a task needs schema visitors, reference inlining, custom document supply, schema guards or inferred TypeScript value types.

## Choose the operation

- For synchronous inlining without visitors, use `resolveReference(schema, options)`.
- For visitors or transformations, pair `JSONSchemaScanner` with `createReferenceResolver`; scanning alone does not inline references.
- When callbacks or document supply need waiting, pair `JSONSchemaScannerAsync` with `createReferenceResolverAsync` and await `scan` before calling synchronous `getValue`.
- For custom resolution, implement the published resolver object protocol; read the host-valid target and canonical identity requirements before supplying targets.
- For type inference and guards, distinguish a schema type from a validated data instance.

## Read before implementing

| Work                                                       | Guidance                                         |
| ---------------------------------------------------------- | ------------------------------------------------ |
| Traversal, inlining, loading, dialects or custom providers | [Scanner decisions](knowledge/schema-scanner.md) |
| Value inference, tuples, nullable or required fields       | [Type decisions](knowledge/type-inference.md)    |

Handle boolean entries before reading object fields. Transform by returning a value from mutate, inspect reference outcomes at exit, and preserve skipped references rather than forcing complete expansion. Treat inputs and resolver documents as immutable. `getValue()` returns the original when nothing changes, so do not assume that every result is an owned copy.

The installed package declarations define exact public signatures. The package's `docs/en/SPECIFICATION.md` is the complete policy reference; locate it in the installed package rather than assuming the skill's injection directory contains the package source.
