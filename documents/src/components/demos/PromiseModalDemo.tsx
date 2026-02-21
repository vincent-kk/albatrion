import React, { useState } from 'react';
import { ModalProvider, alert, confirm, prompt } from '@lerx/promise-modal';

function DemoButtons() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev.slice(-4), message]);
  };

  const handleAlert = async () => {
    await alert({
      title: 'Notification',
      content: 'This is an alert modal powered by @lerx/promise-modal.',
    });
    addLog('Alert closed');
  };

  const handleConfirm = async () => {
    const ok = await confirm({
      title: 'Confirm Action',
      content: 'Do you want to proceed with this action?',
      footer: { confirm: 'Yes', cancel: 'No' },
    });
    addLog(`Confirm result: ${ok ? 'Yes' : 'No'}`);
  };

  const handlePrompt = async () => {
    const name = await prompt<string>({
      title: 'Enter your name',
      defaultValue: '',
      Input: ({ value, onChange }) => (
        <input
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your name..."
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #d9d9d9',
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
      ),
      disabled: v => !v || v.trim().length < 2,
    });
    addLog(name ? `Prompt result: "${name}"` : 'Prompt cancelled');
  };

  return (
    <div style={{ border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 8, padding: 24, background: 'var(--ifm-background-surface-color)' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={handleAlert} style={btnStyle('#1677ff')}>
          Alert
        </button>
        <button onClick={handleConfirm} style={btnStyle('#52c41a')}>
          Confirm
        </button>
        <button onClick={handlePrompt} style={btnStyle('#722ed1')}>
          Prompt
        </button>
      </div>
      {log.length > 0 && (
        <pre style={{ marginTop: 16, padding: 12, borderRadius: 6, background: 'var(--ifm-color-emphasis-100)', fontSize: 13, overflow: 'auto' }}>
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '8px 24px',
  borderRadius: 6,
  border: 'none',
  background: bg,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
});

export default function PromiseModalDemo() {
  return (
    <ModalProvider>
      <DemoButtons />
    </ModalProvider>
  );
}
