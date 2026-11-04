import { CORE_PROBE } from '../../../../fixtures/core/coreProbe';
import type { CoreFixture } from '../../../../fixtures/core/types';
import { observeCoreOperation } from '../../helpers/observeCoreOperation/observeCoreOperation';
import type { CoreOperationOutcome } from '../../helpers/observeCoreOperation/observeCoreOperation';
import type { CoreWrappedValidator } from '../../helpers/observeCoreOperation/utils/observeCoreValidator';
import type {
  CoreLongTaskSource,
  CoreMarkerObservation,
  CoreObservationEnv,
  CoreValidationReport,
} from '../../types';

/**
 * Connect page-lifetime observers to one fixture's operation window.
 * @param selected - Fixture identifying the public operation and measured path.
 * @param wrapped - Validator records retained since registration.
 * @param markers - The measured path's DOM state and transitions.
 * @param reports - onValidate reports carrying the load probe error.
 * @param longTasks - Browser-owned buffered Long Task source.
 * @param env - Browser-owned clock, timers and rAF scheduling.
 * @param execute - Driver body invoked after frame calibration.
 * @returns The settled observation; propagates calibration, timeout and driver failures.
 */
export const observeCoreFixtureOperation = (
  selected: CoreFixture,
  wrapped: CoreWrappedValidator,
  markers: CoreMarkerObservation,
  reports: CoreValidationReport[],
  longTasks: CoreLongTaskSource,
  env: CoreObservationEnv,
  execute: () => Promise<CoreOperationOutcome>,
) =>
  observeCoreOperation(
    {
      operation: selected.operation,
      validation: selected.validation,
      loadValue:
        selected.measuredPath === CORE_PROBE.path ? CORE_PROBE.default : null,
      validator: wrapped.observation,
      marker: markers,
      reports,
      longTasks,
      execute,
    },
    env,
  );
