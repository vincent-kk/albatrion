// Preloaded by Node in each slot to record both ESM and CommonJS resolutions.
import { registerHooks } from 'node:module';

const urls = new Set([import.meta.url]);
globalThis[Symbol.for('speed.resolvedUrls')] = urls;
registerHooks({
  resolve(specifier, context, nextResolve) {
    const result = nextResolve(specifier, context);
    if (result.url.startsWith('file:')) urls.add(result.url);
    return result;
  },
});
