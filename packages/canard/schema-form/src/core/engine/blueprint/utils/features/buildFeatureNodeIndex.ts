import { map as mapArray } from '@winglet/common-utils/array';

import type { Optional } from '@aileron/declare';

import { STATE_CONTROL_KEYS } from '@/schema-form/constants/reservedSchemaKeys';
import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { CONTROL_KEY } from '../../../constants/controlKey';
import { getFragmentOwnerPaths } from '../../../utils/controls/getFragmentOwnerPaths';
import {
  type ValidatedControls,
  readValidatedControls,
} from '../../../utils/controls/readValidatedControls';
import type {
  Blueprint,
  BlueprintFeatureNodeIndex,
} from '../../types/blueprint';

/** Local control groups whose declared values can differ from the default keys. */
const hasStateKeys = (controls: Optional<ValidatedControls>): boolean => {
  if (controls === undefined) return false;
  for (let index = 0; index < STATE_CONTROL_KEYS.length; index++)
    if (controls[STATE_CONTROL_KEYS[index]] !== undefined) return true;
  return false;
};

/**
 * Index possible state and watch targets without selecting gates or reading values.
 * @param blueprint - Completed finite graph, including recursive and array templates
 * @returns Static bounds keyed by template identity and parent-addressed child name
 */
export const buildFeatureNodeIndex = (
  blueprint: Blueprint,
): BlueprintFeatureNodeIndex => {
  const stateKeyNodes = new Set<number>();
  const stateKeyChildren = new Map<number, Set<string>>();
  const watchNodes = new Set<number>();
  for (const node of blueprint.nodes) {
    const targets = new Set<string>();
    const children = [
      ...node.childEntries,
      ...(node.prefixItems ?? []).flatMap((item, index) =>
        mapArray(node.prefixItemCandidates?.[index] ?? [item], (child) => ({
          name: String(index),
          node: child,
          declarations: child.declarations,
        })),
      ),
      ...mapArray(
        node.itemCandidates ?? (node.item ? [node.item] : []),
        (item) => ({
          name: $.Wildcard,
          node: item,
          declarations: item.declarations,
        }),
      ),
    ];
    const buildOwners = () =>
      mapArray(children, (child) => {
        const paths = new Set<string>();
        for (const declaration of child.node.declarations)
          for (const path of getFragmentOwnerPaths(declaration.schemaPath))
            paths.add(path);
        return paths;
      });
    let owners: Optional<readonly ReadonlySet<string>[]>;
    for (const declaration of node.declarations) {
      if (declaration.validationOnly || typeof declaration.schema !== 'object')
        continue;
      const schema = declaration.schema;
      const controls = readValidatedControls(schema);
      if (
        schema.readOnly === true ||
        (declaration.scope === 'node' && hasStateKeys(controls))
      )
        stateKeyNodes.add(node.id);
      if (!controls) continue;
      if (
        declaration.scope === 'node' &&
        Reflect.get(controls, CONTROL_KEY.watch) !== undefined
      )
        watchNodes.add(node.id);
      if (declaration.scope === 'fragment' && hasStateKeys(controls))
        for (let index = 0; index < children.length; index++)
          if ((owners ??= buildOwners())[index].has(declaration.schemaPath))
            targets.add(children[index].name);
      const groups = controls.fields;
      if (groups)
        for (const group of groups) {
          if (!group || !hasStateKeys(group.controls)) continue;
          for (const name of group.targets)
            if (name !== undefined) targets.add(name);
        }
    }
    for (const child of children)
      for (const declaration of child.declarations) {
        if (
          declaration.validationOnly ||
          declaration.scope !== 'node' ||
          typeof declaration.schema !== 'object'
        )
          continue;
        const controls = readValidatedControls(declaration.schema);
        if (declaration.schema.readOnly === true || hasStateKeys(controls))
          stateKeyNodes.add(child.node.id);
        if (controls && Reflect.get(controls, CONTROL_KEY.watch) !== undefined)
          watchNodes.add(child.node.id);
      }
    if (targets.size) stateKeyChildren.set(node.id, targets);
  }
  return { stateKeyNodes, stateKeyChildren, watchNodes };
};
