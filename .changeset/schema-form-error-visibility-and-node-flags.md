---
"@canard/schema-form": major
---

Breaking change: error display is configured with the string enum `ErrorVisibility` instead of the `ShowError` bit mask and the `showError` prop, and the state flags of a node are named with an `is` prefix.

Error display:

| 0.x | 1.0.0 |
| --- | --- |
| `ShowError.Always`, `ShowError.Never` | `ErrorVisibility.Always`, `ErrorVisibility.Never` |
| `ShowError.Dirty` | `ErrorVisibility.AfterEdit` |
| `ShowError.Touched` | `ErrorVisibility.AfterTouch` |
| `ShowError.DirtyTouched` | `ErrorVisibility.AfterEditAndTouch` |
| `ShowError.Dirty \| ShowError.Touched` | `ErrorVisibility.AfterEditOrTouch` |
| `showError={true}`, `showError={false}` | `errorVisibility={ErrorVisibility.Always}`, `errorVisibility={ErrorVisibility.Never}` |
| `handle.showError()`, `handle.showError(true)` | `handle.revealErrors()` |
| `handle.showError(false)` | `handle.resetErrorVisibility()` |
| `NodeState.ShowError` | `FieldNodeState.ErrorVisibility` |
| `NodeState.Dirty` | `FieldNodeState.Edited` |

`ErrorVisibility` is not a bit mask: replace a combination of flags with the one named policy instead of combining enum values.

Before:

```tsx
<Form jsonSchema={jsonSchema} showError={ShowError.Dirty | ShowError.Touched} />;
handle.showError(true);
```

After:

```tsx
<Form
  jsonSchema={jsonSchema}
  errorVisibility={ErrorVisibility.AfterEditOrTouch}
/>;
handle.revealErrors();
```

Node state flags:

| 0.x | 1.0.0 |
| --- | --- |
| `node.required` | `node.isRequired` |
| `node.active` | `node.isActive` |
| `node.visible` | `node.isVisible` |
| `node.enabled` | `node.isPresent` |
| `node.readOnly` | `node.isReadOnly` |
| `node.disabled` | `node.isDisabled` |
| `node.nullable` | `node.isNullable` |

Before:

```ts
if (node.required && node.enabled && !node.readOnly) focusField(node);
```

After:

```ts
if (node.isRequired && node.isPresent && !node.isReadOnly) focusField(node);
```

Field input props keep their names: `FieldInputProps.readOnly`, `disabled` and `nullable` are unchanged.
