import type { ComponentType } from 'react';

import { isReactComponent } from '../filter';

export const removeNonComponentValue = <
  Input extends Record<string, unknown>,
  Output extends Record<string, ComponentType>,
>(
  dictionary: Input,
): Output =>
  Object.fromEntries(
    Object.entries(dictionary).filter(([, Component]) =>
      isReactComponent(Component),
    ),
  ) as Output;
