import { useMemo, useRef } from 'react';

import type { Fn } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_MASK_NONE,
} from '@/schema-form/constants/bitmask';
import type { FieldNode } from '@/schema-form/core';
import { FormWarningCode } from '@/schema-form/errors';
import { useFormErrorContext } from '@/schema-form/providers/FormErrorContext';

import type { ChildField } from '../type';

/** A property key made only of digits, as an array index read. */
const NUMERIC_KEY = /^\d+$/;

/** Shared immutable child list for strategies that need no read detector; frozen once at module load. */
// eslint-disable-next-line no-restricted-syntax -- Exposed as the mutable ChildField[] contract.
const EMPTY_CHILDREN = Object.freeze([]) as unknown as ChildField[];

/** Read-detector state after the input's owning layout effect commits. */
const COMMITTED = BIT_FLAG_00;
/** Read-detector state after the first observable empty-list access. */
const ACCESSED = BIT_FLAG_01;
/** Mask that clears the accessed bit from the read-detector state. */
const CLEAR_ACCESSED_MASK = ~ACCESSED;

/**
 * The input's child list and the marker its owning layout effect calls on every commit
 * where the pair changes; the marker reports a child read made before that commit.
 */
type TerminalChildren = readonly [children: ChildField[], commit: Fn];

/** Child list and commit marker of an input whose children need no read detector. */
const UNDETECTED: TerminalChildren = Object.freeze([EMPTY_CHILDREN, () => {}]);

/**
 * Detect terminal child-list reads; deferred warnings retain the read's load scope
 * and are dropped after the input's own root retires.
 * @param node - Live node whose terminal strategy has no child components.
 * @returns A pair that stays the same object until the node or error reporter changes: a stable
 *          empty list (only development builds of an object or array made terminal by an inline
 *          input receive a read detector, round 180) and the commit marker that
 *          the input's layout effect must call before any other work, in place of an effect of its own.
 */
export const useTerminalChildren = (node: FieldNode): TerminalChildren => {
  const reporter = useFormErrorContext();
  const accessed = useRef(BIT_MASK_NONE);
  return useMemo(() => {
    accessed.current = BIT_MASK_NONE;
    if (
      process.env.NODE_ENV !== 'production' &&
      reporter &&
      isDetectableTerminal(node)
    ) {
      let readLoad = reporter.load;
      const get = (
        target: object,
        key: string | symbol,
        receiver?: unknown,
      ): unknown => {
        if (readLoad !== reporter.load) {
          readLoad = reporter.load;
          accessed.current &= CLEAR_ACCESSED_MASK;
        }
        if (
          !(accessed.current & ACCESSED) &&
          (key === 'length' ||
            key === Symbol.iterator ||
            (typeof key === 'string' && NUMERIC_KEY.test(key)))
        ) {
          accessed.current |= ACCESSED;
          if (accessed.current & COMMITTED) {
            const scope = reporter.warningScope;
            queueMicrotask(() => {
              if (reporter.root !== node.rootNode) return;
              reporter.reportInLoad(
                {
                  level: 'warning',
                  origin: 'render',
                  code: FormWarningCode.ChildNodeComponentsOnTerminal,
                  message: 'Terminal inputs have no child components',
                  path: node.path,
                },
                scope,
              );
            });
          }
        }
        return Reflect.get(target, key, receiver);
      };
      const commit = () => {
        accessed.current |= COMMITTED;
        if (accessed.current & ACCESSED)
          reporter.report({
            level: 'warning',
            origin: 'render',
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

/**
 * Whether a terminal node's input can mistakenly read ChildFields (round 180).
 * Only an object or array node can be made terminal by an inline input while a container
 * input for the same schema would render children; string, number, boolean, null and union
 * nodes are terminal by nature, so a shared input reading the empty list there is no mistake.
 * @param node - Live node whose input receives ChildFields
 * @returns `true` for an object or array node rendered with the terminal strategy
 */
const isDetectableTerminal = (node: FieldNode): boolean =>
  node.strategy === 'terminal' &&
  (node.type === 'object' || node.type === 'array');
