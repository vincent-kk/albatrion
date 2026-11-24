import { createRequire } from 'node:module';
import { plugin } from '@canard/schema-form-ajv7-plugin';

// Ajv comes from the plugin directory of the measured tree: the tree root may hoist another major version.
const Ajv = createRequire(new URL('packages/canard/schema-form-ajv7-plugin/package.json', new URL('../../', import.meta.url)))('ajv');
const Ctor = Ajv.default ?? Ajv;
const createAjv = () => new Ctor({ allErrors: true, strict: false, validateFormats: false });
const verify = async (validate) => { if ((await validate('ok')) !== null) throw new Error('compiled validator rejected a valid string'); };

export default { pkg: '@canard/schema-form-ajv7-plugin', fn: 'compile', input: 'string schema with a root id on a freshly bound instance', inputKind: 'repaired', kind: 'render', setup: () => {
  let schema;
  return { before: () => { plugin.validator.bind(createAjv()); schema = { $id: 'https://example.test/root', type: 'string' }; }, run: () => plugin.validator.compile(schema), check: (validate) => typeof validate === 'function', after: verify };
} };
