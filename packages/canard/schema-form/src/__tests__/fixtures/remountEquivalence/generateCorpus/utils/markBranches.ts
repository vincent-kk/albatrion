/**
 * Give every generated fragment an independent public observation keyword.
 * @param schema - Fresh generator-owned schema, never a caller's shared object.
 * @param identity - Stable scene identity used to make marker names unique.
 * @returns The same owned schema with non-validation marker keywords.
 */
export function markBranches(
  schema: Record<string, unknown>,
  identity: string,
): Record<string, unknown> {
  const pending: object[] = [schema];
  let next = 0;
  while (pending.length) {
    const value = pending.pop()!;
    for (const [key, child] of Object.entries(value)) {
      const branches =
        ['oneOf', 'anyOf', 'allOf'].includes(key) && Array.isArray(child)
          ? child
          : ['then', 'else'].includes(key)
            ? [child]
            : key === 'dependentSchemas' && child && typeof child === 'object'
              ? Object.values(child)
              : [];
      for (const branch of branches)
        if (branch && typeof branch === 'object')
          Reflect.set(branch, `x-remount-${identity}-${next++}`, true);
      if (child && typeof child === 'object') pending.push(child);
    }
  }
  return schema;
}
