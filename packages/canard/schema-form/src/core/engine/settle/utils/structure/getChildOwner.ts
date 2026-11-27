import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';

/**
 * Find the host that creates and selects a branch host's children.
 * A virtual group owns none: its children are the live constituents of its parent.
 * @param node - Branch host starting or selecting its children
 * @returns The host itself, or a virtual group's parent (null only for a group without one)
 */
export const getChildOwner = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): Nullable<Self> =>
  node.behavior.type === 'virtual' ? node.__parent__ : node;
