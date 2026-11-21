import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * Round 5, hunter r5-ajv-ownership. AJV 6 row of the ajv8 probe of the same name:
 * an application document and the form root embed the same resource (`$id`).
 */
const ADDRESS = 'https://r5.invalid/ajv6/address.json';
const address = {
  $id: ADDRESS,
  type: 'object',
  required: ['city'],
  properties: { city: { type: 'string' } },
};
const applicationDocument = {
  $id: 'https://r5.invalid/ajv6/order.json',
  type: 'object',
  properties: { shipTo: { $ref: ADDRESS } },
  definitions: { address },
};
const formRoot = (): JSONSchema =>
  JSON.parse(
    JSON.stringify({
      $id: 'https://r5.invalid/ajv6/customer.json',
      type: 'object',
      properties: { home: { $ref: ADDRESS } },
      definitions: { address },
    }),
  );

const appAddressVerdict = (ajv: Ajv.Ajv, data: unknown) => {
  try {
    return ajv.validate(ADDRESS, data);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

const appNewReferenceVerdict = (ajv: Ajv.Ajv, data: unknown) => {
  try {
    return ajv.compile({ type: 'object', properties: { billTo: { $ref: ADDRESS } } })(data);
  } catch (error) {
    return `compile threw: ${(error as Error).message}`;
  }
};

const setup = () => {
  const ajv = new Ajv({ allErrors: true });
  ajv.addSchema(applicationDocument);
  expect(ajv.validate(applicationDocument.$id, { shipTo: {} })).toBe(false);
  return ajv;
};

describe('ajv6: a form root embedding a resource that an application document also embeds', () => {
  it('[control] without a form, the application resolves the embedded resource by its $id', () => {
    const ajv = setup();
    expect(appAddressVerdict(ajv, {})).toBe(false);
    expect(appNewReferenceVerdict(ajv, { billTo: {} })).toBe(false);
  });

  it('[control] the form validates through the embedded resource', async () => {
    const ajv = setup();
    const validator = createValidator(ajv);
    const issues = await validator.compile(formRoot())({ home: {} });
    expect(issues?.map(({ keyword, dataPath }) => `${keyword} ${dataPath}`)).toEqual(['required /home/city']);
  });

  it('after the form root is released, the application still resolves its embedded resource', async () => {
    const ajv = setup();
    const validator = createValidator(ajv);
    const root = formRoot();
    await validator.compile(root)({ home: {} });
    validator.release?.(root);
    expect(appAddressVerdict(ajv, {})).toBe(false);
  });

  it('after the form root is released, a new application schema can reference the embedded resource', async () => {
    const ajv = setup();
    const validator = createValidator(ajv);
    const root = formRoot();
    await validator.compile(root)({ home: {} });
    validator.release?.(root);
    expect(appNewReferenceVerdict(ajv, { billTo: {} })).toBe(false);
  });

  it('after the form root is released, a later form root that references the resource compiles', async () => {
    const ajv = setup();
    const validator = createValidator(ajv);
    const root = formRoot();
    await validator.compile(root)({ home: {} });
    validator.release?.(root);
    let later: unknown;
    try {
      const issues = await validator.compile({
        type: 'object',
        properties: { billTo: { $ref: ADDRESS } },
      })({ billTo: {} });
      later = issues?.map(({ keyword, dataPath }) => `${keyword} ${dataPath}`);
    } catch (error) {
      later = `compile threw: ${(error as Error).message}`;
    }
    expect(later).toEqual(['required /billTo/city']);
  });
});
