import { expect, it } from 'vitest';
import { transformErrors } from '../utils/transformErrors';

it('routes an empty missing property to the empty-name child', () => {
  expect(transformErrors([{ keyword: 'required', dataPath: '', schemaPath: '#/required', params: { missingProperty: '' } }])[0]?.dataPath).toBe('/');
});
