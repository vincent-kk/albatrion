// Loaded with Node --import only by failure-path tests; mode selects the injected faulty input.
import { register } from 'node:module';

if (process.env.BENCHMARK_FAILURE === 'leak') {
  let heapUsed = 0;
  process.memoryUsage = () => ({ heapUsed: (heapUsed += 1024 * 1024) });
}

// module.register is the hook API available on every supported Node line (20.6 and later).
register('./failureHooks.mjs', import.meta.url);
