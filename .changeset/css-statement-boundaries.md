---
"@winglet/style-utils": patch
---

styleManagerFactory terminates a final statement at-rule before joining independently injected styles, including styles in a ShadowRoot. A missing final semicolon no longer consumes the following style.
