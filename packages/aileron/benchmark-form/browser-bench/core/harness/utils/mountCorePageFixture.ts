// Browser-owned first-paint hook: the driver enters through window.__coreFirstKey.
import { CORE_PROBE } from '../../../../fixtures/core/coreProbe';
import type { CoreFixture } from '../../../../fixtures/core/types';
import { afterCorePaint } from '../../helpers/afterCorePaint';
import { mountCoreFixture } from '../../helpers/mountCoreFixture/mountCoreFixture';
import type {
  CoreInputObservation,
  CoreObservationEnv,
  CoreValidationReport,
} from '../../types';
import { waitForCoreLoadValidation } from './mountCorePageFixture/utils/waitForCoreLoadValidation';
import type { CoreWrappedValidator } from './observeCoreValidator/observeCoreValidator';

/**
 * Mount with page callbacks; the after-load case waits before starting its first-key measurement.
 * @param container - Fresh page root, with input observers attached before rendering.
 * @param selected - Fixture whose measured path selects load feedback or the first key.
 * @param wrapped - Validator plugin wrapped before registration.
 * @param observation - Native observation activated immediately before the first-key driver.
 * @param reports - Caller-owned onValidate evidence to append to.
 * @param env - Browser-owned clock used for render and report marks.
 * @param onFirstKey - Receives the first-paint driver promise before mounting completes.
 * @returns Form handle access and the timestamp immediately before rendering; propagates mount failures.
 */
export async function mountCorePageFixture(
  container: HTMLElement,
  selected: CoreFixture,
  wrapped: CoreWrappedValidator,
  observation: CoreInputObservation,
  reports: CoreValidationReport[],
  env: CoreObservationEnv,
  onFirstKey: (promise: Promise<number>) => void,
) {
  let startMs = 0;
  const form = await mountCoreFixture(container, selected, wrapped.plugin, {
    onRenderStart: () => {
      startMs = env.now();
    },
    onFirstPaint: () => {
      if (selected.operation !== 'first-key') return;
      const drive = () => {
        observation.begin();
        const started = env.now();
        return window.__coreFirstKey().then(async () => {
          await afterCorePaint();
          return env.now() - started;
        });
      };
      onFirstKey(
        selected.id === 'first-key-flat-500-validate-after-load'
          ? waitForCoreLoadValidation(wrapped.observation, reports, env).then(drive)
          : drive(),
      );
    },
    onValidate: (errors) => {
      reports.push({
        atMs: env.now(),
        probeError: errors.some((error) => error.dataPath === CORE_PROBE.path),
      });
    },
  });
  return { startMs, form };
}
