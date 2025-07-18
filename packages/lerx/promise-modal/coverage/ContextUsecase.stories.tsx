import React, { useState } from 'react';

import { Button, Input } from 'antd';

import { ModalProvider, alert, confirm, prompt } from '../src';
import { Background } from './components/Background';
import { DefaultContentWithContext } from './components/DefaultContent';
import { DefaultFooterWithContext } from './components/DefaultFooter';
import { DefaultSubtitleWithContext } from './components/DefaultSubtitle';
import { DefaultTitleWithContext } from './components/DefaultTitle';
import { FallbackForegroundFrame } from './components/FallbackForegroundFrame';
import { ForegroundWithContext } from './components/Foreground';

export default {
  title: 'PromiseModal/UserDefinedContext',
  decorators: [
    (Story) => (
      <ModalProvider
        ForegroundComponent={ForegroundWithContext}
        BackgroundComponent={Background}
        TitleComponent={DefaultTitleWithContext}
        SubtitleComponent={DefaultSubtitleWithContext}
        ContentComponent={DefaultContentWithContext}
        FooterComponent={DefaultFooterWithContext}
        options={{
          duration: '250ms',
          backdrop: 'rgba(0, 0, 0, 0.35)',
          manualDestroy: true,
          closeOnBackdropClick: true,
        }}
        context={{
          backgroundColor: 'black',
          color: 'darkgray',
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
      background: {
        data: 'alert',
      },
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
      Input: ({ defaultValue, onChange, context }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        console.log('defaultValue', defaultValue);
        console.log('context', context);
        return <Input defaultValue={defaultValue} onChange={handleChange} />;
      },
      defaultValue: 'value',
      background: {
        data: 'prompt',
      },
    }).then((value) => {
      setValue(value);
    });
  };

  const handleAltForegroundConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
      background: {
        data: 'confirm',
      },
      footer: ({ onConfirm, onCancel }) => {
        const handleConfirm = async () => {
          const isConfirmed = await confirm({
            title: 'Hello, world!',
            content: 'This is a test confirm, with alt foreground.',
            closeOnBackdropClick: false,
            manualDestroy: false,
            ForegroundComponent: FallbackForegroundFrame,
          });
          if (isConfirmed) onConfirm();
          else onCancel();
        };

        return (
          <div>
            <button onClick={handleConfirm}>Check</button>
          </div>
        );
      },
    }).then((result) => {
      console.log(result);
    });
  };

  const [value2, setValue2] = useState('');

  const handleAltForegroundPrompt = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
      footer: ({ onConfirm, onCancel, context }) => {
        const handleConfirm = async () => {
          const innerValue = await prompt<string>({
            title: 'Hello, world!',
            content: 'This is a test confirm, with alt foreground.',
            closeOnBackdropClick: false,
            manualDestroy: false,
            ForegroundComponent: FallbackForegroundFrame,
            Input: ({ defaultValue, onChange }) => {
              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              };
              return (
                <Input defaultValue={defaultValue} onChange={handleChange} />
              );
            },
          });
          setValue2(innerValue);
          if (innerValue?.length) onConfirm();
          else onCancel();
        };

        return (
          <div>
            <Button onClick={handleConfirm}>
              Check,{JSON.stringify(context)}
            </Button>
          </div>
        );
      },
    }).then((result) => {
      console.log(result);
    });
  };

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
      <button onClick={handleAltForegroundConfirm}>
        Open Confirm with Alt Foreground
      </button>
      <button onClick={handleAltForegroundPrompt}>
        Open Prompt with Alt Foreground: {value2}
      </button>
    </div>
  );
};
