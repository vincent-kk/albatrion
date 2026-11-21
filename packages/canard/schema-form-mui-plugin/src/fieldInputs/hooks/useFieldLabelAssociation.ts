import { type ReactNode, useEffect, useLayoutEffect } from 'react';

import { observeFieldLabels } from './useFieldLabelAssociation/observeFieldLabels';

/** The composed title reads input markup after client layout. */
const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Associate both visible field labels regardless of the registered renderer.
 * @param inputId - Core address of the primary control.
 * @param labelId - Core address preserved by the external label renderer.
 * @param authoredLabel - Input label from schema presentation or explicit input props.
 */
export const useFieldLabelAssociation = (
  inputId: string | undefined,
  labelId: string | undefined,
  authoredLabel: ReactNode,
): void => {
  const hasAuthoredLabel = authoredLabel != null;
  useClientLayoutEffect(() => {
    if (!inputId || !labelId || !hasAuthoredLabel) return undefined;
    const control = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    return control && label && !label.hidden
      ? observeFieldLabels(control, label)
      : undefined;
  }, [hasAuthoredLabel, inputId, labelId]);
};
