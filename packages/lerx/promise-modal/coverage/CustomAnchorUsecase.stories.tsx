import React, { useEffect, useRef, useState } from 'react';

import {
  ModalProvider,
  ModalProviderHandle,
  alert,
  confirm,
  prompt,
} from '../src';

export default {
  title: 'PromiseModal/CustomAnchorUsecase',
};

export const NormalUsecase = () => {
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

  const handleErrorPrompt = () => {
    prompt({
      title: 'Error Prompt',
      content: 'Error will be thrown from Input',
      Input: () => {
        throw new Error('Error from Prompt Input');
        return <div>Input</div>;
      },
    });
  };
  const modalHandle = useRef<ModalProviderHandle>(null);
  const modalRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRoot.current) {
      modalHandle.current?.bootstrap(modalRoot.current);
    }
  }, []);

  return (
    <ModalProvider ref={modalHandle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          ref={modalRoot}
          style={{ backgroundColor: 'red', width: '100%', height: 500 }}
        />
        <div>
          <button onClick={handleAlert}>Open Alert</button>
          <button onClick={handleConfirm}>Open Confirm</button>
          <button onClick={handlePrompt}>Open Prompt: {value}</button>
          <button onClick={handleErrorPrompt}>Error from Prompt Input</button>
        </div>
      </div>
    </ModalProvider>
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
      setValue(value);
    });
  };

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
      <ModalProvider SubtitleComponent={() => <div>Nested Modal</div>}>
        <button onClick={handleAlert}>Open Inner Provider Alert</button>
      </ModalProvider>
    </div>
  );
};
