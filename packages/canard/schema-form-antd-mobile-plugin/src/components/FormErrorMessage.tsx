import type { ErrorMessageRendererProps } from '@canard/schema-form';

/**
 * Own an inline root without changing the mobile message's inherited typography.
 * @param props - Explicit message content and root styling.
 * @returns The plugin error root, including an empty root when called without content.
 */
export const FormErrorMessage = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps) => (
  <span style={style} className={className}>
    {children}
  </span>
);
