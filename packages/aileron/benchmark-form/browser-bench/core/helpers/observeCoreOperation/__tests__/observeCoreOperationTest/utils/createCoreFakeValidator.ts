import type { plugin } from '@canard/schema-form-ajv8-plugin';

import { observeCoreValidator } from '../../../../../harness/utils/observeCoreValidator/observeCoreValidator';
import type { createCoreFakeWorld } from '../../createCoreFakeWorld';

/**
 * Wrap a deterministic validator whose compile spends 3 ms and run spends 2 ms synchronously.
 * @param world - Virtual page whose timers drive Promise settlement.
 * @param rejecting - Values that reject instead of returning a verdict.
 * @param settleDelayMs - Per-value async delay in ms, defaulting to 10.
 * @returns Wrapped plugin and lifetime records for operation-lifecycle tests.
 */
export function createCoreFakeValidator(
  world: ReturnType<typeof createCoreFakeWorld>,
  rejecting: string[] = [],
  settleDelayMs: (value: string) => number = () => 10,
) {
  const source: typeof plugin = {
    validator: {
      configure: () => {},
      bind: () => {},
      compileGuard: () => () => true,
      release: () => {},
      dialect: 'http://json-schema.org/draft-07/schema#',
      compile: () => {
        world.spend(3);
        return (data: unknown) => {
          world.spend(2);
          const value =
            typeof data === 'object' && data !== null && 'probe' in data
              ? String(data.probe)
              : '';
          return new Promise<null>((resolve, reject) => {
            world.schedule(world.env.now() + settleDelayMs(value), () =>
              rejecting.includes(value)
                ? reject(new Error('validator rejected ' + value))
                : resolve(null),
            );
          });
        };
      },
    },
  };
  return observeCoreValidator(source, '/probe', world.env);
}
