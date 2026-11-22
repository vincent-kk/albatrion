---
"@winglet/common-utils": major
---

Breaking change for persisted Unicode hash values: `Murmur3` now uses the same string combination rule for complete blocks, tails, and incremental calls. Every partition of a string produces its one-shot hash.

ASCII, Latin-1 and byte-input hashes remain unchanged. One-shot values can change only when the final partial block contains two or three UTF-16 code units and the high byte of one unit overlaps set bits in the low byte of the next unit. A one-unit tail and strings with no partial block are unchanged. Incremental Unicode hashes that disagreed with one-shot hashing also change.

Rebuild persisted hash indexes from their original strings; the public API is unchanged.

Before:
```ts
cache.get(persistedHash);
```

After:
```ts
cache.set(Murmur3.hash(originalText), value);
```
