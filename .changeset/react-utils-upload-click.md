---
"@winglet/react-utils": patch
---

Prevent `withUploader` from firing ancestor click handlers twice when its hidden file input opens. The original component click still reaches its handlers normally.
