import * as React from 'react';
import { type ReactNode, Suspense } from 'react';

import { inject } from 'vitest';

import { HiddenFormGate } from './HiddenFormGate';

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
      <HiddenFormGate hidden={hidden} />
    </Suspense>
  );
