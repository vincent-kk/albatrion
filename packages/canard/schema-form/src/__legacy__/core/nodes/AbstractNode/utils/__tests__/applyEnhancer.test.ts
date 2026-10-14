import { describe, expect, it } from 'vitest';

import { applyEnhancer } from '../applyEnhancer';

/** The validated value is the form value plus validation-only entries, never a node the form value leaves out. */
describe('applyEnhancer', () => {
  it('값이 들고 있는 객체에 잎 항목을 더하고 다른 키는 남겨야 함', () => {
    expect(
      applyEnhancer(
        { target: { kind: 'a' }, other: 1 },
        { target: { marker: 0 } },
      ),
    ).toEqual({ target: { kind: 'a', marker: 0 }, other: 1 });
  });

  it('값에 없는 객체를 만들어 내지 않아야 함', () => {
    // Strict: a `target: undefined` key would still be a node the value does not hold.
    expect(
      applyEnhancer({ kind: 'a' }, { target: { marker: 0 } }),
    ).toStrictEqual({ kind: 'a' });
  });

  it('배열은 들고 있는 아이템에만 적용하고 길이를 늘리지 않아야 함', () => {
    expect(
      applyEnhancer(
        { list: [{ kind: 'a' }] },
        {
          list: [{ marker: 0 }, { marker: 1 }],
        },
      ),
    ).toEqual({ list: [{ kind: 'a', marker: 0 }] });
  });

  it('null이나 원시값을 든 자리는 그대로 두어야 함', () => {
    expect(
      applyEnhancer(
        { target: null, count: 3 },
        {
          target: { marker: 0 },
          count: { marker: 1 },
        },
      ),
    ).toEqual({ target: null, count: 3 });
  });

  it('입력 값과 enhancer를 변경하지 않아야 함', () => {
    const value = { target: { kind: 'a' }, list: [{ kind: 'b' }] };
    const enhancer = { target: { marker: 0 }, list: [{ marker: 1 }] };

    applyEnhancer(value, enhancer);

    expect(value).toEqual({ target: { kind: 'a' }, list: [{ kind: 'b' }] });
    expect(enhancer).toEqual({ target: { marker: 0 }, list: [{ marker: 1 }] });
  });

  it('enhancer가 객체·배열이 아니면 값을 그대로 돌려줘야 함', () => {
    const value = { kind: 'a' };

    expect(applyEnhancer(value, undefined)).toBe(value);
  });
});
