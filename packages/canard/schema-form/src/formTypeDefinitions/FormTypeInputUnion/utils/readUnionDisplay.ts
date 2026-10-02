/**
 * Format a union value for the default input without creating editable containers.
 * @param value - Current node value; containers remain owned by the node
 * @param nullable - Whether null is the empty display
 * @returns Display text, container status, and a serialization failure marker
 */
export const readUnionDisplay = (value: unknown, nullable: boolean) => {
  if (value === undefined || value === null && nullable)
    return { text: '', structured: false, invalid: false };
  if (value === null || typeof value !== 'object')
    return { text: String(value), structured: false, invalid: false };
  try {
    const text = JSON.stringify(value);
    return { text: text ?? '', structured: true, invalid: text === undefined };
  } catch {
    return { text: '', structured: true, invalid: true };
  }
};
