import { FieldNodeEventType } from '../../../../src';

/**
 * Name every FieldNodeEventType bit carried by the received event types.
 * @param types - Event type bit masks in arrival order.
 * @returns Member names of the bits present in any mask, in declaration order.
 */
export const readEventNames = (types: readonly number[]): string[] => {
  const union = types.reduce((all, type) => all | type, 0);
  return Object.entries(FieldNodeEventType).flatMap(([name, bit]) => (typeof bit === 'number' && union & bit ? [name] : []));
};
