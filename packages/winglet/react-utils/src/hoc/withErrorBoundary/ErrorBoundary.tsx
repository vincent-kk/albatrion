import { Component, type ErrorInfo, type ReactNode } from 'react';

import { FallbackMessage } from './FallbackMessage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/** Default fallback UI to display when an error occurs */
const FALLBACK = <FallbackMessage />;

/**
 * Error boundary component that catches JavaScript errors during component rendering and displays fallback UI.
 * Prevents the entire application from crashing when errors occur in child components.
 * @example
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  /**
   * Called when an error occurs in a child component and returns the new state.
   * @param error - The error object that was thrown
   * @returns The updated state object
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Called after an error occurs in a child component, allowing for side effects like logging.
   * @param error - The error object that was thrown
   * @param errorInfo - Additional information about the error
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback || FALLBACK;
    return this.props.children;
  }
}
