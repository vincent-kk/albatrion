import Ajv from 'ajv';
import { expect, it } from 'vitest';
import { transformDataPath } from '../utils/transformDataPath';

it.each(['a-b', 'a/b', 'a~b', "a'b", 'a\\b', 'a\nb', ''])('routes AJV6 property %j as JSON Pointer', (key) => {
  const ajv = new Ajv();
  const validate = ajv.compile({ type: 'object', properties: { [key]: { type: 'number' } } });
  validate({ [key]: 'bad' });
  expect(transformDataPath(validate.errors ?? [])[0]?.dataPath).toBe('/' + key.replace(/~/g, '~0').replace(/\//g, '~1'));
});
it('preserves an existing JSON Pointer empty-name child', () => {
  const ajv = new Ajv({ jsonPointers: true });
  const validate = ajv.compile({ type: 'object', properties: { '': { type: 'number' } } });
  validate({ '': 'bad' });
  expect(transformDataPath(validate.errors ?? [])[0]?.dataPath).toBe('/');
});
