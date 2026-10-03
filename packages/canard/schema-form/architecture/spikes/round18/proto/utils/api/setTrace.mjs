import { defaultContext } from '../defaultContext.mjs';

/**
 * setTrace through the versioned regression API.
 * The regression module instance supplies the runtime, preserving existing probe signatures.
 * @param {...*} args Inputs of the corresponding prototype operation.
 * @returns {*} The operation result from the compatibility runtime.
 */
export function setTrace(...args) {
 return defaultContext.setTrace(...args);
}
