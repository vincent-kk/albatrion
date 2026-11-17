/**
 * Tells whether an element sits under a light-DOM child of a shadow host that no slot
 * renders, which keeps it out of the flat tree and the browser's Tab order.
 * @param element - Element found by walking `root` in light-DOM tree order.
 * @param root - The frame or shadow root the walk started from; the check stops there.
 * @returns True when some ancestor up to `root` is an unassigned child of a host.
 */
export const isUnslotted = (
  element: Element,
  root: Element | ShadowRoot,
): boolean => {
  for (
    let current: Element | null = element;
    current && current !== root;
    current = current.parentElement
  )
    if (current.parentElement?.shadowRoot && !current.assignedSlot) return true;
  return false;
};
