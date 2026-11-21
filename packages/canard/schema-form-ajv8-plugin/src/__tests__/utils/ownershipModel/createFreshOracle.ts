import type { ModelApplication, ModelProfile } from './types';
import { collectOracleIds } from './collectOracleIds';
import { readOracleResource } from './readOracleResource';

/** Rebuild requested raw references and current meta documents, never reusing compiled environments. */
export const createFreshOracle = <T extends ModelApplication>(
  source: T,
  profile: ModelProfile<T>,
  root: object | boolean = {},
): T => {
  const fresh = profile.createFresh(source);
  const schemas =
    Reflect.get(source, '_schemas') ?? Reflect.get(source, 'schemas');
  const refs = Reflect.get(source, '_refs') ?? Reflect.get(source, 'refs');
  if (
    !schemas ||
    typeof schemas !== 'object' ||
    !refs ||
    typeof refs !== 'object'
  )
    throw new TypeError('Oracle registries are missing');
  const copied = new Map<unknown, object | boolean>();
  const entries = [...Object.entries(schemas), ...Object.entries(refs)];
  for (const isMeta of [true, false])
    for (const [key, entry] of entries) {
      if (
        !entry ||
        typeof entry !== 'object' ||
        !('schema' in entry) ||
        (!isMeta || !Reflect.get(entry, 'meta')) ||
        !key ||
        (profile.version !== 6 &&
          'root' in entry &&
          entry.root &&
          entry.root !== entry)
      )
        continue;
      if (
        profile.version === 6 &&
        'root' in entry &&
        entry.root &&
        (typeof entry.root === 'object' || typeof entry.root === 'function') &&
        Reflect.get(entry.root, 'schema') !== entry.schema
      )
        continue;
      let schema = copied.get(entry);
      if (schema === undefined) {
        schema = JSON.parse(JSON.stringify(entry.schema));
        if (schema === undefined) throw new Error('Oracle schema is missing');
        copied.set(entry, schema);
      }
      const targetSchemas =
        Reflect.get(fresh, '_schemas') ?? Reflect.get(fresh, 'schemas');
      if (!targetSchemas || typeof targetSchemas !== 'object')
        throw new TypeError('Oracle schema registry is missing');
      if (Object.prototype.hasOwnProperty.call(targetSchemas, key)) continue;
      if (isMeta && typeof schema === 'object')
        profile.addMeta(fresh, schema, key);
      else fresh.addSchema(schema, key);
    }
  const imported = new Set<unknown>();
  const usedAliases = new Map<string, string>();
  const claimed = new Map<string, { schema: unknown; key: string }>();
  const importReferences = (schema: unknown, base = '', localIds?: Set<string>, importedDocument = false, documentId = '') => {
    if (!schema || typeof schema !== 'object') return;
    if (Array.isArray(schema)) { for (const child of schema) importReferences(child, base, localIds, importedDocument, documentId); return; }
    const nativeOptions = Reflect.get(source, '_opts');
    const legacyId = profile.version === 6 && nativeOptions && typeof nativeOptions === 'object' && Reflect.get(nativeOptions, 'schemaId') === 'id';
    const idKey = legacyId ? 'id' : '$id';
    if (!localIds) {
      localIds = collectOracleIds(schema, base, idKey);
      const own = Reflect.get(schema, idKey);
      if (typeof own === 'string') documentId = new URL(own, base || 'https://oracle.invalid/').href.replace(/#\/?$/, '');
    }
    const ownId = Reflect.get(schema, idKey);
    const current = typeof ownId === 'string' ? new URL(ownId, base || 'https://oracle.invalid/').href : base;
    const ref = Reflect.get(schema, '$ref');
    if (typeof ref === 'string' && ref[0] !== '#') {
      const address = new URL(ref, current || 'https://oracle.invalid/').href;
      if (!(importedDocument ? documentId === address.split('#')[0] : localIds.has(address.split('#')[0]))) {
      const resource = readOracleResource(source, address);
      if (!resource) {
        const Missing = Reflect.get(source.constructor, 'MissingRefError');
        if (typeof Missing === 'function') {
          const nativeOptions = Reflect.get(source, 'opts');
          throw Reflect.construct(Missing, profile.version === 8 ? [nativeOptions && typeof nativeOptions === 'object' ? Reflect.get(nativeOptions, 'uriResolver') : undefined, current, ref] : [current, ref]);
        }
        throw new Error(`Cannot resolve current application reference ${address}`);
      }
      for (const [key, value] of resource.aliases) usedAliases.set(key, value);
      if (resource && !imported.has(resource.schema)) {
        const declarations = new Map<string, unknown>();
        collectOracleIds(resource.schema, resource.key, idKey, undefined, declarations);
        for (const [normalized, schema] of declarations) {
          const previous = claimed.get(normalized);
          if (previous && JSON.stringify(previous.schema) !== JSON.stringify(schema)) throw new Error(`Conflicting application schema id "${normalized}" through keys "${previous.key}" and "${address}"`);
          claimed.set(normalized, { schema, key: address });
        }
        imported.add(resource.schema);
        const copy = JSON.parse(JSON.stringify(resource.schema));
        fresh.addSchema(copy, resource.key);
        importReferences(resource.schema, resource.key, undefined, true);
      }
      }
    }
    for (const [name, child] of Object.entries(schema)) if (!['const', 'enum', 'default'].includes(name)) importReferences(child, current, localIds, importedDocument, documentId);
  };
  importReferences(root);
  const targetRefs = Reflect.get(fresh, '_refs') ?? Reflect.get(fresh, 'refs');
  if (!targetRefs || typeof targetRefs !== 'object')
    throw new TypeError('Oracle reference registry is missing');
  for (const [key, entry] of usedAliases) Reflect.set(targetRefs, key, entry);
  const sourceOptions =
    Reflect.get(source, '_opts') ?? Reflect.get(source, 'opts');
  const options = Reflect.get(fresh, '_opts') ?? Reflect.get(fresh, 'opts');
  if (
    options &&
    typeof options === 'object' &&
    sourceOptions &&
    typeof sourceOptions === 'object'
  ) {
    Reflect.set(
      options,
      'validateSchema',
      Reflect.get(sourceOptions, 'validateSchema'),
    );
    const configuredMeta = Reflect.get(sourceOptions, 'meta');
    if (configuredMeta && typeof configuredMeta === 'object') {
      const address =
        Reflect.get(configuredMeta, '$id') ?? Reflect.get(configuredMeta, 'id');
      if (typeof address === 'string')
        Reflect.set(options, 'defaultMeta', address);
    }
    if (profile.version === 6) {
      Reflect.set(options, 'jsonPointers', true);
      Reflect.set(options, 'errorDataPath', 'object');
      Reflect.set(options, '_errorDataPathProperty', false);
    }
  }
  return fresh;
};
