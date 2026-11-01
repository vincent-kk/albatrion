// Loaded by register.mjs; copied bundle imports resolve from the recorded original bundle location.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const origins = new Map();
/** Resolve only copied engine parents; all other module resolution stays with Node. */
export async function resolve(specifier, context, next) {
  const parent = context.parentURL;
  if (
    parent?.startsWith('file:') &&
    /\/engines\/(current|legacy)\.mjs$/.test(parent)
  ) {
    const manifestURL = new URL('../engines.json', parent);
    if (!origins.has(manifestURL.href))
      origins.set(
        manifestURL.href,
        JSON.parse(fs.readFileSync(manifestURL, 'utf8')).engines,
      );
    const engine = parent.endsWith('/current.mjs') ? 'current' : 'legacy';
    return next(specifier, {
      ...context,
      parentURL: pathToFileURL(origins.get(manifestURL.href)[engine].source)
        .href,
    });
  }
  return next(specifier, context);
}
