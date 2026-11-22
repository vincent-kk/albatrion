import type { ReactNode } from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { withUploader } from '../withUploader';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('r3 react-utils: withUploader click containment (DETAIL: only the original click reaches ancestor handlers)', () => {
  const Button = ({
    onClick,
    children,
  }: {
    onClick?: (event?: MouseEvent) => void;
    children?: ReactNode;
  }) => (
    <button
      data-testid="upload"
      onClick={(event) => onClick?.(event.nativeEvent)}
    >
      {children}
    </button>
  );
  const UploadButton = withUploader(Button);

  const run = (container?: HTMLElement) => {
    const counts = { reactCapture: 0, reactBubble: 0, documentCapture: 0 };
    const onDocumentCapture = () => {
      counts.documentCapture += 1;
    };
    document.addEventListener('click', onDocumentCapture, true);
    const view = render(
      <div
        onClickCapture={() => {
          counts.reactCapture += 1;
        }}
        onClick={() => {
          counts.reactBubble += 1;
        }}
      >
        <UploadButton>Upload</UploadButton>
      </div>,
      container ? { container } : undefined,
    );
    const button = (container ?? document.body).querySelector(
      '[data-testid="upload"]',
    );
    if (!button) throw new Error('missing button');
    fireEvent.click(button);
    document.removeEventListener('click', onDocumentCapture, true);
    view.unmount();
    return counts;
  };

  it('an ancestor onClickCapture runs once per user click (light DOM)', () => {
    expect(run()).toEqual({
      reactCapture: 1,
      reactBubble: 1,
      documentCapture: 1,
    });
  });

  it('same inside a shadow root', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.appendChild(container);
    expect(run(container)).toEqual({
      reactCapture: 1,
      reactBubble: 1,
      documentCapture: 1,
    });
  });
});
