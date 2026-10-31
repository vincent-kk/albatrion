import { act } from '@testing-library/react';

/**
 * Drain frame-backed validation and its synchronous-validator delivery in jsdom.
 * @returns Completion after two animation frames and the following Node check phase.
 * Real-timer validators must additionally await their own completion.
 */
export const settleValidation = async (): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setImmediate(resolve)),
      );
    });
  });
};
