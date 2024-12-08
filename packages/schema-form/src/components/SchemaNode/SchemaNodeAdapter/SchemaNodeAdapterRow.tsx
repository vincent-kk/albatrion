import { useMemo, useRef } from 'react';

import { isTruthy } from '@lumy-pack/common';

import { isBranchNode } from '@/schema-form/core';
import type { ChildFormTypeInputProps } from '@/schema-form/types';

import { SchemaNodeAdapterInput } from './SchemaNodeAdapterInput';
import type { ChildComponent, SchemaNodeAdapterRowProps } from './type';

export const SchemaNodeAdapterRow = ({
  node,
  readOnly,
  disabled,
  watchValues,
  rawChildNodes,
  overridableProps,
  PreferredFormTypeInput,
  NodeProxy,
}: SchemaNodeAdapterRowProps) => {
  const childComponentBySchemaNodeKey = useRef(
    new Map<string, ChildComponent>(),
  );

  const childNodes = useMemo(
    () =>
      isBranchNode(node)
        ? rawChildNodes
            .filter(({ node, isVirtualized }) => node && isVirtualized !== true)
            .map(({ node }) => {
              if (!node?.key) return null;
              const nodeKey = node.key;
              if (childComponentBySchemaNodeKey.current.has(nodeKey)) {
                return childComponentBySchemaNodeKey.current.get(nodeKey);
              }
              const ChildComponent = ({
                FormTypeRenderer,
                ...overridableFormTypeInputProps
              }: ChildFormTypeInputProps) => (
                <NodeProxy
                  node={node}
                  overridableFormTypeInputProps={overridableFormTypeInputProps}
                  FormTypeRenderer={FormTypeRenderer}
                />
              );
              const Component: ChildComponent = Object.assign(ChildComponent, {
                key: nodeKey,
              });
              childComponentBySchemaNodeKey.current.set(nodeKey, Component);
              return Component;
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
      overridableProps={overridableProps}
      PreferredFormTypeInput={PreferredFormTypeInput}
      childNodes={childNodes}
    />
  );
};
