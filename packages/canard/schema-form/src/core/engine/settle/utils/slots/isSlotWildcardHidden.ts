import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import {
  hasSlotWildcardPath,
  slotWildcardQueryProofs,
} from './slotWildcardQueryProofs';

/** Preserve legacy query exclusion only for literal wildcard paths at lazy reads. */
export const isSlotWildcardHidden = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  path: string,
): boolean => {
  if (!hasSlotWildcardPath(path)) return false;
  return host.detached
    ? slotWildcardQueryProofs.get(host)?.get(path) === true
    : find(host.rootNode, path) !== null;
};
