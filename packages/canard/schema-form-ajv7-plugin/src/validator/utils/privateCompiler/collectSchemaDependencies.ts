import type { AjvInstance as Ajv } from '../../types/AjvInstance';
import { instanceIdRegistrationsOf } from '../instanceIdRegistrationsOf';
import { observeIdentity } from './observeIdentity';
import { readKeyword } from './readKeyword';
import { resolveAddress } from './resolveAddress';
import type { SchemaDependencies } from './types';
import { walkSchemas } from './walkSchemas';

/**
 * Collect native resource addresses, external references and asynchronous extension facts.
 * @param source - Native dialect, URI resolver and extension definitions to inspect.
 * @param schema - Detached form root or raw imported document to walk.
 * @param registrationKey - Base address used for resolving relative declarations.
 * @returns Resource, reference, extension and async facts without native compilation.
 */
export const collectSchemaDependencies = (
  source: Ajv,
  schema: object | boolean,
  registrationKey = '',
): SchemaDependencies => {
  const ledger = instanceIdRegistrationsOf(source);
  const identities = (ledger.identities ??= new WeakMap());
  const result: SchemaDependencies = {
    resources: [],
    references: [],
    rules: new Map(),
    formats: new Map(),
    asynchronous: false,
  };
  const bases = new WeakMap<object, string>();
  walkSchemas(schema, (node, pointer, parent, assertion) => {
    let base = parent
      ? (bases.get(parent) ?? registrationKey)
      : registrationKey;
    const id = Reflect.get(node, '$id');
    if (typeof id === 'string') {
      base = resolveAddress(source, base, id);
      if (base && base[0] !== '#')
        result.resources.push({
          address: base,
          schema: node,
          pointer,
          root: pointer === '',
        });
    }
    bases.set(node, base);
    for (const name of ['$anchor', '$dynamicAnchor']) {
      const anchor = Reflect.get(node, name);
      if (typeof anchor === 'string' && base)
        result.resources.push({
          address: resolveAddress(source, base, `#${anchor}`),
          schema: node,
          pointer,
          root: false,
        });
    }
    if (!assertion) return;
    if (Reflect.get(node, '$async') === true) result.asynchronous = true;
    for (const name of Object.keys(node)) {
      const definition = readKeyword(source, name);
      result.rules.set(name, observeIdentity(identities, definition));
      if (
        definition &&
        typeof definition === 'object' &&
        'async' in definition &&
        definition.async === true
      )
        result.asynchronous = true;
    }
    const format = Reflect.get(node, 'format');
    if (typeof format === 'string' && source.opts.validateFormats !== false) {
      const definition = source.formats[format];
      result.formats.set(format, observeIdentity(identities, definition));
      if (
        definition &&
        typeof definition === 'object' &&
        'async' in definition &&
        definition.async === true
      )
        result.asynchronous = true;
    }
    const ref = Reflect.get(node, '$ref');
    if (typeof ref === 'string')
      result.references.push({
        base,
        ref,
        address: resolveAddress(source, base, ref),
      });
  });
  return result;
};
