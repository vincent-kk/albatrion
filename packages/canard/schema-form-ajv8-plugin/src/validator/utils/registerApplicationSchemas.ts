import type { Ajv } from 'ajv';

/** Replays application resources in native address order, including explicit aliases. */
export const registerApplicationSchemas = (source: Ajv, target: Ajv): void => {
  const copies = new Map<object, Parameters<Ajv['addSchema']>[0]>();
  for (const [key, entry] of [...Object.entries(source.schemas), ...Object.entries(source.refs)]) {
    if (!entry || typeof entry === 'string' || Object.prototype.hasOwnProperty.call(target.schemas, key) ||
        Object.prototype.hasOwnProperty.call(target.refs, key) || entry.root !== entry) continue;
    const copy = copies.get(entry) ?? JSON.parse(JSON.stringify(entry.schema));
    copies.set(entry, copy);
    if (entry.meta) target.addMetaSchema(copy, key, false);
    else target.addSchema(copy, key);
  }
  for (const [key, value] of Object.entries(source.refs))
    if (typeof value === 'string') target.refs[key] = value;
};
