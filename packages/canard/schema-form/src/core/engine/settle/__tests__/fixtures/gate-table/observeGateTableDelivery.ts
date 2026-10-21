import type { AuthoredSchema } from '@/schema-form/core/engine/types/jsonSchema';
import { SetValueOption } from '@/schema-form/core/surface';

import { runChildSelectionHistory } from '../childSelection/runChildSelectionHistory';
import type { gateSelectionCases } from '../gateSelectionCases';

/**
 * Capture real every-node listeners using the existing public-surface observation probe.
 * @param fixture - The same schema, input, context updates and writes as the record probe
 * @returns Actual ordered event payloads, revisions, root changes and failure records
 */
export const observeGateTableDelivery = (
  fixture: (typeof gateSelectionCases)[number],
): unknown[] =>
  runChildSelectionHistory({
    label: fixture.name,
    schema: fixture.schema as AuthoredSchema,
    input: fixture.input,
    writes: fixture.writes.map((write) => ({
      path: write.path ?? '',
      value: write.value,
      context: write.context,
      option: write.merge ? SetValueOption.Merge : undefined,
    })),
    context: { gate: () => true },
    allListeners: true,
    guardMode: 'normal',
  }).map((observation) =>
    (observation as [string, unknown][]).filter(([key]) =>
      ['events', 'changes', 'deliveryOrder', 'failure'].includes(key),
    ),
  );
