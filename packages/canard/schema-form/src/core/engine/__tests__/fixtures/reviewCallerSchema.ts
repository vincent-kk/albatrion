import type { AuthoredSchema } from '../../types/jsonSchema';

/** Build a schema with independently gated parent or nested addresses. */
export const reviewCallerSchema = (
  activity: string,
  arity: number,
): AuthoredSchema => {
  const leaf = { type: 'string' } as const;
  const controls = { active: '/open === true' };
  return {
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      other: { type: 'boolean' },
      x: leaf,
      o: {
        type: ['object', 'null'],
        ...(['inactive1', 'retained'].includes(activity) && { controls }),
        properties: {
          a: leaf,
          b: leaf,
          inner: {
            type: ['object', 'null'],
            ...(activity === 'inactive2' && { controls }),
            properties: { n: leaf },
          },
        },
      },
      arr: { type: 'array', items: leaf },
    },
    options: { virtual: { g: { fields: arity === 1 ? ['x'] : ['x', 'o'] } } },
  };
};
