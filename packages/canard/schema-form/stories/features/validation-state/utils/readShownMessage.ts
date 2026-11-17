/**
 * Read the message the default group renderer draws for one field.
 * @param element - Story canvas or render container.
 * @param path - JSON Pointer whose own error root is read, excluding descendants.
 * @returns The trimmed message text, or an empty string when nothing is drawn.
 */
export function readShownMessage(element: Element, path: string): string {
  return Array.from(element.querySelectorAll('em')).find((message) => message.closest('[data-path]')?.matches(`[data-path="${path}"]`))?.textContent?.trim() ?? '';
}
