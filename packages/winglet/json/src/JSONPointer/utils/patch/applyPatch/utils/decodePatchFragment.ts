import type { Patch } from '../../../patchModel';
import { decodePointerFragment } from '../../../decodePointerFragment';
import { JSONPatchError } from './error';

/**
 * Decodes a URI fragment to a plain pointer before patch location comparisons.
 * @param pointer - Pointer beginning with the fragment marker
 * @param patch - Original operation retained in structured errors
 * @param index - Operation position retained in structured errors
 * @returns A plain pointer whose percent escapes are decoded once
 * @throws JSONPatchError for malformed escapes or a non-pointer fragment body
 */
export const decodePatchFragment = (
  pointer: string,
  patch: Patch,
  index: number,
): string => {
  let decoded: string;
  try {
    decoded = decodePointerFragment(pointer).slice(1);
  } catch {
    throw new JSONPatchError(
      'PATCH_PATH_INVALID',
      'Patch pointer fragment contains an invalid percent escape.',
      { patch, index, pointer },
    );
  }
  if (decoded !== '' && decoded[0] !== '/')
    throw new JSONPatchError(
      'PATCH_PATH_INVALID',
      'Patch pointer fragment must contain an empty or slash-prefixed pointer.',
      { patch, index, pointer },
    );
  return decoded;
};
