import { ShowError } from '@/schema-form/types';

/**
 * Decide whether a resolved error display policy turns error display off, as the renderer reads it.
 * @param policy - The Form's `showError` state, else the FormProvider's `showError`; `undefined`
 *   stands for the renderer default, which is not off.
 * @returns True for `false`, or for a number carrying `ShowError.Never` without `ShowError.Always`.
 */
export const isShowErrorDisabled = (policy: unknown): boolean =>
  policy === false ||
  (typeof policy === 'number' &&
    (policy & ShowError.Never) !== 0 &&
    (policy & ShowError.Always) === 0);
