import { unescapePath } from '../../../escape';
import type { Patch } from '../../../patchModel';
import { JsonPatchError } from './error';
import { isPrototypeModification } from './isPrototypeModification';

/**
 * Rejects a `from` pointer that would dereference a prototype accessor.
 *
 * `path` is validated segment by segment while `applySinglePatch` walks it, but
 * `from` is resolved by `getValue` inside the operation handlers. Without this check
 * a `move` or `copy` can hand a built-in prototype to a handler as an ordinary value,
 * and a later patch writing into that alias reaches the global prototype.
 *
 * @param from - Source pointer of a move or copy operation
 * @param patch - Patch being applied, carried into the error detail
 * @param patchIndex - Position of the patch in the applied sequence
 * @throws {JsonPatchError} When any segment resolves through `__proto__` or `constructor.prototype`
 */
export const assertSafeFromPointer = (
  from: string,
  patch: Patch,
  patchIndex: number,
): void => {
  const segments = from.split('/');
  for (let i = 1, l = segments.length; i < l; i++) {
    const segment = unescapePath(segments[i]);
    if (!isPrototypeModification(segment, segments, i)) continue;
    throw new JsonPatchError(
      'SECURITY_PROTOTYPE_MODIFICATION_FORBIDDEN',
      'Reading through prototype properties (__proto__, constructor.prototype) is forbidden for security reasons',
      {
        patch,
        index: patchIndex,
        segment,
        path: segments.slice(0, i + 1).join('/'),
        operation: patch.op,
      },
    );
  }
};
