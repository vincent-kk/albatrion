import { buildRows } from './buildRows.mjs';

/** Keep the default 21 fixtures and append the explicitly requested payload-12 fixture. */
export function buildAlternatingRows(includePayload12 = false) {
  const canonical = buildRows(false);
  return [
    canonical.find((row) => row.id === 'single-flat-1000'),
    ...canonical.filter((row) => row.id !== 'single-flat-1000'),
    ...buildRows(false, true).filter((row) =>
      [
        'switch-if-80',
        'switch-discriminator-80',
        'switch-nested-oneOf-20',
      ].includes(row.id),
    ),
    ...buildRows(true).filter(
      (row) =>
        row.id.startsWith('switch-siblings-') ||
        row.id.startsWith('leaf-gate-'),
    ),
    ...['wave-1000', 'single-flat-1000-subscribed'].map((id) => ({
      id,
      n: 1000,
      operation: 'subscription',
      currentOnly: true,
    })),
    ...(includePayload12
      ? buildRows(false, true).filter((row) => row.id === 'switch-payload-12')
      : []),
  ];
}
