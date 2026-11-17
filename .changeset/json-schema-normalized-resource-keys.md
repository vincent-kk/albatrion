---
"@winglet/json-schema": patch
---

`resources` keys of `createReferenceResolver`, `createReferenceResolverAsync` and `resolveReference` now match references after the same URI normalization references receive, so a key such as `https://Ex.Example/types.json` is found by `$ref: "types.json"` under `https://ex.example/`. Before, only a key already written in normalized form was found. Two keys that normalize to one address must register the same document; different documents throw a duplicate identifier error naming both keys when a lookup needs the normalized keys.
