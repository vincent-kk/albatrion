import { type ComponentType, type ReactNode, createElement } from 'react';

import { isReactComponent, isReactElement } from '../filter';

type ReactComponent<P> = ReactNode | ComponentType<P>;

export const renderComponent = <P extends object>(
  Component: ReactComponent<P>,
  props?: P,
): ReactNode => {
  if (!Component) return null;
  else if (isReactElement(Component)) return Component;
  else if (isReactComponent(Component)) return createElement(Component, props);
  else return null;
};
