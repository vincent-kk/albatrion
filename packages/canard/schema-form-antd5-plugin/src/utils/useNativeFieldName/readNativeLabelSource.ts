/** Return visible text from a native label or an external title. */
const readText = (element: HTMLElement): string => {
  if (element.closest('[hidden], [aria-hidden="true"]')) return '';
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  return style?.display === 'none' || style?.visibility === 'hidden'
    ? ''
    : (element.textContent ?? '').trim();
};

/**
 * Find current label addresses and the text of any unaddressed native label.
 * @param control - Native element currently bound to the core input address.
 * @param external - Current element at the core title address.
 * @returns An ID reference list or composed text for native labels without an id.
 */
export const readNativeLabelSource = (
  control: HTMLElement | null,
  external: HTMLElement | null,
): { references?: string; caption?: string } => {
  const native =
    control instanceof HTMLInputElement ||
    control instanceof HTMLTextAreaElement ||
    control instanceof HTMLButtonElement
      ? Array.from(control.labels ?? [])
      : [];
  const labels =
    external && !native.some((label) => label === external)
      ? [external, ...native]
      : native;
  const visible = labels.flatMap((element) => {
    const text = readText(element);
    return text ? [{ id: element.id, text }] : [];
  });
  if (visible.some(({ id }) => !id))
    return { caption: [...new Set(visible.map(({ text }) => text))].join(' ') };
  return {
    references:
      [...new Set(visible.map(({ id }) => id))].join(' ') || undefined,
  };
};
