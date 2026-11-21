import type { ModelApplication } from './types';
import { readOracleResource } from './readOracleResource';

/** Independently apply the documented root and embedded-resource collision rules. */
export const checkOracleCollisions = (source: ModelApplication, root: object, version: number): void => {
  const options = Reflect.get(source, '_opts');
  const idKey = version === 6 && options && typeof options === 'object' && Reflect.get(options, 'schemaId') === 'id' ? 'id' : '$id';
  const visit = (node: unknown, base: string) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const child of node) visit(child, base); return; }
    const id = Reflect.get(node, idKey);
    const current = typeof id === 'string' ? new URL(id, base || 'https://oracle.invalid/').href.replace(/#\/?$/, '') : base;
    for (const address of [typeof id === 'string' ? current : undefined, ...['$anchor', '$dynamicAnchor'].map(name => typeof Reflect.get(node, name) === 'string' && current ? current + '#' + Reflect.get(node, name) : undefined)]) {
      if (!address) continue;
      const registered = readOracleResource(source, address);
      if (!registered) continue;
      const equal = JSON.stringify(registered.target) === JSON.stringify(node);
      if (node === root && (version !== 6 || !equal)) throw new Error(`schema with key or id "${address}" already exists`);
      if (!equal) throw new Error(`reference "${address}" resolves to more than one schema`);
    }
    for (const [name, child] of Object.entries(node)) if (!['const', 'enum', 'default'].includes(name)) visit(child, current);
  };
  visit(root, '');
};
