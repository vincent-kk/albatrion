import { useEffect, useLayoutEffect } from 'react';

import { observeFieldLabels } from './useFieldLabelAssociation/observeFieldLabels';

/** The name uses connected input markup, which is available after client layout. */
const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Associate the field labels connected to the core addresses.
 * @param inputId - Core address of the primary control.
 * @param labelId - Core address preserved by the external label renderer.
 */
export const useFieldLabelAssociation = (
  inputId: string | undefined,
  labelId: string | undefined,
): void => {
  useClientLayoutEffect(() => {
    if (!inputId || !labelId) return undefined;
    const control = document.getElementById(inputId);
    return control ? observeFieldLabels(control, labelId) : undefined;
  }, [inputId, labelId]);
};
