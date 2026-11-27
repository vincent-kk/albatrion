import type { InputWinner } from '@aileron/schema-form-scenarios';

/**
 * Read which input rendered at a leaf path.
 * @param element - Story canvas or render container.
 * @param path - JSON Pointer of a leaf node.
 * @returns The data-winner label, "default" for a built-in input, or "none" when the node renders no input.
 */
export function readWinner(element: Element, path: string): InputWinner {
  const wrapper = element.querySelector(`[data-path="${path}"]`);
  if (!wrapper) return 'none';
  const labelled = wrapper.querySelector<HTMLElement>('[data-winner]');
  if (labelled) return labelled.dataset.winner!;
  return wrapper.querySelector('input, select, textarea') ? 'default' : 'none';
}
