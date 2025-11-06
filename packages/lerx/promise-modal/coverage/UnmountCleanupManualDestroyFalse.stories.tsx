import React, { useState } from 'react';

import { ModalProvider, useModal } from '../src';

export default {
  title: 'PromiseModal/UnmountCleanupManualDestroyFalse',
  decorators: [
    (Story) => (
      <ModalProvider
        options={{
          duration: '250ms',
          backdrop: 'rgba(0, 0, 0, 0.35)',
          manualDestroy: false,
          closeOnBackdropClick: false,
        }}
      >
        <Story />
      </ModalProvider>
    ),
  ],
};

/**
 * 컴포넌트 내부에서 useModal을 사용하여 모달을 띄우는 컴포넌트
 */
const ModalTriggerComponent = ({ label }: { label: string }) => {
  const { alert, confirm, prompt } = useModal();

  const handleAlert = () => {
    alert({
      title: `Alert from ${label}`,
      content: `This modal should close immediately when ${label} unmounts (manualDestroy: false)`,
      background: {
        data: `alert-${label}`,
      },
    }).then((result) => {
      console.log(`${label} Alert result:`, result);
    });
  };

  const handleConfirm = () => {
    confirm({
      title: `Confirm from ${label}`,
      content: `This modal should close immediately when ${label} unmounts (manualDestroy: false)`,
      background: {
        data: `confirm-${label}`,
      },
    }).then((result) => {
      console.log(`${label} Confirm result:`, result);
    });
  };

  const handlePrompt = () => {
    prompt({
      title: `Prompt from ${label}`,
      content: `This modal should close immediately when ${label} unmounts (manualDestroy: false)`,
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return (
          <input
            defaultValue={defaultValue}
            onChange={handleChange}
            placeholder="Enter something..."
          />
        );
      },
      defaultValue: '',
      background: {
        data: `prompt-${label}`,
      },
    }).then((value) => {
      console.log(`${label} Prompt result:`, value);
    });
  };

  const handleMultipleModals = () => {
    // 여러 모달을 동시에 열기
    alert({
      title: `Alert 1 from ${label}`,
      content: 'First modal',
      background: { data: `alert-1-${label}` },
    });

    setTimeout(() => {
      alert({
        title: `Alert 2 from ${label}`,
        content: 'Second modal',
        background: { data: `alert-2-${label}` },
      });
    }, 100);

    setTimeout(() => {
      confirm({
        title: `Confirm from ${label}`,
        content: 'Third modal',
        background: { data: `confirm-${label}` },
      });
    }, 200);
  };

  return (
    <div
      style={{
        padding: '20px',
        margin: '10px',
        border: '2px solid #333',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
      }}
    >
      <h3>{label}</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleAlert}>Open Alert</button>
        <button onClick={handleConfirm}>Open Confirm</button>
        <button onClick={handlePrompt}>Open Prompt</button>
        <button onClick={handleMultipleModals}>Open Multiple Modals</button>
      </div>
    </div>
  );
};

/**
 * 기본 Unmount Cleanup 테스트 (manualDestroy: false)
 * - 컴포넌트를 마운트/언마운트하면서 모달이 애니메이션 없이 즉시 닫히는지 확인
 */
export const BasicUnmountCleanup = () => {
  const [showComponent, setShowComponent] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Basic Unmount Cleanup Test (manualDestroy: false)</h2>
        <p>
          1. "Show Component" 버튼을 클릭하여 컴포넌트를 마운트합니다.
          <br />
          2. 컴포넌트에서 모달을 열어봅니다.
          <br />
          3. "Hide Component" 버튼을 클릭하면 컴포넌트가 unmount되면서{' '}
          <strong>
            모든 모달이 애니메이션 없이 즉시 닫혀야 합니다 (manualDestroy:
            false)
          </strong>
          .
        </p>
        <button
          onClick={() => setShowComponent(!showComponent)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: showComponent ? '#ff4444' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {showComponent ? 'Hide Component' : 'Show Component'}
        </button>
      </div>

      {showComponent && <ModalTriggerComponent label="Component A" />}
    </div>
  );
};

/**
 * 여러 컴포넌트에서 모달을 열고 각각 독립적으로 cleanup되는지 테스트
 * manualDestroy: false일 때 애니메이션 없이 즉시 정리되는지 확인
 */
export const MultipleComponentsCleanup = () => {
  const [showComponentA, setShowComponentA] = useState(false);
  const [showComponentB, setShowComponentB] = useState(false);
  const [showComponentC, setShowComponentC] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Multiple Components Cleanup Test (manualDestroy: false)</h2>
        <p>
          1. 각 컴포넌트를 개별적으로 마운트/언마운트할 수 있습니다.
          <br />
          2. 각 컴포넌트에서 모달을 열어봅니다.
          <br />
          3. 특정 컴포넌트를 unmount하면{' '}
          <strong>해당 컴포넌트가 연 모달만 애니메이션 없이 즉시 닫히고</strong>
          , 다른 컴포넌트의 모달은 유지되어야 합니다.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={() => setShowComponentA(!showComponentA)}
            style={{
              padding: '10px 20px',
              backgroundColor: showComponentA ? '#ff4444' : '#4444ff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showComponentA ? 'Hide' : 'Show'} Component A
          </button>
          <button
            onClick={() => setShowComponentB(!showComponentB)}
            style={{
              padding: '10px 20px',
              backgroundColor: showComponentB ? '#ff4444' : '#44aa44',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showComponentB ? 'Hide' : 'Show'} Component B
          </button>
          <button
            onClick={() => setShowComponentC(!showComponentC)}
            style={{
              padding: '10px 20px',
              backgroundColor: showComponentC ? '#ff4444' : '#aa44aa',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showComponentC ? 'Hide' : 'Show'} Component C
          </button>
        </div>
      </div>

      {showComponentA && <ModalTriggerComponent label="Component A" />}
      {showComponentB && <ModalTriggerComponent label="Component B" />}
      {showComponentC && <ModalTriggerComponent label="Component C" />}
    </div>
  );
};

/**
 * 자동 unmount 시나리오 테스트 (manualDestroy: false)
 * - 일정 시간 후 자동으로 컴포넌트가 unmount되면서 모달도 애니메이션 없이 즉시 닫히는 시나리오
 */
export const AutoUnmountCleanup = () => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showComponent, setShowComponent] = useState(false);

  const startAutoUnmount = () => {
    setShowComponent(true);
    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setShowComponent(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Auto Unmount Cleanup Test (manualDestroy: false)</h2>
        <p>
          1. "Start Auto Unmount Test" 버튼을 클릭합니다.
          <br />
          2. 컴포넌트가 나타나면 모달을 열어봅니다.
          <br />
          3. 5초 후 자동으로 컴포넌트가 unmount되면서{' '}
          <strong>모든 모달이 애니메이션 없이 즉시 닫혀야 합니다</strong>.
        </p>
        <button
          onClick={startAutoUnmount}
          disabled={countdown !== null}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: countdown !== null ? '#888' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: countdown !== null ? 'not-allowed' : 'pointer',
          }}
        >
          {countdown !== null
            ? `Unmounting in ${countdown}s...`
            : 'Start Auto Unmount Test'}
        </button>
      </div>

      {showComponent && (
        <ModalTriggerComponent label="Auto-unmount Component" />
      )}
    </div>
  );
};

/**
 * 애니메이션 없이 cleanup 테스트 (manualDestroy: false)
 * - 여러 모달을 연속으로 열고 unmount 시 애니메이션 없이 즉시 제거되는지 확인
 */
export const ImmediateCleanupStressTest = () => {
  const [showComponent, setShowComponent] = useState(false);

  const openManyModals = () => {
    // 컴포넌트가 없으면 먼저 마운트
    if (!showComponent) {
      setShowComponent(true);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Immediate Cleanup Stress Test (manualDestroy: false)</h2>
        <p>
          1. "Show Component and Open Many Modals" 버튼을 클릭합니다.
          <br />
          2. "Open Multiple Modals" 버튼을 눌러 여러 모달을 연속으로 엽니다.
          <br />
          3. 모달이 여러 개 열린 상태에서 "Hide Component" 버튼을 클릭합니다.
          <br />
          4.{' '}
          <strong>
            모든 모달이 애니메이션 없이 즉시 DOM에서 제거되는지 확인합니다
          </strong>
          .
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={openManyModals}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4444ff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Show Component and Open Many Modals
          </button>
          <button
            onClick={() => setShowComponent(false)}
            disabled={!showComponent}
            style={{
              padding: '10px 20px',
              backgroundColor: showComponent ? '#ff4444' : '#888',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: showComponent ? 'pointer' : 'not-allowed',
            }}
          >
            Hide Component
          </button>
        </div>
      </div>

      {showComponent && (
        <ModalTriggerComponent label="Immediate Cleanup Test Component" />
      )}
    </div>
  );
};

/**
 * 매우 빠른 마운트/언마운트 반복 테스트
 * manualDestroy: false일 때 메모리 누수 없이 정리되는지 확인
 */
export const RapidMountUnmountTest = () => {
  const [showComponent, setShowComponent] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const toggleRapidly = () => {
    setShowComponent((prev) => {
      const next = !prev;
      if (!next) {
        setCycleCount((c) => c + 1);
      }
      return next;
    });
  };

  const startRapidCycle = () => {
    setCycleCount(0);
    let count = 0;
    const maxCycles = 10;

    const interval = setInterval(() => {
      if (count >= maxCycles) {
        clearInterval(interval);
        setShowComponent(false);
        return;
      }

      setShowComponent((prev) => {
        const next = !prev;
        if (!next) {
          count++;
          setCycleCount(count);
        }
        return next;
      });
    }, 300);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Rapid Mount/Unmount Test (manualDestroy: false)</h2>
        <p>
          1. "Start Rapid Cycle" 버튼을 클릭하면 자동으로 컴포넌트가 10회
          마운트/언마운트됩니다.
          <br />
          2. 또는 "Toggle Manually" 버튼으로 수동으로 빠르게 토글할 수 있습니다.
          <br />
          3. 각 사이클에서 모달을 열어보고,{' '}
          <strong>메모리 누수 없이 정리되는지 확인합니다</strong>.
          <br />
          <em>
            Cycle Count: <strong>{cycleCount}</strong>
          </em>
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={startRapidCycle}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4444ff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Start Rapid Cycle (10x)
          </button>
          <button
            onClick={toggleRapidly}
            style={{
              padding: '10px 20px',
              backgroundColor: showComponent ? '#ff4444' : '#44aa44',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Toggle Manually
          </button>
        </div>
      </div>

      {showComponent && <ModalTriggerComponent label="Rapid Cycle Component" />}
    </div>
  );
};
