import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

/**
 * Observe inactive publication at a live host or an absent descendant scope.
 * @param root - Current root with committed inactive publications
 * @param path - Absolute scope; the empty path selects the root
 * @returns Published descendants in their original order and with original item identities
 */
export const readInactiveValuesAt = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
): readonly { path: string; value: unknown }[] => {
  const host = find(root, path);
  return host
    ? readFieldNodeInactiveValues(host)
    : readFieldNodeInactiveValues(root).filter((entry) =>
        entry.path.startsWith(path + '/'),
      );
};
