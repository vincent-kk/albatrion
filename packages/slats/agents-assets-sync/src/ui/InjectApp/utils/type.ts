import type { RenderInput } from '../../types/index.js';

export type { Phase, InjectEvent, RenderInput } from '../../types/index.js';

export interface InjectAppProps extends RenderInput {
  readonly onExit: (code: 0 | 1 | 2) => void;
}
