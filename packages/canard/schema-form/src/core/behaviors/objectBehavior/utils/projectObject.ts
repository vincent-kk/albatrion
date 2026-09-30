import { isArray } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../record';
import { getStaticChoices } from '../../utils/options/getStaticChoices';
import { omitEmptyObject } from './omitEmptyObject';

/** Hide children beneath non-object raw, then apply the empty-host projection. */
export const projectObject: Behavior['project'] = (node, local) => {
  if (node.raw !== undefined && (node.raw === null ||
    typeof node.raw !== 'object' || isArray(node.raw))) return undefined;
  return getStaticChoices(node.schema).omitEmpty ? omitEmptyObject(local) : local;
};
