/**
 * Read the message the default group renderer draws under one leaf field.
 * @param element - Story canvas or render container.
 * @param path - JSON Pointer of a leaf field; branch nodes nest other fields and are not supported.
 * @returns The trimmed message text, or an empty string when nothing is drawn.
 */
export function readShownMessage(element: Element, path: string): string {
  return element.querySelector(`[data-path="${path}"] em`)?.textContent?.trim() ?? '';
}
