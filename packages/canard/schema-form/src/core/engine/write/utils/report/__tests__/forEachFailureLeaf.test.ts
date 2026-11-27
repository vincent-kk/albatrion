import { expect, it } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { forEachFailureLeaf } from '../forEachFailureLeaf';

/** Build a bundle preserving the supplied array, including holes.
 * @param errors - Candidate contents.
 * @returns A domain bundle with the same element identities. */
const bundle = (errors: unknown[]) =>
  new SchemaFormError(FormErrorCode.MultipleErrors, 'bundle', { errors });

/** Collect host leaves without changing their identity.
 * @param failure - Candidate failure or malformed bundle.
 * @returns Leaves in the traversal's delivery order. */
const leaves = (failure: unknown) => {
  const values: unknown[] = [];
  forEachFailureLeaf(failure, (value) => values.push(value));
  return values;
};

it('DR-17 L1 visits [[A,B],H] in depth-first identity order', () => {
  const A = new Error('A'),
    B = new Error('B'),
    H = new Error('H');
  const result = leaves(bundle([bundle([A, B]), H]));
  expect(result).toHaveLength(3);
  expect(result[0]).toBe(A);
  expect(result[1]).toBe(B);
  expect(result[2]).toBe(H);
});

it('DR-17 L2 visits [A,[B,C],D] in depth-first identity order', () => {
  const A = new Error('A'),
    B = new Error('B'),
    C = new Error('C'),
    D = new Error('D');
  const result = leaves(bundle([A, bundle([B, C]), D]));
  expect(result).toHaveLength(4);
  for (const [index, value] of [A, B, C, D].entries())
    expect(result[index]).toBe(value);
});

it('DR-17 L3 visits exactly [A,self] for a top-level cycle', () => {
  const A = new Error('A');
  const errors: unknown[] = [A];
  const failure = bundle(errors);
  errors.push(failure);
  const result = leaves(failure);
  expect(result).toHaveLength(2);
  expect(result[0]).toBe(A);
  expect(result[1]).toBe(failure);
});

it.each(['empty', 'sparse', 'plain', 'inherited'] as const)(
  'DR-17 L4 preserves %s bundles at both depths',
  (kind) => {
    const A = new Error('A');
    const inherited = new Array(1);
    Object.setPrototypeOf(inherited, { 0: A });
    const failure =
      kind === 'plain'
        ? { code: FormErrorCode.MultipleErrors, details: { errors: [A] } }
        : bundle(
            kind === 'empty'
              ? []
              : kind === 'sparse'
                ? new Array(2)
                : inherited,
          );
    expect(leaves(failure)).toHaveLength(1);
    expect(leaves(failure)[0]).toBe(failure);
    const nested = leaves(bundle([failure, A]));
    expect(nested).toHaveLength(2);
    expect(nested[0]).toBe(failure);
    expect(nested[1]).toBe(A);
  },
);

it.each([
  ['error', new Error('leaf')],
  ['primitive', 'primitive'],
  ['undefined', undefined],
] as const)('DR-17 L5 preserves a non-bundle leaf %s', (_label, failure) => {
  const result = leaves(failure);
  expect(result).toHaveLength(1);
  expect(result[0]).toBe(failure);
});

it('DR-17 L6 visits a prototype-only instance without throwing', () => {
  const bare: SchemaFormError = Object.create(SchemaFormError.prototype);
  Object.defineProperty(bare, 'code', { value: FormErrorCode.MultipleErrors });
  const H = new Error('H');
  const result = leaves(bundle([bare, H]));
  expect(result).toHaveLength(2);
  expect(result[0]).toBe(bare);
  expect(result[1]).toBe(H);
});

it('DR-17 L7 visits a 50000-deep bundle without overflowing', () => {
  const A = new Error('A');
  let failure = bundle([A]);
  for (let depth = 0; depth < 50000; depth++) failure = bundle([failure]);
  const result = leaves(failure);
  expect(result).toHaveLength(1);
  expect(result[0]).toBe(A);
});

it('DR-17 L8 visits a repeated nested bundle as itself', () => {
  const A = new Error('A');
  const shared = bundle([A]);
  const result = leaves(bundle([shared, shared]));
  expect(result).toHaveLength(2);
  expect(result[0]).toBe(A);
  expect(result[1]).toBe(shared);
});
