import { Fragment, ReactElement, isValidElement, useMemo } from 'react';

import { isPlainObject, isString } from 'es-toolkit';

import { isTruthy } from '@lumy/schema-form/helpers/filter';
import { useSnapshot } from '@lumy/schema-form/hooks/useSnapshot';

import { type FormReactNode, isListFrom } from '../type';
import { SchemaNodeAdapterRow } from './SchemaNodeAdapterRow';
import { getNodeName } from './helper';
import styles from './styles.module.css';
import type { RawChildNode, SchemaNodeAdapterProps } from './type';

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

  const childNodeGrid = useMemo<RawChildNode[][]>(() => {
    if (gridFrom && Array.isArray(gridFrom)) {
      let grid: FormReactNode[][];
      if (isListFrom(gridFrom)) {
        grid = [gridFrom];
      } else {
        grid = gridFrom.map((row) => {
          return (Array.isArray(row) ? row : [row]).map((element) => {
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
              const targetNode = node.findNode(name);
              if (!targetNode) return null;
              return { ...props, node: targetNode };
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

  return (
    <Fragment>
      {childNodeGrid.map((childNodeRow, index, grid) => {
        if (grid.length === 1) {
          return (
            <SchemaNodeAdapterRow
              key={`row-${index}-end`}
              node={node}
              watchValues={watchValues}
              overrideFormTypeInputProps={overrideFormTypeInputProps}
              PreferredFormTypeInput={PreferredFormTypeInput}
              rawChildNodes={childNodeRow}
            />
          );
        } else {
          return (
            <div key={`row-${index}-${grid.length}`} className={styles.row}>
              <SchemaNodeAdapterRow
                node={node}
                watchValues={watchValues}
                overrideFormTypeInputProps={overrideFormTypeInputProps}
                PreferredFormTypeInput={PreferredFormTypeInput}
                rawChildNodes={childNodeRow}
              />
            </div>
          );
        }
      })}
    </Fragment>
  );
};
