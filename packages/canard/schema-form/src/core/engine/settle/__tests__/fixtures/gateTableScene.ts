import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../../loadFieldNodeAtMount';
import { getSettlementScratch } from '../../utils/scratch/getSettlementScratch';
import { createSettlementContext } from '../../utils/settlement/createSettlementContext';

/** Create a mounted two-branch host and an isolated context for positional verification. */
export const gateTableScene = () => {
  const tree = createTestTree({
    type: 'object',
    properties: { kind: { type: 'string' }, common: { type: 'string' } },
    oneOf: ['a', 'b'].map((kind) => ({
      controls: { active: `./kind === '${kind}'` },
      properties: { [kind]: { type: 'string', default: kind.toUpperCase() } },
    })),
  });
  loadFieldNodeAtMount(tree.root, { kind: 'a' }, WriteOption.Overwrite);
  const scratch = getSettlementScratch(tree.root.runtime);
  const context = createSettlementContext(
    tree.root,
    'input',
    WriteOption.Overwrite,
    scratch,
  );
  return { ...tree, scratch, context };
};
