# Validation and State

When validation runs, how errors become visible, and how interaction state (`dirty`/`touched`) feeds both. Error display is a centralized policy — these pieces interlock, which is why they share one document.

## When Validation Runs

`validationMode` on `<Form>`: `ValidationMode.None | OnChange | OnRequest`, combinable (`OnChange | OnRequest`). State it explicitly — see the consumer rules (`validation-mode-explicit`). Validation itself is delegated to a registered validator plugin (`plugin-system.md`).

OnChange writes run after the next frame; continuous input carries across active frames and gets one trailing run after a quiet frame. A 100 ms cap is measured from the last automatic run that actually started. Every cap run returns to watch, so a quiet next frame does not run again. Debouncing belongs to FieldInput components; the engine preserves a real-time feel below the 100 ms perception threshold. Explicit `validate()` and submit start immediately, and submit awaits its verdict.

Write-triggered errors normally arrive one to two frames after the value. During a pending write verdict, a node shows errors only when its display condition was eligible at the last accepted verdict and is still eligible now. The renderer and input also require the node to be enabled at both points; the child-errors hook applies the condition hold without reading enabled. Newly eligible errors wait for the current verdict; hiding is immediate. React-only appearances (Activity/Suspense restore, a second display, virtualization reveal or a version remount) use the same engine baseline and can show eligible lagging errors. Synchronous continuous input releases holds at the next 100 ms cap; stale asynchronous runs wait for a current verdict. A current-stamp run discarded only because the commit changed retains pending and requests the newest commit through the cadence. Repeated commit-only context changes, including newly created functions, Date, Map or class instances compared by identity, can keep the hold until that stream stops.

Outside Always mode, the initial verdict and guard-free whole-schema compilation arrive after the first frame. Always validates inline in the mount layout effect, so synchronous validators show the first verdict before the first frame. An ancestor mount-layout write can invalidate it and defer the first accepted verdict. Treat an empty list before any verdict as unknown or await validate(). Explicit validate() returns the call-time snapshot's verdict; submit captures its value before awaiting that validation and submits that captured value. A compile failure is reported once as rejected when mount runs first, or sink when a child layout write's run handles it first, following ERROR-019's unchanged delivery surfaces. A subtree validate preserves the pending whole-form write verdict.

Raw lists remain ungated: renderer/input errors, Form children errors, FormRender, node.errors and getErrors() retain the verdict independently of display visibility. Custom renderers and inputs should use errorVisible, and custom child displays should use useChildFieldErrors().showErrors. Hidden children keep their values and validation errors in the child aggregate; inactive values are removed and off-branch issues are skipped at routing. Known limits: provider-level external showError defaults and the hook's disabled argument are not recorded by the engine and reveal the current verdict immediately; a transition-delayed render may reveal the previous verdict; a new write in the roughly one-to-two-frame interval before baseline drop may hold a just-painted reveal. Baseline drop uses the same one-shot frame slot and hidden-document/stall fallbacks. Buffered records from a replaced hidden load are delivered first at the reset chain's end, followed by the new reset records, with per-original-load warning deduplication. Other hidden records wait for reconnect. None and OnRequest keep their modes and validation's computation cost is unchanged.

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
