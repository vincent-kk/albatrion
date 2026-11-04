import { readDomNode } from './readDomObservation/utils/readDomNode';

/**
 * Serialize the form region using live input state and ordered DOM contents.
 * @param container - One isolated form container.
 * @returns Semantic DOM with mount-local React IDs normalized consistently.
 */
export function readDomObservation(container: HTMLElement): unknown {
  const ids = Array.from(container.querySelectorAll('[id]'))
    .map((element) => element.id)
    .filter((id) => /^:r.*:$/.test(id) || /^_r_.*_$/.test(id));
  return readDomNode(container, ids);
}
