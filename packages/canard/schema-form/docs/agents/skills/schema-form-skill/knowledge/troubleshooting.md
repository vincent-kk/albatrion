# Troubleshooting

Symptom → cause → fix, grouped by subsystem.

## Plugins

**UI renders wrong or plain** — check whether registration happened after mounting or another plugin supplies the same slot. Follow the [registration and conflict rules](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/quick-start#registration-rules).

## fieldInputMap

**My mapped input is not applied** — a pattern key must start with `^`; except for the single-segment `*` wildcard, every other key is compared as text.

- Use a data path such as `/contact/email`, not another library's `contact.email` or `items[0].name` notation; a schema location such as `#/properties/contact` does not mean `/contact`.
- In a `^` pattern, `*` is a regex quantifier; use `[^/]+` for one nonempty segment. Write a backslash twice in a JavaScript string (`'^/users/\\d+$'`).
- `''` or `'#'` selects the root; `'/'` selects an empty-name child.
- An earlier matching key wins. A mapped object or array input must render `ChildFields` or its children disappear ([custom input contract](field-input.md#custom-input-contract)).

`*` consumes exactly one segment. `**` is a literal property name, not a recursive wildcard, and neither throws nor warns:

```typescript
fieldInputMap: {
  '/items/*/name': ItemNameInput,   // ✅
  '/items/**/name': ItemNameInput,  // literal ** name; not recursive
}
```

## Field Inputs

**An input keeps its old draft after reset or `setValue`** — it declares `controlled: true` but copies the value into state. Remove the declaration, or draw from `value` alone ([field input](field-input.md#skip-remounts-for-a-controlled-input-controlled)).

**A recalculated field loses focus or flickers on every keystroke of another field** — each `derived` or `injectTo` write remounts its input. If the input draws from `value` alone, declare `controlled: true`.

**A child loses focus or a sibling edit disappears under a custom branch input** — follow the [hybrid parent update pattern and its limits](field-input.md#hybrid-parents-write-child-values-through-the-parent).

## Controls Expressions

**`controls.active` / `controls.visible` not reacting** — the most common cause is path syntax: `/toggle` is an absolute path from the root; a sibling is `../toggle`.

**Expression over a collection never true** — a path followed by a property access must be parenthesized: `controls: { active: '(../items).length > 0' }`. Without the parentheses, `../items.length` is read as a property named `items.length`.

**`derived` yields `NaN`/garbage on partial input** — guard operands: `'(../price ?? 0) * (../quantity ?? 1)'`.

**Conditional field disappears after `setValue` on the parent** — a parent-level write settles conditional participation and removes inactive-branch values from the output. Writing a live child directly targets that child; it does not reactivate a missing branch. Check the controlling value and the emitted result instead of treating a child write as a bypass.

## Errors Not Displayed

Errors exist (`getErrors()` shows them) but the UI is silent:

1. Display policy — set `errorVisibility` on `<Form>` (`ErrorVisibility` enum; never a string) or call `formRef.current?.revealErrors()`. See `validation-ux.md`.
2. Decide which component owns the message. An input that needs feedback follows [useFieldErrors](validation-ux.md#read-one-fields-errors); a layout can use Form.ErrorMessage. Do not read error props from the input.

## Composition (oneOf / anyOf)

**A branch `type` seems ignored** — the parent's own `type` decides the node's kind; a branch `type` that differs is not rejected and only the validator applies it. Omit the branch `type` or repeat the parent's.

**`SHARED_NODE_KIND_CONFLICT`** — an ungated branch (no `controls.active`, not selected by `controls.discriminator`) redeclares a parent property with a `type` outside the parent's, or ungated branches disagree on a property's kind. Narrow the branch `type` to the parent's, drop it, or gate the branch.

**`DISCRIMINATOR_MISMATCH`** — an existing object union has no tagged branch (`missing`), branch tags require different kinds without a host-declared tag type (`kind`), or tags overlap within one `oneOf` (`overlap`). `anyOf` overlap and different keys on separate declarations are allowed. A host-declared tag union can cover multiple kinds.

**`DISCRIMINATOR_IGNORED_FOR_FORM` / `DISCRIMINATOR_BRANCH_UNREACHABLE`** — ignored keys have reason `union` (no union on that object declaration) or `host` (known non-object host). Unreachable tags have reason `kind` (outside host tag type) or `empty` (empty const/enum intersection) and are not lifted. These warnings and mismatch errors have details `{ propertyName, reason }`, without values. Terminal objects omit unreachable warnings. Ordinary static enum intersection errors still use `EMPTY_ENUM_INTERSECTION`; see `expressions.md` for C1–C13.

**`IF_ON_NON_OBJECT_HOST`** — symptom: `then` or `else` never reacts to the field's own value, and the warning `SCHEMA_FORM_WARNING.IF_ON_NON_OBJECT_HOST` arrives with details `{ kind }` at `#/…/if`. Cause: the `if` sits on a host whose allowed types do not include object (a string, number, boolean, array or null-only field), so the guard is evaluated against `{}`, not the host value. Fix: move the condition to the enclosing object and test the field through `properties`, or widen the host type to include `object`.

**A nullable object fails validation while `null`** (no warning is printed) — branches without `type` all match `null`, and `oneOf` wants exactly one. Add one `{ type: 'null' }` branch and `type: 'object'` on the object branches, or use `anyOf` (`nullable-branch-nodes.md`).

**Warning `NULL_BRANCH_IGNORED_FOR_FORM`** — a `{ type: 'null' }` branch carries a condition or `properties`. The form reads neither; keep the null branch bare.

## Arrays

**Too many items, or too few** — the core neither blocks nor fills: `push()` always appends and `minItems` creates no items. Validation reports both limits; the built-in array input draws empty slots up to `minItems` in the UI only, writing nothing until the user types into one, and hides its add button at `maxItems`. A custom input that must enforce a range disables its own add/remove controls from `node.jsonSchema` and `node.children.length` (`arrays-and-scale.md`).

**Large array is slow** — keep primitives on the terminal strategy, batch mutations through one `setValue`, and consider the live `virtualization` prop ([arrays and scale](./arrays-and-scale.md#render-level-virtualization-built-in)); do not reset the form or change its key to update these options.

## TypeScript

**The ref and defaultValue disagree on value types** — preserve schema literals when using inference, then follow [the FormHandle typing guidance](imperative-and-layout.md) when Form and its ref need the same explicit value type.

## Tests

- Register the validator plugin once in the test setup file, before any render — not per test.
- `formRef.current` is `null` on first render — `await waitFor(() => expect(formRef.current).not.toBeNull())` before driving it.
- Values and controls state settle synchronously inside `setValue()`; write-triggered validation results arrive after the frame that renders the edit and the error DOM after React re-renders, so use testing-library `waitFor` before asserting on errors or rendered output ([validation UX](validation-ux.md)).

## Diagnose operation failures

For `onError` origins, caller rejections, host reports and hidden-form lifetimes, read [validation failures](validation-failures.md).
Do not treat the callback as a current list of invalid fields; use the validation issue list for input correction.
