import { memo, useMemo, useRef, useState } from 'react';

import { useMemorize, useSnapshot } from '@winglet/react-utils';

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
    overridableProps,
    PreferredFormTypeInput,
    NodeProxy,
  }: SchemaNodeAdapterProps) => {
    const [children, setChildren] = useState<NodeChildren>(node.children);
    useSchemaNodeSubscribe(node, ({ type }) => {
      if (type & NodeEventType.UpdateChildren) setChildren(node.children);
    });
    const childComponentBySchemaNodeKey = useRef(
      new Map<string, ChildComponent>(),
    );
    const childNodes = useMemo(() => {
      if (isTerminalNode(node)) return [];
      const childNodes = [] as ChildComponent[];
      for (const { node, isVirtualized } of children) {
        if (!node?.key || isVirtualized === true) continue;
        const key = node.key;
        const CachedComponent = childComponentBySchemaNodeKey.current.get(key);
        if (CachedComponent) childNodes.push(CachedComponent);
        else {
          const ChildComponent = ({
            FormTypeRenderer: InputFormTypeRenderer,
            ...restProps
          }: ChildFormTypeInputProps) => {
            const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
            const overrideProps = useSnapshot(restProps);
            return (
              <NodeProxy
                node={node}
                FormTypeRenderer={FormTypeRenderer}
                overridableFormTypeInputProps={overrideProps}
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
        overridableProps={overridableProps}
        PreferredFormTypeInput={PreferredFormTypeInput}
        childNodes={childNodes}
      />
    );
  },
);
