import { defaultContext } from '../defaultContext.mjs';

/**
 * pathOf through the versioned regression API.
 * The regression module instance supplies the runtime, preserving existing probe signatures.
 * @param {...*} args Inputs of the corresponding prototype operation.
 * @returns {*} The operation result from the compatibility runtime.
 */
export function pathOf(...args) {
 return defaultContext.pathOf(...args);
}
