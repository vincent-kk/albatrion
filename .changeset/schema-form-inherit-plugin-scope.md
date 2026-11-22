---
'@canard/schema-form': patch
---

A nested `FormProvider` that omits `pluginScope` inherits the enclosing provider's plugin registry. Adding section settings no longer switches its forms to another application's shared renderers or validator. A root provider still uses the realm registry by default.
