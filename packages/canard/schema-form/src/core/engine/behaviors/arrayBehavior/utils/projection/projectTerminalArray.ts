import { isArray } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../../record';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';
import { omitEmptyArray } from './omitEmptyArray';
import { omitTrailingArray } from './omitTrailingArray';

/**
 * Project an opaque array with cached omission bits and no source mutation.
 * @param node - Terminal record supplying source kind and effective options
 * @param local - Whole source array proposed for output
 * @returns Emitted source or undefined when omitted by shape or options
 */
export const projectTerminalArray: Behavior['project'] = (node, local) => {
  if (node.source !== undefined && !isArray(node.source)) return node.source;
  if (!isArray(local)) return undefined;
  const choices = getStaticChoices(node.schema);
  const projected = choices.omitTrailing ? omitTrailingArray(local) : local;
  return choices.omitEmpty ? omitEmptyArray(projected) : projected;
};
