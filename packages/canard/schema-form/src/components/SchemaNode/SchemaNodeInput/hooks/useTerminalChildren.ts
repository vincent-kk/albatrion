import { useLayoutEffect, useMemo, useRef } from 'react';

import type { SchemaNode } from '@/schema-form/core';
import { useFormErrorContext } from '@/schema-form/providers/FormErrorContext';

import type { ChildNodeComponent } from '../type';

/** Shared immutable child list for strategies that need no read detector; frozen once at module load. */
const EMPTY_CHILDREN: ChildNodeComponent[] = [];
Object.freeze(EMPTY_CHILDREN);

/** Read-detector state after the input's owning layout effect commits. */
const COMMITTED = 1;
/** Read-detector state after the first observable empty-list access. */
const ACCESSED = 2;

/**
 * Detect terminal child-list reads using React's committed effect and a post-commit microtask.
 * @param node - Live node whose terminal strategy has no child components.
 * @returns A stable empty list; only terminal consumers receive a read detector.
 */
export const useTerminalChildren = (node: SchemaNode): ChildNodeComponent[] => {
  const reporter = useFormErrorContext();
  const accessed = useRef(0);
  const children = useMemo(() => {
    accessed.current = 0;
    if (node.strategy !== 'terminal' || !reporter?.hasConsumer())
      return EMPTY_CHILDREN;
    let readLoad = reporter.load;
    const get = (target: object = EMPTY_CHILDREN, key?: string | symbol, receiver?: unknown): unknown => {
      if (readLoad !== reporter.load) {
        readLoad = reporter.load;
        accessed.current &= ~ACCESSED;
      }
      if (key === undefined) {
        reporter.report({
          level: 'warning',
          code: 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
          message: 'Terminal inputs have no child components',
          path: node.path,
        });
        return;
      }
      if (!(accessed.current & ACCESSED) &&
        (key === 'length' || key === Symbol.iterator ||
          (typeof key === 'string' && /^\d+$/.test(key)))) {
        accessed.current |= ACCESSED;
        if (accessed.current & COMMITTED) queueMicrotask(get);
      }
      return Reflect.get(target, key, receiver);
    };
    return new Proxy<ChildNodeComponent[]>(EMPTY_CHILDREN, { get });
  }, [node, reporter]);
  useLayoutEffect(() => {
    accessed.current |= COMMITTED;
    if (node.strategy === 'terminal' && (accessed.current & ACCESSED))
      reporter?.report({
        level: 'warning',
        code: 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
        message: 'Terminal inputs have no child components',
        path: node.path,
      });
  }, [node, reporter, children]);
  return children;
};
