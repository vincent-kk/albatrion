# Addendum — root-only dispatcher (ADR 0008, "디스패처의 위치")

**RAN** = executed against `src/` at `ef598554e`; the rest reasoned from code. Paths relative to `packages/canard/schema-form/`.

## 1. Diagnosis — CONFIRMED (the owner's memory is accurate; the motivation is sound)

`publish` → `__acquireBatch__`, which calls `scheduleMicrotask` **at the node's first publish in the tick** (`EventCascadeManager.ts:118-124`). Microtasks are FIFO, so inter-node order is first-publish order, not tree order. `UpdateValue` is the exception — dispatched **synchronously** once the node is initialized — `publish(..., this.initialized)` in all 10 node types (`StringNode.ts:69`, `ObjectNode/…/BranchStrategy.ts:206`, `ArrayNode/…/BranchStrategy.ts:198`, …) → `AbstractNode.ts:898` → `EventCascadeManager.ts:143-150`.

RAN, a 3-level tree (`/` → `mid` → `mid/leaf`, plus `dep` computed on the leaf):

- **Leaf write**: `mid/leaf`(sync) → **`/` → `mid`** → `mid/leaf` → `dep`. Root before its own child.
- **Root write**: `mid/leaf`,`dep`(sync) → `mid/leaf` → `dep` → **`mid` → `/`**. Opposite depth order, same tree, same subscribers.
- **Re-entrant write from a listener** on `/mid` lands its `UpdateValue` *inside* the current wave, ahead of `mid RequestEmitChange` enqueued earlier.

## 2. Attack — ranked

**D1 (CORRECTNESS — biggest new blast radius). A throwing listener kills the whole wave.** `__resolve__` iterates listeners with no try/catch (`EventCascadeManager.ts:207-213`). Today a throw aborts only that node's listeners; under one root loop it aborts every node after it — their ledgers never bump, `useSyncExternalStore` never resyncs, that subtree freezes silently. `subscribe` is public API. RAN: a throw inside the microtask is not catchable by the caller.

**D2 (REACT-HAZARD). `revision` is bumped at delivery, not publish** — `__recordDelivery__` runs inside `__resolve__` (`:211`); `useSchemaNodeTracker` feeds `node.revision(mask)` to `useSyncExternalStore` (`hooks/useSchemaNodeTracker.ts:45-49`) precisely to catch deliveries in React's render→commit gap (`:10-19`). The root must bump node X's ledger **immediately before X's listeners run**. Bumping all up front lets an early listener see a revision for a node not yet notified; bumping after lets a forced-resync `getSnapshot` read a stale number and skip the re-render permanently. The ADR omits revision timing.

**D3 (sequencing). The dispatcher cannot ship before ADR 0007.** Computed dependencies call `__updateComputedProperties__` from an `UpdateValue` listener (`AbstractNode.ts:526-535`) and `VirtualNode` mirrors refNodes the same way (`VirtualNode.ts:118-135`) — both need synchronous `UpdateValue`. Deferring them reorders internal transitions unless they have already moved into Derive.

**D4 (CORRECTNESS). Not every publish belongs to a settle.** `FormHandle.focus/select` publish `RequestFocus`/`RequestSelect` on an arbitrary node with no value change (`components/Form/Form.tsx:148,150`); virtualization publishes them with `immediate = true` (`DeferrableNodeProxy.tsx:55,57`) so focus lands in the same task as the deferred mount. A delivery set of "nodes changed in this settle" (ADR line 37) carries neither, and a deferred focus can land after a `RequestRefresh` remounts the element.

**D5 (NON-CONVERGENCE). Next-wave deferral changes what the loop guard measures.** `MAX_LOOP_COUNT` is per node (`EventCascadeManager.ts:83,95`), macrotask-reset (`:110-116`). Two listeners writing once each per wave never exceed a per-node count yet produce unbounded waves — centralising needs an explicit **waves-per-tick** cap, its error raised outside the microtask (D1).

**D6 (API break). `await`-style array APIs.** `push`/`remove`/`pop`/`clear` return `promiseAfterMicrotask(...)` — one microtask (`ArrayNode/…/BranchStrategy.ts:374,404,419,455,465`). With one root microtask plus next-wave deferral, a wave-2 notification resolves after the promise, so `await arr.push(x)` stops implying subscribers have seen it. Make them synchronous (ADR 0007 미결 flags this).

**D7 (CORRECTNESS). Detached nodes between enqueue and delivery.** `__cleanUp__` clears listeners but does not cancel a pending batch (`AbstractNode.ts:879-882`, `EventCascadeManager.ts:246-251`) — harmless today only because the listener set is empty. Array removal cleans whole item subtrees mid-tick (`ArrayNode/…/BranchStrategy.ts:457-459`) while the root would still hold them.

**D8 (answers).** *Order:* top-down document order — under ADR 0007 values settle before Notify, so no order exposes a half-settled tree; top-down is free from the Resolve walk, stable across equivalent writes (today's is not), and matches React. It inverts today's root-write order, so it is consumer-visible. *Perf:* no realistic case where the root is slower — a 10,000-item bulk write schedules 10,000 microtasks today. The cost is memory shape: one live dirty Set per settle. Keep bitmask and payload **on the node** (ADR line 36) so the root holds only references.

## 3. Minimal safe specification

1. **Order** — top-down document order from the Resolve walk; signal-only nodes appended in publish order.
2. **Delivery set** — (nodes changed this settle) ∪ (nodes with a pending signal bitmask).
3. **Revision** — bump node X's ledger immediately before invoking X's listeners; never earlier, never later.
4. **Wave** — iterate a frozen snapshot; writes during it settle immediately but notify next wave; cap waves per tick, error raised outside the microtask.
5. **Detached** — skip any node cleaned up or unparented after enqueue; clear its pending bitmask.
6. **Errors** — isolate each listener call; report and continue, so one consumer cannot freeze its neighbours.
