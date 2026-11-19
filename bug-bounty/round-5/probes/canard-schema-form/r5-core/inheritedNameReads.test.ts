import { describe, expect, it } from 'vitest';

import { attempt, build } from './probeHelpers';

/**
 * RG3 on the round 4 decision "a missing field named constructor and the like reads as absent
 * data, not as a prototype member" (items 13 and 17; c7e0607aa), on entry points the fix did not
 * name: expression reads, `watch`, `find` and `injectTo` targets of an inactive field.
 */
const NAMES = ['constructor', 'toString', 'valueOf', 'hasOwnProperty'] as const;

const schemaFor = (name: string) =>
  ({
    type: 'object',
    properties: {
      on: { type: 'boolean' },
      [name]: { type: 'string', controls: { active: '../on === true' } },
      out: {
        type: 'string',
        controls: { derived: `typeof (../${name}) === "string" ? "present" : "absent"` },
      },
      watcher: { type: 'string', controls: { watch: [`../${name}`] } },
      src: {
        type: 'string',
        controls: { injectTo: (value: unknown) => ({ [`../${name}`]: value }) },
      },
    },
  }) as any;

describe.each(NAMES)('an inactive field named %s', (name) => {
  it('reads as absent in expressions, watch and find', () => {
    const { root, records } = build(schemaFor(name), { on: false });
    expect({
      out: root.value.out,
      watch: root.find('/watcher')?.watchValues,
      find: root.find(`/${name}`) ?? null,
      codes: records.map((record) => record.code),
    }).toEqual({ out: 'absent', watch: [undefined], find: null, codes: [] });
  });

  it('an injectTo targeting it does not write into a prototype member', () => {
    const { root, records } = build(schemaFor(name), { on: false });
    const thrown = attempt(() => root.find('/src').setValue('x'));
    root.find('/on').setValue(true);
    expect({
      prototypeIntact: typeof (Object.prototype as any)[name] === 'function',
      value: root.value[name],
    }).toMatchObject({ prototypeIntact: true });
    void thrown;
    void records;
  });
});
