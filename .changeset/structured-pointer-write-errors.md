---
"@winglet/json": patch
---

Report failed `setValue` writes below primitive values as `JSONPointerError` with code `JSON_POINTER.INVALID_INPUT`. Consumers can handle these invalid paths through the documented error interface instead of receiving a plain `TypeError`.
