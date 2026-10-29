import { map as mapArray } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { Blueprint, BlueprintExpression } from '../../../blueprint';
import { CONTROL_KEY } from '../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import { visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import { getFragmentOwnerPaths } from '../../../utils/controls/getFragmentOwnerPaths';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getControlLayers } from '../controls/getControlLayers';
import { getExitPolicyKey } from '../controls/getExitPolicyKey';
import { readStateDependency } from '../controls/readStateDependency';
import { isDependencyOwner } from '../dependencies/isDependencyOwner';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { pruneCommittedRuleKeys } from './pruneCommittedRuleKeys';
import { updateCommittedRuleValue } from './updateCommittedRuleValue';

/** Compiled exit expressions indexed once per immutable analysis. */

/**
 * Index authored exit expressions by their declaration and schema address.
 * @param blueprint - Immutable analyzed schema used across settlements
 * @returns Cached expression lookup, empty when no exit expression exists
 */
const getExitExpressions = (
  blueprint: Blueprint,
): ReadonlyMap<string, BlueprintExpression> => {
  let indexed = getBlueprintDerived<
    'exitPolicyExpressions',
    ReadonlyMap<string, BlueprintExpression>
  >(blueprint).exitPolicyExpressions;
  if (indexed) return indexed;
  const entries = new Map<string, BlueprintExpression>();
  for (const expression of blueprint.expressions)
    if (expression.key === 'unsetOnInactive')
      entries.set(
        JSON.stringify([expression.declarationId, expression.schemaPath]),
        expression,
      );
  indexed = entries;
  getBlueprintDerived<
    'exitPolicyExpressions',
    ReadonlyMap<string, BlueprintExpression>
  >(blueprint).exitPolicyExpressions = indexed;
  return indexed;
};

/**
 * Commit live unsetOnInactive expressions for later exits without revisiting absent nodes.
 * @param context - Final shape and its bounded set of calculated hosts
 * @returns Nothing; committed rule values and any deferred failure are updated
 */

export const commitExitPolicyValues = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const expressions = getExitExpressions(context.root.runtime.blueprint);
  if (expressions.size === 0) return;
  const runtime = context.root.runtime;
  for (const exited of context.exited)
    visitFieldNodes(
      exited,
      (node) => {
        pruneCommittedRuleKeys(runtime, node.path, 'exitPolicy');
      },
      { owned: true },
    );
  if (context.kind === 'load' && context.loadScope)
    visitFieldNodes(
      context.loadScope,
      (node) => {
        pruneCommittedRuleKeys(runtime, node.path, 'exitPolicy');
      },
      { owned: true },
    );
  const candidates = new Set(context.stateDirtyNodes);
  for (const source of context.stateDirtyNodes) {
    if (source.detached || !source.structure) continue;
    if (
      context.kind !== 'load' &&
      !isDependencyOwner(context, source.path) &&
      !context.shapeDirtyPaths.has(source.path)
    )
      continue;
    const sourceKey = JSON.stringify([
      source.path,
      getBlueprintNodeIdentity(source.blueprintNode),
    ]);
    const selected =
      context.selectedDeclarationIds.get(source) ??
      source.runtime.committedDeclarationIds?.get(sourceKey);
    for (const declaration of source.blueprintNode.declarations) {
      if (selected && selected.indexOf(declaration.id) === -1) continue;
      const schema = declaration.schema;
      if (!schema || typeof schema !== 'object') continue;
      const controls: unknown = Reflect.get(schema, SCHEMA_GROUP.controls);
      if (!controls || typeof controls !== 'object' || isArray(controls))
        continue;

      if (
        declaration.scope === 'fragment' &&
        typeof Reflect.get(controls, CONTROL_KEY.unsetOnInactive) === 'string'
      ) {
        for (const child of source.children ?? []) {
          const childSelected =
            context.selectedDeclarationIds.get(child) ??
            child.runtime.committedDeclarationIds?.get(
              getCommittedDeclarationKey(child, child.runtime),
            );
          let hasMatch = false;
          for (const childDeclaration of child.blueprintNode.declarations) {
            if (
              (!childSelected ||
                childSelected.indexOf(childDeclaration.id) !== -1) &&
              getFragmentOwnerPaths(childDeclaration.schemaPath).indexOf(
                declaration.schemaPath,
              ) !== -1
            ) {
              hasMatch = true;
              break;
            }
          }
          if (!hasMatch) {
            continue;
          }
          candidates.add(child);
          break;
        }
      }
      const fields: unknown = Reflect.get(controls, CONTROL_KEY.fields);
      if (!isArray(fields)) continue;
      for (const item of fields) {
        if (!item || typeof item !== 'object') continue;
        const itemControls: unknown = Reflect.get(item, SCHEMA_GROUP.controls);
        if (
          !itemControls ||
          typeof itemControls !== 'object' ||
          typeof Reflect.get(itemControls, CONTROL_KEY.unsetOnInactive) !==
            'string'
        )
          continue;
        const targets: unknown = Reflect.get(item, 'targets');
        if (!isArray(targets)) continue;
        for (const name of targets) {
          if (
            typeof name !== 'string' ||
            !hasOwnProperty(source.structure, name)
          )
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
    for (const group of getControlLayers(
      node,
      context.selectedDeclarationIds,
    )) {
      if (
        !hasOwnProperty(group.controls, CONTROL_KEY.unsetOnInactive) ||
        typeof Reflect.get(group.controls, CONTROL_KEY.unsetOnInactive) !==
          'string'
      )
        continue;
      const schemaPath = appendSegment(group.schemaPath, 'unsetOnInactive');
      const key = getExitPolicyKey(group);
      if (evaluated.has(key)) continue;
      evaluated.add(key);
      const expression = expressions.get(
        JSON.stringify([group.declarationId, schemaPath]),
      );
      if (!expression) continue;
      try {
        updateCommittedRuleValue(
          runtime,
          key,
          'set',
          Boolean(
            expression.evaluate(
              mapArray(expression.dependencies, (dependency) =>
                readStateDependency(
                  context.root,
                  group.host.path,
                  dependency,
                  undefined,
                  group.host,
                ),
              ),
            ),
          ),
        );
      } catch (cause) {
        updateCommittedRuleValue(runtime, key, 'set', false);
        recordSettlementFailure(
          context,
          new SchemaFormError(
            FormErrorCode.ExpressionThrew,
            `Exit policy expression failed at ${schemaPath}`,
            { path: group.host.path, schemaPath, cause },
          ),
          'expression',
        );
      }
    }
  }
};
