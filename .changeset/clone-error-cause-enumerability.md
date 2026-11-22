---
"@winglet/common-utils": patch
---

Keep a non-enumerable `Error.cause` non-enumerable in `clone`. Cloning an error no longer exposes its cause through object spreading, JSON serialization, or `equals`.
