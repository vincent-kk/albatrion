import {
  JSONPointer as $,
  getChildPointer,
  readFormattedNameSegment,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import { engineModes } from '../../../utils/cache/engineModes';
import type {
  SplitAnchorEvent,
  SplitBucket,
  SplitOwner,
} from '../../types/splitRegistration';
import { verifyGateSelection } from '../gates/verifyGateSelection';

/** One compressed group of absent keys occupying a single ancestor position. */
interface SplitAnchor {
  /** Non-member key inserted only into strict ancestor indexes. */
  key: string;
  /** Table host whose ancestor positions this anchor preserves. */
  hostPath: string;
  /** Number of represented members not yet consumed. */
  count: number;
}

/** First-hit membership is implicit; later representatives use explicit path keys. */
interface SplitRunState {
  /** Initial anchor represents every static rank outside excluded. */
  initial?: SplitAnchor;
  /** Initially live and already consumed initial representatives. */
  excluded: Set<number>;
  /** Deleted members eligible for representation at a later hit. */
  released: Map<number, string>;
}

/** Dirty paths retain descendant order or close an ungated post-order frontier. */
export class DirtyPathSet extends Set<string> {
  /** Verify-only cleanup runs before scratch clears the dirty containers. */
  restoreRegistrationObserver?: () => void;
  /** Shared blueprint lookup; attaching it does not enumerate dormant members. */
  private splitOwners?: ReadonlyMap<string, SplitOwner>;
  /** Call-local compressed run state. */
  private splitRuns = new Map<SplitBucket, SplitRunState[]>();
  /** Only re-represented members need an explicit member-to-anchor entry. */
  private memberAnchors = new Map<string, SplitAnchor>();

  /** Dirty descendant edges by parent in insertion order; post-order keeps a consumed child's edge until its parent is consumed. */
  readonly childrenByParent: Map<string, Map<string, string>>;

  /** Ungated computation consumes live nodes only after their children. */
  private postOrder = false;

  /**
   * @param childrenByParent - Scratch index cleared with this set
   */
  constructor(childrenByParent: Map<string, Map<string, string>>) {
    super();
    this.childrenByParent = childrenByParent;
  }

  /** Whether dirty paths already use the direct-edge post-order index. */
  get isPostOrder(): boolean {
    return this.postOrder;
  }

  /**
   * Attach immutable owner evidence without copying its members per settlement.
   * @param owners - Blueprint-scoped path-to-bucket/run/rank index
   * @returns Nothing; the reference is released with scratch
   */
  configureSplitOwners(owners: ReadonlyMap<string, SplitOwner>): void {
    this.splitOwners = owners;
  }

  /**
   * Plan absent-member representatives without walking a run's dormant members.
   * @param bucket - Static host/rank evidence for the hit trie node
   * @param liveRanks - Current living split members, ordered by owner rank
   * @param epoch - Monotone registration identity used by non-member keys
   * @returns Deferred insertions at the first newly represented rank of each run
   */
  planSplitAnchors(
    bucket: SplitBucket,
    liveRanks: readonly number[],
    epoch: number,
  ): SplitAnchorEvent[] {
    if (!bucket.hostPath) return [];
    let states = this.splitRuns.get(bucket);
    const first = !states;
    if (!states) {
      states = bucket.runs.map(() => ({
        excluded: new Set(),
        released: new Map(),
      }));
      this.splitRuns.set(bucket, states);
    }
    const living = new Set(liveRanks);
    const events: SplitAnchorEvent[] = [];
    let liveCursor = 0;
    for (let run = 0; run < bucket.runs.length; run++) {
      const definition = bucket.runs[run];
      const state = states[run];
      let rank: number | undefined;
      let count = 0;
      const represented: string[] = [];
      if (first) {
        const lastRank = definition.ranks[definition.ranks.length - 1];
        while (
          liveCursor < liveRanks.length &&
          liveRanks[liveCursor] <= lastRank
        )
          state.excluded.add(liveRanks[liveCursor++]);
        count = definition.ranks.length - state.excluded.size;
        if (count)
          for (const candidate of definition.ranks)
            if (!state.excluded.has(candidate)) {
              rank = candidate;
              break;
            }
      } else {
        for (const [releasedRank, path] of state.released)
          if (!living.has(releasedRank)) {
            represented.push(path);
            count++;
            if (rank === undefined || releasedRank < rank) rank = releasedRank;
          }
        state.released.clear();
      }
      if (rank === undefined || !count) continue;
      const anchor: SplitAnchor = {
        key:
          '\u0000' +
          bucket.hostPath +
          '\u0000' +
          epoch +
          '\u0000' +
          (definition.id ?? run),
        hostPath: bucket.hostPath,
        count,
      };
      if (first) state.initial = anchor;
      else for (const path of represented) this.memberAnchors.set(path, anchor);
      events.push({ rank, insert: () => this.insertSplitAnchor(anchor) });
    }
    return events;
  }

  /** Insert a non-member key into each strict host ancestor using escaped segments. */
  private insertSplitAnchor(anchor: SplitAnchor): void {
    let parent = '';
    while (parent !== anchor.hostPath) {
      const child = getChildPointer(anchor.hostPath, parent);
      if (child === undefined) break;
      const segment = readFormattedNameSegment(child, -1);
      if (segment === undefined) break;
      let children = this.childrenByParent.get(parent);
      if (!children) this.childrenByParent.set(parent, (children = new Map()));
      children.set(anchor.key, segment);
      parent = child;
    }
  }

  /** Consume representatives only; a living excluded member never decrements a count. */
  private releaseSplitMember(path: string): void {
    const owner = this.splitOwners?.get(path);
    if (!owner) return;
    const state = this.splitRuns.get(owner.bucket)?.[owner.run];
    if (!state) return;
    let anchor = this.memberAnchors.get(path);
    if (anchor) this.memberAnchors.delete(path);
    else if (state.initial && !state.excluded.has(owner.rank)) {
      anchor = state.initial;
      state.excluded.add(owner.rank);
    }
    state.released.set(owner.rank, path);
    if (!anchor || --anchor.count !== 0) return;
    let parent = '';
    while (parent !== anchor.hostPath) {
      const child = getChildPointer(anchor.hostPath, parent);
      if (child === undefined) break;
      const children = this.childrenByParent.get(parent);
      children?.delete(anchor.key);
      if (children?.size === 0) this.childrenByParent.delete(parent);
      parent = child;
    }
  }

  /**
   * Close the frontier before ungated write marking or computation.
   * Registration must still repair ancestors of unresolved paths each round.
   * @returns Nothing; indexes each unique prefix once in first-descendant order
   */
  beginPostOrder(): void {
    if (this.postOrder) return;
    this.postOrder = true;
    this.childrenByParent.clear();
    const linked = new Set<string>();
    for (const path of this) {
      let current = path;
      while (current && !linked.has(current)) {
        linked.add(current);
        const parent = resolvePointer(current, $.Parent);
        const segment = readFormattedNameSegment(current, -1);
        if (segment === undefined) break;
        super.add(parent);
        let children = this.childrenByParent.get(parent);
        if (!children) {
          children = new Map();
          this.childrenByParent.set(parent, children);
        }
        children.set(current, segment);
        current = parent;
      }
    }
  }

  override add(path: string): this {
    if (this.has(path)) return this;
    if (this.postOrder) {
      let current = path;
      while (!this.has(current)) {
        super.add(current);
        if (!current) break;
        const parent = resolvePointer(current, $.Parent);
        const segment = readFormattedNameSegment(current, -1);
        if (segment === undefined) break;
        let children = this.childrenByParent.get(parent);
        if (!children) {
          children = new Map();
          this.childrenByParent.set(parent, children);
        }
        if (children.has(current)) children.delete(current);
        children.set(current, segment);
        current = parent;
      }
      return this;
    }
    super.add(path);
    let parent = '';
    while (parent !== path) {
      const child = getChildPointer(path, parent);
      if (child === undefined) break;
      const segment = readFormattedNameSegment(child, -1);
      if (segment === undefined) break;
      let children = this.childrenByParent.get(parent);
      if (!children) {
        children = new Map();
        this.childrenByParent.set(parent, children);
      }
      children.set(path, segment);
      parent = child;
    }
    return this;
  }

  override delete(path: string): boolean {
    if (!super.delete(path)) return false;
    if (this.postOrder) {
      if (path) {
        const parent = resolvePointer(path, $.Parent);
        const children = this.childrenByParent.get(parent);
        children?.delete(path);
        if (children?.size === 0) this.childrenByParent.delete(parent);
      }
      return true;
    }
    if (this.splitOwners) this.releaseSplitMember(path);
    let parent = '';
    while (parent !== path) {
      const child = getChildPointer(path, parent);
      if (child === undefined) break;
      const children = this.childrenByParent.get(parent);
      children?.delete(path);
      if (children?.size === 0) this.childrenByParent.delete(parent);
      parent = child;
    }
    return true;
  }

  /**
   * Consume a settled node after its children without slicing its parent path.
   * @param path - Completed node; post-order child entries must already be consumed
   * @returns Whether a dirty member was removed; ordinary indexes use delete
   * @throws S6 verification failure in verify mode when a post-order child is still dirty
   */
  consume(path: string): boolean {
    if (!this.postOrder) return this.delete(path);
    if (engineModes.gateSelection === 'verify')
      for (const child of this.childrenByParent.get(path)?.keys() ?? [])
        verifyGateSelection(
          !this.has(child),
          'S6 consume has an unconsumed child: ' + child,
        );
    if (!super.delete(path)) return false;
    this.childrenByParent.delete(path);
    return true;
  }

  override clear(): void {
    super.clear();
    this.childrenByParent.clear();
    this.postOrder = false;
    this.splitOwners = undefined;
    this.splitRuns.clear();
    this.memberAnchors.clear();
  }
}
