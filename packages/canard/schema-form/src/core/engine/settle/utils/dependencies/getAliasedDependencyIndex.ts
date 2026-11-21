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
import { bindGateHostPath } from '../gates/bindGateHostPath';
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
  private readonly owners = new Map<
    string,
    { node: Occurrence; path: string }
  >();
  private readonly paths = new PathStoreIndex();
  private readonly contextNodes = new Map<Occurrence, Set<string>>();
  /** Two cached queries bound retained addresses independently of write count. */
  private affectedPath?: string;
  /** Prior query avoids re-traversing alternating source and derived addresses. */
  private previousAffectedPath?: string;
  /** Prior query result shares the same topology invalidation. */
  private previousAffectedResult?: readonly string[];
  /** Owners from the last query, invalidated by every topology update. */
  private affectedResult?: readonly string[];
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
    if (
      this.isInitialized &&
      !context.enteredNodes.size &&
      !context.pathChanges.length &&
      !context.exitedNodes.size &&
      !context.perishedNodes.size &&
      !context.hasRestoredArrayStructure
    )
      return;
    if (
      !this.isInitialized ||
      context.enteredNodes.size ||
      context.pathChanges.length
    ) {
      const seen = new Set<Occurrence>();
      if (!this.isInitialized) {
        this.registerSubtree(context.root, seen);
        this.isInitialized = true;
      }
      for (const node of context.enteredNodes) this.registerSubtree(node, seen);
      for (const change of context.pathChanges)
        this.registerSubtree(change.node, seen);
    }
    if (context.hasRestoredArrayStructure && context.retainedSources)
      for (const [host, source] of context.retainedSources)
        if (source.array?.isRestored) this.register(host);
    for (const node of context.changedNodes) this.register(node);
    for (const node of context.exitedNodes)
      if (node.isDetached || node.isDisposed) this.remove(node);
    for (const node of context.perishedNodes)
      if (node.isDetached || node.isDisposed) this.remove(node);
  }

  /** Return live owners whose reads intersect a changed subtree in either direction. */
  affectedOwners(path: string): readonly string[] {
    if (this.affectedPath === path && this.affectedResult)
      return this.affectedResult;
    if (this.previousAffectedPath === path && this.previousAffectedResult)
      return this.previousAffectedResult;
    const owners = new Set<string>();
    for (const key of this.paths.intersecting(path)) {
      const owner = this.owners.get(key);
      if (owner && !owner.node.isDetached && !owner.node.isDisposed)
        owners.add(owner.path);
    }
    const result = [...owners];
    this.previousAffectedPath = this.affectedPath;
    this.previousAffectedResult = this.affectedResult;
    this.affectedPath = path;
    this.affectedResult = result;
    return result;
  }

  /** Return concrete live aliases affected by a context replacement. */
  contextOwners(): readonly string[] {
    return [...this.contextNodes]
      .filter(([node]) => !node.isDetached && !node.isDisposed)
      .flatMap(([, paths]) => [...paths]);
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
    this.affectedPath = undefined;
    this.previousAffectedPath = undefined;
    this.affectedResult = undefined;
    this.previousAffectedResult = undefined;
    if (previous) {
      for (const child of this.children.get(node) ?? [])
        if (child.isDetached || child.isDisposed) this.remove(child);
      for (const key of previous.keys) {
        this.paths.delete(key);
        this.owners.delete(key);
      }
      if (previous.parent !== node.parent && previous.parent)
        this.children.get(previous.parent)?.delete(node);
    }
    this.contextNodes.delete(node);
    const paths = new Map<string, Set<string>>();
    const watch = (
      host: string,
      dependency: string,
      owner = node.path,
    ): void => {
      let path = resolveDependencyPath(host, dependency);
      if (readPointerSegment(path, 0) === PointerOperator.Context) {
        let owners = this.contextNodes.get(node);
        if (!owners) this.contextNodes.set(node, (owners = new Set()));
        owners.add(owner);
        return;
      }
      const segments = parsePointerSegments(path);
      const wildcard = segments.indexOf(PointerOperator.Wildcard);
      if (wildcard !== -1) path = joinPointer(segments.slice(0, wildcard));
      let owners = paths.get(path);
      if (!owners) paths.set(path, (owners = new Set()));
      owners.add(owner);
    };
    if (node.path !== node.blueprintNode.path)
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
    for (const entry of node.blueprintNode.childEntries) {
      if (
        node.path === node.blueprintNode.path &&
        entry.node.path === appendSegment(node.path, entry.name)
      )
        continue;
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates) {
          if (
            node.blueprintNode.declarations.some((owner) =>
              owner.gates.includes(gate),
            )
          )
            continue;
          const expression = getGateExpression(this.blueprint, gate.schemaPath);
          if (!expression) continue;
          const childHost =
            gate.schemaPath ===
            appendSegment(
              appendSegment(declaration.schemaPath, 'controls'),
              'active',
            )
              ? appendSegment(node.path, entry.name)
              : undefined;
          const host = bindGateHostPath(
            gate,
            node.blueprintNode.path,
            node.path,
            childHost,
          );
          for (const dependency of expression.dependencies)
            watch(host, dependency, appendSegment(node.path, entry.name));
        }
    }
    const keys: string[] = [];
    for (const [path, owners] of paths)
      for (const owner of owners) {
        const key = String(this.nextKey++);
        keys.push(key);
        this.owners.set(key, { node, path: owner });
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
    if (authored === node.blueprintNode.path) return node.path;
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
    this.affectedPath = undefined;
    this.previousAffectedPath = undefined;
    this.affectedResult = undefined;
    this.previousAffectedResult = undefined;
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
const indexes = new WeakMap<object, AliasedDependencyIndex | null>();

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
    const capabilities = runtime.blueprint.capabilities;
    if (
      index !== null &&
      !runtime.commitNumber &&
      !capabilities.hasDerive &&
      !capabilities.hasState &&
      !capabilities.hasWatch
    ) {
      indexes.set(runtime, null);
      return undefined;
    }
    if (index === null && !runtime.commitNumber) return undefined;
    index = new AliasedDependencyIndex(runtime.blueprint);
    indexes.set(runtime, index);
  }
  index.synchronize(context);
  return index;
};
