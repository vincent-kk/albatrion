/**
 * Apply both name properties to the current library-owned native element.
 * @param control - Native control currently found in the component boundary.
 * @param label - Direct spoken fallback, if needed.
 * @param labelledBy - Existing rendered title address, if needed.
 */
export const applyNameAttributes = (
  control: HTMLElement,
  label: string | undefined,
  labelledBy: string | undefined,
): void => {
  if (label === undefined) control.removeAttribute('aria-label');
  else control.setAttribute('aria-label', label);
  if (labelledBy === undefined) control.removeAttribute('aria-labelledby');
  else control.setAttribute('aria-labelledby', labelledBy);
};
