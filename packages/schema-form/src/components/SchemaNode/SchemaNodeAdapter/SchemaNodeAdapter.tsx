import {
  Fragment,
  type ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { isPlainObject, isString, isTruthy } from '@lumy-pack/common';
import { isReactElement, useSnapshot } from '@lumy-pack/common-react';

import { MethodType } from '@lumy/schema-form/core';

import { type FormReactNode, isListFrom } from '../type';
import { SchemaNodeAdapterRow } from './SchemaNodeAdapterRow';
import { getNodeName } from './helper';
import styles from './styles.module.css';
import type { RawChildNode, SchemaNodeAdapterProps } from './type';

export const SchemaNodeAdapter = ({
  node,
  watchValues,
  readOnly,
  disabled,
  gridFrom,
  overridePropsFromProxy,
  overridePropsFromInput,
  PreferredFormTypeInput,
  NodeProxy,
}: SchemaNodeAdapterProps) => {
  const overrideFormTypeInputPropsSnapshot = useSnapshot({
    ...overridePropsFromProxy,
    ...overridePropsFromInput,
  });
  const watchValuesSnapshot = useSnapshot(watchValues);

  const [children, setChildren] = useState<typeof node.children>(node.children);

  useEffect(() => {
    const unsubscribe = node.subscribe(({ type }) => {
      if (type === MethodType.ChildrenChange) {
        setChildren(node.children);
      }
    });
    return () => unsubscribe();
  }, [node]);

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
            if (isReactElement(element)) {
              return {
                element,
              };
            }
            if (
              isPlainObject(element) &&
              'element' in element &&
              isReactElement(element.element)
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
      return [children];
    }
  }, [gridFrom, node, children]);

  useEffect(() => {
    console.log('gridFrom', gridFrom);
  }, [gridFrom]);
  useEffect(() => {
    console.log('children', children);
  }, [children]);
  useEffect(() => {
    console.log('watchValuesSnapshot', watchValuesSnapshot);
  }, [watchValuesSnapshot]);
  useEffect(() => {
    console.log('readOnly', readOnly);
  }, [readOnly]);
  useEffect(() => {
    console.log('disabled', disabled);
  }, [disabled]);
  useEffect(() => {
    console.log(
      'overrideFormTypeInputPropsSnapshot',
      overrideFormTypeInputPropsSnapshot,
    );
  }, [overrideFormTypeInputPropsSnapshot]);

  useEffect(() => {
    console.log('PreferredFormTypeInput', PreferredFormTypeInput);
  }, [PreferredFormTypeInput]);

  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <Fragment>
      {childNodeGrid.map((childNodeRow, index, grid) => {
        if (grid.length === 1) {
          return (
            <SchemaNodeAdapterRow
              key={`row-${index}-end`}
              node={node}
              readOnly={readOnly}
              disabled={disabled}
              watchValues={watchValuesSnapshot}
              rawChildNodes={childNodeRow}
              overrideFormTypeInputProps={overrideFormTypeInputPropsSnapshot}
              PreferredFormTypeInput={PreferredFormTypeInput}
              NodeProxy={NodeProxy}
            />
          );
        } else {
          return (
            <div key={`row-${index}-${grid.length}`} className={styles.row}>
              <SchemaNodeAdapterRow
                node={node}
                readOnly={readOnly}
                disabled={disabled}
                watchValues={watchValuesSnapshot}
                rawChildNodes={childNodeRow}
                overrideFormTypeInputProps={overrideFormTypeInputPropsSnapshot}
                PreferredFormTypeInput={PreferredFormTypeInput}
                NodeProxy={NodeProxy}
              />
            </div>
          );
        }
      })}
      <div>Adapter: {renderCount.current}</div>
    </Fragment>
  );
};
