import type { ComponentType, MemoExoticComponent } from 'react';

// 메모이제이션된 컴포넌트 체크
export const isMemoComponent = <Props extends object = any>(
  component: unknown,
): component is MemoExoticComponent<ComponentType<Props>> =>
  typeof component === 'object' &&
  component !== null &&
  (component as any).$$typeof === Symbol.for('react.memo');
