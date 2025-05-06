import { memo, useMemo, useRef, useState } from 'react';

import {
  useMemorize,
  useOnUnmount,
  useRestProperties,
} from '@winglet/react-utils';

import { NodeEventType, isTerminalNode } from '@/schema-form/core';
import { useSchemaNodeSubscribe } from '@/schema-form/hooks/useSchemaNodeSubscribe';
import type { ChildFormTypeInputProps } from '@/schema-form/types';

import { SchemaNodeAdapterInput } from './SchemaNodeAdapterInput';
import type {
  ChildComponent,
  NodeChildren,
  SchemaNodeAdapterProps,
} from './type';

export const SchemaNodeAdapter = memo(
  ({
    node,
    overrideProps,
    PreferredFormTypeInput,
    NodeProxy,
  }: SchemaNodeAdapterProps) => {
    const [children, setChildren] = useState<NodeChildren>(node.children);
    const childComponentBySchemaNodeKey = useRef(
      new Map<string, ChildComponent>(),
    );
    useSchemaNodeSubscribe(node, ({ type }) => {
      if (type & NodeEventType.UpdateChildren) setChildren(node.children);
    });
    useOnUnmount(() => {
      childComponentBySchemaNodeKey.current.clear();
    });
    const childNodes = useMemo(() => {
      if (isTerminalNode(node)) return [];
      const childNodes = [] as ChildComponent[];
      for (const { node, isVirtualized, index } of children) {
        if (!node?.key || isVirtualized === true) continue;
        const key = index ? `${node.key}-${index}` : node.key;
        const CachedComponent = childComponentBySchemaNodeKey.current.get(key);
        if (CachedComponent) childNodes.push(CachedComponent);
        else {
          const ChildComponent = ({
            FormTypeRenderer: InputFormTypeRenderer,
            ...restProps
          }: ChildFormTypeInputProps) => {
            const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
            const overrideProps = useRestProperties(restProps);
            return (
              <NodeProxy
                node={node}
                FormTypeRenderer={FormTypeRenderer}
                overrideProps={overrideProps}
              />
            );
          };
          ChildComponent.key = key;
          childComponentBySchemaNodeKey.current.set(key, ChildComponent);
          childNodes.push(ChildComponent);
        }
      }
      return childNodes;
    }, [NodeProxy, node, children]);

    return (
      <SchemaNodeAdapterInput
        node={node}
        overrideProps={overrideProps}
        PreferredFormTypeInput={PreferredFormTypeInput}
        childNodes={childNodes}
      />
    );
  },
);
