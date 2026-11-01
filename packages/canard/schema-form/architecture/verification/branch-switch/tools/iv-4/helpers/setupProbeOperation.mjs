// IV-4 probes delegate existing rows unchanged; the wide row uses the canonical siblings fixture.
import { setupWrite } from '../../b9-0/operation.mjs';
import { setupOperation } from '../../iv-3-0/helpers/setupOperation.mjs';

export async function setupProbeOperation(rowId, engine) {
  if (rowId !== 'switch-siblings-4000') return setupOperation(rowId, engine);
  const operation = await setupWrite(
    {
      id: rowId,
      operation: 'switch',
      shape: 'siblings',
      siblings: 4000,
      n: 4000,
    },
    engine,
  );
  return { writes: 1, run: operation.write, check: operation.check };
}
