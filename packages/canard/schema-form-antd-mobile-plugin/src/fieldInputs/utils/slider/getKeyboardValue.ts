/**
 * Compute a slider stop for one standard navigation key.
 * @param key - Keyboard event key.
 * @param current - Current thumb value.
 * @param min - Lowest reachable value for this thumb.
 * @param max - Highest reachable value for this thumb.
 * @param step - Positive step between ordinary stops.
 * @param stops - Optional sorted marked stops, which restrict the library slider.
 * @returns The next clamped value, or undefined for an unrelated key.
 */
export const getKeyboardValue = (key: string, current: number, min: number, max: number, step: number, stops: readonly number[]): number | undefined => {
  if (key === 'Home') return min;
  if (key === 'End') return max;
  const direction = key === 'ArrowRight' || key === 'ArrowUp' || key === 'PageUp' ? 1 : key === 'ArrowLeft' || key === 'ArrowDown' || key === 'PageDown' ? -1 : 0;
  if (!direction) return undefined;
  if (stops.length) {
    if (direction > 0) return stops.find(value => value > current && value <= max) ?? current;
    for (let index = stops.length - 1; index >= 0; index--)
      if (stops[index] < current && stops[index] >= min) return stops[index];
    return current;
  }
  const delta = step * direction * (key.startsWith('Page') ? 10 : 1);
  const precision = Math.min(15, Math.max(0, -Math.floor(Math.log10(step))) + 2);
  return Math.max(min, Math.min(max, Number((current + delta).toFixed(precision))));
};
