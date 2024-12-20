import type { ComponentType } from 'react';

import { isClassComponent } from './isClassComponent';
import { isFunctionComponent } from './isFunctionComponent';
import { isMemoComponent } from './isMemoComponent';

// 통합 타입 체크 함수
export const isReactComponent = <Props extends object = any>(
  component: unknown,
): component is ComponentType<Props> =>
  isFunctionComponent<Props>(component) ||
  isMemoComponent<Props>(component) ||
  isClassComponent<Props>(component);
