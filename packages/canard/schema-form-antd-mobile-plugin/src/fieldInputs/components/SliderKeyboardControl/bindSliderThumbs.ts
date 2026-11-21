import type { FieldInputProps } from '@canard/schema-form';

/** Identity and range attributes on the mobile library's thumbs. */
interface ThumbIdentifiers {
  inputId: string;
  getInputId: FieldInputProps['getInputId'];
  min: number;
  max: number;
  disabled: boolean;
}

/**
 * Bind current thumb nodes, including ones installed later by the library.
 * @param boundary - Slider's local wrapper, containing only its own thumbs.
 * @param props - Keyboard, title and bounds attributes for those thumbs.
 */
export const bindSliderThumbs = (
  boundary: HTMLDivElement,
  { inputId, getInputId, min, max, disabled }: ThumbIdentifiers,
): void => {
  const thumbs = boundary.querySelectorAll<HTMLElement>('[role="slider"]');
  for (const [index, thumb] of Array.from(thumbs).entries()) {
    thumb.id = index === 0 ? inputId : getInputId(index);
    thumb.setAttribute('aria-valuemin', String(min));
    thumb.setAttribute('aria-valuemax', String(max));
    thumb.tabIndex = disabled ? -1 : 0;
    if (disabled) thumb.removeAttribute('data-focus-target');
    else thumb.setAttribute('data-focus-target', '');
  }
};
