---
"@winglet/style-utils": patch
---

Reuse an injector returned by `styleManagerFactory` after calling `destroyScope`. The factory can be created before the DOM is available. Its first injection needs a document or a supplied shadow root. Each cleanup function removes styles only from the manager that handled its injection, so an earlier cleanup cannot remove styles written after the scope was recreated.
