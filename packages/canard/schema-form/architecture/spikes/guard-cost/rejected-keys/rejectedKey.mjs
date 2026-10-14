// Spike: derive the JSON-pointer path of the key a validator rejected, from a normalized
// PublicJSONSchemaError { dataPath, schemaPath, keyword, details } (the shape every ajv plugin already emits).
// Runs over the plugin-normalized error, so it is validator-independent given the plugin's transform;
// the same logic can sit inside the plugin over the raw ajv ErrorObject (instancePath/params).

const ROOT_POINTERS = new Set(['', '/']); // ajv6/7/8 plugins emit '/' for the root; the type doc says ''

/** RFC 6901 escape of one key, appended to a base pointer. */
const joinPointer = (base, key) =>
  (ROOT_POINTERS.has(base) ? '' : base) + '/' + String(key).replace(/~/g, '~0').replace(/\//g, '~1');

/** Walks a '#/a/b' schemaPath (or a '/a/b' data pointer) inside `root`; undefined when unresolvable ($ref, external). */
const resolvePointer = (root, pointer) => {
  const path = pointer.startsWith('#') ? pointer.slice(1) : pointer;
  if (ROOT_POINTERS.has(path)) return root;
  if (!path.startsWith('/')) return undefined; // 'other.json#/...' style ref: not local
  let node = root;
  for (const seg of path.slice(1).split('/')) {
    if (node == null) return undefined;
    node = node[seg.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  return node;
};

/**
 * Returns the JSON pointer of the key the error rejects, or null when the error carries no single key.
 *
 * Derivable: `false schema` under properties/patternProperties/items (dataPath IS the key),
 * additionalProperties / unevaluatedProperties / propertyNames (key in details),
 * `not` whose subschema is exactly `{ required: [one] }` (resolved through schemaPath in `schema`).
 * Not derivable: `not` with 2+ required names or any other keyword, if/oneOf/anyOf combinator
 * errors, dependencies/dependentRequired (a missing key, not a rejected one), and the inner
 * sub-error of propertyNames (its sibling `propertyNames` error carries the key).
 *
 * @param error - normalized error: dataPath (RFC 6901, '' or '/' = root), schemaPath ('#/...'), keyword, details
 * @param schema - the root schema the validator compiled (only read for `not`)
 * @param value - the root value that was validated (only read for `not`, as a guard)
 * @returns pointer such as '/host/x', or null
 */
export function rejectedKey(error, schema, value) {
  const { dataPath = '', schemaPath = '', keyword, details = {} } = error;
  if (schemaPath.includes('/propertyNames/')) return null;
  switch (keyword) {
    case 'false schema':
      return ROOT_POINTERS.has(dataPath) ? null : dataPath;
    case 'additionalProperties':
      return details.additionalProperty == null ? null : joinPointer(dataPath, details.additionalProperty);
    case 'unevaluatedProperties':
      return details.unevaluatedProperty == null ? null : joinPointer(dataPath, details.unevaluatedProperty);
    case 'propertyNames':
      return details.propertyName == null ? null : joinPointer(dataPath, details.propertyName);
    case 'not': {
      const sub = resolvePointer(schema, schemaPath);
      if (!sub || typeof sub !== 'object') return null;
      const keys = Object.keys(sub).filter((k) => k !== '$comment' && k !== 'description' && k !== 'title');
      if (keys.length !== 1 || keys[0] !== 'required' || !Array.isArray(sub.required) || sub.required.length !== 1) return null;
      const host = resolvePointer(value, dataPath);
      if (host == null || typeof host !== 'object' || !(sub.required[0] in host)) return null;
      return joinPointer(dataPath, sub.required[0]);
    }
    default:
      return null;
  }
}
