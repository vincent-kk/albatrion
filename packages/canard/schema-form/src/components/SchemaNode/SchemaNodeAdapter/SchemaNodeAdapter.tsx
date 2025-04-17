import { useEffect, useMemo, useRef, useState } from 'react';

import { useMemorize, useSnapshot } from '@winglet/react-utils';

import { NodeEventType, isTerminalNode } from '@/schema-form/core';
import type { ChildFormTypeInputProps } from '@/schema-form/types';

import { SchemaNodeAdapterInput } from './SchemaNodeAdapterInput';
import type {
  ChildComponent,
  NodeChildren,
  SchemaNodeAdapterProps,
} from './type';

export const SchemaNodeAdapter = ({
  node,
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
              overridableFormTypeInputProps={overrideProps}
              FormTypeRenderer={FormTypeRenderer}
            />
          );
        };
        const Component = Object.assign(ChildComponent, { key });
        childComponentBySchemaNodeKey.current.set(key, Component);
        childNodes.push(Component);
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
};
