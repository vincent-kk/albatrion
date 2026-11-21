import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../../record';
import { interpretFieldNodeInput } from '../../../../settle';
import { BATCH_HOST_SOURCE } from '../../../../utils/batchHostSource';
import { writeObjectKey } from '../../../../utils/writeObjectKey';

/**
 * Read a marked target using its own storage channel, before publishing any projected value.
 * @param node - Live target whose blueprint interprets the input
 * @param input - Composed input at the target's physical address
 * @returns The target's caller-layer value for an updater or same-tuple check
 */
export const readMarkedStoredValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
): unknown => {
  if (node.behavior.type === 'object' && node.behavior.strategy === 'branch') {
    if (input != null && (typeof input !== 'object' || isArray(input)))
      return {};
    if (
      input != null &&
      typeof input === 'object' &&
      BATCH_HOST_SOURCE in input
    ) {
      if (Reflect.get(input, BATCH_HOST_SOURCE) === null) return null;
      const extras: Record<string, unknown> = {};
      for (const key of Object.keys(input))
        if (
          !node.blueprintNode.childEntries.some((entry) => entry.name === key)
        )
          writeObjectKey(extras, key, Reflect.get(input, key));
      return extras;
    }
  }
  return interpretFieldNodeInput(node.blueprintNode, input, node, true);
};
