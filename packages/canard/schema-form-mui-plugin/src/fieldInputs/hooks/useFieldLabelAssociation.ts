import { useEffect, useLayoutEffect, useState } from 'react';

import type { FieldRendererProps } from '@canard/schema-form';

import { useFieldNameFallback } from '../../utils/useFieldNameFallback';
import { observeFieldLabels } from './useFieldLabelAssociation/observeFieldLabels';

/** The composed captions are available after client layout. */
const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Keep the direct name available while the stable external reference is absent.
 * @param inputId - Core address carried by the current primary control.
 * @param labelId - Core address preserved by the external label renderer.
 * @param schema - Current schema, with optional spoken fallback and title.
 * @param name - Core field name.
 * @returns Name to pass to the library's control props.
 */
export const useFieldLabelAssociation = (
  inputId: string,
  labelId: string,
  schema: FieldRendererProps['jsonSchema'],
  name: string,
): string | undefined => {
  const [caption, setCaption] = useState<string>();
  useClientLayoutEffect(
    () => observeFieldLabels(document, inputId, labelId, setCaption),
    [inputId, labelId],
  );
  const fallback = useFieldNameFallback(schema, name);
  return caption ?? fallback;
};
