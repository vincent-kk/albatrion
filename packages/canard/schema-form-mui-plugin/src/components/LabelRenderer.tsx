import type { MouseEvent, ReactElement } from 'react';

import { FormLabel as MuiFormLabel } from '@mui/material';

import type { LabelRendererProps } from '@canard/schema-form';

/**
 * Focus a picker editor that the native label cannot activate.
 * @param event - Click on the label addressing the editor.
 */
const focusPickerEditor = ({ currentTarget }: MouseEvent<HTMLLabelElement>) => {
  const editor = currentTarget.ownerDocument.getElementById(
    currentTarget.htmlFor,
  );
  if (
    editor?.role === 'group' &&
    editor.tabIndex >= 0 &&
    editor.getAttribute('aria-disabled') !== 'true'
  )
    editor.focus();
};

/**
 * Render the MUI label; its required prop owns the aria-hidden asterisk.
 * @param props - Explicit content, accessibility addresses, requirement and root styling.
 * @returns The plugin label root with an inaccessible required marker.
 */
export const LabelRenderer = ({
  children,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps): ReactElement => (
  <MuiFormLabel
    htmlFor={htmlFor}
    onClick={focusPickerEditor}
    id={id}
    required={required}
    style={style}
    className={className}
  >
    {children}
  </MuiFormLabel>
);
