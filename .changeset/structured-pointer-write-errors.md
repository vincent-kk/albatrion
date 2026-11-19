---
"@winglet/json": patch
---

Report failed `setValue` writes below primitive values as `JSONPointerError` with code `INVALID_INPUT`. Consumers can handle these invalid paths through the documented error interface instead of receiving a plain `TypeError`.
