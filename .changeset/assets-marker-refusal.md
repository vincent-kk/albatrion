---
"@slats/agents-assets-sync": patch
---

Behavior change: documents with unmatched, nested or damaged managed markers that previously completed silently now fail with exit code 1 and remain unchanged. Trailing spaces and tabs after a complete marker remain accepted; leading indentation and other malformed syntax are refused.

Refuse unmatched, nested or damaged managed markers with the document path and line instead of appending duplicate rule blocks. Closed marker examples in supported fences and comments remain literal prose.
