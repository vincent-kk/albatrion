import type { FieldNodeRecord } from '../../../record';
import type { PathStoreIndex } from '../../../utils/pathIndex/utils/PathStoreIndex';
import type { SettlementContext } from '../../types/settlement';

/** Read the tree-owned index; every latent map mutation maintains it immediately. */
export const getLatentPathIndex = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): PathStoreIndex => context.root.runtime.latentRaw.pathIndex;
