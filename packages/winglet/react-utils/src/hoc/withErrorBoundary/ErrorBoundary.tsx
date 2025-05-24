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

/**
 * 컴포넌트 렌더링 중 발생하는 JavaScript 에러를 감지하고 대체 UI를 표시하는 에러 경계 컴포넌트입니다.
 * @example
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  /**
   * 에러 발생 시 표시할 기본 fallback UI
   * @private
   */
  static #fallback = (<FallbackMessage />);

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  /**
   * 자식 컴포넌트에서 에러가 발생했을 때 호출되며, 새로운 상태를 반환합니다.
   * @param error - 발생한 에러 객체
   * @returns 업데이트된 상태 객체
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 자식 컴포넌트에서 에러가 발생한 후 호출되며, 로깅 등의 부수 효과를 수행할 수 있습니다.
   * @param error - 발생한 에러 객체
   * @param errorInfo - 에러 관련 추가 정보
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError)
      return this.props.fallback || ErrorBoundary.#fallback;
    return this.props.children;
  }
}
