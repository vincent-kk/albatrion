import React, { useEffect, useState } from 'react';

import { ModalProvider, alert, confirm, prompt } from '@lerx/promise-modal';

export default {
  title: 'PromiseModal/BuildUsecase',
  decorators: [
    (Story: React.ComponentType) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
};

export const BuildUsecase = () => {
  const handleAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert.',
    }).then((result) => {
      console.log(result);
    });
  };

  const handleConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
    }).then((result) => {
      console.log(result);
    });
  };

  const [value, setValue] = useState('');

  const handlePrompt = () => {
    prompt({
      title: 'Hello, world!',
      content: 'This is a test prompt.',
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return <input defaultValue={defaultValue} onChange={handleChange} />;
      },
      defaultValue: 'value',
    }).then((value) => {
      setValue(value ?? '');
    });
  };

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
    </div>
  );
};

export const NestedModalProviderUsecase = () => {
  const handleAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert.',
    }).then((result) => {
      console.log(result);
    });
  };

  const handleConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
    }).then((result) => {
      console.log(result);
    });
  };

  const [value, setValue] = useState('');

  const handlePrompt = () => {
    prompt({
      title: 'Hello, world!',
      content: 'This is a test prompt.',
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return <input defaultValue={defaultValue} onChange={handleChange} />;
      },
      defaultValue: 'value',
    }).then((value) => {
      setValue(value ?? '');
    });
  };

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
      <ModalProvider SubtitleComponent={() => <div>Nested Modal</div>}>
        <p>
          The nested Provider waits; this request uses the active outer
          Provider.
        </p>
        <button onClick={handleAlert}>Open through active Provider</button>
      </ModalProvider>
    </div>
  );
};

export const MultiModalUsecase = () => {
  const handleAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert.',
    }).then((result) => {
      console.log(result);
    });
  };

  const handleConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
    }).then((result) => {
      console.log(result);
    });
  };

  const [value, setValue] = useState('');

  const handlePrompt = () => {
    prompt({
      title: 'Hello, world!',
      content: 'This is a test prompt.',
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return <input defaultValue={defaultValue} onChange={handleChange} />;
      },
      defaultValue: 'value',
    }).then((value) => {
      setValue(value ?? '');
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        alert({
          title: 'Hello, world!',
          subtitle: `This is a test alert ${i}`,
          content: 'This is a test alert.',
        });
      }
      prompt({
        title: 'Hello, world!',
        content: 'This is a test prompt.',
        Input: ({ defaultValue, onChange }) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
          };
          return <input defaultValue={defaultValue} onChange={handleChange} />;
        },
        defaultValue: 'value',
      }).then((value) => {
        setValue(value ?? '');
      });
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
    </div>
  );
};
