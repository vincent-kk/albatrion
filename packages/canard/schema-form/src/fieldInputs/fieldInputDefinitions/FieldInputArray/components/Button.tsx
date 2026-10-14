import { type CSSProperties, type MouseEventHandler, memo } from 'react';

/**
 * Render a control only when its presentation, current index or shared handler changes.
 * @param props - Native presentation and shared click handler; index keeps row positions in memo comparisons.
 * @returns The same circular native button, without a per-row callback or hook.
 */
export const Button = memo(function Button({
  title,
  label,
  disabled,
  onClick,
  size = '1.3rem',
  fontSize = '0.8rem',
  style,
}: {
  title: string;
  label: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  index?: number;
  size?: CSSProperties['width'];
  fontSize?: CSSProperties['fontSize'];
  style?: CSSProperties;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        width: size,
        height: size,
        padding: 0,
        border: 'none',
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <span
        style={{
          fontSize,
          lineHeight: 1,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {label}
      </span>
    </button>
  );
});
