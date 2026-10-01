import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { SchemaFormError } from '../../../../errors';
import type { Blueprint, BlueprintExpression } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import { walkSchemaNodes } from '../../../navigation';
import type { SettlementContext } from '../../type';
import { getControlLayers } from '../controls/getControlLayers';
import { getExitPolicyKey } from '../controls/getExitPolicyKey';
import { readStateDependency } from '../controls/readStateDependency';
import { EXPRESSION_THREW } from '../errors/settleErrorCode';
import { pruneCommittedRuleKeys } from './pruneCommittedRuleKeys';
import { updateCommittedRuleValue } from './updateCommittedRuleValue';

/** Compiled exit expressions indexed once per immutable analysis. */
const EXIT_EXPRESSIONS = new WeakMap<Blueprint, ReadonlyMap<string, BlueprintExpression>>();

/**
 * Index authored exit expressions by their declaration and schema address.
 * @param blueprint - Immutable analyzed schema used across settlements
 * @returns Cached expression lookup, empty when no exit expression exists
 */
const getExitExpressions = (blueprint: Blueprint): ReadonlyMap<string, BlueprintExpression> => {
  let indexed = EXIT_EXPRESSIONS.get(blueprint);
  if (indexed) return indexed;
  indexed = new Map(blueprint.expressions.filter((expression) =>
    expression.key === 'unsetOnInactive').map((expression) =>
    [JSON.stringify([expression.declarationId, expression.schemaPath]), expression]));
  EXIT_EXPRESSIONS.set(blueprint, indexed);
  return indexed;
};

/**
 * Commit live unsetOnInactive expressions for later exits without revisiting absent nodes.
 * @param context - Final shape and its bounded set of calculated hosts
 * @returns Nothing; committed rule values and any deferred failure are updated
 */
export const commitExitPolicyValues = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const expressions = getExitExpressions(context.root.runtime.blueprint);
  if (expressions.size === 0) return;
  const runtime = context.root.runtime;
  for (const exited of context.exited)
    walkSchemaNodes(exited, (node) =>
      pruneCommittedRuleKeys(runtime, node.path, 'exitPolicy'));
  if (context.kind === 'load' && context.loadScope)
    walkSchemaNodes(context.loadScope, (node) =>
      pruneCommittedRuleKeys(runtime, node.path, 'exitPolicy'));
  const candidates = new Set(context.stateDirtyNodes);
  for (const source of context.stateDirtyNodes) {
    if (source.detached || !source.structure) continue;
    if (context.kind !== 'load' && !context.dependencyOwnerPaths.has(source.path) &&
      !context.shapeDirtyPaths.has(source.path)) continue;
    const sourceKey = JSON.stringify([source.path, source.blueprintNode.kind]);
    const selected = context.selectedDeclarationIds.get(source) ??
      source.runtime.committedDeclarationIds?.get(sourceKey);
    for (const declaration of source.blueprintNode.declarations) {
      if (selected && !selected.includes(declaration.id)) continue;
      const schema = declaration.schema;
      if (!schema || typeof schema !== 'object') continue;
      const controls: unknown = Reflect.get(schema, 'controls');
      if (!controls || typeof controls !== 'object' || isArray(controls)) continue;
      if (declaration.scope === 'fragment' &&
        typeof Reflect.get(controls, 'unsetOnInactive') === 'string')
        for (const child of source.children ?? []) {
          if (!getControlLayers(child, context.selectedDeclarationIds).some((group) =>
            group.layer === 'fragment' && group.host === source &&
            group.declarationId === declaration.id)) continue;
          candidates.add(child);
          break;
        }
      const children: unknown = Reflect.get(controls, 'children');
      if (!isArray(children)) continue;
      for (const item of children) {
        if (!item || typeof item !== 'object') continue;
        const itemControls: unknown = Reflect.get(item, 'controls');
        if (!itemControls || typeof itemControls !== 'object' ||
          typeof Reflect.get(itemControls, 'unsetOnInactive') !== 'string') continue;
        const targets: unknown = Reflect.get(item, 'targets');
        if (!isArray(targets)) continue;
        for (const name of targets) {
          if (typeof name !== 'string' || !hasOwnProperty(source.structure, name))
            continue;
          candidates.add(source.structure[name]);
          break;
        }
      }
    }
  }
  const evaluated = new Set<string>();
  for (const node of candidates) {
    if (node.detached) continue;
    for (const group of getControlLayers(node, context.selectedDeclarationIds)) {
      if (!hasOwnProperty(group.controls, 'unsetOnInactive') ||
        typeof Reflect.get(group.controls, 'unsetOnInactive') !== 'string') continue;
      const schemaPath = `${group.schemaPath}/unsetOnInactive`;
      const key = getExitPolicyKey(group);
      if (evaluated.has(key)) continue;
      evaluated.add(key);
      const expression = expressions.get(JSON.stringify([
        group.declarationId, schemaPath]));
      if (!expression) continue;
      try {
        updateCommittedRuleValue(runtime, key, 'set', Boolean(
          expression.evaluate(expression.dependencies.map(
          (dependency) => readStateDependency(context.root, group.host.path,
            dependency)))));
      } catch (cause) {
        updateCommittedRuleValue(runtime, key, 'set', false);
        recordSettlementFailure(context, new SchemaFormError(EXPRESSION_THREW,
          `Exit policy expression failed at ${schemaPath}`,
          { path: group.host.path, schemaPath, cause }), 'expression');
      }
    }
  }
};
