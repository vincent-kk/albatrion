import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Blueprint } from '../../types/blueprint';
import type { BlueprintChildEntry } from '../../types/node';
import type {
  FixedFirstHostPlan,
  FixedFirstLoadPlan,
} from '../../types/staticFirstLoad';
import { isFixedFirstConstraint } from './isFixedFirstConstraint';
import { isFixedFirstFragment } from './isFixedFirstFragment';
import { isFixedFirstRecord } from './isFixedFirstRecord';

/**
 * Prove fixed membership from completed declarations before publishing a blueprint.
 * @param blueprint - Completed graph; no runtime bindings or validator are consulted
 * @param finiteLiteral - Existing finite/literal proof, independent of branchlessness
 * @returns Frozen mount-only evidence, or undefined before any occurrence is created
 */
export const buildFixedFirstLoadPlan = (
  blueprint: Blueprint,
  finiteLiteral: boolean,
): FixedFirstLoadPlan | undefined => {
  const capabilities = blueprint.capabilities;
  if (
    capabilities.branchless ||
    !finiteLiteral ||
    capabilities.hasExpressions ||
    capabilities.hasDerive ||
    capabilities.hasWatch ||
    capabilities.hasState ||
    capabilities.hasDependencies
  )
    return undefined;
  const hosts: Record<number, FixedFirstHostPlan> = Object.create(null);
  let hasIf = false;
  for (const node of blueprint.nodes) {
    if (
      node.kind === 'array' ||
      node.kind === 'union' ||
      node.kind === 'virtual' ||
      (node.kind === 'object' && node.strategy !== 'branch') ||
      node.hasPropertyCandidates
    )
      return undefined;
    let children: Map<string, BlueprintChildEntry> | undefined;
    let affected: BlueprintChildEntry[] | undefined;
    if (node.kind === 'object') {
      children = new Map();
      affected = [];
      for (const entry of node.childEntries) {
        if (children.has(entry.name)) return undefined;
        let baseline = 0;
        let gated = false;
        for (const declaration of entry.declarations) {
          if (declaration.gates.length) gated = true;
          else if (declaration.role === 'declaration') baseline++;
        }
        if (baseline !== 1) return undefined;
        children.set(entry.name, entry);
        if (gated) affected.push(entry);
      }
    }
    let localIf = false;
    for (const declaration of node.declarations) {
      const schema = declaration.schema;
      if (
        !isFixedFirstRecord(schema) ||
        hasOwnProperty(schema, 'controls') ||
        hasOwnProperty(schema, 'oneOf') ||
        hasOwnProperty(schema, 'anyOf') ||
        (hasOwnProperty(schema, 'default') &&
          (node.kind === 'object' ||
            (schema.default !== null && typeof schema.default === 'object')))
      )
        return undefined;
      if (
        hasOwnProperty(schema, 'properties') &&
        !isFixedFirstRecord(schema.properties)
      )
        return undefined;
      const gates = declaration.gates;
      if (gates.length) {
        if (
          gates.length !== 1 ||
          gates[0].kind !== 'if' ||
          gates[0].appliesWhen?.length
        )
          return undefined;
        if (children) {
          if (
            gates[0].hostPath !== node.path ||
            !isFixedFirstFragment(schema, children)
          )
            return undefined;
        } else if (node.kind !== 'string' || !isFixedFirstConstraint(schema))
          return undefined;
      }
      if (hasOwnProperty(schema, 'if')) {
        if (
          gates.length ||
          !children ||
          !isFixedFirstFragment(schema.then, children) ||
          !isFixedFirstFragment(schema.else, children)
        )
          return undefined;
        hasIf = true;
        localIf = true;
      } else if (
        hasOwnProperty(schema, 'then') ||
        hasOwnProperty(schema, 'else')
      )
        return undefined;
    }
    if (affected && (localIf || affected.length > 0))
      hosts[node.id] = Object.freeze({
        entries: node.childEntries,
        affected: Object.freeze(affected),
      });
  }
  return hasIf ? Object.freeze({ hosts: Object.freeze(hosts) }) : undefined;
};
