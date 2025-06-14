import type { ObjectValue } from '@/schema-form/types';

import type { ChildNode, UnionSetValueOption } from '../../type';

/**
 * Strategy interface for managing ObjectNode data and operations.
 * Provides various implementations for object-type JSON schemas.
 */
export interface ObjectNodeStrategy {
  /**
   * Gets the current value of the object.
   * @returns Current value of the object node or undefined
   */
  get value(): ObjectValue | undefined;
  /**
   * Gets the list of child nodes.
   * @returns Array of child nodes
   */
  get children(): Array<ChildNode> | null;
  /**
   * Applies input value to the object node.
   * @param value - Object value to set
   * @param option - Setting options
   */
  applyValue(
    this: this,
    value: ObjectValue | undefined,
    option: UnionSetValueOption,
  ): void;
  /** Activates pub-sub links for child nodes. */
  activate?(): void;
}
