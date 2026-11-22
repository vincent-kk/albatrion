import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form';

import { attempt, build, codes, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    c: { type: 'string' },
    src: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) => {
          if (value === 'boom') throw new Error('inject boom');
          return { '../copy': value };
        },
      },
    },
    copy: { type: 'string' },
    list: { type: 'array', items: { type: 'string' } },
  },
} as const;

const load = () => ({ a: 'a', b: 'b', c: 'c', src: 's', copy: 's', list: ['x'] });

/** Run a failing step, then one valid write, and report what each step left. */
const recover = (fail: (root: any) => void) => {
  const built = build(schema, load());
  const { root, records, changes } = built;
  const events: string[] = [];
  root.find('/c').subscribe((event: any) => {
    if (event.type & FieldNodeEventType.UpdateValue) events.push(root.find('/c').value);
  });
  changes.length = 0;
  const thrown = attempt(() => fail(root));
  const afterFail = {
    value: JSON.stringify(root.value),
    changes: changes.length,
    records: codes(records),
    status: root.diagnostics?.status,
  };
  changes.length = 0;
  records.length = 0;
  const second = attempt(() => root.find('/c').setValue('valid'));
  return {
    thrown: thrown && String(thrown),
    afterFail,
    second: second && String(second),
    changesAfterValid: changes.map((v) => JSON.stringify(v)),
    recordsAfterValid: codes(records),
    events,
    valueAfterValid: JSON.stringify(root.value),
    statusAfterValid: root.diagnostics?.status,
    runtime: {
      batchDepth: root.runtime.batchDepth ?? 0,
      batchWrites: root.runtime.batchWrites?.length ?? 0,
      entryDepth: root.runtime.entryDepth ?? 0,
      visitDepth: root.runtime.visitDepth ?? 0,
    },
  };
};

const expectClean = (r: ReturnType<typeof recover>) => {
  expect(r.second).toBeFalsy();
  expect(r.recordsAfterValid).toEqual([]);
  expect(r.changesAfterValid.length).toBe(1);
  expect(JSON.parse(r.changesAfterValid[0]).c).toBe('valid');
  expect(r.events.at(-1)).toBe('valid');
  expect(r.runtime).toEqual({ batchDepth: 0, batchWrites: 0, entryDepth: 0, visitDepth: 0 });
};

describe('FP4 a failing call followed by a valid write', () => {
  it('F1 updater throws outside a batch', () => {
    const r = recover((root) => root.find('/a').setValue(() => { throw new Error('u'); }));
    diag('F1', r);
    expect(r.thrown).toContain('u');
    expectClean(r);
  });

  it('F2 updater throws inside a batch after another write', () => {
    const r = recover((root) =>
      root.batch(() => {
        root.find('/a').setValue('A');
        root.find('/b').setValue(() => { throw new Error('u'); });
      }),
    );
    diag('F2', r);
    expect(r.thrown).toContain('u');
    expectClean(r);
  });

  it('F3 nested batch throws and the outer callback catches it', () => {
    const r = recover((root) =>
      root.batch(() => {
        try {
          root.batch(() => {
            root.find('/a').setValue('A');
            throw new Error('inner');
          });
        } catch {
          /* handled by the caller */
        }
        root.find('/b').setValue('B');
      }),
    );
    diag('F3', r);
    expect(r.thrown).toBeFalsy();
    expect(JSON.parse(r.afterFail.value)).toMatchObject({ a: 'A', b: 'B' });
    expectClean(r);
  });

  it('F4 visitor throws after a write', () => {
    const r = recover((root) =>
      root.visitSubtree((node: any) => {
        if (node.path === '/a') {
          node.setValue('A');
          throw new Error('visit');
        }
      }),
    );
    diag('F4', r);
    expect(r.thrown).toContain('visit');
    expectClean(r);
  });

  it('F5 updater throws inside a visitor', () => {
    const r = recover((root) =>
      root.visitSubtree((node: any) => {
        if (node.path === '/a') node.setValue(() => { throw new Error('u'); });
      }),
    );
    diag('F5', r);
    expect(r.thrown).toContain('u');
    expectClean(r);
  });

  it('F6 injectTo throws on one write', () => {
    const r = recover((root) => root.find('/src').setValue('boom'));
    diag('F6', r);
    expect(r.thrown).toBeTruthy();
    expectClean(r);
  });

  it('F7 a listener throws during batch delivery', () => {
    const r = recover((root) => {
      const off = root.find('/a').subscribe(() => {
        off();
        throw new Error('listener');
      });
      root.batch(() => {
        root.find('/a').setValue('A');
        root.find('/list').push('y');
      });
    });
    diag('F7', r);
    expect(r.thrown).toContain('listener');
    expectClean(r);
  });

  it('F8 updater throws inside a caught nested batch, then the outer batch writes again', () => {
    const r = recover((root) =>
      root.batch(() => {
        try {
          root.find('/a').setValue(() => { throw new Error('u'); });
        } catch {
          /* handled */
        }
        root.find('/b').setValue('B');
      }),
    );
    diag('F8', r);
    expect(r.thrown).toBeFalsy();
    expect(JSON.parse(r.afterFail.value)).toMatchObject({ a: 'a', b: 'B' });
    expectClean(r);
  });

  it('F9 an array verb throws on a detached-free bad index inside a batch, then valid writes', () => {
    const r = recover((root) =>
      root.batch(() => {
        root.find('/list').insert(0, 'z');
        root.find('/list').setValue(() => { throw new Error('u'); });
      }),
    );
    diag('F9', r);
    expect(r.thrown).toContain('u');
    expectClean(r);
  });
});
