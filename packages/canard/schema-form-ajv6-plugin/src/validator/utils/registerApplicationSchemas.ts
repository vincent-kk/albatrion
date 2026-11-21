import type AjvModule from 'ajv';

type Ajv = AjvModule.Ajv;

/** Replays application resources in native address order, including explicit aliases. */
export const registerApplicationSchemas = (source: Ajv, target: Ajv): void => {
  const copies = new Map<object, object>();
  for (const [key, entry] of [...Object.entries(source._schemas), ...Object.entries(source._refs)]) {
    if (!entry || typeof entry === 'string' || Object.prototype.hasOwnProperty.call(target._schemas, key) ||
        Object.prototype.hasOwnProperty.call(target._refs, key) ) continue;
    const copy = copies.get(entry) ?? JSON.parse(JSON.stringify(entry.schema));
    copies.set(entry, copy);
    if (entry.meta) target.addMetaSchema(copy, key);
    else target.addSchema(copy, key);
  }
  for (const [key, value] of Object.entries(source._refs))
    if (typeof value === 'string') target._refs[key] = value;
};
