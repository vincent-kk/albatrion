import type { JSONSchema } from '@/schema-form';
import { VirtualizationBackfill } from '@/schema-form';

/** No intersections occur unless the test explicitly invokes a focus request. */
export class FocusSilentObserver {
  /** Retain no asynchronous observer work. */
  observe() {}
  /** The test owns no observed records. */
  unobserve() {}
  /** Disposal has no pending browser callbacks. */
  disconnect() {}
}
/** One eager child leaves the later branches as deterministic gates. */
export const focusVirtualization = {
  threshold: 2,
  eagerCount: 1,
  backfill: VirtualizationBackfill.None,
};
/** Public target beneath three branch gates. */
export const focusTarget = '/outer/middle/inner/target';
/** A required invalid target below three nested gates plus an unrelated sibling gate. */
export const focusSchema: JSONSchema = {
  type: 'object',
  properties: {
    first: { type: 'string', default: 'safe' },
    outer: {
      type: 'object',
      properties: {
        first: { type: 'string', default: 'safe' },
        middle: {
          type: 'object',
          properties: {
            first: { type: 'string', default: 'safe' },
            inner: {
              type: 'object',
              properties: {
                target: { type: 'string', minLength: 3, default: 'x' },
              },
            },
          },
        },
      },
    },
    sibling: { type: 'string', default: 'safe' },
  },
};
