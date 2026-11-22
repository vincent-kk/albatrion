import { describe, expect, it } from 'vitest';

import { createValidator } from '@canard/schema-form-ajv6-plugin';

import { ValidationMode } from '@/schema-form';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

// AJV 6 is the validator generation that supports draft-04 `id` (schemaId 'auto').
import Ajv6 from '../../../../schema-form-ajv6-plugin/node_modules/ajv';
import draft04Meta from '../../../../schema-form-ajv6-plugin/node_modules/ajv/lib/refs/json-schema-draft-04.json';

const DRAFT04 = 'http://json-schema.org/draft-04/schema#';
const DRAFT07 = 'http://json-schema.org/draft-07/schema#';

/**
 * A root that defines `kind` as a number and an embedded resource
 * `address.json` that defines its own `kind` as a string. Inside the resource,
 * `#/definitions/kind` must resolve against `address.json` (round 3 item 15
 * decision; round 4 item 1 decision: draft-04 declares resources with `id`).
 */
const documentFor = (dialect: string, ref: string) => {
  const key = dialect === DRAFT04 ? 'id' : '$id';
  return {
    $schema: dialect,
    [key]: 'https://example.test/root.json',
    type: 'object',
    properties: { home: { $ref: ref } },
    definitions: {
      kind: { type: 'number', default: 1 },
      address: {
        [key]: 'address.json',
        type: 'object',
        properties: { kind: { $ref: '#/definitions/kind' } },
        definitions: { kind: { type: 'string', default: 'house' } },
      },
    },
  } as any;
};

const load = (jsonSchema: any) => {
  try {
    return nodeFromJSONSchema({ jsonSchema }).value;
  } catch (error) {
    return `threw ${(error as any)?.code ?? String(error)}`;
  }
};

describe('draft-04 `id` resources (round 4 item 1 dialect decision)', () => {
  it('control: draft-07 `$id` resource resolves its inner #/definitions/kind locally', () => {
    expect(load(documentFor(DRAFT07, '#/definitions/address'))).toEqual({
      home: { kind: 'house' },
    });
  });

  it('control: draft-04 `id` resource reached by its identifier address.json resolves locally', () => {
    expect(load(documentFor(DRAFT04, 'address.json'))).toEqual({
      home: { kind: 'house' },
    });
  });

  it('draft-04 `id` resource reached by JSON pointer resolves its inner #/definitions/kind locally, like the identifier spelling', () => {
    expect(load(documentFor(DRAFT04, '#/definitions/address'))).toEqual({
      home: { kind: 'house' },
    });
  });

  it('reference: AJV 6 with schemaId "auto" applies the resource-local string kind', () => {
    const ajv = new (Ajv6 as any)({ schemaId: 'auto', allErrors: true });
    ajv.addMetaSchema(draft04Meta);
    const validate = ajv.compile(documentFor(DRAFT04, '#/definitions/address'));
    expect([
      validate({ home: { kind: 'house' } }),
      validate({ home: { kind: 1 } }),
    ]).toEqual([true, false]);
  });

  it('IN1: with the ajv6 plugin bound to schemaId "auto" (README), the loaded form validates its own default', async () => {
    const ajv = new (Ajv6 as any)({
      schemaId: 'auto',
      allErrors: true,
      nullable: true,
      format: false,
    });
    ajv.addMetaSchema(draft04Meta);
    const validator = createValidator(ajv);
    const root: any = nodeFromJSONSchema({
      jsonSchema: documentFor(DRAFT04, '#/definitions/address'),
      validationMode: ValidationMode.OnRequest,
      validator,
    } as any);
    const issues = await root.validate();
    expect({
      value: root.value,
      issues: issues.map((issue: any) => [issue.dataPath ?? issue.path, issue.keyword]),
    }).toEqual({ value: { home: { kind: 'house' } }, issues: [] });
  });

  it('diagnostic: a 2020-12 fragment $id the dialect rejects fails the load whether or not another resource is embedded', () => {
    const base = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { name: { type: 'string' } },
      $defs: { unused: { $id: '#unused', type: 'string' } },
    };
    const withResource = {
      ...base,
      properties: {
        ...base.properties,
        other: { $id: 'other.json', type: 'string' },
      },
    };
    expect({
      alone: load(base),
      withResource: load(withResource),
    }).toEqual({
      alone: load(withResource),
      withResource: load(withResource),
    });
  });

  it('the same draft-04 document gives the same field whichever sibling reference is listed first', () => {
    const base = documentFor(DRAFT04, '#/definitions/address');
    const pointerFirst = {
      ...base,
      properties: {
        a: { $ref: '#/definitions/address' },
        b: { $ref: 'address.json' },
      },
    };
    const identifierFirst = {
      ...base,
      properties: {
        b: { $ref: 'address.json' },
        a: { $ref: '#/definitions/address' },
      },
    };
    const first = load(pointerFirst) as any;
    const second = load(identifierFirst) as any;
    expect({ a: first?.a, b: first?.b }).toEqual({
      a: second?.a,
      b: second?.b,
    });
  });
});
