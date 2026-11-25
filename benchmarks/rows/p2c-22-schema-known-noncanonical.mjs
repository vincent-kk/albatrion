import { createReferenceResolver } from '@winglet/json-schema';

export default { pkg: '@winglet/json-schema', fn: 'resolve', input: 'known embedded ID and 20 noncanonical resource keys', inputKind: 'plain', kind: 'render', setup: () => {
  const schema = { $id: 'https://ex.example/root.json', $defs: { T: { $id: 'https://ex.example/known.json', type: 'string' } } };
  const resources = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`HTTPS://EX.example/doc-${i}.json`, { type: 'number' }]));
  let resolver, context;
  return { before: () => { resolver = createReferenceResolver(schema, { resources }); context = resolver.root(schema); }, run: () => resolver.resolve('HTTPS://EX.example/known.json', '$ref', context), check: (result) => result.status === 'resolved' && result.target.type === 'string' };
} };
