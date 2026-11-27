import { useEffect, useState } from 'react';

import { ModalProvider } from '../../src';
import { HardeningFrame } from './HardeningFrame';
import { OwnedModalButtons } from './OwnedModalButtons';

/** Demonstrates caller cleanup with independently mounted owners and a disposable timer. */
export function UnmountExample({
  manualDestroy,
  multiple = false,
  automatic = false,
}: {
  manualDestroy: boolean;
  multiple?: boolean;
  automatic?: boolean;
}) {
  const [first, setFirst] = useState(true);
  const [second, setSecond] = useState(true);
  const [result, setResult] = useState(
    'Open a request, then unmount its owner.',
  );
  useEffect(() => {
    if (!automatic || !first) return;
    const timer = setTimeout(() => setFirst(false), 5000);
    return () => clearTimeout(timer);
  }, [automatic, first]);
  return (
    <ModalProvider
      ForegroundComponent={manualDestroy ? HardeningFrame : undefined}
      options={{ duration: '250ms', manualDestroy }}
    >
      <p>
        Nondimmed requests keep these page controls interactive. Unmount cancels
        only that caller's pending requests.
      </p>
      <p>
        {manualDestroy
          ? 'Settled frames animate out and are destroyed after 250ms.'
          : 'Settled frames hide immediately and are removed after 250ms.'}
      </p>
      {automatic && (
        <p>
          The first owner unmounts five seconds after mounting. Remount to
          repeat.
        </p>
      )}
      <button onClick={() => setFirst(!first)}>
        {first ? 'Unmount' : 'Mount'} first owner
      </button>
      {multiple && (
        <button onClick={() => setSecond(!second)}>
          {second ? 'Unmount' : 'Mount'} second owner
        </button>
      )}
      {first && <OwnedModalButtons label="First owner" onResult={setResult} />}
      {multiple && second && (
        <OwnedModalButtons label="Second owner" onResult={setResult} />
      )}
      <output>{result}</output>
    </ModalProvider>
  );
}
