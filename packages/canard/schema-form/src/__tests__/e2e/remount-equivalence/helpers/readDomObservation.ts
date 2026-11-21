import { readDomNode } from './readDomObservation/utils/readDomNode';

/**
 * Serialize the form region using live input state and ordered DOM contents.
 * @param container - One isolated form container.
 * @returns Semantic DOM with mount-local React IDs normalized consistently.
 */
export function readDomObservation(container: HTMLElement): unknown {
  const ids = [
    ...new Set(
      Array.from(container.querySelectorAll('[id]')).flatMap((element) => {
        const match = element.id.match(
          /^(?:label:)?((?:_[rR]_.*?_)|(?::[rR][^:]*:))(?::|$)/,
        );
        return match ? [match[1]] : [];
      }),
    ),
  ];
  return readDomNode(container, ids);
}
