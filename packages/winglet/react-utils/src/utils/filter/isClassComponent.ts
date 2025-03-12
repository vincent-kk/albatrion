import type { ComponentClass } from 'react';

// 클래스 컴포넌트 체크
export const isClassComponent = <
  Props extends object = any,
  State = any,
  Component extends ComponentClass<Props, State> = ComponentClass<Props, State>,
>(
  component: unknown,
): component is Component =>
  !!(
    typeof component === 'function' &&
    component.prototype &&
    component.prototype.isReactComponent
  );
