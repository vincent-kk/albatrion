---
"@canard/schema-form": patch
---

After an array `insert`, `remove` or other move in `ValidationMode.OnRequest` or `ValidationMode.None`, the `dataPath` of existing errors now follows the moved item, in `node.errors`, `node.globalErrors` and `FormHandle.getErrors()`. Before, the path kept the address from the last validation and could point at a different item, so `findNode` or `focus` on it reached the wrong row. Errors of a removed item leave the form-wide list. Clearing the array drops them too. `onValidate` and each affected node's error subscribers are notified with the rewritten list, so a component that mirrors `onValidate` shows the same paths as `getErrors()`.
