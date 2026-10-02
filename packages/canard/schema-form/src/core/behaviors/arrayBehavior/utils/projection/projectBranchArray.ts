import { isArray } from '@winglet/common-utils/filter';
import type { Behavior } from '../../../../record';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';
import { omitEmptyArray } from './omitEmptyArray';
import { omitTrailingArray } from './omitTrailingArray';

/**
 * Project an array host using one effective schema's cached option bits.
 * @param node - Branch host whose wrong-kind raw is emitted directly
 * @param local - Assembled item slots and undeclared tail values
 * @returns Emitted raw or undefined when omitted by shape or options
 */
export const projectBranchArray: Behavior['project'] = (node, local) => {
  if (node.raw !== undefined && !isArray(node.raw)) return node.raw;
  if (!isArray(local)) return undefined;
  const choices = getStaticChoices(node.schema);
  const projected = choices.omitTrailing ? omitTrailingArray(local, node) : local;
  return choices.omitEmpty ? omitEmptyArray(projected) : projected;
};
