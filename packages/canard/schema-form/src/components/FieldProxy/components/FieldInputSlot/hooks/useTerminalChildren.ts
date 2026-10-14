import { useMemo, useRef } from 'react';

import type { FieldNode } from '@/schema-form/core';
import { FormWarningCode } from '@/schema-form/errors';
import { useFormErrorContext } from '@/schema-form/providers/FormErrorContext';

import type { ChildField } from '../type';
import { isDetectableTerminal } from './utils/isDetectableTerminal';

/** A property key made only of digits, as an array index read. */
const NUMERIC_KEY = /^\d+$/;

/** Shared immutable child list for strategies that need no read detector; frozen once at module load. */
const EMPTY_CHILDREN = Object.freeze([]) as unknown as ChildField[];

/** Read-detector state after the input's owning layout effect commits. */
const COMMITTED = 1;
/** Read-detector state after the first observable empty-list access. */
const ACCESSED = 2;

/**
 * The input's child list and the marker its owning layout effect calls on every commit
 * where the pair changes; the marker reports a child read made before that commit.
 */
type TerminalChildren = readonly [children: ChildField[], commit: () => void];

/** Child list and commit marker of an input whose children need no read detector. */
const UNDETECTED: TerminalChildren = [EMPTY_CHILDREN, () => {}];
Object.freeze(UNDETECTED);

/**
 * Detect terminal child-list reads using the input's committed layout effect and a post-commit microtask.
 * @param node - Live node whose terminal strategy has no child components.
 * @returns A pair that stays the same object until the node or error reporter changes: a stable
 *          empty list (only development builds of an object or array made terminal by an inline
 *          input receive a read detector, round 180) and the commit marker that
 *          the input's layout effect must call before any other work, in place of an effect of its own.
 */
export const useTerminalChildren = (node: FieldNode): TerminalChildren => {
  const reporter = useFormErrorContext();
  const accessed = useRef(0);
  return useMemo(() => {
    accessed.current = 0;
    if (
      process.env.NODE_ENV !== 'production' &&
      reporter &&
      isDetectableTerminal(node)
    ) {
      let readLoad = reporter.load;
      const get = (
        target: object = EMPTY_CHILDREN,
        key?: string | symbol,
        receiver?: unknown,
      ): unknown => {
        if (readLoad !== reporter.load) {
          readLoad = reporter.load;
          accessed.current &= ~ACCESSED;
        }
        if (key === undefined) {
          reporter.report({
            level: 'warning',
            code: FormWarningCode.ChildNodeComponentsOnTerminal,
            message: 'Terminal inputs have no child components',
            path: node.path,
          });
          return;
        }
        if (
          !(accessed.current & ACCESSED) &&
          (key === 'length' ||
            key === Symbol.iterator ||
            (typeof key === 'string' && NUMERIC_KEY.test(key)))
        ) {
          accessed.current |= ACCESSED;
          if (accessed.current & COMMITTED) queueMicrotask(get);
        }
        return Reflect.get(target, key, receiver);
      };
      const commit = () => {
        accessed.current |= COMMITTED;
        if (accessed.current & ACCESSED)
          reporter.report({
            level: 'warning',
            code: FormWarningCode.ChildNodeComponentsOnTerminal,
            message: 'Terminal inputs have no child components',
            path: node.path,
          });
      };
      return [
        new Proxy<ChildField[]>(EMPTY_CHILDREN, { get }),
        commit,
      ] as const;
    }
    return UNDETECTED;
  }, [node, reporter]);
};
