/** Presence states for explicit fields, including separate async and replacement commits. */
export const fieldLabelPresence = () => [
  { step: 'control first', external: false, pending: false, replaced: false },
  { step: 'label present', external: true, pending: false, replaced: false },
  { step: 'control replaced', external: true, pending: false, replaced: true },
  {
    step: 'label removed after replacement',
    external: false,
    pending: false,
    replaced: true,
  },
  { step: 'label pending', external: false, pending: true, replaced: true },
  { step: 'label resolved', external: true, pending: true, replaced: true },
];
