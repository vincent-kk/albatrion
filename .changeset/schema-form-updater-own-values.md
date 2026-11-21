---
'@canard/schema-form': patch
---

Updaters passed to `FieldNode.setValue` inside a batch or to a field input's `onChange` receive `undefined` for an absent field named `constructor`, `toString`, or another inherited property. These calls now read the same data as an ordinary updater.
