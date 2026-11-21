---
'@canard/schema-form': patch
---

Schemas using a draft-06 or draft-07 fragment-only `$id` load without treating the anchor as a separate schema resource. Empty identifiers and empty fragments also retain their enclosing resource. Resource identifiers follow the declared dialect; draft-04 uses `id`, while newer dialects require `$anchor` for named anchors.
