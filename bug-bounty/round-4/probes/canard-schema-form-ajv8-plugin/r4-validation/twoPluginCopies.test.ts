import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

/**
 * IN3 (two copies in one realm) and round-3 class 23. validation.mdx:84 says independent adapters
 * can share one non-modifying AJV instance. A second evaluated copy of the plugin (its CommonJS
 * build beside the ESM build in Node, or another bundle) restarts the module-level registration
 * key counter and keeps its own `$id` conflict list, so its keys and ids collide on the shared
 * instance. `vi.resetModules()` re-evaluates the source, standing in for the second copy.
 */
const loadCopy = async () => {
  vi.resetModules();
  return import('../../default/index');
};

const outcome = async (validator: { compile: (schema: any) => (value: unknown) => unknown }, schema: any, value: unknown) => {
  try {
    const issues = (await validator.compile(schema)(value)) as { keyword?: string; dataPath: string }[] | null;
    return (issues ?? []).map((issue) => `${issue.keyword} ${issue.dataPath}`);
  } catch (error) {
    return `compile threw: ${(error as Error).message}`;
  }
};

const schemaA = () => ({ $id: 'https://example.com/a.json', type: 'object', properties: { x: { type: 'string' } } });
const schemaB = () => ({ $id: 'https://example.com/b.json', type: 'object', properties: { y: { type: 'string' } } });

describe('two evaluated copies of the ajv8 plugin sharing one AJV instance', () => {
  it('[control] two validators of one copy compile two roots with different $id', async () => {
    const copy = await loadCopy();
    const ajv = new Ajv({ allErrors: true, strict: false });
    const first = await outcome(copy.createValidator(ajv), schemaA(), { x: 1 });
    const second = await outcome(copy.createValidator(ajv), schemaB(), { y: 1 });
    expect([first, second]).toEqual([['type /x'], ['type /y']]);
  });

  it('two copies compile two roots with different $id', async () => {
    const copyA = await loadCopy();
    const copyB = await loadCopy();
    expect(copyA.createValidator).not.toBe(copyB.createValidator);
    const ajv = new Ajv({ allErrors: true, strict: false });
    const first = await outcome(copyA.createValidator(ajv), schemaA(), { x: 1 });
    const second = await outcome(copyB.createValidator(ajv), schemaB(), { y: 1 });
    expect([first, second]).toEqual([['type /x'], ['type /y']]);
  });

  it('[control] two validators of one copy keep two live roots with the same $id isolated', async () => {
    const copy = await loadCopy();
    const ajv = new Ajv({ allErrors: true, strict: false });
    const first = await outcome(copy.createValidator(ajv), schemaA(), { x: 1 });
    const second = await outcome(copy.createValidator(ajv), { ...schemaA(), properties: { z: { type: 'string' } } }, { z: 1 });
    expect([first, second]).toEqual([['type /x'], ['type /z']]);
  });

  it('two copies keep two live roots with the same $id isolated (VALIDATE-046)', async () => {
    const copyA = await loadCopy();
    const copyB = await loadCopy();
    // Copy B first registers a root elsewhere, so its next key differs from copy A's and only
    // the shared `$id` can collide.
    await outcome(copyB.createValidator(new Ajv({ strict: false })), schemaB(), {});
    const ajv = new Ajv({ allErrors: true, strict: false });
    const first = await outcome(copyA.createValidator(ajv), schemaA(), { x: 1 });
    const second = await outcome(copyB.createValidator(ajv), { ...schemaA(), properties: { z: { type: 'string' } } }, { z: 1 });
    expect([first, second]).toEqual([['type /x'], ['type /z']]);
  });
});
