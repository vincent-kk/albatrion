import { closeCssFragment } from '../../../utils/cssTokens/closeCssFragment';

/**
 * Keep each injected style identifier independent at stylesheet EOF.
 * @param css One stylesheet fragment before joining.
 * @returns The fragment with lexical, block and statement EOF boundaries materialized.
 */
export const terminateStatement = (css: string): string => closeCssFragment(css);
