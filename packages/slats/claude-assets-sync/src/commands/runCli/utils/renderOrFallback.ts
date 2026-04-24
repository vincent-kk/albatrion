import type { ConsumerPackage, DefaultFlags } from '../type.js';
import type { RenderInput } from '../../../ui/types/index.js';
import { renderPlain } from './renderPlain.js';

interface UiModule {
  renderInjectApp(input: RenderInput): Promise<number>;
}

interface RenderEnv {
  readonly isTTY?: boolean;
}

export async function renderOrFallback(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
  env: RenderEnv = {},
): Promise<number> {
  const isTTY = env.isTTY ?? Boolean(process.stdout.isTTY);
  if (flags.json || !isTTY) {
    return renderPlain(targets, flags, originCwd);
  }
  const ui = (await import('../../../ui/index.js')) as unknown as UiModule;
  return ui.renderInjectApp({ targets, flags, originCwd });
}
