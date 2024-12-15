import React, { useEffect, useState } from 'react';

import { alert, confirm, prompt } from '../src';

export default {
  title: 'PromiseModal/NormalUsecase',
};

export const NormalUsecase = () => {
  const handleAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert.',
    });
  };

  const handleConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
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
    </div>
  );
};

export const MultiModalUsecase = () => {
  const handleAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert.',
    });
  };

  const handleConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
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
