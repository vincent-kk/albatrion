---
"@winglet/style-utils": patch
---

Preserve complete CSS escapes, including hex digits and their optional whitespace terminator. Compression and scoping keep newline-terminated hex escapes inside quoted strings and retain descendant whitespace following an escape. Escaped URL function names remain opaque, other escaped identifiers remain ordinary functions, and escaped or comment-prefixed `:root` and `:host` tokens keep their global-selector behavior.
