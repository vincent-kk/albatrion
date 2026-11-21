/**
 * Read visible text from a rendered field label.
 * @param label - A registered label root or an input-owned MUI label.
 * @returns Normalized label text with presentational text removed.
 */
export const readVisibleLabel = (label: HTMLElement): string => {
  if (label.closest('[hidden], [aria-hidden="true"]')) return '';
  const style = label.ownerDocument.defaultView?.getComputedStyle(label);
  if (style?.display === 'none' || style?.visibility === 'hidden') return '';
  const text = label.querySelector('.MuiFormControlLabel-label');
  const copy = (text ?? label).cloneNode(true);
  if (!(copy instanceof Element)) return '';
  if (!text && copy.matches('.MuiFormControlLabel-root'))
    copy.firstElementChild?.remove();
  for (const decorative of copy.querySelectorAll(
    '[aria-hidden="true"], [hidden]',
  ))
    decorative.remove();
  return (copy.textContent ?? '').trim().replace(/\s+/g, ' ');
};
