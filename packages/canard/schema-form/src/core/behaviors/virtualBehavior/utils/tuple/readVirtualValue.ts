/** Read a referenced sibling's value without owning or changing its input. */
export const readVirtualValue = (child: unknown): unknown =>
  child !== null && typeof child === 'object' && 'value' in child
    ? child.value
    : undefined;
