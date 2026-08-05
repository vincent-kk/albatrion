import type {
  ConsumerPackage,
  DefaultFlags,
} from '../../types/index.js';

export interface RenderInput {
  readonly targets: readonly ConsumerPackage[];
  readonly flags: DefaultFlags;
  readonly originCwd: string;
}
