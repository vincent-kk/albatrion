---
"@lerx/promise-modal": patch
---

Document that hiding a caller with React Activity cancels its pending `useModal` requests just like unmounting, because React runs effect cleanup on hide.
