# Event System

Every node publishes typed events (`FieldNodeEventType`). This file is the mental model for when listeners fire and why reads can be stale.

## Batching Model

- A public write settles and commits synchronously. Listeners are notified when the outermost write returns, with the events of one write merged per node.
- A write made inside a listener joins the same chain as its next wave and is also delivered before the outermost call returns. `onChange` runs once per outermost write, after the last wave.

After `setValue()` returns, settled values and controls can be read synchronously. Validation is a separate operation; use [validation UX](validation-ux.md) for its scheduling and error-display conditions. Do not infer a new verdict from a completed value write.

## setValue Synchronicity

- `setValue()` settles synchronously on any node, parent or leaf; controls state is committed before the call returns.

## Event Types

Read the bit flags from the published `FieldNodeEventType` declaration. Choose a mask for the information the observer owns; value, interaction, structure and aggregate changes are distinct signals, so a value-only listener cannot stand in for all of them.

- `RequestRefresh` re-syncs uncontrolled inputs; the system raises it, and `formRef.current?.refresh(path)` raises it on demand.
- `RequestRemount` is the external escape hatch for forcing a full component remount of a subtree: `formRef.current?.remount(path)`. There is no public `node.publish`.
- `UpdateGlobalState` and `UpdateGlobalError` are root-level aggregates; `UpdateDiagnostics` reports changes of the root settlement diagnostics.

## Committed Delivery and Global State

Events are delivered from the committed result of a settlement, not while it is still computing. The settlement marks which bits changed per node, and each outermost write then delivers them once in document order, so a listener reading the tree sees the final committed state. Nodes without listeners still count their bits, so `revision(mask)` stays correct for late subscribers.

Aggregate flags are published at the root. `UpdateGlobalState` is raised once per outermost entry, and only when a state key (such as `edited` or `touched`) crosses between "no node has it" and "some node has it"; further nodes joining or leaving a key that is already set raise nothing.

## Subscribing

```typescript
useEffect(
  () =>
    node.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdateValue) {
        // the event type is a bit mask; one delivery may merge several bits
      }
    }),
  [node],
); // subscribe returns its own cleanup
```

- Every `subscribe()` must have its cleanup returned from the effect — leaked listeners keep running after remounts.
- **Events delivered before a subscription are not replayed.** For a state mirror that must catch up, use `useFieldNodeSubscribe`'s `onSubscribe` catch-up rather than assuming you saw everything. `node.revision(mask?)` is a monotonic counter of delivered events for the masked bits, counted whether or not a listener existed, so a late subscriber can detect a gap.
- For re-render-on-event, `useFieldNodeTracker(node, mask)` — always pass the mask; the default is ALL events.
- A write made inside a listener joins the same chain; the feedback depth is capped at 25 waves, and exceeding it throws `FEEDBACK_LIMIT_EXCEEDED` at the end of the outermost write.

## Observation and absent nodes

Both `useFieldNodeTracker` and `useFieldNodeSubscribe` accept `Node | Nullish`; `Nullish` means the non-generic union `null | undefined`. An absent node creates no subscription. The tracker snapshot is 0 on both client and server, and the subscription hook invokes neither its listener nor `onSubscribe` without a node.

Changing the input releases the previous subscription, including a change to absence; a real replacement attaches a new subscription. Unmount also releases it. `onSubscribe` receives a required node with its inferred subtype, reads current state at attachment, and does not replay earlier events. Use it for state mirrors, or prefer a tracker and live getter reads during render.

These are observation semantics only. Mutation methods and formatting callbacks still require a real node. A null JSON value, `NullNode`, or nullable schema is a value contract, not an absent node reference. For handles and the render needed after ref assignment, see [imperative control](imperative-and-layout.md#formhandle).

## Choose what a subscription means

Subscribe to the node that owns the information you display.
A field's interaction state and a form-wide aggregate answer different questions; a sibling can change the aggregate without changing this field's own state.
For unsaved-output comparisons and the required root/path event masks, use [interaction state](interaction-state.md).
This prevents an indicator from tracking only local edits while missing an array move or output projection.

Use event callbacks to react to committed changes, not to reconstruct the settlement algorithm.
A listener can start another write, so keep its purpose bounded and avoid feeding a mirrored value straight back into the same form.
A callback throwing does not imply the preceding commit was rolled back; inspect the resulting state and use [validation failures](validation-failures.md) for operation reporting.

## Verify an observer

Check a value immediately after a public write and separately check the notification your observer relies on.
Mount the observer after a write to verify that its initial read or catch-up sees current state without assuming replay.
Replace its node and verify the old subscription is removed.
For aggregate indicators, change a second child while the first still holds the flag and verify that the UI does not interpret the lack of another aggregate transition as lost state.
