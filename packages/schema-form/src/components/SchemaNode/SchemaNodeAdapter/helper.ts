
import { isPlainObject, isString } from 'es-toolkit';

import type { FormReactNode } from '../type';

export const getNodeName = (
  element: FormReactNode,
): [
  string?,
  {
    grid?: number;
    [alt: string]: any;
  }?,
] => {
  if (isString(element)) {
    return [element, {}];
  } else if (
    isPlainObject(element) &&
    'name' in element &&
    isString(element.name)
  ) {
    const { name, ...rest } = element;
    return [name, rest];
  }
  return [];
};

