import { isEmptyArray, isEmptyPlainObject } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../record';
import { getStaticChoices } from '../options/getStaticChoices';

/**
 * Omit an empty string, array or plain object under static omitEmpty (empty-values).
 * @param node - String or union node whose static choices decide omitEmpty
 * @param value - Whole value the node holds
 * @returns `undefined` for an omitted empty value; otherwise `value` by reference, including a keyless Date or File
 */
export const projectEmpty: Behavior['project'] = (node, value) => {
  if (!getStaticChoices(node.schema).omitEmpty) return value;
  if (value === '' || isEmptyArray(value) || isEmptyPlainObject(value))
    return undefined;
  return value;
};
