import { defaultContext } from '../defaultContext.mjs';

/**
 * configureSchema through the versioned regression API.
 * The regression module instance supplies the runtime, preserving existing probe signatures.
 * @param {...*} args Inputs of the corresponding prototype operation.
 * @returns {*} The operation result from the compatibility runtime.
 */
export function configureSchema(...args) {
 return defaultContext.configureSchema(...args);
}
