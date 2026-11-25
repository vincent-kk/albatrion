import { createReferenceResolver } from '@winglet/json-schema';
export default { pkg: '@winglet/json-schema', fn: 'resolve', input: 'first miss with 20 resources', inputKind: 'plain', kind: 'render', setup: () => {
  const schema = { $id: 'https://ex.example/root.json', type: 'object' };
  const resources = Object.fromEntries(Array.from({ length: 20 }, (_, i) => { const id = `https://ex.example/doc-${i}.json`; return [id, { $id: id, type: 'string' }]; }));
  let resolver, host;
  return { before: () => { resolver = createReferenceResolver(schema, { resources }); host = resolver.root(schema); }, run: () => resolver.resolve('missing.json', '$ref', host), check: (result) => result.status === 'skipped' && result.reason === 'unresolved' };
} };
