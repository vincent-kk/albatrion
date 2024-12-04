import {
  type PropsWithChildren,
  type ReactElement,
  memo,
  useMemo,
  useRef,
} from 'react';

import { isTruthy } from '@lumy-pack/common';

import { isBranchNode } from '@lumy/schema-form/core';
import type { ChildFormTypeInputProps } from '@lumy/schema-form/types';

import { SchemaNodeAdapterInput } from './SchemaNodeAdapterInput';
import { getGridStyleProps } from './helper';
import styles from './styles.module.css';
import type { ChildComponent, SchemaNodeAdapterRowProps } from './type';

export const SchemaNodeAdapterRow = ({
  node,
  readOnly,
  disabled,
  watchValues,
  rawChildNodes,
  overrideFormTypeInputProps,
  PreferredFormTypeInput,
  NodeProxy,
}: SchemaNodeAdapterRowProps) => {
  const childComponentBySchemaNodeKey = useRef(
    new Map<string, ChildComponent>(),
  );
  const childComponentByElementRef = useRef(
    new WeakMap<ReactElement, ChildComponent>(),
  );

  const sequence = useRef(0);

  const childNodes = useMemo(
    () =>
      isBranchNode(node)
        ? rawChildNodes
            .filter(
              ({ node, isVirtualized, element }) =>
                (node && isVirtualized !== true) || !!element,
            )
            .map(({ node, element, grid }) => {
              if (element) {
                if (childComponentByElementRef.current.has(element)) {
                  return childComponentByElementRef.current.get(element);
                }
                const Component: ChildComponent = () => {
                  return <div style={getGridStyleProps(grid)}>{element}</div>;
                };
                Component.key = `element_${sequence.current++}`;
                childComponentByElementRef.current.set(element, Component);
                return Component;
              }
              if (node) {
                const nodeKey = node.key;
                if (!nodeKey) return null;
                if (childComponentBySchemaNodeKey.current.has(nodeKey)) {
                  return childComponentBySchemaNodeKey.current.get(nodeKey);
                }
                const Wrapper = ({ children }: PropsWithChildren) => {
                  return (
                    <div
                      style={getGridStyleProps(grid)}
                      className={styles.column}
                    >
                      {children}
                    </div>
                  );
                };
                const ChildComponent = ({
                  FormTypeRenderer,
                  ...overridableFormTypeInputProps
                }: ChildFormTypeInputProps) => (
                  <NodeProxy
                    node={node}
                    overridableFormTypeInputProps={
                      overridableFormTypeInputProps
                    }
                    FormTypeRenderer={FormTypeRenderer}
                    Wrapper={Wrapper}
                  />
                );
                const Component: ChildComponent = Object.assign(
                  memo(ChildComponent),
                  { key: nodeKey },
                );
                childComponentBySchemaNodeKey.current.set(nodeKey, Component);
                return Component;
              }
              return null;
            })
            .filter(isTruthy)
        : [],
    [NodeProxy, node, rawChildNodes],
  );

  return (
    <SchemaNodeAdapterInput
      node={node}
      readOnly={readOnly}
      disabled={disabled}
      watchValues={watchValues}
      overrideFormTypeInputProps={overrideFormTypeInputProps}
      PreferredFormTypeInput={PreferredFormTypeInput}
      childNodes={childNodes}
    />
  );
};
