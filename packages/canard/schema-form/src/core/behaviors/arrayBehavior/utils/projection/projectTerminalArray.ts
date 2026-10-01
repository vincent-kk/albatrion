import { isArray } from '@winglet/common-utils/filter';
import type { Behavior } from '../../../../record';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';
import { omitEmptyArray } from './omitEmptyArray';
import { omitTrailingArray } from './omitTrailingArray';

/**
 * Project an opaque array with cached omission bits and no raw mutation.
 * @param node - Terminal record supplying raw kind and effective options
 * @param local - Whole raw array proposed for output
 * @returns Emitted array or undefined when suppressed by shape or options
 */
export const projectTerminalArray: Behavior['project'] = (node, local) => {
  if (node.raw !== undefined && !isArray(node.raw)) return undefined;
  if (!isArray(local)) return undefined;
  const choices = getStaticChoices(node.schema);
  const projected = choices.omitTrailing ? omitTrailingArray(local) : local;
  return choices.omitEmpty ? omitEmptyArray(projected) : projected;
};
