import type { Fn } from '@aileron/declare';

import type { RenderInput } from '../../types/index.js';

export type { Phase, InjectEvent, RenderInput } from '../../types/index.js';

export interface InjectAppProps extends RenderInput {
  readonly onExit: Fn<[code: 0 | 1 | 2]>;
}
