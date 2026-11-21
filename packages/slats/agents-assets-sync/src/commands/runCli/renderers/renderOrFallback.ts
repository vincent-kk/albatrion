import {
  type RunFailure,
  type RunResult,
  runInjection,
} from '../../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../../types/index.js';
import { renderJSON } from './renderJSON.js';
import { renderPlain } from './renderPlain.js';

interface RenderEnv {
  readonly isTTY?: boolean;
}

/**
 * Choose the renderer for this invocation and run it exactly once.
 *
 * `--json` takes the machine-readable renderer. Otherwise Ink is used only
 * when prompting is both possible and permitted — a TTY without
 * `--no-interactive` — and every other case takes the plain renderer, where a
 * missing required flag exits 2 instead of asking.
 *
 * @param targets - resolved consumer packages
 * @param flags - parsed CLI flags
 * @param originCwd - directory project-scope resolution starts from
 * @param notices - messages raised before the renderer, such as why a target
 *   was skipped; only the `--json` document has a place to carry them
 * @param env - TTY override, for tests
 * @returns the process exit code
 */
export async function renderOrFallback(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
  notices: readonly string[] = [],
  env: RenderEnv = {},
  result?: RunResult,
  diagnostics?: readonly RunFailure[],
): Promise<number> {
  const isTTY = env.isTTY ?? Boolean(process.stdout.isTTY);
  if (flags.json || !isTTY || flags.interactive === false) {
    const completed =
      result ??
      (await runInjection({
        targets,
        flags,
        originCwd,
        notices,
        diagnostics,
      }));
    if (flags.json) renderJSON(completed);
    else renderPlain(completed, Boolean(flags.force));
    return completed.exitCode;
  }
  const ui = await import('../../../ui/index.js');
  return ui.renderInjectApp({
    targets,
    flags,
    originCwd,
    result,
    notices,
    diagnostics,
  });
}
