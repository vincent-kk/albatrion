import type { ComponentProps } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import type { FieldRendererProps } from '@/schema-form/types';

interface Props extends ComponentProps<typeof ErrorBoundary> {
  formatError: FieldRendererProps['formatError'];
}

/** Retry only a previously failed renderer when its configured formatter changes. */
export class FormatterErrorBoundary extends ErrorBoundary {
  declare readonly props: Props;

  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate(
    previousProps: Props,
    previousState: Readonly<ErrorBoundary['state']>,
  ): void {
    if (
      previousState.hasError &&
      previousProps.formatError !== this.props.formatError
    )
      this.setState({ hasError: false, error: undefined });
  }
}
