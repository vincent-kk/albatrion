---
"@winglet/style-utils": patch
---

Preserve CSS escape context during compression and scoping. Escaped quotes and punctuation no longer start strings or structural delimiters; complete hex escapes include their optional whitespace terminator, so following descendant whitespace survives and newline terminators stay inside quoted strings. Escaped URL function names remain opaque while other escaped identifiers remain ordinary functions.
