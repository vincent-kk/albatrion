import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { getFragmentOwnerPaths } from '../../../utils/controls/getFragmentOwnerPaths';
import type { MutableNode } from '../../types/analysis';
import type { BlueprintNode } from '../../types/node';

/**
 * Prepare sparse declaration-presence facts without retaining runtime selections.
 * @param nodes - Completed templates, before publication and freezing
 * @returns Nothing; only templates potentially addressed by inactiveValue are marked
 */
export const markInactiveValueNodes = (nodes: readonly MutableNode[]): void => {
  for (const node of nodes)
    for (const declaration of node.declarations) {
      const schema = declaration.schema;
      if (typeof schema !== 'object') continue;
      const controls: unknown = schema.controls;
      if (!controls || typeof controls !== 'object') continue;
      const own = hasOwnProperty(controls, 'inactiveValue');
      if (own && declaration.scope === 'node') mark(node);
      const fields: unknown = Reflect.get(controls, 'fields');
      if (isArray(fields))
        for (const field of fields) {
          if (!field || typeof field !== 'object') continue;
          const group: unknown = Reflect.get(field, 'controls');
          const targets: unknown = Reflect.get(field, 'targets');
          if (
            !group ||
            typeof group !== 'object' ||
            !hasOwnProperty(group, 'inactiveValue') ||
            !isArray(targets)
          )
            continue;
          for (const entry of node.childEntries)
            if (targets.includes(entry.name)) mark(entry.node);
        }
      if (!own || declaration.scope === 'node') continue;
      const children = [
        ...node.childEntries.map((entry) => entry.node),
        ...(node.itemCandidates ?? (node.item ? [node.item] : [])),
        ...(node.prefixItemCandidates?.flat() ?? node.prefixItems ?? []),
      ];
      for (const child of children)
        if (
          child.declarations.some((candidate) =>
            getFragmentOwnerPaths(candidate.schemaPath).includes(
              declaration.schemaPath,
            ),
          )
        )
          mark(child);
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
