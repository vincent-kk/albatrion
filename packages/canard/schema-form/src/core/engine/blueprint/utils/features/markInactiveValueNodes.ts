import { map as mapArray } from '@winglet/common-utils/array';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { CONTROL_KEY } from '../../../constants/controlKey';
import { getFragmentOwnerPaths } from '../../../utils/controls/getFragmentOwnerPaths';
import { readValidatedControls } from '../../../utils/controls/readValidatedControls';
import type { MutableNode } from '../../types/analysis';
import type { BlueprintNode } from '../../types/node';

/**
 * Prepare sparse declaration-presence facts without retaining runtime selections.
 * @param nodes - Completed templates, before publication and freezing
 * @returns Nothing; only templates potentially addressed by inactiveValue are marked
 */
export const markInactiveValueNodes = (nodes: readonly MutableNode[]): void => {
  for (const node of nodes) {
    for (const declaration of node.declarations) {
      const schema = declaration.schema;
      if (typeof schema !== 'object') continue;
      const controls = readValidatedControls(schema);
      if (!controls) continue;
      const own = hasOwnProperty(controls, CONTROL_KEY.inactiveValue);
      if (own && declaration.scope === 'node') mark(node);
      const fields = controls.fields;
      if (fields)
        for (const field of fields) {
          if (!field) continue;
          const group = field.controls;
          const targets = field.targets;
          if (!group || !hasOwnProperty(group, CONTROL_KEY.inactiveValue))
            continue;
          for (const entry of node.childEntries)
            if (targets.includes(entry.name)) mark(entry.node);
        }
      if (!own || declaration.scope === 'node') continue;
      const children = [
        ...mapArray(node.childEntries, (entry) => entry.node),
        ...(node.itemCandidates ?? (node.item ? [node.item] : [])),
        ...(node.prefixItemCandidates?.flat() ?? node.prefixItems ?? []),
      ];
      for (const child of children) {
        let belongsToInactiveFragment = false;
        for (const candidate of child.declarations) {
          if (
            getFragmentOwnerPaths(candidate.schemaPath).includes(
              declaration.schemaPath,
            )
          ) {
            belongsToInactiveFragment = true;
            break;
          }
        }
        if (belongsToInactiveFragment) {
          mark(child);
        }
      }
    }
  }
};

/**
 * Publish a hidden immutable-template fact while construction still owns the node.
 * @param node - Template with an authored resolver in some eligible layer
 * @returns Nothing; repeated parent bindings share the same true fact
 */
const mark = (node: BlueprintNode): void => {
  Object.defineProperty(node, 'hasInactiveValue', {
    value: true,
    configurable: true,
  });
};
