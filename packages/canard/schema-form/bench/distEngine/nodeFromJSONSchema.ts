// Loaded by the exact fixture alias in vitest.bench.config.ts before the general source alias.
import { loadDistEngine } from './loadDistEngine';

const { create, distSha256, ValidationMode } = await loadDistEngine();
console.info(
  '[schema-form bench engine]',
  JSON.stringify({ source: 'dist', distSha256 }),
);

export { create as nodeFromJSONSchema, ValidationMode };
