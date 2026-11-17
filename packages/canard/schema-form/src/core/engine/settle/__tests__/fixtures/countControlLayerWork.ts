import type { ControlTarget } from '../../utils/controls/getControlLayers';
import { getControlLayers } from '../../utils/controls/getControlLayers';

/**
 * Count path operations and membership calls during exactly one layer collection.
 * @param node - Mounted target with committed selections already prepared
 * @returns The layers and operation count; all native methods are restored on throw
 */
export const countControlLayerWork = <Self extends ControlTarget<Self>>(
  node: Self,
) => {
  let work = 0;
  const includes = Array.prototype.includes;
  const arrayIndexOf = Array.prototype.indexOf;
  const startsWith = String.prototype.startsWith;
  const indexOf = String.prototype.indexOf;
  const slice = String.prototype.slice;
  const selected = new Map<Self, readonly number[]>();
  try {
    Array.prototype.includes = function (...args) {
      work++;
      return includes.apply(this, args);
    };
    Array.prototype.indexOf = function (...args) {
      work++;
      return arrayIndexOf.apply(this, args);
    };
    String.prototype.startsWith = function (...args) {
      work++;
      return startsWith.apply(this, args);
    };
    String.prototype.indexOf = function (...args) {
      work++;
      return indexOf.apply(this, args);
    };
    String.prototype.slice = function (...args) {
      work++;
      return slice.apply(this, args);
    };
    const layers = getControlLayers(node, selected);
    return { layers, work };
  } finally {
    Array.prototype.includes = includes;
    Array.prototype.indexOf = arrayIndexOf;
    String.prototype.startsWith = startsWith;
    String.prototype.indexOf = indexOf;
    String.prototype.slice = slice;
  }
};
