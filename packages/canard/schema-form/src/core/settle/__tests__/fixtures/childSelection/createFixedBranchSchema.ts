import type { BlueprintSchema } from '../../../../blueprint';

/**
 * Keep live width and payload size fixed while varying the authored branch count.
 * @param count - At least five branches so kind_0 and kind_4 both exist
 * @returns The fixed-axis schema used by the original 16B/8B characterization
 */
export const createFixedBranchSchema = (count: number): BlueprintSchema => ({
  type: 'object', properties: {
    common: { type: 'string', default: 'shared' },
    kind: { type: 'string', default: 'kind_0' },
  }, oneOf: Array.from({ length: count }, (_, index) => ({
    controls: { active: `./kind === 'kind_${index}'` }, properties: {
      [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
      [`payload_${index}_b`]: { type: 'number', default: index },
      [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
    },
  })),
});
