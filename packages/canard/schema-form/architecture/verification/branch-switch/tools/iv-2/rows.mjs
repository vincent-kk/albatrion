// Canonical nested targets plus protective root rows; public device still owns all 22 rows.
import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';

export const rows = buildAlternatingRows(true).filter((row) =>
  [
    'single-nested-d6-f4',
    'switch-siblings-1000',
    'switch-oneOf-80',
    'switch-siblings-0',
    'switch-payload-12',
  ].includes(row.id),
);
