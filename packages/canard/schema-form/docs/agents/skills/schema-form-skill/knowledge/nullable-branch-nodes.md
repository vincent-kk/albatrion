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

| Event                                                                                                         | Result                                |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `defaultValue` / schema `default: null`, `setValue(null)` on the node or an ancestor, reset to a null default | becomes `null`                        |
| `setValue({})` / `setValue([])` on the node itself                                                            | becomes `{}` / `[]`                   |
| user input, descendant `setValue`, array `push`, `injectTo` — a write that **carries a value**                | becomes an object/array               |
| confirming the value a field already shows (a select re-emitting its default)                                 | becomes an object/array               |
| child `default`, `computed.derived`, `oneOf`/`anyOf` branch restore, reset, `computed.active` reactivation    | stays `null`                          |
| emptying a field, `clear()` on a null array, `setValue({}, SetValueOption.Merge)`                             | stays `null` (emptying is remembered) |

Depth does not matter: a write into a nested object's field or an array item promotes every null ancestor on the way up.

## While It Is `null`

- The emitted value is `null` whatever the schema holds (array children, defaults, derived values, `oneOf`/`anyOf`, computed or virtual fields), and however it became `null`.
- An object's child fields stay rendered and show a **blank form**: each child's own schema `default`, derived values applied, nested objects rebuilt the same way. It does not depend on what the object held before — data discarded by `null` does not come back.
- A null array has no items: no `minItems` fill.

## What It Becomes

Exactly what the same write produces on a form where the node never was `null` (arrays: on an empty array). With `reason: { default: 'completed' }` shown in the blank form, typing `note` yields `{ reason: 'completed', note: '…' }` — the value always matches the fields.

## Gotchas

- A **non-nullable** object assigned `null` becomes `{}`; only `type: [..., 'null']` (or deprecated `nullable: true`) keeps `null`.
- `setValue(undefined)` is not `null`: it clears the subtree without restoring child defaults.
- The form never alters a value to make it validate. `oneOf` branches made only of `properties` all match `null`, so `null` fails such a `oneOf` in any validator — constrain the schema, not the form.
- A custom `FormTypeInput` must call `onChange` to create the object; rendering a default in the blank form is not a write.
