// Invoked by Node CLI; diagnostic rows share the paired runner and its output contract.
process.argv.push('--probes=true');
await import('./pair-core.mjs');
