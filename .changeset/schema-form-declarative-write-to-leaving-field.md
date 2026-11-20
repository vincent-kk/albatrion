---
"@canard/schema-form": patch
---

When one update both makes a field inactive and triggers a `controls.injectTo` or `controls.derived` write that names a value for that field (for example a gate change and the source write in the same `node.batch()`), the named value is now kept for the field, as it is when the field became inactive in an earlier update. The field's exit policy runs first: a value the write names replaces the result of `unsetOnInactive` or `inactiveValue`, and a field the write omits keeps what that policy left. Before, the field kept its previous value and the written value was lost. This holds however the write names the field: through its parent object, by the field's own path (`{ '../y': value }`), or by a path below an object that becomes inactive in the same update. It also applies to the fields of a virtual group, including a group inside such an object.
