# @winglet/common-utils: bug bounty round 6

3 new findings in `@winglet/common-utils`, all low. Items in the documents of [round 1](../round-1/winglet-common-utils.md), [round 2](../round-2/winglet-common-utils.md), [round 3](../round-3/winglet-common-utils.md), [round 4](../round-4/winglet-common-utils.md) and [round 5](../round-5/winglet-common-utils.md) are treated as fixed and excluded, together with their recorded decisions and known limits. The main session re-runs every probe: `r6-winglet-data` runs 10 tests, of which 5 fail, and `r6-release` runs 56 tests, all passing. Item 1 is a regression of the round 5 deep-clone fix; item 2 repeats the watch-list point on cloning across realms, below the medium threshold.

Probes: [probes/winglet-common-utils/](probes/winglet-common-utils/)

- Copy a folder back to `packages/winglet/common-utils/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/common-utils test --run src/__bounty__/<hunter-id>/ --testTimeout=120000`. The data probes use the public source entry point; the release probes examine current built output and strict declaration consumers for all published packages. `history.test.ts` reads both archived revisions into a temporary directory and uses the live source alias for supporting utilities, while relative clone implementations and helpers come from the archives.
- The failing `r6-winglet-data/deepClone.test.ts` case, "clone preserves traversal-time getter observations at its deep boundary", is a diagnostic: getter order is not explicitly promised, and getters are excluded from the deep stack-safety guarantee. The historical diagnostic, foreign Map control, failed-owner handler checks and deep-cycle controls pass. The other four failures establish the three findings below.
- Earlier retained probes for this package are also re-run: the main session records 224 tests and 19 failures under the default configurations, including the round 4 folders, all assigned non-finding roles, with no regression of an original fixed input. The hunter's per-round table remains the source of each failing test's role. Common-utils failures represent the foreign `isEmpty` and view/subclass limits, cycle and host-order decisions, diagnostics and measurements, obsolete public export/source-condition text, and the decided early refusal without `AbortController`. The new `r6-rerun-packages/rg3-neighbors.test.ts` controls pass.

Root-cause files: `packages/winglet/common-utils/src/utils/`

## 1. Bounded cloning changes shared-reference ownership when the same payload moves past depth 256.

- Severity: low. A deep plain-container graph with shared references and `maxDepth` retains different caller-owned children after wrapping the payload and increasing the limit by the same depth.
- Affected public API: `clone(target, maxDepth)`.
- Contract violated: `packages/winglet/common-utils/src/utils/object/clone.ts:47` promises retained references beyond the limit; `packages/winglet/common-utils/src/utils/object/DETAIL.md:30` defines absolute root depth and retained boundary values. The round 5 alias-preservation decision is recorded in `../round-5/FIXES.md:454`.
- Root cause: `packages/winglet/common-utils/src/utils/object/utils/clone/replicateDeep.ts:30` allocates and caches all immediate child shells before traversing descendants, and `:28` pops frames in reverse order. Recursive cloning completes the first property subtree first. In `{ a: { nested: shared }, b: shared }`, the iterative order changes the depth at which `shared` enters the cache and whether `shared.child` remains caller-owned.
- Relation to earlier rounds: [round 5 common-utils item 3](../round-5/winglet-common-utils.md), with a new traversal-order/cache interaction rather than renewed stack overflow.
- Reopens an earlier fix: [round 5 common-utils item 3](../round-5/winglet-common-utils.md), commit `90f2cdcd2`.
- Regression of an earlier fix: yes, case (b), commit `90f2cdcd2`. The passing `history.test.ts` diagnostic executes the same 256-wrapper, maxDepth-259 input against the parent and fix revisions and observes source-reference identity `[true, false]`.
- Watch list: no. This input uses local plain objects.
- Reproduction: `r6-winglet-data/deepClone.test.ts`, "clone bounded aliases have the same contents at shallow and deep positions". `clone(payload, 3).a.nested.child === shared.child` is `true`, while `unwrap(clone(wrap(payload, 256), 259), 256).a.nested.child === shared.child` is `false`; the expected deep result is `true`, matching the shallow result.
- Confidence: high for behavior and introduction commit; medium for classification because alias identity and depth cutoffs interact. Verification uses the public source API and an archived-implementation diagnostic.

## 2. Cloning a local Map or Set subclass loses native entries hidden by its filtering iterator.

- Severity: low. Unusual collection subclasses silently lose stored entries, while the foreign Map path preserves them. The hunter rates this medium; the final rating is low because the filtering-subclass input is unusual.
- Affected public API: `clone`, from the root and object subpath.
- Contract violated: `packages/winglet/common-utils/src/utils/object/DETAIL.md:31` promises subclass prototypes and built-in slots; `packages/winglet/common-utils/src/utils/object/clone.ts:40` includes Map and Set state. The supported-slot decision in `../round-4/FIXES.md:400` covers both realms; the additional-own-property limit in `../round-5/FIXES.md:456` does not exclude native entries.
- Root cause: `packages/winglet/common-utils/src/utils/object/utils/clone/cloneBuiltinSubclass.ts:56` and `:66` populate native slots through the overridden `Symbol.iterator`. The foreign path at `packages/winglet/common-utils/src/utils/object/clone.ts:502` and `:509` instead reads slots through `Map.prototype.entries.call` and `Set.prototype.values.call`.
- Relation to earlier rounds: [round 4 common-utils item 1](../round-4/winglet-common-utils.md), but traversal loses entries rather than allocation losing the prototype. [Round 5 common-utils item 5](../round-5/winglet-common-utils.md) concerns additional own fields, which this input does not use.
- Reopens an earlier fix: [round 4 common-utils item 1](../round-4/winglet-common-utils.md), commit `dbdd68782`.
- Regression of an earlier fix: no. Source inspection of `dbdd68782^` shows the same overridden-iterator traversal before helper extraction.
- Watch list: yes, `clone` across realms, below the medium threshold for another-round counting.
- Reproduction: `r6-winglet-data/subclassSlots.test.ts`, "local Map subclass clone retains native entries hidden by its iterator" gives `{ size: 1, hidden: undefined }`, expected `{ size: 2, hidden: 2 }`; "local Set subclass clone retains members hidden by its iterator" gives `{ size: 1, hidden: false }`, expected `{ size: 2, hidden: true }`. The foreign Map subclass control preserves size 2 and the hidden value.
- Confidence: high for public-source reproduction; medium-high for treating custom iteration as a view of the stored collection.

## 3. Destroying a scheduler inside its overflow callback accepts and permanently retains a new task.

- Severity: low. The destroyed scheduler returns a positive task identifier and retains a callback after closing its execution ports. The hunter rates this medium; the final rating is low because it requires an unusual teardown order inside the overflow callback.
- Affected public API: `MessageChannelScheduler.getInstance`, `schedule`, `destroy` and `onMaxTasksExceeded`.
- Contract violated: `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts:158` defines positive accepted identifiers and `-1` rejection; `:257` promises cancellation and release on destruction; `:279` forbids scheduling after destruction. The callback may return void at `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/type.ts:7`.
- Root cause: `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts:164` checks destruction only before user code. The callback at `:175` destroys the scheduler, but `:185-187` subsequently inserts work into its cleared pending map. Closed ports cannot execute it, and another `destroy()` returns at `:264`.
- Relation to earlier rounds: the cleanup-owner class of round 5; [round 4 common-utils item 5](../round-4/winglet-common-utils.md) concerns task-identifier reuse, a different scheduler-lifetime mechanism.
- Reopens an earlier fix: no. The callback lines originate in pre-bounty commit `77990abd8`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r6-winglet-data/schedulerOwner.test.ts`, "destroy inside overflow cleanup leaves no accepted pending work" observes `{ destroyed: true, pending: 1, accepted: true, executed: 0 }` after 20 milliseconds, expected `{ destroyed: true, pending: 0, accepted: false, executed: 0 }`. Rejection by `-1` or a synchronous throw satisfies the probe; it cancels retained work after observation.
- Confidence: high; public API from source using Node's MessageChannel.

## Hypotheses checked and not bugs

- A manager saved from a failed before hook publishes its updates immediately while another invocation waits in before or after hooks, under both `preventConcurrent` values.
- A deep cyclic plain graph preserves its self-reference and compares equal with `stableEquals`; Error metadata whose `toJSON` returns itself normalizes once without preserving the function.
- The retained neighbor checks preserve foreign Error self-cycles, aliases and descriptors, and a 12,000-level alternating object/array cycle. Existing lightweight cyclic-input and foreign DataView/subclass limits remain decisions.
- Current built public targets exist, module-format export names agree, bare imports and resolved addresses agree, and the supported strict declaration profiles pass. These checks cover release surfaces, not every exported function's semantics.
