import { useEffect, useLayoutEffect, useState } from 'react';

import { observeLabelAddress } from './useNativeFieldName/observeLabelAddress';
import { readNativeLabelSource } from './useNativeFieldName/readNativeLabelSource';

/** Connected labels are resolved after the client commit. */
const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Let native label associations take precedence over the authored fallback.
 * @param inputId - Address of the control that carries the returned props.
 * @param labelId - Address of the renderer title.
 * @param fallback - Name used before a title is present.
 * @returns Props that preserve multiple native labels and name an otherwise unlabeled control.
 */
export const useNativeFieldName = (
  inputId: string,
  labelId: string,
  fallback: string | undefined,
): { 'aria-labelledby'?: string; 'aria-label'?: string } => {
  const [references, setReferences] = useState<string>();
  const [caption, setCaption] = useState<string>();
  useClientLayoutEffect(() => {
    const update = () => {
      const source = readNativeLabelSource(
        document.getElementById(inputId),
        document.getElementById(labelId),
      );
      setReferences(source.references);
      setCaption(source.caption);
    };
    const unsubscribeControl = observeLabelAddress(document, inputId, update);
    const unsubscribeLabel = observeLabelAddress(document, labelId, update);
    update();
    return () => {
      unsubscribeControl();
      unsubscribeLabel();
    };
  }, [inputId, labelId]);
  return { 'aria-labelledby': references, 'aria-label': caption ?? fallback };
};
