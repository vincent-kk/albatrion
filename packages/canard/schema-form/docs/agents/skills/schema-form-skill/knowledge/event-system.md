# Event System

Every node publishes typed events (`FieldNodeEventType`). This file is the mental model for when listeners fire and why reads can be stale.

## Batching Model

- A public write settles and commits synchronously. Listeners are notified when the outermost write returns, with the events of one write merged per node.
- A write made inside a listener joins the same chain as its next wave and is also delivered before the outermost call returns. `onChange` runs once per outermost write, after the last wave.

Consequence: after `setValue()` returns, values and controls state are current and can be read synchronously. Validation runs on a microtask, so `errors` are stale until it finishes.

## setValue Synchronicity

- `setValue()` settles synchronously on any node, parent or leaf; controls state is committed before the call returns.

## Event Types

`FieldNodeEventType` is a bit-flag enum exported from the package (enumerate members from `dist/*.d.ts`): lifecycle (`Initialized`), value/state (`UpdateValue`, `UpdateState`, `UpdateError`, `UpdateControlledProperties`, `UpdateChildren`, `UpdatePath`, `UpdateJsonSchema`), aggregates (`UpdateGlobalState`, `UpdateGlobalError`, `UpdateDiagnostics`), focus (`Focused`, `Blurred`), commands to the input (`RequestFocus`, `RequestSelect`, `RequestRefresh`), and `RequestRemount`, which remounts the node's rendered subtree.

- `RequestRefresh` re-syncs uncontrolled inputs; the system raises it, and `formRef.current?.refresh(path)` raises it on demand.
- `RequestRemount` is the external escape hatch for forcing a full component remount of a subtree: `formRef.current?.remount(path)`. There is no public `node.publish`.
- `UpdateGlobalState` and `UpdateGlobalError` are root-level aggregates; `UpdateDiagnostics` reports changes of the root settlement diagnostics.

## Committed Delivery and Global State

Events are delivered from the committed result of a settlement, not while it is still computing. The settlement marks which bits changed per node, and each outermost write then delivers them once in document order, so a listener reading the tree sees the final committed state. Nodes without listeners still count their bits, so `revision(mask)` stays correct for late subscribers.

Aggregate flags are published at the root. `UpdateGlobalState` is raised once per outermost entry, and only when a state key (such as `dirty` or `touched`) crosses between "no node has it" and "some node has it"; further nodes joining or leaving a key that is already set raise nothing.

## Subscribing

```typescript
import { FieldNodeEventType } from '@canard/schema-form';

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
- For re-render-on-event, `useFieldNodeTracker(node, mask)` — always pass the mask; the default is ALL events (`validation-and-state.md`).
- A write made inside a listener joins the same chain; the feedback depth is capped at 25 waves, and exceeding it throws `FEEDBACK_LIMIT_EXCEEDED` at the end of the outermost write.
