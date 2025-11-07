import React, { useState } from 'react';

import { ModalProvider, alert, confirm, prompt } from '../src';

export default {
  title: 'PromiseModal/AbortSignalUsecase',
  decorators: [
    (Story) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
};

export const AbortAlertAfterDelay = () => {
  const [status, setStatus] = useState('Ready');

  const handleAbortAlert = () => {
    const controller = new AbortController();
    setStatus('Alert opened');

    alert({
      title: 'This will be aborted in 2 seconds',
      content: 'Watch the modal close automatically!',
      signal: controller.signal,
    }).then(() => {
      setStatus('Alert closed (should not happen on abort)');
    });

    setTimeout(() => {
      controller.abort();
      setStatus('Aborted after 2 seconds');
    }, 2000);
  };

  return (
    <div>
      <button onClick={handleAbortAlert}>Open Alert (Auto-abort in 2s)</button>
      <p>Status: {status}</p>
    </div>
  );
};

export const AbortConfirmBeforeUser = () => {
  const [result, setResult] = useState<string>('Ready');

  const handleAbortConfirm = () => {
    const controller = new AbortController();
    setResult('Confirm opened');

    confirm({
      title: 'Make a choice quickly!',
      content: 'This will be aborted in 3 seconds',
      signal: controller.signal,
    }).then((confirmed) => {
      setResult(`User chose: ${confirmed}`);
    });

    setTimeout(() => {
      controller.abort();
      setResult('Aborted before user could decide');
    }, 3000);
  };

  return (
    <div>
      <button onClick={handleAbortConfirm}>
        Open Confirm (Auto-abort in 3s)
      </button>
      <p>Result: {result}</p>
    </div>
  );
};

export const AbortPromptDuringInput = () => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Ready');

  const handleAbortPrompt = () => {
    const controller = new AbortController();
    setStatus('Prompt opened - type something!');

    prompt({
      title: 'Enter your name',
      content: 'You have 4 seconds to type',
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return <input defaultValue={defaultValue} onChange={handleChange} />;
      },
      defaultValue: '',
      signal: controller.signal,
    }).then((inputValue) => {
      setValue(inputValue);
      setStatus('Input received');
    });

    setTimeout(() => {
      controller.abort();
      setStatus('Aborted after 4 seconds');
    }, 4000);
  };

  return (
    <div>
      <button onClick={handleAbortPrompt}>
        Open Prompt (Auto-abort in 4s)
      </button>
      <p>Status: {status}</p>
      <p>Value: {value}</p>
    </div>
  );
};

export const AbortImmediately = () => {
  const [status, setStatus] = useState('Ready');

  const handleAbortImmediately = () => {
    const controller = new AbortController();
    controller.abort(); // Abort before opening

    setStatus('Opening with already-aborted signal');

    alert({
      title: 'This should close immediately',
      content: 'The signal was already aborted',
      signal: controller.signal,
    }).then(() => {
      setStatus('Modal closed immediately');
    });
  };

  return (
    <div>
      <button onClick={handleAbortImmediately}>
        Open with Pre-Aborted Signal
      </button>
      <p>Status: {status}</p>
    </div>
  );
};

export const ManualAbortControl = () => {
  const [controller, setController] = useState<AbortController | null>(null);
  const [status, setStatus] = useState('Ready');

  const handleOpenAlert = () => {
    const newController = new AbortController();
    setController(newController);
    setStatus('Alert opened');

    alert({
      title: 'Manual Abort Control',
      content: 'Click the "Abort" button below to close this modal',
      signal: newController.signal,
      closeOnBackdropClick: false,
    }).then(() => {
      setStatus('Alert closed');
      setController(null);
    });
  };

  const handleAbort = () => {
    if (controller) {
      controller.abort();
      setStatus('Manually aborted');
    }
  };

  return (
    <div>
      <button onClick={handleOpenAlert} disabled={!!controller}>
        Open Alert
      </button>
      <button onClick={handleAbort} disabled={!controller}>
        Abort Modal
      </button>
      <p>Status: {status}</p>
    </div>
  );
};

export const MultipleModalsAbort = () => {
  const [controllers, setControllers] = useState<AbortController[]>([]);
  const [status, setStatus] = useState('Ready');

  const handleOpenMultiple = () => {
    const newControllers: AbortController[] = [];

    for (let i = 0; i < 3; i++) {
      const controller = new AbortController();
      newControllers.push(controller);

      alert({
        title: `Modal ${i + 1}`,
        content: `This is modal number ${i + 1}`,
        signal: controller.signal,
        closeOnBackdropClick: false,
      });
    }

    setControllers(newControllers);
    setStatus('3 modals opened');
  };

  const handleAbortAll = () => {
    controllers.forEach((controller) => controller.abort());
    setControllers([]);
    setStatus('All modals aborted');
  };

  return (
    <div>
      <button onClick={handleOpenMultiple} disabled={controllers.length > 0}>
        Open 3 Modals
      </button>
      <button onClick={handleAbortAll} disabled={controllers.length === 0}>
        Abort All Modals
      </button>
      <p>Status: {status}</p>
    </div>
  );
};

export const AbortRaceCondition = () => {
  const [status, setStatus] = useState('Ready');

  const handleRaceCondition = () => {
    const controller = new AbortController();
    setStatus('Testing race condition...');

    // Abort immediately after opening
    alert({
      title: 'Race Condition Test',
      content: 'Aborting immediately after opening',
      signal: controller.signal,
    }).then(() => {
      setStatus('Modal closed');
    });

    // Abort in the same event loop tick
    controller.abort();
  };

  return (
    <div>
      <button onClick={handleRaceCondition}>Test Race Condition</button>
      <p>Status: {status}</p>
    </div>
  );
};
