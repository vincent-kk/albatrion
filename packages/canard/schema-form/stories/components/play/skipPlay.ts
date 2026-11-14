import type { ReactRenderer } from '@storybook/react-vite';
import type { StepFunction } from 'storybook/internal/types';

/**
 * Record one visible Interactions step for a play that cannot run in this window.
 * @param step - The current play context's Interactions step recorder.
 * @param reason - The environment limitation, manual check, and Browser Mode command.
 * @returns Completion after the single skip step, without running assertions or actions.
 */
export async function skipPlay(step: StepFunction<ReactRenderer>, reason: string): Promise<void> {
  await step(`Skipped: ${reason}`, () => undefined);
}
