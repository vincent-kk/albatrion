import { readFieldLabelName } from './observeFieldLabels/readFieldLabelName';

/**
 * Keep separately rendered MUI labels in the order the field announces.
 * @param control - The real input at the core input address.
 * @param label - The externally rendered title at the core label address.
 * @returns Cleanup for observation of input-owned label changes.
 */
export const observeFieldLabels = (
  control: HTMLElement,
  label: HTMLElement,
): (() => void) | undefined => {
  const field = control.closest('[data-path]');
  if (!field) return;
  if (!control.getAttribute('aria-labelledby')?.split(/\s+/).includes(label.id))
    return;

  const originalLabel = label.getAttribute('aria-label');
  const restore = () => {
    if (originalLabel === null) label.removeAttribute('aria-label');
    else label.setAttribute('aria-label', originalLabel);
  };
  const update = () => {
    const name = readFieldLabelName(field, control, label);
    if (name) label.setAttribute('aria-label', name);
    else restore();
  };
  update();
  const observer = new MutationObserver(update);
  const options = {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'aria-hidden'],
  };
  observer.observe(field, options);
  if (!field.contains(label)) observer.observe(label, options);
  return () => {
    observer.disconnect();
    restore();
  };
};
