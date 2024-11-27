import { describe, expect, it } from 'vitest';

import { getErrorsHash } from './getErrorHash';

describe('getErrorsHash', () => {
  it('should return hash of errors', () => {
    expect(getErrorsHash([])).toBe(0);
  });
  it('should return hash of errors', () => {
    expect(
      getErrorsHash([
        {
          schemaPath: 'name',
          keyword: 'required',
          params: {},
          dataPath: '',
          instancePath: '',
        },
      ]),
    ).toBe(799419317);
  });
});
