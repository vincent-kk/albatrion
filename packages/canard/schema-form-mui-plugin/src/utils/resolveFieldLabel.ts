import type { ReactNode } from 'react';

import { isPlainObject } from '@winglet/common-utils/filter';

import type { FieldRendererProps } from '@canard/schema-form';

import { readLabel } from './resolveFieldLabel/readLabel';

/**
 * Use the author's field label for both visible and hidden title elements.
 * @param schema - Current field schema, including optional presentation labels.
 * @param name - Field key or array index used as a fallback.
 * @param label - Explicit label content for the current renderer or input.
 * @param mode - Whether a renderer label, input label, or hidden fallback supplies the title.
 * @returns Content referenced by the field's accessible name.
 */
export const resolveFieldLabel = (
  schema: FieldRendererProps['jsonSchema'],
  name: string,
  label?: ReactNode,
  mode: 'visible' | 'input' | 'hidden' = 'visible',
): ReactNode => {
  const explicit = readLabel(label);
  if (explicit || explicit === 0) return explicit;
  if (typeof schema !== 'object' || schema === null) return name;
  const presentation = isPlainObject(schema.presentation)
    ? schema.presentation
    : undefined;
  const renderer = presentation?.FieldRendererProps;
  const input = presentation?.FieldInputProps;
  const title = readLabel(
    typeof schema.title === 'string' ? schema.title : undefined,
  );
  const ariaLabel =
    isPlainObject(schema.options) &&
    typeof schema.options['aria-label'] === 'string'
      ? readLabel(schema.options['aria-label'])
      : undefined;
  if (
    mode === 'hidden' ||
    (mode === 'input' && isPlainObject(input) && input.hideLabel === true)
  )
    return ariaLabel ?? title ?? name;
  const rendererLabel = readLabel(
    isPlainObject(renderer) ? renderer.label : undefined,
  );
  const inputLabel = readLabel(
    isPlainObject(input) && input.hideLabel !== true ? input.label : undefined,
  );
  const authoredLabel =
    mode === 'input'
      ? (inputLabel ?? rendererLabel)
      : (rendererLabel ?? inputLabel);
  return authoredLabel ?? title ?? ariaLabel ?? name;
};
