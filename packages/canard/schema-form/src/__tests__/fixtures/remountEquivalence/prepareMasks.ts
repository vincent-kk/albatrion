import { encodeValue } from './encodeValue';
import type { ObservationMask, RemountScene } from './types';

/**
 * Select only authored prefix predictions, independently of observed differences.
 * @param scene - Static schema and write ledger with explicit predictions.
 * @param prefix - Number of completed writes.
 * @param schemaAt - Read only U's current effective schema, before F observation.
 * @returns Validated masks; computed channel masks are rejected by the comparator.
 */
export function prepareMasks(
  scene: RemountScene,
  prefix: number,
  schemaAt?: (pointer: string) => unknown,
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
    const pointer = target.replace(/~1/g, '/').replace(/~0/g, '~');
    if (mask.category === 'lifecycle' && !scene.manualReads)
      throw new Error(`LIFECYCLE_ORACLE_REQUIRED ${mask.path}`);
    if (mask.category === 'lifecycle' && scene.manualReads) {
      const path = pointer.startsWith('/') ? pointer : `/${pointer}`;
      if (
        scene.manualReads.some(
          (read) =>
            read === path ||
            read.startsWith(`${path}/`) ||
            path.startsWith(`${read}/`),
        )
      )
        throw new Error(`MASK_READER_OVERLAP ${mask.path}`);
      continue;
    }
    const name = target
      .replace(/~1/g, '/')
      .replace(/~0/g, '~')
      .split('/')
      .pop();
    if (name && sources.some((expression) => expression.includes(name)))
      throw new Error(`MASK_READER_OVERLAP ${mask.path}`);
    const path = pointer.startsWith('/') ? pointer : `/${pointer}`;
    const effective = schemaAt?.(mask.projectionOwner ?? path);
    if (!effective || typeof effective !== 'object')
      throw new Error(`MASK_EFFECTIVE_SCHEMA_REQUIRED ${mask.path}`);
    const options = Reflect.get(effective, 'options') as
      | Record<string, unknown>
      | undefined;
    if (mask.category === 'omitEmpty' && options?.omitEmpty !== true)
      throw new Error(`MASK_OPTION_NOT_ENABLED ${mask.path}`);
    if (
      mask.category === 'omitTrailing' &&
      (options?.omitTrailing !== true ||
        mask.trimmedIndex === undefined ||
        !mask.projectionOwner ||
        !path.startsWith(`${mask.projectionOwner}/${mask.trimmedIndex}`))
    )
      throw new Error(`MASK_TAIL_NOT_DECLARED ${mask.path}`);
    if (mask.category === 'fill') {
      const controls = Reflect.get(effective, 'controls') as
        | Record<string, unknown>
        | undefined;
      const literal =
        controls && Object.prototype.hasOwnProperty.call(controls, 'default')
          ? controls.default
          : Reflect.get(effective, 'default');
      if (
        literal === undefined ||
        typeof literal === 'function' ||
        JSON.stringify(encodeValue(literal)) !==
          JSON.stringify(encodeValue(mask.fresh))
      )
        throw new Error(`MASK_FILL_PREDICTION ${mask.path}`);
    }
  }
  return masks;
}
