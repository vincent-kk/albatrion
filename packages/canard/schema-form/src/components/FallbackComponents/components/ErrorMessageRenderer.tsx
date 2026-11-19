import type { ComponentProps, ReactElement } from 'react';

import type { ErrorMessageRendererProps } from '@/schema-form/types';

/** Render explicit formatted content in the registered error root. */
export const ErrorMessageRenderer = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps): ReactElement<ComponentProps<'em'>> => (
  <em style={style} className={className}>
    {children}
  </em>
);
