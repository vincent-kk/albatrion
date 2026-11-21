import type { ReactNode } from 'react';

import type { MuiContext } from '../../../type';

/**
 * Resolve the input's visible caption and MUI presentation.
 * @param label - Explicit caption, falling back to the field name.
 * @param name - Core field name.
 * @param hideLabel - Suppress the input's inline caption.
 * @param props - Input-level MUI options.
 * @param context - Form-level MUI defaults.
 * @returns The caption, size, variant and full-width setting.
 */
export const getMuiFieldPresentation = (
  label: ReactNode,
  name: string,
  hideLabel: boolean | undefined,
  props: MuiContext,
  context: MuiContext,
) =>
  [
    hideLabel ? undefined : label || name,
    props.size || context.size,
    props.variant || context.variant,
    props.fullWidth ?? context.fullWidth,
  ] as const;
