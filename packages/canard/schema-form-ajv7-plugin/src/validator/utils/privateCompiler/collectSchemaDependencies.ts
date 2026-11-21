import type { AjvInstance as Ajv } from '../../types/AjvInstance';
import { instanceIdRegistrationsOf } from '../instanceIdRegistrationsOf';
import { observeIdentity } from './observeIdentity';
import { readKeyword } from './readKeyword';
import { readPointer } from './readPointer';
import { resolveAddress } from './resolveAddress';
import type { SchemaDependencies } from './types';
import { walkReferencedSchemas } from './walkReferencedSchemas';
import { walkSchemas } from './walkSchemas';

/**
 * Collect native resource addresses, external references and asynchronous extension facts.
 * @param source - Native dialect, URI resolver and extension definitions to inspect.
 * @param schema - Detached form root or raw imported document to walk.
 * @param registrationKey - Base address used for resolving relative declarations.
 * @param selectedAddress - Optional address of a fragment selected by an importing document.
 * @returns Resource, reference, extension and async facts without native compilation.
 */
export const collectSchemaDependencies = (
  source: Ajv,
  schema: object | boolean,
  registrationKey = '',
  selectedAddress?: string,
): SchemaDependencies => {
  const ledger = instanceIdRegistrationsOf(source);
  const identities = (ledger.identities ??= new WeakMap());
  const result: SchemaDependencies = {
    resources: [],
    references: [],
    rules: new Map(),
    formats: new Map(),
    asynchronous: false,
    hasMacro: false,
  };
  const bases = new WeakMap<object, string>();
  let hidden: WeakSet<object> | undefined;
  const schemaIdOf = (node: object): unknown => {
    return Reflect.get(node, '$id');
  };
  const visitAssertions = (node: object, base: string) => {
    if (Reflect.get(node, '$async') === true) result.asynchronous = true;
    for (const name of Object.keys(node)) {
      if (result.rules.has(name)) continue;
      const definition = readKeyword(source, name);
      result.rules.set(name, observeIdentity(identities, definition));
      if (definition && typeof definition === 'object') {
        if ('macro' in definition && typeof definition.macro === 'function')
          result.hasMacro = true;
        if ('async' in definition && definition.async === true)
          result.asynchronous = true;
      }
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
  };
  walkSchemas(schema, (node, pointer, parent, assertion) => {
    let base = parent
      ? (bases.get(parent) ?? registrationKey)
      : registrationKey;
    const id = schemaIdOf(node);
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
    if (assertion) visitAssertions(node, base);
    else (hidden ??= new WeakSet()).add(node);
  });
  if (result.references.length || selectedAddress)
    walkReferencedSchemas(
      schema,
      registrationKey,
      result,
      (node) => bases.has(node) && !hidden?.has(node),
      (target, pointer) => {
        let ancestor = pointer;
        let base = registrationKey;
        while (ancestor) {
          ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
          const parent = readPointer(schema, ancestor, false);
          if (typeof parent === 'object' && bases.has(parent)) {
            base = bases.get(parent) ?? base;
            break;
          }
        }
        walkSchemas(
          target,
          (node, _pointer, parent, assertion) => {
            if (!assertion || (bases.has(node) && !hidden?.has(node))) return;
            let current = bases.get(node) ?? (parent && bases.get(parent));
            if (current === undefined || !bases.has(node)) {
              const id = schemaIdOf(node);
              const inherited = current ?? base;
              current =
                typeof id === 'string'
                  ? resolveAddress(source, inherited, id)
                  : inherited;
              bases.set(node, current);
            }
            hidden?.delete(node);
            visitAssertions(node, current);
          },
          pointer,
        );
      },
      selectedAddress,
    );
  return result;
};
