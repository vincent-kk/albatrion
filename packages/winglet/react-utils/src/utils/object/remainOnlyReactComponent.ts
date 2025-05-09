import type { ComponentType } from 'react';

import type { Dictionary } from '@aileron/declare';

import { isReactComponent } from '../filter';

/**
 * 입력 객체에서 React 컴포넌트만 추출하여 새로운 객체를 만듭니다.
 * @typeParam Input - 입력 객체 타입
 * @typeParam Output - 출력 객체 타입
 * @param dictionary - React 컴포넌트를 포함한 객체
 * @returns React 컴포넌트만 포함한 새 객체
 * @example
 * const components = remainOnlyReactComponent({
 *   Button: ButtonComponent,
 *   Icon: IconComponent,
 *   helper: helperFunction, // 컴포넌트가 아니므로 제외됨
 * });
 * // 결과: { Button: ButtonComponent, Icon: IconComponent }
 */
export const remainOnlyReactComponent = <
  Input extends Record<string, unknown>,
  Output extends Record<string, ComponentType>,
>(
  dictionary: Input,
): Output => {
  const result: Dictionary<ComponentType> = {};
  for (const [key, value] of Object.entries(dictionary))
    if (isReactComponent(value)) result[key] = value;
  return result as Output;
};
