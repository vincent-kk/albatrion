/** Enumerate lexical ids of one raw document independently of any compiler cache. */
export const collectOracleIds = (schema: unknown, base: string, idKey: string, ids = new Set<string>(), claims?: Map<string, unknown>): Set<string> => {
  if (!schema || typeof schema !== 'object') return ids;
  if (Array.isArray(schema)) { for (const child of schema) collectOracleIds(child, base, idKey, ids, claims); return ids; }
  const id = Reflect.get(schema, idKey);
  const current = typeof id === 'string' ? new URL(id, base || 'https://oracle.invalid/').href.replace(/#\/?$/, '') : base;
  if (typeof id === 'string') { ids.add(current); claims?.set(current, schema); }
  for (const [name, child] of Object.entries(schema)) if (!['const', 'enum', 'default'].includes(name)) collectOracleIds(child, current, idKey, ids, claims);
  return ids;
};
