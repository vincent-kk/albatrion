import * as React from 'react';
import { type ReactNode, Suspense } from 'react';

import { inject } from 'vitest';

/** Unresolved sibling work disconnects the preserved React 18 layout effects. */
const pending = new Promise<void>(() => undefined);

/** Suspend the sibling without replacing the previously committed form. */
const Gate = ({ hidden }: { hidden: boolean }) => {
  if (hidden) throw pending;
  return null;
};

/** Hide a preserved form using the current React major's lifecycle boundary.
 * @param form - Stable form element whose load must survive hiding.
 * @param hidden - Whether its layout effects should be disconnected.
 * @returns The Activity or Suspense boundary appropriate to this project. */
export const hideCommittedForm = (form: ReactNode, hidden: boolean) =>
  inject('reactMajor') === '19' ? (
    <React.Activity mode={hidden ? 'hidden' : 'visible'}>{form}</React.Activity>
  ) : (
    <Suspense fallback="hidden">
      {form}
      <Gate hidden={hidden} />
    </Suspense>
  );
