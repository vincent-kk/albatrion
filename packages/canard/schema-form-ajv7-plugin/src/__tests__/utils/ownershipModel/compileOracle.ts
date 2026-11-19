import type { JSONSchema } from '@canard/schema-form';

import { createFreshOracle } from './createFreshOracle';
import { outcomeOf } from './outcomeOf';
import type { ModelApplication, ModelProfile } from './types';

/** Recompile the current raw application graph and apply the explicit root-collision rule. */
export const compileOracle = async <T extends ModelApplication>(
  source: T,
  profile: ModelProfile<T>,
  root: JSONSchema,
  data: unknown,
) =>
  outcomeOf(async () => {
    const fresh = createFreshOracle(source, profile);
    const rootId =
      typeof root.$id === 'string' ? root.$id : Reflect.get(root, 'id');
    if (typeof rootId === 'string') {
      const existing = fresh.getSchema(rootId);
      if (
        existing &&
        (profile.version !== 6 ||
          JSON.stringify(Reflect.get(existing, 'schema')) !==
            JSON.stringify(root))
      )
        throw new Error(`schema with key or id "${rootId}" already exists`);
    }
    const options = Reflect.get(fresh, '_opts') ?? Reflect.get(fresh, 'opts');
    if (options && typeof options === 'object') {
      if (Reflect.get(options, 'validateSchema') !== false) {
        const validateSchema = Reflect.get(fresh, 'validateSchema');
        if (typeof validateSchema !== 'function')
          throw new TypeError('Oracle schema validator is missing');
        Reflect.apply(validateSchema, fresh, [root, true]);
      }
      Reflect.set(options, 'validateSchema', false);
    }
    const copy = { ...JSON.parse(JSON.stringify(root)), $async: true };
    const validate = fresh.compile(copy);
    const result = await validate(data);
    if (result !== false) return null;
    const errors = Reflect.get(validate, 'errors') ?? [];
    return errors.map(
      (error: {
        keyword: string;
        dataPath?: string;
        instancePath?: string;
      }) => ({
        keyword: error.keyword,
        dataPath: error.dataPath ?? error.instancePath,
      }),
    );
  });
