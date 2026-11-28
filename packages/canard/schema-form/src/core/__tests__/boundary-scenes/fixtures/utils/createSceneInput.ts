import { isObject } from '@winglet/common-utils/filter';

import type { SceneStep } from '../types';

/** The step kind whose value becomes a caller input. */
type SetStep = Extract<SceneStep, { set: string }>;

/**
 * Build the caller input of a `set` step.
 * @param step - The step; `hidden` keys become non-enumerable own keys of the top object
 * @returns A fresh copy of the step value, so every run receives its own input
 */
export const createSceneInput = (step: SetStep): unknown => {
  const input: unknown = structuredClone(step.value);
  if (step.hidden && isObject(input))
    for (const [key, value] of Object.entries(step.hidden))
      Object.defineProperty(input, key, { value, enumerable: false });
  return input;
};
