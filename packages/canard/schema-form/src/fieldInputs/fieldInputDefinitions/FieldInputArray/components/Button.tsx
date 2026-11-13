import { type CSSProperties, type MouseEventHandler, memo } from 'react';

/**
 * Render a control only when its presentation, current index or shared handler changes.
 * @param props - Visible label that also names the button, `title` that tests and story styles select by,
 * shared click handler, and an optional style; index keeps row positions in memo comparisons.
 * @returns A browser-default native button of type `button`, so a click never submits the surrounding form,
 * without a per-row callback or hook.
 */
export const Button = memo(function Button({
  title,
  label,
  disabled,
  onClick,
  style,
}: {
  title: string;
  label: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  index?: number;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {label}
    </button>
  );
});
