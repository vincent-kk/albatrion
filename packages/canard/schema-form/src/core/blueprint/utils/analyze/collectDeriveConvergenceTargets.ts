import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import { getAbsolutePath, stripFragment } from '../../../../helpers/jsonPointer';
import type { Blueprint, BlueprintExpression, PropertyDeclaration } from '../../type';
import { CompleteExpressionReads } from './compileBlueprintExpressions/utils/CompleteExpressionReads';

/**
 * Bind a static read with the same root-clamped semantics as settlement.
 * @param host - Absolute declaration/gate host
 * @param dependency - Authored pointer without a context token
 * @returns Absolute pointer with fragment and root spellings normalized
 */
const resolveRead = (host: string, dependency: string): string =>
  stripFragment(getAbsolutePath(host, dependency[0] === '/' ||
    dependency[0] === '#' || dependency[0] === '.' ? dependency : `./${dependency}`));

/**
 * Detect a `*` segment without splitting the pointer into an array.
 * @param path - Blueprint node pointer
 * @returns True when one segment is exactly `*`
 */
const hasWildcardSegment = (path: string): boolean =>
  path === '*' || path.startsWith('*/') || path.endsWith('/*') || path.includes('/*/');

/**
 * Prove which static terminal writes cannot create a rule or gate edge.
 * @param blueprint - Complete finite graph, including disabled declarations
 * @returns Terminal target paths, or undefined when any read/binding is uncertain
 */
export const collectDeriveConvergenceTargets = (
  blueprint: Blueprint,
): ReadonlySet<string> | undefined => {
  if (!blueprint.capabilities.hasDerive) return undefined;
  const nodes = blueprint.nodes;
  const declarations = new Map<number, PropertyDeclaration>();
  const hosts = new Set<string>();
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.item || hasWildcardSegment(node.path)) return undefined;
    if (node.kind === 'object' || node.kind === 'array' || node.kind === 'virtual' ||
      node.kind === 'union')
      hosts.add(node.path);
    for (let child = 0; child < node.childEntries.length; child++) {
      const entry = node.childEntries[child];
      if (entry.node.path !== `${node.path}/${escapeSegment(entry.name)}`)
        return undefined;
    }
    for (let declaration = 0; declaration < node.declarations.length; declaration++) {
      const entry = node.declarations[declaration];
      if (entry.path !== node.path) return undefined;
      declarations.set(entry.id, entry);
    }
  }
  const reads = new Set<string>();
  const expressions = blueprint.expressions;
  const gateExpressions = blueprint.capabilities.branchless ? undefined :
    new Map<string, BlueprintExpression>();
  for (let index = 0; index < expressions.length; index++) {
    const expression = expressions[index];
    if (!CompleteExpressionReads.has(expression)) return undefined;
    if (expression.key === 'active' && gateExpressions &&
      !gateExpressions.has(expression.schemaPath))
      gateExpressions.set(expression.schemaPath, expression);
    for (let dependency = 0; dependency < expression.dependencies.length; dependency++) {
      const path = expression.dependencies[dependency];
      if (path === '@') return undefined;
      const read = resolveRead(expression.hostPath, path);
      if (!read || hosts.has(read)) return undefined;
      reads.add(read);
    }
  }
  const dependencies = Object.keys(blueprint.dependencies);
  for (let index = 0; index < dependencies.length; index++) {
    const dependency = dependencies[index];
    if (dependency === '@') return undefined;
    const owners = blueprint.dependencies[dependency];
    for (let owner = 0; owner < owners.length; owner++) {
      const declaration = declarations.get(owners[owner]);
      if (!declaration) return undefined;
      reads.add(resolveRead(declaration.path, dependency));
    }
  }
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    for (let declaration = 0; declaration < node.declarations.length; declaration++) {
      const entry = node.declarations[declaration];
      const controls = typeof entry.schema === 'object' ? entry.schema.controls : undefined;
      if (controls && typeof controls === 'object') {
        if (typeof Reflect.get(controls, 'injectTo') === 'function') reads.add(node.path);
        const children = Reflect.get(controls, 'children');
        if (isArray(children)) for (let child = 0; child < children.length; child++) {
          const childControls = children[child]?.controls;
          if (!childControls || typeof childControls !== 'object') continue;
          if (typeof childControls.injectTo === 'function') reads.add(node.path);
          const watches = childControls.watch;
          if (watches === undefined) continue;
          const paths = isArray(watches) ? watches : [watches];
          const targets = children[child].targets;
          if (!isArray(targets)) return undefined;
          for (let target = 0; target < targets.length; target++) {
            const targetPath = `${node.path}/${escapeSegment(targets[target])}`;
            for (let watch = 0; watch < paths.length; watch++) {
              if (typeof paths[watch] !== 'string' || paths[watch] === '@') return undefined;
              reads.add(resolveRead(targetPath, paths[watch]));
            }
          }
        }
      }
      for (let gateIndex = 0; gateIndex < entry.gates.length; gateIndex++) {
        const gate = entry.gates[gateIndex];
        if (gate.kind !== 'active') {
          reads.add(gate.hostPath);
          continue;
        }
        if (typeof gate.condition !== 'string') continue;
        const expression = gateExpressions?.get(gate.schemaPath);
        if (!expression && gate.condition.trim()) return undefined;
        if (expression) for (let path = 0; path < expression.dependencies.length; path++)
          reads.add(resolveRead(gate.hostPath, expression.dependencies[path]));
      }
    }
  }
  const readPaths = [...reads];
  const targets = new Set<string>();
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (hosts.has(node.path)) continue;
    let terminal = true;
    for (let read = 0; read < readPaths.length; read++) {
      const path = readPaths[read];
      if (!path || path === node.path || path.startsWith(`${node.path}/`) ||
        node.path.startsWith(`${path}/`)) {
        terminal = false;
        break;
      }
    }
    if (terminal) targets.add(node.path);
  }
  return targets.size ? targets : undefined;
};
