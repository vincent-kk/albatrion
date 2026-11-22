/**
 * Tells whether native sequential navigation from an unlisted focus target still lands
 * on a listed control, judged by document order.
 * @param current - Focused element inside the frame that the control list omits.
 * @param controls - Tab candidates of the frame for the travel direction.
 * @param backward - Whether the travel direction is Shift+Tab.
 * @returns True when a control lies after `current` (or before it when backward).
 * Positions across different shadow trees are not comparable; such a pair counts as
 * whatever bit `compareDocumentPosition` reports.
 */
export const hasControlAhead = (
  current: Element,
  controls: readonly Element[],
  backward: boolean,
): boolean => {
  const direction = backward
    ? Node.DOCUMENT_POSITION_PRECEDING
    : Node.DOCUMENT_POSITION_FOLLOWING;
  return controls.some(
    (control) => (current.compareDocumentPosition(control) & direction) !== 0,
  );
};
