import { createReferenceResolver } from '@winglet/json-schema';

export default { pkg: '@winglet/json-schema', fn: 'resolve', input: 'one registration spelled in upper case among 21 resources', inputKind: 'repaired', kind: 'render', setup: () => {
  const resources = { 'HTTPS://Ex.Example/types.json': { type: 'string' }, ...Object.fromEntries(Array.from({ length: 20 }, (_, i) => { const id = `https://ex.example/doc-${i}.json`; return [id, { $id: id, type: 'string' }]; })) };
  let resolver, context, schema;
  return {
    before: () => { schema = { $id: 'https://ex.example/root.json', type: 'object' }; resolver = createReferenceResolver(schema, { resources }); context = resolver.root(schema); },
    run: () => resolver.resolve('types.json', '$ref', context),
    check: (result) => !!result && typeof result === 'object' && 'status' in result,
  };
} };
