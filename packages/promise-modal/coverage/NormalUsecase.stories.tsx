import React, { useState } from 'react';

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
      input: ({ onChange }) => {
        return <input onChange={onChange} />;
      },
      defaultValue: '',
      closeOnBackgroundClick: true,
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
