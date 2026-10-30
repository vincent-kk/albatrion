// Canonical IDs are consumed by smoke, window, diagnostics and the result summarizer.
export const rows = [
  { id: 'switch-oneOf-80', operation: 'switch', shape: 'oneOf', n: 80 },
  {
    id: 'switch-payload-12',
    operation: 'switch',
    shape: 'branch-switch',
    gate: 'active',
    n: 80,
    payload: 12,
  },
  {
    id: 'switch-siblings-0',
    operation: 'switch',
    shape: 'siblings',
    siblings: 0,
    n: 0,
  },
  {
    id: 'switch-siblings-1000',
    operation: 'switch',
    shape: 'siblings',
    siblings: 1000,
    n: 0,
  },
  {
    id: 'switch-oneOf-80-siblings-250',
    operation: 'switch',
    shape: 'oneOf',
    n: 80,
    siblings: 250,
  },
  {
    id: 'switch-oneOf-80-siblings-1000',
    operation: 'switch',
    shape: 'oneOf',
    n: 80,
    siblings: 1000,
  },
];
