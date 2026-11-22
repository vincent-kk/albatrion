---
"@winglet/common-utils": patch
---

The published `isBuffer` declarations work in browser TypeScript projects without Node globals. Node projects retain native Buffer narrowing; browser projects narrow to its Uint8Array base.
