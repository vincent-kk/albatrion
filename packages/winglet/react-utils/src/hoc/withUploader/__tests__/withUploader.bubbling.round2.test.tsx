import { type ReactNode } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { withUploader } from '../withUploader';

const Button = ({ onClick, children }: { onClick?: (event?: MouseEvent) => void; children?: ReactNode }) =>
  <button onClick={() => onClick?.()}>{children}</button>;
it('round-2 react-utils 2: bubbles one upload trigger like one ordinary click', () => {
  const Upload = withUploader(Button);
  const plain = vi.fn(); const upload = vi.fn(); const original = vi.fn();
  const view = render(<><div onClick={plain}><Button>plain</Button></div><div onClick={upload}><Upload onClick={original}>upload</Upload></div></>);
  fireEvent.click(view.getByText('plain')); fireEvent.click(view.getByText('upload'));
  expect(original).toHaveBeenCalledTimes(1);
  expect(upload.mock.calls.length).toBe(plain.mock.calls.length);
});
