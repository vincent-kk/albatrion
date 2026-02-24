/**
 * Executes async functions with a concurrency limit.
 * Returns PromiseSettledResult[] for error isolation.
 */
export async function asyncPool<T, R>(
  limit: number,
  items: T[],
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  const executing = new Set<Promise<void>>();

  for (const [index, item] of items.entries()) {
    const p = (async () => {
      try {
        const value = await fn(item);
        results[index] = { status: 'fulfilled', value };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    })();

    executing.add(p);
    p.then(() => executing.delete(p));

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
