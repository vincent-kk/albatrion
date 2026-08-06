# Event System

Every node publishes typed events (`NodeEventType`) batched through a per-node `EventCascade` microtask queue. This file is the mental model for when listeners fire and why reads can be stale.

## Batching Model

- Events scheduled in the **same synchronous stack** merge into one batch; subscribers receive the merged event on the next microtask.
- Events scheduled **while listeners are running** open a NEW batch (the current one is already resolved) — cascades settle over successive microtasks, not within one.

Consequence: after `setValue()`, a synchronous read of dependent state (computed properties, errors) is stale — flush a microtask first.

## setValue Synchronicity

- `setValue()` called on a **parent object/array node** uses the default `Overwrite` option, which isolates the update: computed properties refresh **synchronously** within the call.
- `setValue()` on a **child/leaf node** propagates asynchronously — computed properties update on the following microtask.

This asymmetry, combined with conditional filtering (parent applies it, child bypasses it — `troubleshooting.md`), is the main source of "sometimes it updates immediately, sometimes it doesn't" confusion.

## Event Types

`NodeEventType` members (enumerate from `dist/*.d.ts`): lifecycle (`Initialized`), value/state (`UpdateValue`, `UpdateState`, `UpdateError`, `UpdateComputedProperties`, `UpdateChildren`, `UpdatePath`), UI sync (`RequestRefresh`, `RequestRemount`), system (`RequestEmitChange`, `RequestInjection`).

- `RequestRefresh` is published by the internal system to re-sync uncontrolled inputs — do not publish it yourself.
- `RequestRemount` is the external escape hatch for forcing a full component remount: `node.publish(NodeEventType.RequestRemount)`.

## Subscribing

```typescript
useEffect(() => node.subscribe(listener), [node]); // subscribe returns its own cleanup
```

- Every `subscribe()` must have its cleanup returned from the effect — leaked listeners make cascades O(n²) across remounts.
- **Events delivered before a subscription are not replayed.** For a state mirror that must catch up, use `useSchemaNodeSubscribe`'s `onSubscribe` catch-up rather than assuming you saw everything.
- For re-render-on-event, `useSchemaNodeTracker(node, mask)` — always pass the mask; the default is ALL events (`validation-and-state.md`).
