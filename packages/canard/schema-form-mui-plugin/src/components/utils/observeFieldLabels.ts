import { readFieldLabelName } from './observeFieldLabels/readFieldLabelName';

/**
 * Keep separately rendered MUI labels in the order the field announces.
 * @param label - The external bound label carrying the core title address.
 * @returns Cleanup for observation of input-owned label changes.
 */
export const observeFieldLabels = (
  label: HTMLLabelElement,
): (() => void) | undefined => {
  const document = label.ownerDocument;
  const control = document.getElementById(label.htmlFor);
  const field = control?.closest('[data-path]');
  if (!field || !control || !label.id) return;
  if (!control.getAttribute('aria-labelledby')?.split(/\s+/).includes(label.id))
    return;

  const update = () => {
    const name = readFieldLabelName(field, control, label);
    if (name) label.setAttribute('aria-label', name);
    else label.removeAttribute('aria-label');
  };
  update();
  const observer = new MutationObserver(update);
  observer.observe(field, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'aria-hidden'],
  });
  return () => {
    observer.disconnect();
    label.removeAttribute('aria-label');
  };
};
