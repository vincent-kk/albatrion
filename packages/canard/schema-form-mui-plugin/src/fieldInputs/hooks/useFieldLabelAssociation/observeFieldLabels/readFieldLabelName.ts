import { readVisibleLabel } from './readVisibleLabel';

/**
 * Derive an override from visible external and input-owned titles.
 * @param field - The binding container of the control.
 * @param control - The primary element named by the external label.
 * @param external - The current label at the core title address, when connected.
 * @returns A combined name when the control exposes another distinct title.
 */
export const readFieldLabelName = (
  field: Element,
  control: HTMLElement,
  external: HTMLElement | null,
): string | undefined => {
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
  const names = [
    ...new Set([primary, ...internal.map(readVisibleLabel)].filter(Boolean)),
  ];
  return names.length > 1 || (!primary && names.length)
    ? names.join(' ')
    : undefined;
};
