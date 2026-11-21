import { writeOwnedAttribute } from './writeOwnedAttribute';

/**
 * Track actual writes to the current control across replacements.
 * @param attribute - ARIA attribute managed by this binding.
 * @param value - Current generated value.
 * @param initialized - Nodes whose initial React value was already considered.
 * @param initial - Plugin-authored value that React forwarded on the first render.
 * @returns Function that reconciles the current address, or cleans up on null.
 */
export const createNameWriter = (
  attribute: string,
  value: string | undefined,
  initialized?: WeakSet<HTMLElement>,
  initial?: string,
): ((target: HTMLElement | null) => void) => {
  let owned: ReturnType<typeof writeOwnedAttribute>;
  return (target) => {
    const seed = target && initialized?.has(target) ? undefined : initial;
    if (target) initialized?.add(target);
    owned = writeOwnedAttribute(owned, target, attribute, value, seed);
  };
};
