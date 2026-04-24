import type { ConsumerPackage, DefaultFlags } from '../../commands/runCli/type.js';

export interface RenderInput {
  readonly targets: readonly ConsumerPackage[];
  readonly flags: DefaultFlags;
  readonly originCwd: string;
}
