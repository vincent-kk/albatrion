// Invoked by Node CLI; selects B0 rows without changing the canonical row set.
process.env.NODE_ENV = 'production';
process.argv.push('--branch-switch=true');
await import('./pair-core.mjs');
