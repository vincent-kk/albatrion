import type { BlueprintSchema } from '../../../blueprint';

/** Build two independently retained value kinds with a caller-selected gate path. */
export const createCandidateSourceRecord = (
  path: string,
  defaultNumber?: number,
): BlueprintSchema => ({
  type: 'object',
  allOf: [
    {
      controls: { active: `${path} === "string"` },
      properties: { v: { type: 'string' } },
    },
    {
      controls: { active: `${path} === "number"` },
      properties: { v: { type: 'number', default: defaultNumber } },
    },
  ],
});
