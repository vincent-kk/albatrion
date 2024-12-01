import type { FC } from 'react';

// 함수형 컴포넌트 체크
export const isFunctionComponent = <Props>(
  component: unknown,
): component is FC<Props> =>
  typeof component === 'function' &&
  !(component.prototype && component.prototype.isReactComponent);
