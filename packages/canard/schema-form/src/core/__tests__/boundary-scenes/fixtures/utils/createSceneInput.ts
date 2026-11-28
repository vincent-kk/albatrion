import { isObject } from '@winglet/common-utils/filter';

import type { SceneStep } from '../types';
import { readPointerOwner } from './readPointerOwner';

/** The step kind whose value becomes a caller input. */
type SetStep = Extract<SceneStep, { set: string }>;

/**
 * Build the caller input of a `set` step.
 * @param step - The step; `hidden` keys become non-enumerable own keys of the top object, and `throwAt` (a JSON
 *   Pointer inside the value) becomes a getter that throws when the engine reads it
 * @returns A fresh copy of the step value, so every run receives its own input
 */
export const createSceneInput = (step: SetStep): unknown => {
  const input: unknown = structuredClone(step.value);
  if (step.hidden && isObject(input))
    for (const [key, value] of Object.entries(step.hidden))
      Object.defineProperty(input, key, { value, enumerable: false });
  if (step.throwAt) defineThrowingGetter(input, step.throwAt);
  return input;
};

/** Replace the value at `pointer` inside `input` with a getter that throws when read. */
const defineThrowingGetter = (input: unknown, pointer: string): void => {
  const { owner, key } = readPointerOwner(input, pointer);
  if (!isObject(owner)) throw new Error(`no object holds ${pointer}`);
  Object.defineProperty(owner, key, {
    enumerable: true,
    get: () => {
      throw new Error('getter threw');
    },
  });
};
