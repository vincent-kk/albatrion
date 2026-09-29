import type { Behavior } from '../../../record';
import { isEmptyObject } from '@winglet/common-utils/filter';
import { getStaticChoices } from '../options/getStaticChoices';

/** Omit empty whole values while preserving every non-empty input reference. */
export const projectEmpty: Behavior['project'] = (node, local) => {
  if (!getStaticChoices(node.schema).omitEmpty) return local;
  if (local === '' || (Array.isArray(local) && local.length === 0) ||
    (local !== null && typeof local === 'object' && !Array.isArray(local) &&
      isEmptyObject(local))) return undefined;
  return local;
};
