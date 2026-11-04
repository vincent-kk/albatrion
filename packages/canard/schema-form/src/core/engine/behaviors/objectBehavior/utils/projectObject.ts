import { isArray } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../record';
import { getStaticChoices } from '../../utils/options/getStaticChoices';
import { omitEmptyObject } from './omitEmptyObject';

/** Emit wrong-kind host source without children, then project an object host. */
export const projectObject: Behavior['project'] = (node, local) => {
  if (
    node.source !== undefined &&
    (node.source === null || typeof node.source !== 'object' || isArray(node.source))
  )
    return node.source;
  return getStaticChoices(node.schema).omitEmpty
    ? omitEmptyObject(local)
    : local;
};
