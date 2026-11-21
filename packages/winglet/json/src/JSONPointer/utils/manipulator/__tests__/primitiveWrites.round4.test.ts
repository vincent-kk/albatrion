import { expect, it } from 'vitest';
import { setValue } from '../setValue';

for (const value of [0, 1, '', 'text', true, false])
  for (const tail of ['/b', '/b/c'])
    it(`round-4 invalid write below ${String(value)}${tail}`, () => {
      let error: unknown;
      try { setValue({ a: value }, '/a' + tail, 7); } catch (caught) { error = caught; }
      expect(error).toMatchObject({ name: 'JSONPointer', specific: 'INVALID_INPUT', code: 'JSON_POINTER.INVALID_INPUT' });
    });
