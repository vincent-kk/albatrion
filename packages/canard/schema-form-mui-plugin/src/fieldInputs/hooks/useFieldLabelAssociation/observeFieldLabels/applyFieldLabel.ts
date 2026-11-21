/**
 * Install a generated name until the next label update or the end of the binding.
 * @param target - Current title element, if connected.
 * @param name - Name derived from the currently rendered label text.
 * @returns Cleanup that restores the preceding name if the override is still in place.
 */
export const applyFieldLabel = (
  target: HTMLElement | null,
  name: string | undefined,
): (() => void) | undefined => {
  if (!target || name === undefined) return;
  const original = target.getAttribute('aria-label');
  target.setAttribute('aria-label', name);
  return () => {
    if (target.getAttribute('aria-label') !== name) return;
    if (original === null) target.removeAttribute('aria-label');
    else target.setAttribute('aria-label', original);
  };
};
