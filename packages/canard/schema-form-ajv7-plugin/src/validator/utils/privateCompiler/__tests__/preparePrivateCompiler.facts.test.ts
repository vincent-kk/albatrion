import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import * as dependencies from '../collectSchemaDependencies';
import { preparePrivateCompiler } from '../preparePrivateCompiler';
import * as observations from '../recordDependencies';

afterEach(() => vi.restoreAllMocks());

it('current resource-free facts are reused across equal detached copies without retaining either schema object', () => {
  const source = new Ajv({ meta: false, validateSchema: false, logger: false });
  const spy = vi.spyOn(dependencies, 'collectSchemaDependencies');
  const root = {
    type: 'object',
    properties: { name: { type: 'string', minLength: 3 } },
  };
  const serialized = JSON.stringify(root);
  const first = preparePrivateCompiler(
    source,
    undefined,
    root,
    'validation',
    true,
    '',
    'first',
    serialized,
  );
  const copy = JSON.parse(serialized);
  const second = preparePrivateCompiler(
    source,
    first,
    copy,
    'validation',
    true,
    '',
    'second',
    serialized,
  );
  expect(spy).toHaveBeenCalledTimes(1);
  expect(second).toBe(first);
  const pending: unknown[] = [second.factsCache];
  const seen = new Set<object>();
  while (pending.length) {
    const value = pending.pop();
    if (!value || typeof value !== 'object' || seen.has(value)) continue;
    seen.add(value);
    expect(value).not.toBe(root);
    expect(value).not.toBe(root.properties);
    expect(value).not.toBe(copy);
    pending.push(
      ...(value instanceof Map
        ? [...value.keys(), ...value.values()]
        : Object.values(value)),
    );
  }
});

it('equal serialization re-reads changed extension facts and retires the old environment', () => {
  const source = new Ajv({ meta: false, validateSchema: false, logger: false });
  source.addFormat('memo-format', /^valid$/);
  const root = { type: 'string', format: 'memo-format' };
  const serialized = JSON.stringify(root);
  const first = preparePrivateCompiler(
    source,
    undefined,
    root,
    'validation',
    true,
    '',
    'first',
    serialized,
  );
  expect(first.asynchronous).toBe(false);
  source.addFormat('memo-format', { async: true, validate: async () => true });
  const next = preparePrivateCompiler(
    source,
    first,
    JSON.parse(serialized),
    'validation',
    true,
    '',
    'second',
    serialized,
  );
  expect(next).not.toBe(first);
  expect(next.asynchronous).toBe(true);
});

it('cached dependency observations are written once per compiler, including after pool rotation', () => {
  const source = new Ajv({ meta: false, validateSchema: false, logger: false });
  source.addFormat('memo-format', /^valid$/);
  const record = vi.spyOn(observations, 'recordDependencies');
  const serialized = JSON.stringify({ type: 'string', format: 'memo-format' });
  let compiler: ReturnType<typeof preparePrivateCompiler> | undefined;
  let first: ReturnType<typeof preparePrivateCompiler> | undefined;
  for (let index = 0; index < 65; index++) {
    compiler = preparePrivateCompiler(
      source,
      compiler,
      JSON.parse(serialized),
      'validation',
      true,
      '',
      String(index),
      serialized,
    );
    first ??= compiler;
  }
  expect(record).toHaveBeenCalledTimes(2);
  expect(compiler).not.toBe(first);
  expect(compiler?.rules.has('format')).toBe(true);
  expect(compiler?.formats.has('memo-format')).toBe(true);
});
