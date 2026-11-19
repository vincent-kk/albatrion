import type { ModelApplication } from './types';

/** Read the current raw registration and alias chain without invoking native compilation. */
export const readOracleResource = (source: ModelApplication, address: string) => {
  const schemas = Reflect.get(source, '_schemas') ?? Reflect.get(source, 'schemas');
  const refs = Reflect.get(source, '_refs') ?? Reflect.get(source, 'refs');
  const visited = new Set<string>();
  let key = address.replace(/#\/?$/, '');
  let fragment: string | undefined;
  while (!visited.has(key)) {
    visited.add(key);
    const value = (schemas && Object.prototype.hasOwnProperty.call(schemas, key) ? Reflect.get(schemas, key) : undefined) ?? (refs && Object.prototype.hasOwnProperty.call(refs, key) ? Reflect.get(refs, key) : undefined);
    if (typeof value === 'string') { key = value.replace(/#\/?$/, ''); continue; }
    if (value && typeof value === 'object' && 'schema' in value) {
      if (fragment !== undefined && fragment && fragment[0] !== '/') return undefined;
      let target: unknown = value.schema;
      if (fragment) for (const encoded of decodeURIComponent(fragment).slice(1).split('/')) {
        const name = encoded.replace(/~1/g, '/').replace(/~0/g, '~');
        if (!target || typeof target !== 'object' || !Object.prototype.hasOwnProperty.call(target, name)) return undefined;
        target = Reflect.get(target, name);
      }
      return { key, schema: value.schema, target, meta: !!Reflect.get(value, 'meta') };
    }
    const hash = key.indexOf('#');
    if (hash < 0) return undefined;
    fragment = key.slice(hash + 1);
    key = key.slice(0, hash);
  }
  return undefined;
};
