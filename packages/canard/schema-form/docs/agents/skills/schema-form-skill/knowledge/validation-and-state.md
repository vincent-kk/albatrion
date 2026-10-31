# Validation and State

When validation runs, how errors become visible, and how interaction state (`dirty`/`touched`) feeds both. Error display is a centralized policy — these pieces interlock, which is why they share one document.

## When Validation Runs

`validationMode` on `<Form>`: `ValidationMode.None | OnChange | OnRequest`, combinable (`OnChange | OnRequest`). State it explicitly — see the consumer rules (`validation-mode-explicit`). Validation itself is delegated to a registered validator plugin (`plugin-system.md`).

OnChange write and initial mount validation run after the frame that renders the newest value. Several writes before that frame share one validation run; `node.errors`, `getErrors()`, `onValidate`, and error UI can retain the previous verdict for at least one frame. Explicit `validate()` and submit start a fresh verdict immediately, and submit waits for it. A subtree `validate()` does not cancel pending or in-flight whole-form write validation. None and OnRequest retain their modes.

Without a frame API, or when the document is already hidden, validation uses a macrotask. A document hidden after scheduling falls back to a 100 ms timer, subject to background throttling. A mount compile failure is reported once. Its surface is `sink` when a write run's rejection is handled before the mount slot runs (a child layout write in jsdom or a visible tab); otherwise it is `rejected`. In a browser document hidden when scheduled, both runs can share a MessageChannel batch and the mount stamp discards the write failure. Guard-free whole-schema compilation moves after the first frame, while `if` gates can still compile during render. Validation cost itself remains.

## Error Display Policy

Three layers decide whether a field shows its errors:

1. **`showError` prop on `<Form>`** — type `boolean | ShowError`. The `ShowError` enum (public export) is the piece most consumers miss:

```typescript
import { ShowError } from '@canard/schema-form';

enum ShowError {
  Always,        // always show
  Never,         // never show
  Dirty,         // show once the value has changed
  Touched,       // show once the field has been interacted with
  DirtyTouched,  // show once the value has changed AND the field was touched
}

<Form showError={ShowError.DirtyTouched} />
// NOT <Form showError="touched"> — the prop takes boolean | ShowError, never a string
```

2. **`FormHandle.showError(visible)`** — imperative override, e.g. force-show all errors on submit.
3. **`errorVisible` inside a `FieldInput`** — the resolved per-field verdict. Render errors behind `errorVisible`, not behind ad-hoc `errors.length > 0` checks; the policy stays centralized.

## Custom Error Messages

`presentation.errorMessages` on a schema node maps validation keywords to messages; placeholders substitute from `error.details` plus `{value}`:

```typescript
zipCode: {
  type: 'string',
  pattern: '^[0-9]{5}$',
  presentation: {
    errorMessages: {
      pattern: 'must be a 5-digit zip code',
      maxLength: 'up to {limit} characters',   // {limit} comes from error.details
    },
  },
}
```

`formatError` (prop on `<Form>`) has signature `(error: JSONSchemaError, node: FieldNode, context: Dictionary) => ReactNode` — three arguments, and the return is a **ReactNode**, so JSX error rendering is legitimate, not just strings.

## Interaction State

`NodeState` flags per node: `dirty` (value changed), `touched` (interacted), `validated`, `showError`. Form-wide:

- `onStateChange={(state) => …}` receives the **global state — an OR-aggregation over all descendants** (any dirty child ⇒ form dirty).
- `FormHandle`: `getState()` / `setState(flags)` / `clearState()`.
- Set `touched` manually where the plugin doesn't (e.g. custom inputs): `node.setState({ [NodeState.Touched]: true })` on blur.

Cautions:

- `useFieldNodeTracker(node)` — the second argument is an **event mask defaulting to ALL events**. Unmasked trackers re-render on every node event; pass the specific `NodeEventType` you need.
- `clearState()` resets state and keeps values; `reset()` restores `defaultValue` AND resets state.
- Changing `defaultValue` moves the baseline `dirty` is computed against.

## Virtual Fields and Grouped Errors

Marking a virtual field `required` makes **every underlying field** required (`virtual-schema.md`). To render one grouped input with per-field errors, `useChildFieldErrors(node)` returns arrays **parallel to the `fields` order**: `showErrors[i]`, `formattedErrors[i]`, plus `errorMessage`/`formattedError` (first error) and the full `errorMatrix`.
