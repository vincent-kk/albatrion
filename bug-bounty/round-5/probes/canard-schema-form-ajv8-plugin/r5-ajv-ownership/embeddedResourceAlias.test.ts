import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../default/index';

/**
 * Round 5, hunter r5-ajv-ownership.
 * A bundled (compound) schema document embeds a resource with its own `$id`. The application
 * registers one such document, and the form root is another document that embeds the same
 * resource. AJV stores an embedded resource under `refs[<id>]` as a string alias to its location.
 * Release must leave the application's registrations as they were (round-4 decision: release
 * removes only what the plugin registered; application entries registered first are kept).
 */
const ADDRESS = 'https://r5.invalid/ajv8/address.json';
const address = {
  $id: ADDRESS,
  type: 'object',
  required: ['city'],
  properties: { city: { type: 'string' } },
};
const applicationDocument = {
  $id: 'https://r5.invalid/ajv8/order.json',
  type: 'object',
  properties: { shipTo: { $ref: ADDRESS } },
  definitions: { address },
};
const formRoot = (): JSONSchema =>
  JSON.parse(
    JSON.stringify({
      $id: 'https://r5.invalid/ajv8/customer.json',
      type: 'object',
      properties: { home: { $ref: ADDRESS } },
      definitions: { address },
    }),
  );

const appAddressVerdict = (ajv: Ajv, data: unknown) => {
  try {
    return ajv.validate(ADDRESS, data);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

const appNewReferenceVerdict = (ajv: Ajv, data: unknown) => {
  try {
    return ajv.compile({ type: 'object', properties: { billTo: { $ref: ADDRESS } } })(data);
  } catch (error) {
    return `compile threw: ${(error as Error).message}`;
  }
};

const setup = () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  ajv.addSchema(applicationDocument);
  expect(ajv.validate(applicationDocument.$id, { shipTo: {} })).toBe(false);
  return ajv;
};

describe('ajv8: a form root embedding a resource that an application document also embeds', () => {
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

  it('[diagnostic] the application alias before, during and after the form', async () => {
    const ajv = setup();
    const before = ajv.refs[ADDRESS];
    const validator = createValidator(ajv);
    const root = formRoot();
    await validator.compile(root)({ home: {} });
    const during = ajv.refs[ADDRESS];
    validator.release?.(root);
    const after = ajv.refs[ADDRESS];
    expect({ before, during, after }).toEqual({
      before: 'https://r5.invalid/ajv8/order.json#/definitions/address',
      during: 'https://r5.invalid/ajv8/customer.json#/definitions/address',
      after: 'https://r5.invalid/ajv8/customer.json#/definitions/address',
    });
  });
});
