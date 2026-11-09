import type { ValidationIssue, Validator } from '@/schema-form/core';

/**
 * Build a validator whose next call can be held until the test releases it.
 * @param check - Synchronous issue computation for a form value.
 * @returns The validator factory, `hold()` to hold only the next call, `release()` to resolve
 *   every held call with its computed issues, and `heldCount()` to observe a held call.
 */
export const createHeldValidator = (
  check: (value: any) => ValidationIssue[],
) => {
  let holdNext = false;
  const held: (() => void)[] = [];
  const validatorFactory: Validator = {
    compile: () => (value: unknown) => {
      const issues = check(value);
      if (!holdNext) return issues;
      holdNext = false;
      return new Promise<ValidationIssue[]>((resolve) =>
        held.push(() => resolve(issues)),
      );
    },
    compileGuard: () => () => true,
  };
  return {
    validatorFactory,
    hold: () => {
      holdNext = true;
    },
    release: () => {
      while (held.length) held.shift()!();
    },
    heldCount: () => held.length,
  };
};
