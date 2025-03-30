import React, { useEffect, useState } from 'react';

import { ModalProvider, alert, confirm, prompt } from '../src';
import { Background } from './components/Background';

export default {
  title: 'PromiseModal/BackgroundUsecase',
  decorators: [
    (Story) => (
      <ModalProvider
        BackgroundComponent={Background}
        options={{
          closeOnBackdropClick: false,
        }}
      >
        <Story />
      </ModalProvider>
    ),
  ],
};

export const NormalUsecase = () => {
  const handleAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This modal should be remained because manualDestroy is true',
      background: {
        data: 'alert',
      },
      manualDestroy: true,
    }).then((result) => {
      console.log(result);
    });
  };

  const handleConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
      background: {
        data: 'confirm',
      },
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
      background: {
        data: 'prompt',
      },
    }).then((value) => {
      setValue(value);
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
      setValue(value);
    });
  };

  useEffect(() => {
    setTimeout(() => {
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
        setValue(value);
      });
    }, 250);
  }, []);

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
    </div>
  );
};
