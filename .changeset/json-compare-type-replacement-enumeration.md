---
"@winglet/json": patch
---

`compare` skips comparison-time key enumeration when replacing an array with an object or an object with an array. A Proxy's `ownKeys` trap can still run when an immutable patch needs to copy a value. Call `Object.keys` explicitly if your code needs key enumeration before comparing.
