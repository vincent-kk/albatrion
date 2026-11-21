/** DOM attributes that explicitly exclude a caption or its decoration. */
const EXCLUDED = '[hidden], [aria-hidden="true"]';

/**
 * Read a connected caption using only DOM semantics, including CSS-hidden titles.
 * @param label - Rendered label or element at the form's title address.
 * @returns Normalized meaningful text, or an empty string for an excluded caption.
 */
export const readMeaningfulLabel = (label: HTMLElement | null): string => {
  if (!label?.isConnected) return '';
  const form = label.closest('form');
  const excluded = label.closest(EXCLUDED);
  if (excluded && (!form || form.contains(excluded))) return '';
  const text = label.querySelector('.MuiFormControlLabel-label');
  if (text && label.contains(text.closest(EXCLUDED))) return '';
  const copy = (text ?? label).cloneNode(true);
  if (!(copy instanceof Element)) return '';
  if (!text && copy.matches('.MuiFormControlLabel-root'))
    copy.firstElementChild?.remove();
  for (const decoration of copy.querySelectorAll(EXCLUDED)) decoration.remove();
  return (copy.textContent ?? '').trim().replace(/\s+/g, ' ');
};
