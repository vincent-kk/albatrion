import type { Behavior } from '../../../record';
import { getStaticChoices } from '../options/getStaticChoices';

/** Return a trimmed string only when blur must perform an automatic write. */
export const finishStringInput: Behavior['finishInput'] = (node) => {
  if (
    !getStaticChoices(node.__schema__).trim ||
    typeof node.source !== 'string'
  )
    return undefined;
  const trimmed = node.source.trim();
  return trimmed === node.source ? undefined : trimmed;
};
