import { escapeSegment } from '@winglet/json/pointer';

import type { Blueprint, PropertyDeclaration } from '../../../blueprint';
import { getDeriveRuleTable } from '../../derive';
import { resolveDependencyPath } from '../paths/resolveDependencyPath';
import { getContextOwners } from '../context/getContextOwners';
import { getGateExpression } from '../gates/getGateExpression';

/** No reverse dependency owners for a gate-free input path. */
const NO_OWNERS: readonly string[] = Object.freeze([]);

/** One absolute watch prefix and declarations registered exactly here. */
interface DependencyNode {
  /** Declaration hosts that read this exact path. */
  owners: string[];
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
  affected(changedPath: string): readonly string[] {
    if (this.root.owners.length === 0 && this.root.children.size === 0)
      return NO_OWNERS;
    const owners = new Set<string>();
    let current: DependencyNode | undefined = this.root;
    for (const owner of current.owners) owners.add(owner);
    for (const segment of changedPath.split('/').filter(Boolean)) {
      current = current.children.get(segment);
      if (!current) return [...owners];
      for (const owner of current.owners) owners.add(owner);
    }
    const pending = [...current.children.values()];
    while (pending.length) {
      const child = pending.pop();
      if (!child) continue;
      for (const owner of child.owners) owners.add(owner);
      pending.push(...child.children.values());
    }
    return [...owners];
  }

  /** Insert one exact watched location into the pointer trie. */
  private add(watchedPath: string, owner: string): void {
    let current = this.root;
    for (const segment of watchedPath.split('/').filter(Boolean)) {
      let child = current.children.get(segment);
      if (!child) {
        child = { owners: [], children: new Map() };
        current.children.set(segment, child);
      }
      current = child;
    }
    if (!current.owners.includes(owner)) current.owners.push(owner);
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
