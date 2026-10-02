import { isArray } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../record';
import { getStaticChoices } from '../../utils/options/getStaticChoices';
import { omitEmptyObject } from './omitEmptyObject';

/** Emit wrong-kind host raw without children, then project an object host. */
export const projectObject: Behavior['project'] = (node, local) => {
  if (node.raw !== undefined && (node.raw === null ||
    typeof node.raw !== 'object' || isArray(node.raw))) return node.raw;
  return getStaticChoices(node.schema).omitEmpty ? omitEmptyObject(local) : local;
};
