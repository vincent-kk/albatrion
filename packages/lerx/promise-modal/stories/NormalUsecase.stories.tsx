import React, { useEffect, useState } from 'react';

import { ModalProvider, alert, confirm, prompt } from '../src';
import { Background } from './components/Background';
import { Foreground } from './components/Foreground';

export default {
  title: 'PromiseModal/NormalUsecase',
  decorators: [
    (Story: React.ComponentType) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
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
      setValue(value ?? '');
    });
  };

  const handleErrorPrompt = () => {
    prompt({
      title: 'Error Prompt',
      content: 'Error will be thrown from Input',
      Input: () => {
        throw new Error('Error from Prompt Input');
      },
    }).catch((error: unknown) => console.error('Modal render rejected', error));
  };

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
      <button onClick={handleErrorPrompt}>Error from Prompt Input</button>
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

export const PreferredFrameUsecase = () => {
  const handleAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert.',
      closeOnBackdropClick: false,
    }).then((result) => {
      console.log(result);
    });
  };

  const handleConfirm = () => {
    confirm({
      title: 'Hello, world!',
      content: 'This is a test confirm.',
      closeOnBackdropClick: false,
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
      closeOnBackdropClick: false,
    }).then((value) => {
      setValue(value ?? '');
    });
  };

  const handleErrorPrompt = () => {
    prompt({
      title: 'Error Prompt',
      content: 'Error will be thrown from Input',
      Input: () => {
        throw new Error('Error from Prompt Input');
      },
    }).catch((error: unknown) => console.error('Modal render rejected', error));
  };

  const handleAltForegroundAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert, with alt foreground.',
      closeOnBackdropClick: false,
      ForegroundComponent: Foreground,
      manualDestroy: true,
    }).then((result) => {
      console.log(result);
    });
  };

  const handleAltBackgroundAlert = () => {
    alert({
      title: 'Hello, world!',
      content: 'This is a test alert, with alt background.',
      BackgroundComponent: Background,
      background: { data: 'alternative background' },
      closeOnBackdropClick: false,
    }).then((result) => {
      console.log(result);
    });
  };

  return (
    <div>
      <button onClick={handleAlert}>Open Alert</button>
      <button onClick={handleConfirm}>Open Confirm</button>
      <button onClick={handlePrompt}>Open Prompt: {value}</button>
      <button onClick={handleErrorPrompt}>Error from Prompt Input</button>
      <button onClick={handleAltForegroundAlert}>
        Open Alert with Alt Foreground
      </button>
      <button onClick={handleAltBackgroundAlert}>
        Open Alert with Alt Background
      </button>
    </div>
  );
};
