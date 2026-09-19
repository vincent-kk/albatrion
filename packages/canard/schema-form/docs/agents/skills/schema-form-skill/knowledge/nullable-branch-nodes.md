# Nullable Objects and Arrays

What `null` means on a node that owns children (`type: ['object', 'null']`, `type: ['array', 'null']`), what turns it into an object/array, and what its fields hold meanwhile. Authoritative text: `docs/en/SPECIFICATION.md` → "Nullable Objects and Arrays".

## Three States

| Value       | Meaning                 | Parent receives                                           |
| ----------- | ----------------------- | --------------------------------------------------------- |
| `null`      | the node does not exist | `null` — `omitEmpty` never touches it                     |
| `{}` / `[]` | exists, empty           | omitted by `omitEmpty` (default), kept when it is `false` |
| `undefined` | unset                   | key omitted                                               |

The form never converts one state into another by itself. If a consumer's schema gives `null` and `{}` different meanings (e.g. "not mapped" vs "mapped, no options"), both survive the round trip.

## What Changes `null`

| Event                                                                                                                             | Result                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `defaultValue` / schema `default: null`, `setValue(null)` on the node or an ancestor                                              | becomes `null`                                                                       |
| `setValue({})` / `setValue([])` on the node itself                                                                                | becomes `{}` / `[]`                                                                  |
| `setValue({ ...keys }, SetValueOption.Merge)` on the node itself                                                                  | becomes the blank form plus the keys                                                 |
| user input, descendant `setValue`, array `push`, an `injectTo` the user caused — a write that **carries a value**                 | becomes an object/array                                                              |
| confirming the value a field already shows (a select re-emitting its default)                                                     | becomes an object/array                                                              |
| child `default`, `computed.derived`, `oneOf`/`anyOf` branch restore, `computed.active` reactivation, child restore during a reset | stays `null`                                                                         |
| an `injectTo` whose source only has a `default` or a derived value                                                                | stays `null` (the target field is filled, the object is not created)                 |
| emptying a field, `pop()`/`remove()`/`update()`/`clear()` on a null array, `setValue({}, SetValueOption.Merge)`                   | stays `null` (emptying is remembered)                                                |
| reset                                                                                                                             | restores the default — `null` if the default is `null`, the default object otherwise |

Depth does not matter: a write into a nested object's field or an array item promotes every null ancestor on the way up.

A field is _emptied_ when its node emits `undefined`: under the default `omitEmpty` an empty string is emptying, while `false`, `0` and `null` are values; with `options: { omitEmpty: false }` an empty string is a value too. A write into an inactive field reaches nobody. An array has no merge semantics, so `setValue([], SetValueOption.Merge)` is an assignment and creates `[]`.

## While It Is `null`

- The emitted value is `null` whatever the schema holds (array children, defaults, derived values, `oneOf`/`anyOf`, computed or virtual fields), and however it became `null`.
- An object's child fields stay rendered and show a **blank form**: what the form builds for them when it is given no `defaultValue` for this node — the node's own object `default` if it has one, otherwise each child's own `default`, derived values applied, array children filled up to `minItems`, nested objects rebuilt the same way. It does not depend on what the object held before — data discarded by `null` does not come back. A value that reached a field through `injectTo` is **not** part of the blank form: a node that becomes `null` after mount loses it until its source changes again.
- A nullable **array** that is itself `null` has no items and no `minItems` fill.

## What It Becomes

Exactly what the same write produces on a form given no `defaultValue` for this node (arrays: on an empty array). With `reason: { default: 'completed' }` shown in the blank form, typing `note` yields `{ reason: 'completed', note: '…' }` — the value always matches the fields.

## Gotchas

- A **non-nullable** object assigned `null` becomes `{}`; only `type: [..., 'null']` (or deprecated `nullable: true`) keeps `null`.
- `setValue(undefined)` is not `null`: it clears the subtree — fields and array items — without restoring child defaults.
- The form never alters a value to make it validate. `oneOf` branches made only of `properties` all match `null`, so `null` fails such a `oneOf` in any validator. A composition branch may not declare a `type` different from its parent's (`COMPOSITION_TYPE_REDEFINITION`), so a `{ type: 'null' }` branch cannot be added today — use `anyOf`, or no composition, at a level that must validate as `null`.
- A custom `FormTypeInput` must call `onChange` to create the object; rendering a default in the blank form is not a write.
