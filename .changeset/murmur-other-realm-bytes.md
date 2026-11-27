---
"@winglet/common-utils": patch
---

Accept `ArrayBuffer` and `Uint8Array` values from other realms in all `Murmur3` entry points. Identical bytes produce the same hash across realms.
