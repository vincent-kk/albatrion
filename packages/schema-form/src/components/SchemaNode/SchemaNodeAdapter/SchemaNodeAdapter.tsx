import { ReactElement, isValidElement, useMemo } from 'react';

import { isPlainObject, isString } from 'es-toolkit';
import { isArray } from 'es-toolkit/compat';

import { isTruthy } from '@lumy/schema-form/helpers/filter';
import { useSnapshot } from '@lumy/schema-form/hooks/useSnapshot';

import { FormReactNode, isListFrom } from '../type';
import type { SchemaNodeAdapterProps } from './type';

export const SchemaNodeAdapter = ({
  node,
  watchValues,
  gridFrom,
  overridePropsFromProxy,
  overridePropsFromInput,
  PreferredFormTypeInput,
}: SchemaNodeAdapterProps) => {
  const overrideFormTypeInputProps = useSnapshot({
    ...overridePropsFromProxy,
    ...overridePropsFromInput,
  });

  const children = useMemo(() => {
    if (isArray(gridFrom)) {
      let grid: FormReactNode[][];
      if (isListFrom(gridFrom)) {
        grid = [gridFrom];
      } else {
        grid = gridFrom.map((row) => {
          return (isArray(row) ? row : [row]).map((element) => {
            if (isString(element)) {
              return { name: element };
            } else {
              return element;
            }
          });
        });
      }
      return grid.map((row) =>
        row
          .map((element) => {
            const [name, props] = getNodeName(element);
            if (name) {
              return { ...props, node: node.findNode(name) };
            }
            if (isValidElement(element)) {
              return {
                element,
              };
            }
            if (
              isPlainObject(element) &&
              'element' in element &&
              isValidElement(element.element)
            ) {
              return element as {
                element: ReactElement;
                grid?: number;
                [alt: string]: any;
              };
            }
            return null;
          })
          .filter(isTruthy),
      );
    } else {
      return [node.children];
    }
  }, [gridFrom, node]);

  return <div>SchemaNodeAdapter</div>;
};

const getNodeName = (
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
