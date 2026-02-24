# Advanced Patterns for @winglet/data-loader

## Solving the N+1 Problem in GraphQL

The classic N+1 pattern appears when resolvers load related data naively:

```typescript
// BAD: N+1 queries — one query per post
const resolvers = {
  Post: {
    author: (post) => db.findUser(post.authorId), // called N times
  },
};

// GOOD: All author IDs batched into one query
function createLoaders() {
  return {
    users: new DataLoader(async (ids: ReadonlyArray<string>) => {
      const users = await db.findUsersByIds([...ids]);
      return ids.map(id => users.find(u => u.id === id) ?? new Error(`Not found: ${id}`));
    }),
  };
}

const resolvers = {
  Post: {
    author: (post, _args, { loaders }) => loaders.users.load(post.authorId),
  },
};
```

### Per-Request Loader Instances

Always create fresh loaders per request. Sharing loaders across requests leaks data between users.

```typescript
// Express + GraphQL
app.use('/graphql', (req, res, next) => {
  // Fresh loaders for every request — no cross-request cache pollution
  const loaders = createLoaders();
  graphqlHTTP({ schema, context: { loaders, user: req.user } })(req, res, next);
});

// Apollo Server
const server = new ApolloServer({
  schema,
  context: ({ req }) => ({
    loaders: createLoaders(), // called once per request
  }),
});
```

## Custom Cache Implementations

### LRU Cache (size-bounded)

```typescript
import LRU from 'lru-cache';

const userLoader = new DataLoader(batchLoadUsers, {
  cacheMap: new LRU<string, Promise<User>>({ max: 500 }),
});
```

### TTL Cache

```typescript
class TtlMap<K, V> {
  private store = new Map<K, { value: V; expiresAt: number }>();
  constructor(private ttlMs: number) {}

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  delete(key: K) { this.store.delete(key); }
  clear()        { this.store.clear(); }
}

const priceLoader = new DataLoader(batchLoadPrices, {
  cacheMap: new TtlMap<string, Promise<Price>>(60_000), // 1-minute TTL
});
```

### Shared Cache Between Loaders

```typescript
const sharedCache = new Map<string, Promise<User>>();

const primaryLoader = new DataLoader(batchFromPrimary, { cache: sharedCache });
const replicaLoader = new DataLoader(batchFromReplica, { cache: sharedCache });
// Both loaders share the same promise cache
```

## Complex Keys with cacheKeyFn

When keys are objects, reference equality fails. Use `cacheKeyFn` to derive a string cache key.

```typescript
interface ProductQuery {
  id: string;
  currency: 'USD' | 'EUR' | 'KRW';
  includeVariants?: boolean;
}

const productLoader = new DataLoader<ProductQuery, Product, string>(
  async (queries) => {
    const results = await Promise.all(queries.map(q => fetchProduct(q)));
    return results; // order preserved since we map 1:1
  },
  {
    cacheKeyFn: ({ id, currency, includeVariants = false }) =>
      `${id}:${currency}:${includeVariants}`,
  },
);

// These are cached separately despite same `id`
const usd = await productLoader.load({ id: 'p1', currency: 'USD' });
const eur = await productLoader.load({ id: 'p1', currency: 'EUR' });
```

## Error Handling Strategies

### Per-Key Error Isolation

```typescript
const loader = new DataLoader(async (ids: ReadonlyArray<string>) => {
  const results = await Promise.allSettled(ids.map(id => fetchItem(id)));
  return results.map((result, i) =>
    result.status === 'fulfilled'
      ? result.value
      : new Error(`Failed to load ${ids[i]}: ${result.reason}`),
  );
});

// loadMany never throws — failures are Error values in the array
const results = await loader.loadMany(['ok-1', 'bad-1', 'ok-2']);
const successes = results.filter((r): r is Item => !(r instanceof Error));
const failures  = results.filter((r): r is Error => r instanceof Error);
```

### Batch-Level Retry

```typescript
async function batchWithRetry(
  ids: ReadonlyArray<string>,
  retries = 2,
): Promise<ReadonlyArray<User | Error>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const users = await db.findUsersByIds([...ids]);
      return ids.map(id => users.find(u => u.id === id) ?? new Error(`Not found: ${id}`));
    } catch (err) {
      if (attempt === retries) return ids.map(() => err as Error);
      await new Promise(r => setTimeout(r, 100 * 2 ** attempt)); // exponential backoff
    }
  }
  return ids.map(() => new Error('Unreachable'));
}

const userLoader = new DataLoader(batchWithRetry);
```

## Cache Warming (Prime on Startup)

```typescript
class UserService {
  private loader: DataLoader<string, User>;

  constructor() {
    this.loader = new DataLoader(this.batchLoad.bind(this));
  }

  async warmCache(userIds: string[]) {
    const users = await db.findUsersByIds(userIds);
    users.forEach(user => this.loader.prime(user.id, user));
  }

  getUser(id: string) {
    return this.loader.load(id); // hits cache if warmed
  }
}
```

## Post-Mutation Cache Consistency

```typescript
class UserRepository {
  private loader = new DataLoader<string, User>(batchLoadUsers);

  async update(id: string, patch: Partial<User>): Promise<User> {
    const updated = await db.updateUser(id, patch);
    // Clear stale entry, then prime with fresh data
    this.loader.clear(id).prime(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.deleteUser(id);
    // Prime with error so future loads fail fast without a round-trip
    this.loader.clear(id).prime(id, new Error(`User ${id} not found`));
  }
}
```

## Observability: Named Loaders

```typescript
const userLoader = new DataLoader(batchLoadUsers, { name: 'UserLoader' });
console.log(userLoader.name); // 'UserLoader'

// Use in error reporting
function handleLoadError(loader: DataLoader, key: string, err: Error) {
  logger.error(`[${loader.name ?? 'DataLoader'}] Failed to load key ${key}`, err);
}
```
