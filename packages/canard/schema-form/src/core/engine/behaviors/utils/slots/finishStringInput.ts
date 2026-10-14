import type { Behavior } from '../../../record';
import { getStaticChoices } from '../options/getStaticChoices';

/** Return a trimmed string only when blur must perform an automatic write. */
export const finishStringInput: Behavior['finishInput'] = (node) => {
  if (!getStaticChoices(node.schema).trim || typeof node.raw !== 'string')
    return undefined;
  const trimmed = node.raw.trim();
  return trimmed === node.raw ? undefined : trimmed;
};
