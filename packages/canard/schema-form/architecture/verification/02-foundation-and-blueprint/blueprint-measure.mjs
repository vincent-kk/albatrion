import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';

import { corpus } from '../../spikes/guard-cost/redteam3/corpus.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const server = await createServer({
  root,
  configFile: false,
  resolve: { alias: { '@/schema-form': `${root}src` } },
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});
try {
  const { blueprint } = await server.ssrLoadModule('/src/core/blueprint/index.ts');
  const corpusResults = corpus.map((sample) => {
    const started = performance.now();
    try {
      const result = blueprint(sample.root);
      return { id: sample.id, accepted: true, nodes: result.nodes.length, milliseconds: performance.now() - started };
    } catch (error) {
      return { id: sample.id, accepted: false, code: error.specific ?? error.code, message: error.message, milliseconds: performance.now() - started };
    }
  });
  const rows = [];
  for (const size of [100, 1000, 5000]) {
    const schema = {
      type: 'object',
      $defs: { Shared: { type: 'object', properties: { value: { type: 'string' } } } },
      properties: Object.fromEntries(Array.from({ length: size }, (_, index) => [`field${index}`, { $ref: '#/$defs/Shared' }])),
    };
    const samples = [];
    let nodes;
    for (let iteration = 0; iteration < 7; iteration++) {
      const started = performance.now();
      const result = blueprint(schema);
      samples.push(performance.now() - started);
      nodes = result.nodes.length;
      assert.equal(result.root.childEntries.length, size);
    }
    rows.push({ references: size, nodes, samplesMilliseconds: samples, medianMilliseconds: [...samples].sort((a, b) => a - b)[3], cache: false });
  }
  console.log(JSON.stringify({ node: process.version, corpus: corpusResults, rows }, null, 2));
} finally {
  await server.close();
}
