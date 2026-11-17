import { DEFAULT_KEYWORDS } from '../../../../keyword';
import { buildKeywordMap } from './buildKeywordMap';

/** Default vocabulary compiled once when the scanner module first loads; later changes to the descriptor list do not reach it. */
export const DEFAULT_KEYWORD_MAP = buildKeywordMap(DEFAULT_KEYWORDS);
