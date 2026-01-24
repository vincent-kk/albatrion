# @winglet/data-loader

[![TypeScript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Batching](https://img.shields.io/badge/batching-support-green.svg)]()
[![Caching](https://img.shields.io/badge/caching-support-blue.svg)]()

---

## Overview

`@winglet/data-loader` is a batching and caching utility for asynchronous data fetching.

This implementation is inspired by the original "Loader" API developed by [@schrockn](https://github.com/schrockn) at Facebook in 2010, which was designed to simplify and consolidate various key-value store back-end APIs.

While conceptually based on [GraphQL DataLoader](https://github.com/graphql/dataloader), this version is a ground-up rewrite focused on performance optimizations, type safety, and adaptation to specific runtime requirements.

### Key Features

- **Batching**: Automatically groups multiple individual requests into efficient batches
- **Caching**: Built-in cache system that prevents duplicate requests
- **Type Safety**: Full TypeScript support with compile-time type validation
- **Flexibility**: Support for custom cache implementations and batch scheduling
- **Performance**: Optimized algorithms for high throughput processing

---

## Installation

```bash
# Using npm
npm install @winglet/data-loader

# Using yarn
yarn add @winglet/data-loader

# Using pnpm
pnpm add @winglet/data-loader
```

---

## Compatibility

**Supported Environments:**

- Node.js 14.0.0 or higher
- Modern browsers (with ES2020 support)

**For Legacy Environment Support:**
Use transpilers like Babel to convert the code to match your target environment.

---

## Basic Usage

### Simple Example

```typescript
import { DataLoader } from '@winglet/data-loader';

// Function to batch load user information
const userBatchLoader = async (userIds: ReadonlyArray<string>) => {
  // In practice, fetch data from database or API
  const users = await fetchUsersFromDatabase(userIds);
  return users;
};

// Create DataLoader instance
const userLoader = new DataLoader(userBatchLoader);

// Load individual users (automatically batched)
const user1Promise = userLoader.load('user1');
const user2Promise = userLoader.load('user2');
const user3Promise = userLoader.load('user3');

// All requests are processed in a single batch
const [user1, user2, user3] = await Promise.all([
  user1Promise,
  user2Promise,
  user3Promise,
]);
```

### Loading Multiple Keys Simultaneously

```typescript
const userIds = ['user1', 'user2', 'user3', 'user4'];
const usersOrErrors = await userLoader.loadMany(userIds);

// Each result is either a value or an error
usersOrErrors.forEach((userOrError, index) => {
  if (userOrError instanceof Error) {
    console.error(`Failed to load user ${userIds[index]}:`, userOrError);
  } else {
    console.log(`User data:`, userOrError);
  }
});
```

---

## Advanced Configuration

### Cache Configuration

```typescript
// Default caching with Map (default behavior)
const userLoader = new DataLoader(userBatchLoader);

// Custom cache implementation
const customCache = new Map<string, Promise<User>>();
const userLoaderWithCustomCache = new DataLoader(userBatchLoader, {
  cache: customCache,
});

// Disable caching
const userLoaderNoCache = new DataLoader(userBatchLoader, {
  cache: false,
});
```

### Batch Size Limitation

```typescript
const userLoader = new DataLoader(userBatchLoader, {
  maxBatchSize: 50, // Process maximum 50 items per batch
});
```

### Custom Cache Key Function

```typescript
interface UserKey {
  id: string;
  version: number;
}

const userLoader = new DataLoader<UserKey, User, string>(userBatchLoader, {
  // Convert composite key to string
  cacheKeyFn: (key: UserKey) => `${key.id}:${key.version}`,
});
```

### Custom Batch Scheduler

```typescript
const userLoader = new DataLoader(userBatchLoader, {
  // Use setTimeout for delayed execution
  batchScheduler: (callback) => {
    setTimeout(callback, 10);
  },
});
```

---

## API Reference

### DataLoader Class

#### Constructor

```typescript
constructor(
  batchLoader: BatchLoader<Key, Value>,
  options?: DataLoaderOptions<Key, Value, CacheKey>
)
```

- `batchLoader`: Async function that takes an array of keys and returns an array of values
- `options`: Optional configuration object

#### Methods

##### `load(key: Key): Promise<Value>`

Loads a value for a single key. Automatically batched and cached.

```typescript
const user = await userLoader.load('user123');
```

##### `loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>>`

Loads values for multiple keys simultaneously. Other values are collected normally even if one key fails.

```typescript
const results = await userLoader.loadMany(['user1', 'user2', 'user3']);
```

##### `clear(key: Key): this`

Removes a specific key from the cache.

```typescript
userLoader.clear('user123'); // Remove 'user123' from cache
```

##### `clearAll(): this`

Removes all keys from the cache.

```typescript
userLoader.clearAll(); // Clear entire cache
```

##### `prime(key: Key, value: Value | Promise<Value> | Error): this`

Programmatically adds a value to the cache for a given key.

```typescript
// Cache a known value
userLoader.prime('user123', userData);

// Cache with Promise
userLoader.prime('user456', fetchUserPromise);

// Cache error state
userLoader.prime('invalidUser', new Error('User not found'));
```

---

## Configuration Options

### DataLoaderOptions

```typescript
interface DataLoaderOptions<Key, Value, CacheKey = Key> {
  /** Name of the loader (for debugging) */
  name?: string;

  /** Cache Map object or false (disabled) */
  cache?: MapLike<CacheKey, Promise<Value>> | false;

  /** Function for scheduling batch execution */
  batchScheduler?: (task: () => void) => void;

  /** Function that converts loader keys to cache keys */
  cacheKeyFn?: (key: Key) => CacheKey;

  /** Maximum batch size to process at once */
  maxBatchSize?: number;
}
```

### BatchLoader Function

```typescript
type BatchLoader<Key, Value> = (
  keys: ReadonlyArray<Key>,
) => Promise<ReadonlyArray<Value | Error>>;
```

The batch loader function must guarantee:

- Return an array of results with the same length as the input key array
- Return either a value or Error object for each key
- Maintain order consistency between keys and results

---

## Usage Examples

### Database Query Optimization

```typescript
import { DataLoader } from '@winglet/data-loader';

// Solving N+1 query problem
class UserService {
  private userLoader: DataLoader<string, User>;
  private postLoader: DataLoader<string, Post[]>;

  constructor() {
    this.userLoader = new DataLoader(this.batchLoadUsers.bind(this));
    this.postLoader = new DataLoader(this.batchLoadPostsByUserId.bind(this));
  }

  private async batchLoadUsers(userIds: ReadonlyArray<string>) {
    const users = await db.users.findMany({
      where: { id: { in: [...userIds] } },
    });

    // Sort results to match key order
    return userIds.map(
      (id) =>
        users.find((user) => user.id === id) ||
        new Error(`User ${id} not found`),
    );
  }

  private async batchLoadPostsByUserId(userIds: ReadonlyArray<string>) {
    const posts = await db.posts.findMany({
      where: { authorId: { in: [...userIds] } },
    });

    return userIds.map((userId) =>
      posts.filter((post) => post.authorId === userId),
    );
  }

  async getUser(id: string): Promise<User> {
    return this.userLoader.load(id);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.postLoader.load(userId);
  }
}
```

### Usage in GraphQL Resolvers

```typescript
// Add DataLoader to GraphQL context
interface Context {
  loaders: {
    user: DataLoader<string, User>;
    posts: DataLoader<string, Post[]>;
  };
}

// Use in resolvers
const resolvers = {
  Post: {
    author: async (post: Post, args: any, { loaders }: Context) => {
      return loaders.user.load(post.authorId);
    },
  },
  User: {
    posts: async (user: User, args: any, { loaders }: Context) => {
      return loaders.posts.load(user.id);
    },
  },
};
```

### Error Handling and Retry

```typescript
const userLoader = new DataLoader(async (userIds: ReadonlyArray<string>) => {
  try {
    const users = await fetchUsersWithRetry(userIds);
    return users;
  } catch (error) {
    // If entire batch fails, return same error for each key
    return userIds.map(() => error);
  }
});

// When only specific users fail
const userLoaderPartialFailure = new DataLoader(
  async (userIds: ReadonlyArray<string>) => {
    const results = await Promise.allSettled(
      userIds.map((id) => fetchSingleUser(id)),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return new Error(
          `Failed to load user ${userIds[index]}: ${result.reason}`,
        );
      }
    });
  },
);
```

---

## Performance Considerations

- **Batch Size**: Set `maxBatchSize` appropriately to balance memory usage and processing efficiency
- **Cache Strategy**: For long-running applications, call `clearAll()` periodically or implement TTL-based cache to prevent memory leaks
- **Batch Scheduler**: Use custom schedulers instead of the default `process.nextTick` to control batch timing

---

## Acknowledgments

This implementation is inspired by the original "Loader" API developed by [@schrockn](https://github.com/schrockn) at Facebook in 2010 and the [GraphQL DataLoader](https://github.com/graphql/dataloader) project. We express our deep gratitude for the concepts and ideas provided by these excellent open source projects.

---

## License

This repository is provided under the MIT License. See the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For questions or suggestions about this project, please create a GitHub issue.
