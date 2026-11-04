import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import type { BlueprintSchema } from '../../../blueprint';
import { WriteOption } from '../../../types/value';
import { loadFieldNodeAtMount } from '../../loadFieldNodeAtMount';
import { getSettlementScratch } from '../../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../utils/settlement/createSettlementContext';

/**
 * Prepare a real loaded tree and isolated pending-output read context.
 * @param schema - Authored object/array graph whose projected reads are exercised.
 * @param value - Initial emitted source before the read-only observation.
 * @returns Root, full settlement context and a cleanup returning the scratch.
 */
export const createGateReadFixture = (
  schema: BlueprintSchema,
  value: unknown,
) => {
  const { root } = createTestTree(schema);
  loadFieldNodeAtMount(root, value, WriteOption.Overwrite);
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(
    root,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  return { root, context, release: () => releaseSettlementScratch(scratch) };
};
