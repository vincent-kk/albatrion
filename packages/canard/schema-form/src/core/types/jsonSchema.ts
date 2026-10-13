import type { BasicSchema } from '@winglet/json-schema';

import type { Dictionary } from '@aileron/declare';

import type { SchemaControls } from './controls';

/** Authored schema; the host supplies presentation data without coupling core to React. */
export interface AuthoredSchema<
  Options extends Dictionary = object,
  Presentation extends object = { [key: string]: unknown },
> extends BasicSchema<unknown, Options, AuthoredSchema<Options, Presentation>> {
  type?:
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'null'
    | 'object'
    | 'array'
    | readonly (
        | 'string'
        | 'number'
        | 'integer'
        | 'boolean'
        | 'null'
        | 'object'
        | 'array'
      )[];
  presentation?: Presentation;
  /** Rules and policies that change value and shape over time; any other key is a blueprint error. */
  controls?: SchemaControls<AuthoredSchema<Options, Presentation>>;
  /** Numeric constraints retain their standard scalar types. */
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  minContains?: number;
  maxContains?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
  required?: readonly string[];
  dependentRequired?: Dictionary<readonly string[]>;
  properties?: Dictionary<AuthoredSchema<Options, Presentation> | undefined>;
  patternProperties?: Dictionary<
    AuthoredSchema<Options, Presentation> | undefined
  >;
  additionalProperties?: boolean | AuthoredSchema<Options, Presentation>;
  items?:
    | false
    | AuthoredSchema<Options, Presentation>
    | readonly AuthoredSchema<Options, Presentation>[];
  prefixItems?: readonly AuthoredSchema<Options, Presentation>[];
  contains?: AuthoredSchema<Options, Presentation>;
  /** Every schema-valued keyword carries the host's presentation parameter. */
  definitions?: Dictionary<AuthoredSchema<Options, Presentation>>;
  dependentSchemas?: Dictionary<AuthoredSchema<Options, Presentation>>;
  dependencies?: Dictionary<
    AuthoredSchema<Options, Presentation> | readonly string[]
  >;
  propertyNames?: AuthoredSchema<Options, Presentation>;
  additionalItems?: boolean | AuthoredSchema<Options, Presentation>;
  unevaluatedItems?: boolean | AuthoredSchema<Options, Presentation>;
  unevaluatedProperties?: boolean | AuthoredSchema<Options, Presentation>;
}
