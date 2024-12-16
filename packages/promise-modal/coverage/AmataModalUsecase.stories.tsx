import React, { useState } from 'react';

import { Input } from 'antd';

import { ModalProvider, alert, confirm, prompt } from '../src';
import Content from './components/DefaultContent';
import Footer from './components/DefaultFooter';
import Subtitle from './components/DefaultSubtitle';
import Title from './components/DefaultTitle';
import { Foreground } from './components/Foreground';

export default {
  title: 'PromiseModal/AmataModalUsecase',
  decorators: [
    (Story) => (
      <ModalProvider
        ForegroundComponent={Foreground}
        TitleComponent={Title}
        SubtitleComponent={Subtitle}
        ContentComponent={Content}
        FooterComponent={Footer}
        options={{
          duration: '250ms',
          backdrop: 'rgba(0, 0, 0, 0.35)',
          manualDestroy: true,
          closeOnBackdropClick: true,
        }}
      >
        <Story />
      </ModalProvider>
    ),
  ],
};

export const AmataModalUsecase = () => {
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
        console.log('defaultValue', defaultValue);
        return <Input defaultValue={defaultValue} onChange={handleChange} />;
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
