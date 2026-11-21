/**
 * Install a generated name until the next label update or the end of the binding.
 * @param target - The title element, or the control when no title is connected.
 * @param name - Name derived from the currently rendered label text.
 * @returns Cleanup that restores the preceding name if the override is still in place.
 */
export const applyFieldLabel = (
  target: HTMLElement,
  name: string,
): (() => void) => {
  const original = target.getAttribute('aria-label');
  target.setAttribute('aria-label', name);
  return () => {
    if (target.getAttribute('aria-label') !== name) return;
    if (original === null) target.removeAttribute('aria-label');
    else target.setAttribute('aria-label', original);
  };
};
