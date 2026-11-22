import { createReferenceResolver } from '@winglet/json-schema';

export default { pkg: '@winglet/json-schema', fn: 'resolve', input: 'first embedded lookup across 20 registered documents', inputKind: 'repaired', kind: 'render', setup: () => {
  const schema = { $id: 'https://ex.example/root.json', type: 'object' };
  const resources = Object.fromEntries(Array.from({ length: 20 }, (_, i) => { const id = `https://ex.example/doc-${i}.json`; return [id, { $id: id, type: 'object', ...(i === 19 ? { $defs: { T: { $id: 'https://ex.example/nested.json', type: 'string' } } } : {}) }]; }));
  let resolver, context;
  return { before: () => { resolver = createReferenceResolver(schema, { resources }); context = resolver.root(schema); }, run: () => resolver.resolve('nested.json', '$ref', context), check: (result) => (result.status === 'skipped' && result.reason === 'unresolved') || (result.status === 'resolved' && result.target.type === 'string') };
} };
