import type { Nullish } from '@aileron/declare';

import type { ArrayValue } from '@/schema-form/types';

import type { ChildNode, UnionSetValueOption } from '../../type';

/**
 * Strategy interface for managing ArrayNode data and operations.
 * Provides various implementations for array-type JSON schemas.
 */
export interface ArrayNodeStrategy {
  /**
   * Gets the current value of the array.
   * @returns Current value of the array node or undefined
   */
  get value(): ArrayValue | Nullish;
  /**
   * Gets the current length of the array.
   * @returns Length of the array
   */
  get length(): number;
  /**
   * Gets the list of child nodes.
   * @returns Array containing key and node information
   */
  get children(): ChildNode[] | null;
  /**
   * Applies input value to the array node.
   * @param value - Array value to set
   * @param option - Setting options
   */
  applyValue(
    this: this,
    value: ArrayValue | Nullish,
    option: UnionSetValueOption,
  ): void;
  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional)
   */
  push(data?: ArrayValue[number]): Promise<number>;
  /**
   * Updates the value of a specific element.
   * @param index - Index of the element to update
   * @param data - New value
   */
  update(
    index: number,
    data: ArrayValue[number],
  ): Promise<ArrayValue[number] | undefined>;
  /**
   * Removes a specific element.
   * @param index - Index of the element to remove
   */
  remove(index: number): Promise<ArrayValue[number] | undefined>;
  /** Removes the last element from the array. */
  pop(): Promise<ArrayValue[number] | undefined>;
  /** Clears all elements to initialize the array. */
  clear(): Promise<void>;
  /** Activates pub-sub links for child nodes. */
  activate?(): void;
}
