import type { FieldRendererProps } from '@/schema-form/types';

/** Keep an explicit standalone error root even when the formatted message is empty. */
export const ErrorMessagePartRenderer = ({
  ErrorMessage,
  errorMessage,
  context,
  style,
  className,
}: FieldRendererProps) => (
  <ErrorMessage context={context} style={style} className={className}>
    {errorMessage}
  </ErrorMessage>
);
