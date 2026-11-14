import { DEFAULT_KEYWORDS } from '../../../../keyword';
import { buildKeywordMap } from './buildKeywordMap';

/** Shared compiled default path, independent of later mutations to the public descriptor list. */
export const DEFAULT_KEYWORD_MAP = buildKeywordMap(DEFAULT_KEYWORDS);
