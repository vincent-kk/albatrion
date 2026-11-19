import type { ReactElement } from 'react';

import type { ErrorMessageRendererProps } from '@/schema-form/types';

/** Render explicit formatted content in the registered error root. */
export const ErrorMessageRenderer = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps): ReactElement<ErrorMessageRendererProps> => (
  <em style={style} className={className}>
    {children}
  </em>
);
