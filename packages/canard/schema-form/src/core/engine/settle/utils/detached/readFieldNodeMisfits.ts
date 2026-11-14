import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { FieldNodeRecord } from '../../../record';

/** Read current or final committed misfit paths, reusing the shared frozen array for empty reads. */
export const readFieldNodeMisfits = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly string[] =>
  node.detached
    ? (node.runtime.detachedReads?.get(node)?.misfits ?? EMPTY_ARRAY)
    : (node.runtime.misfitsMemo?.get(node.path)?.paths ?? EMPTY_ARRAY);
