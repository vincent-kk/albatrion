import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ModalProvider,
  ModalProviderHandle,
  alert,
  confirm,
  prompt,
  useInitializeModal,
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
      modalHandle.current?.initialize(modalRoot.current);
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

export const ModalInitializeHookUsecase = () => {
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
        const { data } = useContext(Context);
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return (
          <label>
            {data}
            <input defaultValue={defaultValue} onChange={handleChange} />
          </label>
        );
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

  const CustomComponent = () => {
    const { portal } = useInitializeModal();
    return (
      <div>
        Custom Component
        <div id="modal-inner-root"> {portal}</div>
      </div>
    );
  };

  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  const modalRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRoot.current) {
      initialize(modalRoot.current);
    }
  }, [initialize]);

  return (
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
      <div id="modal-outer-root">
        <Context.Provider value={{ data: 'outer' }}>{portal}</Context.Provider>
      </div>
      <CustomComponent />
    </div>
  );
};

const Context = createContext<{
  data: string;
}>({
  data: 'default',
});
