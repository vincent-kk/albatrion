import type { plugin } from '@canard/schema-form-ajv8-plugin';

import { observeCoreValidator } from '../../../../../harness/utils/observeCoreValidator/observeCoreValidator';
import type { createCoreFakeWorld } from '../../createCoreFakeWorld';

/** Validator double: compile spends 3 ms, each run spends 2 ms and settles 10 ms later unless the value is in `rejecting`. */
export function createCoreFakeValidator(
  world: ReturnType<typeof createCoreFakeWorld>,
  rejecting: string[] = [],
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
            world.schedule(world.env.now() + 10, () =>
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
