import { isEmptyArray, isEmptyPlainObject } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../record';
import { getStaticChoices } from '../options/getStaticChoices';

/** Omit an empty string, array or plain object while preserving every other input reference, including keyless Date and File values. */
export const projectEmpty: Behavior['project'] = (node, local) => {
  if (!getStaticChoices(node.schema).omitEmpty) return local;
  if (local === '' || isEmptyArray(local) || isEmptyPlainObject(local))
    return undefined;
  return local;
};
