import { useLayoutEffect, useMemo, useRef } from 'react';

import type { SchemaNode } from '@/schema-form/core';
import { useFormErrorContext } from '@/schema-form/providers/FormErrorContext';

import type { ChildNodeComponent } from '../type';

/** Detect terminal child-list reads during render and report only after commit. */
export const useTerminalChildren = (node: SchemaNode): ChildNodeComponent[] => {
  const reporter = useFormErrorContext();
  const accessed = useRef(false);
  const children = useMemo(() => {
    const empty = Object.freeze([]) as unknown as ChildNodeComponent[];
    if (!reporter?.hasConsumer()) return empty;
    return new Proxy(empty, {
      get(target, key, receiver) {
        if (
          key === 'length' ||
          key === Symbol.iterator ||
          (typeof key === 'string' && /^\d+$/.test(key))
        )
          accessed.current = true;
        return Reflect.get(target, key, receiver);
      },
    });
  }, [reporter]);
  useLayoutEffect(() => {
    if (node.strategy === 'terminal' && accessed.current)
      reporter?.report({
        level: 'warning',
        code: 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
        message: 'Terminal inputs have no child components',
        path: node.path,
      });
  });
  return children;
};
