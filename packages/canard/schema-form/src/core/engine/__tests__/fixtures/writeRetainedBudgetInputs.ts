import type { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { WriteOption } from '../../types/value';

/** Submit the caller values that start the budget scenario in the requested call form. */
export const writeRetainedBudgetInputs = (
  root: ReturnType<typeof nodeFromJSONSchema>,
  call: 'merge' | 'batch' | 'nested',
): void => {
  if (call === 'merge') {
    root.setValue(
      { on: false, caller: 'kept', write: true, reopen: true },
      WriteOption.Merge,
    );
    return;
  }
  const batch = () => {
    root.find('/on')!.setValue(false);
    root.find('/caller')!.setValue('kept');
    root.find('/write')!.setValue(true);
    root.find('/reopen')!.setValue(true);
  };
  root.batch(call === 'batch' ? batch : () => root.batch(batch));
};
