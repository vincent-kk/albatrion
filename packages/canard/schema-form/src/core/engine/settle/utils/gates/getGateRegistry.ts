import { escapeSegment, unescapeSegment } from '@winglet/json/pointer';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { Blueprint, BlueprintGate } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';
import type { PresenceQueryCursor } from '../../types/presenceQueryCursor';
import { getGateExpression } from './getGateExpression';
import { resolveGateOccurrence } from './resolveGateOccurrence';
import type { GateOccurrence } from './type';

/** Bound gate with exact read paths used to invalidate its L. */
interface RegisteredGateOccurrence extends GateOccurrence {
  /** Absolute paths whose raw or projected changes can alter this decision. */
  watchPaths: readonly string[];
}

/** A node path and its currently live memoized gate occurrences. */
interface RegisteredNode {
  /** Live node that owns this path. */
  node: object;
  /** Fold-inclusive kind token at this live path. */
  kind: string;
  /** Gate occurrences registered by its template and direct edges. */
  occurrences: readonly RegisteredGateOccurrence[];
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
  /** Gates bound to a live node's own template and inherited declarations. */
  private readonly byNode = new WeakMap<
    object,
    Map<BlueprintGate, RegisteredGateOccurrence>
  >();
  /** Direct child gate bindings distinguished from the owner's same gate. */
  private readonly byEdge = new WeakMap<
    object,
    Map<string, Map<BlueprintGate, RegisteredGateOccurrence>>
  >();
  /** Current node identity and gate entries at each absolute path. */
  private readonly byPath = new Map<string, RegisteredNode>();
  /** Relocated gates keyed by their memoized evaluation host. */
  private readonly byLocation = new Map<
    string,
    Set<RegisteredGateOccurrence>
  >();
  /** Absolute reads shared by gates that ask the same pointer at one host. */
  private readonly resolvedReads = new Map<string, Map<string, string>>();
  /** Decoded pointers contain no live shape or projected value. */
  private readonly segments = new Map<string, readonly string[]>();

  /** Bind exact expression dependencies from this tree's analyzed blueprint. */
  constructor(private readonly blueprint: Blueprint) {}

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
  pathSegments(path: string): readonly string[] {
    let segments = this.segments.get(path);
    if (!segments) {
      segments = decodePointerSegments(path);
      this.segments.set(path, segments);
    }
    return segments;
  }

  /** Compare a path and kind in the current indexed shape, if indexed. */
  hasRegisteredPathKind(path: string, kind: string): boolean | undefined {
    if (this.byPath.size === 0) return undefined;
    return this.byPath.get(path)?.kind === kind;
  }

  /** Register template and direct-edge gates when an occurrence is created. */
  register<Self extends FieldNodeRecord<Self>>(node: Self): void {
    if (this.byPath.get(node.path)?.node === node) return;
    this.removePath(node.path);
    const memo = new Map<BlueprintGate, RegisteredGateOccurrence>();
    const edges = new Map<
      string,
      Map<BlueprintGate, RegisteredGateOccurrence>
    >();
    for (const declaration of node.blueprintNode.declarations)
      for (const gate of declaration.gates)
        this.add(
          node,
          gate,
          memo,
          gate.schemaPath === node.blueprintNode.schemaPath + '/controls/active'
            ? node.path
            : undefined,
        );
    const ownOccurrences = [...memo.values()];
    for (const entry of node.blueprintNode.childEntries) {
      let edgeMemo = edges.get(entry.name);
      if (!edgeMemo) {
        edgeMemo = new Map<BlueprintGate, RegisteredGateOccurrence>();
        edges.set(entry.name, edgeMemo);
      }
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates)
          if (gate.schemaPath === declaration.schemaPath + '/controls/active')
            this.add(
              node,
              gate,
              edgeMemo,
              node.path + '/' + escapeSegment(entry.name),
            );
          else this.add(node, gate, memo);
    }
    this.byNode.set(node, memo);
    this.byEdge.set(node, edges);
    this.byPath.set(node.path, {
      node,
      kind: getBlueprintNodeIdentity(node.blueprintNode),
      ownOccurrences,
      occurrences: [
        ...memo.values(),
        ...[...edges.values()].flatMap((edge) => [...edge.values()]),
      ],
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
    const edge = edgeName
      ? this.byEdge.get(node)?.get(edgeName)?.get(gate)
      : undefined;
    if (edge) return edge;
    const existing = this.byNode.get(node)?.get(gate);
    if (existing) return existing;
    const memo = this.byNode.get(node);
    if (!memo) throw new Error(`Missing gate memo at ${node.path}`);
    this.add(node, gate, memo);
    const edges = this.byEdge.get(node);
    this.byPath.set(node.path, {
      node,
      kind: getBlueprintNodeIdentity(node.blueprintNode),
      ownOccurrences: this.byPath.get(node.path)?.ownOccurrences ?? [],
      occurrences: [
        ...memo.values(),
        ...[...(edges?.values() ?? [])].flatMap((edgeMemo) => [
          ...edgeMemo.values(),
        ]),
      ],
    });
    const occurrence = memo.get(gate);
    if (!occurrence) throw new Error(`Missing gate at ${node.path}`);
    return occurrence;
  }

  /** Read relocated gates at one host without scanning other templates. */
  relocated(path: string): readonly GateOccurrence[] {
    return [...(this.byLocation.get(path) ?? [])].filter(
      (entry) => entry.hostPath !== path,
    );
  }

  /** Whether changed raw intersects any read that can affect this host's wheel. */
  mayChangeAt(
    path: string,
    changedRaw: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    for (const occurrence of this.byLocation.get(path) ?? [])
      if (this.readsChanged(occurrence, changedRaw, changedAncestors))
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
      if (watched.startsWith($.Separator))
        for (let prefix = watched; prefix; ) {
          prefix = prefix.slice(0, prefix.lastIndexOf($.Separator));
          if (changed.has(prefix)) return true;
        }
    }
    return false;
  }

  /** Whether a changed read can reselect this live node's own declarations. */
  mayChangeOwnDeclarationAt(
    path: string,
    changedRaw: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    for (const occurrence of this.byPath.get(path)?.ownOccurrences ?? [])
      if (this.readsChanged(occurrence, changedRaw, changedAncestors))
        return true;
    return false;
  }

  /** Forget a detached subtree's location entries; a virtual node's referenced siblings stay. */
  remove<Self extends FieldNodeRecord<Self>>(node: Self): void {
    for (const child of node.children ?? [])
      if (child.parent === node) this.remove(child);
    if (this.byPath.get(node.path)?.node === node) this.removePath(node.path);
  }

  /** Index one gate only once for this occurrence. */
  private add<Self extends FieldNodeRecord<Self>>(
    node: Self,
    gate: BlueprintGate,
    memo: Map<BlueprintGate, RegisteredGateOccurrence>,
    childHostPath?: string,
  ): void {
    if (memo.has(gate)) return;
    const location = resolveGateOccurrence(
      gate,
      node.blueprintNode.path,
      node.path,
      childHostPath,
    );
    const occurrence: RegisteredGateOccurrence = {
      ...location,
      watchPaths: this.watchPaths(location),
    };
    memo.set(gate, occurrence);
    let entries = this.byLocation.get(occurrence.evaluationHostPath);
    if (!entries) {
      entries = new Set();
      this.byLocation.set(occurrence.evaluationHostPath, entries);
    }
    entries.add(occurrence);
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
   * @param occurrence - Gate with the canonical watchPaths used by raw queries
   * @param by - One added or removed occurrence reference
   * @returns Nothing; count maps and root count remain synchronized
   */
  private indexWatched(
    index: LocationWatchIndex,
    occurrence: RegisteredGateOccurrence,
    by: 1 | -1,
  ): void {
    for (const watched of occurrence.watchPaths) {
      if (watched === '') {
        index.root += by;
        continue;
      }
      if (by > 0 && !index.exact.has(watched)) index.log.push(watched);
      bumpWatchCount(index.exact, watched, by);
      if (watched.startsWith($.Separator))
        for (let prefix = watched; prefix; ) {
          prefix = prefix.slice(0, prefix.lastIndexOf($.Separator));
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
    if (gate.kind === 'if') return [location.hostPath];
    if (
      gate.kind === 'discriminator' &&
      gate.condition !== null &&
      typeof gate.condition === 'object' &&
      'propertyName' in gate.condition &&
      typeof gate.condition.propertyName === 'string'
    )
      return [
        location.hostPath + '/' + escapeSegment(gate.condition.propertyName),
      ];
    const expression = getGateExpression(this.blueprint, gate.schemaPath);
    return expression
      ? expression.dependencies.map((dependency) => {
          const path = this.resolveRead(location.hostPath, dependency);
          return path;
        })
      : [location.hostPath];
  }

  /** Check whether a bound gate reads a changed raw path. */
  private readsChanged(
    occurrence: RegisteredGateOccurrence,
    changedRaw: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    if (changedRaw.size === 0) return false;
    for (const watched of occurrence.watchPaths) {
      if (
        watched === '' ||
        changedRaw.has(watched) ||
        changedAncestors.has(watched)
      )
        return true;
      if (watched.startsWith($.Separator))
        for (let prefix = watched; prefix; ) {
          prefix = prefix.slice(0, prefix.lastIndexOf($.Separator));
          if (changedRaw.has(prefix)) return true;
        }
    }
    return false;
  }

  /** Remove a replaced path from its L buckets. */
  private removePath(path: string): void {
    const previous = this.byPath.get(path);
    if (!previous) return;
    for (const occurrence of previous.occurrences)
      if (
        this.byLocation.get(occurrence.evaluationHostPath)?.delete(occurrence)
      )
        this.indexOccurrence(occurrence, -1);
    this.byPath.delete(path);
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
  | 'relocated'
  | 'mayChangeAt'
  | 'mayPresenceChangeAt'
  | 'mayChangeOwnDeclarationAt'
  | 'remove'
  | 'resolveRead'
  | 'pathSegments'
  | 'occurrenceCount'
>;
/** Decode only pointer syntax; no lookup result can survive a shape change. */
const decodePointerSegments = (path: string): readonly string[] => {
  const segments = path.slice(1).split($.Separator);
  for (let index = 0; index < segments.length; index++)
    segments[index] = unescapeSegment(segments[index]);
  return segments;
};
/** No per-runtime maps, weak maps or live path registrations for branchless graphs. */
const EMPTY_REGISTRY: GateRegistryView = Object.freeze({
  hasRegisteredPathKind: () => undefined,
  register: () => undefined,
  locate: (): never => {
    throw new Error('A branchless blueprint has no gate occurrences');
  },
  relocated: () => EMPTY_OCCURRENCES,
  mayChangeAt: () => false,
  mayPresenceChangeAt: () => false,
  mayChangeOwnDeclarationAt: () => false,
  remove: () => undefined,
  resolveRead: resolveDependencyPath,
  pathSegments: decodePointerSegments,
  occurrenceCount: () => 0,
});
/** Repeated absent relocation reads preserve reference identity. */
const EMPTY_OCCURRENCES: readonly GateOccurrence[] = Object.freeze([]);

/**
 * Get the settlement-owned occurrence memo for a tree runtime.
 * @param runtime - Shared root runtime identity
 * @returns Registry of memoized L values for live records
 */
export const getGateRegistry = (runtime: {
  blueprint: Blueprint;
}): GateRegistryView => {
  if (runtime.blueprint.capabilities.branchless) return EMPTY_REGISTRY;
  let registry = REGISTRIES.get(runtime);
  if (!registry) {
    registry = new GateRegistry(runtime.blueprint);
    REGISTRIES.set(runtime, registry);
  }
  return registry;
};
