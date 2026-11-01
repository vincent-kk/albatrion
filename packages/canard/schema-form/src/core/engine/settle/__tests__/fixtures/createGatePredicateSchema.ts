import type { BlueprintGate, BlueprintSchema } from '../../../blueprint';

/**
 * Build equivalent branch hosts without changing the payload or authored order.
 * @param kind - Gate mechanism selecting exactly one tag
 * @param count - Number of declared branches, each with three terminal payloads
 * @returns Schema whose baseline always declares the tag
 */
export const createGatePredicateSchema = (
  kind: BlueprintGate['kind'],
  count = 80,
): BlueprintSchema => ({
  type: 'object',
  properties: { kind: { type: 'string', default: 'tag_0' } },
  ...(kind === 'discriminator' ? { controls: { discriminator: 'kind' } } : {}),
  [kind === 'if' ? 'allOf' : 'oneOf']: Array.from(
    { length: count },
    (_, index) => {
      const tag = `tag_${index}`;
      const properties = {
        [`payload_${index}_a`]: { type: 'string' as const, default: 'A' },
        [`payload_${index}_b`]: { type: 'number' as const, default: 1 },
        [`payload_${index}_c`]: { type: 'boolean' as const, default: true },
      };
      if (kind === 'if')
        return {
          if: { properties: { kind: { const: tag } }, required: ['kind'] },
          then: { properties },
        };
      return {
        ...(kind === 'active'
          ? { controls: { active: `./kind === '${tag}'` } }
          : {}),
        properties: {
          ...(kind === 'discriminator'
            ? { kind: { type: 'string' as const, const: tag } }
            : {}),
          ...properties,
        },
      };
    },
  ),
});
