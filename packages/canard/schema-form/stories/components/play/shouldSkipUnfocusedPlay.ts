import { isVitestBrowserMode } from './isVitestBrowserMode';

/**
 * Check browser-owned document focus only for plays outside Vitest Browser Mode.
 * @returns True outside Vitest Browser Mode when the document has no focus, so the play skips instead of driving user-event.
 */
export function shouldSkipUnfocusedPlay(): boolean {
  return !isVitestBrowserMode() && !document.hasFocus();
}
