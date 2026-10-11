import { sessionRows131 } from './session-rows-131.mjs';
import { scopeRows131 } from './scope-rows-131.mjs';

/**
 * Include the fixed 129 watch rows in a first pass. By default every watch row is added, even when a bounded row
 * file/preset selects fewer fixtures. With `inSelectionOnly`, only watch rows whose fixture/validation setting the
 * session already measures are added; a verdict split into parts then covers each watch row in the part that holds
 * its setting, and the split's record must show that the parts together hold every watch setting.
 */
export function watchScope131(requested, lane, inSelectionOnly = false) {
  const all = sessionRows131(`${lane}-129`, lane), zeros = Object.fromEntries(all.map(row => [row.key, 0]));
  const settings = new Set(requested.map(row => `${row.fixture}/${row.validation}`));
  const watched = scopeRows131(all, zeros, 24, 8).filter(row => row.reason === 'watch'
    && (!inSelectionOnly || settings.has(`${row.fixture}/${row.validation}`)));
  return [...requested, ...watched.filter(row => !requested.some(item => item.key === row.key))];
}
