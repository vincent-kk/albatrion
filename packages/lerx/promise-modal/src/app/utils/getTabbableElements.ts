/**
 * Finds sequential keyboard targets without layout metrics, including in jsdom.
 * @param frame - The library-owned wrapper containing a modal's rendered UI.
 * @param reverse - Whether an unchecked radio group is entered by Shift+Tab.
 * @returns Enabled nonnegative-tabindex controls in browser tab order.
 */
export const getTabbableElements = (frame: HTMLElement, reverse = false): HTMLElement[] => {
  const candidates = frame.querySelectorAll<HTMLElement>(
    'a[href], area[href], button, input, select, textarea, iframe, object, embed, [tabindex], [contenteditable="true"], audio[controls], video[controls], summary',
  );
  return [...candidates]
    .filter((element) => {
      if (
        element.tabIndex < 0 ||
        element.matches(':disabled, input[type="hidden"]')
      )
        return false;
      for (
        let current: HTMLElement | null = element;
        current;
        current = current.parentElement
      ) {
        if (current.hidden || current.hasAttribute('inert')) return false;
        const style =
          current.ownerDocument.defaultView?.getComputedStyle(current);
        if (
          style?.display === 'none' ||
          style?.visibility === 'hidden' ||
          style?.visibility === 'collapse'
        )
          return false;
        if (current === frame) break;
      }
      return true;
    })
    .sort((left, right) => {
      const leftRank = left.tabIndex > 0 ? left.tabIndex : Infinity;
      const rightRank = right.tabIndex > 0 ? right.tabIndex : Infinity;
      return leftRank === rightRank ? 0 : leftRank - rightRank;
    })
    .filter((element, _, elements) => {
      if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name)
        return true;
      const group = elements.filter((candidate): candidate is HTMLInputElement =>
        candidate instanceof HTMLInputElement && candidate.type === 'radio' &&
        candidate.name === element.name && candidate.form === element.form);
      const target = group.find((radio) => radio.checked) ?? (reverse ? group[group.length - 1] : group[0]);
      return element === target;
    });
};
