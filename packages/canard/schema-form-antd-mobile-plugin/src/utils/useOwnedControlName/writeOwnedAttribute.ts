/** Most recent write to a native element that the binding can still own. */
interface GeneratedAttribute {
  target: HTMLElement;
  value: string;
}

/**
 * Apply a generated name while retaining any consumer-owned DOM value.
 * @param previous - Last value written by this binding.
 * @param target - Native control currently present at the field address.
 * @param attribute - ARIA property whose generated value is being reconciled.
 * @param value - New generated value, if available.
 * @param initial - Stable plugin-authored ARIA prop used before hydration.
 * @returns Ownership of the new generated value, if the consumer did not take over.
 */
export const writeOwnedAttribute = (
  previous: GeneratedAttribute | undefined,
  target: HTMLElement | null,
  attribute: string,
  value?: string,
  initial?: string,
): GeneratedAttribute | undefined => {
  if (previous && (previous.target !== target || value === undefined)) {
    if (previous.target.getAttribute(attribute) === previous.value)
      previous.target.removeAttribute(attribute);
  }
  if (!target || value === undefined) return;
  const current = target.getAttribute(attribute);
  const owned = previous?.target === target ? previous.value : initial;
  if (current !== null && current !== owned) return;
  if (current !== value) target.setAttribute(attribute, value);
  return { target, value };
};
