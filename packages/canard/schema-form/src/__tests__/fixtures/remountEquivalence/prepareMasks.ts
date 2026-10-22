import type { ObservationMask, RemountScene } from './types';

/**
 * Select only authored prefix predictions, independently of observed differences.
 * @param scene - Static schema and write ledger with explicit predictions.
 * @param prefix - Number of completed writes.
 * @returns Validated masks; computed channel masks are rejected by the comparator.
 */
export function prepareMasks(
  scene: RemountScene,
  prefix: number,
): readonly ObservationMask[] {
  const masks =
    scene.masks?.find((entry) => entry.prefix === prefix)?.entries ?? [];
  const sources: string[] = [];
  const pending: unknown[] = [scene.schema];
  while (pending.length) {
    const item = pending.pop();
    if (!item || typeof item !== 'object') continue;
    for (const [key, value] of Object.entries(item)) {
      if (key === 'controls' && value && typeof value === 'object')
        sources.push(
          ...Object.values(value).flatMap((part) =>
            Array.isArray(part)
              ? part.filter((entry) => typeof entry === 'string')
              : typeof part === 'string' || typeof part === 'function'
                ? [String(part)]
                : [],
          ),
        );
      if (typeof value === 'object') pending.push(value);
    }
  }
  for (const mask of masks) {
    const parts = mask.path.split('/');
    const target = [parts[2], ...parts.slice(4)].join('/');
    const name = target
      .replace(/~1/g, '/')
      .replace(/~0/g, '~')
      .split('/')
      .pop();
    if (name && sources.some((expression) => expression.includes(name)))
      throw new Error(`MASK_READER_OVERLAP ${mask.path}`);
  }
  return masks;
}
