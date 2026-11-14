import type { ComponentType } from 'react';

import type {
  ErrorVisibility,
  FieldRendererProps,
  FormProps,
} from '@canard/schema-form';

/**
 * Select the measured build's display API without passing legacy props to the candidate.
 * @param module - Namespace from the build selected by prepareCoreBundles.
 * @param Renderer - Marker renderer shared by candidate and the 0.x baseline.
 * @returns Props for the current API, or the isolated 0.x baseline adapter.
 */
export function createCoreFormProps(
  module: { ErrorVisibility?: typeof ErrorVisibility },
  Renderer: ComponentType<FieldRendererProps>,
): Pick<FormProps, 'FieldRenderer' | 'errorVisibility'> &
  Record<string, unknown> {
  if (module.ErrorVisibility)
    return {
      FieldRenderer: Renderer,
      errorVisibility: module.ErrorVisibility.Always,
    };
  // The 0.x protocol key is assembled only in this baseline adapter.
  return {
    FieldRenderer: Renderer,
    CustomFormTypeRenderer: Renderer,
    ['show' + 'Error']: true,
  };
}
