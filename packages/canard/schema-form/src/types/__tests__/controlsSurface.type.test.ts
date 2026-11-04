import { describe, expectTypeOf, it } from 'vitest';

import type { InjectToHandler } from '../schema/injectTo';
import type { JSONSchema, ObjectSchema } from '../schema/jsonSchema';

/** The fourteen node-level keys the blueprint accepts (validateControlGroups.ts). */
type ControlKey =
  | 'active'
  | 'visible'
  | 'readOnly'
  | 'disabled'
  | 'default'
  | 'derived'
  | 'unsetValue'
  | 'resetInteraction'
  | 'unsetOnInactive'
  | 'inactiveValue'
  | 'fields'
  | 'injectTo'
  | 'discriminator'
  | 'watch';

/** The ten keys accepted inside a `controls.fields` entry. */
type ChildControlKey = Exclude<
  ControlKey,
  'fields' | 'injectTo' | 'discriminator' | 'watch'
>;

type Controls = NonNullable<JSONSchema['controls']>;
type ChildControls = NonNullable<
  NonNullable<Controls['fields']>[number]['controls']
>;

describe('controls authoring surface', () => {
  it('names exactly the runtime keys on the public JSONSchema', () => {
    expectTypeOf<keyof Controls>().toEqualTypeOf<ControlKey>();
    expectTypeOf<keyof ChildControls>().toEqualTypeOf<ChildControlKey>();
  });

  it('gives the per-kind aliases the same controls keys', () => {
    expectTypeOf<
      keyof NonNullable<Extract<ObjectSchema, { type: 'object' }>['controls']>
    >().toEqualTypeOf<ControlKey>();
  });

  it('rejects keys and shapes the blueprint rejects', () => {
    const unknownKey: JSONSchema = {
      type: 'object',
      // @ts-expect-error -- UNKNOWN_GROUP_KEY at runtime
      controls: { active: true, visibel: '../x' },
    };
    const stringWatch: JSONSchema = {
      type: 'string',
      // @ts-expect-error -- watch takes an array of paths only
      controls: { watch: '../a' },
    };
    const literalInjectTo: JSONSchema = {
      type: 'string',
      // @ts-expect-error -- INVALID_CONTROL_SHAPE: injectTo must be a function
      controls: { injectTo: 1 },
    };
    const childWatch: JSONSchema = {
      type: 'object',
      controls: {
        // @ts-expect-error -- a fields entry accepts the ten child keys only
        fields: [{ targets: ['a'], controls: { watch: ['../b'] } }],
      },
    };
    expectTypeOf([
      unknownKey,
      stringWatch,
      literalInjectTo,
      childWatch,
    ]).toBeArray();
  });

  it('accepts every key, a typed injectTo handler and custom options', () => {
    const handler: InjectToHandler<string> = (value, context) => ({
      [`${context.dataPath}/../copy`]: value,
    });
    const schema = {
      type: 'object',
      properties: { kind: { type: 'string' }, copy: { type: 'string' } },
      controls: {
        active: '../enabled === true',
        visible: true,
        readOnly: false,
        disabled: '../locked',
        default: { kind: 'a' },
        derived: '../source',
        unsetValue: false,
        resetInteraction: '../reset',
        unsetOnInactive: true,
        discriminator: 'kind',
        watch: ['../enabled'],
        fields: [{ targets: ['copy'], controls: { visible: '../shown' } }],
        injectTo: (value, context) => {
          expectTypeOf(context.jsonSchema).toExtend<JSONSchema>();
          return value === undefined ? null : { '../copy': value };
        },
      },
    } satisfies JSONSchema;
    const typedHandler: JSONSchema = {
      type: 'string',
      controls: { injectTo: handler },
    };
    const custom: JSONSchema<{ custom: number }> = {
      type: 'string',
      options: { custom: 1 },
    };
    expectTypeOf([schema, typedHandler, custom]).toBeArray();
  });
});
