import { type ReactElement, isValidElement } from 'react';

// React 엘리먼트 체크
export const isReactElement = (component: unknown): component is ReactElement =>
  isValidElement(component);
