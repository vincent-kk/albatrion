/** Glyphs used beside text in the story frame; each one repeats meaning its text already states. */
const ICON_PATHS = {
  play: 'M5 3.5v9l7.5-4.5z',
  check: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM5 8.2l2 2 4-4.2',
  alert: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 4.5v4M8 10.8v.2',
} as const;

/**
 * Draw a decorative 16px stroke icon in the current text colour.
 * @param props - Icon name; the icon is hidden from assistive technology because adjacent text carries the meaning.
 * @returns An inline SVG element.
 */
export function Icon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
