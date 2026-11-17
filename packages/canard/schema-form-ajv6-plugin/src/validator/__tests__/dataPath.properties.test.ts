import Ajv from 'ajv';
import { expect, it } from 'vitest';
import { transformDataPath } from '../utils/transformDataPath';

it.each(['a-b', 'a/b', 'a~b', "a'b", 'a\\b', 'a\nb', '', 'a.b', "a']['b"])('routes AJV6 property %j as JSON Pointer', (key) => {
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

it('keeps nested quoted property names separate from numeric array segments', () => {
  const validate = new Ajv().compile({ type: 'object', properties: { 'a.b': { type: 'array', items: { type: 'object', properties: { 'x]y': { type: 'number' } } } } } });
  validate({ 'a.b': [{ 'x]y': 'bad' }] });
  expect(transformDataPath(validate.errors ?? [])[0]?.dataPath).toBe('/a.b/0/x]y');
});

it.each([false, true])('normalizes ordinary nested paths with array=%j', (array) => {
  const child = { type: 'object', properties: { bar: { type: 'number' } } };
  const validate = new Ajv().compile({ type: 'object', properties: { foo: array ? { type: 'array', items: child } : child } });
  validate({ foo: array ? [{ bar: 'bad' }] : { bar: 'bad' } });
  expect(transformDataPath(validate.errors ?? [])[0]?.dataPath).toBe(array ? '/foo/0/bar' : '/foo/bar');
});
