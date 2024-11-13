import type { JsonSchema } from '@lumy/schema-form/types';

export const getDataWithSchema = (
  data: any,
  schema: JsonSchema,
  options?: { ignoreAnyOf: boolean },
): any => {
  let node = { ...schema };
  if (
    node.type === 'object' &&
    typeof node.properties === 'object' &&
    data &&
    typeof data === 'object' &&
    !Array.isArray(data)
  ) {
    let items: any[];
    let omit: string[] = [];
    const { anyOf } = node;
    if (
      options?.ignoreAnyOf !== true &&
      Array.isArray(anyOf) &&
      anyOf.length > 0
    ) {
      const required: string[] = [...(node.required || [])];
      const notRequired: string[] = [];
      anyOf
        .filter(
          (item: any) => item?.properties && Array.isArray(item?.required),
        )
        .forEach(({ properties, required: _required }: any) => {
          const key = Object.keys(properties || {})[0];
          if ((properties?.[key]?.enum || []).includes(data?.[key])) {
            return required.push(..._required);
          }
          return notRequired.push(..._required);
        });
      omit = notRequired.filter((field) => !required.includes(field));
    }
    try {
      items = Object.entries(node.properties).map(([k, v]) => {
        if (k in data && !omit.includes(k)) {
          return [k, getDataWithSchema(data[k], v, options)];
        }
        return false;
      });
    } catch (err: any) {
      throw err;
    }
    return Object.fromEntries(items.filter(Boolean));
  } else if (
    node.type === 'array' &&
    typeof node.items === 'object' &&
    Array.isArray(data)
  ) {
    return data.map((e) => getDataWithSchema(e, node.items, options));
  }
  return data;
};
