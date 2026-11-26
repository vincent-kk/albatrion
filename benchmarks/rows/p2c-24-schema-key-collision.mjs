import { createReferenceResolver } from '@winglet/json-schema';

export default { pkg: '@winglet/json-schema', fn: 'resolve', input: 'embedded ID colliding with registered document', inputKind: 'repaired', kind: 'render', setup: () => {
  const schema = { $id: 'https://ex.example/root.json' };
  const resources = { 'https://ex.example/a.json': { $id: 'https://ex.example/a.json', $defs: { B: { $id: 'https://ex.example/b.json', type: 'string' } } }, 'https://ex.example/b.json': { $id: 'https://ex.example/b.json', type: 'number' } };
  let resolver, context;
  return { before: () => { resolver = createReferenceResolver(schema, { resources }); context = resolver.root(schema); resolver.resolve('a.json', '$ref', context); }, run: () => { try { return resolver.resolve('b.json', '$ref', context); } catch (error) { return error; } }, check: (result) => result instanceof Error || (result.status === 'resolved' && result.target.type === 'string') };
} };
