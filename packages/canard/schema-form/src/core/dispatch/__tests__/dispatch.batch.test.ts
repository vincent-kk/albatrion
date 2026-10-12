import { describe, expect, it } from 'vitest';

import { createTestValidator } from '../../__tests__/fixtures/createTestValidator';
import { SetValueOption } from '../../types/value';
import {
  dispatchBatch,
  dispatchFinishInput,
  dispatchMount,
  dispatchPush,
  dispatchRemove,
  dispatchResetSubtree,
  dispatchSetValue,
  dispatchUpdate,
  subscribeSchemaNode,
} from '../index';
import {
  type DispatchTestNode,
  createDispatchTree,
} from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

/** A guarded then branch plus an unrelated field, mirrored from the 07c finding scenario. */
const noteSchema = {
  type: 'object',
  properties: { company: { type: 'boolean' }, note: { type: 'string' } },
  if: { properties: { company: { const: true } }, required: ['company'] },
  then: { properties: { vat: { type: 'string' } } },
} as const;

/** The then branch carries a default, so a refill is observable as 'VAT-0'. */
const companySchema = {
  type: 'object',
  properties: { company: { type: 'boolean' } },
  if: { properties: { company: { const: true } }, required: ['company'] },
  then: { properties: { vat: { type: 'string', default: 'VAT-0' } } },
  else: { properties: { personalId: { type: 'string' } } },
} as const;

/** A guarded extra beside an array and an object host. */
const hostSchema = {
  type: 'object',
  properties: {
    mode: { type: 'boolean' },
    list: { type: 'array', items: { type: 'string' } },
    obj: {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    },
  },
  if: { properties: { mode: { const: true } }, required: ['mode'] },
  then: { properties: { extra: { type: 'string' } } },
} as const;

/** The same path holds a string in one branch and a number in the other. */
const kindSchema = (other: boolean) =>
  ({
    type: 'object',
    properties: {
      k: { type: 'string' },
      ...(other ? { other: { type: 'string' } } : {}),
    },
    if: { properties: { k: { const: 'a' } }, required: ['k'] },
    then: {
      properties: { value: { type: 'string', options: { trim: true } } },
    },
    else: { properties: { value: { type: 'number' } } },
  }) as const;

/** Latent raw key for a path and kind, as the path-keyed store writes it. */
const latent = (path: string, kind: string) => JSON.stringify([path, kind]);

/** Mount a guarded tree, close the branch, and return the root with its latent raw retained. */
const hideVat = (schema: typeof noteSchema | typeof companySchema) => {
  const tree = createDispatchTree(schema, undefined, createTestValidator());
  dispatchMount(tree.root, { company: true, vat: 'VAT-9' });
  dispatchSetValue(getDispatchChild(tree.root, 'company'), false);
  expect(tree.root.runtime.latentRaw.has(latent('/vat', 'string'))).toBe(true);
  return tree;
};

// filid:contract dispatch-batch
describe('dispatcher batch', () => {
  it('EVENT-013 EVENT-014 EVENT-019 and EVENT-035 commit one outer batch', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    let calls = 0;
    subscribeSchemaNode(root, () => {
      calls += 1;
    });
    dispatchBatch(root, () => {
      dispatchSetValue(root, 'first');
      expect(root.emit).toBe(undefined);
      dispatchBatch(root, () => dispatchSetValue(root, 'last'));
      expect(root.emit).toBe(undefined);
    });
    expect(root.emit).toBe('last');
    expect(runtime.commitNumber).toBe(1);
    expect(calls).toBe(1);
  });

  it('EVENT-015 and EVENT-072 settle subtree reset immediately inside batch', () => {
    const { root } = createDispatchTree(
      {
        type: 'object',
        properties: {
          child: { type: 'string' },
          sibling: { type: 'string' },
        },
      },
      { child: 'base', sibling: 'kept' },
    );
    dispatchMount(root, { child: 'base', sibling: 'kept' });
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'child'), 'pending');
      dispatchResetSubtree(getDispatchChild(root, 'child'));
      expect(getDispatchChild(root, 'child').emit).toBe('base');
      expect(getDispatchChild(root, 'sibling').emit).toBe('kept');
    });
  });

  it('EVENT-013 applies sibling marks in one settlement', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        left: { type: 'string' },
        right: { type: 'string' },
      },
    });
    dispatchMount(root, { left: 'old', right: 'old' });
    const before = runtime.commitNumber ?? 0;
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'left'), 'new-left');
      dispatchSetValue(getDispatchChild(root, 'right'), 'new-right');
    });
    expect(runtime.commitNumber).toBe((before ?? 0) + 1);
    expect(root.emit).toEqual({ left: 'new-left', right: 'new-right' });
  });

  it('EVENT-017 commits marked writes before rethrowing fn failure', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const failure = new Error('batch failed');
    expect(() =>
      dispatchBatch(root, () => {
        dispatchSetValue(root, 'kept');
        throw failure;
      }),
    ).toThrow(failure);
    expect(root.emit).toBe('kept');
  });

  it('EVENT-061 treats an updater failure as a callback failure', () => {
    const { root } = createDispatchTree({ type: 'number' });
    const failure = new Error('updater failed');
    expect(() =>
      dispatchBatch(root, () => {
        dispatchSetValue(root, 1);
        dispatchSetValue(root, () => {
          throw failure;
        });
        dispatchSetValue(root, 2);
      }),
    ).toThrow(failure);
    expect(root.emit).toBe(1);
  });

  it('EVENT-014 propagates a nested callback failure to the outer batch', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const failure = new Error('nested failure');
    let continued = false;
    expect(() =>
      dispatchBatch(root, () => {
        dispatchSetValue(root, 'first');
        dispatchBatch(root, () => {
          throw failure;
        });
        continued = true;
      }),
    ).toThrow(failure);
    expect(continued).toBe(false);
    expect(root.emit).toBe('first');
  });

  it('EVENT-016 listener batch opens its own feedback batch', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: string[] = [];
    subscribeSchemaNode(root, () => {
      seen.push(String(root.emit));
      if (root.emit === 'first')
        dispatchBatch(root, () => dispatchSetValue(root, 'second'));
    });
    dispatchSetValue(root, 'first');
    expect(seen).toEqual(['first', 'second']);
  });

  it('EVENT-061 updater sees pending writes while ordinary reads stay committed', () => {
    const { root } = createDispatchTree({ type: 'number' });
    dispatchSetValue(root, 1);
    dispatchBatch(root, () => {
      dispatchSetValue(root, (previous: number) => previous + 1);
      dispatchSetValue(root, (previous: number) => previous + 1);
      expect(root.emit).toBe(1);
    });
    expect(root.emit).toBe(3);
  });

  it('EVENT-061 branch updater sees an earlier partial mark over committed values', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        left: { type: 'string' },
        right: { type: 'string' },
      },
    });
    dispatchMount(root, { left: 'old', right: 'kept' });
    const previous: unknown[] = [];
    dispatchBatch(root, () => {
      dispatchSetValue(root, { left: 'new' }, SetValueOption.Merge);
      dispatchSetValue(root, (value: unknown) => {
        previous.push(value);
        return { left: 'new', right: 'last' };
      });
    });
    expect(previous).toEqual([{ left: 'new', right: 'kept' }]);
    expect(root.emit).toEqual({ left: 'new', right: 'last' });
  });

  it('WRITE-015 keeps automatic-write suppression inside batch', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        name: { type: 'string', default: 'filled' },
      },
    });
    const both =
      SetValueOption.Overwrite |
      SetValueOption.DisableAutomaticWrites |
      SetValueOption.EnableAutomaticWrites;
    dispatchBatch(root, () => dispatchSetValue(root, {}, both));
    expect(root.structure?.name?.raw).toBeUndefined();
  });

  it('191C-01 LANDING-018 LANDING-032 keeps latent raw outside a two-write batch', () => {
    const { root, runtime } = hideVat(noteSchema);
    const note = getDispatchChild(root, 'note');
    dispatchBatch(root, () => {
      dispatchSetValue(note, 'x');
      dispatchSetValue(note, 'y');
    });
    expect(root.emit).toEqual({ company: false, note: 'y' });
    expect(runtime.latentRaw.has(latent('/vat', 'string'))).toBe(true);
    dispatchSetValue(getDispatchChild(root, 'company'), true);
    expect(root.emit).toEqual({ company: true, note: 'y', vat: 'VAT-9' });
  });

  it('191C-01 LANDING-011 EVENT-013 restores the edited value after a batched triple toggle', () => {
    const { root, runtime } = hideVat(companySchema);
    const company = getDispatchChild(root, 'company');
    const before = runtime.commitNumber ?? 0;
    dispatchBatch(root, () => {
      dispatchSetValue(company, true);
      dispatchSetValue(company, false);
      dispatchSetValue(company, true);
    });
    expect(root.emit).toEqual({ company: true, vat: 'VAT-9' });
    expect(runtime.commitNumber).toBe((before ?? 0) + 1);
  });

  it.each([
    [
      'push then setValue',
      (root: ReturnType<typeof createDispatchTree>['root']) => {
        dispatchPush(getDispatchChild(root, 'list'), 'p');
        dispatchSetValue(
          getDispatchChild(getDispatchChild(root, 'obj'), 'a'),
          'A2',
        );
      },
    ],
    [
      'two sibling setValue',
      (root: ReturnType<typeof createDispatchTree>['root']) => {
        dispatchSetValue(
          getDispatchChild(getDispatchChild(root, 'obj'), 'a'),
          'A2',
        );
        dispatchSetValue(
          getDispatchChild(getDispatchChild(root, 'obj'), 'b'),
          'B2',
        );
      },
    ],
    [
      'two pushes',
      (root: ReturnType<typeof createDispatchTree>['root']) => {
        dispatchPush(getDispatchChild(root, 'list'), 'p');
        dispatchPush(getDispatchChild(root, 'list'), 'q');
      },
    ],
  ])(
    '191C-01 keeps latent raw outside array and object batches: %s',
    (_, writes) => {
      const { root, runtime } = createDispatchTree(
        hostSchema,
        undefined,
        createTestValidator(),
      );
      dispatchMount(root, {
        mode: true,
        extra: 'E',
        list: ['l'],
        obj: { a: 'A', b: 'B' },
      });
      dispatchSetValue(getDispatchChild(root, 'mode'), false);
      expect(runtime.latentRaw.has(latent('/extra', 'string'))).toBe(true);
      dispatchBatch(root, () => writes(root));
      expect(runtime.latentRaw.has(latent('/extra', 'string'))).toBe(true);
      dispatchSetValue(getDispatchChild(root, 'mode'), true);
      expect(getDispatchChild(root, 'extra').emit).toBe('E');
    },
  );

  it('26C-10 clears latent raw under a root write inside a batch', () => {
    const { root, runtime } = hideVat(noteSchema);
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'note'), 'x');
      dispatchSetValue(root, { company: false });
    });
    expect(runtime.latentRaw.has(latent('/vat', 'string'))).toBe(false);
    dispatchSetValue(getDispatchChild(root, 'company'), true);
    expect(root.emit).toEqual({ company: true });
  });

  it('191C-01 keeps latent raw under a shallow Merge batch', () => {
    const { root, runtime } = hideVat(noteSchema);
    dispatchBatch(root, () => {
      dispatchSetValue(root, { note: 'z' }, SetValueOption.Merge);
      dispatchSetValue(getDispatchChild(root, 'note'), 'w');
    });
    expect(root.emit).toEqual({ company: false, note: 'w' });
    expect(runtime.latentRaw.has(latent('/vat', 'string'))).toBe(true);
  });

  it('191C-01 keeps a single-write batch unchanged', () => {
    const { root, runtime } = hideVat(noteSchema);
    const before = runtime.commitNumber ?? 0;
    dispatchBatch(root, () =>
      dispatchSetValue(getDispatchChild(root, 'note'), 'x'),
    );
    expect(runtime.commitNumber).toBe((before ?? 0) + 1);
    expect(runtime.latentRaw.has(latent('/vat', 'string'))).toBe(true);
    dispatchSetValue(getDispatchChild(root, 'company'), true);
    expect(root.emit).toEqual({ company: true, note: 'x', vat: 'VAT-9' });
  });

  it('191C-01 keeps an unwritten sibling object intact across a two-write batch', () => {
    const { root, runtime } = createDispatchTree(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          side: {
            type: 'object',
            properties: { flag: { type: 'boolean' }, text: { type: 'string' } },
            if: { properties: { flag: { const: true } }, required: ['flag'] },
            then: { properties: { nested: { type: 'string' } } },
          },
        },
      },
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { a: '1', b: '2', side: { flag: true, nested: 'N' } });
    const side = getDispatchChild(root, 'side');
    dispatchSetValue(getDispatchChild(side, 'flag'), false);
    expect(runtime.latentRaw.has(latent('/side/nested', 'string'))).toBe(true);
    const text = getDispatchChild(side, 'text');
    const value = side.emit;
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'a'), 'x');
      dispatchSetValue(getDispatchChild(root, 'b'), 'y');
    });
    expect(getDispatchChild(root, 'side')).toBe(side);
    expect(getDispatchChild(side, 'text')).toBe(text);
    expect(text.emit).toBeUndefined();
    expect(side.emit).toEqual(value);
    expect(runtime.latentRaw.has(latent('/side/nested', 'string'))).toBe(true);
    dispatchSetValue(getDispatchChild(side, 'flag'), true);
    expect(getDispatchChild(side, 'nested').emit).toBe('N');
  });

  it('62C-01 NODE-051 keeps positional item identity for batched array verbs', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' } } },
    });
    dispatchMount(root, [{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    const first = root.children![0];
    const third = root.children![2];
    dispatchBatch(root, () => {
      dispatchRemove(root, 0);
      dispatchUpdate(root, 1, { name: 'C2' });
    });
    expect(root.emit).toEqual([{ name: 'b' }, { name: 'C2' }]);
    expect(root.children![0]).toBe(first);
    expect(third.detached).toBe(true);
  });

  it('191C-01 pins the replaced-exit clause for a written path inside a batch', () => {
    const { root, runtime } = createDispatchTree(
      kindSchema(false),
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { k: 'a', value: 's' });
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'k'), 'b');
      dispatchSetValue(getDispatchChild(root, 'value'), 5);
    });
    expect(root.emit).toEqual({ k: 'b', value: 5 });
    expect(runtime.latentRaw.has(latent('/value', 'string'))).toBe(false);
  });

  it('191C-01 pins the automatic-origin skip: a batched trim keeps the other-kind latent raw', () => {
    const { root, runtime } = createDispatchTree(
      kindSchema(true),
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { k: 'b', value: 5 });
    dispatchSetValue(getDispatchChild(root, 'k'), 'a');
    dispatchSetValue(root, { value: ' s ' }, SetValueOption.Merge);
    expect(runtime.latentRaw.has(latent('/value', 'number'))).toBe(true);
    dispatchBatch(root, () => {
      dispatchFinishInput(getDispatchChild(root, 'value'));
      dispatchSetValue(getDispatchChild(root, 'other'), 'x');
    });
    expect(root.emit).toEqual({ k: 'a', value: 's', other: 'x' });
    expect(runtime.latentRaw.has(latent('/value', 'number'))).toBe(true);
  });

  it('191C-01 pins replacement without a root scope: a batched same-node double write keeps latent raw', () => {
    const { root, runtime } = createDispatchTree(
      kindSchema(false),
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { k: 'a', value: 's' });
    const k = getDispatchChild(root, 'k');
    dispatchBatch(root, () => {
      dispatchSetValue(k, 'b');
      dispatchSetValue(k, 'b');
    });
    expect(runtime.latentRaw.has(latent('/value', 'string'))).toBe(true);
  });
});

describe('other-kind re-entry inside a batch (R1, 195C-01 F2)', () => {
  it('restores the latent string on a single re-entry write (control)', () => {
    const { root, runtime } = createDispatchTree(
      kindSchema(true),
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { k: 'a', value: 's' });
    dispatchSetValue(getDispatchChild(root, 'k'), 'b');
    dispatchSetValue(root, { value: 5 }, SetValueOption.Merge);
    expect(root.emit).toEqual({ k: 'b', value: 5 });
    dispatchSetValue(getDispatchChild(root, 'k'), 'a');
    expect(root.emit).toEqual({ k: 'a', value: 's' });
    expect(runtime.latentRaw.has(latent('/value', 'number'))).toBe(true);
  });

  it('restores the latent string when the re-entry write shares a batch with another path', () => {
    const { root, runtime } = createDispatchTree(
      kindSchema(true),
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { k: 'a', value: 's' });
    dispatchSetValue(getDispatchChild(root, 'k'), 'b');
    dispatchSetValue(root, { value: 5 }, SetValueOption.Merge);
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'k'), 'a');
      dispatchSetValue(getDispatchChild(root, 'other'), 'x');
    });
    expect(root.emit).toEqual({ k: 'a', value: 's', other: 'x' });
    expect(runtime.latentRaw.has(latent('/value', 'number'))).toBe(true);
  });

  it('leaves the other-kind node empty when a batched double write switches the branch', () => {
    const { root, runtime } = createDispatchTree(
      kindSchema(false),
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { k: 'a', value: 's' });
    const k = getDispatchChild(root, 'k');
    dispatchBatch(root, () => {
      dispatchSetValue(k, 'b');
      dispatchSetValue(k, 'b');
    });
    expect(root.emit).toEqual({ k: 'b' });
    expect(getDispatchChild(root, 'value').emit).toBe(undefined);
    expect(runtime.latentRaw.has(latent('/value', 'string'))).toBe(true);
  });

  it('prunes only the latent raw of the sibling a batched virtual overwrite replaces while the branch switches', () => {
    const schema = {
      type: 'object',
      properties: {
        k: { type: 'string' },
        m: { type: 'string' },
        endDate: { type: 'string' },
      },
      allOf: [
        {
          if: { properties: { k: { const: 'a' } }, required: ['k'] },
          then: {
            properties: {
              startDate: { type: 'string' },
              value: { type: 'string' },
            },
          },
          else: {
            properties: {
              startDate: { type: 'number' },
              value: { type: 'number' },
            },
          },
        },
        {
          if: { properties: { m: { const: 'x' } }, required: ['m'] },
          then: { properties: { tag: { type: 'string' } } },
          else: { properties: { tag: { type: 'number' } } },
        },
      ],
      options: { virtual: { period: { fields: ['startDate', 'endDate'] } } },
    } as const;
    const run = (write: (root: DispatchTestNode) => void) => {
      const { root, runtime } = createDispatchTree(
        schema,
        undefined,
        createTestValidator(),
      );
      dispatchMount(root, {
        k: 'a',
        m: 'x',
        startDate: 's',
        endDate: 'e',
        value: 'v',
        tag: 't',
      });
      dispatchSetValue(getDispatchChild(root, 'k'), 'b');
      dispatchSetValue(getDispatchChild(root, 'm'), 'y');
      expect(runtime.latentRaw.has(latent('/startDate', 'string'))).toBe(true);
      expect(runtime.latentRaw.has(latent('/value', 'string'))).toBe(true);
      expect(runtime.latentRaw.has(latent('/tag', 'string'))).toBe(true);
      write(root);
      const { startDate: _startDate, ...emit } = root.emit as Record<
        string,
        unknown
      >;
      return {
        emit,
        startDate: runtime.latentRaw.has(latent('/startDate', 'string')),
        value: runtime.latentRaw.has(latent('/value', 'string')),
        tag: runtime.latentRaw.has(latent('/tag', 'string')),
      };
    };
    const sequential = run((root) => {
      dispatchSetValue(getDispatchChild(root, 'period'), [7, 'e2']);
      dispatchSetValue(getDispatchChild(root, 'k'), 'a');
    });
    const batched = run((root) =>
      dispatchBatch(root, () => {
        dispatchSetValue(getDispatchChild(root, 'period'), [7, 'e2']);
        dispatchSetValue(getDispatchChild(root, 'k'), 'a');
      }),
    );
    expect(sequential).toEqual({
      emit: { k: 'a', m: 'y', endDate: 'e2', value: 'v' },
      startDate: false,
      value: false,
      tag: true,
    });
    expect(batched).toEqual(sequential);
  });

  it('values a batch like one whole root write of the composed value, unlike two sequential writes (GOAL-010, 62C-01)', () => {
    const schema = {
      type: 'object',
      properties: { k: { type: 'string' }, endDate: { type: 'string' } },
      if: { properties: { k: { const: 'a' } }, required: ['k'] },
      then: { properties: { startDate: { type: 'string' } } },
      else: { properties: { startDate: { type: 'number' } } },
      options: { virtual: { period: { fields: ['startDate', 'endDate'] } } },
    } as const;
    const run = (write: (root: DispatchTestNode) => void) => {
      const { root } = createDispatchTree(
        schema,
        undefined,
        createTestValidator(),
      );
      dispatchMount(root, { k: 'a', startDate: 's', endDate: 'e' });
      dispatchSetValue(getDispatchChild(root, 'k'), 'b');
      write(root);
      return getDispatchChild(root, 'startDate').emit;
    };
    const batched = run((root) =>
      dispatchBatch(root, () => {
        dispatchSetValue(getDispatchChild(root, 'period'), [7, 'e2']);
        dispatchSetValue(getDispatchChild(root, 'k'), 'a');
      }),
    );
    const whole = run((root) =>
      dispatchSetValue(root, { k: 'a', startDate: 7, endDate: 'e2' }),
    );
    const sequential = run((root) => {
      dispatchSetValue(getDispatchChild(root, 'period'), [7, 'e2']);
      dispatchSetValue(getDispatchChild(root, 'k'), 'a');
    });
    expect(batched).toBe('7');
    expect(whole).toBe(batched);
    expect(sequential).toBe(undefined);
  });
});

/** Two real dates composed by one virtual node beside an unrelated field. */
const periodSchema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    note: { type: 'string' },
  },
  options: { virtual: { period: { fields: ['startDate', 'endDate'] } } },
} as const;

describe('virtual writes inside a batch (R2, 195C-01 F6)', () => {
  it('applies a single virtual write to its fields (control)', () => {
    const { root } = createDispatchTree(
      periodSchema,
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { startDate: 's0', endDate: 'e0', note: 'n' });
    dispatchSetValue(getDispatchChild(root, 'period'), ['s1', 'e1']);
    expect(getDispatchChild(root, 'startDate').emit).toBe('s1');
    expect(getDispatchChild(root, 'endDate').emit).toBe('e1');
  });

  it('applies a virtual write made beside another write in one batch', () => {
    const { root, runtime } = createDispatchTree(
      periodSchema,
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { startDate: 's0', endDate: 'e0', note: 'n' });
    const before = runtime.commitNumber ?? 0;
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'period'), ['s1', 'e1']);
      dispatchSetValue(getDispatchChild(root, 'note'), 'x');
    });
    expect(getDispatchChild(root, 'startDate').emit).toBe('s1');
    expect(getDispatchChild(root, 'endDate').emit).toBe('e1');
    expect(getDispatchChild(root, 'note').emit).toBe('x');
    expect(root.emit).toEqual({ startDate: 's1', endDate: 'e1', note: 'x' });
    expect(runtime.commitNumber).toBe(before + 1);
  });

  it('rejects an invalid virtual shape when it is marked inside a batch, as a single write does', () => {
    const { root } = createDispatchTree(
      periodSchema,
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, { startDate: 's0', endDate: 'e0', note: 'n' });
    expect(() =>
      dispatchBatch(root, () => {
        dispatchSetValue(getDispatchChild(root, 'period'), 'bad');
        dispatchSetValue(getDispatchChild(root, 'note'), 'x');
      }),
    ).toThrow('Invalid virtual node values at /period');
    expect(getDispatchChild(root, 'startDate').emit).toBe('s0');
  });
});
