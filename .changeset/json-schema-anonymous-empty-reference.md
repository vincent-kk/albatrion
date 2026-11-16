---
"@winglet/json-schema": patch
---

Resolve an empty reference to the current document when its base URI is missing, as in a root with no `$id` or `baseURI`, or non-hierarchical, such as `urn:` or `tag:`. Synchronous and asynchronous resolvers now treat an empty `$ref` or `$dynamicRef` like `#` in these cases: strict reference resolution no longer throws an unresolved-reference error for these self-references, and a target that contains one can be inlined wherever the same target containing `#` can. An empty `$recursiveRef`, which is not valid, is now reported there as invalid instead of unresolved, as it already was under hierarchical base URIs. Empty references and identifiers under hierarchical base URIs resolve exactly as before.

A non-hierarchical `baseURI`, such as `urn:example:root`, is now used as the root address instead of being ignored, as a hierarchical one already is. Outcomes for that root report URIs under that base, such as `urn:example:root#/$defs/a` instead of `#/$defs/a`. References to that address now resolve to the root itself, so a `resources` entry or `load` result under the same URI is no longer used for them, and a subschema whose `$id` equals that base is reported as a duplicate identifier.
