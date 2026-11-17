// Loaded by Storybook; exports exercise public configuration precedence and capture timing.
import { type PropsWithChildren, useState } from 'react';

import { type ModalFrameProps, ModalProvider, useModal } from '../src';
import { HardeningFrame } from './components/HardeningFrame';

/** Makes hook-selected presentation visible while preserving effective timing. */
const HookForeground = (props: PropsWithChildren<ModalFrameProps>) => (
  <div style={{ border: '4px solid blue' }}>
    <HardeningFrame {...props} />
  </div>
);
/** Identifies the per-call override independently from the hook's blue frame. */
const HandlerForeground = (props: PropsWithChildren<ModalFrameProps>) => (
  <div style={{ border: '4px solid red' }}>
    <HardeningFrame {...props} />
  </div>
);

export default {
  title: 'PromiseModal/UseModalConfiguration',
  decorators: [
    (Story: React.ComponentType) => (
      <ModalProvider options={{ duration: '500ms', manualDestroy: true }}>
        <Story />
      </ModalProvider>
    ),
  ],
};

/** Shows inherited hook presentation and a call overriding both frame and duration. */
export const ConfigurationOverridePriority = () => {
  const modal = useModal({
    ForegroundComponent: HookForeground,
    duration: '300ms',
  });
  return (
    <>
      <p>
        The hook gives a blue frame and 300ms; the call gives a red frame and
        200ms.
      </p>
      <button onClick={() => void modal.alert({ title: 'Hook configuration' })}>
        Open blue / 300ms
      </button>
      <button
        onClick={() =>
          void modal.alert({
            title: 'Call override',
            ForegroundComponent: HandlerForeground,
            duration: 200,
          })
        }
      >
        Open red / 200ms
      </button>
    </>
  );
};

/** The hook captures its original component closure while the caller keeps rerendering. */
export const StableConfigurationReference = () => {
  const [count, setCount] = useState(0);
  const modal = useModal({
    ForegroundComponent: (props) => (
      <div>
        <p>Captured count: {count}</p>
        <HardeningFrame {...props} />
      </div>
    ),
    dimmed: false,
    closeOnBackdropClick: false,
  });
  return (
    <>
      <p>
        Increment before or after opening: the frame keeps captured count 0.
      </p>
      <button onClick={() => setCount(count + 1)}>Caller count: {count}</button>
      <button
        onClick={() => void modal.alert({ title: 'Mount-time configuration' })}
      >
        Open
      </button>
    </>
  );
};

/** Frozen defaults can be reused without the handlers mutating them. */
export const ImmutableConfiguration = () => {
  const [result, setResult] = useState('Ready');
  const modal = useModal(
    Object.freeze({
      ForegroundComponent: HookForeground,
      duration: '300ms' as const,
    }),
  );
  return (
    <>
      <p>
        Calls override frozen mount-time defaults; later calls still inherit
        300ms.
      </p>
      <button
        onClick={() =>
          void modal
            .confirm({ title: 'Override', duration: 100 })
            .then((value) => setResult(`Override result: ${value}`))
        }
      >
        Open / 100ms
      </button>
      <button
        onClick={() =>
          void modal
            .confirm({ title: 'Defaults' })
            .then((value) => setResult(`Default result: ${value}`))
        }
      >
        Open / 300ms
      </button>
      <output>{result}</output>
    </>
  );
};
