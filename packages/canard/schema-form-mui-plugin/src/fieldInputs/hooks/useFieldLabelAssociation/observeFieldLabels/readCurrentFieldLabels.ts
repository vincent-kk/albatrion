import { readVisibleLabel } from './readVisibleLabel';

/**
 * Resolve the current control and derive its rendered title sources.
 * @param document - Document in which the field is mounted.
 * @param inputId - Address owned by the current primary control.
 * @param labelId - Address of the external title.
 * @returns The direct caption and a title override when a different source is also visible.
 */
export const readCurrentFieldLabels = (
  document: Document,
  inputId: string,
  labelId: string,
): {
  field: Element | null;
  external: HTMLElement | null;
  caption?: string;
  override?: string;
} => {
  const control = document.getElementById(inputId);
  const field = control?.closest('[data-path]') ?? null;
  const external = document.getElementById(labelId);
  if (!field || !control) return { field, external };
  const internal = Array.from(
    field.querySelectorAll<HTMLLabelElement>('label'),
  ).filter(
    (candidate) =>
      candidate !== external &&
      candidate.closest('[data-path]') === field &&
      (candidate.htmlFor === control.id ||
        candidate.matches('.MuiInputLabel-root')),
  );
  const primary = external ? readVisibleLabel(external) : '';
  const captions = internal.map(readVisibleLabel).filter(Boolean);
  const names = [...new Set([primary, ...captions].filter(Boolean))];
  return {
    field,
    external,
    caption: [...new Set(captions)].join(' ') || undefined,
    override:
      names.length > 1 || (!primary && names.length)
        ? names.join(' ')
        : undefined,
  };
};
