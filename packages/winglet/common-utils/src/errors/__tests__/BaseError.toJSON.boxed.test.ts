import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { AbortError } from '../AbortError';

// filid:contract base-error-json-boxed-values
describe('BaseError.toJSON boxed values', () => {
  it.each([
    ['number', Object(7), 7],
    ['string', Object('text'), 'text'],
    ['boolean', Object(false), false],
    ['bigint', Object(BigInt('9007199254740993')), '9007199254740993'],
  ])(
    'unboxes a local %s without losing its value',
    (_kind, value, expected) => {
      const error = new AbortError('CODE', 'message', { value });
      expect(error.toJSON().details).toEqual({ value: expected });
      expect(JSON.parse(JSON.stringify(error)).details).toEqual({
        value: expected,
      });
    },
  );

  it.each([
    ['Number', 'Object(7)', 7],
    ['String', 'Object("text")', 'text'],
    ['Boolean', 'Object(false)', false],
    ['BigInt', 'Object(9007199254740993n)', '9007199254740993'],
  ])('unboxes a foreign %s', (_kind, expression, expected) => {
    const value = runInNewContext(expression as string);
    expect(
      new AbortError('CODE', 'message', { value }).toJSON().details,
    ).toEqual({ value: expected });
  });

  it('matches native JSON coercion including non-finite numbers and extra properties', () => {
    const number = Object(7);
    number.valueOf = () => 9;
    const string = Object('original');
    string.toString = () => 'converted';
    const boolean = Object(false);
    boolean.valueOf = () => true;
    const details = {
      number,
      string,
      boolean,
      nan: Object(NaN),
      infinity: Object(Infinity),
    };
    Object.assign(number, { ignored: true });
    expect(new AbortError('CODE', 'message', details).toJSON().details).toEqual(
      JSON.parse(JSON.stringify(details)),
    );
  });

  it('applies custom hooks before unboxing and unboxes their returned values', () => {
    const value = Object(7);
    value.toJSON = (key: string) => ({ key });
    const details = { value, returned: { toJSON: () => Object(false) } };
    expect(new AbortError('CODE', 'message', details).toJSON().details).toEqual(
      JSON.parse(JSON.stringify(details)),
    );
  });

  it('propagates user coercion exceptions', () => {
    const failure = new Error('coercion failed');
    const value = Object(7);
    value[Symbol.toPrimitive] = () => {
      throw failure;
    };
    expect(() => new AbortError('CODE', 'message', { value }).toJSON()).toThrow(
      failure,
    );
  });

  it('retains ordinary property semantics for boxed Symbols', () => {
    const value = Object(Symbol('symbol'));
    value.visible = 1;
    expect(
      new AbortError('CODE', 'message', { value }).toJSON().details,
    ).toEqual({ value: { visible: 1 } });
  });

  it('rejects BigInt returned from a boxed number coercion like native JSON', () => {
    const value = Object(7);
    value[Symbol.toPrimitive] = () => BigInt(1);
    expect(() => JSON.stringify(value)).toThrow(TypeError);
    expect(() => new AbortError('CODE', 'message', { value }).toJSON()).toThrow(
      TypeError,
    );
  });

  it('does not coerce a plain object with a spoofed primitive tag', () => {
    const value = {
      [Symbol.toStringTag]: 'Number',
      valueOf() {
        throw new Error('must not run');
      },
      id: 1,
    };
    expect(
      new AbortError('CODE', 'message', { value }).toJSON().details,
    ).toEqual({ value: { id: 1 } });
  });

  it('unboxes genuine wrappers even when their type tag is customized', () => {
    const values = runInNewContext(
      '[Object(7), Object("text"), Object(false), Object(2n)]',
    ) as object[];
    for (const value of values)
      Object.defineProperty(value, Symbol.toStringTag, { value: 'Custom' });
    expect(
      new AbortError('CODE', 'message', { values }).toJSON().details,
    ).toEqual({ values: [7, 'text', false, '2'] });
  });
});
