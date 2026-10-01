import { escapeSegment } from '@winglet/json/pointer';

import type { Blueprint, PropertyDeclaration } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import { getDeriveRuleTable } from '../../derive';
import { bindTemplatePath } from '../paths/bindTemplatePath';
import { expandTemplatePaths } from '../paths/expandTemplatePaths';
import { resolveDependencyPath } from '../paths/resolveDependencyPath';
import { isCanonicalArrayIndex } from '../paths/isCanonicalArrayIndex';
import { getContextOwners } from '../context/getContextOwners';
import { getGateExpression } from '../gates/getGateExpression';

/** No reverse dependency owners for a gate-free input path. */
const NO_OWNERS: readonly string[] = Object.freeze([]);

/** One absolute watch prefix and declarations registered exactly here. */
interface DependencyNode {
  /** Declaration hosts that read this exact path. */
  owners: { path: string; bindable: boolean }[];
  /** Next escaped JSON Pointer segments. */
  children: Map<string, DependencyNode>;
}

/** Queryable reverse dependencies built once from the blueprint dictionary. */
class DependencyIndex {
  /** Root of the absolute JSON Pointer watch trie. */
  private readonly root: DependencyNode = { owners: [], children: new Map() };

  /** Build absolute watch paths from authored reverse dependency IDs. */
  constructor(blueprint: Blueprint) {
    getContextOwners(blueprint);
    const dependencies = Object.entries(blueprint.dependencies);
    if (dependencies.length === 0 && blueprint.expressions.length === 0) return;
    const declarations = new Map<number, PropertyDeclaration>(blueprint.nodes.flatMap((node) =>
      node.declarations.map((declaration): [number, PropertyDeclaration] =>
        [declaration.id, declaration])));
    for (const [dependency, ids] of dependencies)
      for (const id of ids) {
        const declaration = declarations.get(id);
        if (!declaration) continue;
        const watched = resolveDependencyPath(declaration.path, dependency);
        if (watched === '@') continue;
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
            if (watched !== '@') this.add(watched, declaration.path);
          }
        }
    for (const node of blueprint.nodes)
      for (const declaration of node.declarations)
        for (const gate of declaration.gates) {
          const expression = getGateExpression(blueprint, gate.schemaPath);
          if (!expression) continue;
          for (const dependency of expression.dependencies) {
            const watched = resolveDependencyPath(gate.hostPath, dependency);
            if (watched === '@') continue;
            this.add(watched, declaration.path);
          }
        }
  }

  /** Return owners whose reads intersect a changed path in either direction. */
  affected<Self extends SchemaNodeRecord<Self>>(
    changedPath: string, root: Self,
  ): readonly string[] {
    if (this.root.owners.length === 0 && this.root.children.size === 0)
      return NO_OWNERS;
    const owners = new Set<string>();
    let current: DependencyNode[] = [this.root];
    const collect = (node: DependencyNode): void => {
      for (const entry of node.owners) {
        const path = entry.bindable
          ? bindTemplatePath(entry.path, changedPath) : entry.path;
        if (path.includes('/*'))
          for (const expanded of expandTemplatePaths(root, path))
            owners.add(expanded);
        else owners.add(path);
      }
    };
    collect(this.root);
    for (const segment of changedPath.split('/').filter(Boolean)) {
      const next: DependencyNode[] = [];
      for (const node of current) {
        const exact = node.children.get(segment);
        if (exact) next.push(exact);
        if (isCanonicalArrayIndex(segment)) {
          const wildcard = node.children.get('*');
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
    const ownerParts = owner.split('/');
    const watchedParts = watchedPath.split('/');
    // A fixed read of another item depends on that array host's whole subtree.
    for (let index = 1; index < ownerParts.length; index++) {
      if (ownerParts[index] === '*' && watchedParts[index] !== '*' &&
        ownerParts.slice(1, index).every((part, position) =>
          part === watchedParts[position + 1]) && watchedParts[index]) {
        watchedPath = ownerParts.slice(0, index).join('/');
        break;
      }
    }
    let current = this.root;
    for (const segment of watchedPath.split('/').filter(Boolean)) {
      let child = current.children.get(segment);
      if (!child) {
        child = { owners: [], children: new Map() };
        current.children.set(segment, child);
      }
      current = child;
    }
    const indexedParts = watchedPath.split('/');
    if (!current.owners.some((entry) => entry.path === owner))
      current.owners.push({ path: owner,
        bindable: ownerParts.every((part, index) =>
          part !== '*' || indexedParts[index] === '*') });
  }
}

/** Cached dependency indexes live only while their analyzed blueprint lives. */
const INDEXES = new WeakMap<Blueprint, DependencyIndex>();

/**
 * Reuse a path index for all writes against one analyzed blueprint.
 * @param blueprint - Static dependency dictionary and declaration IDs
 * @returns Reverse dependency trie for ancestor and descendant invalidation
 */
export const getDependencyIndex = (blueprint: Blueprint): DependencyIndex => {
  let index = INDEXES.get(blueprint);
  if (!index) {
    index = new DependencyIndex(blueprint);
    INDEXES.set(blueprint, index);
  }
  return index;
};
