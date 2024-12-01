import type { ComponentClass } from 'react';

// 클래스 컴포넌트 체크
export const isClassComponent = <Props, State = any>(
  component: unknown,
): component is ComponentClass<Props, State> =>
  !!(
    typeof component === 'function' &&
    component.prototype &&
    component.prototype.isReactComponent
  );
