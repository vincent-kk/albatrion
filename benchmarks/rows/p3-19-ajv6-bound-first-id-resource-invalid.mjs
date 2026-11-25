import { createRequire } from 'node:module';
import { plugin } from '@canard/schema-form-ajv6-plugin';

// Ajv comes from the plugin directory of the measured tree: the tree root may hoist another major version.
const Ajv = createRequire(new URL('packages/canard/schema-form-ajv6-plugin/package.json', new URL('../../', import.meta.url)))('ajv');
const Ctor = Ajv.default ?? Ajv;

export default { pkg: '@canard/schema-form-ajv6-plugin', fn: 'first failing validation', input: 'identified local resource with a not-required rule, first failure of a fresh compile', inputKind: 'repaired', kind: 'render', setup: () => {
  const data = { used: { named: { x: 1 } } };
  let validate;
  return {
    before: () => {
      plugin.validator.bind(new Ctor({ allErrors: true }));
      validate = plugin.validator.compile({ definitions: { item: { $id: 'https://example.test/item', type: 'object', properties: { named: { type: 'object', not: { required: ['x'] } } } } }, properties: { used: { $ref: 'https://example.test/item' } } });
    },
    run: () => validate(data),
    check: (issues) => Array.isArray(issues) && issues.some((issue) => issue.keyword === 'not' && issue.dataPath === '/used/named'),
  };
} };
