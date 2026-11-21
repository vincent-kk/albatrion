import { applyFieldLabel } from './observeFieldLabels/applyFieldLabel';
import { hasInputLabelChange } from './observeFieldLabels/hasInputLabelChange';
import { observeLabelAddress } from './observeFieldLabels/observeLabelAddress';
import { readFieldLabelName } from './observeFieldLabels/readFieldLabelName';

/**
 * Keep the composed name current while a control references a core label address.
 * @param control - The real input at the core input address.
 * @param labelId - The address at which an external renderer may supply a label.
 * @returns Cleanup for the address subscription and the input-owned label observer.
 */
export const observeFieldLabels = (
  control: HTMLElement,
  labelId: string,
): (() => void) | undefined => {
  const field = control.closest('[data-path]');
  if (!field) return;
  if (!control.getAttribute('aria-labelledby')?.split(/\s+/).includes(labelId))
    return;

  const document = control.ownerDocument;
  let restore: (() => void) | undefined;
  const update = () => {
    restore?.();
    const external = document.getElementById(labelId);
    const name = readFieldLabelName(field, control, external);
    restore = name ? applyFieldLabel(external ?? control, name) : undefined;
  };
  const unsubscribe = observeLabelAddress(document, labelId, update);
  const observer = new MutationObserver((records) => {
    if (hasInputLabelChange(records)) update();
  });
  observer.observe(field, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'aria-hidden'],
  });
  update();
  return () => {
    observer.disconnect();
    unsubscribe();
    restore?.();
  };
};
