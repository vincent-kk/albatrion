import { sessionRows131 } from './session-rows-131.mjs';
import { scopeRows131 } from './scope-rows-131.mjs';

/** Include the fixed 129 watch rows in every first pass, even when a bounded row file/preset selects fewer fixtures. */
export function watchScope131(requested, lane) {
  const all = sessionRows131(`${lane}-129`, lane), zeros = Object.fromEntries(all.map(row => [row.key, 0]));
  const watched = scopeRows131(all, zeros, 24, 8).filter(row => row.reason === 'watch');
  return [...requested, ...watched.filter(row => !requested.some(item => item.key === row.key))];
}
