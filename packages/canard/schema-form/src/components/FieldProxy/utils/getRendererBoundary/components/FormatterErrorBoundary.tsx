import type { ComponentProps, ComponentType, ErrorInfo } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import type {
  ErrorMessageRendererProps,
  FieldRendererProps,
  InputRendererProps,
  LabelRendererProps,
} from '@/schema-form/types';

interface Props extends ComponentProps<typeof ErrorBoundary> {
  formatError: FieldRendererProps['formatError'];
  /** Selected label identity used only to recover a failed boundary. */
  LabelRenderer?: ComponentType<LabelRendererProps>;
  /** Selected error identity used only to recover a failed boundary. */
  ErrorMessageRenderer?: ComponentType<ErrorMessageRendererProps>;
  /** Selected input frame used only to recover a failed boundary. */
  InputRenderer?: ComponentType<InputRendererProps>;
}

/** Retry a failed field when its formatter or registered part renderer changes. */
export class FormatterErrorBoundary extends ErrorBoundary {
  declare readonly props: Props;

  /** A formatter change may retry one contiguous failure. */
  private hasRetriedFormatter = false;

  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate(
    previousProps: Props,
    previousState: Readonly<ErrorBoundary['state']>,
  ): void {
    if (!this.state.hasError) {
      this.hasRetriedFormatter = false;
      return;
    }
    if (!previousState.hasError) return;
    const partChanged =
      previousProps.LabelRenderer !== this.props.LabelRenderer ||
      previousProps.ErrorMessageRenderer !== this.props.ErrorMessageRenderer ||
      previousProps.InputRenderer !== this.props.InputRenderer;
    if (!partChanged) {
      if (
        this.hasRetriedFormatter ||
        previousProps.formatError === this.props.formatError
      )
        return;
      this.hasRetriedFormatter = true;
    } else this.hasRetriedFormatter = false;
    this.setState({ hasError: false, error: undefined });
  }

  /** Keep a failed formatter retry within the original reported failure. */
  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (!this.hasRetriedFormatter) super.componentDidCatch(error, info);
  }
}
