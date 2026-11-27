/**
 * Tests containment across open shadow boundaries without crossing realms.
 * @param container - library-owned focus boundary
 * @param element - innermost active element to locate
 * @returns whether the element belongs to this composed subtree
 */
export function containsComposedElement(
  container: HTMLElement,
  element: Element | null,
): boolean {
  let current = element;
  while (current) {
    if (container.contains(current)) return true;
    const root = current.getRootNode();
    current = 'host' in root && root.host instanceof Element ? root.host : null;
  }
  return false;
}
