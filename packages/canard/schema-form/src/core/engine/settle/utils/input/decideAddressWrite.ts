import type { BlueprintNode } from '../../../blueprint';
import { isPlain } from './isPlain';

/**
 * Decide whether a write keeps the unnamed children of its storage address.
 * @param template - Selected or declared storage boundary, absent for an extra key
 * @param input - Original input at the boundary
 * @param merge - Whether the caller permits named-key writes
 * @returns True when only the object's own keys are written
 */
export const decideAddressWrite = (
  template: BlueprintNode | undefined,
  input: unknown,
  merge: boolean,
): input is Record<string, unknown> =>
  merge &&
  template?.kind === 'object' &&
  template.strategy === 'branch' &&
  isPlain(input);
