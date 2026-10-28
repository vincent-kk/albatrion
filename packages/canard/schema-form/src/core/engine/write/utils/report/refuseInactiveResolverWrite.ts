import { FormWarningCode } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { deliverChainRecords } from './deliverChainRecords';

/**
 * Refuse reentrant writes while the tree is resolving an exit's retained value.
 * The bundle supplies NODE_ENV for development-only warning delivery.
 * @param node - Attempted write target in the resolving tree
 * @returns Whether the caller must skip the entire operation and its callback
 */
export const refuseInactiveResolverWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  if (!node.runtime.resolvingInactiveValue) return false;
  if (process.env.NODE_ENV !== 'production')
    deliverChainRecords(node.runtime, [{
      level: 'warning',
      code: FormWarningCode.WriteInInactiveResolver,
      message: 'A write inside an inactive value resolver has no effect',
      path: node.path,
      details: { path: node.path },
    }], undefined, false);
  return true;
};
