/** Whether a replaced DOM branch holds an input-owned label. */
const hasLabel = (node: Node): boolean =>
  node instanceof Element &&
  (node.matches('label') || node.querySelector('label') !== null);

/**
 * Filter ordinary field mutations out of input label observation.
 * @param records - Changes delivered for the control's binding container.
 * @returns Whether the affected DOM belongs to or includes a label.
 */
export const hasInputLabelChange = (records: MutationRecord[]): boolean =>
  records.some(({ target, type, addedNodes, removedNodes }) => {
    const element = target instanceof Element ? target : target.parentElement;
    return (
      !!element?.closest('label') ||
      (type === 'attributes' && hasLabel(target)) ||
      Array.from(addedNodes).some(hasLabel) ||
      Array.from(removedNodes).some(hasLabel)
    );
  });
