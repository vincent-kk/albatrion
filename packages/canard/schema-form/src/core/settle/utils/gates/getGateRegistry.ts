import type { Blueprint, BlueprintGate, BlueprintNodeKind } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import { escapeSegment } from '@winglet/json/pointer';
import { resolveGateOccurrence } from './resolveGateOccurrence';
import type { GateOccurrence } from './type';
import { resolveDependencyPath } from '../paths/resolveDependencyPath';
import { getGateExpression } from './getGateExpression';

/** Bound gate with exact read paths used to invalidate its L. */
interface RegisteredGateOccurrence extends GateOccurrence {
  /** Absolute paths whose raw or projected changes can alter this decision. */
  watchPaths: readonly string[];
}

/** A node path and its currently live memoized gate occurrences. */
interface RegisteredNode {
  /** Live node that owns this path. */
  node: object;
  /** Analyzed kind at this live path. */
  kind: BlueprintNodeKind;
  /** Gate occurrences registered by its template and direct edges. */
  occurrences: readonly RegisteredGateOccurrence[];
  /** Gates on this node's own declarations, before direct child edges. */
  ownOccurrences: readonly RegisteredGateOccurrence[];
}

/** Settlement-owned location index that follows live record lifetimes. */
class GateRegistry {
  /** Gates bound to a live node's own template and inherited declarations. */
  private readonly byNode = new WeakMap<object,
    Map<BlueprintGate, RegisteredGateOccurrence>>();
  /** Direct child gate bindings distinguished from the owner's same gate. */
  private readonly byEdge = new WeakMap<object,
    Map<string, Map<BlueprintGate, RegisteredGateOccurrence>>>();
  /** Current node identity and gate entries at each absolute path. */
  private readonly byPath = new Map<string, RegisteredNode>();
  /** Relocated gates keyed by their memoized evaluation host. */
  private readonly byLocation = new Map<string, Set<RegisteredGateOccurrence>>();

  /** Bind exact expression dependencies from this tree's analyzed blueprint. */
  constructor(private readonly blueprint: Blueprint) {}

  /** Compare a path and kind in the current indexed shape, if indexed. */
  hasRegisteredPathKind(path: string, kind: BlueprintNodeKind): boolean | undefined {
    if (this.byPath.size === 0) return undefined;
    return this.byPath.get(path)?.kind === kind;
  }

  /** Register template and direct-edge gates when an occurrence is created. */
  register<Self extends SchemaNodeRecord<Self>>(node: Self): void {
    if (this.byPath.get(node.path)?.node === node) return;
    this.removePath(node.path);
    const memo = new Map<BlueprintGate, RegisteredGateOccurrence>();
    const edges = new Map<string, Map<BlueprintGate, RegisteredGateOccurrence>>();
    for (const declaration of node.blueprintNode.declarations)
      for (const gate of declaration.gates)
        this.add(node, gate, memo,
          gate.schemaPath === `${node.blueprintNode.schemaPath}/controls/active`
            ? node.path : undefined);
    const ownOccurrences = [...memo.values()];
    for (const entry of node.blueprintNode.childEntries) {
      let edgeMemo = edges.get(entry.name);
      if (!edgeMemo) {
        edgeMemo = new Map<BlueprintGate, RegisteredGateOccurrence>();
        edges.set(entry.name, edgeMemo);
      }
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates)
          if (gate.schemaPath === `${declaration.schemaPath}/controls/active`)
            this.add(node, gate, edgeMemo,
              `${node.path}/${escapeSegment(entry.name)}`);
          else this.add(node, gate, memo);
    }
    this.byNode.set(node, memo);
    this.byEdge.set(node, edges);
    this.byPath.set(node.path, { node, kind: node.blueprintNode.kind,
      ownOccurrences, occurrences: [
      ...memo.values(), ...[...edges.values()].flatMap((edge) => [...edge.values()]),
    ] });
  }

  /** Find or bind a gate inherited indirectly by a declaration. */
  locate<Self extends SchemaNodeRecord<Self>>(
    node: Self, gate: BlueprintGate, edgeName?: string,
  ): GateOccurrence {
    this.register(node);
    const edge = edgeName ? this.byEdge.get(node)?.get(edgeName)?.get(gate) : undefined;
    if (edge) return edge;
    const existing = this.byNode.get(node)?.get(gate);
    if (existing) return existing;
    const memo = this.byNode.get(node);
    if (!memo) throw new Error(`Missing gate memo at ${node.path}`);
    this.add(node, gate, memo);
    const edges = this.byEdge.get(node);
    this.byPath.set(node.path, { node, kind: node.blueprintNode.kind,
      ownOccurrences: this.byPath.get(node.path)?.ownOccurrences ?? [],
      occurrences: [
      ...memo.values(), ...[...edges?.values() ?? []].flatMap((edgeMemo) =>
        [...edgeMemo.values()]),
    ] });
    const occurrence = memo.get(gate);
    if (!occurrence) throw new Error(`Missing gate at ${node.path}`);
    return occurrence;
  }

  /** Read relocated gates at one host without scanning other templates. */
  relocated(path: string): GateOccurrence[] {
    return [...this.byLocation.get(path) ?? []].filter((entry) =>
      entry.hostPath !== path);
  }

  /** Whether changed raw intersects any read that can affect this host's wheel. */
  mayChangeAt(path: string, changedRaw: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>): boolean {
    for (const occurrence of this.byLocation.get(path) ?? [])
      if (this.readsChanged(occurrence, changedRaw, changedAncestors)) return true;
    return false;
  }

  /** Whether a changed read can reselect this live node's own declarations. */
  mayChangeOwnDeclarationAt(path: string, changedRaw: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>): boolean {
    for (const occurrence of this.byPath.get(path)?.ownOccurrences ?? [])
      if (this.readsChanged(occurrence, changedRaw, changedAncestors)) return true;
    return false;
  }

  /** Forget a detached subtree's location entries; a virtual node's referenced siblings stay. */
  remove<Self extends SchemaNodeRecord<Self>>(node: Self): void {
    for (const child of node.children ?? [])
      if (child.parent === node) this.remove(child);
    if (this.byPath.get(node.path)?.node === node) this.removePath(node.path);
  }

  /** Index one gate only once for this occurrence. */
  private add<Self extends SchemaNodeRecord<Self>>(
    node: Self, gate: BlueprintGate,
    memo: Map<BlueprintGate, RegisteredGateOccurrence>,
    childHostPath?: string,
  ): void {
    if (memo.has(gate)) return;
    const location = resolveGateOccurrence(gate, node.blueprintNode.path,
      node.path, childHostPath);
    const occurrence: RegisteredGateOccurrence = { ...location,
      watchPaths: this.watchPaths(location) };
    memo.set(gate, occurrence);
    let entries = this.byLocation.get(occurrence.evaluationHostPath);
    if (!entries) {
      entries = new Set();
      this.byLocation.set(occurrence.evaluationHostPath, entries);
    }
    entries.add(occurrence);
  }

  /** Resolve expression reads once at occurrence registration. */
  private watchPaths(location: GateOccurrence): readonly string[] {
    const gate = location.gate;
    if (gate.kind === 'if') return [location.hostPath];
    if (gate.kind === 'discriminator' && gate.condition !== null &&
      typeof gate.condition === 'object' &&
      'propertyName' in gate.condition &&
      typeof gate.condition.propertyName === 'string')
      return [`${location.hostPath}/${escapeSegment(gate.condition.propertyName)}`];
    const expression = getGateExpression(this.blueprint, gate.schemaPath);
    return expression ? expression.dependencies.map((dependency) => {
      const path = resolveDependencyPath(location.hostPath, dependency);
      return path;
    }) : [location.hostPath];
  }

  /** Check whether a bound gate reads a changed raw path. */
  private readsChanged(
    occurrence: RegisteredGateOccurrence, changedRaw: ReadonlySet<string>,
    changedAncestors: ReadonlySet<string>,
  ): boolean {
    if (changedRaw.size === 0) return false;
    for (const watched of occurrence.watchPaths) {
      if (watched === '' || changedRaw.has(watched) || changedAncestors.has(watched)) return true;
      if (watched.startsWith('/'))
        for (let prefix = watched; prefix;) {
          prefix = prefix.slice(0, prefix.lastIndexOf('/'));
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
      this.byLocation.get(occurrence.evaluationHostPath)?.delete(occurrence);
    this.byPath.delete(path);
  }
}

/** One persistent registry per runtime, retained only while that runtime lives. */
const REGISTRIES = new WeakMap<object, GateRegistry>();

/**
 * Get the settlement-owned occurrence memo for a tree runtime.
 * @param runtime - Shared root runtime identity
 * @returns Registry of memoized L values for live records
 */
export const getGateRegistry = (runtime: { blueprint: Blueprint }): GateRegistry => {
  let registry = REGISTRIES.get(runtime);
  if (!registry) {
    registry = new GateRegistry(runtime.blueprint);
    REGISTRIES.set(runtime, registry);
  }
  return registry;
};
