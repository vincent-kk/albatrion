import type { BlueprintSchema } from '../../../blueprint';

/**
 * Build the P-08 scene whose fragments all contribute controls to one child.
 * @param count - Number of sibling fragments selected by the enabled field
 * @returns Schema used by the fragment-toggle probe, without timing machinery
 */
export const fragmentToggleSchema = (count: number): BlueprintSchema => ({
  type: 'object',
  properties: { enabled: { type: 'boolean' }, target: { type: 'string' } },
  allOf: Array.from({ length: count }, () => ({
    controls: { active: './enabled', disabled: './enabled' },
    properties: { target: { type: 'string' } },
  })),
});
