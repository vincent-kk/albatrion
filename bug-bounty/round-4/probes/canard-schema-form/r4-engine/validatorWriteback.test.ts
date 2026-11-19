import { afterEach, describe, expect, it, vi } from 'vitest';

import { ValidationMode } from '@/schema-form';

import { createValidationFrameClock } from '../../__tests__/helpers/createValidationFrameClock';
import { build, diag } from './probeHelpers';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    meta: { type: 'object', properties: { checked: { type: 'string' } } },
    tags: { type: 'array', items: { type: 'string' } },
  },
} as const;

/** Validator that records its verdict on the form by writing equal content in a new object. */
const recordingValidator = (getRoot: () => any, write: (root: any) => void) => {
  let runs = 0;
  return {
    get runs() {
      return runs;
    },
    validator: {
      compile: () => (value: any) => {
        runs++;
        write(getRoot());
        return value?.name === 'bad'
          ? [{ dataPath: '/name', keyword: 'bad', message: 'bad' }]
          : [];
      },
      compileGuard: () => () => true,
    },
  };
};

const settle = async (clock: ReturnType<typeof createValidationFrameClock>, frames = 40) => {
  for (let i = 0; i < frames; i++) {
    clock.frame();
    await clock.task();
  }
};

describe('RG1 round-3 item 12 neighbors: a validator that writes equal content back', () => {
  const writers: Record<string, (root: any) => void> = {
    'a new object with equal content to an object node': (root) =>
      root?.find('/meta')?.setValue({ checked: 'yes' }),
    'a new array with equal content to an array node': (root) =>
      root?.find('/tags')?.setValue(['t']),
    'Merge of an equal partial object at the root': (root) =>
      root?.setValue({ meta: { checked: 'yes' } }, 2),
  };
  for (const [name, write] of Object.entries(writers)) {
    it(`W ${name}: OnChange settles after a bounded number of runs and shows the verdict`, async () => {
      const clock = createValidationFrameClock();
      let root: any;
      const probe = recordingValidator(() => root, write);
      root = build(
        schema,
        { name: 'ok', meta: { checked: 'yes' }, tags: ['t'] },
        { validator: probe.validator, validationMode: ValidationMode.OnChange },
      ).root;
      await settle(clock);
      const afterLoad = probe.runs;
      root.find('/name').setValue('bad');
      await settle(clock);
      const afterEdit = probe.runs - afterLoad;
      const errors = root.find('/name').errors.map((e: any) => e.keyword);
      diag(`W ${name}`, { afterLoad, afterEdit, errors });
      expect(afterEdit).toBeLessThanOrEqual(3);
      expect(errors).toEqual(['bad']);
    });
  }
});
