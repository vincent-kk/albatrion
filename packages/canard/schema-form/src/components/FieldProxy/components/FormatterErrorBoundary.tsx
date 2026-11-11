import type { ComponentProps, ComponentType } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import type {
  ErrorMessageRendererProps,
  FieldRendererProps,
  LabelRendererProps,
} from '@/schema-form/types';

interface Props extends ComponentProps<typeof ErrorBoundary> {
  formatError: FieldRendererProps['formatError'];
  /** Selected label identity used only to recover a failed boundary. */
  LabelRenderer?: ComponentType<LabelRendererProps>;
  /** Selected error identity used only to recover a failed boundary. */
  ErrorMessageRenderer?: ComponentType<ErrorMessageRendererProps>;
}

/** Retry a failed field when its formatter or registered part renderer changes. */
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
      (previousProps.formatError !== this.props.formatError ||
        previousProps.LabelRenderer !== this.props.LabelRenderer ||
        previousProps.ErrorMessageRenderer !== this.props.ErrorMessageRenderer)
    )
      this.setState({ hasError: false, error: undefined });
  }
}
