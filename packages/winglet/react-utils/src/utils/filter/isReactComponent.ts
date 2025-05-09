import type { ComponentType } from 'react';

import { isClassComponent } from './isClassComponent';
import { isFunctionComponent } from './isFunctionComponent';
import { isMemoComponent } from './isMemoComponent';

/**
 * 객체가 어떤 형태의 React 컴포넌트인지 통합적으로 검사합니다.
 * 함수형 컴포넌트, 메모이제이션된 컴포넌트, 클래스 컴포넌트를 모두 검사합니다.
 * @typeParam Props - 컴포넌트 프로퍼티 타입
 * @typeParam Component - 컴포넌트 타입
 * @param component - 검사할 대상
 * @returns React 컴포넌트인지 여부
 */
export const isReactComponent = <
  Props extends object = any,
  Component extends ComponentType<Props> = ComponentType<Props>,
>(
  component: unknown,
): component is Component =>
  isFunctionComponent<Props>(component) ||
  isMemoComponent<Props>(component) ||
  isClassComponent<Props>(component);
