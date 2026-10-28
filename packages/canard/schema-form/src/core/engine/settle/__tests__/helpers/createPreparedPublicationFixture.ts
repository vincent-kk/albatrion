import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../../types/value';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { loadFieldNodeAtMount } from '../../loadFieldNodeAtMount';
import type { PreparedStaticHost } from '../../utils/compute/childSelection/utils/prepareStaticHost';
import { getSettlementScratch } from '../../utils/scratch/getSettlementScratch';
import { createSettlementContext } from '../../utils/settlement/createSettlementContext';
import { writeFieldNode } from '../../utils/write/writeFieldNode';

/** Build one real prepared host and an isolated commit context for publication checks. */
export const createPreparedPublicationFixture = () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { x: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  const prepared = getHostDerived<
    'preparedStaticHost',
    PreparedStaticHost<PlainNode>
  >(root).preparedStaticHost!;
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(root, 'callerReplace', 0, scratch);
  return { root, prepared, scratch, context };
};
