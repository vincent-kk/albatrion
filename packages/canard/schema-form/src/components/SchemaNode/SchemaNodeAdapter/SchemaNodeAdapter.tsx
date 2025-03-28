import { useEffect, useMemo, useRef, useState } from 'react';

import { EMPTY_ARRAY, isTruthy } from '@winglet/common-utils';
import { useMemorize, useSnapshot } from '@winglet/react-utils';

import { NodeEventType, isBranchNode } from '@/schema-form/core';
import type { ChildFormTypeInputProps } from '@/schema-form/types';

import { SchemaNodeAdapterInput } from './SchemaNodeAdapterInput';
import type {
  ChildComponent,
  NodeChildren,
  SchemaNodeAdapterProps,
} from './type';

export const SchemaNodeAdapter = ({
  node,
  readOnly,
  disabled,
  watchValues,
  overridableProps,
  PreferredFormTypeInput,
  NodeProxy,
}: SchemaNodeAdapterProps) => {
  const [children, setChildren] = useState<NodeChildren>(node.children);
  useEffect(() => {
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateChildren) setChildren(node.children);
    });
    return () => unsubscribe();
  }, [node]);

  const childComponentBySchemaNodeKey = useRef(
    new Map<string, ChildComponent>(),
  );
  const childNodes = useMemo(
    () =>
      isBranchNode(node)
        ? children
            .filter(({ node, isVirtualized }) => node && isVirtualized !== true)
            .map(({ node }) => {
              if (!node?.key) return null;
              const nodeKey = node.key;
              if (childComponentBySchemaNodeKey.current.has(nodeKey)) {
                return childComponentBySchemaNodeKey.current.get(nodeKey);
              }
              const ChildComponent = ({
                FormTypeRenderer: InputFormTypeRenderer,
                ...restProps
              }: ChildFormTypeInputProps) => {
                const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
                const overrideProps = useSnapshot(restProps);
                return (
                  <NodeProxy
                    node={node}
                    overridableFormTypeInputProps={overrideProps}
                    FormTypeRenderer={FormTypeRenderer}
                  />
                );
              };
              const Component: ChildComponent = Object.assign(ChildComponent, {
                key: nodeKey,
              });
              childComponentBySchemaNodeKey.current.set(nodeKey, Component);
              return Component;
            })
            .filter(isTruthy)
        : EMPTY_ARRAY,
    [NodeProxy, node, children],
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
