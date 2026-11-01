# Validation and State

When validation runs, how errors become visible, and how interaction state (`dirty`/`touched`) feeds both. Error display is a centralized policy — these pieces interlock, which is why they share one document.

## When Validation Runs

`OnChange` writes run after the next frame; continuous input carries across active frames, with a trailing run after a quiet frame and a 100 ms cap measured from the last automatic run that actually started. A cap returns to watch. Debouncing belongs to `FieldInput`. Missing frame APIs or a hidden document use a macrotask fallback; a 100 ms stalled-frame timer races the frame-backed task so it runs once. Explicit `validate()` and submit start immediately, and submit awaits the verdict.

An error shows only when eligible now and continuously eligible across every engine state, enabled value and committed Form policy since the last release. Hiding is immediate. A newly eligible error, or one hidden at any point, waits for the next release: the current verdict, or about two frames after a quiet change. Releases occur on pending true-to-false settlement, a quiet post-paint history drop, an accepted explicit root verdict, and disposal. Renderer/input include `active && visible`; `useChildFieldErrors` omits enabled. Only `OnChange` records history; other modes use live inputs. React-only remount, restore, mirror and virtualization use the same engine history. A current-stamp commit-only discard retains targets and requests the newest commit through the cadence; repeated changing context content (including fresh functions, `Date`, `Map` and class identities) can keep reveals held until the stream stops.

All loads (first mount, same-schema reset, root replacement, rebuild and validator change), including Always (`true`, `ShowError.Always`, or a mask containing it), share one load-validation entry in the slot after the next frame. `None` skips compilation; OnRequest-only compiles without a verdict; `OnChange` compiles and issues the first verdict only if no write validation request or explicit root validation has occurred since this load started. Automatic load compilation failure keeps the new tree and reports once per load with `origin: 'validate'` plus one host report; reset and rebuild do not throw for it. Explicit `validate()` and submit still start immediately and reject; their record carries `origin: 'validate'`. `if` gates can still compile during construction or render. Treat a pre-verdict empty list as unknown or await `validate()`. Explicit validation and submit preserve their call-time snapshot, and subtree validation preserves pending whole-form requests.

Raw `errors`, Form children errors, `FormRender`, `node.errors` and `getErrors()` stay ungated. Custom UI uses `errorVisible` or `useChildFieldErrors().showErrors`. Hidden children retain values and aggregate errors; inactive values are removed and off-branch issues are skipped. After its first layout commit, a current load delivers all form callbacks at engine-chain end while visible or hidden, including same-schema reset; showing it adds no replay. Never-prepared loads buffer construction records and drop changes, state and diagnostics; reset-retired loads discard further records. Root-replacing reset isolates each handler failure and delivers mount records before buffered build records, before updating the handle binding. React cannot distinguish hiding from unmount: retained handles and nodes keep delivering after unmount, while validation-cache references are released. Hidden callbacks use the last connected commit except onError, which stays current; the Form ref is null while hidden. Field layout-effect writes and render warnings arrive on show. Guard-free OnRequest-only loads now compile in the background after the first paint; the owner accepts this cost to keep later interactions consistent.

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


## onError record origin

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

`onError?: (record: FormErrorRecord) => void` delivers one record per occurrence. The required `origin` names the operation that produced it.

| origin | Operation |
| --- | --- |
| `load` | Tree construction, mount, reset, rebuild, validator change and their load chain |
| `write` | Public writes, array verbs, state, batch, context, finishInput, external errors and notified listeners |
| `validate` | Automatic or explicit whole-schema compilation/run, verdict delivery and the listeners it notifies |
| `submit` | SubmitWhileDegraded and any failure first surfaced by native submit capture |
| `render` | RenderFailed boundaries and render warnings such as ChildNodeComponentsOnTerminal |

Records created while building a tree (blueprint diagnostics and DialectMismatch) are always load, whoever called construction; records produced by the built tree inside a chain follow the operation that opened that chain.

The outermost chain opener decides the origin. A write nested in reset's onChange keeps `load`; reset called by a node listener or form onChange in a write chain keeps `write`. A validation-result listener failure is `validate`; a separate setState listener failure after a load is `write`. Applying external errors at first commit uses `load`; changing the errors prop uses `write`. Failures already reported by dispatchValidate within submit keep `validate`. Development console warnings from warnDevelopmentIssue are not records. Error bundles remain the thrown value and are absent from individual records. Delivery timing, deduplication, caller rejection, host sinks and reentrancy are unchanged.

`FormErrorRecord.surface` and `aggregate` were removed; `origin` names the operation that produced the record
