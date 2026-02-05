import { run } from './core/cli.js';

// CLI 진입점
run().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
