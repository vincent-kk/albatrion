---
"@winglet/common-utils": patch
---

Clarify that `isEmpty` recognizes Map and Set sizes only in the current realm. Collections from an iframe or another realm use the own enumerable key check and can appear empty despite having entries.
