import { applyFieldLabel } from './observeFieldLabels/applyFieldLabel';
import { hasInputLabelChange } from './observeFieldLabels/hasInputLabelChange';
import { observeInputLabels } from './observeFieldLabels/observeInputLabels';
import { observeLabelAddress } from './observeFieldLabels/observeLabelAddress';
import { readCurrentFieldLabels } from './observeFieldLabels/readCurrentFieldLabels';

/**
 * Resolve both connected elements from their addresses whenever either binding changes.
 * @param document - The document containing the field binding.
 * @param inputId - Core address that a replacement control may take over.
 * @param labelId - Core address of a possibly absent external title.
 * @param publish - Supply an input-owned caption through declarative control props.
 * @returns Cleanup for both address subscriptions and the input-label observation.
 */
export const observeFieldLabels = (
  document: Document,
  inputId: string,
  labelId: string,
  publish: (name: string | undefined) => void,
): (() => void) => {
  let restore: (() => void) | undefined;
  let observedField: Element | null = null;
  const observer = new MutationObserver((records) => {
    if (hasInputLabelChange(records)) update();
  });
  const update = () => {
    const source = readCurrentFieldLabels(document, inputId, labelId);
    if (source.field !== observedField)
      observedField = observeInputLabels(observer, source.field);
    restore?.();
    restore = applyFieldLabel(source.external, source.override);
    publish(source.caption);
  };
  const unsubscribeInput = observeLabelAddress(document, inputId, update);
  const unsubscribeLabel = observeLabelAddress(document, labelId, update);
  update();
  return () => {
    observer.disconnect();
    unsubscribeInput();
    unsubscribeLabel();
    restore?.();
  };
};
