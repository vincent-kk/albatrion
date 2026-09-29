import type { Behavior } from '../../../../record';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';

/** Omit only an empty outgoing string when the effective hint enables it. */
export const projectString: Behavior['project'] = (node, local) =>
  local === '' && getStaticChoices(node.schema).omitEmpty ? undefined : local;
