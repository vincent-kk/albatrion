import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import { getControlLayers } from '../controls/getControlLayers';

/** Specificity matches authored default and exit-policy selection. */
const LAYERS = ['node', 'fields', 'fragment'] as const;

/**
 * Select one last-committed inactiveValue declaration without compiling strings.
 * @param node - Departing occurrence and its committed declaration choices
 * @returns Nearest layer's last authored value; undefined never falls through
 */
export const readInactiveValueDeclaration = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown => {
  const groups = getControlLayers(node, emptyReadonlyMap);
  for (const layer of LAYERS)
    for (let index = groups.length - 1; index >= 0; index--) {
      const group = groups[index];
      if (group.layer === layer && hasOwnProperty(group.controls, 'inactiveValue'))
        return Reflect.get(group.controls, 'inactiveValue');
    }
  return undefined;
};
