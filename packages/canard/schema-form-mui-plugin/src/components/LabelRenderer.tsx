import type { MouseEvent, ReactElement } from 'react';

import { FormLabel as MuiFormLabel } from '@mui/material';

import type { LabelRendererProps } from '@canard/schema-form';

import { resolveFieldLabel } from '../utils/resolveFieldLabel';

/**
 * Focus the picker section group addressed by a field label.
 * @param event - A click on the label whose group receives keyboard focus.
 */
const focusPickerGroup = (event: MouseEvent<HTMLLabelElement>) => {
  const label = event.currentTarget;
  const target = label.ownerDocument.getElementById(label.htmlFor);
  if (
    target?.role === 'group' &&
    target.tabIndex >= 0 &&
    target.getAttribute('aria-disabled') !== 'true'
  )
    target.focus();
};

/**
 * Render the MUI label; its required prop owns the aria-hidden asterisk.
 * @param props - Explicit content, accessibility addresses, requirement and root styling.
 * @returns The plugin label root with an inaccessible required marker.
 */
export const LabelRenderer = ({
  children,
  name,
  jsonSchema,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps): ReactElement => (
  <MuiFormLabel
    htmlFor={htmlFor}
    onClick={focusPickerGroup}
    id={id}
    required={required}
    style={style}
    className={className}
  >
    {resolveFieldLabel(
      jsonSchema,
      name,
      children === name ? undefined : children,
    )}
  </MuiFormLabel>
);
