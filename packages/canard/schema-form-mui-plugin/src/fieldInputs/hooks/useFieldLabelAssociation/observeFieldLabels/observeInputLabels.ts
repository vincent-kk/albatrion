/**
 * Move observation to the current field container.
 * @param observer - Input-owned caption subscription.
 * @param field - Container of the current primary control, when connected.
 * @returns The newly observed container.
 */
export const observeInputLabels = (
  observer: MutationObserver,
  field: Element | null,
): Element | null => {
  observer.disconnect();
  if (field)
    observer.observe(field, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'aria-hidden'],
    });
  return field;
};
