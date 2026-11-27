---
"@winglet/data-loader": patch
---

Correct the DataLoader query example to queue load requests together before awaiting their results, so the documented single batch is actually produced.
