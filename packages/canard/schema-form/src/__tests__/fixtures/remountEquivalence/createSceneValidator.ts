import type { Validator } from '@/schema-form/core';

import { createRenderValidator } from '../../helpers/createRenderValidator';
import type { RemountScene } from './types';

/**
 * Select the existing validator matching the authored tuple dialect.
 * @param scene - Authored data; legacy array-valued items requires Draft 7.
 * @returns A fresh root-local validator for each independent U or F mount.
 */
export function createSceneValidator(scene: RemountScene): Validator {
  const pending: unknown[] = [scene.schema];
  while (pending.length) {
    const value = pending.pop();
    if (!value || typeof value !== 'object') continue;
    if (Array.isArray(Reflect.get(value, 'items')))
      return createRenderValidator('draft7');
    pending.push(
      ...Object.values(value).filter(
        (child) => child && typeof child === 'object',
      ),
    );
  }
  return createRenderValidator();
}
