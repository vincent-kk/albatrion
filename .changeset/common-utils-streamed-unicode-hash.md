---
"@winglet/common-utils": major
---

Breaking change: `Murmur3` returns a different hash for some strings containing UTF-16 code units above `0xFF`, so such hashes persisted by an earlier version no longer match.

A one-shot hash changes only when the string length leaves a remainder of two or three when divided by four, the last two or three code units include a unit above `0xFF`, and that unit's high byte shares a set bit with the low byte of the unit after it. Hashes of ASCII and Latin-1 strings, of `ArrayBuffer` and `Uint8Array` input, and of strings whose length leaves a remainder of zero or one are unchanged. Hashing a string through several `hash()` calls now always equals hashing it at once, so an incremental hash of a string with code units above `0xFF` can change even when its one-shot hash does not.

Rebuild persisted hash indexes from their original strings; the public API is unchanged.

Before:

```ts
// Keys written by an earlier version are used as they are.
const value = index.get(storedHash);
```

After:

```ts
// Recompute every key once from its original string.
for (const [text, value] of entries) index.set(Murmur3.hash(text), value);
const value = index.get(Murmur3.hash(text));
```
