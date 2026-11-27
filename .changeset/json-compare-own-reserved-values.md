---
"@winglet/json": patch
---

`compare` reads reserved member names as own data throughout a document. If a getter removes an own reserved member during traversal, a strict patch no longer uses an inherited value as the old value of that member.
