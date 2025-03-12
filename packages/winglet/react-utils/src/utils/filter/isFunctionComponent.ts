import type { FC } from 'react';

// 함수형 컴포넌트 체크
export const isFunctionComponent = <
  Props extends object = any,
  Component extends FC<Props> = FC<Props>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'function' &&
  !(component.prototype && component.prototype.isReactComponent);
