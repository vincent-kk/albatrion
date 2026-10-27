// Runtime-owned engineModes enables the full oracle only in explicit verify bundles.
import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type {
  InactiveBase,
  InactiveEntry,
  InactiveGeneration,
  InactiveSource,
  InactiveValues,
} from '../../types/inactiveValues';
import type { SettlementContext } from '../../types/settlement';
import { EMPTY_VALUES } from '../detached/emptyDetachedReads';
import { LazyInactiveMap } from './LazyInactiveMap';
import { captureInactiveBase } from './captureInactiveBase';
import { captureInactiveDelta } from './captureInactiveDelta';
import { compareInactiveOrder } from './compareInactiveOrder';
import { hasInactiveRangeChanges } from './hasInactiveRangeChanges';
import { readInactiveProjection } from './readInactiveProjection';
import { verifyInactiveRead } from './verifyInactiveRead';

/** Journal cap multiplier amortizes compaction over changed source facts. */
const JOURNAL_SOURCE_MULTIPLIER = 2;
/** Small forms retain at most this many unread facts before compaction. */
const MINIMUM_JOURNAL_ITEMS = 512;
/** Paths whose empty publication never changed share one version. */
const EMPTY_VERSION = Object.freeze({});

/** Tree-owned lazy publications; generations retain sources rather than public nodes. */
export class InactiveValuesState<Self extends FieldNodeRecord<Self>> {
  /** Reentrant store callbacks observe raw data while this owner publishes. */
  busy = true;
  /** Exact current immutable generation captured by departing references. */
  private generation: InactiveGeneration;
  /** Frozen arrays indexed by actual list-change tokens. */
  private readonly values = new WeakMap<object, InactiveValues>();
  /** Identity-keyed cache invalidation never stores retired public records strongly. */
  private readonly dirty = new WeakSet<object>();
  /** Only the last array/version is retained per live host, never an old source chain. */
  private readonly hosts = new WeakMap<
    object,
    { path: string; version: object; values: InactiveValues }
  >();
  /** Public host projection store retaining native indexed Map behavior. */
  private readonly memo: LazyInactiveMap<InactiveValues>;
  /** Selected item adapter materializes only when an internal reader requests it. */
  private readonly entries: LazyInactiveMap<InactiveEntry>;
  /** Generation already reflected by the native selected-entry adapter. */
  private entriesGeneration?: InactiveGeneration;
  /** Generation whose complete native host-map scope has been published. */
  private publishedGeneration?: InactiveGeneration;
  /** Number of unread source and visibility facts since compaction. */
  journalSize = 0;
  /** Bounded-journal compactions, including writes with no public reads. */
  compactions = 0;
  /** Root-read compactions incur their cost only on that requested full-range read. */
  readCompactions = 0;

  /**
   * Adopt the projection stores after a full dynamic load/fallback publication.
   * @param root - Committed shape whose prior frozen arrays seed the lazy versions
   */
  constructor(private readonly root: Self) {
    const runtime = root.runtime;
    const base = captureInactiveBase(root, this.values);
    this.generation = this.createGeneration(base);
    this.memo = new LazyInactiveMap(
      'path',
      runtime.inactiveValuesMemo,
      (path) => {
        if (!this.busy) this.publishPath(path);
      },
      () => {
        if (!this.busy) this.publishAll();
      },
    );
    this.entries = new LazyInactiveMap(
      'pair',
      runtime.inactiveValueEntries ?? [],
      () => {
        if (!this.busy) this.publishEntries();
      },
      () => {
        if (!this.busy) this.publishEntries();
      },
    );
    runtime.inactiveValuesMemo = this.memo;
    runtime.inactiveValueEntries = this.entries;
    this.busy = false;
  }

  /**
   * Append committed facts and enforce the unread-journal cap.
   * @param context - Completed settlement; omitted for an untracked internal caller
   * @returns Nothing; public arrays remain deferred through bounded compaction
   */
  append(context?: SettlementContext<Self>): void {
    const delta = captureInactiveDelta(this.root, context);
    if (delta.changes.size || delta.visibility.size) {
      this.generation.projections.clear();
      this.generation.readVersions.clear();
      this.generation = this.createGeneration(
        this.generation.base,
        this.generation,
        delta.changes,
        delta.visibility,
      );
      this.journalSize += delta.changes.size + delta.visibility.size;
      if (context) {
        this.markDirty(context.target);
        for (const node of context.entered) this.markDirty(node);
        for (const node of context.exited) this.markDirty(node);
        for (const node of context.changedNodes) this.markDirty(node);
      }
      if (
        this.journalSize >
        Math.max(
          JOURNAL_SOURCE_MULTIPLIER * this.root.runtime.latentRaw.size,
          MINIMUM_JOURNAL_ITEMS,
        )
      )
        this.compress();
    }
  }

  /**
   * Read a live host through its identity cache and current immutable facts.
   * @param node - Attached occurrence whose existing path selects the host range
   * @returns The frozen array for its current list version
   */
  read(node: Self): InactiveValues {
    const held = this.hosts.get(node);
    if (
      held &&
      held.path === node.path &&
      !this.dirty.has(node) &&
      (this.generation.base.versions.get(node.path) ?? EMPTY_VERSION) ===
        held.version &&
      !hasInactiveRangeChanges(this.generation, node.path)
    ) {
      this.generation.readVersions.set(node.path, held.version);
      if (engineModes.inactiveValues === 'verify')
        verifyInactiveRead(
          this.root,
          this.generation,
          node.path,
          held.values,
          EMPTY_VERSION,
        );
      return held.values;
    }
    this.dirty.delete(node);
    const generation = this.generation;
    const values = this.readGeneration(generation, node.path);
    const version = generation.readVersions.get(node.path)!;
    this.hosts.set(node, { path: node.path, version, values });
    return values;
  }

  /**
   * Retain prior-commit facts without reading or allocating their public list.
   * @param path - Existing path captured before the occurrence is detached/rekeyed
   * @returns A reader bound to that exact immutable generation and path
   */
  capture(path: string): () => InactiveValues {
    const generation = this.generation;
    return () => this.readGeneration(generation, path);
  }

  /**
   * Materialize one exact generation, including snapshots retained by old references.
   * @param generation - Current or historical immutable source facts
   * @param path - Host path belonging to that generation
   * @returns Its stable frozen list, verified independently in verify mode
   */
  readGeneration(generation: InactiveGeneration, path: string): InactiveValues {
    const version = generation.readVersions.get(path);
    const cached = version && this.values.get(version);
    if (cached) {
      if (engineModes.inactiveValues === 'verify')
        verifyInactiveRead(this.root, generation, path, cached, EMPTY_VERSION);
      if (generation !== this.generation) generation.projections.clear();
      return cached;
    }
    const view = readInactiveProjection(generation, path, EMPTY_VERSION);
    let values = this.values.get(view.version);
    if (!values) {
      const ordered = [...view.entries.values()].sort(
        (left, right) =>
          compareInactiveOrder(left.order, right.order) ||
          (left.entry.path < right.entry.path
            ? -1
            : left.entry.path > right.entry.path
              ? 1
              : 0),
      );
      values = ordered.length
        ? Object.freeze(ordered.map(({ entry }) => entry))
        : EMPTY_VALUES;
      this.values.set(view.version, values);
    }
    generation.readVersions.set(path, view.version);
    if (engineModes.inactiveValues === 'verify')
      verifyInactiveRead(this.root, generation, path, values, EMPTY_VERSION);
    if (generation === this.generation && path === '' && generation.parent)
      this.compress(false);
    if (generation !== this.generation) generation.projections.clear();
    return values;
  }

  /**
   * Refresh one native Map slot from the current generation.
   * @param path - Existing requested host path
   * @returns Nothing; the slot is set or removed to match full publication scope
   */
  publishPath(path: string): void {
    const values = this.readGeneration(this.generation, path);
    this.busy = true;
    try {
      if (values.length || path === '') this.memo.set(path, values);
      else this.memo.delete(path);
    } finally {
      this.busy = false;
    }
  }

  /**
   * Refresh selected item observations without generating any host arrays.
   * @returns Nothing; the native entry adapter reflects the current generation
   */
  publishEntries(): void {
    if (this.entriesGeneration === this.generation) return;
    const view = readInactiveProjection(this.generation, '', EMPTY_VERSION);
    this.busy = true;
    try {
      this.entries.clear();
      for (const [key, entry] of view.entries) this.entries.set(key, entry);
      this.entriesGeneration = this.generation;
    } finally {
      this.busy = false;
    }
  }

  /**
   * Publish complete host scope for internal Map iteration and wholesale path edits.
   * @returns Nothing; entries and path-indexed frozen arrays match full publication
   */
  publishAll(): void {
    if (this.publishedGeneration === this.generation) return;
    this.publishEntries();
    const paths = new Set<string>(['']);
    const view = readInactiveProjection(this.generation, '', EMPTY_VERSION);
    for (const { entry } of view.entries.values()) {
      let path = entry.path;
      while (path) {
        paths.add(path);
        path = path.slice(0, path.lastIndexOf('/'));
      }
    }
    this.busy = true;
    try {
      for (const path of this.memo.keys())
        if (!paths.has(path)) this.memo.delete(path);
    } finally {
      this.busy = false;
    }
    for (const path of paths) this.publishPath(path);
    this.publishedGeneration = this.generation;
  }

  /**
   * Capture a completed full fallback while preserving its array/item identities.
   * @returns Nothing; subsequent deltas start from a separate immutable base
   */
  reset(): void {
    this.busy = true;
    try {
      this.generation = this.createGeneration(
        captureInactiveBase(this.root, this.values),
      );
      this.journalSize = 0;
    } finally {
      this.busy = false;
    }
  }

  /**
   * Fold sources and selected items without sorting or materializing public lists.
   * @param onWrite - True for the journal-cap path; false for a requested root read
   * @returns Nothing; old tokens keep their facts and current history is bounded
   */
  compress(onWrite = true): void {
    const view = readInactiveProjection(this.generation, '', EMPTY_VERSION);
    const sources = new PathKeyedMap<InactiveSource>('pair');
    for (const [key, source] of view.sources)
      sources.set(key, {
        ...source,
        visible: view.visibility.get(source.path) ?? source.visible,
      });
    const base = { sources, entries: view.entries, versions: view.versions! };
    this.generation = this.createGeneration(base);
    this.journalSize = 0;
    if (onWrite) this.compactions++;
    else this.readCompactions++;
  }

  /**
   * Mark existing parent identities without building new path strings.
   * @param node - Affected current or departing occurrence from this settlement
   * @returns Nothing; attached ancestors are dirty until their next read
   */
  private markDirty(node: Self): void {
    for (let current: Self | null = node; current; current = current.parent)
      if (!current.detached) this.dirty.add(current);
  }

  /**
   * Construct immutable commit facts with read-owned equivalent caches.
   * @param base - Compacted source/index baseline shared by later commits
   * @param parent - Earlier facts, absent at a fresh compacted boundary
   * @param changes - Existing-key source deltas from this commit only
   * @param visibility - Final presence deltas from this commit only
   * @returns A node-free generation captured by live and detached readers
   */
  private createGeneration(
    base: InactiveBase,
    parent?: InactiveGeneration,
    changes: ReadonlyMap<string, InactiveSource> = new Map(),
    visibility: ReadonlyMap<string, boolean> = new Map(),
  ): InactiveGeneration {
    return {
      base,
      parent,
      changes,
      visibility,
      projections: new Map(),
      readVersions: new Map(),
      items: new Map(),
      versions: new Map(),
    };
  }
}
