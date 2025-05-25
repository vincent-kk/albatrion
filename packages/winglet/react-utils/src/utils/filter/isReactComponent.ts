import type { ComponentType } from 'react';

import { isClassComponent } from './isClassComponent';
import { isFunctionComponent } from './isFunctionComponent';
import { isMemoComponent } from './isMemoComponent';

/**
 * Comprehensively checks if an object is any type of React component.
 * Tests for functional components, memoized components, and class components.
 * @typeParam Props - The component props type
 * @typeParam Component - The component type
 * @param component - The object to check
 * @returns Whether the object is a React component
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
