import { execFileSync } from 'node:child_process';

/**
 * Build a clean checkout despite schema-form tests' AJV declaration cycle.
 * @param repository - Independently installed checkout; no install or version edit occurs here.
 * @returns Nothing; throws on any failed build in the fixed bootstrap order.
 */
export function buildCoreCheckout(repository: string): void {
  const commands = [
    [
      'workspaces',
      'foreach',
      '-R',
      '--topological-dev',
      '--from',
      '@canard/schema-form',
      '--exclude',
      '@canard/schema-form',
      'run',
      'build',
    ],
    ['workspace', '@canard/schema-form', 'exec', 'rolldown', '-c'],
    ['workspace', '@canard/schema-form', 'build:types'],
    [
      'workspaces',
      'foreach',
      '-A',
      '--include',
      '@canard/schema-form-ajv6-plugin',
      '--include',
      '@canard/schema-form-ajv7-plugin',
      '--include',
      '@canard/schema-form-ajv8-plugin',
      'run',
      'build',
    ],
    [
      'workspaces',
      'foreach',
      '-R',
      '--topological-dev',
      '--from',
      '@canard/schema-form',
      '--from',
      '@canard/schema-form-ajv8-plugin',
      'run',
      'build',
    ],
  ];
  for (const args of commands) {
    console.log(`CORE_BUILD yarn ${args.join(' ')}`);
    execFileSync('yarn', args, { cwd: repository, stdio: 'inherit' });
  }
}
