import { FormWarningCode } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { refuseInactiveResolverWrite } from './refuseInactiveResolverWrite';
import { deliverChainRecords } from './deliverChainRecords';

/**
 * Refuse writes through a frozen lifetime before opening a public entry chain.
 * The build supplies NODE_ENV for development-only warning delivery.
 * @param node - Reference whose detached flag describes its committed lifetime
 * @returns Whether the write has no effect
 */
export const refuseDetachedWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  if (!node.detached) return false;
  if (refuseInactiveResolverWrite(node)) return true;
  if (process.env.NODE_ENV !== 'production')
    deliverChainRecords(
      node.runtime,
      [
        {
          level: 'warning',
          code: FormWarningCode.DetachedNodeWrite,
          message: 'A write through a detached node reference has no effect',
          path: node.path,
          details: { path: node.path },
        },
      ],
      undefined,
      false,
    );
  return true;
};
