import type { Behavior } from '../../../record';
import { getStaticChoices } from '../../utils/options/getStaticChoices';
import { omitEmptyObject } from './omitEmptyObject';

/** Apply the memoized empty-host policy without changing its local object. */
export const projectObject: Behavior['project'] = (node, local) =>
  getStaticChoices(node.schema).omitEmpty ? omitEmptyObject(local) : local;
