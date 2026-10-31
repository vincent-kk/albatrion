# Validation and State

When validation runs, how errors become visible, and how interaction state (`dirty`/`touched`) feeds both. Error display is a centralized policy — these pieces interlock, which is why they share one document.

## When Validation Runs

`validationMode` on `<Form>`: `ValidationMode.None | OnChange | OnRequest`, combinable (`OnChange | OnRequest`). State it explicitly — see the consumer rules (`validation-mode-explicit`). Validation itself is delegated to a registered validator plugin (`plugin-system.md`).

OnChange writes run after the next frame; continuous input carries across active frames and gets one trailing run after a quiet frame. A 100 ms cap is measured from the last automatic run that actually started. Every cap run returns to watch, so a quiet next frame does not run again. Debouncing belongs to FieldInput components; the engine preserves a real-time feel below the 100 ms perception threshold. Explicit `validate()` and submit start immediately, and submit awaits its verdict.

Write-triggered errors normally arrive one to two frames after the value. Already visible errors keep the previous verdict until it is replaced. Errors newly enabled by interaction or `showError()` wait for the pending write verdict, avoiding a stale error flash; hiding remains immediate. Synchronous validators release a mid-stream hold at the next cap run. Asynchronous or slow validators whose runs go stale during continuous input may wait for the trailing verdict. A commit-only discard with no newer request settles the hold and may reveal the previous verdict.

Outside Always mode, the initial verdict and guard-free whole-schema compilation arrive after the first frame. Always (`true`, `ShowError.Always`, or a mask containing it) validates inline in the mount layout effect, including when a child input wrote first; synchronous validators show the first verdict before the first frame. Treat an empty list before any verdict as unknown when deriving validity yourself, or await `validate()`. `if` gates can still compile during render. A mount compile failure reports once as `rejected` when the mount validates first, or `sink` when a write request first fulfills the deferred mount obligation. A subtree validation does not cancel a pending whole-form write verdict.

Raw lists remain ungated: renderer/input `errors`, Form children `errors`, FormRender, `node.errors`, and `getErrors()` retain the verdict independently of display visibility. Custom displays reading `node.errors` with their own visibility logic should retain committed visibility and use the same pending-verdict reveal rule. Without frame request/cancellation APIs or in a hidden document, work uses a macrotask; a stalled frame uses the 100 ms fallback, subject to background throttling. Hidden-load records retain their original roots and are delivered in order after reconnection, isolating each handler failure. None and OnRequest retain their modes; validation work itself still has its original cost.

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
