import { expect, it } from 'vitest';
import { transformErrors } from '../utils/transformErrors';

it.each(['', 'name', 'a/b', 'a~b', 'a~/b'])('routes missing property %j with pointer escaping', (name) => {
  expect(transformErrors([{ keyword: 'required', dataPath: '', schemaPath: '#/required', params: { missingProperty: name } }])[0]?.dataPath).toBe('/' + name.replace(/~/g, '~0').replace(/\//g, '~1'));
});
