import { isArray } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../../record';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';
import { omitEmptyArray } from './omitEmptyArray';
import { omitTrailingEmptyArray } from './omitTrailingEmptyArray';

/**
 * Project an opaque array with cached omission bits and no source mutation.
 * @param node - Terminal record supplying source kind and effective options
 * @param value - Whole source array proposed for output
 * @returns Emitted source or undefined when omitted by shape or options
 */
export const projectTerminalArray: Behavior['project'] = (node, value) => {
  if (node.source !== undefined && !isArray(node.source)) return node.source;
  if (!isArray(value)) return undefined;
  const choices = getStaticChoices(node.schema);
  const projected = choices.omitTrailingEmpty
    ? omitTrailingEmptyArray(value)
    : value;
  return choices.omitEmpty ? omitEmptyArray(projected) : projected;
};
