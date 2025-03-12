import type { ComponentType, MemoExoticComponent } from 'react';

// 메모이제이션된 컴포넌트 체크
export const isMemoComponent = <
  Props extends object = any,
  Component extends MemoExoticComponent<
    ComponentType<Props>
  > = MemoExoticComponent<ComponentType<Props>>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'object' &&
  component !== null &&
  (component as any).$$typeof === Symbol.for('react.memo');
