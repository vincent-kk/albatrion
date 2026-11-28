import { map as mapArray } from '@winglet/common-utils/array';
import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Optional } from '@aileron/declare';

import {
  JSONPointer as $,
  isAbsolutePath,
} from '@/schema-form/helpers/jsonPointer';
import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';
import {
  appendSegment,
  parsePointerSegments,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type {
  Blueprint,
  BlueprintGate,
  PropertyDeclaration,
} from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';
import type {
  GatePredicate,
  GatePredicateMemo,
} from '../../types/gatePredicate';
import type { PresenceQueryCursor } from '../../types/presenceQueryCursor';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';
import { bindGateFrame } from './frames/bindGateFrame';
import { getGateExpression } from './getGateExpression';
import { isChildFrameGate } from './isChildFrameGate';
import { isOwnActiveGate } from './isOwnActiveGate';
import { createGatePredicate } from './predicates/createGatePredicate';
import { getIfGateReadNames } from './predicates/getIfGateReadNames';
import { resolveGateOccurrence } from './resolveGateOccurrence';
import type { DecisionConsumer, GateOccurrence } from './type';

/** One decision per (authored condition, host frame), shared by every consumer that references it. */
class RegisteredGateOccurrence implements GateOccurrence {
  readonly gate: BlueprintGate;
  readonly hostPath: string;
  readonly evaluationHostPath: string;
  /** Last successful pure evaluation; a throwing attempt clears it. */
  memo?: GatePredicateMemo;
  /** Last decision of any consumer's evaluation; a change invalidates the other consumers. */
  decision?: boolean;
  /** Owner paths holding references, with their reference counts; released when empty. */
  readonly owners = new Map<string, number>();
  /** Runtime predicate allocated only when this occurrence is actually read. */
  private boundPredicate?: GatePredicate;

  constructor(
    private readonly runtime: { blueprint: Blueprint; validator?: unknown },
    location: GateOccurrence,
    readonly watchPaths: readonly string[],
    readonly key: string,
  ) {
    this.gate = location.gate;
    this.hostPath = location.hostPath;
    this.evaluationHostPath = location.evaluationHostPath;
  }

  /** @returns One evaluator through a shared prototype accessor. */
  get predicate(): GatePredicate {
    return (this.boundPredicate ??= createGatePredicate(
      this.runtime,
      this,
      this.watchPaths,
    ));
  }
}

/** The part of a live owner the registry reads when it schedules, never at registration. */
interface RegisteredOwner {
  /** Strategy decides whether the owner reselects children; type tells an array parent. */
  readonly behavior: { readonly strategy: string; readonly type: string };
  /** Parent whose type tells whether the owner is an array item. */
  readonly __parent__: RegisteredOwner | null;
  /** Authored location whose own `controls.active` is the owner's presence in its parent. */
  readonly blueprintNode: { readonly schemaPath: string };
}

/** References one owner registration holds; released together with the registration. */
interface OwnedReferences {
  /** Occurrence references held by its template and direct edges, one per binding. */
  occurrences: RegisteredGateOccurrence[];
}

/** A node path and its currently live memoized gate occurrences. */
interface RegisteredNode extends OwnedReferences {
  /** Live node that owns this path; its shape is read only when a decision or own change is scheduled. */
  node: RegisteredOwner;
  /** Fold-inclusive kind token at this live path. */
  kind: string;
  /** Gate memo bound to this exact live node lifetime; the shared read-only empty memo until a gate is added. */
  memo: ReadonlyMap<BlueprintGate, RegisteredGateOccurrence>;
  /** Child-frame bindings (own active and child-local gates) per direct edge; absent until one is bound. */
  edges?: Map<string, Map<BlueprintGate, RegisteredGateOccurrence>>;
  /** Gates on this node's own declarations, before direct child edges. */
  ownOccurrences: readonly RegisteredGateOccurrence[];
}

/** Reference-counted watched paths of the live gates evaluated at one location. */
interface LocationWatchIndex {
  /** Live non-root watched paths and their occurrence counts. */
  exact: Map<string, number>;
  /** Strict watched-path prefixes, including the empty document pointer. */
  strictPrefixes: Map<string, number>;
  /** Live gates that watch the whole document. */
  root: number;
  /** Paths appended when their exact reference count changes from zero to one. */
  log: string[];
  /** Generation changed when dead record entries are compacted. */
  epoch: number;
}

/** Increment or remove one counted watch; callers keep paired indexes aligned. */
const bumpWatchCount = (
  map: Map<string, number>,
  key: string,
  by: number,
): void => {
  const next = (map.get(key) ?? 0) + by;
  if (next > 0) map.set(key, next);
  else map.delete(key);
};

/** Settlement-owned location index that follows live record lifetimes. */
class GateRegistry {
  /** Lazily created location watches; unqueried locations incur no index work. */
  private readonly watchIndex = new Map<string, LocationWatchIndex>();
  /** Current node identity and gate entries at each absolute path. */
  private readonly byPath = new Map<string, RegisteredNode>();
  /** Canonical decisions keyed by host frame address and authored condition identity. */
  private readonly canonical = new Map<string, RegisteredGateOccurrence>();
  /** Relocated gates keyed by their memoized evaluation host. */
  private readonly byLocation = new Map<
    string,
    Set<RegisteredGateOccurrence>
  >();
  /** Only relocated occurrences invalidate their lazily materialized bucket. */
  private readonly relocatedBuckets = new Map<string, Set<GateOccurrence>>();
  /** Stable arrays are replaced only when relocated membership changes. */
  private readonly relocatedLists = new Map<
    string,
    readonly GateOccurrence[]
  >();
  /** Absolute reads shared by gates that ask the same pointer at one host. */
  private readonly resolvedReads = new Map<string, Map<string, string>>();
  /** Decoded pointers contain no live shape or projected value. */
  private readonly segments = new Map<string, readonly PointerSegment[]>();
  /** One callback per registry binds occurrence syntax without per-registration closures. */
  private readonly readSegments = (path: string): readonly PointerSegment[] =>
    this.pathSegments(path);

  /** Bind exact expression dependencies from this tree's analyzed blueprint. */
  constructor(
    private readonly blueprint: Blueprint,
    private readonly runtime: { blueprint: Blueprint; validator?: unknown },
  ) {}

  /** Resolve each requested host/dependency pair once for this runtime. */
  resolveRead(hostPath: string, dependency: string): string {
    let reads = this.resolvedReads.get(hostPath);
    if (!reads) {
      reads = new Map();
      this.resolvedReads.set(hostPath, reads);
    }
    let path = reads.get(dependency);
    if (path === undefined) {
      path = resolveDependencyPath(hostPath, dependency);
      reads.set(dependency, path);
    }
    return path;
  }

  /** Decode an actually read absolute pointer once; callers still walk the live tree. */
  pathSegments(path: string): readonly PointerSegment[] {
    let segments = this.segments.get(path);
    if (!segments) {
      segments = getDependencyIndex(this.blueprint).pathSegments(
        path,
        this.runtime,
      );
      this.segments.set(path, segments);
    }
    return segments;
  }

  /** Compare a path and kind in the current indexed shape, if indexed. */
  hasRegisteredPathKind(path: string, kind: string): Optional<boolean> {
    if (this.byPath.size === 0) return undefined;
    return this.byPath.get(path)?.kind === kind;
  }

  /** Register template and direct-edge gates when an occurrence is created. */
  register<Self extends FieldNodeRecord<Self>>(node: Self): void {
    if (this.byPath.get(node.path)?.node === node) return;
    this.removePath(node.path);
    let memo: Map<BlueprintGate, RegisteredGateOccurrence> | undefined;
    let edges: RegisteredNode['edges'];
    const owned: OwnedReferences = { occurrences: [] };
    for (const declaration of node.blueprintNode.declarations)
      for (const gate of declaration.gates)
        this.add(node, gate, (memo ??= new Map()), owned, declaration);
    const ownOccurrences = memo ? [...memo.values()] : EMPTY_OCCURRENCES;
    for (const entry of node.blueprintNode.childEntries) {
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates)
          if (isChildFrameGate(gate, declaration)) {
            edges ??= new Map();
            let edgeMemo = edges.get(entry.name);
            if (!edgeMemo) {
              edgeMemo = new Map();
              edges.set(entry.name, edgeMemo);
            }
            this.add(node, gate, edgeMemo, owned, declaration, entry.name);
          } else
            this.add(
              node,
              gate,
              (memo ??= new Map()),
              owned,
              declaration,
              entry.name,
            );
    }
    this.byPath.set(node.path, {
      node,
      kind: getBlueprintNodeIdentity(node.blueprintNode),
      memo: memo ?? EMPTY_GATE_MEMO,
      edges,
      ownOccurrences,
      occurrences: owned.occurrences,
    });
  }

  /** Count existing host occurrences without binding or enumerating them; verify only. */
  occurrenceCount(path: string): number {
    return this.byPath.get(path)?.occurrences.length ?? 0;
  }

  /** Find or bind a gate inherited indirectly by a declaration. */
  locate<Self extends FieldNodeRecord<Self>>(
    node: Self,
    gate: BlueprintGate,
    edgeName?: string,
  ): RegisteredGateOccurrence {
    this.register(node);
    const registration = this.byPath.get(node.path)!;
    if (edgeName !== undefined) {
      const edges = (registration.edges ??= new Map());
      let edgeMemo = edges.get(edgeName);
      if (!edgeMemo) {
        edgeMemo = new Map();
        edges.set(edgeName, edgeMemo);
      }
      const edge = edgeMemo.get(gate);
      if (edge) return edge;
      this.add(node, gate, edgeMemo, registration, undefined, edgeName);
      const occurrence = edgeMemo.get(gate);
      if (!occurrence) throw new Error(`Missing gate at ${node.path}`);
      return occurrence;
    }
    const existing = registration.memo.get(gate);
    if (existing) return existing;
    const memo =
      registration.memo instanceof Map && registration.memo !== EMPTY_GATE_MEMO
        ? registration.memo
        : new Map<BlueprintGate, RegisteredGateOccurrence>();
    registration.memo = memo;
    this.add(node, gate, memo, registration);
    const occurrence = memo.get(gate);
    if (!occurrence) throw new Error(`Missing gate at ${node.path}`);
    return occurrence;
  }

  /** Read relocated gates at one host without scanning other templates. */
  relocatedOccurrences(path: string): readonly GateOccurrence[] {
    const bucket = this.relocatedBuckets.get(path);
    if (!bucket?.size) return EMPTY_OCCURRENCES;
    let list = this.relocatedLists.get(path);
    if (!list) {
      list = [...bucket];
      this.relocatedLists.set(path, list);
    }
    return list;
  }

  /** Whether changed source intersects any read that can affect this host's wheel. */
  mayChangeAt(
    path: string,
    changedSource: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    for (const occurrence of this.byLocation.get(path) ?? [])
      if (this.readsChanged(occurrence, changedSource, changedAncestors))
        return true;
    return false;
  }

  /**
   * Query grow-only presence evidence with the same answer as full traversal.
   * @param path - Evaluation location whose live watches are compared
   * @param changed - Accumulated identity changes, never removed within this call
   * @param prefixes - Accumulated strict ancestors of changed paths
   * @param changedLog - Insertion record corresponding exactly to changed
   * @param prefixLog - Insertion record corresponding exactly to prefixes
   * @param cursor - Settlement-owned progress; a true result retires this location
   * @param metrics - Optional record-mode index probe counter
   * @returns Whether a live watched path intersects accumulated presence changes
   */
  mayPresenceChangeAt(
    path: string,
    changed: ReadonlySet<string>,
    prefixes: ReadonlySet<string>,
    changedLog: readonly string[],
    prefixLog: readonly string[],
    cursor: PresenceQueryCursor,
    metrics?: { indexLookups: number },
  ): boolean {
    if (changed.size === 0) return false;
    let index = this.watchIndex.get(path);
    if (!index) {
      const entries = this.byLocation.get(path);
      if (!entries?.size) return false;
      index = {
        exact: new Map(),
        strictPrefixes: new Map(),
        root: 0,
        log: [],
        epoch: 0,
      };
      for (const occurrence of entries) this.indexWatched(index, occurrence, 1);
      this.watchIndex.set(path, index);
    }
    if (cursor.epoch !== index.epoch) {
      cursor.epoch = index.epoch;
      cursor.index = 0;
    }
    if (index.root > 0) return true;
    for (; cursor.changed < changedLog.length; cursor.changed++) {
      if (metrics) metrics.indexLookups++;
      const entry = changedLog[cursor.changed];
      if (index.exact.has(entry) || index.strictPrefixes.has(entry))
        return true;
    }
    for (; cursor.prefixes < prefixLog.length; cursor.prefixes++) {
      if (metrics) metrics.indexLookups++;
      if (index.exact.has(prefixLog[cursor.prefixes])) return true;
    }
    for (; cursor.index < index.log.length; cursor.index++) {
      if (metrics) metrics.indexLookups++;
      const watched = index.log[cursor.index];
      if (!index.exact.has(watched)) continue;
      if (changed.has(watched) || prefixes.has(watched)) return true;
      if (isAbsolutePath(watched))
        for (let prefix = watched; prefix; ) {
          prefix = resolvePointer(prefix, $.Parent);
          if (changed.has(prefix)) return true;
        }
    }
    return false;
  }

  /**
   * Record the decision an owner just evaluated and name the other consumers it invalidates.
   * A branch consumer reselects its children. An array consumes its items' decisions only for
   * membership (`active`); for any other kind the item hosting the decision composes its own
   * schema, so the item is named for recomposition and the array is not rescheduled.
   * @param occurrence - Canonical decision located for the evaluating owner
   * @param owner - Path of the owner that evaluated it
   * @param value - Decision of this evaluation
   * @returns Consumers to reschedule when the decision flipped; empty otherwise
   */
  recordDecision(
    occurrence: GateOccurrence,
    owner: string,
    value: boolean,
  ): readonly DecisionConsumer[] {
    if (!(occurrence instanceof RegisteredGateOccurrence))
      return EMPTY_CONSUMERS;
    const previous = occurrence.decision;
    occurrence.decision = value;
    if (
      previous === undefined ||
      previous === value ||
      occurrence.owners.size < 2
    )
      return EMPTY_CONSUMERS;
    const consumers: DecisionConsumer[] = [];
    const hostParentPath = resolvePointer(occurrence.hostPath, $.Parent);
    const isPresence = this.isPresenceAt(occurrence.hostPath, occurrence);
    for (const path of occurrence.owners.keys()) {
      if (path === owner) continue;
      const behavior = this.byPath.get(path)?.node.behavior;
      if (behavior?.strategy !== 'branch') continue;
      if (behavior.type === 'array' && !isPresence && hostParentPath === path) {
        if (occurrence.hostPath !== owner)
          consumers.push({ path: occurrence.hostPath, isOwnSchema: true });
      } else consumers.push({ path, isOwnSchema: false });
    }
    return consumers;
  }

  /**
   * Whether an array item can recompose its own schema for this change without its parent's wheel.
   * @param path - Live owner path already found by `mayChangeOwnDeclarationAt`
   * @param changedSource - Written source paths of this settlement
   * @param changedAncestors - Strict ancestors of the written paths
   * @returns False for non-items and for a changed presence decision (the item's own
   * `controls.active`), which belongs to the parent's membership selection; a branch's
   * `controls.active` inside the item selects the item's own declarations and stays local
   */
  mayChangeOwnSchemaOnlyAt(
    path: string,
    changedSource: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    const registration = this.byPath.get(path);
    if (registration?.node.__parent__?.behavior.type !== 'array') return false;
    for (const occurrence of registration.ownOccurrences)
      if (
        this.isPresenceAt(path, occurrence) &&
        this.readsChanged(occurrence, changedSource, changedAncestors)
      )
        return false;
    return true;
  }

  /** Whether the decision is the presence (own `controls.active`) of the owner registered at `path`. */
  private isPresenceAt(path: string, occurrence: GateOccurrence): boolean {
    const schemaPath = this.byPath.get(path)?.node.blueprintNode.schemaPath;
    return (
      occurrence.gate.kind === 'active' &&
      schemaPath !== undefined &&
      isOwnActiveGate(occurrence.gate.schemaPath, schemaPath)
    );
  }

  /** Whether a changed read can reselect this live node's own declarations. */
  mayChangeOwnDeclarationAt(
    path: string,
    changedSource: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    for (const occurrence of this.byPath.get(path)?.ownOccurrences ?? [])
      if (this.readsChanged(occurrence, changedSource, changedAncestors))
        return true;
    return false;
  }

  /** Forget a detached subtree's location entries; a virtual node's referenced siblings stay. */
  remove<Self extends FieldNodeRecord<Self>>(node: Self): void {
    for (const child of node.children ?? [])
      if (child.__parent__ === node) this.remove(child);
    if (this.byPath.get(node.path)?.node === node) this.removePath(node.path);
  }

  /**
   * Bind one gate reference of an owner to its canonical (condition, host frame) decision.
   * @param node - Live owner whose template or direct edge carries the gate
   * @param gate - Authored condition reference
   * @param memo - Owner-side reference map receiving the binding
   * @param owned - Owner's reference list, released with its registration
   * @param declaration - Declaration application holding the reference; omitted when
   * `edgeName` already names the child frame
   * @param edgeName - Direct child edge carrying the declaration; omitted for own declarations
   */
  private add<Self extends FieldNodeRecord<Self>>(
    node: Self,
    gate: BlueprintGate,
    memo: Map<BlueprintGate, RegisteredGateOccurrence>,
    owned: OwnedReferences,
    declaration?: Pick<PropertyDeclaration, 'path' | 'schemaPath'>,
    edgeName?: string,
  ): void {
    if (memo.has(gate)) return;
    const { hostPath, readOrigin } = bindGateFrame(
      node,
      gate,
      declaration,
      edgeName,
    );
    const key =
      hostPath +
      '\u0000' +
      gate.kind +
      ':' +
      gate.schemaPath +
      (gate.isNegated ? ':else' : ':then');
    let occurrence = this.canonical.get(key);
    if (!occurrence) {
      const location = resolveGateOccurrence(
        gate,
        hostPath,
        readOrigin,
        this.readSegments,
      );
      occurrence = new RegisteredGateOccurrence(
        this.runtime,
        location,
        this.watchPaths(location),
        key,
      );
      this.canonical.set(key, occurrence);
      this.index(occurrence);
    }
    const references = occurrence.owners.get(node.path) ?? 0;
    occurrence.owners.set(node.path, references + 1);
    memo.set(gate, occurrence);
    owned.occurrences.push(occurrence);
  }

  /** Index a new canonical decision at its evaluation location exactly once. */
  private index(occurrence: RegisteredGateOccurrence): void {
    let entries = this.byLocation.get(occurrence.evaluationHostPath);
    if (!entries) {
      entries = new Set();
      this.byLocation.set(occurrence.evaluationHostPath, entries);
    }
    entries.add(occurrence);
    if (occurrence.hostPath !== occurrence.evaluationHostPath) {
      let bucket = this.relocatedBuckets.get(occurrence.evaluationHostPath);
      if (!bucket) {
        bucket = new Set();
        this.relocatedBuckets.set(occurrence.evaluationHostPath, bucket);
      }
      bucket.add(occurrence);
      this.relocatedLists.delete(occurrence.evaluationHostPath);
    }
    this.indexOccurrence(occurrence, 1);
  }

  /**
   * Maintain a location index only after that location has been queried.
   * @param occurrence - Live gate entering or leaving its evaluation location
   * @param by - One added or removed occurrence reference
   * @returns Nothing; an existing derived watch index follows the location bucket
   */
  private indexOccurrence(
    occurrence: RegisteredGateOccurrence,
    by: 1 | -1,
  ): void {
    const index = this.watchIndex.get(occurrence.evaluationHostPath);
    if (index) this.indexWatched(index, occurrence, by);
  }

  /**
   * Apply one occurrence's watches and bound stale insertion records.
   * @param index - Existing location index, possibly being initialized
   * @param occurrence - Gate with the canonical watchPaths used by source queries
   * @param by - One added or removed occurrence reference
   * @returns Nothing; count maps and root count remain synchronized
   */
  private indexWatched(
    index: LocationWatchIndex,
    occurrence: RegisteredGateOccurrence,
    by: 1 | -1,
  ): void {
    for (const watched of occurrence.watchPaths) {
      if (watched === $.Root) {
        index.root += by;
        continue;
      }
      if (by > 0 && !index.exact.has(watched)) index.log.push(watched);
      bumpWatchCount(index.exact, watched, by);
      if (isAbsolutePath(watched))
        for (let prefix = watched; prefix; ) {
          prefix = resolvePointer(prefix, $.Parent);
          bumpWatchCount(index.strictPrefixes, prefix, by);
        }
    }
    if (by > 0 && index.log.length > 2 * index.exact.size + 8) {
      index.log = [...index.exact.keys()];
      index.epoch++;
    }
  }

  /** Resolve expression reads once at occurrence registration. */
  private watchPaths(location: GateOccurrence): readonly string[] {
    const gate = location.gate;
    if (gate.kind === 'if') {
      const names =
        engineModes.gatePredicate === 'off'
          ? undefined
          : getIfGateReadNames(gate.condition, this.blueprint);
      return names
        ? mapArray(names, (name) => appendSegment(location.hostPath, name))
        : [location.hostPath];
    }
    if (
      gate.kind === 'discriminator' &&
      gate.condition !== null &&
      typeof gate.condition === 'object' &&
      'propertyName' in gate.condition &&
      typeof gate.condition.propertyName === 'string'
    )
      return [appendSegment(location.hostPath, gate.condition.propertyName)];
    const expression = getGateExpression(this.blueprint, gate.schemaPath);
    return expression
      ? mapArray(expression.dependencies, (dependency) => {
          const path = this.resolveRead(location.hostPath, dependency);
          return path;
        })
      : [location.hostPath];
  }

  /** Check whether a bound gate reads a changed source path. */
  private readsChanged(
    occurrence: RegisteredGateOccurrence,
    changedSource: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    if (changedSource.size === 0) return false;
    for (const watched of occurrence.watchPaths) {
      if (
        watched === $.Root ||
        changedSource.has(watched) ||
        changedAncestors.has(watched)
      )
        return true;
      if (isAbsolutePath(watched))
        for (let prefix = watched; prefix; ) {
          prefix = resolvePointer(prefix, $.Parent);
          if (changedSource.has(prefix)) return true;
        }
    }
    return false;
  }

  /**
   * Release the references a live array holds through the edges of positions that left it.
   * An array binds one edge per position lazily, so its registration outlives the positions.
   * @param node - Live array still registered at its path; another registration is left alone
   * @param start - First departed position, the array's new item count
   * @param end - Old item count; a position without a binding is skipped
   * @returns Nothing; each decision whose last reference this was leaves with it
   */
  releaseSlotEdges<Self extends FieldNodeRecord<Self>>(
    node: Self,
    start: number,
    end: number,
  ): void {
    const registration = this.byPath.get(node.path);
    if (registration?.node !== node || !registration.edges) return;
    let released: Optional<RegisteredGateOccurrence[]>;
    for (let index = start; index < end; index++) {
      const edge = registration.edges.get('' + index);
      if (!edge) continue;
      registration.edges.delete('' + index);
      for (const occurrence of edge.values())
        (released ??= []).push(occurrence);
    }
    if (!released) return;
    const pending = new Map<RegisteredGateOccurrence, number>();
    for (const occurrence of released) {
      pending.set(occurrence, (pending.get(occurrence) ?? 0) + 1);
      this.release(occurrence, node.path);
    }
    registration.occurrences = registration.occurrences.filter((occurrence) => {
      const count = pending.get(occurrence);
      if (!count) return true;
      pending.set(occurrence, count - 1);
      return false;
    });
  }

  /** Remove a replaced path's references; a decision leaves its L buckets with its last consumer. */
  private removePath(path: string): void {
    const previous = this.byPath.get(path);
    if (!previous) return;
    for (const occurrence of previous.occurrences)
      this.release(occurrence, path);
    this.byPath.delete(path);
  }

  /** Drop one reference of an owner path; the last reference takes the decision out of its L buckets. */
  private release(occurrence: RegisteredGateOccurrence, path: string): void {
    const count = (occurrence.owners.get(path) ?? 1) - 1;
    if (count > 0) occurrence.owners.set(path, count);
    else occurrence.owners.delete(path);
    if (occurrence.owners.size > 0) return;
    this.canonical.delete(occurrence.key);
    if (this.byLocation.get(occurrence.evaluationHostPath)?.delete(occurrence))
      this.indexOccurrence(occurrence, -1);
    if (
      this.relocatedBuckets
        .get(occurrence.evaluationHostPath)
        ?.delete(occurrence)
    ) {
      this.relocatedLists.delete(occurrence.evaluationHostPath);
      if (!this.relocatedBuckets.get(occurrence.evaluationHostPath)?.size)
        this.relocatedBuckets.delete(occurrence.evaluationHostPath);
    }
  }
}

/** One persistent registry per runtime, retained only while that runtime lives. */
const REGISTRIES = new WeakMap<object, GateRegistry>();

/** Query surface shared by real registries and the branchless absence result. */
type GateRegistryView = Pick<
  GateRegistry,
  | 'hasRegisteredPathKind'
  | 'register'
  | 'locate'
  | 'relocatedOccurrences'
  | 'mayChangeAt'
  | 'mayPresenceChangeAt'
  | 'mayChangeOwnDeclarationAt'
  | 'recordDecision'
  | 'mayChangeOwnSchemaOnlyAt'
  | 'remove'
  | 'releaseSlotEdges'
  | 'resolveRead'
  | 'pathSegments'
  | 'occurrenceCount'
>;
/** Decode only pointer syntax; no lookup result can survive a shape change. */
const decodePointerSegments = (path: string): readonly PointerSegment[] =>
  parsePointerSegments(path);
/** No per-runtime maps, weak maps or live path registrations for branchless graphs. */
const EMPTY_REGISTRY: GateRegistryView = Object.freeze({
  hasRegisteredPathKind: () => undefined,
  register: () => undefined,
  locate: (): never => {
    throw new Error('A branchless blueprint has no gate occurrences');
  },
  relocatedOccurrences: () => EMPTY_OCCURRENCES,
  mayChangeAt: () => false,
  mayPresenceChangeAt: () => false,
  mayChangeOwnDeclarationAt: () => false,
  recordDecision: () => EMPTY_CONSUMERS,
  mayChangeOwnSchemaOnlyAt: () => false,
  remove: () => undefined,
  releaseSlotEdges: () => undefined,
  resolveRead: resolveDependencyPath,
  pathSegments: decodePointerSegments,
  occurrenceCount: () => 0,
});

/** Shared frozen empty occurrence list for absent relocation reads and gate-free registrations. */
const EMPTY_OCCURRENCES: readonly RegisteredGateOccurrence[] = EMPTY_ARRAY;

/** Shared empty consumer list of an unflipped decision. */
const EMPTY_CONSUMERS: readonly DecisionConsumer[] = EMPTY_ARRAY;
/** Private read-only absence marker, replaced before any occurrence is inserted. */
const EMPTY_GATE_MEMO: ReadonlyMap<BlueprintGate, RegisteredGateOccurrence> =
  Object.freeze(new Map<BlueprintGate, RegisteredGateOccurrence>());

/**
 * Get the settlement-owned occurrence memo for a tree runtime.
 * @param runtime - Shared root runtime identity
 * @returns Registry of memoized L values for live records
 */
export const getGateRegistry = (runtime: {
  blueprint: Blueprint;
}): GateRegistryView => {
  if (runtime.blueprint.capabilities.isBranchless) return EMPTY_REGISTRY;
  let registry = REGISTRIES.get(runtime);
  if (!registry) {
    registry = new GateRegistry(runtime.blueprint, runtime);
    REGISTRIES.set(runtime, registry);
  }
  return registry;
};
