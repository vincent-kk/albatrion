import type { FieldNodeRecord } from '../../../record';
import { sameValueZero } from '../../../utils/compute/sameValueZero';

/**
 * Associate the verdict with the latest commit that still has its inputs.
 * @param root - Original request root after the publication lifetime check.
 * @param commit - Commit at the start of the validation run.
 * @param value - Emitted value captured at that commit.
 * @param context - Form context captured at that commit.
 * @returns The current commit, or undefined when a newer commit changed the inputs.
 */
export const readFieldNodeValidationCommit = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  commit: number,
  value: unknown,
  context: Self['runtime']['context'],
): number | undefined => {
  const current = root.runtime.commitNumber ?? 0;
  if (
    current === commit ||
    (sameValueZero(root.storedOutputValue, value) &&
      root.runtime.context === context)
  )
    return current;
  return undefined;
};
