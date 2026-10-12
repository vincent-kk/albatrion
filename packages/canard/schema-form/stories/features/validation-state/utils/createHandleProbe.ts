import { expect, fn, waitFor } from 'storybook/test';

import type { FormHandle } from '../../../../src';

/** A per-story spy that captures mounted handles for consumer-only play steps. */
export interface HandleProbe {
  /** Passed as FeatureStory's onHandle arg. */
  readonly onHandle: (handle: FormHandle, element: HTMLElement) => void;
  /**
   * Resolve the handle mounted inside this canvas; handles from earlier visits to the story are skipped.
   * @param canvas - The play's canvasElement.
   * @returns The latest handle whose registration element is connected inside the canvas.
   */
  readonly handle: (canvas: HTMLElement) => Promise<FormHandle>;
}

/**
 * Create a handle probe for one story; each story needs its own so handles never cross stories.
 * @returns The callback for the story args and an accessor for its play.
 * @throws From handle() when no form mounts inside the canvas within the waitFor timeout.
 */
export function createHandleProbe(): HandleProbe {
  const onHandle = fn<(handle: FormHandle, element: HTMLElement) => void>();
  const current = (canvas: HTMLElement) => {
    const calls = onHandle.mock.calls;
    for (let index = calls.length - 1; index >= 0; index--) {
      const [handle, element] = calls[index];
      if (element.isConnected && canvas.contains(element)) return handle;
    }
    return undefined;
  };
  return {
    onHandle,
    async handle(canvas) {
      await waitFor(() => expect(current(canvas), 'handle mounted in this canvas').toBeDefined());
      return current(canvas)!;
    },
  };
}
