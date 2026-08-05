import type { RenderInput } from '../../../ui/types/index.js';
import type { ConsumerPackage, DefaultFlags } from '../type.js';
import { renderPlain } from './renderPlain.js';

interface UiModule {
  renderInjectApp(input: RenderInput): Promise<number>;
}

interface RenderEnv {
  readonly isTTY?: boolean;
}

/**
 * Choose the renderer for this invocation and run it exactly once.
 *
 * Ink is used only when prompting is both possible and permitted: a TTY,
 * no `--json`, and no `--no-interactive`. Every other case takes the plain
 * path, where a missing required flag exits 2 instead of asking.
 *
 * @param targets - resolved consumer packages
 * @param flags - parsed CLI flags
 * @param originCwd - directory project-scope resolution starts from
 * @param env - TTY override, for tests
 * @returns the process exit code
 */
export async function renderOrFallback(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
  env: RenderEnv = {},
): Promise<number> {
  const isTTY = env.isTTY ?? Boolean(process.stdout.isTTY);
  if (flags.json || !isTTY || flags.interactive === false) {
    return renderPlain(targets, flags, originCwd);
  }
  const ui = (await import('../../../ui/index.js')) as unknown as UiModule;
  return ui.renderInjectApp({ targets, flags, originCwd });
}
