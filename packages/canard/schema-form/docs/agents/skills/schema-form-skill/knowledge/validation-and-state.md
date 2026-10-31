# Validation and State

When validation runs, how errors become visible, and how interaction state (`dirty`/`touched`) feeds both. Error display is a centralized policy — these pieces interlock, which is why they share one document.

## When Validation Runs

`OnChange` writes run after the next frame; continuous input carries across active frames, with a trailing run after a quiet frame and a 100 ms cap measured from the last automatic run that actually started. A cap returns to watch. Debouncing belongs to `FieldInput`. Missing frame APIs or a hidden document use a macrotask fallback; a 100 ms stalled-frame timer races the frame-backed task so it runs once. Explicit `validate()` and submit start immediately, and submit awaits the verdict.

An error shows only when eligible now and continuously eligible across every engine state, enabled value and committed Form policy since the last release. Hiding is immediate. A newly eligible error, or one hidden at any point, waits for the next release: the current verdict, or about two frames after a quiet change. Releases occur on pending true-to-false settlement, a quiet post-paint history drop, an accepted explicit root verdict, and disposal. Renderer/input include `active && visible`; `useChildFieldErrors` omits enabled. Only `OnChange` records history; other modes use live inputs. React-only remount, restore, mirror and virtualization use the same engine history. A current-stamp commit-only discard retains targets and requests the newest commit through the cadence; repeated changing context content (including fresh functions, `Date`, `Map` and class identities) can keep reveals held until the stream stops.

Always means `true`, `ShowError.Always`, or a mask containing `ShowError.Always`. It validates inline in the mount layout effect, so a synchronous validator shows its first verdict before the first frame; other modes defer the initial verdict and guard-free compilation. An ancestor layout write can invalidate the inline verdict. `if` gates can still compile during render. Treat an empty pre-verdict list as unknown or await `validate()`. Explicit validation returns the call-time snapshot verdict, and submit submits the value captured before that await. Compile failure reports once as `rejected` when mount handles it first, or `sink` when a child layout write handles it first, under unchanged ERROR-019 surfaces. A subtree validate preserves the whole-form pending write verdict.

Raw `errors`, Form children errors, `FormRender`, `node.errors` and `getErrors()` stay ungated. Custom UI uses `errorVisible` or `useChildFieldErrors().showErrors`. Hidden children retain values and aggregate errors; inactive values are removed and off-branch issues are skipped. After its first layout commit, a current load delivers all form callbacks at engine-chain end while visible or hidden, including same-schema reset; showing it adds no replay. Never-prepared loads buffer construction records and drop changes, state and diagnostics; reset-retired loads discard further records. Root-replacing reset isolates each handler failure and delivers mount records before buffered build records, before updating the handle binding. React cannot distinguish hiding from unmount: retained handles and nodes keep delivering after unmount, while validation-cache references are released. Hidden callbacks use the last connected commit except onError, which stays current; the Form ref is null while hidden. Field layout-effect writes and render warnings arrive on show. `None`, `OnRequest` and validation computation cost are unchanged.

Known limits: the hook's React-only `disabled` argument reveals at once; state/enabled renders deferred beyond a drop (transition, Suspense or time slicing) omit the hold; commit-only streams hold until they stop; a write in the task between release and paint can show the released verdict for one to two frames; and unpainted state/enabled/policy combinations inside one React batch still count, including engine state changes ordered before the policy commit.

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
