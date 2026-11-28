import {
  plugin as ajv6,
  createValidator as createAjv6Validator,
} from '@canard/schema-form-ajv6-plugin';
import {
  plugin as ajv7,
  createValidator as createAjv7Validator,
} from '@canard/schema-form-ajv7-plugin';
import {
  plugin as ajv8,
  createValidator as createAjv8Validator,
} from '@canard/schema-form-ajv8-plugin';
import {
  plugin as ajv2020,
  createValidator as createAjv2020Validator,
} from '@canard/schema-form-ajv8-plugin/2020';
import Ajv8 from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';
import { createRequire } from 'node:module';

import type { Validator } from '../../../types/validator';

/** Array keyword family the validator's dialect reads for tuples. */
export type RouteOracleDialect = 'draft-07' | '2020-12';

/** One validator configuration of the routing matrix. */
export interface RouteOracleValidator {
  /** Unique configuration name used as the matrix column key. */
  readonly name: string;
  /** Whether tuples are written with array-form `items` or with `prefixItems`. */
  readonly dialect: RouteOracleDialect;
  /** Fresh validator object; separate compilation configurations own their AJV instance. */
  readonly create: () => Validator;
}

/** Resolve each legacy AJV from the plugin package that depends on it, not from this package's AJV 8. */
const resolvePlugin = createRequire(import.meta.url).resolve;

/** AJV 6 constructor typed by the instance its plugin accepts. */
const Ajv6: new (options: object) => Parameters<typeof createAjv6Validator>[0] =
  createRequire(resolvePlugin('@canard/schema-form-ajv6-plugin'))('ajv');

/** AJV 7 constructor typed by the instance its plugin accepts. */
const Ajv7: new (options: object) => Parameters<typeof createAjv7Validator>[0] =
  createRequire(resolvePlugin('@canard/schema-form-ajv7-plugin'))(
    'ajv',
  ).default;

/**
 * Validator configurations: each AJV plugin as shipped, which inlines references whose
 * target holds no `$ref`, and the same plugin defaults with `inlineRefs: false`, which
 * compiles every reference separately.
 */
export const routeOracleValidators: readonly RouteOracleValidator[] = [
  { name: 'ajv6', dialect: 'draft-07', create: () => ajv6.validator },
  {
    name: 'ajv6-separate',
    dialect: 'draft-07',
    create: () =>
      createAjv6Validator(
        new Ajv6({
          allErrors: true,
          nullable: true,
          verbose: true,
          format: false,
          multipleOfPrecision: 9,
          inlineRefs: false,
        }),
      ),
  },
  { name: 'ajv7', dialect: 'draft-07', create: () => ajv7.validator },
  {
    name: 'ajv7-separate',
    dialect: 'draft-07',
    create: () =>
      createAjv7Validator(
        new Ajv7({
          allErrors: true,
          strict: false,
          validateFormats: false,
          inlineRefs: false,
        }),
      ),
  },
  { name: 'ajv8', dialect: 'draft-07', create: () => ajv8.validator },
  {
    name: 'ajv8-separate',
    dialect: 'draft-07',
    create: () =>
      createAjv8Validator(
        new Ajv8({
          allErrors: true,
          strict: false,
          validateFormats: false,
          allowUnionTypes: true,
          inlineRefs: false,
        }),
      ),
  },
  { name: 'ajv8-2020', dialect: '2020-12', create: () => ajv2020.validator },
  {
    name: 'ajv8-2020-separate',
    dialect: '2020-12',
    create: () =>
      createAjv2020Validator(
        new Ajv2020({
          allErrors: true,
          strict: false,
          validateFormats: false,
          allowUnionTypes: true,
          inlineRefs: false,
        }),
      ),
  },
];
