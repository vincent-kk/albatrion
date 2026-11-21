import { describe, expect, it, vi } from 'vitest';

import { ValidationMode } from '@/schema-form';

import { createValidationFrameClock } from '../../__tests__/helpers/createValidationFrameClock';
import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    start: { type: 'string' },
    end: { type: 'string' },
    note: { type: 'string' },
  },
  options: { virtual: { period: { fields: ['start', 'end'] } } },
} as const;

const validator = {
  compile: () => (value: any) => [
    ...(value?.start === 'bad' ? [{ dataPath: '/start', keyword: 'bad', message: 'bad start' }] : []),
    ...(value?.note === 'bad' ? [{ dataPath: '/note', keyword: 'bad', message: 'bad note' }] : []),
  ],
  compileGuard: () => () => true,
};

describe('subtree validate() through a virtual group', () => {
  it('VV1 period.validate() refreshes the errors of its own fields, as start.validate() does', async () => {
    const make = () =>
      build(schema, { start: 'ok', end: 'e', note: 'n' }, { validator, validationMode: ValidationMode.OnRequest }).root;
    const viaField = make();
    viaField.find('/start').setValue('bad');
    await viaField.find('/start').validate();
    const viaGroup = make();
    viaGroup.find('/start').setValue('bad');
    await viaGroup.find('/period').validate();
    const read = (root: any) => ({
      start: root.find('/start').errors.map((e: any) => e.keyword),
      period: root.find('/period').errors.map((e: any) => e.keyword),
    });
    diag('VV1', { viaField: read(viaField), viaGroup: read(viaGroup) });
    expect(read(viaGroup).start).toEqual(read(viaField).start);
  });

  it('VV3 OnChange: a write through the virtual group shows the new error of its field', async () => {
    const clock = createValidationFrameClock();
    const root = build(schema, { start: 'ok', end: 'e', note: 'n' }, { validator, validationMode: ValidationMode.OnChange }).root;
    for (let i = 0; i < 4; i++) {
      clock.frame();
      await clock.task();
    }
    root.find('/period').setValue(['bad', 'e']);
    for (let i = 0; i < 6; i++) {
      clock.frame();
      await clock.task();
    }
    const viaGroup = root.find('/start').errors.map((e: any) => e.keyword);
    root.find('/start').setValue('ok');
    for (let i = 0; i < 6; i++) {
      clock.frame();
      await clock.task();
    }
    root.find('/start').setValue('bad');
    for (let i = 0; i < 6; i++) {
      clock.frame();
      await clock.task();
    }
    const viaField = root.find('/start').errors.map((e: any) => e.keyword);
    diag('VV3', { viaGroup, viaField });
    vi.useRealTimers();
    vi.unstubAllGlobals();
    expect(viaGroup).toEqual(viaField);
  });

  it('VV2 period.validate() does not publish errors outside its fields', async () => {
    const root = build(schema, { start: 'ok', end: 'e', note: 'n' }, { validator, validationMode: ValidationMode.OnRequest }).root;
    root.find('/note').setValue('bad');
    await root.find('/period').validate();
    const note = root.find('/note').errors.map((e: any) => e.keyword);
    diag('VV2', { note });
    expect(note).toEqual([]);
  });
});
