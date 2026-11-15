import { isArray } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../../record';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';
import { omitEmptyArray } from './omitEmptyArray';
import { omitTrailingEmptyArray } from './omitTrailingEmptyArray';

/**
 * Project an array host using one effective schema's cached option bits.
 * @param node - Branch host whose wrong-kind source is emitted directly
 * @param value - Assembled item slots and undeclared tail values
 * @returns Emitted source or undefined when omitted by shape or options
 */
export const projectBranchArray: Behavior['project'] = (node, value) => {
  if (node.source !== undefined && !isArray(node.source)) return node.source;
  if (!isArray(value)) return undefined;
  const choices = getStaticChoices(node.schema);
  const projected = choices.omitTrailingEmpty
    ? omitTrailingEmptyArray(value)
    : value;
  return choices.omitEmpty ? omitEmptyArray(projected) : projected;
};
