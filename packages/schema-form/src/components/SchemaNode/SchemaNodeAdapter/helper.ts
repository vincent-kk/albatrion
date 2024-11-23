import type { CSSProperties } from 'react';

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

const COLUMN_12_GRID_SYSTEM = 100 / 12;

export const getGridStyleProps = (grid?: number): CSSProperties => {
  if (typeof grid === 'number') {
    return {
      display: 'block',
      flexGrow: 1,
      flexShrink: 0,
      flexBasis: `${COLUMN_12_GRID_SYSTEM * grid}%`,
      width: `${COLUMN_12_GRID_SYSTEM * grid}%`,
    };
  } else {
    return {
      display: 'block',
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '100%',
    };
  }
};
