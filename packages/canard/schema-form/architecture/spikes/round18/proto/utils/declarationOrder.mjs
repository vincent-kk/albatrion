/** Body, allOf, then/else, branches; within each category preserve source order. */
export function declarationOrder(schema) {
  const order = new WeakMap();
  let next = 0;
  const walk = part => {
    if (!part || typeof part !== 'object') return;
    for (const key of Object.keys(part)) {
      if (key === '&derived' && part[key]) order.set(part[key], next++);
      if (key === '&injectTo') for (const rule of Array.isArray(part[key]) ? part[key] : [part[key]]) order.set(rule, next++);
      if (key === '&clearValue') order.set(part, { clearValue: next++ });
      if (key === 'properties') for (const child of Object.values(part.properties)) walk(child);
    }
    for (const child of part.allOf ?? []) walk(child);
    walk(part.then); walk(part.else);
    for (const key of ['oneOf', 'anyOf']) for (const child of part[key] ?? []) walk(child);
  };
  walk(schema);
  return order;
}
