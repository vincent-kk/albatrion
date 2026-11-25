import { createRequire } from 'node:module';
import { createValidatorFactory } from '@canard/schema-form-ajv8-plugin';

// Ajv comes from the plugin directory of the measured tree: the tree root may hoist another major version.
const Ajv = createRequire(new URL('packages/canard/schema-form-ajv8-plugin/package.json', new URL('../../', import.meta.url)))('ajv');
const Ctor = Ajv.default ?? Ajv;
const createAjv = () => new Ctor({ allErrors: true, strict: false, validateFormats: false });
const verify = async (validate) => { if ((await validate('ok')) !== null) throw new Error('compiled validator rejected a valid string'); };

export default { pkg: '@canard/schema-form-ajv8-plugin', fn: 'factory compile on a fresh instance', input: 'string schema with an id on a fresh instance', inputKind: 'repaired', kind: 'render', setup: () => {
  let ajv, schema;
  return { before: () => { ajv = createAjv(); schema = { $id: 'https://example.test/fresh', type: 'string' }; }, run: () => createValidatorFactory(ajv)(schema), check: (validate) => typeof validate === 'function', after: verify };
} };
