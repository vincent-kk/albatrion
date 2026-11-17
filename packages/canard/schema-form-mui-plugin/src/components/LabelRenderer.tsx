import { FormLabel as MuiFormLabel } from '@mui/material';

import type { LabelRendererProps } from '@canard/schema-form';

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
}: LabelRendererProps) => (
  <MuiFormLabel
    htmlFor={htmlFor}
    id={id}
    required={required}
    style={style}
    className={className}
  >
    {children}
  </MuiFormLabel>
);
