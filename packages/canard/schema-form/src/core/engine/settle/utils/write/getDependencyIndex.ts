import { escapeSegment } from '@winglet/json/pointer';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { Blueprint, PropertyDeclaration } from '../../../blueprint';
import { getDeriveRuleTable } from '../../../derive';
import type { FieldNodeRecord } from '../../../record';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';
import { getContextOwners } from '../context/getContextOwners';
import { getGateExpression } from '../gates/getGateExpression';
import { bindTemplatePath } from '../paths/bindTemplatePath';
import { expandTemplatePaths } from '../paths/expandTemplatePaths';
import { isCanonicalArrayIndex } from '../paths/isCanonicalArrayIndex';

/** No reverse dependency owners for a gate-free input path. */
const NO_OWNERS: readonly string[] = Object.freeze([]);

/** One absolute watch prefix and declarations registered exactly here. */
interface DependencyNode {
  /** Declaration hosts that read this exact path. */
  owners: { path: string; bindable: boolean }[];
  /** Reused membership index preserves linear registration and owner order. */
  ownerPaths: Set<string>;
  /** Next escaped JSON Pointer segments. */
  children: Map<string, DependencyNode>;
}

/** Queryable reverse dependencies built once from the blueprint dictionary. */
class DependencyIndex {
  /** Root of the absolute JSON Pointer watch trie. */
  private readonly root: DependencyNode | undefined;

  /** Build absolute watch paths from authored reverse dependency IDs. */
  constructor(blueprint?: Blueprint) {
    this.root = undefined;
    if (!blueprint) return;
    this.root = { owners: [], ownerPaths: new Set(), children: new Map() };
    getContextOwners(blueprint);
    const dependencies = Object.entries(blueprint.dependencies);
    if (dependencies.length === 0 && blueprint.expressions.length === 0) return;
    const declarations = new Map<number, PropertyDeclaration>(
      blueprint.nodes.flatMap((node) =>
        node.declarations.map((declaration): [number, PropertyDeclaration] => [
          declaration.id,
          declaration,
        ]),
      ),
    );
    for (const [dependency, ids] of dependencies)
      for (const id of ids) {
        const declaration = declarations.get(id);
        if (!declaration) continue;
        const watched = resolveDependencyPath(declaration.path, dependency);
        if (watched === $.Context) continue;
        this.add(watched, declaration.path);
      }
    const rules = getDeriveRuleTable(blueprint);
    for (const node of blueprint.nodes)
      for (const declaration of node.declarations)
        for (const rule of rules.byDeclaration.get(declaration.id) ?? []) {
          if (rule.kind !== 'derived' || !rule.targetName) continue;
          const targetPath = `${declaration.path}/${escapeSegment(rule.targetName)}`;
          for (const watch of rule.watchDependencies) {
            const watched = resolveDependencyPath(targetPath, watch);
            if (watched !== $.Context) this.add(watched, declaration.path);
          }
        }
    for (const node of blueprint.nodes)
      for (const declaration of node.declarations)
        for (const gate of declaration.gates) {
          const expression = getGateExpression(blueprint, gate.schemaPath);
          if (!expression) continue;
          for (const dependency of expression.dependencies) {
            const watched = resolveDependencyPath(gate.hostPath, dependency);
            if (watched === $.Context) continue;
            this.add(watched, declaration.path);
          }
        }
  }

  /** Return owners whose reads intersect a changed path in either direction. */
  affected<Self extends FieldNodeRecord<Self>>(
    changedPath: string,
    root: Self,
  ): readonly string[] {
    const rootIndex = this.root;
    if (
      !rootIndex ||
      (rootIndex.owners.length === 0 && rootIndex.children.size === 0)
    )
      return NO_OWNERS;
    const owners = new Set<string>();
    let current: DependencyNode[] = [rootIndex];
    const collect = (node: DependencyNode): void => {
      for (const entry of node.owners) {
        const path = entry.bindable
          ? bindTemplatePath(entry.path, changedPath)
          : entry.path;
        if (path.includes('/*'))
          for (const expanded of expandTemplatePaths(root, path))
            owners.add(expanded);
        else owners.add(path);
      }
    };
    collect(rootIndex);
    for (const segment of changedPath.split($.Separator).filter(Boolean)) {
      const next: DependencyNode[] = [];
      for (const node of current) {
        const exact = node.children.get(segment);
        if (exact) next.push(exact);
        if (isCanonicalArrayIndex(segment)) {
          const wildcard = node.children.get($.Wildcard);
          if (wildcard) next.push(wildcard);
        }
      }
      if (next.length === 0) return [...owners];
      current = next;
      for (const node of current) collect(node);
    }
    const pending = current.flatMap((node) => [...node.children.values()]);
    while (pending.length) {
      const child = pending.pop();
      if (!child) continue;
      collect(child);
      pending.push(...child.children.values());
    }
    return [...owners];
  }

  /** Insert one exact watched location into the pointer trie. */
  private add(watchedPath: string, owner: string): void {
    const ownerParts = owner.split($.Separator);
    const watchedParts = watchedPath.split($.Separator);
    // A fixed read of another item depends on that array host's whole subtree.
    for (let index = 1; index < ownerParts.length; index++) {
      if (
        ownerParts[index] === $.Wildcard &&
        watchedParts[index] !== $.Wildcard &&
        ownerParts
          .slice(1, index)
          .every((part, position) => part === watchedParts[position + 1]) &&
        watchedParts[index]
      ) {
        watchedPath = ownerParts.slice(0, index).join($.Separator);
        break;
      }
    }
    let current = this.root!;
    for (const segment of watchedPath.split($.Separator).filter(Boolean)) {
      let child = current.children.get(segment);
      if (!child) {
        child = { owners: [], ownerPaths: new Set(), children: new Map() };
        current.children.set(segment, child);
      }
      current = child;
    }
    const indexedParts = watchedPath.split($.Separator);
    if (!current.ownerPaths.has(owner)) {
      current.ownerPaths.add(owner);
      current.owners.push({
        path: owner,
        bindable: ownerParts.every(
          (part, index) =>
            part !== $.Wildcard || indexedParts[index] === $.Wildcard,
        ),
      });
    }
  }
}

/** Cached dependency indexes live only while their analyzed blueprint lives. */
const INDEXES = new WeakMap<Blueprint, DependencyIndex>();
/** Dependency absence is proven independently of branch presence. */
const EMPTY_INDEX = new DependencyIndex();
Object.freeze(EMPTY_INDEX);

/**
 * Reuse a path index for all writes against one analyzed blueprint.
 * @param blueprint - Static dependency dictionary and declaration IDs
 * @returns Reverse dependency trie for ancestor and descendant invalidation
 */
export const getDependencyIndex = (blueprint: Blueprint): DependencyIndex => {
  if (
    !blueprint.capabilities.hasDependencies &&
    !blueprint.capabilities.hasExpressions
  )
    return EMPTY_INDEX;
  let index = INDEXES.get(blueprint);
  if (!index) {
    index = new DependencyIndex(blueprint);
    INDEXES.set(blueprint, index);
  }
  return index;
};
