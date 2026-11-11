import type { ReactNode } from 'react';

/** Keyboard boundary for a Switch whose native props do not forward key handlers. */
interface SwitchKeyboardControlProps {
  /** The library Switch retains its own click handling and value conversion. */
  children: ReactNode;
  /** Whether activation keys leave the switch unchanged. */
  disabled?: boolean;
}

/**
 * Wrap the supplied Switch without a layout box; activate its click path for
 * Space and Enter so the library's disabled and pending-change guards still apply.
 * @param props Switch child and the disabled state shared with that child.
 * @returns A keyboard event boundary that leaves focus on the Switch itself.
 */
export const SwitchKeyboardControl = ({
  children,
  disabled,
}: SwitchKeyboardControlProps) => (
  <span
    style={{ display: 'contents' }}
    onKeyDown={(event) => {
      if (disabled || (event.key !== ' ' && event.key !== 'Enter')) return;
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        target.getAttribute('role') !== 'switch'
      )
        return;
      event.preventDefault();
      target.click();
    }}
  >
    {children}
  </span>
);
