import type { BasicSchema } from '@winglet/json-schema';

import type { Dictionary } from '@aileron/declare';

/** Authored schema; the host supplies presentation data without coupling core to React. */
export interface JSONSchema<
  Options extends Dictionary = object,
  Presentation extends object = { [key: string]: unknown },
> extends BasicSchema<unknown, Options, JSONSchema<Options, Presentation>> {
  type?:
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'null'
    | 'object'
    | 'array'
    | 'virtual'
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
  properties?: Dictionary<JSONSchema<Options, Presentation> | undefined>;
  patternProperties?: Dictionary<JSONSchema<Options, Presentation> | undefined>;
  additionalProperties?: boolean | JSONSchema<Options, Presentation>;
  items?:
    | false
    | JSONSchema<Options, Presentation>
    | readonly JSONSchema<Options, Presentation>[];
  prefixItems?: readonly JSONSchema<Options, Presentation>[];
  contains?: JSONSchema<Options, Presentation>;
  /** Every schema-valued keyword carries the host's presentation parameter. */
  definitions?: Dictionary<JSONSchema<Options, Presentation>>;
  dependentSchemas?: Dictionary<JSONSchema<Options, Presentation>>;
  dependencies?: Dictionary<
    JSONSchema<Options, Presentation> | readonly string[]
  >;
  propertyNames?: JSONSchema<Options, Presentation>;
  additionalItems?: boolean | JSONSchema<Options, Presentation>;
  unevaluatedItems?: boolean | JSONSchema<Options, Presentation>;
  unevaluatedProperties?: boolean | JSONSchema<Options, Presentation>;
}
