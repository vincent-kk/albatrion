import {
  PointerOperator,
  appendSegment,
  joinPointer,
  parsePointerSegments,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { Blueprint, BlueprintNode } from '../../../blueprint';
import { getDeriveRuleTable } from '../../../derive';
import type { FieldNodeRecord } from '../../../record';
import { PathStoreIndex } from '../../../utils/pathIndex/utils/PathStoreIndex';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';
import type { SettlementContext } from '../../types/settlement';
import { getGateExpression } from '../gates/getGateExpression';

/** Identity and topology needed by occurrence indexing, independent of surface classes. */
interface Occurrence {
  readonly path: string;
  readonly blueprintNode: BlueprintNode;
  readonly parent: Occurrence | null;
  readonly children: readonly Occurrence[] | null;
  readonly isDetached: boolean;
  readonly isDisposed?: boolean;
}
/** Last indexed identity, topology and watched-address keys of one record. */
interface Registration {
  path: string;
  children: readonly Occurrence[] | null;
  parent: Occurrence | null;
  keys: string[];
}

/** Runtime-owned supplement; immutable syntax remains in the blueprint's static index. */
class AliasedDependencyIndex {
  private readonly byNode = new Map<Occurrence, Registration>();
  private readonly children = new Map<Occurrence, Set<Occurrence>>();
  private readonly owners = new Map<string, Occurrence>();
  private readonly paths = new PathStoreIndex();
  private readonly contextNodes = new Set<Occurrence>();
  private readonly dependencies = new Map<number, string[]>();
  private readonly rules: ReturnType<typeof getDeriveRuleTable>;
  private nextKey = 0;
  private isInitialized = false;

  /** Prepare finite relative syntax once, without reading live values. */
  constructor(private readonly blueprint: Blueprint) {
    this.rules = getDeriveRuleTable(blueprint);
    for (const [dependency, ids] of Object.entries(blueprint.dependencies))
      for (const id of ids) {
        let list = this.dependencies.get(id);
        if (!list) this.dependencies.set(id, (list = []));
        list.push(dependency);
      }
  }

  /**
   * Incorporate bounded settlement deltas before reads and after final detach.
   * @param context - Gate-independent node creation, topology and path records.
   * @returns Nothing; pending exits stay indexed until actually detached.
   */
  synchronize<Self extends FieldNodeRecord<Self>>(
    context: SettlementContext<Self>,
  ): void {
    const seen = new Set<Occurrence>();
    if (!this.isInitialized) {
      this.registerSubtree(context.root, seen);
      this.isInitialized = true;
    }
    for (const node of context.enteredNodes) this.registerSubtree(node, seen);
    for (const change of context.pathChanges)
      this.registerSubtree(change.node, seen);
    for (const node of context.changedNodes) this.register(node);
    for (const node of context.exitedNodes)
      if (node.isDetached || node.isDisposed) this.remove(node);
    for (const node of context.perishedNodes)
      if (node.isDetached || node.isDisposed) this.remove(node);
  }

  /** Return live owners whose reads intersect a changed subtree in either direction. */
  affectedOwners(path: string): readonly string[] {
    const owners = new Set<string>();
    for (const key of this.paths.intersecting(path)) {
      const node = this.owners.get(key);
      if (node && !node.isDetached && !node.isDisposed) owners.add(node.path);
    }
    return [...owners];
  }

  /** Return concrete live aliases affected by a context replacement. */
  contextOwners(): readonly string[] {
    return [...this.contextNodes]
      .filter((node) => !node.isDetached && !node.isDisposed)
      .map((node) => node.path);
  }

  /** Visit only newly admitted or moved subtrees, sharing overlap evidence within a phase. */
  private registerSubtree(node: Occurrence, seen: Set<Occurrence>): void {
    if (seen.has(node) || node.isDetached || node.isDisposed) return;
    seen.add(node);
    this.register(node);
    for (const child of node.children ?? [])
      if (child.parent === node) this.registerSubtree(child, seen);
  }

  /** Rebind one occurrence only when its address or child shape changes. */
  private register(node: Occurrence): void {
    if (node.isDetached || node.isDisposed) return;
    const previous = this.byNode.get(node);
    if (
      previous?.path === node.path &&
      previous.children === node.children &&
      previous.parent === node.parent
    )
      return;
    if (previous) {
      for (const key of previous.keys) {
        this.paths.delete(key);
        this.owners.delete(key);
      }
      if (previous.parent !== node.parent && previous.parent)
        this.children.get(previous.parent)?.delete(node);
    }
    this.contextNodes.delete(node);
    const paths: string[] = [];
    const watch = (host: string, dependency: string): void => {
      let path = resolveDependencyPath(host, dependency);
      if (readPointerSegment(path, 0) === PointerOperator.Context) {
        this.contextNodes.add(node);
        return;
      }
      const segments = parsePointerSegments(path);
      const wildcard = segments.indexOf(PointerOperator.Wildcard);
      if (wildcard !== -1) path = joinPointer(segments.slice(0, wildcard));
      if (paths.indexOf(path) === -1) paths.push(path);
    };
    for (const declaration of node.blueprintNode.declarations) {
      const host = this.bindHost(node, declaration.path);
      for (const dependency of this.dependencies.get(declaration.id) ?? [])
        watch(host, dependency);
      for (const gate of declaration.gates) {
        const expression = getGateExpression(this.blueprint, gate.schemaPath);
        if (expression)
          for (const dependency of expression.dependencies)
            watch(this.bindHost(node, gate.hostPath), dependency);
      }
      for (const rule of this.rules.byDeclaration.get(declaration.id) ?? []) {
        if (rule.kind !== 'derived') continue;
        const targets = rule.isItemTarget
          ? (node.children ?? []).map((child) => child.path)
          : [
              rule.targetName === undefined
                ? host
                : appendSegment(host, rule.targetName),
            ];
        for (const target of targets)
          for (const dependency of rule.watchDependencies)
            watch(target, dependency);
      }
    }
    const keys: string[] = [];
    for (const path of paths) {
      const key = String(this.nextKey++);
      keys.push(key);
      this.owners.set(key, node);
      this.paths.add(key, [path]);
    }
    this.byNode.set(node, {
      path: node.path,
      children: node.children,
      parent: node.parent,
      keys,
    });
    if (node.parent) {
      let children = this.children.get(node.parent);
      if (!children) this.children.set(node.parent, (children = new Set()));
      children.add(node);
    }
  }

  /** Preserve relative host offsets, including a declaration on a template ancestor. */
  private bindHost(node: Occurrence, authored: string): string {
    const origin = parsePointerSegments(node.blueprintNode.path);
    const target = parsePointerSegments(authored);
    const actual = parsePointerSegments(node.path);
    let common = 0;
    while (
      common < origin.length &&
      common < target.length &&
      origin[common] === target[common]
    )
      common++;
    return joinPointer([
      ...actual.slice(0, actual.length - (origin.length - common)),
      ...target.slice(common),
    ]);
  }

  /** Remove old identities through their indexed ancestry, never through a reused path. */
  private remove(node: Occurrence): void {
    for (const child of this.children.get(node) ?? []) this.remove(child);
    this.children.delete(node);
    const registration = this.byNode.get(node);
    if (!registration) return;
    for (const key of registration.keys) {
      this.paths.delete(key);
      this.owners.delete(key);
    }
    if (registration.parent)
      this.children.get(registration.parent)?.delete(node);
    this.byNode.delete(node);
    this.contextNodes.delete(node);
  }
}

/** An index cannot keep its owning runtime alive. */
const indexes = new WeakMap<object, AliasedDependencyIndex>();

/**
 * Read and synchronize only a blueprint that proves reused dependency templates.
 * @param context - Current settlement delta, including pending and finalized exits.
 * @returns A concrete-occurrence supplement, or undefined for ordinary schemas.
 */
export const getAliasedDependencyIndex = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): AliasedDependencyIndex | undefined => {
  const runtime = context.root.runtime;
  if (!runtime.blueprint.capabilities.hasAliasedDependencies) return undefined;
  let index = indexes.get(runtime);
  if (!index) {
    index = new AliasedDependencyIndex(runtime.blueprint);
    indexes.set(runtime, index);
  }
  index.synchronize(context);
  return index;
};
