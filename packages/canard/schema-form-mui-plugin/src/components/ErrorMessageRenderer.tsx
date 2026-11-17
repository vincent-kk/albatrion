import { FormHelperText } from '@mui/material';

import type { ErrorMessageRendererProps } from '@canard/schema-form';

/**
 * Render the MUI helper root with explicit content and caller styling.
 * @param props - Explicit message content and root styling.
 * @returns The plugin error root, including an empty root when called without content.
 */
export const ErrorMessageRenderer = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps) => (
  <FormHelperText error style={style} className={className}>
    {children}
  </FormHelperText>
);
