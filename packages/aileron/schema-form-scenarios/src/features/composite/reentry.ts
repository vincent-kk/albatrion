/**
 * Fields shared by the cases that carry the 197C-01 steps: a mode guard that gives /value a string or a number,
 * and a virtual period over two date fields beside an unrelated note.
 */
export const reentryProperties = {
  mode: { type: 'string' },
  startDate: { type: 'string' },
  endDate: { type: 'string' },
  note: { type: 'string' },
} as const;

/** Virtual period declared on the host object. */
export const reentryOptions = { virtual: { period: { fields: ['startDate', 'endDate'] } } } as const;

/** Guard giving /value a string under mode "text" and a number otherwise. */
export const reentryGuard = {
  if: { properties: { mode: { const: 'text' } }, required: ['mode'] },
  then: { properties: { value: { type: 'string' } } },
  else: { properties: { value: { type: 'number' } } },
} as const;

/** Loaded values for the shared fields. */
export const reentryValue = { mode: 'text', value: 's', startDate: 's0', endDate: 'e0', note: 'n' } as const;

/**
 * 197C-01 R2 as a shared step: a virtual write beside another write in one batch reaches its fields.
 * R1 needs a Merge write, which the shared vocabulary does not have, so it runs in the consumer tail (reentryTail).
 */
export const reentrySteps = [
  { action: 'batch', steps: [{ action: 'setValue', path: '/period', value: ['s1', 'e1'] }, { action: 'setValue', path: '/note', value: 'y' }], expect: {
    values: { '/startDate': 's1', '/endDate': 'e1', '/note': 'y' },
  } },
] as const;

/**
 * 197C-01 R1 as a consumer tail: leave the string branch, give /value a number through a partial Merge write (which keeps
 * the latent string, unlike a whole write at /value that clears every kind in its range), then re-enter the string branch
 * in a batch with another write; the latent string returns as a single re-entry would return it.
 */
export const reentryTail = [
  { act: 'write', path: '/mode', value: 'num' },
  { act: 'merge', value: { value: 5 } },
  { act: 'values', values: { '/value': 5 } },
  { act: 'batch', writes: [{ path: '/mode', value: 'text' }, { path: '/note', value: 'z' }] },
  { act: 'values', values: { '/value': 's', '/note': 'z' } },
] as const;
