import { afterEach, describe, expect, it, vi } from 'vitest';

import { FieldNodeEventType, ValidationMode } from '@/schema-form';

import { createValidationFrameClock } from '../../__tests__/helpers/createValidationFrameClock';
import { build, diag } from './probeHelpers';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const schema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' } } },
    },
    note: { type: 'string' },
  },
} as const;

/** Validator whose runs stay pending until the probe settles them. */
const deferredValidator = () => {
  const runs: { value: any; finish: () => void }[] = [];
  const issuesFor = (value: any) =>
    (value?.list ?? []).flatMap((item: any, index: number) =>
      item?.name === 'bad'
        ? [{ dataPath: `/list/${index}/name`, keyword: 'bad', message: 'bad' }]
        : [],
    );
  return {
    runs,
    validator: {
      compile: () => (value: any) => {
        const snapshot = JSON.parse(JSON.stringify(value ?? null));
        return new Promise((resolve) =>
          runs.push({ value: snapshot, finish: () => resolve(issuesFor(snapshot)) }),
        );
      },
      compileGuard: () => () => true,
    },
  };
};

/** Every error list each name node ever showed, by the item's name at that time. */
const watchErrors = (root: any) => {
  const seen: string[] = [];
  const track = (node: any) =>
    node.subscribe((event: any) => {
      if (event.type & FieldNodeEventType.UpdateError)
        seen.push(
          `${node.path}=${node.parentNode?.value?.name}:${node.errors
            .map((e: any) => e.keyword)
            .join(',')}`,
        );
    });
  for (const item of root.find('/list').children) track(item.find('./name'));
  return seen;
};

const drain = async (clock: ReturnType<typeof createValidationFrameClock>, runs: any[]) => {
  for (let i = 0; i < 10; i++) {
    clock.frame();
    await clock.task();
    for (const run of runs.splice(0)) run.finish();
    await clock.task();
  }
};

describe('LC1 asynchronous validation overtaken by later operations', () => {
  it('O1 OnChange: removal before the verdict leaves errors only on the bad item', async () => {
    const clock = createValidationFrameClock();
    const { validator, runs } = deferredValidator();
    const { root } = build(
      schema,
      { list: [{ name: 'a' }, { name: 'ok' }, { name: 'c' }] },
      { validator, validationMode: ValidationMode.OnChange },
    );
    await drain(clock, runs);
    const seen = watchErrors(root);
    root.find('/list/1/name').setValue('bad');
    clock.frame();
    await clock.task();
    const inflight = runs.length;
    root.find('/list').remove(0);
    await drain(clock, runs);
    const errors = root
      .find('/list')
      .children.map((item: any) => item.find('./name').errors.map((e: any) => e.keyword));
    diag('O1', { inflight, value: root.value, errors, seen });
    expect(errors).toEqual([['bad'], []]);
    expect(seen.filter((s) => /=(a|c):bad/.test(s))).toEqual([]);
  });

  it('O2 explicit validate(): a removal before the verdict does not put the old verdict on the moved item', async () => {
    const { validator, runs } = deferredValidator();
    const { root } = build(
      schema,
      { list: [{ name: 'a' }, { name: 'bad' }, { name: 'c' }] },
      { validator, validationMode: ValidationMode.OnRequest },
    );
    const seen = watchErrors(root);
    const pending = root.validate();
    root.find('/list').remove(0);
    for (const run of runs.splice(0)) run.finish();
    const returned = await pending;
    await new Promise((r) => setTimeout(r, 0));
    const errors = root
      .find('/list')
      .children.map((item: any) => ({
        name: item.value?.name,
        errors: item.find('./name').errors.map((e: any) => e.keyword),
      }));
    diag('O2', { returned, value: root.value, errors, seen });
    // The verdict for [a, bad, c] carries /list/1/name; after remove(0) that path is "c".
    expect(errors.find((e: any) => e.name === 'c')?.errors).toEqual([]);
  });

  it('O3 explicit validate(): an insert before the verdict does not put the old verdict on the new item', async () => {
    const { validator, runs } = deferredValidator();
    const { root } = build(
      schema,
      { list: [{ name: 'a' }, { name: 'bad' }] },
      { validator, validationMode: ValidationMode.OnRequest },
    );
    const pending = root.validate();
    root.find('/list').insert(1, { name: 'fresh' });
    for (const run of runs.splice(0)) run.finish();
    await pending;
    await new Promise((r) => setTimeout(r, 0));
    const errors = root
      .find('/list')
      .children.map((item: any) => ({
        name: item.value?.name,
        errors: item.find('./name').errors.map((e: any) => e.keyword),
      }));
    diag('O3', { value: root.value, errors });
    expect(errors.find((e: any) => e.name === 'fresh')?.errors).toEqual([]);
  });

  it('O4 explicit validate(): resetSubtree of the list before the verdict', async () => {
    const { validator, runs } = deferredValidator();
    const { root } = build(
      schema,
      { list: [{ name: 'a' }] },
      { validator, validationMode: ValidationMode.OnRequest },
    );
    root.find('/list').push({ name: 'bad' });
    const pending = root.validate();
    root.find('/list').resetSubtree();
    for (const run of runs.splice(0)) run.finish();
    await pending;
    await new Promise((r) => setTimeout(r, 0));
    const errors = root
      .find('/list')
      .children.map((item: any) => ({
        name: item.value?.name,
        errors: item.find('./name').errors.map((e: any) => e.keyword),
      }));
    diag('O4', { value: root.value, errors, global: root.globalErrors });
    expect(errors.every((e: any) => e.name === 'bad' || e.errors.length === 0)).toBe(true);
  });
});
