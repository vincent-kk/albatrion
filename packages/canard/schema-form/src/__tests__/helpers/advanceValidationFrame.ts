import { act } from '@testing-library/react';

/** Advance two rendering opportunities and the following macrotask without awaiting a held verdict.
 * @returns Completion after frame-backed work had an opportunity to start. */
export const advanceValidationFrame = async (): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setImmediate(resolve)),
      ),
    );
  });
};
