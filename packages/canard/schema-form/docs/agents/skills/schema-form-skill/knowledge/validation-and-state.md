# Validation and State

When validation runs, how errors become visible, and how interaction state (`edited`/`touched`) feeds both. Error display is a centralized policy — these pieces interlock, which is why they share one document.

## When Validation Runs

`OnChange` writes run after the next frame; continuous input carries across active frames, with a trailing run after a quiet frame and a 100 ms cap measured from the last automatic run that actually started. A cap returns to watch. Debouncing belongs to `FieldInput`. Missing frame APIs or a hidden document use a macrotask fallback; a 100 ms stalled-frame timer races the frame-backed task so it runs once. Explicit `validate()` and submit start immediately, and submit awaits the verdict.

An error shows only when eligible now and continuously eligible across every engine state, isPresent value and committed Form policy since the last release. Hiding is immediate. A newly eligible error, or one hidden at any point, waits for the next release: the current verdict, or about two frames after a quiet change. Releases occur on pending true-to-false settlement, a quiet post-paint history drop, an accepted explicit root verdict, and disposal. Renderer/input include `isActive && isVisible`; `useChildFieldErrors` omits isPresent. Only `OnChange` records history; other modes use live inputs. Within one public `batch()` or walk, only the first state of that write sequence enters history; intermediate states do not. Separate public calls inside one React batch still record their intermediate states. React-only remount, restore, mirror and virtualization use the same engine history. A current-stamp commit-only discard retains targets and requests the newest commit through the cadence; repeated changing context content (including fresh functions, `Date`, `Map` and class identities) can keep reveals held until the stream stops.

All loads (first mount, same-schema reset, root replacement, rebuild and validator change), including Always (`true`, `ShowError.Always`, or a mask containing it), share one load-validation entry in the slot after the next frame. `None` skips compilation; OnRequest-only compiles without a verdict; `OnChange` compiles and issues the first verdict only if no write validation request or explicit root validation has occurred since this load started. Automatic load compilation failure keeps the new tree and reports once per load with `origin: 'validate'` plus one host report; reset and rebuild do not throw for it. Explicit `validate()` and submit still start immediately and reject; their record carries `origin: 'validate'`. `if` gates can still compile during construction or render. Treat a pre-verdict empty list as unknown or await `validate()`. Explicit validation and submit preserve their call-time snapshot, and subtree validation preserves pending whole-form requests.

Raw `errors`, Form children errors, `FormRender`, `node.errors` and `getErrors()` stay ungated. Custom UI uses `errorVisible` or `useChildFieldErrors().showErrors`. Hidden children retain values and aggregate errors; inactive values are removed and off-branch issues are skipped. After its first layout commit, a current load delivers all form callbacks at engine-chain end while visible or hidden, including same-schema reset; showing it adds no replay. Never-prepared loads buffer construction records and drop changes, state and diagnostics; reset-retired loads discard further records. Root-replacing reset isolates each handler failure and delivers mount records before buffered build records, before updating the handle binding. React cannot distinguish hiding from unmount: retained handles and nodes keep delivering after unmount, while validation-cache references are released. Hidden callbacks use the last connected commit except onError, which stays current; the Form ref is null while hidden. Field layout-effect writes and render warnings arrive on show. Guard-free OnRequest-only loads now compile in the background after the first paint; the owner accepts this cost to keep later interactions consistent.

Known limits: the hook's React-only `disabled` argument reveals at once; state/isPresent renders deferred beyond a drop (transition, Suspense or time slicing) omit the hold; commit-only streams hold until they stop; a write in the task between release and paint can show the released verdict for one to two frames; and unpainted state/isPresent/policy combinations inside one React batch still count, including engine state changes ordered before the policy commit.

## Error Display Policy

Three layers decide whether a field shows its errors:

1. **`showError` prop on `<Form>`** — type `boolean | ShowError`. The `ShowError` enum (public export) is the piece most consumers miss:

```typescript
import { ShowError } from '@canard/schema-form';

enum ShowError {
  Always,        // always show
  Never,         // never show
  Edited,         // show after user input edits the field
  Touched,       // show once the field has been interacted with
  EditedTouched,  // show after user input edits the field and the field was touched
}

<Form showError={ShowError.EditedTouched} />
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

`FieldNodeState` keys are `Edited`, `Touched` and `ErrorVisible`. `node.isEdited` and `node.isTouched` read their truthiness; React consumers re-read them on `UpdateState`. Only user input sets Edited; programmatic and automatic writes do not. Form-wide:

- `onStateChange={(state) => …}` receives the **global state — an OR-aggregation over all descendants** (any edited child ⇒ form edited).
- `FormHandle`: `getState()` / `setState(flags)` / `clearState()`.
- Set `touched` manually where the plugin doesn't (e.g. custom inputs): `node.setState({ [FieldNodeState.Touched]: true })` on blur.

Cautions:

- `useFieldNodeTracker(node)` — the second argument is an **event mask defaulting to ALL events**. Unmasked trackers re-render on every node event; pass the specific `NodeEventType` you need.
- `clearState()` resets state and keeps values; `reset()` restores `defaultValue` AND resets state.
- Changing the Form `defaultValue` prop alone does not move the baseline. A committed root load (mount, form reset, rebuild, validator change or root resetSubtree) captures its final output as the baseline for `isDivergent`; edited is an interaction flag.

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

The outermost chain opener decides the origin. A write nested in reset's onChange keeps `load`; reset called by a node listener or form onChange in a write chain keeps `write`. A validation-result listener failure is `validate`; a separate setState listener failure after a load is `write`. Applying external errors at first commit uses `load`; changing the errors prop uses `write`. Failures already reported by dispatchValidate within submit keep `validate`. Development console warnings from warnDevelopmentIssue are not records. A bundle rejected to a submit() or validate() caller remains one rejection value; individual onError records never contain it. Validation-result listener failures remain ownerless even during an explicit validate(), which can resolve while those failures reach the host. Unowned failures reach the existing host channel one leaf at a time, depth-first in element order. Only SchemaFormError MultipleErrors with a nonempty array and every index owned by that array expands; malformed, unreadable or revisited bundles and other values are reported as themselves. Engine validation waves, automatic OnChange validation and load flush retain handler-first order; native submit and the load slot retain original-first order. React and the render ErrorBoundary log the thrown value unchanged. Capture suppresses valid nested bundles containing only already-reported errors or handler exceptions; unknown, malformed, cyclic or revisited nested bundles are still captured. Array lengths must be stable integers from 1 through 2^32 - 1; each traversal has a shared 1,000,000-element inspection budget. An unreadable, unstable or over-budget bundle remains an opaque leaf, so the host can receive a bundle. Capture also guards top-level metadata and string conversion, delivering the original value once with a fixed fallback message when inspection fails. Delivery timing, caller rejection, reentrancy and sink exception propagation remain unchanged.

`FormErrorRecord.surface` and `aggregate` were removed; `origin` names the operation that produced the record

### Node boolean properties and load divergence

Node boolean properties use `isRequired`, `isActive`, `isVisible`, `isPresent`, `isReadOnly`, `isDisabled` and `isMisfit`. `isPresent` is `isActive && isVisible`, independent of `isDisabled`. React props, schema keys and `controls` keys keep their names.

```ts
node.isEdited;    // truthiness of state[FieldNodeState.Edited]
node.isTouched;   // truthiness of state[FieldNodeState.Touched]
node.isDivergent; // current form output differs from the last root load at node.path
```

`isEdited` and `isTouched` are read-only booleans; re-read them on `FieldNodeEventType.UpdateState`. Only input writes set Edited. `setValue`, array verbs and automatic fills do not. Reset, `clearState` and `controls.resetInteraction` clear the interaction flags. Detached references keep their last-commit interaction state.

`isDivergent` compares the current root output and the last committed root-load output at the same node path. The first mount, form reset with a value or explicit undefined, rebuild, validator change and `root.resetSubtree()` take a new baseline after the output is final. Before the first load commits it reads false. Changing the Form `defaultValue` prop alone, ordinary writes and a child `resetSubtree()` do not move that baseline. A load that throws before commit keeps the preceding baseline; a failure reported after commit establishes the degraded output as the new baseline.

Reverting to the baseline reads false. Hidden fields remain in the output; array holes use their actual output contribution. Items compare by position: a moved or added item can read true, while an added item matching the value originally at that position reads false. Child reset follows its load source by item identity, so after array movement, or with dependencies outside its subtree, the restored subtree can remain divergent. Detached nodes read false because they no longer contribute to the output.

The comparison uses the engine's ordered `sameValue`: undeclared object keys restored in another order can still read true. A read during settlement can be transient, like `value` and `outputValue`. Re-read on the root node's UpdateValue, UpdateState or RequestRefresh and this node's UpdatePath; rebind when the root or node changes. Both root-load paths deliver RequestRefresh, including a same-output reset. Detached references do not gain new events.

Writes perform no divergence reads or comparisons. A root load allocates one baseline box retaining its output reference. Each getter read walks two cached paths, O(depth), and compares only when either path value changes by `Object.is`; repeated unchanged reads call `sameValue` zero times, including NaN. A first comparison skips unchanged references. The baseline retains replaced parts until the next root load, and each node memo retains only its own two path values and result.
